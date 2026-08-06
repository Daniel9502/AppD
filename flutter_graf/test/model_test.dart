import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:graf/model/graph.dart';

GraphModel loadModel() {
  final raw = File('assets/graph.json').readAsStringSync();
  return GraphModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
}

void main() {
  late GraphModel model;

  setUpAll(() => model = loadModel());

  group('citirea grafului', () {
    test('numără nodurile, muchiile și comunitățile', () {
      expect(model.nodes.length, 102);
      expect(model.links.length, 211);
      expect(model.communities.length, 11);
    });

    test('reține commit-ul, scurtat', () {
      expect(model.commit, 'aac0dbcc');
    });

    test('gradele sunt calculate în ambele sensuri', () {
      final scriptJs = model.byId['script']!;
      expect(scriptJs.label, 'script.js');
      expect(scriptJs.degree, 78);
      expect(model.neighborsOf(scriptJs).length, 78);
    });

    test('nodul cel mai conectat e fișierul care conține restul', () {
      final sorted = [...model.nodes]..sort((a, b) => b.degree - a.degree);
      expect(sorted.first.label, 'script.js');
      expect(sorted[1].label, 'initCompose()');
      expect(sorted[1].degree, 18);
    });

    test('raza crește cu gradul', () {
      final low = model.nodes.firstWhere((n) => n.degree == 1);
      final high = model.byId['script']!;
      expect(high.radius, greaterThan(low.radius));
    });

    test('vecinii poartă direcția muchiei', () {
      final scriptJs = model.byId['script']!;
      final outgoing = model.neighborsOf(scriptJs).where((n) => n.outgoing).length;
      expect(outgoing, greaterThan(0));
    });
  });

  group('comunități și sloturi de culoare', () {
    test('primele opt primesc slot, restul intră în Altele', () {
      final withSlot = model.communities.where((c) => !c.isOther).toList();
      final other = model.communities.where((c) => c.isOther).toList();
      expect(withSlot.length, 8);
      expect(other.length, 3);
    });

    test('sloturile sunt distincte și în ordinea mărimii', () {
      final slots = model.communities.where((c) => !c.isOther).map((c) => c.slot).toList();
      expect(slots, [0, 1, 2, 3, 4, 5, 6, 7]);
      final counts = model.communities.map((c) => c.count).toList();
      for (var i = 1; i < counts.length; i++) {
        expect(counts[i], lessThanOrEqualTo(counts[i - 1]));
      }
    });

    test('numerele de noduri pe comunități însumează tot graful', () {
      final total = model.communities.fold<int>(0, (s, c) => s + c.count);
      expect(total, model.nodes.length);
    });
  });

  group('tipuri și relații', () {
    test('relațiile sunt numărate corect', () {
      final byName = {for (final r in model.relations) r.name: r.count};
      expect(byName['calls'], 102);
      expect(byName['contains'], 97);
      expect(byName['references'], 7);
      expect(byName['indirect_call'], 4);
      expect(byName['cites'], 1);
    });

    test('tipurile de nod sunt numărate corect', () {
      final byName = {for (final k in model.kinds) k.name: k.count};
      expect(byName['code'], 94);
      expect(byName['document'], 7);
      expect(byName['concept'], 1);
    });

    test('doar 4 legături sunt deduse', () {
      expect(model.links.where((l) => l.inferred).length, 4);
    });
  });

  group('pliatul diacriticelor', () {
    test('literele românești ajung la baza lor', () {
      expect(fold('Fișiere'), 'fisiere');
      expect(fold('Hai să ne vedem'), 'hai sa ne vedem');
      expect(fold('înțeleg'), 'inteleg');
    });

    test('textul de căutare al nodurilor e deja pliat', () {
      final fisiere = model.nodes.firstWhere((n) => n.label == 'Fișiere');
      expect(fisiere.search.contains('fisiere'), isTrue);
    });
  });

  test('nodurile știu unde stau în cod', () {
    final initCompose = model.nodes.firstWhere((n) => n.label == 'initCompose()');
    expect(initCompose.where, 'script.js:L596');
  });
}
