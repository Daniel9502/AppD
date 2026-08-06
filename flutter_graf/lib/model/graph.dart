import 'dart:math' as math;

/// Modelul grafului. Dart curat, fără Flutter, ca testele să ruleze fără
/// binding de widget-uri și ca aceeași logică să poată fi folosită oriunde.

/// Diacriticele românești (și câteva vecine) pliate la litera de bază, ca
/// „fisiere” să găsească „Fișiere”. Dart nu are normalizare Unicode în core,
/// deci tabelul e explicit.
const Map<String, String> _foldMap = {
  'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ş': 's', 'ț': 't', 'ţ': 't',
  'á': 'a', 'à': 'a', 'ä': 'a', 'å': 'a', 'ã': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o',
  'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u',
  'ç': 'c', 'ñ': 'n', 'ß': 'ss',
};

String fold(String s) {
  final buffer = StringBuffer();
  for (final rune in s.toLowerCase().runes) {
    final ch = String.fromCharCode(rune);
    buffer.write(_foldMap[ch] ?? ch);
  }
  return buffer.toString();
}

class GraphNode {
  GraphNode({
    required this.id,
    required this.index,
    required this.label,
    required this.kind,
    required this.file,
    required this.loc,
    required this.origin,
    required this.community,
    required this.communityName,
  }) : search = fold('$label $file');

  final String id;
  final int index;
  final String label;
  final String kind; // code | document | concept
  final String file;
  final String loc;
  final String origin;
  final int community;
  final String communityName;
  final String search;

  int degree = 0;
  double radius = 4;

  /// Poziția și viteza din simulare. `fixedX/fixedY` sunt nenule cât timp
  /// nodul e tras cu degetul sau pironit de utilizator.
  double x = 0, y = 0, vx = 0, vy = 0;
  double? fixedX, fixedY;

  bool get isPinned => fixedX != null;

  /// Unde se află nodul, gata de afișat: `script.js:L563`.
  String get where => file.isEmpty ? '' : (loc.isEmpty ? file : '$file:$loc');
}

class GraphLink {
  GraphLink({
    required this.source,
    required this.target,
    required this.relation,
    required this.inferred,
    required this.confidence,
    required this.context,
    required this.loc,
  });

  final GraphNode source;
  final GraphNode target;
  final String relation;

  /// Adevărat pentru legăturile deduse de Graphify, nu extrase direct din cod.
  /// Se desenează întrerupt, ca să nu treacă drept fapt.
  final bool inferred;
  final double? confidence;
  final String context;
  final String loc;

  /// Precalculate de simulare: cine trage mai tare de cine.
  double bias = 0.5;
  double strength = 1;
}

class Neighbor {
  const Neighbor(this.other, this.link, {required this.outgoing});
  final GraphNode other;
  final GraphLink link;
  final bool outgoing;
}

class Community {
  Community({required this.id, required this.name, this.count = 0, this.slot = -1});
  final int id;
  String name;
  int count;

  /// Indicele în paleta categorică; -1 înseamnă „Altele”.
  int slot;

  bool get isOther => slot < 0;
}

class Tally {
  const Tally(this.name, this.count);
  final String name;
  final int count;
}

class GraphModel {
  GraphModel._({
    required this.nodes,
    required this.links,
    required this.byId,
    required this.adjacency,
    required this.communities,
    required this.relations,
    required this.kinds,
    required this.commit,
  });

  final List<GraphNode> nodes;
  final List<GraphLink> links;
  final Map<String, GraphNode> byId;
  final Map<String, List<Neighbor>> adjacency;
  final List<Community> communities;
  final List<Tally> relations;
  final List<Tally> kinds;
  final String commit;

  Community? communityOf(GraphNode n) {
    for (final c in communities) {
      if (c.id == n.community) return c;
    }
    return null;
  }

  List<Neighbor> neighborsOf(GraphNode n) => adjacency[n.id] ?? const [];

