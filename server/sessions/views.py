from rest_framework import generics, status, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta

from .models import Session, SessionMetric
from .serializers import (
    SessionSerializer, CreateSessionSerializer,
    SessionStatusUpdateSerializer, SessionHeartbeatSerializer,
    SessionMetricSerializer
)
from .permissions import IsSessionOwner, IsSessionRenter, IsSessionHost, IsHostWithSession
from .services.relay import RelayService
from .services.billing import BillingService


# RENTER VIEWS

class CreateSessionView(APIView):
    """Renter creates a new session"""
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = CreateSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        gpu_id = serializer.validated_data['gpu_id']
        duration_hours = serializer.validated_data['duration_hours']
        work_protection = serializer.validated_data.get('work_protection', False)
        
        from gpus.models import GPU
        from users.models import HostProfile
        
        # Get GPU
        gpu = get_object_or_404(GPU, id=gpu_id)
        
        # Check if GPU is available
        if not gpu.is_rentable:
            raise serializers.ValidationError("GPU is not available for rent")
        
        # Get host
        host = HostProfile.objects.get(id=gpu.host_id)
        
        # Check host is online
        if host.status != 'online':
            raise serializers.ValidationError("Host is offline")
        
        # Calculate total cost
        total_amount = duration_hours * float(gpu.price_per_hour)
        if work_protection:
            total_amount += duration_hours * 0.20  # $0.20/hour for work protection
        
        # Check renter's balance
        from wallets.models import Wallet
        wallet = Wallet.objects.select_for_update().get(user=request.user)
        
        if wallet.available_balance < total_amount:
            return Response({
                'status': 'error',
                'message': f'Insufficient balance. Available: {wallet.available_balance}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Allocate relay port
        try:
            port_info = RelayService.allocate_port(None)  # session_id not created yet
        except ValueError as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Create session
        session = Session.objects.create(
            gpu=gpu,
            host=host,
            renter=request.user,
            status='pending',
            relay_server_ip=RelayService.get_relay_host(),
            relay_server_port=port_info['port'],
            total_amount=total_amount,
            duration_hours=duration_hours,
            work_protection_enabled=work_protection,
            work_protection_fee=duration_hours * 0.20 if work_protection else 0
        )
        
        # Update port with session_id
        from .models import RelayPort
        port = RelayPort.objects.get(id=port_info['port_id'])
        port.leased_to_session_id = session.id
        port.save()
        
        # Generate SSH key
        session.relay_auth_key = RelayService.generate_ssh_key(session.id)
        session.save()
        
        # Hold funds
        try:
            BillingService.hold_funds(session)
        except ValueError as e:
            session.status = 'failed'
            session.error_message = str(e)
            session.save()
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'status': 'success',
            'message': 'Session created successfully',
            'data': SessionSerializer(session).data
        }, status=status.HTTP_201_CREATED)


class SessionListView(generics.ListAPIView):
    """List all sessions for the current user"""
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Session.objects.filter(renter=self.request.user)


class SessionDetailView(generics.RetrieveAPIView):
    """Get session details"""
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsSessionOwner]
    lookup_field = 'id'
    
    def get_queryset(self):
        return Session.objects.all()


