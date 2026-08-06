import 'package:flutter/material.dart';

import 'graph_controller.dart';
import 'model/graph.dart';
import 'model/palette.dart';

const Map<String, String> kindLabels = {
  'code': 'cod',
  'document': 'document',
  'concept': 'concept',
};

/// Panoul din stânga: statistici, legendă, filtre și noduri-hub.
class FiltersPanel extends StatelessWidget {
  const FiltersPanel({
    super.key,
    required this.controller,
    required this.palette,
    required this.onFocusNode,
  });

  final GraphController controller;
  final Palette palette;
  final ValueChanged<GraphNode> onFocusNode;

  @override
  Widget build(BuildContext context) {
    final model = controller.model;
    return Container(
      color: palette.surface,
      child: ListView(
        padding: const EdgeInsets.only(bottom: 24),
        children: [
          _Block(
            palette: palette,
            title: 'Graful',
            children: [
              _Stats(model: model, palette: palette),
              if (model.commit.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    'construit din commit ${model.commit}',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontFamily: 'monospace',
                      color: palette.muted,
                    ),
                  ),
                ),
            ],
          ),
          _Block(
            palette: palette,
            title: 'Comunități',
            action: _MiniButton(
              label: 'inversează',
              palette: palette,
              onPressed: controller.invertCommunities,
            ),
            children: [
              for (final c in model.communities)
                _CheckRow(
                  palette: palette,
                  value: controller.visibleCommunities.contains(c.id),
                  swatch: palette.forSlot(c.slot),
                  label: c.isOther ? '${c.name} (Altele)' : c.name,
                  count: c.count,
                  onChanged: (v) => controller.toggleCommunity(c.id, v),
                ),
              Padding(
                padding: const EdgeInsets.only(top: 8, bottom: 4),
                child: Text(
                  'Culorile merg la primele 8 comunități ca mărime; restul intră în '
                  'Altele. Numele fiecărui grup e scris și pe hartă.',
                  style: TextStyle(fontSize: 11.5, height: 1.45, color: palette.muted),
                ),
              ),
            ],
          ),
          _Block(
            palette: palette,
            title: 'Relații',
            action: _MiniButton(
              label: 'inversează',
              palette: palette,
              onPressed: controller.invertRelations,
            ),
            children: [
              for (final r in model.relations)
                _CheckRow(
                  palette: palette,
                  value: controller.visibleRelations.contains(r.name),
                  label: r.name,
                  count: r.count,
                  onChanged: (v) => controller.toggleRelation(r.name, v),
                ),
              _CheckRow(
                palette: palette,
                value: controller.onlyInferred,
                label: 'doar legături deduse',
                onChanged: controller.setOnlyInferred,
              ),
            ],
          ),
          _Block(
            palette: palette,
            title: 'Tip de nod',
            children: [
              for (final k in model.kinds)
                _CheckRow(
                  palette: palette,
                  value: controller.visibleKinds.contains(k.name),
                  label: kindLabels[k.name] ?? k.name,
                  count: k.count,
                  onChanged: (v) => controller.toggleKind(k.name, v),
                ),
            ],
          ),
          _Block(
            palette: palette,
            title: 'Noduri-hub',
            children: [
              for (final (i, n) in controller.hubs.indexed)
                _HubRow(
                  palette: palette,
                  rank: i + 1,
                  node: n,
                  onTap: () => onFocusNode(n),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Stats extends StatelessWidget {
  const _Stats({required this.model, required this.palette});

  final GraphModel model;
  final Palette palette;

  @override
  Widget build(BuildContext context) {
    final strong = TextStyle(
      fontSize: 13,
      color: palette.ink,
      fontWeight: FontWeight.w600,
      fontFeatures: const [FontFeature.tabularFigures()],
    );
    final soft = TextStyle(fontSize: 13, color: palette.ink2);
    return Text.rich(
      TextSpan(children: [
        TextSpan(text: '${model.nodes.length}', style: strong),
        TextSpan(text: ' noduri · ', style: soft),
        TextSpan(text: '${model.links.length}', style: strong),
        TextSpan(text: ' muchii · ', style: soft),
        TextSpan(text: '${model.communities.length}', style: strong),
        TextSpan(text: ' comunități', style: soft),
      ]),
    );
  }
}

/// Panoul din dreapta: tot ce știm despre nodul ales.
class DetailsPanel extends StatelessWidget {
  const DetailsPanel({
    super.key,
    required this.controller,
    required this.palette,
    required this.node,
    required this.onClose,
    required this.onFocusNode,
  });

  final GraphController controller;
  final Palette palette;
  final GraphNode node;
  final VoidCallback onClose;
  final ValueChanged<GraphNode> onFocusNode;

  @override
  Widget build(BuildContext context) {
    final community = controller.model.communityOf(node);
    final neighbors = controller.model
        .neighborsOf(node)
        .where((n) => controller.isLinkVisible(n.link))
        .toList();

    final grouped = <String, List<Neighbor>>{};
    for (final n in neighbors) {
      grouped.putIfAbsent(n.link.relation, () => []).add(n);
    }
    final groups = grouped.entries.toList()
      ..sort((a, b) => b.value.length.compareTo(a.value.length));

    return Container(
      color: palette.surface,
      child: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 42, 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      node.label,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        height: 1.3,
                        color: palette.ink,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(spacing: 6, runSpacing: 6, children: [
                      _Badge(palette: palette, text: kindLabels[node.kind] ?? node.kind),
                      if (community != null)
                        _Badge(
                          palette: palette,
                          text: community.name,
                          dot: palette.forSlot(community.slot),
                        ),
                      if (node.isPinned) _Badge(palette: palette, text: 'pironit'),
                    ]),
                  ],
                ),
              ),
              Divider(height: 1, color: palette.ink.withValues(alpha: 0.10)),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                child: Column(children: [
                  if (node.where.isNotEmpty)
                    _Fact(palette: palette, label: 'Fișier', value: node.where, mono: true),
                  _Fact(palette: palette, label: 'Legături', value: '${node.degree}'),
                  if (node.origin.isNotEmpty)
                    _Fact(palette: palette, label: 'Origine', value: node.origin),
                  _Fact(palette: palette, label: 'Identificator', value: node.id, mono: true),
                ]),
              ),
              Divider(height: 1, color: palette.ink.withValues(alpha: 0.10)),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                child: Wrap(spacing: 6, runSpacing: 6, children: [
                  _MiniButton(
                    palette: palette,
                    label: node.isPinned ? 'eliberează' : 'pironește',
                    onPressed: () => controller.togglePin(node),
                  ),
                  _MiniButton(
                    palette: palette,
                    label: 'pune ca A',
                    onPressed: () => controller.setPathEnd(a: node),
                  ),
                  _MiniButton(
                    palette: palette,
                    label: 'pune ca B',
                    onPressed: () => controller.setPathEnd(b: node),
                  ),
                  _MiniButton(
                    palette: palette,
                    label: 'centrează',
                    onPressed: () => onFocusNode(node),
                  ),
                ]),
              ),
              if (neighbors.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    'Nicio legătură vizibilă cu filtrele curente.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: palette.muted),
                  ),
                ),
              for (final group in groups) ...[
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  child: _SectionTitle(
                    palette: palette,
                    text: '${group.key} · ${group.value.length}',
                  ),
                ),
                for (final n in group.value..sort((a, b) => b.other.degree - a.other.degree))
                  _NeighborRow(
                    palette: palette,
                    neighbor: n,
                    swatch: palette.forSlot(controller.model.communityOf(n.other)?.slot ?? -1),
                    onTap: () => onFocusNode(n.other),
                  ),
              ],
            ],
          ),
          Positioned(
            top: 8,
            right: 8,
            child: IconButton(
              icon: const Icon(Icons.close, size: 20),
              color: palette.muted,
              onPressed: onClose,
              tooltip: 'Închide',
            ),
          ),
        ],
      ),
    );
  }
}

