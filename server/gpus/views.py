# gpus/views.py
from rest_framework import generics, status, permissions, filters, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Sum

from .models import GPU
from .serializers import (
    GPUSerializer, GPUCreateSerializer, GPUUpdateSerializer,
    GPUAvailabilitySerializer, GPUPriceSerializer,
    GPUStatsSerializer, GPUMarketplaceStatsSerializer
)
from .permissions import IsHostWithGPU, IsGPUOwner
from .filters import GPUFilter, GPUSortFilter

# PUBLIC VIEWS (Renters)

class GPUListView(generics.ListAPIView):
    """List all GPUs with filters"""
    serializer_class = GPUSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [GPUFilter, GPUSortFilter, filters.SearchFilter]
    search_fields = ['gpu_name', 'location', 'host__user__email']
    
    def get_queryset(self):
        queryset = GPU.objects.select_related('host', 'host__user')
        
        available_only = self.request.query_params.get('available_only')
        if available_only is None or available_only.lower() == 'true':
            queryset = queryset.filter(is_available=True)
        
        return queryset


class GPUDetailView(generics.RetrieveAPIView):
    """Get GPU details"""
    serializer_class = GPUSerializer
    permission_classes = [permissions.AllowAny]
    queryset = GPU.objects.select_related('host', 'host__user')
    lookup_field = 'id'


class GPUAvailableListView(generics.ListAPIView):
    """List only available GPUs"""
    serializer_class = GPUSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [GPUFilter, GPUSortFilter]
    
    def get_queryset(self):
        return GPU.objects.select_related('host', 'host__user').filter(
            is_available=True,
            current_session_id__isnull=True,
            host__status='online'
        )


class GPUMarketplaceStatsView(APIView):
    """Get marketplace statistics"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        from users.models import HostProfile
        
        total_gpus = GPU.objects.count()
        available_gpus = GPU.objects.filter(
            is_available=True,
            current_session_id__isnull=True,
            host__status='online'
        ).count()
        
        total_hosts = HostProfile.objects.filter(status='online').count()
        
        avg_price = GPU.objects.filter(is_available=True).aggregate(
            avg=Avg('price_per_hour')
        )['avg'] or 0
        
        total_rental_hours = GPU.objects.aggregate(
            total=Sum('total_rental_hours')
        )['total'] or 0
        
        total_earnings = GPU.objects.aggregate(
            total=Sum('total_earnings')
        )['total'] or 0
        
        data = {
            'total_gpus': total_gpus,
            'available_gpus': available_gpus,
            'total_hosts': total_hosts,
            'avg_price': round(float(avg_price), 2),
            'total_rental_hours': round(float(total_rental_hours), 2),
            'total_earnings': round(float(total_earnings), 2),
        }
        
        return Response({
            'status': 'success',
            'data': data
        })


# HOST VIEWS (Authenticated Hosts Only)

class HostGPUListView(generics.ListAPIView):
    """List all GPUs for the current host"""
    serializer_class = GPUSerializer
    permission_classes = [IsHostWithGPU]
    
    def get_queryset(self):
        return GPU.objects.filter(host__user=self.request.user)


class GPUCreateView(generics.CreateAPIView):
    """Register a new GPU"""
    serializer_class = GPUCreateSerializer
    permission_classes = [IsHostWithGPU]
    
    @transaction.atomic
    def perform_create(self, serializer):
        host = self.request.user.host_profile
        serializer.save(host=host)


class GPUUpdateView(generics.UpdateAPIView):
    """Update GPU details"""
    serializer_class = GPUUpdateSerializer
    permission_classes = [IsHostWithGPU, IsGPUOwner]
    queryset = GPU.objects.all()
    lookup_field = 'id'


class GPUDeleteView(generics.DestroyAPIView):
    """Delete/remove a GPU"""
    permission_classes = [IsHostWithGPU, IsGPUOwner]
    queryset = GPU.objects.all()
    lookup_field = 'id'
    
    def perform_destroy(self, instance):
        if instance.current_session_id:
    
            raise serializers.ValidationError(
                "Cannot delete GPU while it's rented"
            )
        instance.delete()

class GPUAvailabilityToggleView(generics.UpdateAPIView):
    """Toggle GPU availability"""
    serializer_class = GPUAvailabilitySerializer
    permission_classes = [IsHostWithGPU, IsGPUOwner]
    queryset = GPU.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'status': 'success',
            'data': {
                'id': str(instance.id),
                'is_available': instance.is_available,
            }
        })


class GPUPriceUpdateView(generics.UpdateAPIView):
    """Update GPU price"""
    serializer_class = GPUPriceSerializer
    permission_classes = [IsHostWithGPU, IsGPUOwner]
    queryset = GPU.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'status': 'success',
            'data': {
                'id': str(instance.id),
                'price_per_hour': instance.price_per_hour,
            }
        })


class GPUStatsView(generics.RetrieveAPIView):
    """Get GPU statistics for host"""
    serializer_class = GPUStatsSerializer
    permission_classes = [IsHostWithGPU, IsGPUOwner]
    queryset = GPU.objects.all()
    lookup_field = 'id'


class HostGPUStatsView(APIView):
    """Get aggregated GPU stats for a host"""
    permission_classes = [IsHostWithGPU]
    
    def get(self, request):
        gpus = GPU.objects.filter(host__user=request.user)
        
        total_gpus = gpus.count()
        available_gpus = gpus.filter(is_available=True).count()
        rented_gpus = gpus.filter(is_available=False).count()
        
        total_hours = gpus.aggregate(total=Sum('total_rental_hours'))['total'] or 0
        total_earnings = gpus.aggregate(total=Sum('total_earnings'))['total'] or 0
        total_sessions = gpus.aggregate(total=Sum('total_sessions'))['total'] or 0
        
        return Response({
            'status': 'success',
            'data': {
                'total_gpus': total_gpus,
                'available_gpus': available_gpus,
                'rented_gpus': rented_gpus,
                'total_hours': round(float(total_hours), 2),
                'total_earnings': round(float(total_earnings), 2),
                'total_sessions': total_sessions,
            }
        })