import 'dart:math' as math;

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import 'graph_controller.dart';
import 'graph_painter.dart';
import 'model/graph.dart';
import 'model/palette.dart';

/// Pânza grafului: desen, tras, panoramare, zoom și indiciul de sub cursor.
class GraphView extends StatefulWidget {
  const GraphView({
    super.key,
    required this.controller,
    required this.palette,
    this.onNodeTap,
  });

  final GraphController controller;
  final Palette palette;
  final ValueChanged<GraphNode?>? onNodeTap;

  @override
  State<GraphView> createState() => GraphViewState();
}

class GraphViewState extends State<GraphView> with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  GraphNode? _dragging;
  double _lastScale = 1;
  double _movedSinceDown = 0;
  Offset? _tooltipAt;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker(_onFrame);
    widget.controller.addListener(_maybeStartTicking);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_maybeStartTicking);
    _ticker.dispose();
    super.dispose();
  }

  void _onFrame(Duration _) {
    if (!widget.controller.tick()) _ticker.stop();
  }

  void _maybeStartTicking() {
    if (widget.controller.sim.isRunning && !_ticker.isActive) _ticker.start();
  }

  /// Repornește simularea și asigură-te că e cineva care o avansează.
  void kick([double target = 0.4]) {
    widget.controller.reheat(target);
    if (!_ticker.isActive) _ticker.start();
  }

  Size get _size {
    final box = context.findRenderObject() as RenderBox?;
    return box?.size ?? Size.zero;
  }

  // ------------------------------------------------------------- gesturi

  void _onScaleStart(ScaleStartDetails d) {
    _lastScale = 1;
    _movedSinceDown = 0;
    final hit = widget.controller.hitTest(d.localFocalPoint);
    if (hit != null) {
      _dragging = hit;
      hit.fixedX = hit.x;
      hit.fixedY = hit.y;
      kick(0.3);
    }
  }

  void _onScaleUpdate(ScaleUpdateDetails d) {
    _movedSinceDown += d.focalPointDelta.distance;
    final node = _dragging;
    if (node != null) {
      final world = widget.controller.toWorld(d.localFocalPoint);
      node.fixedX = world.dx;
      node.fixedY = world.dy;
      widget.controller.touch();
      return;
    }
    if (d.scale != 1) {
      widget.controller.zoomAt(d.localFocalPoint, d.scale / _lastScale);
      _lastScale = d.scale;
    }
    if (d.focalPointDelta != Offset.zero) {
      widget.controller.panBy(d.focalPointDelta);
    }
  }

  void _onScaleEnd(ScaleEndDetails d) {
    final node = _dragging;
    if (node != null) {
      // Un simplu tap nu pironește nodul; o tragere adevărată, da.
      if (_movedSinceDown < 4) {
        node.fixedX = null;
        node.fixedY = null;
      } else {
        kick(0.1);
      }
      _dragging = null;
    }
  }

  void _onTapUp(TapUpDetails d) {
    final hit = widget.controller.hitTest(d.localPosition);
    widget.controller.select(hit);
    widget.onNodeTap?.call(hit);
  }

  void _onHover(PointerHoverEvent e) {
    final hit = widget.controller.hitTest(e.localPosition);
    widget.controller.setHovered(hit);
    setState(() => _tooltipAt = hit == null ? null : e.localPosition);
  }

  void _onSignal(PointerSignalEvent e) {
    if (e is! PointerScrollEvent) return;
    widget.controller.zoomAt(e.localPosition, math.pow(0.999, e.scrollDelta.dy).toDouble());
  }

  // -------------------------------------------------------------- construire

  @override
  Widget build(BuildContext context) {
    final hovered = widget.controller.hovered;

    return MouseRegion(
      cursor: hovered != null ? SystemMouseCursors.click : SystemMouseCursors.grab,
      onHover: _onHover,
      onExit: (_) {
        widget.controller.setHovered(null);
        setState(() => _tooltipAt = null);
      },
      child: Listener(
        onPointerSignal: _onSignal,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapUp: _onTapUp,
          onScaleStart: _onScaleStart,
          onScaleUpdate: _onScaleUpdate,
          onScaleEnd: _onScaleEnd,
          child: Stack(
            children: [
              Positioned.fill(
                child: CustomPaint(
                  painter: GraphPainter(
                    controller: widget.controller,
                    palette: widget.palette,
                  ),
                  isComplex: true,
                  willChange: true,
                ),
              ),
              if (hovered != null && _tooltipAt != null)
                _Tooltip(node: hovered, at: _tooltipAt!, palette: widget.palette),
            ],
          ),
        ),
      ),
    );
  }

  /// Încadrează tot ce e vizibil, cu dimensiunea reală a pânzei.
  void fit() => widget.controller.fitView(_size);

  void centerOn(GraphNode n, {double? zoom}) =>
      widget.controller.centerOn(n, _size, zoom: zoom);

  void fitToPath() => widget.controller.fitToPath(_size);
}

class _Tooltip extends StatelessWidget {
  const _Tooltip({required this.node, required this.at, required this.palette});

  final GraphNode node;
  final Offset at;
  final Palette palette;

  @override
  Widget build(BuildContext context) {
    final where = node.where;
    final text = '${node.label} · ${node.degree} legături${where.isEmpty ? '' : ' · $where'}';
    return Positioned(
      left: at.dx,
      top: at.dy - 16,
      child: FractionalTranslation(
        translation: const Offset(-0.5, -1),
        child: IgnorePointer(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: palette.surface,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: palette.ink.withValues(alpha: 0.10)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.18),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Text(
              text,
              style: TextStyle(fontSize: 12.5, color: palette.ink),
            ),
          ),
        ),
      ),
    );
  }
}
