import 'package:flutter/material.dart';
import 'package:forui/forui.dart';
import '../../models/gpu_info.dart';
import '../../models/session.dart';
import '../../services/gpu_service.dart';
import '../../services/docker_service.dart';
import '../../controllers/session_controller.dart';
import '../../services/api_service.dart';
import 'login_screen.dart';
import 'host_profile_screen.dart';
import 'financial_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GpuService _gpuService = GpuService();
  final SessionController _sessionController = SessionController();
  final ApiService _apiService = ApiService();
  
  GpuInfo? _gpuInfo;
  bool _isLoading = true;
  bool _hasError = false;
  bool _isDockerAvailable = false;
  Map<String, dynamic>? _dashboardData;

  @override
  void initState() {
    super.initState();
    _loadSystemInfo();
    
    _sessionController.addListener(() {
      if (mounted) {
        setState(() {});
      }
    });
    
    _sessionController.startPolling();
  }

  @override
  void dispose() {
    _sessionController.stopPolling();
    super.dispose();
  }

  Future<void> _loadSystemInfo() async {
    setState(() => _isLoading = true);
    
    // 1. Fetch Local Hardware/Docker Info
    final info = await _gpuService.detectGpu();
    final dockerService = DockerService();
    final isDockerOk = await dockerService.checkDockerAvailable();
    
    // 2. Fetch Backend Dashboard Data
    final dashboardResponse = await _apiService.getHostDashboard();
    Map<String, dynamic>? dashboardData;
    bool hasError = false;
    
    if (dashboardResponse != null && dashboardResponse['data'] != null) {
      dashboardData = dashboardResponse['data'];
    } else {
      hasError = true;
    }

    if (mounted) {
      setState(() {
        _gpuInfo = info;
        _isDockerAvailable = isDockerOk;
        _dashboardData = dashboardData;
        _hasError = hasError;
        _isLoading = false;
        
        if (dashboardData != null && dashboardData['status'] != null) {
          _isHostOnline = dashboardData['status'].toString().toLowerCase() == 'online';
        }
      });
    }
  }

  bool _isHostOnline = false;
  bool _isTogglingStatus = false;

  Future<void> _toggleHostStatus(bool newValue) async {
    setState(() => _isTogglingStatus = true);
    
    final newStatus = newValue ? 'online' : 'offline';
    final success = await _apiService.updateHostSettings({
      'status': newStatus,
      'auto_accept': newValue,
    });

    if (mounted) {
      if (success) {
        setState(() => _isHostOnline = newValue);
        // Refresh the dashboard to update the KPI card
        _loadSystemInfo(); 
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update host status. Please try again.')),
        );
      }
      setState(() => _isTogglingStatus = false);
    }
  }

  Future<void> _toggleSession() async {
    final testSessionId = 'abc1234'; 
    
    if (_sessionController.status == SessionStatus.active || _sessionController.status == SessionStatus.containerRunning) {
      await _sessionController.stopSession();
    } else {
      await _sessionController.startSession(testSessionId);
    }
  }

  Future<void> _logout() async {
    _sessionController.stopPolling();
    await _apiService.logout();
    if (mounted) {
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: Row(
        children: [
          // Left Sidebar (Navigation)
          Container(
            width: 250,
            color: const Color(0xFF1A1A1A),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  color: const Color(0xFFFFE600),
                  width: double.infinity,
                  child: const Text(
                    'HOST AGENT',
                    style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 20),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('Dashboards', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ),
                ListTile(
                  leading: const Icon(Icons.dashboard, color: Color(0xFFFFE600)),
                  title: const Text('Host Summary', style: TextStyle(color: Color(0xFFFFE600))),
                  selected: true,
                  onTap: () {},
                ),
                ListTile(
                  leading: const Icon(Icons.person, color: Colors.grey),
                  title: const Text('Host Profile', style: TextStyle(color: Colors.grey)),
                  onTap: () {
                    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const HostProfileScreen()));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.account_balance_wallet, color: Colors.grey),
                  title: const Text('Financial Information', style: TextStyle(color: Colors.grey)),
                  onTap: () {
                    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const FinancialScreen()));
                  },
                ),
                const Spacer(),
                ListTile(
                  leading: const Icon(Icons.logout, color: Colors.grey),
                  title: const Text('Logout', style: TextStyle(color: Colors.grey)),
                  onTap: _logout,
                ),
              ],
            ),
          ),
          
          // Main Content Area
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top App Bar Area
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  decoration: const BoxDecoration(
                    border: Border(bottom: BorderSide(color: Color(0xFF333333))),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _dashboardData?['host_name'] != null 
                            ? 'Welcome, ${_dashboardData!['host_name']}'
                            : 'Host Dashboard',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (_isTogglingStatus)
                            const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFFFE600)),
                            )
                          else
                            FSwitch(
                              value: _isHostOnline,
                              onChange: _toggleHostStatus,
                            ),
                          const SizedBox(width: 8),
                          Text(_isHostOnline ? 'ONLINE' : 'OFFLINE', style: TextStyle(color: _isHostOnline ? Colors.green : Colors.grey, fontWeight: FontWeight.bold)),
                          const SizedBox(width: 24),
                          FButton(
                            onPress: _loadSystemInfo,
                            style: FButtonStyle.primary(),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.refresh, size: 16, color: Colors.black),
                                SizedBox(width: 8),
                                Text('Refresh', style: TextStyle(color: Colors.black)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                // Dashboard Content
                Expanded(
                  child: _isLoading 
                      ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFE600)))
                      : _hasError
                          ? Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.error_outline, color: Colors.red, size: 48),
                                  const SizedBox(height: 16),
                                  const Text('Failed to load dashboard data.', style: TextStyle(color: Colors.white, fontSize: 16)),
                                  const SizedBox(height: 16),
                                  FButton(
                                    onPress: _loadSystemInfo,
                                    style: FButtonStyle.outline(),
                                    child: const Text('Retry'),
                                  ),
                                ],
                              ),
                            )
                          : SingleChildScrollView(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Dynamic KPI Cards from Backend Data
                              if (_dashboardData != null) ...[
                                Wrap(
                                  spacing: 16,
                                  runSpacing: 16,
                                  children: [
                                    if (_dashboardData!['earnings'] != null)
                                      _buildKpiCard('Total Earnings', '\$${_dashboardData!['earnings']['total']}'),
                                    if (_dashboardData!['stats'] != null) ...[
                                      _buildKpiCard('Active Sessions', '${_dashboardData!['stats']['active_sessions']}'),
                                      _buildKpiCard('Total GPUs', '${_dashboardData!['stats']['total_gpus']}'),
                                      _buildKpiCard('Reliability Score', '${_dashboardData!['stats']['reliability_score']}%'),
                                      _buildKpiCard('Penalty Points', '${_dashboardData!['stats']['penalty_points']}'),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 24),
                              ],

                              // Local Hardware & Orchestration Cards
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(child: _buildGpuCard()),
                                  const SizedBox(width: 24),
                                  Expanded(child: _buildSessionCard()),
                                ],
                              ),
                            ],
                          ),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatKeyToTitle(String key) {
    return key.replaceAll('_', ' ').split(' ').map((str) => str.isEmpty ? '' : str[0].toUpperCase() + str.substring(1)).join(' ');
  }

  Widget _buildKpiCard(String title, String value) {
    return Container(
      width: 250,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFFFE600),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.black87, fontSize: 14)),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(color: Colors.black, fontSize: 32, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildGpuCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        border: Border.all(color: const Color(0xFF333333)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('LOCAL HARDWARE', style: TextStyle(color: Colors.grey, fontSize: 12, letterSpacing: 1.5)),
          const SizedBox(height: 16),
          if (_gpuInfo == null)
            const Text('Failed to detect GPU. Is nvidia-smi available?', style: TextStyle(color: Colors.red))
          else ...[
            _buildInfoRow('Model', _gpuInfo!.name),
            _buildInfoRow('VRAM', _gpuInfo!.vramTotal),
            _buildInfoRow('Temperature', _gpuInfo!.temperature),
            _buildInfoRow('Driver', _gpuInfo!.driverVersion),
            _buildInfoRow('CUDA', _gpuInfo!.cudaVersion),
          ]
        ],
      ),
    );
  }

  Widget _buildSessionCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        border: Border.all(color: const Color(0xFF333333)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('ORCHESTRATION', style: TextStyle(color: Colors.grey, fontSize: 12, letterSpacing: 1.5)),
          const SizedBox(height: 16),
          _buildInfoRow('Docker Daemon', _isDockerAvailable ? 'Online' : 'Offline', 
                        valueColor: _isDockerAvailable ? Colors.green : Colors.red),
          _buildInfoRow('Session State', _sessionController.status.name.toUpperCase()),
          _buildInfoRow('Container ID', _sessionController.currentSession?.id ?? "None"),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {Color valueColor = Colors.white}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: const TextStyle(color: Colors.grey)),
          ),
          Expanded(
            child: Text(
              value, 
              style: TextStyle(color: valueColor, fontWeight: FontWeight.bold),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}
