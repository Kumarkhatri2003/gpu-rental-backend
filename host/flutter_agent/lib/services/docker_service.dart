import 'dart:io';

class DockerService {
  /// Checks if Docker is installed and running by fetching its version.
  Future<bool> checkDockerAvailable() async {
    try {
      final result = await Process.run('docker', ['--version']);
      return result.exitCode == 0;
    } catch (e) {
      print('Docker is not available: $e');
      return false;
    }
  }

  /// Starts the GPU session container for testing.
  /// Note: The production version will use a dynamic SSH tunnel.
  Future<bool> createAndStartTestSession(String sessionId) async {
    try {
      final containerName = 'gpu-session-$sessionId';
      
      // Cleanup any leftover container with the same name before starting
      await Process.run('docker', ['rm', '-f', containerName]);

      // Command: docker run -d --name gpu-session-test --gpus all -p 2222:22 gpu-session
      final result = await Process.run('docker', [
        'run',
        '-d',
        '--name',
        containerName,
        '--gpus',
        'all',
        '-p',
        '2222:22', // Local development port mapping
        'gpu-session', // Our pre-built image
      ]);

      if (result.exitCode != 0) {
        print('Failed to start container: ${result.stderr}');
        return false;
      }
      return true;
    } catch (e) {
      print('Error starting container: $e');
      return false;
    }
  }

  /// Stops a running container.
  Future<bool> stopContainer(String sessionId) async {
    try {
      final containerName = 'gpu-session-$sessionId';
      final result = await Process.run('docker', ['stop', containerName]);
      return result.exitCode == 0;
    } catch (e) {
      print('Error stopping container: $e');
      return false;
    }
  }

  /// Removes a stopped container.
  Future<bool> removeContainer(String sessionId) async {
    try {
      final containerName = 'gpu-session-$sessionId';
      final result = await Process.run('docker', ['rm', containerName]);
      return result.exitCode == 0;
    } catch (e) {
      print('Error removing container: $e');
      return false;
    }
  }
}
