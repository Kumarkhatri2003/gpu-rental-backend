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


class DepositView(APIView):
    """Deposit funds into wallet"""
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = DepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        payment_method = serializer.validated_data.get('payment_method', 'stripe')
        payment_token = serializer.validated_data.get('payment_token', '')
        
        # Create pending transaction
        transaction_obj = Transaction.create_deposit(
            user=request.user,
            amount=amount,
            reference_id=str(uuid.uuid4()),
            metadata={
                'payment_method': payment_method,
                'payment_token': payment_token,
            }
        )
        
        # TODO: Integrate with payment gateway (Stripe/Razorpay/ESewa)
        # For now, simulate successful payment
        try:
            # Process payment
            if payment_method == 'stripe':
                # stripe.PaymentIntent.create(...)
                pass
            elif payment_method == 'razorpay':
                # razorpay.Order.create(...)
                pass
            
            # On successful payment
            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            wallet.add_funds(amount)
            
            transaction_obj.complete()
            
            return Response({
                'status': 'success',
                'message': f'Deposit of {amount} {wallet.currency} successful',
                'data': {
                    'transaction': TransactionSerializer(transaction_obj).data,
                    'wallet': WalletSerializer(wallet).data,
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            transaction_obj.fail(str(e))
            return Response({
                'status': 'error',
                'message': f'Payment failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


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
        
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
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