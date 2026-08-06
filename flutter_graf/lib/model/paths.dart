import 'graph.dart';

/// Un drum găsit prin graf: nodurile în ordine și muchiile dintre ele.
class GraphPath {
  const GraphPath(this.nodes, this.links);

  final List<GraphNode> nodes;
  final List<GraphLink> links;

  int get steps => links.length;

  bool containsNode(GraphNode n) => nodes.any((m) => identical(m, n));
  bool containsLink(GraphLink l) => links.any((m) => identical(m, l));
}

typedef LinkFilter = bool Function(GraphLink link);

/// Drumuri și componente conexe. Graful e nedirecționat (`directed: false` în
/// graph.json), deci parcurgem muchiile în ambele sensuri.
class Paths {
  /// Drumul cel mai scurt între două noduri, prin parcurgere în lățime.
  /// Întoarce `null` dacă nodurile sunt în componente diferite; caz real:
  /// graful proiectului ăstuia are patru componente separate.
  static GraphPath? shortest(
    GraphModel model,
    GraphNode from,
    GraphNode to, {
    LinkFilter? allow,
  }) {
    if (identical(from, to)) return null;

    final cameFrom = <String, (GraphNode, GraphLink)>{};
    final seen = <String>{from.id};
    final queue = <GraphNode>[from];

    var found = false;
    for (var i = 0; i < queue.length && !found; i++) {
      final current = queue[i];
      for (final edge in model.neighborsOf(current)) {
        if (allow != null && !allow(edge.link)) continue;
        if (!seen.add(edge.other.id)) continue;
        cameFrom[edge.other.id] = (current, edge.link);
        if (identical(edge.other, to)) {
          found = true;
          break;
        }
        queue.add(edge.other);
      }
    }
    if (!found) return null;

    final nodes = <GraphNode>[to];
    final links = <GraphLink>[];
    var cursor = to;
    while (true) {
      final step = cameFrom[cursor.id];
      if (step == null) break;
      links.add(step.$2);
      nodes.add(step.$1);
      cursor = step.$1;
    }
    return GraphPath(nodes.reversed.toList(), links.reversed.toList());
  }

  /// Componentele conexe, cele mai mari întâi.
  static List<List<GraphNode>> components(GraphModel model, {LinkFilter? allow}) {
    final seen = <String>{};
    final out = <List<GraphNode>>[];

    for (final start in model.nodes) {
      if (!seen.add(start.id)) continue;
      final group = <GraphNode>[start];
      final stack = <GraphNode>[start];
      while (stack.isNotEmpty) {
        final current = stack.removeLast();
        for (final edge in model.neighborsOf(current)) {
          if (allow != null && !allow(edge.link)) continue;
          if (!seen.add(edge.other.id)) continue;
          group.add(edge.other);
          stack.add(edge.other);
        }
      }
      out.add(group);
    }
    out.sort((a, b) => b.length.compareTo(a.length));
    return out;
  }
}
