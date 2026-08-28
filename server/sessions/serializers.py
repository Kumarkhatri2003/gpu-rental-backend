from rest_framework import serializers
from .models import Session, SessionMetric, RelayPort


class SessionSerializer(serializers.ModelSerializer):
    gpu_name = serializers.CharField(source='gpu.gpu_name', read_only=True)
    host_name = serializers.CharField(source='host.user.email', read_only=True)
    renter_name = serializers.CharField(source='renter.email', read_only=True)
    duration_hours = serializers.FloatField(read_only=True)
    cost_so_far = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Session
        fields = (
            'id', 'gpu', 'gpu_name', 'host', 'host_name',
            'renter', 'renter_name',
            'status', 'relay_server_ip', 'relay_server_port',
            'ssh_connection_string',
            'start_time', 'active_time', 'end_time', 'duration_hours',
            'total_amount', 'actual_cost', 'refund_amount',
            'compensation_amount', 'platform_fee',
            'work_protection_enabled', 'progress_percentage', 'work_lost',
            'termination_reason', 'error_message',
            'last_heartbeat', 'heartbeat_count',
            'created_at', 'updated_at', 'cost_so_far'
        )
        read_only_fields = (
            'id', 'status', 'relay_server_ip', 'relay_server_port',
            'ssh_connection_string', 'start_time', 'active_time',
            'end_time', 'duration_hours', 'total_amount',
            'actual_cost', 'refund_amount', 'compensation_amount',
            'platform_fee', 'work_protection_enabled',
            'progress_percentage', 'work_lost', 'termination_reason',
            'error_message', 'last_heartbeat', 'heartbeat_count',
            'created_at', 'updated_at', 'cost_so_far'
        )


class CreateSessionSerializer(serializers.Serializer):
    gpu_id = serializers.UUIDField(required=True)
    duration_hours = serializers.IntegerField(required=True, min_value=1, max_value=24)
    work_protection = serializers.BooleanField(default=False)


class SessionStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['STARTING', 'CONTAINER_RUNNING', 'TUNNEL_CONNECTING', 'ACTIVE', 'FAILED']
    )
    error_message = serializers.CharField(required=False, allow_blank=True)


class SessionHeartbeatSerializer(serializers.Serializer):
    gpu_temperature_c = serializers.FloatField(required=False)
    gpu_utilization_pct = serializers.FloatField(required=False)
    memory_used_mib = serializers.FloatField(required=False)


class SessionMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionMetric
        fields = '__all__'
        read_only_fields = ('id', 'session', 'timestamp')


class RelayPortSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelayPort
        fields = '__all__'