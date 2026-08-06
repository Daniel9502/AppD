import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:graf/graph_controller.dart';
import 'package:graf/main.dart';
import 'package:graf/panels.dart';

import 'model_test.dart' show loadModel;

void main() {
  /// Controllerul se injectează: în zona de fake-async a testelor, citirea din
  /// `rootBundle` nu se termină, iar indicatorul de încărcare s-ar roti la
  /// nesfârșit, blocând `pumpAndSettle`.
  /// Înalt cât să încapă tot panoul din stânga: e un `ListView`, iar ce rămâne
  /// sub linia de plutire nici nu se construiește, deci nici nu se poate găsi.
  Future<void> pumpApp(WidgetTester tester, {Size size = const Size(1400, 1300)}) async {
    tester.view.physicalSize = size;
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(GrafApp(controller: GraphController(loadModel())));
    await tester.pumpAndSettle();
  }

  testWidgets('pornește și arată graful încărcat', (tester) async {
    await pumpApp(tester);

    expect(find.text('Explorator de graf'), findsOneWidget);
    expect(find.text('102 noduri'), findsOneWidget);
    expect(find.byType(FiltersPanel), findsOneWidget);
    expect(find.byType(DetailsPanel), findsNothing); // nimic selectat încă
  });

  testWidgets('panoul din stânga are secțiunile și hub-urile', (tester) async {
    await pumpApp(tester);

    expect(find.text('GRAFUL'), findsOneWidget);
    expect(find.text('COMUNITĂȚI'), findsOneWidget);
    expect(find.text('RELAȚII'), findsOneWidget);
    expect(find.text('TIP DE NOD'), findsOneWidget);
    expect(find.text('NODURI-HUB'), findsOneWidget);

    // relațiile, cu numărul lor
    expect(find.text('calls'), findsOneWidget);
    expect(find.text('contains'), findsOneWidget);
    expect(find.text('102'), findsWidgets);

    // tipurile de nod, traduse
    expect(find.text('cod'), findsOneWidget);
    expect(find.text('document'), findsOneWidget);
    expect(find.text('concept'), findsOneWidget);
  });

  testWidgets('cele trei comunități fără culoare sunt marcate (Altele)',
      (tester) async {
    await pumpApp(tester);
    expect(find.textContaining('(Altele)'), findsNWidgets(3));
  });

  testWidgets('un clic pe un hub deschide detaliile', (tester) async {
    await pumpApp(tester);

    await tester.tap(find.text('initCompose()'));
    await tester.pumpAndSettle();

    expect(find.byType(DetailsPanel), findsOneWidget);
    expect(find.text('script.js:L596'), findsOneWidget);
    expect(find.text('cod'), findsWidgets);
    // vecinii, grupați pe relație; titlurile sunt scrise cu majuscule
    expect(find.text('CALLS · 16'), findsOneWidget);
    expect(find.text('CONTAINS · 1'), findsOneWidget);
    expect(find.text('INDIRECT_CALL · 1'), findsOneWidget);
  });

  testWidgets('detaliile se închid de la buton', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.text('initCompose()'));
    await tester.pumpAndSettle();
    expect(find.byType(DetailsPanel), findsOneWidget);

    await tester.tap(find.byTooltip('Închide'));
    await tester.pumpAndSettle();
    expect(find.byType(DetailsPanel), findsNothing);
  });

  testWidgets('căutarea arată rezultate și le poți alege', (tester) async {
    await pumpApp(tester);

    await tester.enterText(find.byType(TextField), 'fisiere');
    await tester.pumpAndSettle();

    // fără diacritice, dar nodul e „Fișiere”
    expect(find.text('Fișiere'), findsOneWidget);

    await tester.tap(find.text('Fișiere'));
    await tester.pumpAndSettle();

    expect(find.byType(DetailsPanel), findsOneWidget);
    expect(find.text('README.md:L26'), findsOneWidget);
  });

  testWidgets('filtrarea unei comunități o estompează în legendă', (tester) async {
    await pumpApp(tester);

    final checkbox = find.byType(Checkbox).first;
    expect(tester.widget<Checkbox>(checkbox).value, isTrue);

    await tester.tap(checkbox);
    await tester.pumpAndSettle();
    expect(tester.widget<Checkbox>(find.byType(Checkbox).first).value, isFalse);
  });

  testWidgets('bara de drum e acolo și pornește goală', (tester) async {
    await pumpApp(tester);
    expect(find.text('DRUM'), findsOneWidget);
    expect(find.text('A: ?'), findsOneWidget);
    expect(find.text('B: ?'), findsOneWidget);
  });

  testWidgets('pune A și B și găsește drumul', (tester) async {
    await pumpApp(tester);

    await tester.tap(find.text('initCompose()'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('pune ca A'));
    await tester.pumpAndSettle();
    expect(find.text('A: initCompose()'), findsOneWidget);

    // script.js e vecinul care îl conține; îl alegem din panoul de detalii,
    // ca să nu nimerim intrarea cu același nume din legendă.
    await tester.tap(find.descendant(
      of: find.byType(DetailsPanel),
      matching: find.text('script.js'),
    ));
    await tester.pumpAndSettle();
    await tester.tap(find.text('pune ca B'));
    await tester.pumpAndSettle();

    expect(find.text('1 pas'), findsOneWidget);
  });

  testWidgets('tema se schimbă de la buton', (tester) async {
    await pumpApp(tester);

    final before = tester.widget<MaterialApp>(find.byType(MaterialApp)).themeMode;
    await tester.tap(find.byTooltip('Zi / noapte (T)'));
    await tester.pumpAndSettle();
    final after = tester.widget<MaterialApp>(find.byType(MaterialApp)).themeMode;

    expect(after, isNot(before));
  });

  testWidgets('pe ecran îngust panourile se dau la o parte', (tester) async {
    await pumpApp(tester, size: const Size(600, 900));

    // panoul de filtre trăiește într-un sertar, nu în pagină
    expect(find.byType(FiltersPanel), findsNothing);
    expect(find.byTooltip('Filtre'), findsOneWidget);

    await tester.tap(find.byTooltip('Filtre'));
    await tester.pumpAndSettle();
    expect(find.byType(FiltersPanel), findsOneWidget);
  });
}
