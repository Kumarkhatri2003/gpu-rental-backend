import 'package:flutter/material.dart';
import 'package:forui/forui.dart';
import '../../services/api_service.dart';

class HostProfileScreen extends StatefulWidget {
  const HostProfileScreen({super.key});

  @override
  State<HostProfileScreen> createState() => _HostProfileScreenState();
}

class _HostProfileScreenState extends State<HostProfileScreen> {
  final ApiService _apiService = ApiService();
  
  bool _isLoading = true;
  Map<String, dynamic>? _meData;
  Map<String, dynamic>? _profileData;

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    setState(() => _isLoading = true);
    
    final meData = await _apiService.getUserProfile();
    Map<String, dynamic>? profileData;
    if (meData != null) {
      profileData = await _apiService.getHostProfile();
    }
    
    if (mounted) {
      setState(() {
        _meData = meData;
        _profileData = profileData;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text('Host Profile', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF1A1A1A),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFE600)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Center(
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 800),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Personal Information
                      FCard(
                        title: const Text('Personal Information'),
                        subtitle: const Text('Your account details.'),
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildInfoRow('Name', _profileData?['user']?['full_name'] ?? _profileData?['user']?['first_name'] ?? _meData?['full_name'] ?? 'Unknown'),
                              _buildInfoRow('Email', _profileData?['user']?['email'] ?? _meData?['email'] ?? 'Unknown'),
                              _buildInfoRow('Role', _profileData?['user']?['role'] ?? _meData?['role'] ?? 'host'),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // System Information
                      FCard(
                        title: const Text('System Information'),
                        subtitle: const Text('Hardware and network specifications detected for this host.'),
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildInfoRow('GPU Model', _profileData?['gpu_name'] ?? 'Unavailable'),
                              _buildInfoRow('VRAM', _profileData?['vram_total'] ?? 'Unavailable'),
                              _buildInfoRow('Driver Version', _profileData?['driver_version'] ?? 'Unavailable'),
                              _buildInfoRow('CUDA Version', _profileData?['cuda_version'] ?? 'Unavailable'),
                              _buildInfoRow('OS Version', _profileData?['os_version'] ?? 'Unavailable'),
                              _buildInfoRow('Internet Type', _profileData?['internet_type']?.toString().toUpperCase() ?? 'Unavailable'),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Host Status
                      FCard(
                        title: const Text('Host Status'),
                        subtitle: const Text('Current operational status from the backend.'),
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildInfoRow('Status', _profileData?['status']?.toString().toUpperCase() ?? 'UNKNOWN'),
                              _buildInfoRow('Last Heartbeat', _formatDate(_profileData?['last_heartbeat'])),
                              _buildInfoRow('Offline Since', _formatDate(_profileData?['offline_since'])),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  String _formatDate(dynamic dateString) {
    if (dateString == null) return 'N/A';
    try {
      final date = DateTime.parse(dateString.toString());
      return '${date.toLocal()}'.split('.')[0];
    } catch (_) {
      return dateString.toString();
    }
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 150,
            child: Text(label, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
