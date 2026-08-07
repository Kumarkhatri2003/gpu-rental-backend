class SshTunnelService {
  /// Simulates establishing a reverse SSH tunnel.
  /// In production: Process.start('ssh', ['-R', '...'])
  Future<bool> startTunnel(String sessionId) async {
    print('[SSH] Simulating SSH Reverse Tunnel for session $sessionId');
    await Future.delayed(const Duration(seconds: 2));
    print('[SSH] Tunnel established successfully.');
    return true;
  }

  /// Simulates closing the SSH tunnel.
  Future<void> stopTunnel(String sessionId) async {
    print('[SSH] Closing SSH Tunnel for session $sessionId');
    await Future.delayed(const Duration(milliseconds: 500));
  }
}
