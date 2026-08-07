class ApiService {
  /// Simulates registering the host with the central FastAPI backend.
  Future<bool> registerHost(String gpuModel, String vram) async {
    await Future.delayed(const Duration(seconds: 1)); // Network simulation
    print('[API] Registered Host: $gpuModel ($vram)');
    return true;
  }

  /// Simulates polling the backend for any pending rental sessions.
  Future<String?> pollForPendingSession() async {
    await Future.delayed(const Duration(seconds: 1));
    // Simulate finding a session randomly 10% of the time.
    // For manual testing, we usually want to trigger it from UI, 
    // so we'll just return null here and let the UI override.
    return null; 
  }
}
