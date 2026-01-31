import type { HamProject } from '../../types/projects';

export const loraAntenna868: HamProject = {
  id: 'lora-antenna-868',
  name: '868 MHz LoRa-Antenne (DIY)',
  category: 'mesh-lora',
  difficulty: 2,
  description: 'Einfache aber effektive Groundplane-Antenne für 868 MHz LoRa. Mehr Reichweite als Stock-Antennen zum Selbstbaupreis.',
  hardware: 'esp32-lora',
  projectType: 'build',

  components: [
    { name: 'SMA-Einbaubuchse', quantity: 1, notes: 'Chassis-Mount, weiblich' },
    { name: 'Kupferdraht 2mm', quantity: 1, notes: 'Ca. 50cm, massiv oder Litze' },
    { name: 'Messingrohr 4mm (optional)', quantity: 1, notes: 'Für stabileren Strahler' },
    { name: 'Lötkolben & Lötzinn', quantity: 1 },
    { name: 'Seitenschneider', quantity: 1 },
    { name: 'Lineal/Maßband', quantity: 1 },
    { name: 'Schrumpfschlauch', quantity: 1, notes: 'Optional für Wetterschutz' },
  ],
  estimatedCost: '5-10 EUR',

  wiring: [
    { from: 'Strahler (8.2cm)', to: 'SMA Innenleiter', color: 'kupfer', notes: 'Mittig, vertikal' },
    { from: 'Radial 1 (8.6cm)', to: 'SMA Masse', color: 'kupfer', notes: '45° nach unten' },
    { from: 'Radial 2 (8.6cm)', to: 'SMA Masse', color: 'kupfer', notes: '45° nach unten' },
    { from: 'Radial 3 (8.6cm)', to: 'SMA Masse', color: 'kupfer', notes: '45° nach unten' },
    { from: 'Radial 4 (8.6cm)', to: 'SMA Masse', color: 'kupfer', notes: '45° nach unten' },
  ],

  code: `/*
 * 868 MHz Groundplane-Antenne für LoRa
 * =====================================
 *
 * Diese einfache Antenne bietet deutlich bessere Leistung
 * als die mitgelieferten Stummelantennen.
 *
 * Typ: 1/4 Wave Groundplane
 * Frequenz: 868 MHz (EU ISM-Band)
 * Gewinn: ~2 dBi
 * Polarisation: Vertikal
 * Impedanz: ~50 Ohm
 */

// =====================================================
// GRUNDLAGEN
// =====================================================

/*
WARUM SELBSTBAU?
----------------
Die mitgelieferten "Gummiwurst"-Antennen sind oft schlecht:
- Falsch abgestimmt
- Schlechter Wirkungsgrad
- Zu kurz

Eine einfache Groundplane-Antenne ist:
- Günstig (~5€)
- Einfach zu bauen (30 Minuten)
- Deutlich besser als Stock-Antennen
- Perfekt für 868 MHz abgestimmt

WELLENLÄGE BEI 868 MHz:
-----------------------
λ = c / f = 299.792.458 m/s / 868.000.000 Hz
λ = 0.3454 m = 34.54 cm

1/4 λ = 8.64 cm (theoretisch)
Mit Verkürzungsfaktor (~0.95): 8.2 cm
*/

// =====================================================
// BAUANLEITUNG
// =====================================================

/*
MATERIALIEN:
------------
- 1x SMA-Chassis-Buchse (weiblich)
- Ca. 50cm Kupferdraht (1.5-2mm Durchmesser)
- Lötkolben, Lötzinn
- Seitenschneider, Lineal

MAßE (868 MHz):
---------------
- Strahler: 8.2 cm (vertikal, am Innenleiter)
- Radials: 8.6 cm × 4 Stück (am Gehäuse, 45° nach unten)

        ▲ Strahler
        │ 8.2 cm
        │
    ────●──── SMA-Buchse
       /│\
      / │ \
     /  │  \   Radials je 8.6 cm
    ▼   ▼   ▼  45° Winkel

SCHRITT 1: STRAHLER
-------------------
1. Kupferdraht auf 8.2 cm schneiden
2. Ein Ende verzinnen
3. An den Innenleiter der SMA-Buchse löten
4. Strahler muss senkrecht nach oben zeigen

SCHRITT 2: RADIALS
------------------
1. Vier Drähte auf je 8.6 cm schneiden
2. Enden verzinnen
3. Gleichmäßig am Gehäuse der SMA-Buchse anlöten
4. Radials 45° nach unten biegen (nicht horizontal!)

SCHRITT 3: ABSTIMMUNG
---------------------
Die Antenne ist bei korrekten Maßen automatisch
auf 868 MHz abgestimmt.

Für perfekte Abstimmung (optional):
- Mit NanoVNA messen (SWR < 1.5 ideal)
- Strahler kürzen für höhere Frequenz
- Strahler verlängern für niedrigere Frequenz
*/

// =====================================================
// TECHNISCHE DETAILS
// =====================================================

/*
WARUM 45° RADIALS?
------------------
- Horizontale Radials: ~35 Ohm Impedanz (Fehlanpassung!)
- 45° nach unten: ~50 Ohm Impedanz (perfekt für LoRa)
- Je steiler, desto höhere Impedanz

RADIAL-LÄNGE:
-------------
Radials sind 5% länger als der Strahler (8.6 vs 8.2 cm)
weil sie schräg nach unten zeigen.

ANZAHL RADIALS:
---------------
- Minimum: 3 Stück
- Optimal: 4 Stück
- Mehr bringt kaum Verbesserung

ERDUNG:
-------
Bei Groundplane-Antennen sind die Radials das "Gegengewicht".
Keine zusätzliche Erdung nötig.
*/

// =====================================================
// VARIANTEN
// =====================================================

/*
1. EINFACHE GROUNDPLANE (dieses Projekt)
   - 1 Strahler + 4 Radials
   - Günstig, einfach
   - ~2 dBi Gewinn

2. KOAXIAL-DIPOL (Sleeve Antenna)
   - Strahler + Koaxmantel als Radial
   - Kompakter
   - ~2 dBi Gewinn

3. COLLINEAR (J-Pole Style)
   - Mehrere Elemente vertikal gestapelt
   - Mehr Gewinn (4-6 dBi)
   - Aufwändiger zu bauen

4. MOXON / YAGI
   - Gerichtete Antenne
   - Hoher Gewinn (6-10 dBi)
   - Für Punkt-zu-Punkt Links
*/

// =====================================================
// MONTAGE & AUSRICHTUNG
// =====================================================

/*
AUFSTELLUNG:
------------
- Strahler IMMER vertikal
- Radials zeigen nach unten
- So hoch wie möglich montieren
- Freie Sicht in gewünschte Richtungen

WETTERSCHUTZ:
-------------
Für Outdoor:
1. Schrumpfschlauch über Lötstellen
2. Kunststoffrohr als Radom (nicht metallisch!)
3. Untere Öffnung offen lassen (Kondenswasser)

ANSCHLUSS:
----------
- Kurzes Koaxkabel zur Buchse (Verluste!)
- RG316 für kurze Strecken OK
- RG58 oder besser für längere Strecken
- Jeder Meter Kabel kostet Reichweite!
*/

// =====================================================
// VERGLEICH: DIY vs KAUFANTENNE
// =====================================================

/*
| Antenne              | Gewinn  | Preis | Aufwand |
|----------------------|---------|-------|---------|
| Stock-Antenne (beil.)| ~0 dBi  | 0€    | -       |
| DIY Groundplane      | ~2 dBi  | 5€    | 30 min  |
| Kaufantenne Fiberglas| ~3 dBi  | 15€   | -       |
| DIY Collinear        | ~5 dBi  | 10€   | 2h      |
| Profi-Antenne        | ~6 dBi  | 40€+  | -       |

FAZIT:
Die DIY Groundplane ist das beste Preis-Leistungs-Verhältnis!

+2 dBi bedeutet ca. 60% mehr Reichweite gegenüber Stock-Antenne.
*/

// =====================================================
// MESSUNG MIT NANOVNA (optional)
// =====================================================

/*
Falls du einen NanoVNA hast:

1. Kalibrieren (SOLT)
2. Antenne anschließen
3. Frequenzbereich: 800-950 MHz
4. S11 messen (Rückflussdämpfung)

GUTE WERTE:
- Resonanzfrequenz: 868 MHz ± 5 MHz
- SWR bei 868 MHz: < 1.5
- S11 bei 868 MHz: < -14 dB

ABSTIMMEN:
- Zu hoch (>868 MHz): Strahler kürzen
- Zu tief (<868 MHz): Strahler verlängern
- 1mm ≈ 4 MHz Verschiebung
*/

void setup() {
  // Dieses Projekt ist ein Hardware-Bauprojekt
  // Kein Code nötig - die Antenne verbessert
  // automatisch jedes LoRa-Board!
}

void loop() {
  // Viel Spaß beim Bauen!
  // 73 de FunkPilot
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'lora_antenna_868.ino',

  externalLinks: [
    { title: 'Groundplane Antenne (Wikipedia)', url: 'https://de.wikipedia.org/wiki/Groundplane' },
    { title: 'NanoVNA Community', url: 'https://nanovna.com/' },
    { title: 'Antenna Basics (ARRL)', url: 'https://www.arrl.org/antenna-basics' },
  ],

  customizationSuggestions: [
    'Wie stimme ich die Antenne ohne Messgeräte ab?',
    'Kann ich die Antenne für 433 MHz umbauen?',
    'Welches Koaxkabel ist am besten?',
    'Wie mache ich die Antenne wetterfest?',
    'Wie viel Reichweite gewinne ich?',
  ],

  hardwareOptions: [
    {
      name: 'SMA-Chassis-Buchse',
      price: '~2€',
      features: ['Goldkontakte', 'Für Panelmontage'],
      recommended: true,
    },
    {
      name: 'Kupferdraht 2mm (5m)',
      price: '~3€',
      features: ['Massiv', 'Gut formbar'],
    },
    {
      name: 'NanoVNA (optional)',
      price: '~40€',
      features: ['SWR messen', 'Antenne abstimmen'],
    },
    {
      name: 'RG316 Pigtail 15cm',
      price: '~3€',
      features: ['Dünn', 'Flexibel', 'Für kurze Strecken'],
    },
  ],
};