class StopSessionView(APIView):
    """Renter stops a session"""
    permission_classes = [permissions.IsAuthenticated, IsSessionRenter]
    
    @transaction.atomic
    def post(self, request, session_id):
        session = get_object_or_404(Session, id=session_id)
        
        if session.status != 'active':
            return Response({
                'status': 'error',
                'message': 'Session is not active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate billing
        end_time = timezone.now()
        used_hours = (end_time - session.active_time).total_seconds() / 3600
        actual_cost = used_hours * float(session.gpu.price_per_hour)
        
        session.status = 'stopping'
        session.end_time = end_time
        session.actual_cost = actual_cost
        session.save()
        
        # Process payment
        billing_result = BillingService.process_rental_payment(session)
        
        session.status = 'completed'
        session.termination_reason = 'renter_stopped'
        session.save()
        
        # Mark GPU available
        from decimal import Decimal
        session.gpu.is_available = True
        session.gpu.current_session_id = None
        session.gpu.total_rental_hours += Decimal(str(used_hours))
        session.gpu.total_earnings += Decimal(str(actual_cost))
        session.gpu.total_sessions += 1
        session.gpu.save()
        
        # Release relay port
        if session.relay_port_obj:
            session.relay_port_obj.release()
        
        return Response({
            'status': 'success',
            'message': 'Session stopped successfully',
            'data': {
                'session': SessionSerializer(session).data,
                'billing': billing_result
            }
        })


class SessionStatusView(APIView):
    """Get session status"""
    permission_classes = [permissions.IsAuthenticated, IsSessionOwner]
    
    def get(self, request, session_id):
        session = get_object_or_404(Session, id=session_id)
        
        return Response({
            'status': 'success',
            'data': {
                'session_id': str(session.id),
                'status': session.status,
                'ssh_connection': session.ssh_connection_string,
                'progress': session.progress_percentage,
                'cost_so_far': session.get_cost_so_far(),
                'remaining_time': self.get_remaining_time(session)
            }
        })
    
    def get_remaining_time(self, session):
        if session.status != 'active' or not session.duration_hours:
            return None
        
        elapsed = (timezone.now() - session.active_time).total_seconds() / 3600
        remaining = session.duration_hours - elapsed
        if remaining < 0:
            return "00:00:00"
        hours = int(remaining)
        minutes = int((remaining - hours) * 60)
        seconds = int((remaining - hours - minutes/60) * 3600)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"


# HOST VIEWS

class HostPendingSessionsView(APIView):
    """Host polls for pending sessions"""
    permission_classes = [IsHostWithSession]
    
    def get(self, request):
        host = request.user.host_profile
        
        pending_sessions = Session.objects.filter(
            host=host,
            status='pending'
        ).order_by('created_at')
        
        if not pending_sessions:
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        session = pending_sessions.first()
        
        return Response({
            'session_id': str(session.id),
            'gpu_id': str(session.gpu.id),
            'gpu_name': session.gpu.gpu_name,
            'duration_hours': session.duration_hours,
            'work_protection': session.work_protection_enabled,
            'relay_server_ip': session.relay_server_ip,
            'relay_server_port': session.relay_server_port,
            'relay_auth_key': session.relay_auth_key,
        })


class HostSessionStatusUpdateView(APIView):
    """Host updates session status"""
    permission_classes = [IsHostWithSession]
    
    def patch(self, request, session_id):
        session = get_object_or_404(Session, id=session_id)
        
        # Check host owns this session
        if session.host.user_id != request.user.id:
            return Response({
                'status': 'error',
                'message': 'Not your session'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = SessionStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        status_value = serializer.validated_data['status']
        error_message = serializer.validated_data.get('error_message')
        
        if status_value == 'FAILED':
            session.status = 'failed'
            session.error_message = error_message or 'Host reported failure'
            session.termination_reason = 'failed'
            session.save()
            # Release funds properly via BillingService
            BillingService.release_hold(session)
            # Release port
            if session.relay_port_obj:
                session.relay_port_obj.release()
            
            # Send notification to renter
            from notifications.services import NotificationService
            NotificationService.notify_session_terminated(session, session.error_message)
            return Response({'status': 'updated'})
        
        # Map status values
        status_map = {
            'STARTING': 'starting',
            'CONTAINER_RUNNING': 'container_running',
            'TUNNEL_CONNECTING': 'tunnel_connecting',
            'ACTIVE': 'active',
        }
        
        session.status = status_map.get(status_value, session.status)
        
        if status_value == 'ACTIVE':
            session.active_time = timezone.now()
            session.relay_server_ip = session.relay_server_ip or RelayService.get_relay_host()
            session.ssh_connection_string = f"ssh renter@{session.relay_server_ip} -p {session.relay_server_port}"
            
            # Mark GPU as rented
            session.gpu.is_available = False
            session.gpu.current_session_id = session.id
            session.gpu.save()
            
            # Send notification to renter that session is live
            from notifications.services import NotificationService
            NotificationService.notify_session_started(session)
        
        session.save()
        
        return Response({'status': 'updated'})


class HostSessionHeartbeatView(APIView):
    """Host sends heartbeat for active session"""
    permission_classes = [IsHostWithSession]
    
    def post(self, request, session_id):
        session = get_object_or_404(Session, id=session_id)
        
        # Check host owns this session
        if session.host.user_id != request.user.id:
            return Response({
                'status': 'error',
                'message': 'Not your session'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if session.status != 'active':
            return Response({
                'status': 'error',
                'message': 'Session is not active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = SessionHeartbeatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Update session
        session.last_heartbeat = timezone.now()
        session.heartbeat_count += 1
        session.save()
        
        # Save metrics
        if serializer.validated_data:
            metric = SessionMetric.objects.create(
                session=session,
                gpu_temperature_c=serializer.validated_data.get('gpu_temperature_c'),
                gpu_utilization_pct=serializer.validated_data.get('gpu_utilization_pct'),
                memory_used_mib=serializer.validated_data.get('memory_used_mib'),
            )
        
        return Response({
            'status': 'success',
            'heartbeat_count': session.heartbeat_count
        })


class HostSessionCommandsView(APIView):
    """Host checks for commands"""
    permission_classes = [IsHostWithSession]
    
    def get(self, request, session_id):
        session = get_object_or_404(Session, id=session_id)
        
        # Check host owns this session
        if session.host.user_id != request.user.id:
            return Response({
                'status': 'error',
                'message': 'Not your session'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if session should stop
        if session.status == 'stopping':
            return Response({'command': 'STOP'})
        
        # Check if duration expired
        if session.status == 'active' and session.duration_hours:
            elapsed = (timezone.now() - session.active_time).total_seconds() / 3600
            if elapsed >= session.duration_hours:
                return Response({'command': 'STOP'})
        
        return Response({'command': 'NONE'})


# Host Dashboard & Management Views
from .host_views import (
    HostDashboardView,
    HostEarningsView,
    HostEarningsSummaryView,
    HostPenaltiesView,
    HostPenaltyAppealView,
    HostSettingsView,
    HostAutoAcceptToggleView,
    HostActivityView,
)