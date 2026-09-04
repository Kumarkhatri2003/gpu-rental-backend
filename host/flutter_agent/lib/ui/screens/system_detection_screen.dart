import 'package:flutter/material.dart';
import 'package:forui/forui.dart';
import '../../services/gpu_service.dart';
import '../../services/api_service.dart';
import '../../models/gpu_info.dart';
import 'home_screen.dart';

class SystemDetectionScreen extends StatefulWidget {
  const SystemDetectionScreen({super.key});

  @override
  State<SystemDetectionScreen> createState() => _SystemDetectionScreenState();
}

class _SystemDetectionScreenState extends State<SystemDetectionScreen> {
  final GpuService _gpuService = GpuService();
  final ApiService _apiService = ApiService();
  
  bool _isDetecting = true;
  GpuInfo? _detectedInfo;
  String? _error;

  @override
  void initState() {
    super.initState();
    _detectSystem();
  }

  Future<void> _detectSystem() async {
    try {
      // Simulate a small delay for better UX
      await Future.delayed(const Duration(seconds: 2));
      
      final info = await _gpuService.detectGpu();
      
      if (info != null) {
        if (mounted) {
          setState(() {
            _detectedInfo = info;
            _isDetecting = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _error = "Failed to detect GPU system information.";
            _isDetecting = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = "An error occurred during system detection.";
          _isDetecting = false;
        });
      }
    }
  }

  Future<void> _submitProfile() async {
    if (_detectedInfo == null) return;
    
    setState(() => _isDetecting = true);
    
    int vramGb = 4;
    try {
      final vramStr = _detectedInfo!.vramTotal.replaceAll(RegExp(r'[^0-9]'), '');
      if (vramStr.isNotEmpty) {
        vramGb = (int.parse(vramStr) / 1024).round();
      }
    } catch (_) {}

    final success = await _apiService.updateHostProfile({
      'gpu_name': _detectedInfo!.name,
      'vram_total': _detectedInfo!.vramTotal,
      'vram_gb': vramGb,
      'driver_version': _detectedInfo!.driverVersion,
      'cuda_version': _detectedInfo!.cudaVersion,
      'os_version': _detectedInfo!.osVersion,
      'internet_type': 'home', // 'wifi' and 'ethernet' are not valid enums according to swagger
    });

    if (mounted) {
      if (success) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      } else {
        setState(() {
          _error = "Failed to save profile to the backend.";
          _isDetecting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: Center(
        child: FCard(
          title: const Text('System Detection'),
          subtitle: const Text('First-time setup for your host machine.'),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: SizedBox(
              width: 400,
              child: _buildContent(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_isDetecting) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: const [
          CircularProgressIndicator(color: Color(0xFFFFE600)),
          SizedBox(height: 24),
          Text('Detecting System Architecture...', style: TextStyle(color: Colors.white70)),
        ],
      );
    }

    if (_error != null) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, color: Colors.red, size: 48),
          const SizedBox(height: 16),
          Text(_error!, style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
          const SizedBox(height: 24),
          FButton(
            onPress: () {
              setState(() {
                _error = null;
                _isDetecting = true;
              });
              _detectSystem();
            },
            style: FButtonStyle.outline(),
            child: const Text('Retry'),
          ),
        ],
      );
    }

    if (_detectedInfo != null) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_circle, color: Colors.green),
                SizedBox(width: 8),
                Text('System Detected ✓', style: TextStyle(color: Colors.green, fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('GPU', style: TextStyle(color: Color(0xFFFFE600), fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          _buildInfoRow('Model', _detectedInfo!.name),
          _buildInfoRow('VRAM', _detectedInfo!.vramTotal),
          _buildInfoRow('Driver', _detectedInfo!.driverVersion),
          _buildInfoRow('CUDA', _detectedInfo!.cudaVersion),
          _buildInfoRow('Temperature', _detectedInfo!.temperature),
          const SizedBox(height: 16),
          const Text('System', style: TextStyle(color: Color(0xFFFFE600), fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          _buildInfoRow('OS', _detectedInfo!.osVersion),
          const SizedBox(height: 16),
          const Text('Network', style: TextStyle(color: Color(0xFFFFE600), fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          _buildInfoRow('Internet', _detectedInfo!.internetType.toUpperCase()),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: FButton(
              onPress: _submitProfile,
              style: FButtonStyle.primary(),
              child: const Text('Save Host Profile', style: TextStyle(color: Colors.black)),
            ),
          ),
        ],
      );
    }
    
    return const SizedBox.shrink();
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label, style: const TextStyle(color: Colors.grey)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
