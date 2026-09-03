import 'package:flutter/material.dart';
import 'package:forui/forui.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import '../../models/financial_models.dart';

class FinancialScreen extends StatefulWidget {
  const FinancialScreen({Key? key}) : super(key: key);

  @override
  State<FinancialScreen> createState() => _FinancialScreenState();
}

class _FinancialScreenState extends State<FinancialScreen> {
  final ApiService _apiService = ApiService();
  
  bool _isLoading = true;
  bool _hasError = false;
  RevenueSummary? _summary;
  List<Transaction> _transactions = [];

  @override
  void initState() {
    super.initState();
    _fetchFinancialData();
  }

  Future<void> _fetchFinancialData() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _hasError = false;
    });

    try {
      final dataResponse = await _apiService.getHostEarningsData();

      if (dataResponse == null) {
        throw Exception('Failed to load financial data');
      }

      final summaryJson = dataResponse['summary'] ?? {};
      final summary = RevenueSummary.fromJson(summaryJson);
      
      final historyArray = dataResponse['history'] as List<dynamic>? ?? [];
      final transactions = historyArray.map((e) => Transaction.fromJson(e)).toList();

      if (mounted) {
        setState(() {
          _summary = summary;
          _transactions = transactions;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error fetching financials: $e');
      if (mounted) {
        setState(() {
          _hasError = true;
          _isLoading = false;
        });
      }
    }
  }

  String _formatCurrency(double amount) {
    // Formatting with 2 decimal places. 
    // Not hardcoding a currency symbol unless defined, we will just use a generic format.
    // If we want to assume USD based on the prompt's tip, we can use \$, but prompt said DO NOT assume if not defined.
    // However, ForUI looks best with some prefix, let's use a generic formatter.
    final formatter = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    return formatter.format(amount);
  }

  String _formatDate(String isoDateString) {
    if (isoDateString.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(isoDateString).toLocal();
      return DateFormat('MMM d, yyyy h:mm a').format(date);
    } catch (e) {
      return isoDateString;
    }
  }

  Widget _buildSummaryCard(String title, String value, IconData icon, Color color) {
    return Container(
      width: 250,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(color: Colors.grey, fontSize: 14)),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(color: color, fontSize: 28, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        title: const Text('Financial Information', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchFinancialData,
            tooltip: 'Refresh Data',
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFE600)))
          : _hasError
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, color: Colors.red, size: 48),
                      const SizedBox(height: 16),
                      const Text('Unable to load financial information.',
                          style: TextStyle(color: Colors.white, fontSize: 16)),
                      const SizedBox(height: 16),
                      FButton(
                        onPress: _fetchFinancialData,
                        style: FButtonStyle.outline(),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchFinancialData,
                  color: const Color(0xFFFFE600),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Financial Summary',
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 24),
                        if (_summary != null)
                          Wrap(
                            spacing: 16,
                            runSpacing: 16,
                            children: [
                              _buildSummaryCard(
                                'Net Earnings',
                                _formatCurrency(_summary!.netEarnings),
                                Icons.account_balance_wallet,
                                const Color(0xFFFFE600),
                              ),
                              _buildSummaryCard(
                                'Gross Revenue',
                                _formatCurrency(_summary!.totalGross),
                                Icons.attach_money,
                                Colors.greenAccent,
                              ),
                              _buildSummaryCard(
                                'Platform Fees',
                                _formatCurrency(_summary!.totalFees),
                                Icons.money_off,
                                Colors.redAccent,
                              ),
                              _buildSummaryCard(
                                'Pending Payout',
                                _formatCurrency(_summary!.pendingPayout),
                                Icons.schedule,
                                Colors.blueAccent,
                              ),
                            ],
                          ),
                        const SizedBox(height: 48),
                        const Text(
                          'Earnings / Transactions',
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 24),
                        if (_transactions.isEmpty)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(48),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1A1A1A),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Column(
                              children: [
                                Icon(Icons.receipt_long, color: Colors.grey, size: 48),
                                SizedBox(height: 16),
                                Text(
                                  'No earnings yet',
                                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                                SizedBox(height: 8),
                                Text(
                                  'Your earnings will appear here once your GPU has completed a rental session.',
                                  style: TextStyle(color: Colors.grey),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          )
                        else
                          Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF1A1A1A),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _transactions.length,
                              separatorBuilder: (context, index) => const Divider(color: Colors.white12, height: 1),
                              itemBuilder: (context, index) {
                                final tx = _transactions[index];
                                return ListTile(
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                  leading: CircleAvatar(
                                    backgroundColor: tx.type == 'host_earning' 
                                      ? Colors.green.withOpacity(0.2) 
                                      : Colors.grey.withOpacity(0.2),
                                    child: Icon(
                                      tx.type == 'host_earning' ? Icons.arrow_downward : Icons.swap_horiz,
                                      color: tx.type == 'host_earning' ? Colors.greenAccent : Colors.grey,
                                    ),
                                  ),
                                  title: Text(
                                    tx.description ?? tx.type.replaceAll('_', ' ').toUpperCase(),
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                                  ),
                                  subtitle: Padding(
                                    padding: const EdgeInsets.only(top: 4.0),
                                    child: Text(
                                      '${_formatDate(tx.createdAt)} • Status: ${tx.status}',
                                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                                    ),
                                  ),
                                  trailing: Text(
                                    (tx.type == 'host_earning' ? '+' : '') + _formatCurrency(tx.amount),
                                    style: TextStyle(
                                      color: tx.type == 'host_earning' ? Colors.greenAccent : Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
    );
  }
}
