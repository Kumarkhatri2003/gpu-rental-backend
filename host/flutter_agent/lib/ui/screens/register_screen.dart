import 'package:flutter/material.dart';
import 'package:forui/forui.dart';
import '../../services/api_service.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _apiService = ApiService();
  final _emailController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _register() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final email = _emailController.text.trim();
    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (email.isEmpty || firstName.isEmpty || lastName.isEmpty || password.isEmpty || confirmPassword.isEmpty) {
      setState(() {
        _errorMessage = 'Please fill out all fields.';
        _isLoading = false;
      });
      return;
    }

    if (password != confirmPassword) {
      setState(() {
        _errorMessage = 'Passwords do not match.';
        _isLoading = false;
      });
      return;
    }

    // Role 'host' is automatically injected in the ApiService
    final result = await _apiService.register(email, firstName, lastName, password, confirmPassword);

    if (!mounted) return;

    if (result['success']) {
      // Registration successful! Show snackbar and go to login
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registration successful! Please login.'), backgroundColor: Colors.green),
      );
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    } else {
      setState(() {
        _errorMessage = result['error'] ?? 'Registration failed.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212), 
      body: Center(
        child: SingleChildScrollView(
          child: Container(
            width: 450,
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E1E), 
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFF333333)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'HOST REGISTRATION',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Color(0xFFFFE600),
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 32),
                if (_errorMessage != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 24),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      border: Border.all(color: Colors.red),
                    ),
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.red),
                      textAlign: TextAlign.center,
                    ),
                  ),
                FTextFormField.email(
                  control: FTextFieldManagedControl(controller: _emailController),
                  label: const Text('Email'),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: FTextFormField(
                        control: FTextFieldManagedControl(controller: _firstNameController),
                        label: const Text('First Name'),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: FTextFormField(
                        control: FTextFieldManagedControl(controller: _lastNameController),
                        label: const Text('Last Name'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                FTextFormField.password(
                  control: FTextFieldManagedControl(controller: _passwordController),
                  label: const Text('Password'),
                ),
                const SizedBox(height: 16),
                FTextFormField.password(
                  control: FTextFieldManagedControl(controller: _confirmPasswordController),
                  label: const Text('Confirm Password'),
                ),
                const SizedBox(height: 32),
                FButton(
                  onPress: _isLoading ? null : _register,
                  child: _isLoading ? const Text('REGISTERING...') : const Text('REGISTER'),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    );
                  },
                  child: const Text('Already have an account? Login here', style: TextStyle(color: Colors.grey)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
