import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'graph_controller.dart';
import 'graph_view.dart';
import 'model/graph.dart';
import 'model/palette.dart';
import 'panels.dart';

void main() {
  runApp(const GrafApp());
}

class GrafApp extends StatefulWidget {
  const GrafApp({super.key, this.controller});

  /// Când e dat, aplicația îl folosește direct în loc să citească
  /// `assets/graph.json`. Testele îl injectează: în zona de fake-async a lui
  /// `flutter_test`, citirea din `rootBundle` nu se termină niciodată.
  final GraphController? controller;

  @override
  State<GrafApp> createState() => _GrafAppState();
}

class _GrafAppState extends State<GrafApp> {
  ThemeMode _mode = ThemeMode.dark;

  void _toggleTheme() {
    setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark);
  }

  ThemeData _theme(Palette p, Brightness brightness) {
    return ThemeData(
      brightness: brightness,
      scaffoldBackgroundColor: p.plane,
      colorScheme: ColorScheme.fromSeed(
        seedColor: p.accent,
        brightness: brightness,
        surface: p.surface,
      ),
      useMaterial3: true,
      splashFactory: InkSparkle.splashFactory,
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Explorator de graf',
      debugShowCheckedModeBanner: false,
      themeMode: _mode,
      theme: _theme(Palette.light, Brightness.light),
      darkTheme: _theme(Palette.dark, Brightness.dark),
      home: HomePage(onToggleTheme: _toggleTheme, controller: widget.controller),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.onToggleTheme, this.controller});

  final VoidCallback onToggleTheme;
  final GraphController? controller;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _viewKey = GlobalKey<GraphViewState>();
  final _searchController = TextEditingController();
  final _searchFocus = FocusNode();
  final _scaffoldKey = GlobalKey<ScaffoldState>();

  GraphController? _controller;
  String? _error;
  List<GraphNode> _results = const [];

  @override
  void initState() {
    super.initState();
    final injected = widget.controller;
    if (injected != null) {
      _attach(injected);
    } else {
      _load();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocus.dispose();
    // Controllerul injectat aparține celui care l-a dat.
    if (widget.controller == null) _controller?.dispose();
    super.dispose();
  }

  void _attach(GraphController controller) {
    controller.addListener(_onControllerChanged);
    _controller = controller;
    // Încadrarea are nevoie de dimensiunea reală a pânzei, deci abia după primul cadru.
    WidgetsBinding.instance.addPostFrameCallback((_) => _viewKey.currentState?.fit());
  }

  void _onControllerChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _load() async {
    try {
      final raw = await rootBundle.loadString('assets/graph.json');
      final model = GraphModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      setState(() => _attach(GraphController(model)));
    } catch (e) {
      setState(() => _error = '$e');
    }
  }

  // ----------------------------------------------------------------- acțiuni

  void _focusNode(GraphNode n) {
    _controller?.select(n);
    _viewKey.currentState?.centerOn(n);
    _clearSearch();
  }

  void _clearSearch() {
    _searchController.clear();
    setState(() => _results = const []);
  }

  void _onSearchChanged(String value) {
    final c = _controller;
    setState(() => _results = c == null ? const [] : c.search(value));
  }

  void _relayout() {
    _controller?.relayout();
    _viewKey.currentState?.kick(1);
    // Lasă simularea să se așeze, apoi încadrează.
    Future.delayed(const Duration(milliseconds: 900), () {
      if (mounted) _viewKey.currentState?.fit();
    });
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;
    if (_searchFocus.hasFocus) {
      if (event.logicalKey == LogicalKeyboardKey.escape) {
        _clearSearch();
        _searchFocus.unfocus();
        return KeyEventResult.handled;
      }
      return KeyEventResult.ignored;
    }
    final c = _controller;
    switch (event.logicalKey) {
      case LogicalKeyboardKey.slash:
        _searchFocus.requestFocus();
        return KeyEventResult.handled;
      case LogicalKeyboardKey.escape:
        c?.select(null);
        c?.clearPath();
        _clearSearch();
        return KeyEventResult.handled;
      case LogicalKeyboardKey.keyF:
        _viewKey.currentState?.fit();
        return KeyEventResult.handled;
      case LogicalKeyboardKey.keyR:
        _relayout();
        return KeyEventResult.handled;
      case LogicalKeyboardKey.keyT:
        widget.onToggleTheme();
        return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  // -------------------------------------------------------------- construire

  @override
  Widget build(BuildContext context) {
    final palette = Palette.of(Theme.of(context).brightness);
    final c = _controller;

    if (_error != null) {
      return Scaffold(
        backgroundColor: palette.surface,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Text(
              'Nu am putut citi assets/graph.json.\n$_error',
              textAlign: TextAlign.center,
              style: TextStyle(color: palette.ink2),
            ),
          ),
        ),
      );
    }
    if (c == null) {
      return Scaffold(
        backgroundColor: palette.surface,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Focus(
      autofocus: true,
      onKeyEvent: _onKey,
      child: LayoutBuilder(builder: (context, constraints) {
        final wide = constraints.maxWidth >= 900;
        return Scaffold(
          key: _scaffoldKey,
          backgroundColor: palette.plane,
          drawer: wide
              ? null
              : Drawer(
                  width: 280,
                  child: FiltersPanel(
                    controller: c,
                    palette: palette,
                    onFocusNode: (n) {
                      Navigator.of(context).pop();
                      _focusNode(n);
                    },
                  ),
                ),
          body: Column(children: [
            _TopBar(
              palette: palette,
              controller: c,
              searchController: _searchController,
              searchFocus: _searchFocus,
              onSearchChanged: _onSearchChanged,
              onMenu: wide ? null : () => _scaffoldKey.currentState?.openDrawer(),
              onFit: () => _viewKey.currentState?.fit(),
              onRelayout: _relayout,
              onToggleTheme: widget.onToggleTheme,
            ),
            Expanded(
              child: Row(children: [
                if (wide)
                  SizedBox(
                    width: 250,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        border: Border(
                          right: BorderSide(color: palette.ink.withValues(alpha: 0.10)),
                        ),
                      ),
                      child: FiltersPanel(
                        controller: c,
                        palette: palette,
                        onFocusNode: _focusNode,
                      ),
                    ),
                  ),
                Expanded(
                  child: Stack(children: [
                    Positioned.fill(
                      child: ColoredBox(
                        color: palette.surface,
                        child: GraphView(
                          key: _viewKey,
                          controller: c,
                          palette: palette,
                        ),
                      ),
                    ),
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 12,
                      child: Center(
                        child: _PathBar(
                          palette: palette,
                          controller: c,
                          onFitPath: () => _viewKey.currentState?.fitToPath(),
                        ),
                      ),
                    ),
                    if (_results.isNotEmpty)
                      Positioned(
                        top: 8,
                        left: 0,
                        right: 0,
                        child: Center(
                          child: _SearchResults(
                            palette: palette,
                            controller: c,
                            results: _results,
                            onPick: _focusNode,
                          ),
                        ),
                      ),
                    if (!wide && c.selected != null)
                      Positioned(
                        left: 0,
                        right: 0,
                        bottom: 0,
                        child: ConstrainedBox(
                          constraints: BoxConstraints(
                            maxHeight: constraints.maxHeight * 0.6,
                          ),
                          child: ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                            child: DetailsPanel(
                              controller: c,
                              palette: palette,
                              node: c.selected!,
                              onClose: () => c.select(null),
                              onFocusNode: _focusNode,
                            ),
                          ),
                        ),
                      ),
                  ]),
                ),
                if (wide && c.selected != null)
                  SizedBox(
                    width: 300,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        border: Border(
                          left: BorderSide(color: palette.ink.withValues(alpha: 0.10)),
                        ),
                      ),
                      child: DetailsPanel(
                        controller: c,
                        palette: palette,
                        node: c.selected!,
                        onClose: () => c.select(null),
                        onFocusNode: _focusNode,
                      ),
                    ),
                  ),
              ]),
            ),
          ]),
        );
      }),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.palette,
    required this.controller,
    required this.searchController,
    required this.searchFocus,
    required this.onSearchChanged,
    required this.onFit,
    required this.onRelayout,
    required this.onToggleTheme,
    this.onMenu,
  });

  final Palette palette;
  final GraphController controller;
  final TextEditingController searchController;
  final FocusNode searchFocus;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onFit;
  final VoidCallback onRelayout;
  final VoidCallback onToggleTheme;
  final VoidCallback? onMenu;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: palette.surface,
        border: Border(bottom: BorderSide(color: palette.ink.withValues(alpha: 0.10))),
      ),
      child: Row(children: [
        if (onMenu != null)
          IconButton(
            icon: const Icon(Icons.menu),
            color: palette.ink2,
            tooltip: 'Filtre',
            onPressed: onMenu,
          ),
        Icon(Icons.hub_outlined, size: 20, color: palette.accent),
        const SizedBox(width: 9),
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Explorator de graf',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: palette.ink,
                height: 1.2,
              ),
            ),
            Text(
              '${controller.model.nodes.length} noduri',
              style: TextStyle(fontSize: 11.5, color: palette.muted, height: 1.2),
            ),
          ],
        ),
        Expanded(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: SizedBox(
                height: 36,
                child: TextField(
                  controller: searchController,
                  focusNode: searchFocus,
                  onChanged: onSearchChanged,
                  style: TextStyle(fontSize: 13.5, color: palette.ink),
                  decoration: InputDecoration(
                    hintText: 'Caută un nod…   (apasă /)',
                    hintStyle: TextStyle(fontSize: 13.5, color: palette.muted),
                    filled: true,
                    fillColor: palette.ink.withValues(alpha: 0.05),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(999),
                      borderSide: BorderSide(color: palette.ink.withValues(alpha: 0.10)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(999),
                      borderSide: BorderSide(color: palette.ink.withValues(alpha: 0.10)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(999),
                      borderSide: BorderSide(color: palette.accent),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.fit_screen_outlined),
          color: palette.ink2,
          tooltip: 'Încadrează (F)',
          onPressed: onFit,
        ),
        IconButton(
          icon: const Icon(Icons.refresh),
          color: palette.ink2,
          tooltip: 'Rearanjează (R)',
          onPressed: onRelayout,
        ),
        IconButton(
          icon: const Icon(Icons.contrast),
          color: palette.ink2,
          tooltip: 'Zi / noapte (T)',
          onPressed: onToggleTheme,
        ),
      ]),
    );
  }
}

