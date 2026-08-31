# notifications/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """List all notifications for current user"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        unread_count = queryset.filter(is_read=False).count()
        
        return Response({
            'status': 'success',
            'unread_count': unread_count,
            'count': queryset.count(),
            'data': serializer.data
        })


class NotificationUnreadCountView(APIView):
    """Get unread notification count"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        return Response({
            'status': 'success',
            'unread_count': count
        })


class NotificationMarkReadView(APIView):
    """Mark a notification as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, notification_id):
        notification = get_object_or_404(
            Notification,
            id=notification_id,
            user=request.user
        )
        notification.mark_as_read()
        
        return Response({
            'status': 'success',
            'message': 'Notification marked as read'
        })


class NotificationMarkAllReadView(APIView):
    """Mark all notifications as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        notifications = Notification.objects.filter(
            user=request.user,
            is_read=False
        )
        count = notifications.count()
        notifications.update(is_read=True, read_at=timezone.now())
        
        return Response({
            'status': 'success',
            'message': f'{count} notifications marked as read'
        })


class NotificationDeleteView(APIView):
    """Delete a notification"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, notification_id):
        notification = get_object_or_404(
            Notification,
            id=notification_id,
            user=request.user
        )
        notification.delete()
        
        return Response({
            'status': 'success',
            'message': 'Notification deleted'
        })


class NotificationDeleteAllView(APIView):
    """Delete all notifications for user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        count = Notification.objects.filter(
            user=request.user
        ).count()
        Notification.objects.filter(user=request.user).delete()
        
        return Response({
            'status': 'success',
            'message': f'{count} notifications deleted'
        })