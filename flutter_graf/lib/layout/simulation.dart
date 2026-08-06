import 'dart:math' as math;

import '../model/graph.dart';
import 'quadtree.dart';

/// Simulare de forțe în stil d3-force: respingere Barnes-Hut, arcuri pe muchii,
/// gravitație spre origine, coliziuni, integrare cu frecare.
///
/// Generatorul aleator e cu sămânță, iar pozițiile de start sunt filotaxice,
/// deci același graf dă mereu același aranjament. Fără asta, testele de imagine
/// n-ar avea ce compara.
class ForceSimulation {
  ForceSimulation(this.nodes, this.links, {int seed = 1})
      : _rng = math.Random(seed);

  final List<GraphNode> nodes;
  final List<GraphLink> links;
  final math.Random _rng;

  double alpha = 0;
  double alphaTarget = 0;

  static const double alphaMin = 0.001;
  static final double alphaDecay = 1 - math.pow(alphaMin, 1 / 300).toDouble();
  static const double velocityDecay = 0.6;

  static const double charge = -520;
  static const double theta2 = 0.81;
  static const double distMin2 = 4;
  static const double distMax2 = 1e7;
  static const double linkDistance = 46;

  /// Graful poate avea componente deconectate. Fără o gravitație spre origine,
  /// respingerea le-ar arunca la infinit, iar încadrarea ar strivi grupul
  /// principal într-un ghem ilizibil.
  static const double gravity = 0.095;

  bool get isRunning => alpha > alphaMin;

  double _jiggle() => (_rng.nextDouble() - 0.5) * 1e-6;

  /// Repornește de la zero: poziții filotaxice, viteze nule, alpha 1.
  void reset() {
    const r0 = 12.0;
    final a0 = math.pi * (3 - math.sqrt(5));
    for (var i = 0; i < nodes.length; i++) {
      final n = nodes[i];
      final radius = r0 * math.sqrt(0.5 + i);
      final angle = i * a0;
      n.x = radius * math.cos(angle);
      n.y = radius * math.sin(angle);
      n.vx = 0;
      n.vy = 0;
      n.fixedX = null;
      n.fixedY = null;
    }
    // Legăturile spre noduri de grad mare trag mai puțin de acestea.
    for (final l in links) {
      final ds = l.source.degree, dt = l.target.degree;
      l.bias = ds / (ds + dt);
      l.strength = 1 / math.min(ds, dt);
    }
    alpha = 1;
  }

  /// Rulează până se așază: la încărcare și când mișcarea e dezactivată.
  void settle({int steps = 320}) {
    alpha = 1;
    for (var i = 0; i < steps && alpha > alphaMin; i++) {
      tick();
    }
    alpha = 0;
  }

  void reheat([double target = 0.4]) {
    if (alpha < target) alpha = target;
    alphaTarget = 0;
  }

  void tick() {
    alpha += (alphaTarget - alpha) * alphaDecay;
    final a = alpha;

    final root = Quad.build(nodes);
    for (final n in nodes) {
      _applyManyBody(root, n, a);
    }
    _applyLinks(a);
    _applyGravity(a);
    _applyCollide();
    _integrate();
    _recenter();
  }

  void _applyManyBody(Quad quad, GraphNode n, double a) {
    if (quad.count == 0) return;
    var dx = quad.cx - n.x, dy = quad.cy - n.y;
    var d2 = dx * dx + dy * dy;

    final kids = quad.kids;
    if (kids != null) {
      if (d2 == 0) {
        dx = _jiggle();
        dy = _jiggle();
        d2 = dx * dx + dy * dy;
      }
      final w = quad.width;
      if (w * w / theta2 < d2) {
        if (d2 < distMax2) {
          if (d2 < distMin2) d2 = math.sqrt(distMin2 * d2);
          final f = quad.count * charge * a / d2;
          n.vx += dx * f;
          n.vy += dy * f;
        }
        return;
      }
      for (final k in kids) {
        _applyManyBody(k, n, a);
      }
      return;
    }

    final items = quad.items;
    if (items == null) return;
    for (final m in items) {
      if (identical(m, n)) continue;
      var ex = m.x - n.x, ey = m.y - n.y;
      var e2 = ex * ex + ey * ey;
      if (e2 == 0) {
        ex = _jiggle();
        ey = _jiggle();
        e2 = ex * ex + ey * ey;
      }
      if (e2 >= distMax2) continue;
      if (e2 < distMin2) e2 = math.sqrt(distMin2 * e2);
      final f = charge * a / e2;
      n.vx += ex * f;
      n.vy += ey * f;
    }
  }

