import type { HamProject } from '../../types/projects';

export const antennaSwitch: HamProject = {
  id: 'antenna-switch',
  name: 'Antennenumschalter 4-fach',
  category: 'antenna',
  difficulty: 1,
  description: 'Ferngesteuerter 4-fach Antennenumschalter mit Relais. Memory-Funktion speichert letzte Auswahl. LED-Anzeige für aktive Antenne. Galvanisch getrennt vom Transceiver.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'Relais-Modul 4-fach', quantity: 1, notes: '5V, mit Optokoppler' },
    { name: 'Koax-Relais', quantity: 4, notes: 'oder BNC/SO239 Relais' },
    { name: 'LED 5mm', quantity: 4, notes: 'verschiedene Farben' },
    { name: 'Taster', quantity: 4, notes: 'für manuelle Auswahl' },
    { name: 'Widerstand 220 Ohm', quantity: 4, notes: 'für LEDs' },
    { name: 'Gehäuse Metall', quantity: 1, notes: 'für HF-Schirmung' },
    { name: 'SO239/BNC Buchsen', quantity: 5, notes: '1x Input, 4x Output' },
    { name: 'DC-Buchse', quantity: 1, notes: '12V Versorgung' },
  ],
  estimatedCost: '~35€',

  code: `// =====================================================
// Antennenumschalter 4-fach - FunkPilot Bastelprojekt
// Hardware: Arduino Nano + 4x Relais
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================

#include <EEPROM.h>

// ===== PIN-BELEGUNG =====
// Relais (Active LOW bei den meisten Modulen)
const int RELAY_1 = 2;
const int RELAY_2 = 3;
const int RELAY_3 = 4;
const int RELAY_4 = 5;

// LEDs
const int LED_1 = 6;
const int LED_2 = 7;
const int LED_3 = 8;
const int LED_4 = 9;

// Taster (Active LOW mit Pullup)
const int BTN_1 = 10;
const int BTN_2 = 11;
const int BTN_3 = 12;
const int BTN_4 = A0;

// Arrays für einfachere Handhabung
const int relays[] = {RELAY_1, RELAY_2, RELAY_3, RELAY_4};
const int leds[] = {LED_1, LED_2, LED_3, LED_4};
const int buttons[] = {BTN_1, BTN_2, BTN_3, BTN_4};

// ===== KONFIGURATION =====
const bool ACTIVE_LOW_RELAY = true;   // true für die meisten Relais-Module
const int DEBOUNCE_DELAY = 50;        // Entprell-Zeit in ms
const int EEPROM_ADDR = 0;            // Adresse für Memory-Funktion

// ===== VARIABLEN =====
int currentAntenna = 0;               // 0-3 für Antenne 1-4
unsigned long lastButtonTime = 0;

void setup() {
  Serial.begin(9600);
  Serial.println(F("Antenna Switch v1.0"));
  Serial.println(F("FunkPilot Project"));

  // Relais als Ausgang
  for (int i = 0; i < 4; i++) {
    pinMode(relays[i], OUTPUT);
    // Alle Relais aus
    digitalWrite(relays[i], ACTIVE_LOW_RELAY ? HIGH : LOW);
  }

  // LEDs als Ausgang
  for (int i = 0; i < 4; i++) {
    pinMode(leds[i], OUTPUT);
    digitalWrite(leds[i], LOW);
  }

  // Taster als Eingang mit Pullup
  for (int i = 0; i < 4; i++) {
    pinMode(buttons[i], INPUT_PULLUP);
  }

  // Letzte Auswahl aus EEPROM laden
  loadFromMemory();

  // Startsequenz (alle LEDs kurz an)
  startupSequence();

  // Gespeicherte Antenne aktivieren
  selectAntenna(currentAntenna);

  Serial.print(F("Active antenna: "));
  Serial.println(currentAntenna + 1);
}

void loop() {
  // Taster abfragen
  for (int i = 0; i < 4; i++) {
    if (digitalRead(buttons[i]) == LOW) {
      // Entprellen
      delay(DEBOUNCE_DELAY);
      if (digitalRead(buttons[i]) == LOW) {
        // Antenne wechseln
        selectAntenna(i);

        // Warten bis Taster losgelassen
        while (digitalRead(buttons[i]) == LOW) {
          delay(10);
        }
      }
    }
  }

  // Serielle Steuerung (optional)
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd >= '1' && cmd <= '4') {
      selectAntenna(cmd - '1');
    }
  }
}

void selectAntenna(int antenna) {
  if (antenna < 0 || antenna > 3) return;
  if (antenna == currentAntenna) return;  // Schon aktiv

  Serial.print(F("Switching to antenna "));
  Serial.println(antenna + 1);

  // Alle Relais aus (Break-before-make)
  for (int i = 0; i < 4; i++) {
    digitalWrite(relays[i], ACTIVE_LOW_RELAY ? HIGH : LOW);
    digitalWrite(leds[i], LOW);
  }

  // Kurze Pause für Break-before-make
  delay(50);

  // Neues Relais ein
  digitalWrite(relays[antenna], ACTIVE_LOW_RELAY ? LOW : HIGH);
  digitalWrite(leds[antenna], HIGH);

  currentAntenna = antenna;

  // In EEPROM speichern
  saveToMemory();

  Serial.print(F("Antenna "));
  Serial.print(antenna + 1);
  Serial.println(F(" active"));
}

void loadFromMemory() {
  int stored = EEPROM.read(EEPROM_ADDR);
  if (stored >= 0 && stored <= 3) {
    currentAntenna = stored;
    Serial.print(F("Loaded from memory: Antenna "));
    Serial.println(currentAntenna + 1);
  } else {
    // Ungültiger Wert -> Default Antenne 1
    currentAntenna = 0;
    EEPROM.write(EEPROM_ADDR, 0);
  }
}

void saveToMemory() {
  // Nur schreiben wenn sich Wert geändert hat (EEPROM-Schonung)
  if (EEPROM.read(EEPROM_ADDR) != currentAntenna) {
    EEPROM.write(EEPROM_ADDR, currentAntenna);
    Serial.println(F("Saved to memory"));
  }
}

void startupSequence() {
  // Alle LEDs nacheinander an/aus
  for (int i = 0; i < 4; i++) {
    digitalWrite(leds[i], HIGH);
    delay(100);
  }
  delay(200);
  for (int i = 0; i < 4; i++) {
    digitalWrite(leds[i], LOW);
  }
  delay(100);
}

// ===== ERWEITERUNGEN =====
// Du kannst folgende Funktionen hinzufügen:
//
// 1. CAT-Steuerung:
//    - Serielle Befehle vom Transceiver empfangen
//    - Band-Decoder Funktion
//
// 2. Rotary Encoder:
//    - Drehencoder statt Einzeltaster
//    - Durchschalten der Antennen
//
// 3. LCD/OLED Display:
//    - Antennenname anzeigen
//    - SWR-Wert (wenn SWR-Meter vorhanden)
//
// 4. Band-Automatik:
//    - CI-V oder CAT auswerten
//    - Automatisch passende Antenne wählen
`,
  codeLanguage: 'cpp',
  codeFileName: 'antenna_switch.ino',

  customizationSuggestions: [
    'Band-Decoder für automatische Umschaltung',
    'CAT/CI-V Steuerung vom Transceiver',
    'OLED-Display mit Antennennamen',
    'Auf 6 oder 8 Antennen erweitern',
    'Fernbedienung über WiFi (ESP32)',
    'SWR-Warnung vor dem Umschalten',
  ],

  externalLinks: [
    { title: 'Relais-Schaltung Grundlagen', url: 'https://www.arduino.cc/en/Tutorial/BuiltInExamples/Relay' },
  ],
};
