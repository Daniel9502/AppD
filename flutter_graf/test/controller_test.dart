import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:graf/graph_controller.dart';

import 'model_test.dart' show loadModel;

void main() {
  late GraphController c;

  setUp(() => c = GraphController(loadModel()));

  group('filtre', () {
    test('la început totul e vizibil', () {
      expect(c.visibleNodes.length, 102);
      expect(c.model.links.where(c.isLinkVisible).length, 211);
    });

    test('ascunderea unei comunități scoate exact nodurile ei', () {
      final biggest = c.model.communities.first;
      c.toggleCommunity(biggest.id, false);
      expect(c.visibleNodes.length, 102 - biggest.count);
    });

    test('ascunderea unui tip de nod scoate exact nodurile lui', () {
      c.toggleKind('document', false);
      expect(c.visibleNodes.length, 102 - 7);
    });

    test('o muchie dispare dacă i-a dispărut un capăt', () {
      final scriptJs = c.model.byId['script']!;
      c.toggleCommunity(scriptJs.community, false);
      expect(c.model.links.where(c.isLinkVisible).any((l) =>
          identical(l.source, scriptJs) || identical(l.target, scriptJs)), isFalse);
    });

    test('„doar deduse” lasă cele 4 legături deduse', () {
      c.setOnlyInferred(true);
      expect(c.model.links.where(c.isLinkVisible).length, 4);
    });

    test('inversarea comunităților chiar inversează', () {
      final all = c.model.communities.map((e) => e.id).toSet();
      c.invertCommunities();
      expect(c.visibleCommunities, isEmpty);
      c.invertCommunities();
      expect(c.visibleCommunities, all);
    });

    test('selecția cade dacă nodul ales devine invizibil', () {
      final n = c.model.byId['script']!;
      c.select(n);
      expect(c.selected, isNotNull);
      c.toggleCommunity(n.community, false);
      expect(c.selected, isNull);
    });
  });

  group('căutare', () {
    test('găsește după nume', () {
      final hits = c.search('initcom');
      expect(hits.first.label, 'initCompose()');
    });

    test('ignoră diacriticele', () {
      expect(c.search('fisiere').map((n) => n.label), contains('Fișiere'));
    });

    test('găsește și după fișier', () {
      expect(c.search('make-icons').isNotEmpty, isTrue);
    });

    test('nu întoarce noduri filtrate', () {
      final n = c.model.nodes.firstWhere((e) => e.label == 'Fișiere');
      c.toggleCommunity(n.community, false);
      expect(c.search('fisiere'), isEmpty);
    });

    test('potrivirile de la început ies primele', () {
      final hits = c.search('build');
      expect(hits.first.label.toLowerCase().startsWith('build'), isTrue);
    });

    test('căutarea goală nu întoarce nimic', () {
      expect(c.search('   '), isEmpty);
    });
  });

  group('drum', () {
    test('raportează numărul de pași', () {
      final a = c.model.byId['script']!;
      final b = c.model.nodes.firstWhere((n) => n.label == 'initCompose()');
      c.setPathEnd(a: a);
      c.setPathEnd(b: b);
      expect(c.pathMessage, '1 pas');
      expect(c.path!.steps, 1);
    });

    test('spune „fără drum” între componente diferite', () {
      c.setPathEnd(a: c.model.byId['script']!);
      c.setPathEnd(b: c.model.nodes.firstWhere((n) => n.label == 'sw.js'));
      expect(c.path, isNull);
      expect(c.pathMessage, 'fără drum');
    });

    test('acuză nodul repetat', () {
      final n = c.model.byId['script']!;
      c.setPathEnd(a: n);
      c.setPathEnd(b: n);
      expect(c.pathMessage, 'același nod');
    });

    test('ștergerea golește tot', () {
      c.setPathEnd(a: c.model.byId['script']!);
      c.clearPath();
      expect(c.pathA, isNull);
      expect(c.pathB, isNull);
      expect(c.pathMessage, '');
    });
  });

  group('vizualizare', () {
    const size = Size(1200, 800);

    test('încadrarea aduce totul pe ecran', () {
      c.fitView(size);
      for (final n in c.visibleNodes) {
        final p = c.toScreen(n);
        expect(p.dx, inInclusiveRange(0, size.width));
        expect(p.dy, inInclusiveRange(0, size.height));
      }
    });

    test('ecran → lume → ecran se întoarce de unde a plecat', () {
      c.fitView(size);
      const screen = Offset(321, 254);
      final world = c.toWorld(screen);
      final back = Offset(world.dx * c.scale + c.offset.dx, world.dy * c.scale + c.offset.dy);
      expect(back.dx, closeTo(screen.dx, 1e-9));
      expect(back.dy, closeTo(screen.dy, 1e-9));
    });

    test('zoom-ul păstrează punctul de sub cursor', () {
      c.fitView(size);
      const focal = Offset(400, 300);
      final before = c.toWorld(focal);
      c.zoomAt(focal, 1.7);
      final after = c.toWorld(focal);
      expect(after.dx, closeTo(before.dx, 1e-9));
      expect(after.dy, closeTo(before.dy, 1e-9));
    });

    test('zoom-ul e limitat', () {
      for (var i = 0; i < 100; i++) {
        c.zoomAt(Offset.zero, 2);
      }
      expect(c.scale, lessThanOrEqualTo(8));
      for (var i = 0; i < 200; i++) {
        c.zoomAt(Offset.zero, 0.5);
      }
      expect(c.scale, greaterThanOrEqualTo(0.06));
    });

    test('centrarea pune nodul fix în mijloc', () {
      final n = c.model.byId['script']!;
      c.centerOn(n, size);
      final p = c.toScreen(n);
      expect(p.dx, closeTo(size.width / 2, 1e-9));
      expect(p.dy, closeTo(size.height / 2, 1e-9));
    });

    test('nimerește nodul de sub un punct', () {
      c.fitView(size);
      final n = c.model.byId['script']!;
      expect(c.hitTest(c.toScreen(n)), same(n));
    });

    test('nu nimerește nimic în gol', () {
      c.fitView(size);
      expect(c.hitTest(const Offset(-500, -500)), isNull);
    });
  });

  test('pironirea fixează și eliberează nodul', () {
    final n = c.model.byId['script']!;
    expect(n.isPinned, isFalse);
    c.togglePin(n);
    expect(n.isPinned, isTrue);
    expect(n.fixedX, n.x);
    c.togglePin(n);
    expect(n.isPinned, isFalse);
  });

  test('hub-urile sunt primele zece după grad', () {
    final hubs = c.hubs;
    expect(hubs.length, 10);
    expect(hubs.first.label, 'script.js');
    for (var i = 1; i < hubs.length; i++) {
      expect(hubs[i].degree, lessThanOrEqualTo(hubs[i - 1].degree));
    }
  });
}
