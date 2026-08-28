# sessions/services/relay.py
from django.db import transaction
from django.utils import timezone
from ..models import RelayPort
import secrets


class RelayService:
    """Manage SSH relay ports"""
    
    PORT_START = 40000
    PORT_END = 50000
    
    @classmethod
    @transaction.atomic
    def allocate_port(cls, session_id):
        """Allocate a free relay port for a session"""
        
        # Find free port with row-level locking
        port = RelayPort.objects.select_for_update().filter(
            status='free',
            port__gte=cls.PORT_START,
            port__lte=cls.PORT_END
        ).order_by('port').first()
        
        if not port:
            raise ValueError("No free relay ports available")
        
        # Lease the port
        port.lease(session_id)
        
        return {
            'port': port.port,
            'port_id': port.id
        }
    
    @classmethod
    def release_port(cls, port_id):
        """Release a leased port"""
        try:
            port = RelayPort.objects.get(id=port_id)
            port.release()
            return True
        except RelayPort.DoesNotExist:
            return False
    
    @classmethod
    def get_free_port_count(cls):
        """Get number of free ports"""
        return RelayPort.objects.filter(status='free').count()
    
    @classmethod
    def generate_ssh_key(cls, session_id):
        """Generate temporary SSH key for host agent"""
        # In production, use actual SSH key generation
        private_key = f"""
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA{secrets.token_urlsafe(64)}...
-----END RSA PRIVATE KEY-----
"""
        return private_key