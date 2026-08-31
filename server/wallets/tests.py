from django.test import TestCase
from django.contrib.auth import get_user_model
from wallets.models import Wallet
from users.serializers import UserSerializer

User = get_user_model()

class WalletAutoCreationTest(TestCase):
    def test_wallet_created_on_user_registration(self):
        """Test that a wallet is automatically created when a new user registers"""
        user = User.objects.create_user(
            email="new_renter@example.com",
            password="testpassword123",
            role="renter"
        )
        self.assertTrue(hasattr(user, 'wallet'))
        self.assertEqual(user.wallet.balance, 0.00)
        
    def test_wallet_created_on_existing_user_update(self):
        """Test that if an existing user somehow loses their wallet or didn't have one, it gets created on save/update"""
        user = User.objects.create_user(
            email="existing_user@example.com",
            password="testpassword123",
            role="renter"
        )
        
        # Manually delete wallet to simulate missing wallet
        user.wallet.delete()
        user.refresh_from_db()
        self.assertFalse(hasattr(user, 'wallet'))
        
        # Save user to trigger update signals
        user.save()
        
        # Wallet should be created again
        user.refresh_from_db()
        self.assertTrue(hasattr(user, 'wallet'))

    def test_serializer_returns_correct_wallet_balance(self):
        """Test that UserSerializer returns the actual wallet balance dynamically"""
        user = User.objects.create_user(
            email="wallet_balance_test@example.com",
            password="testpassword123",
            role="renter"
        )
        
        # Update balance
        user.wallet.balance = 150.50
        user.wallet.save()
        
        serializer = UserSerializer(user)
        self.assertEqual(serializer.data['wallet_balance'], 150.50)


from rest_framework.test import APIClient
from decimal import Decimal
from wallets.services.payment import PaymentService
from wallets.models import Transaction


class PaymentSimulationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="simulator_renter@example.com",
            password="testpassword123",
            role="renter"
        )
        self.client.force_authenticate(user=self.user)

    def test_get_simulation_methods(self):
        """Test retrieving simulation options"""
        response = self.client.get('/api/wallets/simulation-methods/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('channels', response.data['data'])
        self.assertIn('sample_vouchers', response.data['data'])

    def test_simulated_card_deposit_success(self):
        """Test successful simulated card deposit adds balance and records completed transaction"""
        response = self.client.post('/api/wallets/deposit/', {
            'amount': 1500.00,
            'payment_method': 'simulated_card',
            'card_number': '4242424242424242'
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'success')
        
        self.user.wallet.refresh_from_db()
        self.assertEqual(self.user.wallet.balance, Decimal('1500.00'))

        # Check transaction record
        tx = Transaction.objects.filter(user=self.user, type='deposit').latest('created_at')
        self.assertEqual(tx.status, 'completed')
        self.assertEqual(tx.amount, Decimal('1500.00'))
        self.assertTrue(tx.metadata.get('is_simulation'))

    def test_simulated_esewa_deposit(self):
        """Test simulated eSewa deposit credits wallet balance"""
        response = self.client.post('/api/wallets/deposit/', {
            'amount': 2500.00,
            'payment_method': 'simulated_esewa'
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.user.wallet.refresh_from_db()
        self.assertEqual(self.user.wallet.balance, Decimal('2500.00'))

    def test_simulated_voucher_redemption(self):
        """Test redeeming simulated voucher promo code"""
        response = self.client.post('/api/wallets/deposit/', {
            'payment_method': 'voucher',
            'promo_code': 'SIM1000'
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.user.wallet.refresh_from_db()
        self.assertEqual(self.user.wallet.balance, Decimal('1000.00'))

    def test_simulated_card_decline_failure(self):
        """Test that simulated decline card fails without adding funds"""
        response = self.client.post('/api/wallets/deposit/', {
            'amount': 1000.00,
            'payment_method': 'simulated_card',
            'card_number': '4000000000000002'  # Known decline card
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['status'], 'error')
        
        # Verify wallet balance was NOT modified
        self.user.wallet.refresh_from_db()
        self.assertEqual(self.user.wallet.balance, Decimal('0.00'))

        # Verify failed transaction was logged
        tx = Transaction.objects.filter(user=self.user, type='deposit').latest('created_at')
        self.assertEqual(tx.status, 'failed')
        self.assertIn('Insufficient test funds', tx.description)

