import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import 'layout/simulation.dart';
import 'model/graph.dart';
import 'model/paths.dart';

/// Toată starea exploratorului: modelul, simularea, filtrele, ce e selectat,
/// transformarea de vizualizare. Widget-urile doar o citesc și o schimbă.
class GraphController extends ChangeNotifier {
  GraphController(this.model, {int seed = 1})
      : sim = ForceSimulation(model.nodes, model.links, seed: seed) {
    visibleCommunities = model.communities.map((c) => c.id).toSet();
    visibleRelations = model.relations.map((r) => r.name).toSet();
    visibleKinds = model.kinds.map((k) => k.name).toSet();
    sim.reset();
    sim.settle();
  }

  final GraphModel model;
  final ForceSimulation sim;

  late Set<int> visibleCommunities;
  late Set<String> visibleRelations;
  late Set<String> visibleKinds;
  bool onlyInferred = false;

  GraphNode? selected;
  GraphNode? hovered;
  GraphNode? pathA;
  GraphNode? pathB;
  GraphPath? path;

  /// Mesajul de sub bara de drum: „3 pași”, „fără drum”, „același nod”.
  String pathMessage = '';

  double scale = 1;
  Offset offset = Offset.zero;

  // ---------------------------------------------------------------- filtre

  bool isNodeVisible(GraphNode n) =>
      visibleCommunities.contains(n.community) && visibleKinds.contains(n.kind);

  bool isLinkVisible(GraphLink l) =>
      visibleRelations.contains(l.relation) &&
      (!onlyInferred || l.inferred) &&
      isNodeVisible(l.source) &&
      isNodeVisible(l.target);

  Iterable<GraphNode> get visibleNodes => model.nodes.where(isNodeVisible);

  void toggleCommunity(int id, bool on) {
    on ? visibleCommunities.add(id) : visibleCommunities.remove(id);
    _afterFilterChange();
  }

  void toggleRelation(String name, bool on) {
    on ? visibleRelations.add(name) : visibleRelations.remove(name);
    _afterFilterChange();
  }

  void toggleKind(String name, bool on) {
    on ? visibleKinds.add(name) : visibleKinds.remove(name);
    _afterFilterChange();
  }

  void setOnlyInferred(bool value) {
    onlyInferred = value;
    _afterFilterChange();
  }

  void invertCommunities() {
    final all = model.communities.map((c) => c.id).toSet();
    visibleCommunities = all.difference(visibleCommunities);
    _afterFilterChange();
  }

  void invertRelations() {
    final all = model.relations.map((r) => r.name).toSet();
    visibleRelations = all.difference(visibleRelations);
    _afterFilterChange();
  }

  void _afterFilterChange() {
    final s = selected;
    if (s != null && !isNodeVisible(s)) selected = null;
    if (path != null) clearPath();
    notifyListeners();
  }

  // ------------------------------------------------------------- selecție

  void select(GraphNode? n) {
    selected = n;
    notifyListeners();
  }

  void setHovered(GraphNode? n) {
    if (identical(hovered, n)) return;
    hovered = n;
    notifyListeners();
  }

  void togglePin(GraphNode n) {
    if (n.isPinned) {
      n.fixedX = null;
      n.fixedY = null;
      sim.reheat(0.2);
    } else {
      n.fixedX = n.x;
      n.fixedY = n.y;
    }
    notifyListeners();
  }

  // ----------------------------------------------------------------- drum

  void setPathEnd({GraphNode? a, GraphNode? b}) {
    if (a != null) pathA = a;
    if (b != null) pathB = b;
    _computePath();
  }

  void clearPath() {
    pathA = null;
    pathB = null;
    path = null;
    pathMessage = '';
    notifyListeners();
  }

  void _computePath() {
    final a = pathA, b = pathB;
    if (a == null || b == null) {
      path = null;
      pathMessage = '';
      notifyListeners();
      return;
    }
    if (identical(a, b)) {
      path = null;
      pathMessage = 'același nod';
      notifyListeners();
      return;
    }
    final found = Paths.shortest(model, a, b, allow: isLinkVisible);
    path = found;
    pathMessage = found == null
        ? 'fără drum'
        : '${found.steps} ${found.steps == 1 ? 'pas' : 'pași'}';
    notifyListeners();
  }

  // ------------------------------------------------------------ evidențiere

  /// Nodurile și muchiile care rămân aprinse. `null` înseamnă „totul aprins”.
  ({Set<String> nodes, Set<GraphLink> links})? get focus {
    final p = path;
    if (p != null) {
      return (
        nodes: p.nodes.map((n) => n.id).toSet(),
        links: p.links.toSet(),
      );
    }
    final f = hovered ?? selected;
    if (f == null) return null;
    final nodes = <String>{f.id};
    final links = <GraphLink>{};
    for (final edge in model.neighborsOf(f)) {
      if (!isLinkVisible(edge.link)) continue;
      nodes.add(edge.other.id);
      links.add(edge.link);
    }
    return (nodes: nodes, links: links);
  }

