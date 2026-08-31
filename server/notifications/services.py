import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Notification service for dispatching wallet, session, and system alerts"""

    @staticmethod
    def notify_wallet_credited(user, amount: float, description: str = ""):
        """Send notification when funds are credited to wallet"""
        logger.info(f"Notification -> Wallet Credited: user={getattr(user, 'email', user)}, amount={amount}, description='{description}'")

    @staticmethod
    def notify_wallet_debited(user, amount: float, description: str = ""):
        """Send notification when funds are debited from wallet"""
        logger.info(f"Notification -> Wallet Debited: user={getattr(user, 'email', user)}, amount={amount}, description='{description}'")

    @staticmethod
    def notify_payment_failed(user, amount: float, reason: str = ""):
        """Send notification when payment fails"""
        logger.info(f"Notification -> Payment Failed: user={getattr(user, 'email', user)}, amount={amount}, reason='{reason}'")
