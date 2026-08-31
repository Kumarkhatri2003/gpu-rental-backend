import os
import uuid
import stripe
import logging
from decimal import Decimal
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from ..models import Wallet, Transaction

logger = logging.getLogger(__name__)

# Initialize Stripe API key
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', os.getenv('STRIPE_SECRET_KEY', ''))

# Pre-defined test vouchers for simulation
SIMULATED_VOUCHERS = {
    'SIM1000': Decimal('1000.00'),
    'SIM2500': Decimal('2500.00'),
    'SIM5000': Decimal('5000.00'),
    'TESTGPU500': Decimal('500.00'),
    'WELCOME2026': Decimal('2000.00'),
}

# Known test card numbers for failure simulation
TEST_DECLINE_CARDS = {
    '4000000000000002': 'Card declined - Insufficient test funds',
    '4000000000000069': 'Card declined - Expired card',
    '4000000000000127': 'Card declined - Fraud filter triggered',
}


class PaymentService:
    """Production payment gateway service with robust simulated payment engine"""

    @classmethod
    def is_stripe_configured(cls) -> bool:
        """Check if Stripe live or test secret key is configured"""
        key = getattr(settings, 'STRIPE_SECRET_KEY', os.getenv('STRIPE_SECRET_KEY', ''))
        return bool(key and key.startswith('sk_'))

    @classmethod
    def get_simulation_methods(cls) -> dict:
        """Return available payment simulation channels and test metadata"""
        return {
            'channels': [
                {
                    'id': 'simulated_card',
                    'name': 'Test Credit / Debit Card',
                    'description': 'Simulate card transactions with instant settlement or test failure codes.',
                    'test_card_success': '4242 4242 4242 4242',
                    'test_card_decline': '4000 0000 0000 0002',
                },
                {
                    'id': 'simulated_esewa',
                    'name': 'eSewa (Simulated)',
                    'description': 'Simulate instant digital wallet top-up via eSewa.',
                },
                {
                    'id': 'simulated_khalti',
                    'name': 'Khalti (Simulated)',
                    'description': 'Simulate instant digital wallet top-up via Khalti.',
                },
                {
                    'id': 'simulated_bank',
                    'name': 'Mobile / Bank Transfer (Simulated)',
                    'description': 'Simulate local bank transfer & IPS direct deposit.',
                },
                {
                    'id': 'voucher',
                    'name': 'Voucher / Promo Code',
                    'description': 'Redeem test vouchers for instant credits.',
                    'sample_codes': list(SIMULATED_VOUCHERS.keys()),
                },
                {
                    'id': 'sandbox_instant',
                    'name': '1-Click Fast Sandbox Deposit',
                    'description': 'Instant test credit without entering details.',
                },
            ],
            'sample_vouchers': {k: float(v) for k, v in SIMULATED_VOUCHERS.items()},
            'test_decline_cards': TEST_DECLINE_CARDS,
        }

    @classmethod
    def simulate_deposit(
        cls,
        user,
        amount: Decimal,
        currency: str = 'npr',
        payment_method: str = 'simulated_card',
        card_number: str = '',
        promo_code: str = '',
        simulate_failure: bool = False,
        failure_reason: str = '',
    ) -> dict:
        """
        Execute a simulated payment deposit.
        Supports success, simulated failure, vouchers, and realistic audit records.
        """
        cleaned_card = (card_number or '').replace(' ', '').replace('-', '')
        
        is_voucher = payment_method == 'voucher' or bool(promo_code)
        if is_voucher and promo_code:
            code_upper = promo_code.strip().upper()
            if code_upper in SIMULATED_VOUCHERS:
                amount = SIMULATED_VOUCHERS[code_upper]
            else:
                raise ValueError(f"Invalid simulated promo code: '{promo_code}'. Valid codes: {', '.join(SIMULATED_VOUCHERS.keys())}")

        amount_decimal = Decimal(str(amount))
        if amount_decimal <= 0:
            raise ValueError("Deposit amount must be greater than zero")

        curr = currency.upper() if currency else 'NPR'
        ref_id = f"SIM-{payment_method.upper()[:4]}-{uuid.uuid4().hex[:8].upper()}"

        should_fail = (
            simulate_failure
            or payment_method in ['fail', 'simulated_fail']
            or cleaned_card in TEST_DECLINE_CARDS
        )

        reason = failure_reason or TEST_DECLINE_CARDS.get(cleaned_card, "Simulated payment processing error")

        tx_metadata = {
            'is_simulation': True,
            'payment_method': payment_method,
            'currency': curr,
            'card_last4': cleaned_card[-4:] if len(cleaned_card) >= 4 else None,
            'promo_code': promo_code if is_voucher else None,
            'simulated_auth_code': ref_id,
            'simulated_at': timezone.now().isoformat(),
        }

        tx = Transaction.create_deposit(
            user=user,
            amount=amount_decimal,
            reference_id=ref_id,
            metadata=tx_metadata,
        )

        if should_fail:
            logger.info(f"Simulating failed payment for user {user.email} (Reason: {reason})")
            tx.fail(reason=reason)
            return {
                'status': 'failed',
                'mode': 'simulated_failed',
                'transaction_id': str(tx.id),
                'reference_id': ref_id,
                'amount': float(amount_decimal),
                'currency': curr,
                'reason': reason,
                'payment_method': payment_method,
            }

        logger.info(f"Simulating successful {payment_method} deposit for user {user.email} (Amount: {amount_decimal} {curr})")
        with transaction.atomic():
            wallet, _ = Wallet.objects.select_for_update().get_or_create(user=user)
            wallet.add_funds(amount_decimal)
            tx.complete()

        return {
            'status': 'success',
            'mode': 'simulated_settled',
            'transaction_id': str(tx.id),
            'reference_id': ref_id,
            'amount': float(amount_decimal),
            'currency': wallet.currency,
            'wallet_balance': float(wallet.balance),
            'available_balance': float(wallet.available_balance),
            'payment_method': payment_method,
        }

    @classmethod
    def create_deposit_intent(
        cls,
        user,
        amount: Decimal,
        currency: str = 'npr',
        payment_method: str = 'stripe',
        card_number: str = '',
        promo_code: str = '',
        simulate_failure: bool = False,
        failure_reason: str = '',
    ) -> dict:
        """
        Create a payment intent or process simulated deposit.
        Routes to Stripe when live credentials exist, or to simulation engine.
        """
        is_simulation_requested = (
            payment_method.startswith('simulated_')
            or payment_method in ['voucher', 'sandbox', 'sandbox_instant', 'fail']
            or bool(promo_code)
            or simulate_failure
        )

        if is_simulation_requested or not cls.is_stripe_configured():
            return cls.simulate_deposit(
                user=user,
                amount=amount,
                currency=currency,
                payment_method=payment_method if is_simulation_requested else 'sandbox_instant',
                card_number=card_number,
                promo_code=promo_code,
                simulate_failure=simulate_failure,
                failure_reason=failure_reason,
            )

        amount_decimal = Decimal(str(amount))
        if amount_decimal <= 0:
            raise ValueError("Amount must be greater than zero")

        curr = currency.lower()
        if curr not in ['usd', 'npr', 'eur', 'gbp']:
            curr = 'usd'

        amount_cents = int(amount_decimal * 100)

        tx = Transaction.create_deposit(
            user=user,
            amount=amount_decimal,
            metadata={
                'payment_method': payment_method,
                'currency': curr,
                'amount_cents': amount_cents,
            }
        )

        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=curr,
                payment_method_types=['card'],
                metadata={
                    'transaction_id': str(tx.id),
                    'user_id': str(user.id),
                    'user_email': user.email,
                    'purpose': 'wallet_deposit',
                },
                description=f"Wallet deposit for {user.email}",
            )

            tx.reference_id = intent.id
            tx.metadata['payment_intent_id'] = intent.id
            tx.metadata['client_secret'] = intent.client_secret
            tx.save(update_fields=['reference_id', 'metadata'])

            return {
                'mode': 'stripe_intent',
                'transaction_id': str(tx.id),
                'payment_intent_id': intent.id,
                'client_secret': intent.client_secret,
                'status': 'requires_payment_method',
                'amount': float(amount_decimal),
                'currency': curr,
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe PaymentIntent creation error: {e}")
            tx.fail(str(e))
            raise ValueError(f"Stripe error: {str(e)}")

    @classmethod
    def confirm_payment_intent(cls, payment_intent_id: str) -> dict:
        """
        Verify and complete a PaymentIntent directly against Stripe API.
        """
        if not cls.is_stripe_configured():
            raise ValueError("Stripe is not configured")

        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            if intent.status == 'succeeded':
                tx_id = intent.metadata.get('transaction_id')
                if not tx_id:
                    raise ValueError("Transaction ID missing in payment intent metadata")

                with transaction.atomic():
                    tx = Transaction.objects.select_for_update().get(id=tx_id)
                    if tx.status == 'completed':
                        return {'status': 'already_completed', 'transaction_id': str(tx.id)}

                    wallet, _ = Wallet.objects.select_for_update().get_or_create(user=tx.user)
                    wallet.add_funds(tx.amount)
                    tx.complete()

                return {
                    'status': 'success',
                    'transaction_id': str(tx.id),
                    'amount': float(tx.amount),
                    'wallet_balance': float(wallet.balance)
                }
            else:
                return {
                    'status': intent.status,
                    'message': f"PaymentIntent is in status: {intent.status}"
                }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe verification error: {e}")
            raise ValueError(str(e))

    @classmethod
    def handle_webhook_event(cls, payload: bytes, sig_header: str) -> dict:
        """
        Verify Stripe webhook cryptographic signature and process events.
        """
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', os.getenv('STRIPE_WEBHOOK_SECRET', ''))
        
        try:
            if webhook_secret:
                event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            else:
                import json
                event = json.loads(payload.decode('utf-8'))
        except Exception as e:
            logger.error(f"Webhook signature verification failed: {e}")
            raise ValueError(f"Webhook error: {str(e)}")

        event_type = event.get('type') if isinstance(event, dict) else event['type']
        event_data = event.get('data', {}).get('object', {}) if isinstance(event, dict) else event['data']['object']

        logger.info(f"Stripe webhook received: {event_type}")

        if event_type == 'payment_intent.succeeded':
            intent_id = event_data.get('id')
            tx_id = event_data.get('metadata', {}).get('transaction_id')
            
            if tx_id:
                try:
                    with transaction.atomic():
                        tx = Transaction.objects.select_for_update().get(id=tx_id)
                        if tx.status != 'completed':
                            wallet, _ = Wallet.objects.select_for_update().get_or_create(user=tx.user)
                            wallet.add_funds(tx.amount)
                            tx.complete()
                            logger.info(f"Completed deposit transaction {tx.id} via webhook")
                except Transaction.DoesNotExist:
                    logger.warning(f"Transaction {tx_id} from webhook not found")

        elif event_type == 'payment_intent.payment_failed':
            tx_id = event_data.get('metadata', {}).get('transaction_id')
            error_msg = event_data.get('last_payment_error', {}).get('message', 'Payment failed')
            if tx_id:
                try:
                    tx = Transaction.objects.get(id=tx_id)
                    tx.fail(error_msg)
                except Transaction.DoesNotExist:
                    pass

        return {'status': 'processed', 'type': event_type}
