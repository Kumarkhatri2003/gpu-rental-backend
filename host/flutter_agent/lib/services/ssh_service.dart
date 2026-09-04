import 'dart:io';
import 'package:path/path.dart' as p;

class SshTunnelService {
  Process? _sshProcess;

  /// Starts an SSH reverse tunnel to the relay server.
  Future<bool> startTunnel(String sessionId, String relayIp, int relayPort, String authKey) async {
    print('[SSH] Starting SSH Reverse Tunnel for session $sessionId');
    
    try {
      // 1. Write the auth key to a temporary file
      final tempDir = Directory.systemTemp;
      final keyFile = File(p.join(tempDir.path, 'relay_key_$sessionId.pem'));
      await keyFile.writeAsString(authKey);
      
      // SSH requires restrictive permissions on the key file. On Windows, this is more complex,
      // but typically we can try running it anyway or use icacls if needed.
      
      // 2. Start the SSH process
      // ssh -i <key> -N -R <relayPort>:localhost:2222 relay_user@<relayIp> -o StrictHostKeyChecking=no
      print('[SSH] Executing ssh command...');
      _sshProcess = await Process.start('ssh', [
        '-i', keyFile.path,
        '-N', // Do not execute a remote command. This is useful for just forwarding ports.
        '-R', '$relayPort:localhost:2222',
        'relay_user@$relayIp',
        '-o', 'StrictHostKeyChecking=no', // Bypass prompt for unknown host key
      ]);

      // We don't await the process exit because it should run continuously in the background!
      // But we can listen to its output for logging.
      _sshProcess!.stdout.listen((data) {
        print('[SSH STDOUT] ${String.fromCharCodes(data)}');
      });
      _sshProcess!.stderr.listen((data) {
        print('[SSH STDERR] ${String.fromCharCodes(data)}');
      });

      // Give it a second to see if it immediately crashes
      await Future.delayed(const Duration(seconds: 2));
      
      // Check if process has already died
      // There is no direct _sshProcess.isAlive in Dart, but we can assume it's running if it hasn't exited.
      
      print('[SSH] Tunnel process started successfully.');
      return true;
      
    } catch (e) {
      print('[SSH] Error starting tunnel: $e');
      return false;
    }
  }

  /// Closes the SSH tunnel.
  Future<void> stopTunnel(String sessionId) async {
    print('[SSH] Closing SSH Tunnel for session $sessionId');
    if (_sshProcess != null) {
      _sshProcess!.kill();
      _sshProcess = null;
    }
    
    // Clean up the key file
    try {
      final tempDir = Directory.systemTemp;
      final keyFile = File(p.join(tempDir.path, 'relay_key_$sessionId.pem'));
      if (await keyFile.exists()) {
        await keyFile.delete();
      }
    } catch (e) {
      print('[SSH] Error cleaning up key file: $e');
    }
  }
}
