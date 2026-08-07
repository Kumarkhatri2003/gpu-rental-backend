import 'package:flutter/material.dart';
import 'ui/screens/home_screen.dart';

void main() {
  runApp(const HostAgentApp());
}

class HostAgentApp extends StatelessWidget {
  const HostAgentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Host Agent',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
