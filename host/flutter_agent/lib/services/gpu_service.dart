import 'dart:io';
import '../models/gpu_info.dart';

class GpuService {
  Future<GpuInfo?> detectGpu() async {
    try {
      // Execute nvidia-smi as a child process and wait for it to complete.
      final result = await Process.run('nvidia-smi', []);

      if (result.exitCode != 0) {
        print('Error running nvidia-smi: ${result.stderr}');
        return null;
      }

      final output = result.stdout as String;
      
      // Parse output using Regex
      final driverMatch = RegExp(r'Driver Version:\s+([0-9.]+)').firstMatch(output);
      final cudaMatch = RegExp(r'CUDA Version:\s+([0-9.]+)').firstMatch(output);
      
      // Example regex to match GPU name: "|   0  NVIDIA GeForce RTX 2050 ..."
      final nameMatch = RegExp(r'\|\s+\d+\s+(NVIDIA.*?)\s+(?:Off|On)\s+\|').firstMatch(output);
      
      // Example regex to match memory: "123MiB /  4096MiB"
      final memoryMatch = RegExp(r'/\s+([0-9]+MiB)').firstMatch(output);
      
      // Example regex to match temperature: "45C"
      final tempMatch = RegExp(r'(\d+)C').firstMatch(output);

      String internetType = 'ethernet';
      try {
        final interfaces = await NetworkInterface.list(type: InternetAddressType.IPv4);
        for (var interface in interfaces) {
          final name = interface.name.toLowerCase();
          if (name.contains('wi-fi') || name.contains('wlan') || name.contains('wireless')) {
            internetType = 'wifi';
            break;
          }
        }
      } catch (_) {
        // Fallback to ethernet if detection fails
      }

      if (driverMatch != null && nameMatch != null) {
        return GpuInfo(
          name: nameMatch.group(1)?.trim() ?? 'Unknown',
          vramTotal: memoryMatch?.group(1) ?? 'Unknown',
          driverVersion: driverMatch.group(1) ?? 'Unknown',
          cudaVersion: cudaMatch?.group(1) ?? 'Unknown',
          temperature: tempMatch != null ? '${tempMatch.group(1)}°C' : 'Unknown',
          osVersion: Platform.operatingSystemVersion,
          internetType: internetType,
        );
      }
      
      print('Could not parse nvidia-smi output properly.');
      return null;
      
    } catch (e) {
      print('Failed to execute nvidia-smi: $e');
      return null;
    }
  }
}

