class GpuInfo {
  final String name;
  final String vramTotal;
  final String driverVersion;
  final String cudaVersion;
  final String temperature;
  final String osVersion;
  final String internetType;

  GpuInfo({
    required this.name,
    required this.vramTotal,
    required this.driverVersion,
    required this.cudaVersion,
    required this.temperature,
    required this.osVersion,
    required this.internetType,
  });
}