  static GraphModel fromJson(Map<String, dynamic> json) {
    final rawNodes = (json['nodes'] as List?) ?? const [];
    final rawLinks = (json['links'] as List?) ?? (json['edges'] as List?) ?? const [];

    final nodes = <GraphNode>[];
    final byId = <String, GraphNode>{};
    for (var i = 0; i < rawNodes.length; i++) {
      final r = rawNodes[i] as Map<String, dynamic>;
      final id = (r['id'] ?? r['label'] ?? i).toString();
      final node = GraphNode(
        id: id,
        index: i,
        label: (r['label'] ?? id).toString(),
        kind: (r['file_type'] ?? 'code').toString(),
        file: (r['source_file'] ?? '').toString(),
        loc: (r['source_location'] ?? '').toString(),
        origin: (r['_origin'] ?? '').toString(),
        community: (r['community'] as num?)?.toInt() ?? -1,
        communityName: (r['community_name'] ?? '').toString(),
      );
      nodes.add(node);
      byId[id] = node;
    }

    /// Muchiile care trimit spre noduri inexistente se ignoră, nu se inventează.
    final links = <GraphLink>[];
    for (final raw in rawLinks) {
      final r = raw as Map<String, dynamic>;
      final s = byId[r['source'].toString()];
      final t = byId[r['target'].toString()];
      if (s == null || t == null || identical(s, t)) continue;
      links.add(GraphLink(
        source: s,
        target: t,
        relation: (r['relation'] ?? 'link').toString(),
        inferred: (r['confidence'] ?? '').toString().toUpperCase() == 'INFERRED',
        confidence: (r['confidence_score'] as num?)?.toDouble(),
        context: (r['context'] ?? '').toString(),
        loc: (r['source_location'] ?? '').toString(),
      ));
    }

    final adjacency = <String, List<Neighbor>>{for (final n in nodes) n.id: <Neighbor>[]};
    for (final l in links) {
      l.source.degree++;
      l.target.degree++;
      adjacency[l.source.id]!.add(Neighbor(l.target, l, outgoing: true));
      adjacency[l.target.id]!.add(Neighbor(l.source, l, outgoing: false));
    }
    for (final n in nodes) {
      n.radius = 3.6 + math.sqrt(n.degree) * 2.5;
    }

    /// Comunitățile mari primesc culoare, în ordinea mărimii; restul, „Altele”.
    final byCommunity = <int, Community>{};
    for (final n in nodes) {
      final c = byCommunity.putIfAbsent(
        n.community,
        () => Community(
          id: n.community,
          name: n.communityName.isEmpty ? 'Comunitatea ${n.community}' : n.communityName,
        ),
      );
      c.count++;
      if (c.name.isEmpty && n.communityName.isNotEmpty) c.name = n.communityName;
    }
    final communities = byCommunity.values.toList()
      ..sort((a, b) {
        final byCount = b.count.compareTo(a.count);
        return byCount != 0 ? byCount : a.id.compareTo(b.id);
      });
    for (var i = 0; i < communities.length; i++) {
      communities[i].slot = i < 8 ? i : -1;
    }

    List<Tally> tally(Iterable<String> values) {
      final counts = <String, int>{};
      for (final v in values) {
        counts[v] = (counts[v] ?? 0) + 1;
      }
      final out = counts.entries.map((e) => Tally(e.key, e.value)).toList()
        ..sort((a, b) => b.count.compareTo(a.count));
      return out;
    }

    final commit = (json['built_at_commit'] ?? '').toString();

    return GraphModel._(
      nodes: nodes,
      links: links,
      byId: byId,
      adjacency: adjacency,
      communities: communities,
      relations: tally(links.map((l) => l.relation)),
      kinds: tally(nodes.map((n) => n.kind)),
      commit: commit.isEmpty ? '' : commit.substring(0, math.min(8, commit.length)),
    );
  }
}
