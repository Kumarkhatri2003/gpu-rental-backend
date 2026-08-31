from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal
import uuid
from notifications.services import NotificationService
from .services.payment import PaymentService
import logging

logger = logging.getLogger(__name__)

from .models import Wallet, Transaction
from .serializers import (
    WalletSerializer, TransactionSerializer,
    DepositSerializer, WithdrawSerializer, TransactionFilterSerializer
)
from .permissions import IsWalletOwner, CanManageWallet


class WalletView(generics.RetrieveAPIView):
    """Get user wallet"""
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated, IsWalletOwner]
    
    def get_object(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return wallet




class SimulatePaymentOptionsView(APIView):
    """List available simulated payment methods and test card/voucher parameters"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        simulation_data = PaymentService.get_simulation_methods()
        return Response({
            'status': 'success',
            'data': simulation_data
        })


class DepositView(APIView):
    """Deposit funds into wallet via simulation engine or Stripe gateway"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = DepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data.get('amount', Decimal('1000.00'))
        currency = serializer.validated_data.get('currency', 'NPR')
        payment_method = serializer.validated_data.get('payment_method', 'simulated_card')
        card_number = serializer.validated_data.get('card_number', '')
        promo_code = serializer.validated_data.get('promo_code', '')
        simulate_failure = serializer.validated_data.get('simulate_failure', False)
        failure_reason = serializer.validated_data.get('failure_reason', '')
        
        try:
            result = PaymentService.create_deposit_intent(
                user=request.user,
                amount=amount,
                currency=currency,
                payment_method=payment_method,
                card_number=card_number,
                promo_code=promo_code,
                simulate_failure=simulate_failure,
                failure_reason=failure_reason,
            )
            
            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            
            if result.get('status') == 'failed':
                tx_data = None
                if result.get('transaction_id'):
                    try:
                        tx_obj = Transaction.objects.get(id=result['transaction_id'])
                        tx_data = TransactionSerializer(tx_obj).data
                    except Transaction.DoesNotExist:
                        pass

                return Response({
                    'status': 'error',
                    'message': result.get('reason', 'Payment declined during simulation'),
                    'data': result,
                    'wallet': WalletSerializer(wallet).data,
                    'transaction': tx_data,
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if result.get('mode') in ['direct_settled', 'simulated_settled']:
                try:
                    NotificationService.notify_wallet_credited(
                        user=request.user,
                        amount=float(result.get('amount', amount)),
                        description=f"Deposit via {payment_method}"
                    )
                except Exception as notif_err:
                    logger.warning(f"Notification sending error: {notif_err}")
            
            tx_data = None
            if result.get('transaction_id'):
                try:
                    tx_obj = Transaction.objects.get(id=result['transaction_id'])
                    tx_data = TransactionSerializer(tx_obj).data
                except Transaction.DoesNotExist:
                    pass

            return Response({
                'status': 'success',
                'message': 'Deposit completed successfully' if result.get('status') == 'success' else 'Deposit initiated',
                'data': result,
                'wallet': WalletSerializer(wallet).data,
                'transaction': tx_data,
            }, status=status.HTTP_201_CREATED if result.get('status') == 'success' else status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ConfirmPaymentView(APIView):
    """Confirm a completed payment intent and credit wallet"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        payment_intent_id = request.data.get('payment_intent_id')
        if not payment_intent_id:
            return Response({
                'status': 'error',
                'message': 'payment_intent_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            result = PaymentService.confirm_payment_intent(payment_intent_id)
            if result.get('status') == 'success':
                NotificationService.notify_wallet_credited(
                    user=request.user,
                    amount=result['amount'],
                    description="Stripe Deposit"
                )
            return Response({
                'status': 'success',
                'data': result
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class StripeWebhookView(APIView):
    """Receive and process Stripe Webhooks"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        
        try:
            result = PaymentService.handle_webhook_event(payload, sig_header)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class WithdrawView(APIView):
    """Withdraw funds from wallet"""
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = WithdrawSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        bank_account = serializer.validated_data['bank_account']
        bank_name = serializer.validated_data['bank_name']
        account_holder_name = serializer.validated_data['account_holder_name']
        
        wallet = request.user.wallet
        
        if wallet.available_balance < amount:
            return Response({
                'status': 'error',
                'message': f'Insufficient balance. Available: {wallet.available_balance}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create pending transaction
        transaction_obj = Transaction.create_withdrawal(
            user=request.user,
            amount=amount,
            reference_id=str(uuid.uuid4()),
            metadata={
                'bank_account': bank_account,
                'bank_name': bank_name,
                'account_holder_name': account_holder_name,
            }
        )
        
        try:
            # TODO: Process withdrawal through payment gateway
            # For now, simulate success
            
            # Deduct funds
            wallet.deduct_funds(amount)
            transaction_obj.complete()
            
            return Response({
                'status': 'success',
                'message': f'Withdrawal of {amount} {wallet.currency} successful',
                'data': {
                    'transaction': TransactionSerializer(transaction_obj).data,
                    'wallet': WalletSerializer(wallet).data,
                }
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            transaction_obj.fail(str(e))
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class TransactionListView(generics.ListAPIView):
    """List user transactions with filters"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        
        # Filter by type
        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(type=transaction_type)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset


class TransactionDetailView(generics.RetrieveAPIView):
    """Get transaction details"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsWalletOwner]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class WalletBalanceView(APIView):
    """Get wallet balance summary"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        
        return Response({
            'status': 'success',
            'data': {
                'balance': float(wallet.balance),
                'hold_amount': float(wallet.hold_amount),
                'available_balance': float(wallet.available_balance),
                'currency': wallet.currency,
            }
        })