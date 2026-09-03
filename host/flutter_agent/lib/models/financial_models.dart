class RevenueSummary {
  final double totalGross;
  final double totalFees;
  final double netEarnings;
  final double pendingPayout;
  final int totalSessions;

  RevenueSummary({
    required this.totalGross,
    required this.totalFees,
    required this.netEarnings,
    required this.pendingPayout,
    required this.totalSessions,
  });

  factory RevenueSummary.fromJson(Map<String, dynamic> json) {
    return RevenueSummary(
      totalGross: _parseDouble(json['total_gross']),
      totalFees: _parseDouble(json['total_fees']),
      netEarnings: _parseDouble(json['net_earnings']),
      pendingPayout: _parseDouble(json['pending_payout']),
      totalSessions: json['total_sessions'] ?? 0,
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}

class Transaction {
  final String id;
  final String type;
  final String status;
  final double amount;
  final String? description;
  final String createdAt;
  final String? completedAt;

  Transaction({
    required this.id,
    required this.type,
    required this.status,
    required this.amount,
    this.description,
    required this.createdAt,
    this.completedAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] ?? '',
      type: json['type'] ?? 'unknown',
      status: json['status'] ?? 'unknown',
      amount: RevenueSummary._parseDouble(json['amount']),
      description: json['description'],
      createdAt: json['created_at'] ?? '',
      completedAt: json['completed_at'],
    );
  }
}
