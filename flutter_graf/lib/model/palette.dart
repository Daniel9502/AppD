import 'package:flutter/material.dart';

/// Paleta categorică validată (scripts/validate_palette.js: PASS pe ambele teme,
/// pe lista de perechi alăturate). Cele opt sloturi se dau în ordine fixă și
/// nu se reciclează niciodată: a noua comunitate intră în „Altele”.
///
/// Pe fundal deschis, trei sloturi stau sub 3:1 față de pânză. Se aplică regula
/// de relief: numele fiecărei comunități e scris pe hartă ȘI listat în panou,
/// deci identitatea nu se sprijină niciodată doar pe culoare.
class Palette {
  const Palette({
    required this.series,
    required this.other,
    required this.surface,
    required this.plane,
    required this.ink,
    required this.ink2,
    required this.muted,
    required this.rule,
    required this.accent,
    required this.onAccent,
  });

  final List<Color> series;
  final Color other;
  final Color surface;
  final Color plane;
  final Color ink;
  final Color ink2;
  final Color muted;
  final Color rule;
  final Color accent;
  final Color onAccent;

  /// Câte culori distincte are paleta. Peste atât se folosește [other].
  static const int slots = 8;

  static const Palette light = Palette(
    series: [
      Color(0xFF2A78D6), // albastru
      Color(0xFFEB6834), // portocaliu
      Color(0xFF1BAF7A), // acvamarin
      Color(0xFFEDA100), // galben
      Color(0xFFE87BA4), // magenta
      Color(0xFF008300), // verde
      Color(0xFF4A3AA7), // violet
      Color(0xFFE34948), // roșu
    ],
    other: Color(0xFF898781),
    surface: Color(0xFFFCFCFB),
    plane: Color(0xFFF9F9F7),
    ink: Color(0xFF0B0B0B),
    ink2: Color(0xFF52514E),
    muted: Color(0xFF898781),
    rule: Color(0xFFC3C2B7),
    accent: Color(0xFF2A78D6),
    onAccent: Color(0xFFFFFFFF),
  );

  /// Aceleași opt nuanțe, dar pași aleși pentru fundalul închis, nu o inversare.
  static const Palette dark = Palette(
    series: [
      Color(0xFF3987E5),
      Color(0xFFD95926),
      Color(0xFF199E70),
      Color(0xFFC98500),
      Color(0xFFD55181),
      Color(0xFF008300),
      Color(0xFF9085E9),
      Color(0xFFE66767),
    ],
    other: Color(0xFF898781),
    surface: Color(0xFF1A1A19),
    plane: Color(0xFF0D0D0D),
    ink: Color(0xFFFFFFFF),
    ink2: Color(0xFFC3C2B7),
    muted: Color(0xFF898781),
    rule: Color(0xFF383835),
    accent: Color(0xFF3987E5),
    onAccent: Color(0xFF0D0D0D),
  );

  static Palette of(Brightness brightness) =>
      brightness == Brightness.dark ? dark : light;

  /// Culoarea unui slot; -1 înseamnă „Altele”.
  Color forSlot(int slot) =>
      slot < 0 || slot >= series.length ? other : series[slot];
}