// ------------------------------------------------------------- piese comune

class _Block extends StatelessWidget {
  const _Block({
    required this.palette,
    required this.title,
    required this.children,
    this.action,
  });

  final Palette palette;
  final String title;
  final List<Widget> children;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: palette.ink.withValues(alpha: 0.10))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: _SectionTitle(palette: palette, text: title)),
              ?action,
            ],
          ),
          const SizedBox(height: 8),
          ...children,
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.palette, required this.text});

  final Palette palette;
  final String text;

  @override
  Widget build(BuildContext context) => Text(
        text.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.8,
          color: palette.muted,
        ),
      );
}

class _CheckRow extends StatelessWidget {
  const _CheckRow({
    required this.palette,
    required this.value,
    required this.label,
    required this.onChanged,
    this.swatch,
    this.count,
  });

  final Palette palette;
  final bool value;
  final String label;
  final ValueChanged<bool> onChanged;
  final Color? swatch;
  final int? count;

  @override
  Widget build(BuildContext context) {
    final dimmed = value ? 1.0 : 0.45;
    return InkWell(
      onTap: () => onChanged(!value),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 3, horizontal: 4),
        child: Row(children: [
          SizedBox(
            width: 18,
            height: 18,
            child: Checkbox(
              value: value,
              onChanged: (v) => onChanged(v ?? false),
              visualDensity: VisualDensity.compact,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              activeColor: palette.accent,
            ),
          ),
          const SizedBox(width: 10),
          if (swatch != null) ...[
            Container(
              width: 11,
              height: 11,
              decoration: BoxDecoration(
                color: swatch,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Expanded(
            child: Opacity(
              opacity: dimmed,
              child: Text(
                label,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: 13, color: palette.ink),
              ),
            ),
          ),
          if (count != null)
            Opacity(
              opacity: dimmed,
              child: Text(
                '$count',
                style: TextStyle(
                  fontSize: 11.5,
                  color: palette.muted,
                  fontFeatures: const [FontFeature.tabularFigures()],
                ),
              ),
            ),
        ]),
      ),
    );
  }
}

