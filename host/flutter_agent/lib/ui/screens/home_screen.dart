import 'package:flutter/material.dart';
import '../../models/gpu_info.dart';
import '../../models/session.dart';
import '../../services/gpu_service.dart';
import '../../services/docker_service.dart';
import '../../controllers/session_controller.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GpuService _gpuService = GpuService();
  final SessionController _sessionController = SessionController();
  
  GpuInfo? _gpuInfo;
  bool _isLoading = true;
  bool _isDockerAvailable = false;

  @override
  void initState() {
    super.initState();
    _loadSystemInfo();
    
    // Listen to session state changes to rebuild UI
    _sessionController.addListener(() {
      if (mounted) {
        setState(() {});
      }
    });
  }

  Future<void> _loadSystemInfo() async {
    final info = await _gpuService.detectGpu();
    
    // We instantiate a temporary DockerService just to check availability on startup
    final dockerService = DockerService();
    final isDockerOk = await dockerService.checkDockerAvailable();
    
    setState(() {
      _gpuInfo = info;
      _isDockerAvailable = isDockerOk;
      _isLoading = false;
    });
  }

  Future<void> _toggleSession() async {
    final testSessionId = 'abc1234'; 
    
    if (_sessionController.status == SessionStatus.active || _sessionController.status == SessionStatus.containerRunning) {
      await _sessionController.stopSession();
    } else {
      await _sessionController.startSession(testSessionId);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Host Agent Dashboard')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _gpuInfo == null
                ? const Center(
                    child: Text(
                      'Failed to detect GPU. Is nvidia-smi available?',
                      style: TextStyle(color: Colors.red),
                    ),
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'System Status: Online',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green),
                      ),
                      const SizedBox(height: 20),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('GPU Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              const Divider(),
                              Text('Model: ${_gpuInfo!.name}'),
                              Text('VRAM: ${_gpuInfo!.vramTotal}'),
                              Text('Temperature: ${_gpuInfo!.temperature}'),
                              Text('Driver Version: ${_gpuInfo!.driverVersion}'),
                              Text('CUDA Version: ${_gpuInfo!.cudaVersion}'),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Card(
                        color: _isDockerAvailable ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                        child: ListTile(
                          leading: Icon(
                            _isDockerAvailable ? Icons.check_circle : Icons.error,
                            color: _isDockerAvailable ? Colors.green : Colors.red,
                          ),
                          title: const Text('Docker Status'),
                          subtitle: Text(_isDockerAvailable ? 'Available and Running' : 'Not Found or Stopped'),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Card(
                        child: ListTile(
                          leading: Icon(Icons.computer),
                          title: Text('Session State: ${_sessionController.status.name.toUpperCase()}'),
                          subtitle: Text('Container ID: ${_sessionController.currentSession?.id ?? "None"}'),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          ElevatedButton.icon(
                            onPressed: () {
                              setState(() => _isLoading = true);
                              _loadSystemInfo();
                            },
                            icon: const Icon(Icons.refresh),
                            label: const Text('Refresh Hardware Info'),
                          ),
                          const SizedBox(width: 16),
                          if (_isDockerAvailable)
                            Builder(
                              builder: (context) {
                                final status = _sessionController.status;
                                final isWorking = status == SessionStatus.starting || 
                                                  status == SessionStatus.tunnelConnecting || 
                                                  status == SessionStatus.stopping;
                                final isRunning = status == SessionStatus.active || 
                                                  status == SessionStatus.containerRunning;

                                return ElevatedButton.icon(
                                  onPressed: isWorking ? null : _toggleSession,
                                  icon: isWorking 
                                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                      : Icon(isRunning ? Icons.stop : Icons.play_arrow),
                                  label: Text(
                                    isWorking ? 'Processing...' : (isRunning ? 'Stop Session' : 'Start Session')
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isRunning ? Colors.red : Colors.blue,
                                    foregroundColor: Colors.white,
                                  ),
                                );
                              }
                            ),
                        ],
                      )
                    ],
                  ),
      ),
    );
  }
}
