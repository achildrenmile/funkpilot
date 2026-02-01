import type { HamProject } from '../../types/projects';

export const loraAntenna868: HamProject = {
  id: 'lora-antenna-868',
  name: {
    de: '868 MHz LoRa-Antenne (DIY)',
    en: '868 MHz LoRa Antenna (DIY)',
    sl: '868 MHz LoRa antena (DIY)',
  },
  category: 'mesh-lora',
  difficulty: 2,
  description: {
    de: 'Einfache aber effektive Groundplane-Antenne für 868 MHz LoRa. Mehr Reichweite als Stock-Antennen zum Selbstbaupreis.',
    en: 'Simple but effective groundplane antenna for 868 MHz LoRa. More range than stock antennas at DIY cost.',
    sl: 'Enostavna, a učinkovita groundplane antena za 868 MHz LoRa. Večji doseg kot standardne antene po ceni samogradnje.',
  },
  hardware: 'esp32-lora',
  projectType: 'build',

  components: [
    {
      name: {
        de: 'SMA-Einbaubuchse',
        en: 'SMA panel mount connector',
        sl: 'SMA vgradna vtičnica',
      },
      quantity: 1,
      notes: {
        de: 'Chassis-Mount, weiblich',
        en: 'Chassis mount, female',
        sl: 'Za montažo na ohišje, ženska',
      },
    },
    {
      name: {
        de: 'Kupferdraht 2mm',
        en: 'Copper wire 2mm',
        sl: 'Bakrena žica 2mm',
      },
      quantity: 1,
      notes: {
        de: 'Ca. 50cm, massiv oder Litze',
        en: 'Approx. 50cm, solid or stranded',
        sl: 'Pribl. 50cm, masivna ali pletenica',
      },
    },
    {
      name: {
        de: 'Messingrohr 4mm (optional)',
        en: 'Brass tube 4mm (optional)',
        sl: 'Medeninasta cev 4mm (neobvezno)',
      },
      quantity: 1,
      notes: {
        de: 'Für stabileren Strahler',
        en: 'For more stable radiator',
        sl: 'Za stabilnejši sevalec',
      },
    },
    {
      name: {
        de: 'Lötkolben & Lötzinn',
        en: 'Soldering iron & solder',
        sl: 'Spajkalnik in spajka',
      },
      quantity: 1,
    },
    {
      name: {
        de: 'Seitenschneider',
        en: 'Side cutters',
        sl: 'Ščipalke',
      },
      quantity: 1,
    },
    {
      name: {
        de: 'Lineal/Maßband',
        en: 'Ruler/tape measure',
        sl: 'Ravnilo/meter',
      },
      quantity: 1,
    },
    {
      name: {
        de: 'Schrumpfschlauch',
        en: 'Heat shrink tubing',
        sl: 'Termo skrčljiva cev',
      },
      quantity: 1,
      notes: {
        de: 'Optional für Wetterschutz',
        en: 'Optional for weather protection',
        sl: 'Neobvezno za zaščito pred vremenom',
      },
    },
  ],
  estimatedCost: '5-10 EUR',

  wiring: [
    {
      from: {
        de: 'Strahler (8.2cm)',
        en: 'Radiator (8.2cm)',
        sl: 'Sevalec (8.2cm)',
      },
      to: {
        de: 'SMA Innenleiter',
        en: 'SMA center conductor',
        sl: 'SMA sredinski vodnik',
      },
      color: 'kupfer',
      notes: {
        de: 'Mittig, vertikal',
        en: 'Centered, vertical',
        sl: 'Na sredini, vertikalno',
      },
    },
    {
      from: {
        de: 'Radial 1 (8.6cm)',
        en: 'Radial 1 (8.6cm)',
        sl: 'Radial 1 (8.6cm)',
      },
      to: {
        de: 'SMA Masse',
        en: 'SMA ground',
        sl: 'SMA masa',
      },
      color: 'kupfer',
      notes: {
        de: '45° nach unten',
        en: '45° downward',
        sl: '45° navzdol',
      },
    },
    {
      from: {
        de: 'Radial 2 (8.6cm)',
        en: 'Radial 2 (8.6cm)',
        sl: 'Radial 2 (8.6cm)',
      },
      to: {
        de: 'SMA Masse',
        en: 'SMA ground',
        sl: 'SMA masa',
      },
      color: 'kupfer',
      notes: {
        de: '45° nach unten',
        en: '45° downward',
        sl: '45° navzdol',
      },
    },
    {
      from: {
        de: 'Radial 3 (8.6cm)',
        en: 'Radial 3 (8.6cm)',
        sl: 'Radial 3 (8.6cm)',
      },
      to: {
        de: 'SMA Masse',
        en: 'SMA ground',
        sl: 'SMA masa',
      },
      color: 'kupfer',
      notes: {
        de: '45° nach unten',
        en: '45° downward',
        sl: '45° navzdol',
      },
    },
    {
      from: {
        de: 'Radial 4 (8.6cm)',
        en: 'Radial 4 (8.6cm)',
        sl: 'Radial 4 (8.6cm)',
      },
      to: {
        de: 'SMA Masse',
        en: 'SMA ground',
        sl: 'SMA masa',
      },
      color: 'kupfer',
      notes: {
        de: '45° nach unten',
        en: '45° downward',
        sl: '45° navzdol',
      },
    },
  ],

  code: {
    de: `/*
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
       /│\\
      / │ \\
     /  │  \\   Radials je 8.6 cm
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
    en: `/*
 * 868 MHz Groundplane Antenna for LoRa
 * =====================================
 *
 * This simple antenna offers significantly better performance
 * than the included stub antennas.
 *
 * Type: 1/4 Wave Groundplane
 * Frequency: 868 MHz (EU ISM band)
 * Gain: ~2 dBi
 * Polarization: Vertical
 * Impedance: ~50 Ohm
 */

// =====================================================
// BASICS
// =====================================================

/*
WHY BUILD YOUR OWN?
-------------------
The included "rubber duck" antennas are often poor:
- Incorrectly tuned
- Poor efficiency
- Too short

A simple groundplane antenna is:
- Cheap (~5€)
- Easy to build (30 minutes)
- Significantly better than stock antennas
- Perfectly tuned for 868 MHz

WAVELENGTH AT 868 MHz:
----------------------
λ = c / f = 299,792,458 m/s / 868,000,000 Hz
λ = 0.3454 m = 34.54 cm

1/4 λ = 8.64 cm (theoretical)
With velocity factor (~0.95): 8.2 cm
*/

// =====================================================
// BUILD INSTRUCTIONS
// =====================================================

/*
MATERIALS:
----------
- 1x SMA chassis connector (female)
- Approx. 50cm copper wire (1.5-2mm diameter)
- Soldering iron, solder
- Side cutters, ruler

DIMENSIONS (868 MHz):
---------------------
- Radiator: 8.2 cm (vertical, on center conductor)
- Radials: 8.6 cm × 4 pieces (on housing, 45° downward)

        ▲ Radiator
        │ 8.2 cm
        │
    ────●──── SMA connector
       /│\\
      / │ \\
     /  │  \\   Radials 8.6 cm each
    ▼   ▼   ▼  45° angle

STEP 1: RADIATOR
----------------
1. Cut copper wire to 8.2 cm
2. Tin one end
3. Solder to the center conductor of the SMA connector
4. Radiator must point straight up

STEP 2: RADIALS
---------------
1. Cut four wires to 8.6 cm each
2. Tin the ends
3. Solder evenly around the SMA connector housing
4. Bend radials 45° downward (not horizontal!)

STEP 3: TUNING
--------------
The antenna is automatically tuned to 868 MHz
with correct dimensions.

For perfect tuning (optional):
- Measure with NanoVNA (SWR < 1.5 ideal)
- Shorten radiator for higher frequency
- Lengthen radiator for lower frequency
*/

// =====================================================
// TECHNICAL DETAILS
// =====================================================

/*
WHY 45° RADIALS?
----------------
- Horizontal radials: ~35 Ohm impedance (mismatch!)
- 45° downward: ~50 Ohm impedance (perfect for LoRa)
- The steeper, the higher the impedance

RADIAL LENGTH:
--------------
Radials are 5% longer than the radiator (8.6 vs 8.2 cm)
because they point diagonally downward.

NUMBER OF RADIALS:
------------------
- Minimum: 3 pieces
- Optimal: 4 pieces
- More brings little improvement

GROUNDING:
----------
With groundplane antennas, the radials are the "counterpoise".
No additional grounding needed.
*/

// =====================================================
// VARIANTS
// =====================================================

/*
1. SIMPLE GROUNDPLANE (this project)
   - 1 radiator + 4 radials
   - Cheap, simple
   - ~2 dBi gain

2. COAXIAL DIPOLE (Sleeve Antenna)
   - Radiator + coax shield as radial
   - More compact
   - ~2 dBi gain

3. COLLINEAR (J-Pole Style)
   - Multiple elements stacked vertically
   - More gain (4-6 dBi)
   - More complex to build

4. MOXON / YAGI
   - Directional antenna
   - High gain (6-10 dBi)
   - For point-to-point links
*/

// =====================================================
// MOUNTING & ALIGNMENT
// =====================================================

/*
PLACEMENT:
----------
- Radiator ALWAYS vertical
- Radials point downward
- Mount as high as possible
- Clear view in desired directions

WEATHER PROTECTION:
-------------------
For outdoor use:
1. Heat shrink over solder joints
2. Plastic tube as radome (not metallic!)
3. Leave bottom opening open (condensation)

CONNECTION:
-----------
- Short coax cable to connector (losses!)
- RG316 OK for short distances
- RG58 or better for longer distances
- Every meter of cable costs range!
*/

// =====================================================
// COMPARISON: DIY vs COMMERCIAL ANTENNA
// =====================================================

/*
| Antenna              | Gain    | Price | Effort  |
|----------------------|---------|-------|---------|
| Stock antenna (incl.)| ~0 dBi  | 0€    | -       |
| DIY Groundplane      | ~2 dBi  | 5€    | 30 min  |
| Commercial fiberglass| ~3 dBi  | 15€   | -       |
| DIY Collinear        | ~5 dBi  | 10€   | 2h      |
| Professional antenna | ~6 dBi  | 40€+  | -       |

CONCLUSION:
The DIY Groundplane offers the best value for money!

+2 dBi means approx. 60% more range compared to stock antenna.
*/

// =====================================================
// MEASURING WITH NANOVNA (optional)
// =====================================================

/*
If you have a NanoVNA:

1. Calibrate (SOLT)
2. Connect antenna
3. Frequency range: 800-950 MHz
4. Measure S11 (return loss)

GOOD VALUES:
- Resonance frequency: 868 MHz ± 5 MHz
- SWR at 868 MHz: < 1.5
- S11 at 868 MHz: < -14 dB

TUNING:
- Too high (>868 MHz): Shorten radiator
- Too low (<868 MHz): Lengthen radiator
- 1mm ≈ 4 MHz shift
*/

void setup() {
  // This project is a hardware build project
  // No code needed - the antenna improves
  // any LoRa board automatically!
}

void loop() {
  // Have fun building!
  // 73 de FunkPilot
}
`,
    sl: `/*
 * 868 MHz Groundplane antena za LoRa
 * ===================================
 *
 * Ta enostavna antena ponuja bistveno boljše delovanje
 * kot priložene kratke antene.
 *
 * Tip: 1/4 valovne dolžine Groundplane
 * Frekvenca: 868 MHz (EU ISM pas)
 * Ojačanje: ~2 dBi
 * Polarizacija: Vertikalna
 * Impedanca: ~50 Ohm
 */

// =====================================================
// OSNOVE
// =====================================================

/*
ZAKAJ SAMOGRADNJA?
------------------
Priložene "gumijaste" antene so pogosto slabe:
- Napačno uglašene
- Slab izkoristek
- Prekratke

Enostavna groundplane antena je:
- Poceni (~5€)
- Enostavna za izdelavo (30 minut)
- Bistveno boljša od standardnih anten
- Popolnoma uglašena za 868 MHz

VALOVNA DOLŽINA PRI 868 MHz:
----------------------------
λ = c / f = 299.792.458 m/s / 868.000.000 Hz
λ = 0,3454 m = 34,54 cm

1/4 λ = 8,64 cm (teoretično)
Z faktorjem skrajšanja (~0,95): 8,2 cm
*/

// =====================================================
// NAVODILA ZA IZDELAVO
// =====================================================

/*
MATERIALI:
----------
- 1x SMA vgradna vtičnica (ženska)
- Pribl. 50cm bakrene žice (1,5-2mm premer)
- Spajkalnik, spajka
- Ščipalke, ravnilo

MERE (868 MHz):
---------------
- Sevalec: 8,2 cm (vertikalno, na sredinskem vodniku)
- Radiali: 8,6 cm × 4 kosi (na ohišju, 45° navzdol)

        ▲ Sevalec
        │ 8,2 cm
        │
    ────●──── SMA vtičnica
       /│\\
      / │ \\
     /  │  \\   Radiali po 8,6 cm
    ▼   ▼   ▼  kot 45°

KORAK 1: SEVALEC
----------------
1. Odrežite bakreno žico na 8,2 cm
2. Pocinkajte en konec
3. Prispajkajte na sredinski vodnik SMA vtičnice
4. Sevalec mora kazati naravnost navzgor

KORAK 2: RADIALI
----------------
1. Odrežite štiri žice na po 8,6 cm
2. Pocinkajte konce
3. Enakomerno prispajkajte na ohišje SMA vtičnice
4. Upognite radiale 45° navzdol (ne horizontalno!)

KORAK 3: UGLASITEV
------------------
Antena je ob pravilnih merah samodejno
uglašena na 868 MHz.

Za popolno uglasitev (neobvezno):
- Izmerite z NanoVNA (SWR < 1,5 idealno)
- Skrajšajte sevalec za višjo frekvenco
- Podaljšajte sevalec za nižjo frekvenco
*/

// =====================================================
// TEHNIČNE PODROBNOSTI
// =====================================================

/*
ZAKAJ RADIALI POD 45°?
----------------------
- Horizontalni radiali: ~35 Ohm impedanca (neujemanje!)
- 45° navzdol: ~50 Ohm impedanca (idealno za LoRa)
- Bolj strmo, višja impedanca

DOLŽINA RADIALOV:
-----------------
Radiali so 5% daljši od sevalca (8,6 proti 8,2 cm)
ker kažejo poševno navzdol.

ŠTEVILO RADIALOV:
-----------------
- Minimum: 3 kosi
- Optimalno: 4 kosi
- Več skoraj ne prinese izboljšav

OZEMLJITEV:
-----------
Pri groundplane antenah so radiali "protiutež".
Dodatna ozemljitev ni potrebna.
*/

// =====================================================
// RAZLIČICE
// =====================================================

/*
1. ENOSTAVNA GROUNDPLANE (ta projekt)
   - 1 sevalec + 4 radiali
   - Poceni, enostavno
   - ~2 dBi ojačanje

2. KOAKSIALNI DIPOL (Sleeve antena)
   - Sevalec + koaksialni plašč kot radial
   - Bolj kompaktna
   - ~2 dBi ojačanje

3. KOLINEARNA (J-Pole stil)
   - Več elementov zloženih vertikalno
   - Več ojačanja (4-6 dBi)
   - Zahtevnejša za izdelavo

4. MOXON / YAGI
   - Usmerjena antena
   - Visoko ojačanje (6-10 dBi)
   - Za točka-do-točka povezave
*/

// =====================================================
// MONTAŽA IN USMERITEV
// =====================================================

/*
POSTAVITEV:
-----------
- Sevalec VEDNO vertikalno
- Radiali kažejo navzdol
- Montirajte čim višje
- Prost pogled v želene smeri

ZAŠČITA PRED VREMENOM:
----------------------
Za uporabo na prostem:
1. Termo skrčljiva cev čez spajkane spoje
2. Plastična cev kot radom (ne kovinska!)
3. Pustite spodnjo odprtino odprto (kondenzacija)

PRIKLJUČITEV:
-------------
- Kratek koaksialni kabel do vtičnice (izgube!)
- RG316 OK za kratke razdalje
- RG58 ali boljši za daljše razdalje
- Vsak meter kabla stane doseg!
*/

// =====================================================
// PRIMERJAVA: DIY vs KUPLJENA ANTENA
// =====================================================

/*
| Antena               | Ojač.   | Cena  | Napor   |
|----------------------|---------|-------|---------|
| Standardna (pril.)   | ~0 dBi  | 0€    | -       |
| DIY Groundplane      | ~2 dBi  | 5€    | 30 min  |
| Kupljena stekloplast.| ~3 dBi  | 15€   | -       |
| DIY Kolinearna       | ~5 dBi  | 10€   | 2h      |
| Profesionalna antena | ~6 dBi  | 40€+  | -       |

ZAKLJUČEK:
DIY Groundplane ponuja najboljše razmerje cena/zmogljivost!

+2 dBi pomeni pribl. 60% več dosega v primerjavi s standardno anteno.
*/

// =====================================================
// MERJENJE Z NANOVNA (neobvezno)
// =====================================================

/*
Če imate NanoVNA:

1. Kalibrirajte (SOLT)
2. Priključite anteno
3. Frekvenčno območje: 800-950 MHz
4. Izmerite S11 (povratna izguba)

DOBRE VREDNOSTI:
- Resonančna frekvenca: 868 MHz ± 5 MHz
- SWR pri 868 MHz: < 1,5
- S11 pri 868 MHz: < -14 dB

UGLASITEV:
- Previsoko (>868 MHz): Skrajšajte sevalec
- Prenizko (<868 MHz): Podaljšajte sevalec
- 1mm ≈ 4 MHz premik
*/

void setup() {
  // Ta projekt je projekt strojne opreme
  // Koda ni potrebna - antena izboljša
  // vsako LoRa ploščo samodejno!
}

void loop() {
  // Veliko zabave pri izdelavi!
  // 73 de FunkPilot
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'lora_antenna_868.ino',

  externalLinks: [
    {
      title: {
        de: 'Groundplane Antenne (Wikipedia)',
        en: 'Groundplane Antenna (Wikipedia)',
        sl: 'Groundplane antena (Wikipedia)',
      },
      url: 'https://de.wikipedia.org/wiki/Groundplane',
    },
    {
      title: {
        de: 'NanoVNA Community',
        en: 'NanoVNA Community',
        sl: 'NanoVNA skupnost',
      },
      url: 'https://nanovna.com/',
    },
    {
      title: {
        de: 'Antenna Basics (ARRL)',
        en: 'Antenna Basics (ARRL)',
        sl: 'Osnove anten (ARRL)',
      },
      url: 'https://www.arrl.org/antenna-basics',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Wie stimme ich die Antenne ohne Messgeräte ab?',
      en: 'How do I tune the antenna without measuring equipment?',
      sl: 'Kako uglasim anteno brez merilnih instrumentov?',
    },
    {
      de: 'Kann ich die Antenne für 433 MHz umbauen?',
      en: 'Can I modify the antenna for 433 MHz?',
      sl: 'Ali lahko prilagodim anteno za 433 MHz?',
    },
    {
      de: 'Welches Koaxkabel ist am besten?',
      en: 'Which coax cable is best?',
      sl: 'Kateri koaksialni kabel je najboljši?',
    },
    {
      de: 'Wie mache ich die Antenne wetterfest?',
      en: 'How do I make the antenna weatherproof?',
      sl: 'Kako naredim anteno odporno na vremenske vplive?',
    },
    {
      de: 'Wie viel Reichweite gewinne ich?',
      en: 'How much range do I gain?',
      sl: 'Koliko dosega pridobim?',
    },
  ],

  hardwareOptions: [
    {
      name: {
        de: 'SMA-Chassis-Buchse',
        en: 'SMA Chassis Connector',
        sl: 'SMA vgradna vtičnica',
      },
      price: '~2€',
      features: [
        {
          de: 'Goldkontakte',
          en: 'Gold contacts',
          sl: 'Pozlačeni kontakti',
        },
        {
          de: 'Für Panelmontage',
          en: 'For panel mounting',
          sl: 'Za montažo na panel',
        },
      ],
      recommended: true,
    },
    {
      name: {
        de: 'Kupferdraht 2mm (5m)',
        en: 'Copper wire 2mm (5m)',
        sl: 'Bakrena žica 2mm (5m)',
      },
      price: '~3€',
      features: [
        {
          de: 'Massiv',
          en: 'Solid',
          sl: 'Masivna',
        },
        {
          de: 'Gut formbar',
          en: 'Easy to shape',
          sl: 'Enostavna za oblikovanje',
        },
      ],
    },
    {
      name: {
        de: 'NanoVNA (optional)',
        en: 'NanoVNA (optional)',
        sl: 'NanoVNA (neobvezno)',
      },
      price: '~40€',
      features: [
        {
          de: 'SWR messen',
          en: 'Measure SWR',
          sl: 'Merjenje SWR',
        },
        {
          de: 'Antenne abstimmen',
          en: 'Tune antenna',
          sl: 'Uglasitev antene',
        },
      ],
    },
    {
      name: {
        de: 'RG316 Pigtail 15cm',
        en: 'RG316 Pigtail 15cm',
        sl: 'RG316 Pigtail 15cm',
      },
      price: '~3€',
      features: [
        {
          de: 'Dünn',
          en: 'Thin',
          sl: 'Tanek',
        },
        {
          de: 'Flexibel',
          en: 'Flexible',
          sl: 'Fleksibilen',
        },
        {
          de: 'Für kurze Strecken',
          en: 'For short distances',
          sl: 'Za kratke razdalje',
        },
      ],
    },
  ],
};