  void _applyLinks(double a) {
    for (final l in links) {
      final s = l.source, t = l.target;
      var x = t.x + t.vx - s.x - s.vx;
      var y = t.y + t.vy - s.y - s.vy;
      var d = math.sqrt(x * x + y * y);
      if (d == 0) {
        x = _jiggle();
        y = _jiggle();
        d = math.sqrt(x * x + y * y);
      }
      final f = (d - linkDistance) / d * a * l.strength;
      x *= f;
      y *= f;
      t.vx -= x * l.bias;
      t.vy -= y * l.bias;
      s.vx += x * (1 - l.bias);
      s.vy += y * (1 - l.bias);
    }
  }

  void _applyGravity(double a) {
    for (final n in nodes) {
      n.vx -= n.x * gravity * a;
      n.vy -= n.y * gravity * a;
    }
  }

  /// Coliziuni pe o grilă uniformă: fiecare nod se compară doar cu vecinii din
  /// celulele alăturate, nu cu toate celelalte noduri.
  void _applyCollide() {
    if (nodes.isEmpty) return;
    var maxR = 0.0;
    for (final n in nodes) {
      if (n.radius > maxR) maxR = n.radius;
    }
    final cell = math.max(maxR * 2 + 4, 8.0);
    final grid = <int, List<GraphNode>>{};
    int key(int i, int j) => i * 73856093 ^ j * 19349663;

    for (final n in nodes) {
      final k = key((n.x / cell).floor(), (n.y / cell).floor());
      grid.putIfAbsent(k, () => <GraphNode>[]).add(n);
    }

    for (final n in nodes) {
      final gi = (n.x / cell).floor(), gj = (n.y / cell).floor();
      for (var di = -1; di <= 1; di++) {
        for (var dj = -1; dj <= 1; dj++) {
          final bucket = grid[key(gi + di, gj + dj)];
          if (bucket == null) continue;
          for (final m in bucket) {
            if (m.index <= n.index) continue; // fiecare pereche o singură dată
            var x = n.x + n.vx - m.x - m.vx;
            var y = n.y + n.vy - m.y - m.vy;
            var l = x * x + y * y;
            final rr = n.radius + m.radius + 2;
            if (l >= rr * rr) continue;
            if (l == 0) {
              x = _jiggle();
              y = _jiggle();
              l = x * x + y * y;
            }
            final dist = math.sqrt(l);
            final push = (rr - dist) / dist;
            final ni = n.radius * n.radius, mi = m.radius * m.radius;
            var share = mi / (ni + mi);
            x *= push;
            y *= push;
            n.vx += x * share;
            n.vy += y * share;
            share = 1 - share;
            m.vx -= x * share;
            m.vy -= y * share;
          }
        }
      }
    }
  }

  void _integrate() {
    for (final n in nodes) {
      final fx = n.fixedX, fy = n.fixedY;
      if (fx != null) {
        n.x = fx;
        n.vx = 0;
      } else {
        n.vx *= velocityDecay;
        n.x += n.vx;
      }
      if (fy != null) {
        n.y = fy;
        n.vy = 0;
      } else {
        n.vy *= velocityDecay;
        n.y += n.vy;
      }
    }
  }

  void _recenter() {
    if (nodes.isEmpty) return;
    // Un nod pironit ancorează aranjamentul: dacă am recentra, l-am muta chiar
    // pe el, iar sub deget graful ar aluneca.
    for (final n in nodes) {
      if (n.fixedX != null || n.fixedY != null) return;
    }
    var sx = 0.0, sy = 0.0;
    for (final n in nodes) {
      sx += n.x;
      sy += n.y;
    }
    sx /= nodes.length;
    sy /= nodes.length;
    for (final n in nodes) {
      n.x -= sx;
      n.y -= sy;
    }
  }
}
