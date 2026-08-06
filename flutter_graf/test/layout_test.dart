import 'dart:math' as math;

import 'package:flutter_test/flutter_test.dart';
import 'package:graf/layout/quadtree.dart';
import 'package:graf/layout/simulation.dart';
import 'package:graf/model/graph.dart';

import 'model_test.dart' show loadModel;

({double minX, double maxX, double minY, double maxY}) boundsOf(List<GraphNode> nodes) {
  var minX = double.infinity, maxX = -double.infinity;
  var minY = double.infinity, maxY = -double.infinity;
  for (final n in nodes) {
    minX = math.min(minX, n.x);
    maxX = math.max(maxX, n.x);
    minY = math.min(minY, n.y);
    maxY = math.max(maxY, n.y);
  }
  return (minX: minX, maxX: maxX, minY: minY, maxY: maxY);
}

void main() {
  late GraphModel model;

  setUp(() => model = loadModel());

  group('quadtree', () {
    test('numără toate punctele și le găsește centrul', () {
      final sim = ForceSimulation(model.nodes, model.links)..reset();
      final root = Quad.build(sim.nodes);
      expect(root.count, model.nodes.length);
      expect(root.cx.isFinite, isTrue);
      expect(root.cy.isFinite, isTrue);
    });

    test('nu intră în recursie infinită pe puncte suprapuse', () {
      for (final n in model.nodes) {
        n.x = 5;
        n.y = 5;
      }
      final root = Quad.build(model.nodes);
      expect(root.count, model.nodes.length);
    });
  });

  group('simulare', () {
    test('pozițiile de start sunt distincte, nu toate în origine', () {
      final sim = ForceSimulation(model.nodes, model.links)..reset();
      final unique = sim.nodes.map((n) => '${n.x.toStringAsFixed(3)},${n.y.toStringAsFixed(3)}').toSet();
      expect(unique.length, model.nodes.length);
    });

    test('se așază fără NaN și fără infinit', () {
      final sim = ForceSimulation(model.nodes, model.links)..settle();
      for (final n in sim.nodes) {
        expect(n.x.isFinite, isTrue, reason: '${n.label} are x = ${n.x}');
        expect(n.y.isFinite, isTrue, reason: '${n.label} are y = ${n.y}');
      }
    });

    test('desfășoară graful, nu-l lasă ghemuit', () {
      final sim = ForceSimulation(model.nodes, model.links)..settle();
      final b = boundsOf(sim.nodes);
      expect(b.maxX - b.minX, greaterThan(300));
      expect(b.maxY - b.minY, greaterThan(200));
    });

    test('gravitația ține componentele deconectate în cadru', () {
      // Graful ăsta are 4 componente separate. Fără gravitație ar zbura la
      // infinit, iar încadrarea ar strivi grupul principal.
      final sim = ForceSimulation(model.nodes, model.links)..settle();
      final b = boundsOf(sim.nodes);
      final span = math.max(b.maxX - b.minX, b.maxY - b.minY);
      expect(span, lessThan(3000), reason: 'graful s-a împrăștiat prea tare');
    });

    test('nodurile nu rămân una peste alta', () {
      final sim = ForceSimulation(model.nodes, model.links)..settle();
      var tooClose = 0;
      for (var i = 0; i < sim.nodes.length; i++) {
        for (var j = i + 1; j < sim.nodes.length; j++) {
          final a = sim.nodes[i], b = sim.nodes[j];
          final d = math.sqrt(math.pow(a.x - b.x, 2) + math.pow(a.y - b.y, 2));
          if (d < (a.radius + b.radius) * 0.6) tooClose++;
        }
      }
      expect(tooClose, 0);
    });

    test('aceeași sămânță dă același aranjament', () {
      final first = ForceSimulation(model.nodes, model.links, seed: 7)..settle();
      final snapshot = first.nodes.map((n) => (n.x, n.y)).toList();

      final again = loadModel();
      final second = ForceSimulation(again.nodes, again.links, seed: 7)..settle();

      for (var i = 0; i < snapshot.length; i++) {
        expect(second.nodes[i].x, closeTo(snapshot[i].$1, 1e-9));
        expect(second.nodes[i].y, closeTo(snapshot[i].$2, 1e-9));
      }
    });

    test('nodurile pironite nu se mișcă', () {
      final sim = ForceSimulation(model.nodes, model.links)..settle();
      final pinned = sim.nodes.first;
      pinned.fixedX = 123;
      pinned.fixedY = -45;
      sim.reheat(1);
      for (var i = 0; i < 50; i++) {
        sim.tick();
      }
      expect(pinned.x, closeTo(123, 1e-9));
      expect(pinned.y, closeTo(-45, 1e-9));
    });

    test('alpha scade până sub prag și simularea se oprește', () {
      final sim = ForceSimulation(model.nodes, model.links)..reset();
      expect(sim.isRunning, isTrue);
      var steps = 0;
      while (sim.isRunning && steps < 1000) {
        sim.tick();
        steps++;
      }
      expect(sim.isRunning, isFalse);
      expect(steps, lessThan(1000));
    });
  });
}
