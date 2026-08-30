from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal
import uuid

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


from .services.payment import PaymentService
from notifications.services import NotificationService


class DepositView(APIView):
    """Deposit funds into wallet via Stripe or direct provider"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = DepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        payment_method = serializer.validated_data.get('payment_method', 'stripe')
        
        try:
            result = PaymentService.create_deposit_intent(
                user=request.user,
                amount=amount,
                payment_method=payment_method
            )
            
            if result.get('mode') == 'direct_settled':
                NotificationService.notify_wallet_credited(
                    user=request.user,
                    amount=float(amount),
                    description=f"Deposit via {payment_method}"
                )
            
            return Response({
                'status': 'success',
                'message': 'Deposit initiated' if result.get('mode') == 'stripe_intent' else 'Deposit completed',
                'data': result
            }, status=status.HTTP_201_CREATED if result.get('mode') == 'direct_settled' else status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ConfirmPaymentView(APIView):
    """Confirm a completed Stripe payment intent and credit wallet"""
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
        
        wallet, _ = Wallet.objects.select_for_update().get_or_create(user=request.user)
        
        if wallet.available_balance < amount:
            return Response({
                'status': 'error',
                'message': f'Insufficient balance. Available: {wallet.available_balance}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Deduct funds atomically
        wallet.deduct_funds(amount)
        
        # Create and complete withdrawal transaction
        transaction_obj = Transaction.create_withdrawal(
            user=request.user,
            amount=amount,
            reference_id=str(uuid.uuid4()),
            metadata={
                'bank_account': bank_account,
                'bank_name': bank_name,
                'account_holder_name': account_holder_name,
                'payout_method': 'bank_transfer',
            }
        )
        transaction_obj.complete()
        
        NotificationService.notify_wallet_debited(
            user=request.user,
            amount=float(amount),
            description=f"Withdrawal to {bank_name} ({bank_account[-4:] if len(bank_account) >= 4 else bank_account})"
        )
        
        return Response({
            'status': 'success',
            'message': f'Withdrawal of {amount} {wallet.currency} completed successfully',
            'data': {
                'transaction': TransactionSerializer(transaction_obj).data,
                'wallet': WalletSerializer(wallet).data,
            }
        }, status=status.HTTP_201_CREATED)


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