import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import 'graph_controller.dart';
import 'model/graph.dart';
import 'model/palette.dart';

/// Desenează graful: muchii, noduri, numele comunităților și etichetele
/// nodurilor. Ordinea contează: textul vine ultimul, altfel nodurile îl taie.
class GraphPainter extends CustomPainter {
  GraphPainter({
    required this.controller,
    required this.palette,
    this.fontFamily,
  }) : super(repaint: controller);

  final GraphController controller;
  final Palette palette;

  /// Normal e `null`: fontul implicit al platformei. Testele de imagine îi dau
  /// un font adevărat, fiindcă `flutter_test` desenează altfel doar pătrate.
  final String? fontFamily;

  static const double nodeLabelSize = 11.5;
  static const double communityLabelSize = 10.5;
  static const double haloWidth = 3.5;

  final Map<String, TextPainter> _textCache = {};

  @override
  void paint(Canvas canvas, Size size) {
    final c = controller;
    final k = c.scale;
    final focus = c.focus;
    final visible = c.visibleNodes.toList();

    _paintEdges(canvas, focus, k);
    _paintNodes(canvas, visible, focus, k);
    _paintSelectionRings(canvas, k);

    final reserved = _paintCommunityLabels(canvas, size, visible, focus);
    _paintNodeLabels(canvas, size, visible, focus, k, reserved);
  }

  // ------------------------------------------------------------------ muchii

  void _paintEdges(
    Canvas canvas,
    ({Set<String> nodes, Set<GraphLink> links})? focus,
    double k,
  ) {
    final c = controller;
    final dim = focus != null;

    final plain = Path();
    final dashed = <GraphLink>[];
    final strong = <GraphLink>[];

    for (final l in c.model.links) {
      if (!c.isLinkVisible(l)) continue;
      if (focus != null && focus.links.contains(l)) {
        strong.add(l);
        continue;
      }
      if (l.inferred) {
        dashed.add(l);
        continue;
      }
      final a = c.toScreen(l.source), b = c.toScreen(l.target);
      plain.moveTo(a.dx, a.dy);
      plain.lineTo(b.dx, b.dy);
    }

    final base = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = math.max(0.6, 1 * k)
      ..color = palette.rule.withValues(alpha: dim ? 0.10 : 0.34);

    canvas.drawPath(plain, base);

    // Legăturile deduse se desenează întrerupt, ca să nu treacă drept fapt.
    for (final l in dashed) {
      _dashedLine(canvas, c.toScreen(l.source), c.toScreen(l.target), base, 4 * k);
    }

    for (final l in strong) {
      _strongLink(canvas, l, k);
    }
  }

  void _dashedLine(Canvas canvas, Offset a, Offset b, Paint paint, double dash) {
    final total = (b - a).distance;
    if (total <= 0 || dash <= 0) return;
    final dir = (b - a) / total;
    var t = 0.0;
    while (t < total) {
      final end = math.min(t + dash, total);
      canvas.drawLine(a + dir * t, a + dir * end, paint);
      t = end + dash;
    }
  }

  void _strongLink(Canvas canvas, GraphLink l, double k) {
    final onPath = controller.path != null;
    final color = onPath ? palette.accent : palette.ink2;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = math.max(1.5, (onPath ? 2.6 : 1.9) * k)
      ..color = color;

    final a = controller.toScreen(l.source);
    final b = controller.toScreen(l.target);
    if (l.inferred) {
      _dashedLine(canvas, a, b, paint, 4 * k);
    } else {
      canvas.drawLine(a, b, paint);
    }

    // Vârf de săgeată: direcția contează pentru „contains” și „calls”.
    final delta = b - a;
    final d = delta.distance;
    if (d <= 14) return;
    final u = delta / d;
    final back = math.max(2.0, l.target.radius * k) + 3;
    final tip = b - u * back;
    final size = (6 * k).clamp(5.0, 11.0);
    final normal = Offset(-u.dy, u.dx);
    final head = Path()
      ..moveTo(tip.dx, tip.dy)
      ..lineTo(tip.dx - u.dx * size + normal.dx * size * 0.5,
          tip.dy - u.dy * size + normal.dy * size * 0.5)
      ..lineTo(tip.dx - u.dx * size - normal.dx * size * 0.5,
          tip.dy - u.dy * size - normal.dy * size * 0.5)
      ..close();
    canvas.drawPath(head, Paint()..color = color);
  }

