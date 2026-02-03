import type { HamProject } from '../../types/projects';

export const esp32BluetoothKeyer: HamProject = {
  id: 'esp32-bluetooth-keyer',
  name: {
    de: 'ESP32 Bluetooth CW-Adapter',
    en: 'ESP32 Bluetooth CW Adapter',
    sl: 'ESP32 Bluetooth CW adapter',
  },
  category: 'cw-morse',
  difficulty: 2,
  morsefleet: true,
  description: {
    de: 'Kabelloser Bluetooth-Adapter für Morse-Paddles. ESP32 emuliert eine Bluetooth-Tastatur. Ideal für Tablets, Smartphones und Laptops. Akkubetrieb möglich! Funktioniert mit MorseFleet, VBand und anderen CW-Apps.',
    en: 'Wireless Bluetooth adapter for Morse paddles. ESP32 emulates a Bluetooth keyboard. Ideal for tablets, smartphones and laptops. Battery operation possible! Works with MorseFleet, VBand and other CW apps.',
    sl: 'Brezžični Bluetooth adapter za Morse paddle. ESP32 emulira Bluetooth tipkovnico. Idealen za tablice, pametne telefone in prenosnike. Možno baterijsko napajanje! Deluje z MorseFleet, VBand in drugimi CW aplikacijami.',
  },
  hardware: 'esp32',

  components: [
    { name: { de: 'ESP32 DevKit', en: 'ESP32 DevKit', sl: 'ESP32 DevKit' }, quantity: 1, notes: { de: '~8-12€', en: '~$8-12', sl: '~8-12€' } },
    { name: { de: 'Klinkenbuchse 3.5mm TRS', en: '3.5mm TRS jack socket', sl: '3.5mm TRS vtičnica' }, quantity: 1 },
    { name: { de: 'LiPo-Akku 3.7V', en: 'LiPo battery 3.7V', sl: 'LiPo baterija 3.7V' }, quantity: 1, notes: { de: 'optional, für mobilen Betrieb', en: 'optional, for mobile use', sl: 'opcijsko, za mobilno uporabo' } },
    { name: { de: 'Lademodul TP4056', en: 'Charge module TP4056', sl: 'Polnilni modul TP4056' }, quantity: 1, notes: { de: 'optional', en: 'optional', sl: 'opcijsko' } },
    { name: { de: 'Schalter', en: 'Switch', sl: 'Stikalo' }, quantity: 1, notes: { de: 'Ein/Aus', en: 'On/Off', sl: 'Vklop/Izklop' } },
    { name: { de: 'LED 3mm', en: 'LED 3mm', sl: 'LED 3mm' }, quantity: 1, notes: { de: 'Status-Anzeige', en: 'Status indicator', sl: 'Statusni indikator' } },
    { name: { de: 'Widerstand 330Ω', en: 'Resistor 330Ω', sl: 'Upor 330Ω' }, quantity: 1 },
  ],
  estimatedCost: '~12€',

  code: {
    de: `// =====================================================
// ESP32 Bluetooth CW Adapter - FunkPilot Projekt
// Hardware: ESP32 DevKit
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Bluetooth-Tastatur-Emulation für Morse-Paddles
// Kompatibel mit: MorseFleet, VBand, Vail, etc.
//
// HINWEIS: Bluetooth-Pairing erforderlich!
// =====================================================

#include <BleKeyboard.h>

// BLE Keyboard mit Namen "CW Paddle"
BleKeyboard bleKeyboard("CW Paddle", "FunkPilot", 100);

// Pin-Belegung
const int DIT_PIN = 4;        // GPIO4 - 3.5mm Tip
const int DAH_PIN = 5;        // GPIO5 - 3.5mm Ring
const int LED_PIN = 2;        // GPIO2 - Eingebaute LED (optional extern)

// Entprellzeit
const int DEBOUNCE_MS = 10;

// Status
bool lastDitState = HIGH;
bool lastDahState = HIGH;
unsigned long lastDitChange = 0;
unsigned long lastDahChange = 0;
bool connected = false;

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 CW Bluetooth Adapter starting...");

  // Pins konfigurieren
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);

  // BLE Keyboard starten
  bleKeyboard.begin();

  // Status-LED: Langsames Blinken = Warten auf Verbindung
  Serial.println("Waiting for Bluetooth connection...");
}

void loop() {
  // Verbindungsstatus prüfen
  if (bleKeyboard.isConnected()) {
    if (!connected) {
      connected = true;
      Serial.println("Bluetooth connected!");
      // Status-LED an
      digitalWrite(LED_PIN, HIGH);
    }

    // Paddle-Eingaben verarbeiten
    handlePaddle();
  } else {
    if (connected) {
      connected = false;
      Serial.println("Bluetooth disconnected!");
    }
    // Blinken wenn nicht verbunden
    blinkLED();
  }
}

void handlePaddle() {
  unsigned long now = millis();

  // === DIT Paddle (Linke Strg-Taste) ===
  bool ditState = digitalRead(DIT_PIN);
  if (ditState != lastDitState && (now - lastDitChange) > DEBOUNCE_MS) {
    if (ditState == LOW) {
      bleKeyboard.press(KEY_LEFT_CTRL);
      Serial.println("DIT pressed");
    } else {
      bleKeyboard.release(KEY_LEFT_CTRL);
      Serial.println("DIT released");
    }
    lastDitState = ditState;
    lastDitChange = now;
  }

  // === DAH Paddle (Rechte Strg-Taste) ===
  bool dahState = digitalRead(DAH_PIN);
  if (dahState != lastDahState && (now - lastDahChange) > DEBOUNCE_MS) {
    if (dahState == LOW) {
      bleKeyboard.press(KEY_RIGHT_CTRL);
      Serial.println("DAH pressed");
    } else {
      bleKeyboard.release(KEY_RIGHT_CTRL);
      Serial.println("DAH released");
    }
    lastDahState = dahState;
    lastDahChange = now;
  }
}

void blinkLED() {
  static unsigned long lastBlink = 0;
  static bool ledState = false;

  if (millis() - lastBlink > 500) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    lastBlink = millis();
  }
}

// =====================================================
// INSTALLATION:
// =====================================================
//
// 1. Arduino IDE: ESP32 Board-Support installieren
//    https://docs.espressif.com/projects/arduino-esp32/
//
// 2. BleKeyboard Bibliothek installieren:
//    https://github.com/T-vK/ESP32-BLE-Keyboard
//    (ZIP herunterladen und in Arduino IDE importieren)
//
// 3. Board auswählen: "ESP32 Dev Module"
//
// 4. Code hochladen
//
// =====================================================
// VERDRAHTUNG:
// =====================================================
//
//            ESP32 DevKit
//           ┌─────────────────┐
//           │                 │
//           │  GPIO4 ────────────── Tip (Dit)
//           │                 │         │
//           │  GPIO5 ────────────── Ring (Dah)
//           │                 │         │
//           │  GND ──────────────── Sleeve (Ground)
//           │                 │
//           │  GPIO2 ────────────── LED + (über 330Ω)
//           │                 │
//           │  3V3 ──────────────── LED - (Kathode)
//           │                 │
//           └─────────────────┘
//
// Für Akkubetrieb:
//   LiPo + → TP4056 B+ → ESP32 VIN
//   LiPo - → TP4056 B- → ESP32 GND
//
// =====================================================
// BLUETOOTH PAIRING:
// =====================================================
//
// 1. ESP32 einschalten (LED blinkt)
// 2. Auf PC/Tablet/Handy: Bluetooth-Einstellungen öffnen
// 3. Nach "CW Paddle" suchen und verbinden
// 4. LED leuchtet dauerhaft = Verbunden!
//
// =====================================================
// VERWENDUNG MIT MORSEFLEET:
// =====================================================
//
// 1. MorseFleet im Browser öffnen
// 2. Einstellungen (Zahnrad) → Keyboard / USB HID
// 3. Preset: VBand/Pi Pico (Strg-Tasten)
// 4. Keyer-Modus wählen
// 5. Spielen!
//
// 73 de OE8YML
`,
    en: `// =====================================================
// ESP32 Bluetooth CW Adapter - FunkPilot Project
// Hardware: ESP32 DevKit
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// Bluetooth keyboard emulation for Morse paddles
// Compatible with: MorseFleet, VBand, Vail, etc.
//
// NOTE: Bluetooth pairing required!
// =====================================================

#include <BleKeyboard.h>

// BLE Keyboard named "CW Paddle"
BleKeyboard bleKeyboard("CW Paddle", "FunkPilot", 100);

// Pin assignments
const int DIT_PIN = 4;        // GPIO4 - 3.5mm Tip
const int DAH_PIN = 5;        // GPIO5 - 3.5mm Ring
const int LED_PIN = 2;        // GPIO2 - Built-in LED (or external)

// Debounce time
const int DEBOUNCE_MS = 10;

// Status
bool lastDitState = HIGH;
bool lastDahState = HIGH;
unsigned long lastDitChange = 0;
unsigned long lastDahChange = 0;
bool connected = false;

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 CW Bluetooth Adapter starting...");

  // Configure pins
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);

  // Start BLE Keyboard
  bleKeyboard.begin();

  // Status LED: Slow blink = Waiting for connection
  Serial.println("Waiting for Bluetooth connection...");
}

void loop() {
  // Check connection status
  if (bleKeyboard.isConnected()) {
    if (!connected) {
      connected = true;
      Serial.println("Bluetooth connected!");
      // Status LED on
      digitalWrite(LED_PIN, HIGH);
    }

    // Process paddle inputs
    handlePaddle();
  } else {
    if (connected) {
      connected = false;
      Serial.println("Bluetooth disconnected!");
    }
    // Blink when not connected
    blinkLED();
  }
}

void handlePaddle() {
  unsigned long now = millis();

  // === DIT Paddle (Left Ctrl key) ===
  bool ditState = digitalRead(DIT_PIN);
  if (ditState != lastDitState && (now - lastDitChange) > DEBOUNCE_MS) {
    if (ditState == LOW) {
      bleKeyboard.press(KEY_LEFT_CTRL);
      Serial.println("DIT pressed");
    } else {
      bleKeyboard.release(KEY_LEFT_CTRL);
      Serial.println("DIT released");
    }
    lastDitState = ditState;
    lastDitChange = now;
  }

  // === DAH Paddle (Right Ctrl key) ===
  bool dahState = digitalRead(DAH_PIN);
  if (dahState != lastDahState && (now - lastDahChange) > DEBOUNCE_MS) {
    if (dahState == LOW) {
      bleKeyboard.press(KEY_RIGHT_CTRL);
      Serial.println("DAH pressed");
    } else {
      bleKeyboard.release(KEY_RIGHT_CTRL);
      Serial.println("DAH released");
    }
    lastDahState = dahState;
    lastDahChange = now;
  }
}

void blinkLED() {
  static unsigned long lastBlink = 0;
  static bool ledState = false;

  if (millis() - lastBlink > 500) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    lastBlink = millis();
  }
}

// =====================================================
// INSTALLATION:
// =====================================================
//
// 1. Arduino IDE: Install ESP32 board support
//    https://docs.espressif.com/projects/arduino-esp32/
//
// 2. Install BleKeyboard library:
//    https://github.com/T-vK/ESP32-BLE-Keyboard
//    (Download ZIP and import in Arduino IDE)
//
// 3. Select board: "ESP32 Dev Module"
//
// 4. Upload code
//
// =====================================================
// WIRING:
// =====================================================
//
//            ESP32 DevKit
//           ┌─────────────────┐
//           │                 │
//           │  GPIO4 ────────────── Tip (Dit)
//           │                 │         │
//           │  GPIO5 ────────────── Ring (Dah)
//           │                 │         │
//           │  GND ──────────────── Sleeve (Ground)
//           │                 │
//           │  GPIO2 ────────────── LED + (via 330Ω)
//           │                 │
//           │  3V3 ──────────────── LED - (cathode)
//           │                 │
//           └─────────────────┘
//
// For battery operation:
//   LiPo + → TP4056 B+ → ESP32 VIN
//   LiPo - → TP4056 B- → ESP32 GND
//
// =====================================================
// BLUETOOTH PAIRING:
// =====================================================
//
// 1. Power on ESP32 (LED blinks)
// 2. On PC/tablet/phone: Open Bluetooth settings
// 3. Search for "CW Paddle" and connect
// 4. LED stays on = Connected!
//
// =====================================================
// USING WITH MORSEFLEET:
// =====================================================
//
// 1. Open MorseFleet in browser
// 2. Settings (gear) → Keyboard / USB HID
// 3. Preset: VBand/Pi Pico (Ctrl keys)
// 4. Select keyer mode
// 5. Play!
//
// 73 de OE8YML
`,
    sl: `// =====================================================
// ESP32 Bluetooth CW Adapter - FunkPilot projekt
// Strojna oprema: ESP32 DevKit
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Bluetooth tipkovnica emulacija za Morse paddle
// Združljivo z: MorseFleet, VBand, Vail, itd.
//
// OPOMBA: Potrebno je Bluetooth povezovanje!
// =====================================================

#include <BleKeyboard.h>

// BLE Keyboard z imenom "CW Paddle"
BleKeyboard bleKeyboard("CW Paddle", "FunkPilot", 100);

// Dodelitev pinov
const int DIT_PIN = 4;        // GPIO4 - 3.5mm Tip
const int DAH_PIN = 5;        // GPIO5 - 3.5mm Ring
const int LED_PIN = 2;        // GPIO2 - Vgrajena LED (ali zunanja)

// Čas odbijanja
const int DEBOUNCE_MS = 10;

// Status
bool lastDitState = HIGH;
bool lastDahState = HIGH;
unsigned long lastDitChange = 0;
unsigned long lastDahChange = 0;
bool connected = false;

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 CW Bluetooth Adapter se zaganja...");

  // Konfiguriraj pine
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);

  // Zaženi BLE Keyboard
  bleKeyboard.begin();

  // Status LED: Počasno utripanje = Čakanje na povezavo
  Serial.println("Čakanje na Bluetooth povezavo...");
}

void loop() {
  // Preveri status povezave
  if (bleKeyboard.isConnected()) {
    if (!connected) {
      connected = true;
      Serial.println("Bluetooth povezan!");
      // Status LED prižgana
      digitalWrite(LED_PIN, HIGH);
    }

    // Obdelaj vnose paddle
    handlePaddle();
  } else {
    if (connected) {
      connected = false;
      Serial.println("Bluetooth prekinjen!");
    }
    // Utripaj ko ni povezan
    blinkLED();
  }
}

void handlePaddle() {
  unsigned long now = millis();

  // === DIT Paddle (Leva Ctrl tipka) ===
  bool ditState = digitalRead(DIT_PIN);
  if (ditState != lastDitState && (now - lastDitChange) > DEBOUNCE_MS) {
    if (ditState == LOW) {
      bleKeyboard.press(KEY_LEFT_CTRL);
      Serial.println("DIT pritisnjen");
    } else {
      bleKeyboard.release(KEY_LEFT_CTRL);
      Serial.println("DIT spuščen");
    }
    lastDitState = ditState;
    lastDitChange = now;
  }

  // === DAH Paddle (Desna Ctrl tipka) ===
  bool dahState = digitalRead(DAH_PIN);
  if (dahState != lastDahState && (now - lastDahChange) > DEBOUNCE_MS) {
    if (dahState == LOW) {
      bleKeyboard.press(KEY_RIGHT_CTRL);
      Serial.println("DAH pritisnjen");
    } else {
      bleKeyboard.release(KEY_RIGHT_CTRL);
      Serial.println("DAH spuščen");
    }
    lastDahState = dahState;
    lastDahChange = now;
  }
}

void blinkLED() {
  static unsigned long lastBlink = 0;
  static bool ledState = false;

  if (millis() - lastBlink > 500) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    lastBlink = millis();
  }
}

// =====================================================
// NAMESTITEV:
// =====================================================
//
// 1. Arduino IDE: Namestite ESP32 podporo za plošče
//    https://docs.espressif.com/projects/arduino-esp32/
//
// 2. Namestite BleKeyboard knjižnico:
//    https://github.com/T-vK/ESP32-BLE-Keyboard
//    (Prenesite ZIP in uvozite v Arduino IDE)
//
// 3. Izberite ploščo: "ESP32 Dev Module"
//
// 4. Naložite kodo
//
// =====================================================
// OŽIČENJE:
// =====================================================
//
//            ESP32 DevKit
//           ┌─────────────────┐
//           │                 │
//           │  GPIO4 ────────────── Tip (Dit)
//           │                 │         │
//           │  GPIO5 ────────────── Ring (Dah)
//           │                 │         │
//           │  GND ──────────────── Sleeve (Ground)
//           │                 │
//           │  GPIO2 ────────────── LED + (preko 330Ω)
//           │                 │
//           │  3V3 ──────────────── LED - (katoda)
//           │                 │
//           └─────────────────┘
//
// Za baterijsko napajanje:
//   LiPo + → TP4056 B+ → ESP32 VIN
//   LiPo - → TP4056 B- → ESP32 GND
//
// =====================================================
// BLUETOOTH POVEZOVANJE:
// =====================================================
//
// 1. Vklopite ESP32 (LED utripa)
// 2. Na PC/tablici/telefonu: Odprite Bluetooth nastavitve
// 3. Poiščite "CW Paddle" in se povežite
// 4. LED sveti stalno = Povezan!
//
// =====================================================
// UPORABA Z MORSEFLEET:
// =====================================================
//
// 1. Odprite MorseFleet v brskalniku
// 2. Nastavitve (zobnik) → Keyboard / USB HID
// 3. Prednastavitev: VBand/Pi Pico (Ctrl tipke)
// 4. Izberite način ključarja
// 5. Igrajte!
//
// 73 de OE8YML
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'esp32_bluetooth_keyer.ino',

  wiring: [
    { from: { de: 'ESP32 GPIO4', en: 'ESP32 GPIO4', sl: 'ESP32 GPIO4' }, to: { de: '3.5mm Tip (Dit)', en: '3.5mm Tip (Dit)', sl: '3.5mm Tip (Dit)' }, color: 'Gelb' },
    { from: { de: 'ESP32 GPIO5', en: 'ESP32 GPIO5', sl: 'ESP32 GPIO5' }, to: { de: '3.5mm Ring (Dah)', en: '3.5mm Ring (Dah)', sl: '3.5mm Ring (Dah)' }, color: 'Orange' },
    { from: { de: 'ESP32 GND', en: 'ESP32 GND', sl: 'ESP32 GND' }, to: { de: '3.5mm Sleeve (GND)', en: '3.5mm Sleeve (GND)', sl: '3.5mm Sleeve (GND)' }, color: 'Schwarz' },
    { from: { de: 'ESP32 GPIO2', en: 'ESP32 GPIO2', sl: 'ESP32 GPIO2' }, to: { de: 'LED Anode (über 330Ω)', en: 'LED anode (via 330Ω)', sl: 'LED anoda (preko 330Ω)' }, color: 'Grün' },
    { from: { de: 'ESP32 GND', en: 'ESP32 GND', sl: 'ESP32 GND' }, to: { de: 'LED Kathode', en: 'LED cathode', sl: 'LED katoda' }, color: 'Schwarz' },
  ],

  externalLinks: [
    { title: { de: 'ESP32-BLE-Keyboard Bibliothek', en: 'ESP32-BLE-Keyboard Library', sl: 'ESP32-BLE-Keyboard knjižnica' }, url: 'https://github.com/T-vK/ESP32-BLE-Keyboard' },
    { title: { de: 'ESP32 Arduino Installation', en: 'ESP32 Arduino Installation', sl: 'ESP32 Arduino namestitev' }, url: 'https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html' },
    { title: { de: 'MorseFleet CW-Spiel', en: 'MorseFleet CW Game', sl: 'MorseFleet CW igra' }, url: 'https://morsefleet.oe8yml.at/' },
  ],

  customizationSuggestions: [
    { de: 'Deep-Sleep-Modus für längere Akkulaufzeit', en: 'Deep sleep mode for longer battery life', sl: 'Način globokega spanja za daljšo življenjsko dobo baterije' },
    { de: 'Akku-Ladezustand über BLE übertragen', en: 'Transmit battery level via BLE', sl: 'Prenos nivoja baterije preko BLE' },
    { de: 'Eingebauter Iambic-Keyer im ESP32', en: 'Built-in Iambic keyer in ESP32', sl: 'Vgrajen Iambic ključar v ESP32' },
    { de: 'Lokaler Seitenton mit Piezo-Summer', en: 'Local sidetone with piezo buzzer', sl: 'Lokalni stranski ton s piezo brenčačem' },
    { de: 'OLED-Display für WPM und Status', en: 'OLED display for WPM and status', sl: 'OLED zaslon za WPM in status' },
  ],
};