  // -------------------------------------------------------------- simulare

  /// Anunță ascultătorii fără să schimbe nimic, pentru cazurile în care starea
  /// s-a modificat pe dinafară, cum e nodul mutat cu degetul.
  void touch() => notifyListeners();

  /// Un pas de simulare. Întoarce `true` cât timp mai are de lucru.
  bool tick() {
    if (!sim.isRunning) return false;
    sim.tick();
    notifyListeners();
    return true;
  }

  void relayout() {
    sim.reset();
    notifyListeners();
  }

  void reheat([double target = 0.4]) => sim.reheat(target);

  // ------------------------------------------------------- transformare

  Offset toScreen(GraphNode n) => Offset(n.x * scale + offset.dx, n.y * scale + offset.dy);

  Offset toWorld(Offset screen) => Offset(
        (screen.dx - offset.dx) / scale,
        (screen.dy - offset.dy) / scale,
      );

  void panBy(Offset delta) {
    offset += delta;
    notifyListeners();
  }

  void zoomAt(Offset focal, double factor) {
    final next = (scale * factor).clamp(0.06, 8.0);
    final ratio = next / scale;
    offset = Offset(
      focal.dx - (focal.dx - offset.dx) * ratio,
      focal.dy - (focal.dy - offset.dy) * ratio,
    );
    scale = next;
    notifyListeners();
  }

  /// Încadrează tot ce e vizibil.
  void fitView(Size size, {double padding = 56}) {
    _fitTo(visibleNodes.toList(), size, padding: padding, maxScale: 3);
  }

  void fitToPath(Size size) {
    final p = path;
    if (p == null || p.nodes.length < 2) return;
    _fitTo(p.nodes, size, padding: 110, maxScale: 2.4);
  }

  void _fitTo(List<GraphNode> group, Size size,
      {required double padding, required double maxScale}) {
    if (group.isEmpty || size.isEmpty) return;
    var minX = double.infinity, minY = double.infinity;
    var maxX = -double.infinity, maxY = -double.infinity;
    for (final n in group) {
      minX = math.min(minX, n.x - n.radius);
      maxX = math.max(maxX, n.x + n.radius);
      minY = math.min(minY, n.y - n.radius);
      maxY = math.max(maxY, n.y + n.radius);
    }
    final spanX = math.max(1.0, maxX - minX);
    final spanY = math.max(1.0, maxY - minY);
    final k = math.min(
      (size.width - padding * 2) / spanX,
      (size.height - padding * 2) / spanY,
    ).clamp(0.05, maxScale);
    scale = k.toDouble();
    offset = Offset(
      size.width / 2 - (minX + maxX) / 2 * scale,
      size.height / 2 - (minY + maxY) / 2 * scale,
    );
    notifyListeners();
  }

  void centerOn(GraphNode n, Size size, {double? zoom}) {
    scale = (zoom ?? math.max(scale, 1.4)).clamp(0.06, 8.0);
    offset = Offset(
      size.width / 2 - n.x * scale,
      size.height / 2 - n.y * scale,
    );
    notifyListeners();
  }

  // ------------------------------------------------------------ interogări

  /// Nodul de sub un punct de pe ecran, dacă există.
  GraphNode? hitTest(Offset screen) {
    final world = toWorld(screen);
    final slack = 7 / scale;
    GraphNode? best;
    var bestDistance = double.infinity;
    for (final n in model.nodes) {
      if (!isNodeVisible(n)) continue;
      final d = math.sqrt(math.pow(n.x - world.dx, 2) + math.pow(n.y - world.dy, 2));
      if (d < n.radius + slack && d < bestDistance) {
        best = n;
        bestDistance = d;
      }
    }
    return best;
  }

  /// Căutare care ignoră diacriticele: „fisiere” găsește „Fișiere”.
  List<GraphNode> search(String query, {int limit = 12}) {
    final q = fold(query.trim());
    if (q.isEmpty) return const [];
    final hits = model.nodes.where((n) => isNodeVisible(n) && n.search.contains(q)).toList();
    hits.sort((a, b) {
      final aStarts = fold(a.label).indexOf(q) == 0 ? 0 : 1;
      final bStarts = fold(b.label).indexOf(q) == 0 ? 0 : 1;
      if (aStarts != bStarts) return aStarts - bStarts;
      if (a.degree != b.degree) return b.degree - a.degree;
      return a.label.length - b.label.length;
    });
    return hits.take(limit).toList();
  }

  List<GraphNode> get hubs {
    final sorted = [...model.nodes]..sort((a, b) => b.degree - a.degree);
    return sorted.take(10).toList();
  }
}