  // ------------------------------------------------------------------ noduri

  void _paintNodes(
    Canvas canvas,
    List<GraphNode> visible,
    ({Set<String> nodes, Set<GraphLink> links})? focus,
    double k,
  ) {
    final ring = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = math.max(1.0, 1.4 * k)
      ..color = palette.surface;

    for (final n in visible) {
      final lit = focus == null || focus.nodes.contains(n.id);
      final p = controller.toScreen(n);
      final r = math.max(2.0, n.radius * k);
      final community = controller.model.communityOf(n);
      final color = palette.forSlot(community?.slot ?? -1);

      canvas.drawCircle(p, r, Paint()..color = color.withValues(alpha: lit ? 1 : 0.18));
      // Inelul pe culoarea pânzei separă nodurile suprapuse.
      canvas.drawCircle(p, r, ring..color = palette.surface.withValues(alpha: lit ? 1 : 0.18));

      // Documentele și conceptele au miezul gol, ca să se distingă fără culoare.
      if (n.kind != 'code') {
        canvas.drawCircle(
          p,
          math.max(1.0, r * 0.42),
          Paint()..color = palette.surface.withValues(alpha: lit ? 1 : 0.18),
        );
      }
    }
  }

  void _paintSelectionRings(Canvas canvas, double k) {
    final marked = <GraphNode?>[controller.selected, controller.pathA, controller.pathB];
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..color = palette.accent;
    for (final n in marked) {
      if (n == null || !controller.isNodeVisible(n)) continue;
      canvas.drawCircle(controller.toScreen(n), math.max(2.0, n.radius * k) + 4, paint);
    }
  }

  // ----------------------------------------------------------------- etichete

  TextPainter _label(String text, double size, FontWeight weight, Color color,
      {bool halo = false, double letterSpacing = 0}) {
    final key = '$text|$size|${weight.value}|${color.toARGB32()}|$halo|$letterSpacing';
    return _textCache.putIfAbsent(key, () {
      final style = TextStyle(
        fontFamily: fontFamily,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: letterSpacing,
        height: 1,
        foreground: halo
            ? (Paint()
              ..style = PaintingStyle.stroke
              ..strokeJoin = StrokeJoin.round
              ..strokeWidth = haloWidth
              ..color = color)
            : (Paint()..color = color),
      );
      final tp = TextPainter(
        text: TextSpan(text: text, style: style),
        textDirection: TextDirection.ltr,
      )..layout();
      return tp;
    });
  }

  void _drawHaloText(Canvas canvas, String text, Offset at, double size,
      FontWeight weight, Color color, {double letterSpacing = 0}) {
    _label(text, size, weight, palette.surface, halo: true, letterSpacing: letterSpacing)
        .paint(canvas, at);
    _label(text, size, weight, color, letterSpacing: letterSpacing).paint(canvas, at);
  }

  /// Numele comunității, așezat DEASUPRA norului ei de noduri, nu peste el.
  /// Ăsta e canalul secundar de identitate: pe fundal deschis, trei culori din
  /// paletă au contrast sub 3:1, deci identitatea nu se poate sprijini pe ele.
  /// Întoarce dreptunghiurile ocupate, ca etichetele nodurilor să le ocolească.
  List<Rect> _paintCommunityLabels(
    Canvas canvas,
    Size size,
    List<GraphNode> visible,
    ({Set<String> nodes, Set<GraphLink> links})? focus,
  ) {
    if (focus != null || visible.length < 6) return const [];

    final groups = <int, _Cluster>{};
    for (final n in visible) {
      final g = groups.putIfAbsent(n.community, () => _Cluster(controller.model.communityOf(n)));
      g.add(n);
    }

    // Comunitățile mari își aleg locul primele.
    final ordered = groups.values.where((g) => g.count >= 2 && g.community != null).toList()
      ..sort((a, b) => b.count.compareTo(a.count));

    final boxes = <Rect>[];
    for (final g in ordered) {
      final x = (g.minX + g.maxX) / 2 * controller.scale + controller.offset.dx;
      final y = g.minY * controller.scale + controller.offset.dy - 13;
      if (x < -80 || x > size.width + 80 || y < -20 || y > size.height + 20) continue;

      final text = g.community!.name.toUpperCase();
      final tp = _label(text, communityLabelSize, FontWeight.w600, palette.muted,
          letterSpacing: 0.4);
      final box = Rect.fromLTWH(x - tp.width / 2 - 5, y - 9, tp.width + 10, 18);
      if (boxes.any(box.overlaps)) continue;
      boxes.add(box);

      _drawHaloText(canvas, text, Offset(x - tp.width / 2, y - tp.height / 2),
          communityLabelSize, FontWeight.w600, palette.muted, letterSpacing: 0.4);
    }
    return boxes;
  }

