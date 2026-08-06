import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:graf/graph_controller.dart';
import 'package:graf/graph_painter.dart';
import 'package:graf/model/palette.dart';

import 'model_test.dart' show loadModel;

/// `flutter_test` desenează textul ca pătrate, cu fontul lui de test. Ca să pot
/// privi rezultatul, încărcăm un font adevărat de pe sistem.
Future<String?> _loadSystemFont() async {
  const candidates = [
    r'C:\Windows\Fonts\segoeui.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  ];
  for (final path in candidates) {
    final file = File(path);
    if (!file.existsSync()) continue;
    final loader = FontLoader('SistemSans')
      ..addFont(Future.value(ByteData.sublistView(file.readAsBytesSync())));
    await loader.load();
    return 'SistemSans';
  }
  return null;
}

void main() {
  const size = Size(1200, 800);

  testWidgets('randează graful în PNG, pe ambele teme', (tester) async {
    final outDir = Directory('test/out')..createSync(recursive: true);
    final written = <String, int>{};

    // Rasterizarea și codarea PNG cer async adevărat, nu pe cel fals al testelor.
    await tester.runAsync(() async {
      final font = await _loadSystemFont();

      for (final (name, palette) in [
        ('dark', Palette.dark),
        ('light', Palette.light),
      ]) {
        final controller = GraphController(loadModel());
        controller.fitView(size);

        final image = await renderGraphToImage(controller, palette, size, fontFamily: font);
        expect(image.width, 1200);
        expect(image.height, 800);

        final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
        expect(bytes, isNotNull, reason: 'randarea n-a produs pixeli');

        final file = File('${outDir.path}/graf-$name.png');
        file.writeAsBytesSync(bytes!.buffer.asUint8List());
        written[name] = file.lengthSync();
      }
    });

    expect(written.keys, containsAll(['dark', 'light']));
    for (final entry in written.entries) {
      expect(entry.value, greaterThan(5000),
          reason: 'PNG-ul ${entry.key} pare gol (${entry.value} octeți)');
    }
  });

  testWidgets('desenul stă în cadru și nu iese din pânză', (tester) async {
    final controller = GraphController(loadModel());
    controller.fitView(size);

    var inside = 0;
    for (final n in controller.visibleNodes) {
      final p = controller.toScreen(n);
      if (p.dx >= 0 && p.dx <= size.width && p.dy >= 0 && p.dy <= size.height) inside++;
    }
    expect(inside, controller.model.nodes.length,
        reason: 'după încadrare, toate nodurile trebuie să fie pe ecran');
  });

  testWidgets('evidențierea unui nod aprinde exact vecinii lui', (tester) async {
    final controller = GraphController(loadModel());
    final initCompose =
        controller.model.nodes.firstWhere((n) => n.label == 'initCompose()');
    controller.select(initCompose);

    final focus = controller.focus!;
    expect(focus.nodes.contains(initCompose.id), isTrue);
    expect(focus.nodes.length, 19); // nodul + cei 18 vecini
    expect(focus.links.length, 18);
  });

  testWidgets('drumul evidențiat trece peste evidențierea din selecție', (tester) async {
    final controller = GraphController(loadModel());
    final a = controller.model.nodes.firstWhere((n) => n.label == 'initCompose()');
    final b = controller.model.nodes.firstWhere((n) => n.label == 'RFC-5545');
    controller.select(a);
    controller.setPathEnd(a: a);
    controller.setPathEnd(b: b);

    expect(controller.path, isNotNull);
    final focus = controller.focus!;
    expect(focus.nodes.length, controller.path!.nodes.length);
    expect(focus.links.length, controller.path!.links.length);
  });
}
