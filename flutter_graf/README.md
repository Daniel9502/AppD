# Explorator de graf, versiunea Flutter

Aceeași aplicație ca cea din [`../graph/`](../graph/), scrisă în Dart peste Flutter.
Citește `graph.json` produs de [Graphify](https://github.com/Graphify-Labs/graphify)
și îl face umblabil.

## De ce există amândouă

Cea din `/graph/` e vanilla JS: 47 KB, zero build, zero dependințe; se potrivește
cu restul site-ului. Asta e portul în Flutter, cu ce aduce el în plus: cod tipat,
teste de widget rulate fără browser și aceeași sursă pentru web, desktop și mobil.
Costul e un pas de build și un bundle mult mai mare.

## Ce are

- **Hartă cu forțe** desenată pe canvas (`CustomPainter`): respingere Barnes-Hut
  prin quadtree, arcuri pe muchii, coliziuni pe grilă, gravitație spre centru.
  Fără gravitație, cele patru componente deconectate ale grafului ar zbura din
  cadru și încadrarea ar strivi grupul principal.
- **Culoare pe comunitate** din paleta validată pentru daltonism: primele 8 după
  mărime primesc câte un slot, restul intră în *Altele*. Nicio culoare reciclată.
  Numele fiecărei comunități e scris pe hartă **și** listat în panou, ca
  identitatea să nu depindă doar de culoare.
- **Etichete care nu se calcă**: fiecare încearcă patru poziții (dreapta,
  stânga, dedesubt, deasupra) și e sărită dacă nu încape.
- **Filtre** pe comunitate, relație, tip de nod, plus „doar legături deduse”.
  Legăturile deduse se desenează întrerupt, ca să nu treacă drept fapt.
- **Drum minim** A → B, evidențiat și încadrat; spune „fără drum” când nodurile
  sunt în componente diferite.
- **Căutare** care ignoră diacriticele (`fisiere` găsește `Fișiere`).
- Detalii pe nod, temă zi/noapte, scurtături (`/`, `F`, `R`, `T`, `Esc`).

## Structură

| Fișier | Ce face |
|---|---|
| `lib/model/graph.dart` | citirea `graph.json`, grade, comunități, pliatul diacriticelor |
| `lib/model/paths.dart` | drum minim și componente conexe |
| `lib/model/palette.dart` | paleta validată, pe teme |
| `lib/layout/quadtree.dart` | quadtree Barnes-Hut |
| `lib/layout/simulation.dart` | simularea de forțe |
| `lib/graph_controller.dart` | starea: filtre, selecție, drum, transformare |
| `lib/graph_painter.dart` | desenul |
| `lib/graph_view.dart` | gesturi, hover, ticker |
| `lib/panels.dart`, `lib/main.dart` | interfața |

Modelul, drumurile și simularea sunt Dart curat, fără import de Flutter, de aia
testele lor rulează fără binding de widget-uri.

## Rulare

```bash
flutter pub get
flutter run -d chrome      # sau -d edge
```

## Teste

```bash
flutter analyze
flutter test
```

Testul din `test/render_test.dart` scrie `test/out/graf-dark.png` și
`test/out/graf-light.png`: randează graful fără browser, ca aranjamentul să
poată fi privit efectiv. Încarcă un font de sistem, fiindcă `flutter_test`
desenează altfel textul ca pătrate.

## Datele

`assets/graph.json` e o copie a `../graphify-out/graph.json`. Când regenerezi
graful, copiaz-o din nou:

```bash
graphify update ..
cp ../graphify-out/graph.json assets/graph.json
```
