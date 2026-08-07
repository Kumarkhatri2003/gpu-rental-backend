import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/gpu_info.dart';
import '../services/api_service.dart';
import 'session_controller.dart';

class HostController extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final SessionController sessionController = SessionController();
  
  bool isRegistered = false;
  Timer? _pollingTimer;

  /// Registers the host with the backend and starts polling for jobs
  Future<void> initializeHost(GpuInfo gpu) async {
    isRegistered = await _apiService.registerHost(gpu.name, gpu.vramTotal);
    notifyListeners();

    if (isRegistered) {
      _startPolling();
    }
  }

  void _startPolling() {
    _pollingTimer = Timer.periodic(const Duration(seconds: 10), (timer) async {
      // In production, this checks the backend. 
      final pendingSessionId = await _apiService.pollForPendingSession();
      if (pendingSessionId != null && sessionController.currentSession == null) {
        // We got a job! Start it.
        sessionController.startSession(pendingSessionId);
      }
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }
}