class _SearchResults extends StatelessWidget {
  const _SearchResults({
    required this.palette,
    required this.controller,
    required this.results,
    required this.onPick,
  });

  final Palette palette;
  final GraphController controller;
  final List<GraphNode> results;
  final ValueChanged<GraphNode> onPick;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: palette.surface,
      elevation: 8,
      borderRadius: BorderRadius.circular(12),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420, maxHeight: 320),
        child: ListView.builder(
          shrinkWrap: true,
          padding: const EdgeInsets.all(4),
          itemCount: results.length,
          itemBuilder: (context, i) {
            final n = results[i];
            final slot = controller.model.communityOf(n)?.slot ?? -1;
            return InkWell(
              onTap: () => onPick(n),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 7),
                child: Row(children: [
                  Container(
                    width: 11,
                    height: 11,
                    decoration: BoxDecoration(
                      color: palette.forSlot(slot),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                  const SizedBox(width: 9),
                  Expanded(
                    child: Text(
                      n.label,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 13, color: palette.ink),
                    ),
                  ),
                  if (n.file.isNotEmpty)
                    Text(
                      n.file,
                      style: TextStyle(fontSize: 11.5, color: palette.muted),
                    ),
                ]),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _PathBar extends StatelessWidget {
  const _PathBar({
    required this.palette,
    required this.controller,
    required this.onFitPath,
  });

  final Palette palette;
  final GraphController controller;
  final VoidCallback onFitPath;

  @override
  Widget build(BuildContext context) {
    final selected = controller.selected;

    Widget slot(String prefix, GraphNode? node, VoidCallback onTap) {
      final isSet = node != null;
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 180),
          padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 4),
          decoration: BoxDecoration(
            color: palette.ink.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: isSet ? palette.accent : palette.rule),
          ),
          child: Text(
            '$prefix: ${node?.label ?? '?'}',
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12.5,
              color: isSet ? palette.ink : palette.ink2,
            ),
          ),
        ),
      );
    }

    return Material(
      color: palette.surface,
      elevation: 6,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: palette.ink.withValues(alpha: 0.10)),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Text(
            'DRUM',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.8,
              color: palette.muted,
            ),
          ),
          const SizedBox(width: 10),
          slot('A', controller.pathA, () {
            if (selected != null) {
              controller.setPathEnd(a: selected);
              if (controller.path != null) onFitPath();
            }
          }),
          const SizedBox(width: 6),
          Text('→', style: TextStyle(color: palette.muted)),
          const SizedBox(width: 6),
          slot('B', controller.pathB, () {
            if (selected != null) {
              controller.setPathEnd(b: selected);
              if (controller.path != null) onFitPath();
            }
          }),
          if (controller.pathMessage.isNotEmpty) ...[
            const SizedBox(width: 10),
            Text(
              controller.pathMessage,
              style: TextStyle(
                fontSize: 12.5,
                color: controller.path == null ? palette.muted : palette.ink2,
              ),
            ),
          ],
          const SizedBox(width: 8),
          InkWell(
            onTap: controller.clearPath,
            borderRadius: BorderRadius.circular(999),
            child: Padding(
              padding: const EdgeInsets.all(4),
              child: Icon(Icons.close, size: 16, color: palette.muted),
            ),
          ),
        ]),
      ),
    );
  }
}