  /// Etichetele nodurilor. Cele mai conectate au prioritate; fiecare încearcă
  /// patru poziții și e sărită dacă n-are loc; mai puține, dar lizibile.
  void _paintNodeLabels(
    Canvas canvas,
    Size size,
    List<GraphNode> visible,
    ({Set<String> nodes, Set<GraphLink> links})? focus,
    double k,
    List<Rect> reserved,
  ) {
    final candidates = focus != null
        ? visible.where((n) => focus.nodes.contains(n.id)).toList()
        : visible.where((n) => n.degree >= 2 || k > 1.6).toList();
    candidates.sort((a, b) => b.degree - a.degree);
    final limit = focus != null ? 40 : 34;

    final taken = <Rect>[...reserved];

    // Bulinele înseși sunt obstacole: o etichetă peste un nod se citește greu.
    final blockers = <Rect>[];
    for (final n in visible) {
      final p = controller.toScreen(n);
      final r = math.max(2.0, n.radius * k) + 1;
      if (p.dx < -80 || p.dx > size.width + 80 || p.dy < -30 || p.dy > size.height + 30) {
        continue;
      }
      blockers.add(Rect.fromCircle(center: p, radius: r));
    }

    var drawn = 0;
    for (final n in candidates) {
      if (drawn >= limit) break;
      final p = controller.toScreen(n);
      if (p.dx < -60 || p.dx > size.width + 60 || p.dy < -20 || p.dy > size.height + 20) {
        continue;
      }
      final isFocused = identical(n, controller.hovered) || identical(n, controller.selected);
      final color = isFocused ? palette.ink : palette.ink2;
      final tp = _label(n.label, nodeLabelSize, FontWeight.w500, color);
      final w = tp.width, h = tp.height;
      final pad = math.max(2.0, n.radius * k) + 5;

      // Dreapta, stânga, dedesubt, deasupra; prima poziție liberă câștigă.
      final spots = <Offset>[
        Offset(p.dx + pad, p.dy - h / 2),
        Offset(p.dx - pad - w, p.dy - h / 2),
        Offset(p.dx - w / 2, p.dy + pad + 1),
        Offset(p.dx - w / 2, p.dy - pad - h - 1),
      ];

      Offset? chosen;
      Rect? chosenBox;
      for (final spot in spots) {
        final box = Rect.fromLTWH(spot.dx - 2, spot.dy - 2, w + 4, h + 4);
        if (taken.any(box.overlaps) || blockers.any(box.overlaps)) continue;
        chosen = spot;
        chosenBox = box;
        break;
      }
      if (chosen == null) continue;

      taken.add(chosenBox!);
      drawn++;
      _drawHaloText(canvas, n.label, chosen, nodeLabelSize, FontWeight.w500, color);
    }
  }

  @override
  bool shouldRepaint(covariant GraphPainter old) =>
      old.palette != palette || old.controller != controller;
}

/// Cutia din jurul nodurilor vizibile ale unei comunități.
class _Cluster {
  _Cluster(this.community);

  final Community? community;
  double minX = double.infinity;
  double maxX = -double.infinity;
  double minY = double.infinity;
  int count = 0;

  void add(GraphNode n) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y - n.radius < minY) minY = n.y - n.radius;
    count++;
  }
}

/// Ajutor pentru testele de imagine: randează graful într-o imagine, fără
/// widget-uri, ca aranjamentul să poată fi privit efectiv.
Future<ui.Image> renderGraphToImage(
  GraphController controller,
  Palette palette,
  Size size, {
  String? fontFamily,
}) async {
  final recorder = ui.PictureRecorder();
  final canvas = Canvas(recorder, Offset.zero & size);
  canvas.drawRect(Offset.zero & size, Paint()..color = palette.surface);
  GraphPainter(controller: controller, palette: palette, fontFamily: fontFamily)
      .paint(canvas, size);
  final picture = recorder.endRecording();
  return picture.toImage(size.width.round(), size.height.round());
}
