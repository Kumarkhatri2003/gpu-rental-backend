from django.urls import path
from . import views

app_name = 'sessions'

urlpatterns = [
    # Renter endpoints
    path('', views.SessionListView.as_view(), name='session-list'),
    path('create/', views.CreateSessionView.as_view(), name='session-create'),
    path('<uuid:session_id>/', views.SessionDetailView.as_view(), name='session-detail'),
    path('<uuid:session_id>/status/', views.SessionStatusView.as_view(), name='session-status'),  
    path('<uuid:session_id>/stop/', views.StopSessionView.as_view(), name='session-stop'),
    
    # Host endpoints
    path('host/pending/', views.HostPendingSessionsView.as_view(), name='host-pending'),
    path('<uuid:session_id>/status-update/', views.HostSessionStatusUpdateView.as_view(), name='session-status-update'),
    path('<uuid:session_id>/heartbeat/', views.HostSessionHeartbeatView.as_view(), name='session-heartbeat'),
    path('<uuid:session_id>/commands/', views.HostSessionCommandsView.as_view(), name='session-commands'),
]