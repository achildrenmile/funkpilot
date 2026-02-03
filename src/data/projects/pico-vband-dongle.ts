import type { HamProject } from '../../types/projects';

export const picoVbandDongle: HamProject = {
  id: 'pico-vband-dongle',
  name: {
    de: 'Pi Pico VBand USB-Adapter',
    en: 'Pi Pico VBand USB Adapter',
    sl: 'Pi Pico VBand USB adapter',
  },
  category: 'cw-morse',
  difficulty: 1,
  description: {
    de: 'Günstiger USB HID Adapter für Morse-Paddle. Wandelt Paddle-Eingaben in Tastatur-Signale um. Funktioniert mit VBand, Vail, MorseFleet und anderen CW-Übungswebseiten. 4 umschaltbare Modi!',
    en: 'Affordable USB HID adapter for Morse paddles. Converts paddle input to keyboard signals. Works with VBand, Vail, MorseFleet and other CW practice websites. 4 selectable modes!',
    sl: 'Ugoden USB HID adapter za Morse paddle. Pretvarja vnos paddle v tipkovnične signale. Deluje z VBand, Vail, MorseFleet in drugimi CW vajami. 4 izbirni načini!',
  },
  hardware: 'raspberry-pico',

  components: [
    { name: { de: 'Raspberry Pi Pico', en: 'Raspberry Pi Pico', sl: 'Raspberry Pi Pico' }, quantity: 1, notes: { de: '~4€', en: '~$4', sl: '~4€' } },
    { name: { de: 'Klinkenbuchse 3.5mm TRS', en: '3.5mm TRS jack socket', sl: '3.5mm TRS vtičnica' }, quantity: 1, notes: { de: 'Stereo für Paddle', en: 'Stereo for paddle', sl: 'Stereo za paddle' } },
    { name: { de: 'USB Micro Kabel', en: 'USB Micro cable', sl: 'USB Micro kabel' }, quantity: 1 },
    { name: { de: 'Leitungen/Dupont-Kabel', en: 'Wires/Dupont cables', sl: 'Žice/Dupont kabli' }, quantity: 3 },
  ],
  estimatedCost: '~5€',

  code: {
    de: `// =====================================================
// Pi Pico VBand Dongle - FunkPilot Bastelprojekt
// Hardware: Raspberry Pi Pico
// Firmware: pico_vband von Graham Whaley
// Lizenz: MIT
// =====================================================
//
// WICHTIG: Dieses Projekt verwendet vorgefertigte Firmware!
//
// INSTALLATION:
// 1. BOOTSEL-Taste am Pico gedrückt halten
// 2. USB-Kabel anstecken (Pico erscheint als Laufwerk)
// 3. pico_vband.uf2 auf das Laufwerk kopieren
// 4. Pico startet automatisch neu als USB-Tastatur
//
// FIRMWARE DOWNLOAD:
// https://github.com/grahamwhaley/pico_vband/releases
//
// =====================================================
// MODI (kurz drücken = wechseln, lang drücken = reset):
// =====================================================
//
// Modus 1: [ ] Tasten  - VBand, Vail Standard
// Modus 2: x z Tasten  - Vail Alternativ
// Modus 3: e i Tasten  - morsecode.me
// Modus 4: Strg-L/R    - VBand, Vail, MorseFleet (empfohlen!)
//
// Modus 4 funktioniert auch wenn Browser nicht fokussiert!
//
// =====================================================
// VERDRAHTUNG:
// =====================================================
//
//             Raspberry Pi Pico
//            ┌─────────────────┐
//            │                 │
//            │  GP2 ──────────────── Tip (Dit)
//            │                 │         │
//            │  GP3 ──────────────── Ring (Dah)
//            │                 │         │
//            │  GND ──────────────── Sleeve (Ground)
//            │                 │
//            │  [LED] GP25     │  (eingebaut)
//            │                 │
//            └─────────────────┘
//
//     3.5mm TRS Buchse (von oben):
//          ┌───┬───┬─────────┐
//          │TIP│RNG│ SLEEVE  │
//          │Dit│Dah│  GND    │
//          └───┴───┴─────────┘
//
// =====================================================
// LED-FEEDBACK:
// =====================================================
// - Pulsierend beim Start = Bereit
// - Leuchtet bei Tastendruck
// - Schnelles Blinken = Modus wechseln
//
// =====================================================
// FEATURES:
// =====================================================
// - 10ms Entprellung eingebaut
// - Speichert letzten Modus
// - Funktioniert auf allen Betriebssystemen
// - iOS/Android via USB-OTG
//
// 73 de OE8YML
`,
    en: `// =====================================================
// Pi Pico VBand Dongle - FunkPilot DIY Project
// Hardware: Raspberry Pi Pico
// Firmware: pico_vband by Graham Whaley
// License: MIT
// =====================================================
//
// IMPORTANT: This project uses pre-built firmware!
//
// INSTALLATION:
// 1. Hold BOOTSEL button on the Pico
// 2. Connect USB cable (Pico appears as drive)
// 3. Copy pico_vband.uf2 to the drive
// 4. Pico automatically reboots as USB keyboard
//
// FIRMWARE DOWNLOAD:
// https://github.com/grahamwhaley/pico_vband/releases
//
// =====================================================
// MODES (short press = change, long press = reset):
// =====================================================
//
// Mode 1: [ ] keys     - VBand, Vail standard
// Mode 2: x z keys     - Vail alternate
// Mode 3: e i keys     - morsecode.me
// Mode 4: Ctrl-L/R     - VBand, Vail, MorseFleet (recommended!)
//
// Mode 4 works even when browser is not focused!
//
// =====================================================
// WIRING:
// =====================================================
//
//             Raspberry Pi Pico
//            ┌─────────────────┐
//            │                 │
//            │  GP2 ──────────────── Tip (Dit)
//            │                 │         │
//            │  GP3 ──────────────── Ring (Dah)
//            │                 │         │
//            │  GND ──────────────── Sleeve (Ground)
//            │                 │
//            │  [LED] GP25     │  (built-in)
//            │                 │
//            └─────────────────┘
//
//     3.5mm TRS Jack (top view):
//          ┌───┬───┬─────────┐
//          │TIP│RNG│ SLEEVE  │
//          │Dit│Dah│  GND    │
//          └───┴───┴─────────┘
//
// =====================================================
// LED FEEDBACK:
// =====================================================
// - Pulsing at startup = Ready
// - Lights on key press
// - Fast blink = Mode change
//
// =====================================================
// FEATURES:
// =====================================================
// - 10ms debounce built-in
// - Remembers last mode
// - Works on all operating systems
// - iOS/Android via USB-OTG
//
// 73 de OE8YML
`,
    sl: `// =====================================================
// Pi Pico VBand Dongle - FunkPilot DIY projekt
// Strojna oprema: Raspberry Pi Pico
// Firmware: pico_vband od Graham Whaley
// Licenca: MIT
// =====================================================
//
// POMEMBNO: Ta projekt uporablja vnaprej zgrajeno firmware!
//
// NAMESTITEV:
// 1. Držite gumb BOOTSEL na Picu
// 2. Priključite USB kabel (Pico se prikaže kot pogon)
// 3. Kopirajte pico_vband.uf2 na pogon
// 4. Pico se samodejno zažene kot USB tipkovnica
//
// PRENOS FIRMWARE:
// https://github.com/grahamwhaley/pico_vband/releases
//
// =====================================================
// NAČINI (kratek pritisk = zamenjaj, dolg = ponastavi):
// =====================================================
//
// Način 1: [ ] tipke   - VBand, Vail standard
// Način 2: x z tipke   - Vail alternativa
// Način 3: e i tipke   - morsecode.me
// Način 4: Ctrl-L/R    - VBand, Vail, MorseFleet (priporočeno!)
//
// Način 4 deluje tudi ko brskalnik ni fokusiran!
//
// =====================================================
// OŽIČENJE:
// =====================================================
//
//             Raspberry Pi Pico
//            ┌─────────────────┐
//            │                 │
//            │  GP2 ──────────────── Tip (Dit)
//            │                 │         │
//            │  GP3 ──────────────── Ring (Dah)
//            │                 │         │
//            │  GND ──────────────── Sleeve (Ground)
//            │                 │
//            │  [LED] GP25     │  (vgrajena)
//            │                 │
//            └─────────────────┘
//
//     3.5mm TRS vtičnica (pogled od zgoraj):
//          ┌───┬───┬─────────┐
//          │TIP│RNG│ SLEEVE  │
//          │Dit│Dah│  GND    │
//          └───┴───┴─────────┘
//
// =====================================================
// LED POVRATNA INFORMACIJA:
// =====================================================
// - Utripanje ob zagonu = Pripravljeno
// - Sveti ob pritisku tipke
// - Hitro utripanje = Menjava načina
//
// =====================================================
// FUNKCIJE:
// =====================================================
// - 10ms odbijanje vgrajeno
// - Zapomni si zadnji način
// - Deluje na vseh operacijskih sistemih
// - iOS/Android preko USB-OTG
//
// 73 de OE8YML
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'ANLEITUNG.txt',

  wiring: [
    { from: { de: 'Pico GP2', en: 'Pico GP2', sl: 'Pico GP2' }, to: { de: '3.5mm Tip (Dit)', en: '3.5mm Tip (Dit)', sl: '3.5mm Tip (Dit)' }, color: 'Gelb' },
    { from: { de: 'Pico GP3', en: 'Pico GP3', sl: 'Pico GP3' }, to: { de: '3.5mm Ring (Dah)', en: '3.5mm Ring (Dah)', sl: '3.5mm Ring (Dah)' }, color: 'Orange' },
    { from: { de: 'Pico GND', en: 'Pico GND', sl: 'Pico GND' }, to: { de: '3.5mm Sleeve (GND)', en: '3.5mm Sleeve (GND)', sl: '3.5mm Sleeve (GND)' }, color: 'Schwarz' },
  ],

  externalLinks: [
    { title: { de: 'pico_vband Firmware (GitHub)', en: 'pico_vband Firmware (GitHub)', sl: 'pico_vband Firmware (GitHub)' }, url: 'https://github.com/grahamwhaley/pico_vband' },
    { title: { de: 'Raspberry Pi Pico Pinout', en: 'Raspberry Pi Pico Pinout', sl: 'Raspberry Pi Pico razpored pinov' }, url: 'https://www.raspberrypi.com/documentation/microcontrollers/raspberry-pi-pico.html' },
    { title: { de: 'VBand CW-Übung', en: 'VBand CW Practice', sl: 'VBand CW vaja' }, url: 'https://hamradio.solutions/vband/' },
    { title: { de: 'MorseFleet CW-Spiel', en: 'MorseFleet CW Game', sl: 'MorseFleet CW igra' }, url: 'https://morsefleet.oe8yml.at/' },
  ],

  customizationSuggestions: [
    { de: 'Gehäuse mit 3D-Drucker fertigen', en: 'Create enclosure with 3D printer', sl: 'Izdelaj ohišje s 3D tiskalnikom' },
    { de: 'Externe LED für bessere Sichtbarkeit', en: 'External LED for better visibility', sl: 'Zunanja LED za boljšo vidljivost' },
    { de: 'Zusätzlicher Taster für Modus-Wechsel', en: 'Additional button for mode change', sl: 'Dodatna tipka za menjavo načina' },
  ],
};
