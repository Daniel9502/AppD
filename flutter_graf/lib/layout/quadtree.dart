import 'dart:math' as math;

import '../model/graph.dart';

/// Quadtree pentru aproximarea Barnes-Hut a respingerii dintre noduri.
///
/// Toate nodurile au aceeași sarcină, deci e destul să numărăm punctele:
/// centrul de masă e media simplă, iar masa e `count × charge`. Fără asta
/// respingerea ar fi O(n²) și ar muri pe grafuri de câteva mii de noduri.
class Quad {
  Quad(this.x0, this.y0, this.x1, this.y1);

  final double x0, y0, x1, y1;
  List<Quad>? kids;
  List<GraphNode>? items;
  int count = 0;
  double cx = 0, cy = 0;

  double get width => x1 - x0;

  static const int maxDepth = 20;

  static Quad build(List<GraphNode> nodes) {
    var minX = double.infinity, minY = double.infinity;
    var maxX = -double.infinity, maxY = -double.infinity;
    for (final n in nodes) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }
    if (nodes.isEmpty) return Quad(-1, -1, 1, 1);

    // Pătrat, cu o margine, ca împărțirea în sferturi să fie uniformă.
    final centerX = (minX + maxX) / 2;
    final centerY = (minY + maxY) / 2;
    final half = math.max(maxX - minX, maxY - minY) / 2 + 1;
    final root = Quad(centerX - half, centerY - half, centerX + half, centerY + half);
    for (final n in nodes) {
      root._insert(n, 0);
    }
    root._accumulate();
    return root;
  }

  Quad _pick(GraphNode n) {
    final midX = (x0 + x1) / 2, midY = (y0 + y1) / 2;
    return kids![(n.y >= midY ? 2 : 0) + (n.x >= midX ? 1 : 0)];
  }

  void _split() {
    final midX = (x0 + x1) / 2, midY = (y0 + y1) / 2;
    kids = [
      Quad(x0, y0, midX, midY),
      Quad(midX, y0, x1, midY),
      Quad(x0, midY, midX, y1),
      Quad(midX, midY, x1, y1),
    ];
  }

  void _insert(GraphNode n, int depth) {
    if (kids != null) {
      _pick(n)._insert(n, depth + 1);
      return;
    }
    if (items == null) {
      items = [n];
      return;
    }
    // Puncte suprapuse: sub adâncimea maximă rămân împreună în frunză, altfel
    // împărțirea ar recursa la infinit.
    if (depth >= maxDepth) {
      items!.add(n);
      return;
    }
    final old = items!;
    items = null;
    _split();
    for (final m in old) {
      _pick(m)._insert(m, depth + 1);
    }
    _pick(n)._insert(n, depth + 1);
  }

  void _accumulate() {
    final children = kids;
    if (children != null) {
      var total = 0;
      var sumX = 0.0, sumY = 0.0;
      for (final k in children) {
        k._accumulate();
        if (k.count > 0) {
          total += k.count;
          sumX += k.cx * k.count;
          sumY += k.cy * k.count;
        }
      }
      count = total;
      if (total > 0) {
        cx = sumX / total;
        cy = sumY / total;
      }
      return;
    }
    final leaf = items;
    if (leaf == null) return;
    var sumX = 0.0, sumY = 0.0;
    for (final m in leaf) {
      sumX += m.x;
      sumY += m.y;
    }
    count = leaf.length;
    cx = sumX / count;
    cy = sumY / count;
  }
}
