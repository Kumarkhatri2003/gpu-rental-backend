# users/views.py
from rest_framework import generics, status, permissions, mixins
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
import logging

from .models import User, HostProfile, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    HostProfileSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ValidateApiKeySerializer,
)
from .permissions import IsHost, IsRenter, IsAdmin, IsHostOrAdmin
from .utils import create_password_reset_token, send_password_reset_email

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint.
    POST: Register a new user.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'status': 'success',
            'message': 'User registered successfully. Please proceed to login.',
            'data': {
                'user': UserSerializer(user).data,
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """
    User login endpoint.
    POST: Login and get JWT tokens.
    """
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        refresh = RefreshToken.for_user(user)
        
        host_profile = None
        if user.is_host and hasattr(user, 'host_profile'):
            host_profile = HostProfileSerializer(user.host_profile).data
        
        return Response({
            'status': 'success',
            'message': 'Login successful',
            'data': {
                'user': UserSerializer(user).data,
                'host_profile': host_profile,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }
        })


class LogoutView(generics.GenericAPIView):
    """
    User logout endpoint.
    POST: Blacklist refresh token.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'status': 'success',
                'message': 'Logged out successfully'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(generics.GenericAPIView):
    """
    Refresh access token endpoint.
    POST: Get new access token using refresh token.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({
                'status': 'error',
                'message': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'status': 'success',
                'data': {
                    'access_token': str(refresh.access_token),
                }
            })
        except Exception:
            return Response({
                'status': 'error',
                'message': 'Invalid refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)


class MeView(generics.RetrieveUpdateAPIView):
    """
    Get and update current user profile.
    GET: Get user profile.
    PATCH/PUT: Update user profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_serializer(instance).data
        
        if instance.is_host and hasattr(instance, 'host_profile'):
            data['host_profile'] = HostProfileSerializer(instance.host_profile).data
        
        return Response({
            'status': 'success',
            'data': data
        })
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        
        allowed_fields = ['first_name', 'last_name']
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'status': 'success',
            'data': serializer.data
        })


class ChangePasswordView(generics.GenericAPIView):
    """
    Change user password endpoint.
    POST: Change password with old password verification.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'status': 'error',
                'errors': {'old_password': 'Incorrect password'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'status': 'success',
            'message': 'Password changed successfully'
        })


class ForgotPasswordView(generics.GenericAPIView):
    """
    Request password reset endpoint.
    POST: Send password reset email.
    """
    serializer_class = ForgotPasswordSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            reset_token = create_password_reset_token(user)
            send_password_reset_email(user, reset_token.token)
        except User.DoesNotExist:
            pass
        
        return Response({
            'status': 'success',
            'message': 'Password reset instructions sent to your email'
        })


class ResetPasswordView(generics.GenericAPIView):
    """
    Reset password endpoint.
    POST: Reset password using token.
    """
    serializer_class = ResetPasswordSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            
            if not reset_token.is_valid():
                return Response({
                    'status': 'error',
                    'message': 'Invalid or expired token'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            reset_token.is_used = True
            reset_token.save()
            
            return Response({
                'status': 'success',
                'message': 'Password reset successfully'
            })
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)


class GenerateHostApiKeyView(generics.GenericAPIView):
    """
    Generate host API key endpoint.
    POST: Generate new API key for host agent.
    """
    permission_classes = [IsHostOrAdmin]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        
        if not user.is_host:
            return Response({
                'status': 'error',
                'message': 'User does not have host role'
            }, status=status.HTTP_403_FORBIDDEN)
        
        api_key = user.generate_host_api_key()
        
        return Response({
            'status': 'success',
            'data': {
                'api_key': api_key,
                'message': 'API key generated successfully. Store it securely.'
            }
        })


class ValidateHostApiKeyView(generics.GenericAPIView):
    """
    Validate host API key endpoint.
    POST: Validate API key for host agent.
    """
    serializer_class = ValidateApiKeySerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        api_key = serializer.validated_data['api_key']
        
        try:
            user = User.objects.get(host_api_key=api_key, is_active=True)
            
            if user.is_host and hasattr(user, 'host_profile'):
                user.host_profile.mark_online()
            
            return Response({
                'status': 'success',
                'data': {
                    'user_id': str(user.id),
                    'email': user.email,
                    'role': user.role,
                    'is_host': user.is_host,
                }
            })
        except User.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Invalid API key'
            }, status=status.HTTP_401_UNAUTHORIZED)




class HostProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update host profile.
    GET: Get host profile.
    PATCH/PUT: Update host profile.
    """
    serializer_class = HostProfileSerializer
    permission_classes = [IsHostOrAdmin]
    
    def get_object(self):
        return get_object_or_404(HostProfile, user=self.request.user)



class HostHeartbeatView(generics.GenericAPIView):
    """
    Host heartbeat endpoint.
    POST: Update host heartbeat and status.
    """
    permission_classes = [IsHostOrAdmin]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        
        if not user.is_host or not hasattr(user, 'host_profile'):
            return Response({
                'status': 'error',
                'message': 'User is not a host'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        host_profile = user.host_profile
        host_profile.update_heartbeat()
        
        if 'gpu_name' in request.data:
            host_profile.gpu_name = request.data['gpu_name']
        if 'vram_total' in request.data:
            host_profile.vram_total = request.data['vram_total']
        if 'driver_version' in request.data:
            host_profile.driver_version = request.data['driver_version']
        
        host_profile.save()
        
        return Response({
            'status': 'success',
            'data': {
                'host_id': str(host_profile.id),
                'status': host_profile.status,
                'last_heartbeat': host_profile.last_heartbeat,
                'uptime_percentage': host_profile.uptime_percentage,
            }
        })


class HostStatusView(generics.GenericAPIView):
    """
    Host status endpoint.
    GET: Get host status.
    POST: Update host online/offline status.
    """
    permission_classes = [IsHostOrAdmin]
    
    def get(self, request, *args, **kwargs):
        user = request.user
        
        if not user.is_host or not hasattr(user, 'host_profile'):
            return Response({
                'status': 'error',
                'message': 'User is not a host'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        host_profile = user.host_profile
        
        return Response({
            'status': 'success',
            'data': {
                'host_id': str(host_profile.id),
                'status': host_profile.status,
                'is_online': host_profile.is_online(),
                'uptime_percentage': host_profile.uptime_percentage,
                'last_heartbeat': host_profile.last_heartbeat,
                'total_sessions': host_profile.total_sessions,
            }
        })
    
    def post(self, request, *args, **kwargs):
        user = request.user
        status_value = request.data.get('status')
        
        if not user.is_host or not hasattr(user, 'host_profile'):
            return Response({
                'status': 'error',
                'message': 'User is not a host'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if status_value not in ['online', 'offline']:
            return Response({
                'status': 'error',
                'message': 'Invalid status. Must be "online" or "offline"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        host_profile = user.host_profile
        
        if status_value == 'online':
            host_profile.mark_online()
        else:
            host_profile.mark_offline()
        
        return Response({
            'status': 'success',
            'data': {
                'host_id': str(host_profile.id),
                'status': host_profile.status,
            }
        })


class AdminUserListView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """
    List all users (admin only).
    GET: Get list of all users.
    """
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class AdminUserDetailView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin
):
    """
    Get, update, delete user (admin only).
    GET: Get user details.
    PATCH: Update user.
    DELETE: Deactivate user (soft delete).
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'
    
    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
    
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    
    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)
    
    def perform_destroy(self, instance):
        """Soft delete user by deactivating"""
        instance.is_active = False
        instance.save()