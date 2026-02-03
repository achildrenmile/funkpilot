import type { HamProject } from '../../types/projects';

export const arduinoUsbHidKeyer: HamProject = {
  id: 'arduino-usb-hid-keyer',
  name: {
    de: 'Arduino USB-HID Paddle-Adapter',
    en: 'Arduino USB-HID Paddle Adapter',
    sl: 'Arduino USB-HID Paddle adapter',
  },
  category: 'cw-morse',
  difficulty: 1,
  description: {
    de: 'USB HID Adapter mit Arduino Pro Micro. Paddle-Eingaben werden als Strg-Tasten an den PC gesendet. Perfekt für MorseFleet, VBand und andere CW-Übungswebseiten. Einfacher DIY-Aufbau!',
    en: 'USB HID adapter using Arduino Pro Micro. Paddle inputs are sent as Ctrl keys to PC. Perfect for MorseFleet, VBand and other CW practice websites. Simple DIY build!',
    sl: 'USB HID adapter z Arduino Pro Micro. Vnosi paddle se pošljejo kot Ctrl tipke na PC. Odličen za MorseFleet, VBand in druge CW vaje. Enostavna DIY gradnja!',
  },
  hardware: 'arduino-nano',

  components: [
    { name: { de: 'Arduino Pro Micro (ATmega32U4)', en: 'Arduino Pro Micro (ATmega32U4)', sl: 'Arduino Pro Micro (ATmega32U4)' }, quantity: 1, notes: { de: '~5-8€, USB-fähig!', en: '~$5-8, USB capable!', sl: '~5-8€, USB zmožen!' } },
    { name: { de: 'Klinkenbuchse 3.5mm TRS', en: '3.5mm TRS jack socket', sl: '3.5mm TRS vtičnica' }, quantity: 1, notes: { de: 'Stereo', en: 'Stereo', sl: 'Stereo' } },
    { name: { de: 'USB Micro Kabel', en: 'USB Micro cable', sl: 'USB Micro kabel' }, quantity: 1 },
    { name: { de: 'Lochrasterplatine oder Breadboard', en: 'Perfboard or breadboard', sl: 'Prototipna plošča ali breadboard' }, quantity: 1 },
    { name: { de: 'Leitungen', en: 'Wires', sl: 'Žice' }, quantity: 3 },
  ],
  estimatedCost: '~8€',

  code: {
    de: `// =====================================================
// Arduino USB-HID Paddle Adapter - FunkPilot Projekt
// Hardware: Arduino Pro Micro (ATmega32U4)
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// WICHTIG: Nur ATmega32U4-basierte Boards verwenden!
// - Arduino Pro Micro ✓
// - Arduino Leonardo ✓
// - Arduino Micro ✓
// - Arduino Nano ✗ (kein natives USB)
//
// Kompatibel mit: MorseFleet, VBand, Vail, morsecode.me
// =====================================================

#include <Keyboard.h>

// Pin-Belegung
const int DIT_PIN = 2;        // 3.5mm Tip
const int DAH_PIN = 3;        // 3.5mm Ring
                               // GND = 3.5mm Sleeve

// Entprellzeit in Millisekunden
const int DEBOUNCE_MS = 10;

// Letzte Zustände
bool lastDitState = HIGH;
bool lastDahState = HIGH;
unsigned long lastDitChange = 0;
unsigned long lastDahChange = 0;

void setup() {
  // Pins mit internem Pull-Up konfigurieren
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);

  // USB-Tastatur initialisieren
  Keyboard.begin();

  // Kurze Verzögerung für USB-Enumeration
  delay(1000);
}

void loop() {
  unsigned long now = millis();

  // === DIT Paddle (Linke Strg-Taste) ===
  bool ditState = digitalRead(DIT_PIN);
  if (ditState != lastDitState && (now - lastDitChange) > DEBOUNCE_MS) {
    if (ditState == LOW) {
      // Taste gedrückt
      Keyboard.press(KEY_LEFT_CTRL);
    } else {
      // Taste losgelassen
      Keyboard.release(KEY_LEFT_CTRL);
    }
    lastDitState = ditState;
    lastDitChange = now;
  }

  // === DAH Paddle (Rechte Strg-Taste) ===
  bool dahState = digitalRead(DAH_PIN);
  if (dahState != lastDahState && (now - lastDahChange) > DEBOUNCE_MS) {
    if (dahState == LOW) {
      // Taste gedrückt
      Keyboard.press(KEY_RIGHT_CTRL);
    } else {
      // Taste losgelassen
      Keyboard.release(KEY_RIGHT_CTRL);
    }
    lastDahState = dahState;
    lastDahChange = now;
  }
}

// =====================================================
// VERDRAHTUNG:
// =====================================================
//
//        Arduino Pro Micro
//       ┌─────────────────────┐
//       │                     │
//       │  D2 ────────────────────── Tip (Dit)
//       │                     │         │
//       │  D3 ────────────────────── Ring (Dah)
//       │                     │         │
//       │  GND ───────────────────── Sleeve (Ground)
//       │                     │
//       │  USB ──── zum Computer
//       │                     │
//       └─────────────────────┘
//
//     3.5mm TRS Buchse:
//          ┌───┬───┬─────────┐
//          │TIP│RNG│ SLEEVE  │
//          │Dit│Dah│  GND    │
//          └───┴───┴─────────┘
//
// =====================================================
// VERWENDUNG MIT MORSEFLEET:
// =====================================================
// 1. Einstellungen öffnen (Zahnrad-Symbol)
// 2. "Keyboard / USB HID" als Eingabemethode wählen
// 3. Preset "VBand/Pi Pico" auswählen
// 4. Keyer-Modus wählen (Straight, Iambic A/B, etc.)
// 5. Los geht's!
//
// 73 de OE8YML
`,
    en: `// =====================================================
// Arduino USB-HID Paddle Adapter - FunkPilot Project
// Hardware: Arduino Pro Micro (ATmega32U4)
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// IMPORTANT: Only use ATmega32U4-based boards!
// - Arduino Pro Micro ✓
// - Arduino Leonardo ✓
// - Arduino Micro ✓
// - Arduino Nano ✗ (no native USB)
//
// Compatible with: MorseFleet, VBand, Vail, morsecode.me
// =====================================================

#include <Keyboard.h>

// Pin assignments
const int DIT_PIN = 2;        // 3.5mm Tip
const int DAH_PIN = 3;        // 3.5mm Ring
                               // GND = 3.5mm Sleeve

// Debounce time in milliseconds
const int DEBOUNCE_MS = 10;

// Last states
bool lastDitState = HIGH;
bool lastDahState = HIGH;
unsigned long lastDitChange = 0;
unsigned long lastDahChange = 0;

void setup() {
  // Configure pins with internal pull-up
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);

  // Initialize USB keyboard
  Keyboard.begin();

  // Short delay for USB enumeration
  delay(1000);
}

void loop() {
  unsigned long now = millis();

  // === DIT Paddle (Left Ctrl key) ===
  bool ditState = digitalRead(DIT_PIN);
  if (ditState != lastDitState && (now - lastDitChange) > DEBOUNCE_MS) {
    if (ditState == LOW) {
      // Key pressed
      Keyboard.press(KEY_LEFT_CTRL);
    } else {
      // Key released
      Keyboard.release(KEY_LEFT_CTRL);
    }
    lastDitState = ditState;
    lastDitChange = now;
  }

  // === DAH Paddle (Right Ctrl key) ===
  bool dahState = digitalRead(DAH_PIN);
  if (dahState != lastDahState && (now - lastDahChange) > DEBOUNCE_MS) {
    if (dahState == LOW) {
      // Key pressed
      Keyboard.press(KEY_RIGHT_CTRL);
    } else {
      // Key released
      Keyboard.release(KEY_RIGHT_CTRL);
    }
    lastDahState = dahState;
    lastDahChange = now;
  }
}

// =====================================================
// WIRING:
// =====================================================
//
//        Arduino Pro Micro
//       ┌─────────────────────┐
//       │                     │
//       │  D2 ────────────────────── Tip (Dit)
//       │                     │         │
//       │  D3 ────────────────────── Ring (Dah)
//       │                     │         │
//       │  GND ───────────────────── Sleeve (Ground)
//       │                     │
//       │  USB ──── to Computer
//       │                     │
//       └─────────────────────┘
//
//     3.5mm TRS Jack:
//          ┌───┬───┬─────────┐
//          │TIP│RNG│ SLEEVE  │
//          │Dit│Dah│  GND    │
//          └───┴───┴─────────┘
//
// =====================================================
// USING WITH MORSEFLEET:
// =====================================================
// 1. Open Settings (gear icon)
// 2. Select "Keyboard / USB HID" as input method
// 3. Choose preset "VBand/Pi Pico"
// 4. Select keyer mode (Straight, Iambic A/B, etc.)
// 5. Start playing!
//
// 73 de OE8YML
`,
    sl: `// =====================================================
// Arduino USB-HID Paddle Adapter - FunkPilot projekt
// Strojna oprema: Arduino Pro Micro (ATmega32U4)
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// POMEMBNO: Uporabljajte samo ATmega32U4-bazirane plošče!
// - Arduino Pro Micro ✓
// - Arduino Leonardo ✓
// - Arduino Micro ✓
// - Arduino Nano ✗ (ni nativnega USB)
//
// Združljivo z: MorseFleet, VBand, Vail, morsecode.me
// =====================================================

#include <Keyboard.h>

// Dodelitev pinov
const int DIT_PIN = 2;        // 3.5mm Tip
const int DAH_PIN = 3;        // 3.5mm Ring
                               // GND = 3.5mm Sleeve

// Čas odbijanja v milisekundah
const int DEBOUNCE_MS = 10;

// Zadnja stanja
bool lastDitState = HIGH;
bool lastDahState = HIGH;
unsigned long lastDitChange = 0;
unsigned long lastDahChange = 0;

void setup() {
  // Konfiguriraj pine z notranjim pull-up
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);

  // Inicializiraj USB tipkovnico
  Keyboard.begin();

  // Kratka zakasnitev za USB enumeracijo
  delay(1000);
}

void loop() {
  unsigned long now = millis();

  // === DIT Paddle (Leva Ctrl tipka) ===
  bool ditState = digitalRead(DIT_PIN);
  if (ditState != lastDitState && (now - lastDitChange) > DEBOUNCE_MS) {
    if (ditState == LOW) {
      // Tipka pritisnjena
      Keyboard.press(KEY_LEFT_CTRL);
    } else {
      // Tipka spuščena
      Keyboard.release(KEY_LEFT_CTRL);
    }
    lastDitState = ditState;
    lastDitChange = now;
  }

  // === DAH Paddle (Desna Ctrl tipka) ===
  bool dahState = digitalRead(DAH_PIN);
  if (dahState != lastDahState && (now - lastDahChange) > DEBOUNCE_MS) {
    if (dahState == LOW) {
      // Tipka pritisnjena
      Keyboard.press(KEY_RIGHT_CTRL);
    } else {
      // Tipka spuščena
      Keyboard.release(KEY_RIGHT_CTRL);
    }
    lastDahState = dahState;
    lastDahChange = now;
  }
}

// =====================================================
// OŽIČENJE:
// =====================================================
//
//        Arduino Pro Micro
//       ┌─────────────────────┐
//       │                     │
//       │  D2 ────────────────────── Tip (Dit)
//       │                     │         │
//       │  D3 ────────────────────── Ring (Dah)
//       │                     │         │
//       │  GND ───────────────────── Sleeve (Ground)
//       │                     │
//       │  USB ──── na računalnik
//       │                     │
//       └─────────────────────┘
//
//     3.5mm TRS vtičnica:
//          ┌───┬───┬─────────┐
//          │TIP│RNG│ SLEEVE  │
//          │Dit│Dah│  GND    │
//          └───┴───┴─────────┘
//
// =====================================================
// UPORABA Z MORSEFLEET:
// =====================================================
// 1. Odprite nastavitve (ikona zobnika)
// 2. Izberite "Keyboard / USB HID" kot način vnosa
// 3. Izberite prednastavitev "VBand/Pi Pico"
// 4. Izberite način ključarja (Straight, Iambic A/B, itd.)
// 5. Začnite igrati!
//
// 73 de OE8YML
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'usb_hid_paddle.ino',

  wiring: [
    { from: { de: 'Pro Micro D2', en: 'Pro Micro D2', sl: 'Pro Micro D2' }, to: { de: '3.5mm Tip (Dit)', en: '3.5mm Tip (Dit)', sl: '3.5mm Tip (Dit)' }, color: 'Gelb' },
    { from: { de: 'Pro Micro D3', en: 'Pro Micro D3', sl: 'Pro Micro D3' }, to: { de: '3.5mm Ring (Dah)', en: '3.5mm Ring (Dah)', sl: '3.5mm Ring (Dah)' }, color: 'Orange' },
    { from: { de: 'Pro Micro GND', en: 'Pro Micro GND', sl: 'Pro Micro GND' }, to: { de: '3.5mm Sleeve (GND)', en: '3.5mm Sleeve (GND)', sl: '3.5mm Sleeve (GND)' }, color: 'Schwarz' },
  ],

  externalLinks: [
    { title: { de: 'Arduino Keyboard Library', en: 'Arduino Keyboard Library', sl: 'Arduino Keyboard knjižnica' }, url: 'https://www.arduino.cc/reference/en/language/functions/usb/keyboard/' },
    { title: { de: 'MorseFleet CW-Spiel', en: 'MorseFleet CW Game', sl: 'MorseFleet CW igra' }, url: 'https://morsefleet.oe8yml.at/' },
    { title: { de: 'VBand CW-Übung', en: 'VBand CW Practice', sl: 'VBand CW vaja' }, url: 'https://hamradio.solutions/vband/' },
  ],

  customizationSuggestions: [
    { de: 'LED zur Anzeige der Tastenbetätigung hinzufügen', en: 'Add LED to indicate key press', sl: 'Dodaj LED za prikaz pritiska tipke' },
    { de: 'Umschalten zwischen verschiedenen Tastenkombinationen per Jumper', en: 'Switch between different key combinations via jumper', sl: 'Preklapljanje med različnimi kombinacijami tipk preko mostiča' },
    { de: 'Kompaktes Gehäuse mit 3D-Drucker', en: 'Compact enclosure with 3D printer', sl: 'Kompaktno ohišje s 3D tiskalnikom' },
    { de: 'Zusätzlicher Piezo für lokalen Seitenton', en: 'Additional piezo for local sidetone', sl: 'Dodatni piezo za lokalni stranski ton' },
  ],
};
