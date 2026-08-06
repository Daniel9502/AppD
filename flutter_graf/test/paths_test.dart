import 'package:flutter_test/flutter_test.dart';
import 'package:graf/model/graph.dart';
import 'package:graf/model/paths.dart';

import 'model_test.dart' show loadModel;

void main() {
  late GraphModel model;

  setUpAll(() => model = loadModel());

  GraphNode byLabel(String label) => model.nodes.firstWhere((n) => n.label == label);

  group('componente conexe', () {
    test('graful are patru componente separate', () {
      final parts = Paths.components(model);
      expect(parts.map((p) => p.length).toList(), [79, 14, 7, 2]);
    });

    test('componentele acoperă toate nodurile, fără suprapuneri', () {
      final parts = Paths.components(model);
      final ids = <String>{};
      for (final p in parts) {
        for (final n in p) {
          expect(ids.add(n.id), isTrue, reason: '${n.label} apare de două ori');
        }
      }
      expect(ids.length, model.nodes.length);
    });
  });

  group('drum minim', () {
    test('găsește un drum între noduri din aceeași componentă', () {
      final path = Paths.shortest(model, byLabel('initCompose()'), byLabel('RFC-5545'));
      expect(path, isNotNull);
      expect(path!.steps, greaterThan(0));
      expect(path.nodes.first.label, 'initCompose()');
      expect(path.nodes.last.label, 'RFC-5545');
      expect(path.links.length, path.nodes.length - 1);
    });

    test('drumul chiar e un lanț de muchii vecine', () {
      final path = Paths.shortest(model, byLabel('applyPreset()'), byLabel('startSky()'))!;
      for (var i = 0; i < path.links.length; i++) {
        final l = path.links[i];
        final a = path.nodes[i], b = path.nodes[i + 1];
        final joins = (identical(l.source, a) && identical(l.target, b)) ||
            (identical(l.source, b) && identical(l.target, a));
        expect(joins, isTrue, reason: 'muchia $i nu leagă ${a.label} de ${b.label}');
      }
    });

    test('e cel mai scurt, nu doar unul oarecare', () {
      // script.js conține direct initCompose(), deci drumul are exact un pas.
      final path = Paths.shortest(model, byLabel('script.js'), byLabel('initCompose()'));
      expect(path!.steps, 1);
    });

    test('spune „fără drum” peste componente diferite', () {
      final path = Paths.shortest(model, byLabel('script.js'), byLabel('sw.js'));
      expect(path, isNull);
    });

    test('un nod cu el însuși nu e drum', () {
      final n = byLabel('script.js');
      expect(Paths.shortest(model, n, n), isNull);
    });

    test('filtrul pe muchii chiar taie drumuri', () {
      final a = byLabel('script.js');
      final b = byLabel('initCompose()');
      expect(Paths.shortest(model, a, b), isNotNull);
      final blocked = Paths.shortest(model, a, b, allow: (l) => l.relation != 'contains');
      expect(blocked, anyOf(isNull, predicate<GraphPath>((p) => p.steps > 1)));
    });
  });
}
