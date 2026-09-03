import 'dart:convert';
import 'dart:io';

void main() async {
  final file = File('.dart_tool/package_config.json');
  final config = jsonDecode(await file.readAsString());
  
  String? foruiPath;
  for (var package in config['packages']) {
    if (package['name'] == 'forui') {
      foruiPath = package['rootUri'];
      break;
    }
  }
  
  if (foruiPath != null) {
    if (foruiPath.startsWith('file:///')) {
      foruiPath = Uri.parse(foruiPath).toFilePath();
    }
    print('ForUI Path: $foruiPath');
    
    final libDir = Directory('$foruiPath/lib');
    final files = libDir.listSync(recursive: true).whereType<File>();
    
    for (var f in files) {
      if (f.path.endsWith('button.dart')) {
        final content = f.readAsStringSync();
        if (content.contains('class FButton')) {
          print('--- FButton Constructor ---');
          final lines = content.split('\n');
          for (var i = 0; i < lines.length; i++) {
            if (lines[i].contains('FButton(')) {
              for (var j = i; j < i + 15; j++) {
                print(lines[j]);
              }
              break;
            }
          }
        }
      }
      if (f.path.endsWith('text_field.dart') || f.path.contains('text_form_field.dart') || f.path.contains('form_field.dart')) {
        final content = f.readAsStringSync();
        if (content.contains('class FTextFormField')) {
          print('--- FTextFormField Constructor ---');
          final lines = content.split('\n');
          for (var i = 0; i < lines.length; i++) {
            if (lines[i].contains('FTextFormField(')) {
              for (var j = i; j < i + 25; j++) {
                print(lines[j]);
              }
              break;
            }
          }
        }
      }
    }
  } else {
    print('forui package not found');
  }
}
