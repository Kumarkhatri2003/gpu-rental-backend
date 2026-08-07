import 'package:flutter/foundation.dart';
import '../models/session.dart';
import '../services/docker_service.dart';
import '../services/ssh_service.dart';

class SessionController extends ChangeNotifier {
  final DockerService _dockerService = DockerService();
  final SshTunnelService _sshService = SshTunnelService();
  Session? currentSession;

  SessionStatus get status => currentSession?.status ?? SessionStatus.idle;

  Future<void> startSession(String sessionId) async {
    currentSession = Session(id: sessionId, status: SessionStatus.starting);
    notifyListeners();

    // 1. Start Docker Container
    final success = await _dockerService.createAndStartTestSession(sessionId);
    if (!success) {
      if (currentSession != null) {
        currentSession!.status = SessionStatus.failed;
        notifyListeners();
      }
      return;
    }

    if (currentSession != null) {
      currentSession!.status = SessionStatus.containerRunning;
      notifyListeners();

      // 2. Start SSH Tunnel
      currentSession!.status = SessionStatus.tunnelConnecting;
      notifyListeners();
      
      final tunnelSuccess = await _sshService.startTunnel(sessionId);
      if (!tunnelSuccess) {
        // If tunnel fails, we should technically tear down the container, but we'll keep it simple for now
        currentSession!.status = SessionStatus.failed;
        notifyListeners();
        return;
      }

      if (currentSession != null) {
        currentSession!.status = SessionStatus.active;
        notifyListeners();
      }
    }
  }

  Future<void> stopSession() async {
    if (currentSession == null) return;

    currentSession!.status = SessionStatus.stopping;
    notifyListeners();

    // 1. Stop SSH Tunnel
    await _sshService.stopTunnel(currentSession!.id);

    // 2. Stop and Remove Container
    await _dockerService.stopContainer(currentSession!.id);
    await _dockerService.removeContainer(currentSession!.id);

    currentSession!.status = SessionStatus.terminated;
    currentSession = null;
    notifyListeners();
  }
}