class _HubRow extends StatelessWidget {
  const _HubRow({
    required this.palette,
    required this.rank,
    required this.node,
    required this.onTap,
  });

  final Palette palette;
  final int rank;
  final GraphNode node;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
        child: Row(children: [
          SizedBox(
            width: 16,
            child: Text(
              '$rank',
              style: TextStyle(fontSize: 11, color: palette.muted),
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              node.label,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 13, color: palette.ink),
            ),
          ),
          Text(
            '${node.degree}',
            style: TextStyle(
              fontSize: 11.5,
              color: palette.muted,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ]),
      ),
    );
  }
}

class _NeighborRow extends StatelessWidget {
  const _NeighborRow({
    required this.palette,
    required this.neighbor,
    required this.swatch,
    required this.onTap,
  });

  final Palette palette;
  final Neighbor neighbor;
  final Color swatch;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final link = neighbor.link;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        child: Row(children: [
          SizedBox(
            width: 14,
            child: Text(
              neighbor.outgoing ? '→' : '←',
              style: TextStyle(fontSize: 12, color: palette.muted),
            ),
          ),
          const SizedBox(width: 6),
          Container(
            width: 11,
            height: 11,
            decoration: BoxDecoration(color: swatch, borderRadius: BorderRadius.circular(3)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              neighbor.other.label,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 13, color: palette.ink),
            ),
          ),
          if (link.inferred)
            _Tag(palette: palette, text: 'dedus', dashed: true)
          else if (link.context.isNotEmpty)
            _Tag(palette: palette, text: link.context),
        ]),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({required this.palette, required this.text, this.dashed = false});

  final Palette palette;
  final String text;
  final bool dashed;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
        decoration: BoxDecoration(
          color: palette.ink.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(4),
          border: dashed ? Border.all(color: palette.rule) : null,
        ),
        child: Text(
          text,
          style: TextStyle(fontSize: 10.5, fontFamily: 'monospace', color: palette.muted),
        ),
      );
}

class _Badge extends StatelessWidget {
  const _Badge({required this.palette, required this.text, this.dot});

  final Palette palette;
  final String text;
  final Color? dot;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
        decoration: BoxDecoration(
          color: palette.ink.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: palette.ink.withValues(alpha: 0.10)),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          if (dot != null) ...[
            Container(
              width: 7,
              height: 7,
              decoration: BoxDecoration(color: dot, shape: BoxShape.circle),
            ),
            const SizedBox(width: 5),
          ],
          Text(
            text,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: palette.ink2),
          ),
        ]),
      );
}

class _Fact extends StatelessWidget {
  const _Fact({
    required this.palette,
    required this.label,
    required this.value,
    this.mono = false,
  });

  final Palette palette;
  final String label;
  final String value;
  final bool mono;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(
            width: 88,
            child: Text(label, style: TextStyle(fontSize: 13, color: palette.muted)),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: mono ? 12.5 : 13,
                fontFamily: mono ? 'monospace' : null,
                color: palette.ink,
              ),
            ),
          ),
        ]),
      );
}

class _MiniButton extends StatelessWidget {
  const _MiniButton({
    required this.palette,
    required this.label,
    required this.onPressed,
  });

  final Palette palette;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
          decoration: BoxDecoration(
            color: palette.ink.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: palette.ink.withValues(alpha: 0.10)),
          ),
          child: Text(
            label,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: palette.ink2),
          ),
        ),
      );
}
