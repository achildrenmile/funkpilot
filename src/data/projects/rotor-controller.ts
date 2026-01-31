import type { HamProject } from '../../types/projects';

export const rotorController: HamProject = {
  id: 'rotor-controller',
  name: 'Rotorsteuerung',
  category: 'control',
  difficulty: 2,
  description: 'Digitale Steuerung für Antennenrotoren. Anzeige des Azimuths auf OLED. Preset-Speicher für häufige Richtungen. USB-Fernsteuerung über PC.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'OLED Display 0.96"', quantity: 1 },
    { name: 'Relais-Modul 2-fach', quantity: 1, notes: 'für CW/CCW' },
    { name: 'Potentiometer 10k', quantity: 1, notes: 'falls Rotor keinen Positionsgeber hat' },
    { name: 'Drehencoder', quantity: 1, notes: 'Manuelle Steuerung' },
    { name: 'Taster', quantity: 3, notes: 'Preset 1/2/3' },
    { name: 'LED', quantity: 3, notes: 'CW/CCW/On' },
    { name: 'Widerstand 220 Ohm', quantity: 3 },
    { name: 'Klemmleiste', quantity: 1, notes: 'Anschluss Rotor' },
  ],
  estimatedCost: '~20€',

  code: `// =====================================================
// Rotorsteuerung - FunkPilot Bastelprojekt
// Hardware: Arduino Nano + OLED + Relais
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Steuert Azimuth-Rotoren (Yaesu, Kenpro, etc.)
// Positionsgeber-Eingang für Anzeige
// USB-Fernsteuerung (Easycomm-kompatibel)
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <EEPROM.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Pins
const int POS_PIN = A0;        // Positionsgeber-Eingang
const int RELAY_CW = 4;        // Relais Rechtsdrehung
const int RELAY_CCW = 5;       // Relais Linksdrehung
const int ENC_A = 2;           // Encoder A
const int ENC_B = 3;           // Encoder B
const int ENC_BTN = 6;         // Encoder Taster
const int BTN_PRESET1 = 7;     // Preset-Taster
const int BTN_PRESET2 = 8;
const int BTN_PRESET3 = 9;
const int LED_CW = 10;
const int LED_CCW = 11;
const int LED_ON = 12;

// Kalibrierung (anpassen!)
const int POS_MIN = 50;        // ADC-Wert bei 0°
const int POS_MAX = 950;       // ADC-Wert bei 360°
const int TOLERANCE = 3;       // Toleranz in Grad

// Status
int currentAzimuth = 0;
int targetAzimuth = 0;
bool rotating = false;
int rotateDirection = 0;       // 1=CW, -1=CCW, 0=Stop

// Presets (im EEPROM)
int presets[3] = {0, 90, 180};
const int EEPROM_PRESETS = 0;

// Encoder
volatile int encoderValue = 0;

void setup() {
  Serial.begin(9600);

  pinMode(RELAY_CW, OUTPUT);
  pinMode(RELAY_CCW, OUTPUT);
  pinMode(LED_CW, OUTPUT);
  pinMode(LED_CCW, OUTPUT);
  pinMode(LED_ON, OUTPUT);

  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  pinMode(ENC_BTN, INPUT_PULLUP);
  pinMode(BTN_PRESET1, INPUT_PULLUP);
  pinMode(BTN_PRESET2, INPUT_PULLUP);
  pinMode(BTN_PRESET3, INPUT_PULLUP);

  stopRotor();

  // Encoder Interrupt
  attachInterrupt(digitalPinToInterrupt(ENC_A), encoderISR, CHANGE);

  // Presets laden
  loadPresets();

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED nicht gefunden"));
  }

  digitalWrite(LED_ON, HIGH);

  Serial.println(F("Rotor Controller v1.0"));
  Serial.println(F("Befehle: AZ xxx.x, STOP, P1, P2, P3"));
}

void loop() {
  // Position lesen
  readPosition();

  // Encoder verarbeiten
  processEncoder();

  // Taster verarbeiten
  processButtons();

  // Serial-Befehle
  processSerial();

  // Rotor-Logik
  processRotor();

  // Anzeige aktualisieren
  updateDisplay();

  delay(50);
}

void encoderISR() {
  static int lastA = HIGH;
  int a = digitalRead(ENC_A);

  if (a != lastA && a == LOW) {
    if (digitalRead(ENC_B) == HIGH) {
      encoderValue++;
    } else {
      encoderValue--;
    }
  }
  lastA = a;
}

void readPosition() {
  int raw = analogRead(POS_PIN);

  // Auf 0-360° mappen
  currentAzimuth = map(raw, POS_MIN, POS_MAX, 0, 360);
  currentAzimuth = constrain(currentAzimuth, 0, 360);
}

void processEncoder() {
  if (encoderValue != 0) {
    targetAzimuth += encoderValue * 5;  // 5° pro Schritt
    targetAzimuth = ((targetAzimuth % 360) + 360) % 360;
    encoderValue = 0;
  }

  // Encoder-Taster: Ziel = aktuell (Stop)
  if (!digitalRead(ENC_BTN)) {
    delay(50);
    while(!digitalRead(ENC_BTN));
    targetAzimuth = currentAzimuth;
    stopRotor();
  }
}

void processButtons() {
  if (!digitalRead(BTN_PRESET1)) {
    delay(50);
    while(!digitalRead(BTN_PRESET1));
    targetAzimuth = presets[0];
  }
  if (!digitalRead(BTN_PRESET2)) {
    delay(50);
    while(!digitalRead(BTN_PRESET2));
    targetAzimuth = presets[1];
  }
  if (!digitalRead(BTN_PRESET3)) {
    delay(50);
    while(!digitalRead(BTN_PRESET3));
    targetAzimuth = presets[2];
  }
}

void processSerial() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    cmd.toUpperCase();

    if (cmd.startsWith("AZ")) {
      // Easycomm: AZxxx.x
      String val = cmd.substring(2);
      val.trim();
      targetAzimuth = val.toInt() % 360;
      Serial.print(F("Target: "));
      Serial.println(targetAzimuth);
    }
    else if (cmd == "STOP" || cmd == "S") {
      stopRotor();
      targetAzimuth = currentAzimuth;
      Serial.println(F("STOPPED"));
    }
    else if (cmd == "P1") {
      targetAzimuth = presets[0];
    }
    else if (cmd == "P2") {
      targetAzimuth = presets[1];
    }
    else if (cmd == "P3") {
      targetAzimuth = presets[2];
    }
    else if (cmd.startsWith("SP")) {
      // Preset setzen: SP1 180
      int idx = cmd.charAt(2) - '1';
      if (idx >= 0 && idx < 3) {
        presets[idx] = cmd.substring(4).toInt() % 360;
        savePresets();
        Serial.println(F("Preset saved"));
      }
    }
    else if (cmd == "?") {
      Serial.print(F("AZ: "));
      Serial.print(currentAzimuth);
      Serial.print(F(" Target: "));
      Serial.println(targetAzimuth);
    }
  }
}

void processRotor() {
  int diff = targetAzimuth - currentAzimuth;

  // Kürzesten Weg berechnen
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  if (abs(diff) <= TOLERANCE) {
    // Ziel erreicht
    stopRotor();
  } else if (diff > 0) {
    // CW drehen
    rotateDirection = 1;
    digitalWrite(RELAY_CW, HIGH);
    digitalWrite(RELAY_CCW, LOW);
    digitalWrite(LED_CW, HIGH);
    digitalWrite(LED_CCW, LOW);
    rotating = true;
  } else {
    // CCW drehen
    rotateDirection = -1;
    digitalWrite(RELAY_CW, LOW);
    digitalWrite(RELAY_CCW, HIGH);
    digitalWrite(LED_CW, LOW);
    digitalWrite(LED_CCW, HIGH);
    rotating = true;
  }
}

void stopRotor() {
  digitalWrite(RELAY_CW, LOW);
  digitalWrite(RELAY_CCW, LOW);
  digitalWrite(LED_CW, LOW);
  digitalWrite(LED_CCW, LOW);
  rotating = false;
  rotateDirection = 0;
}

void loadPresets() {
  for (int i = 0; i < 3; i++) {
    int val = EEPROM.read(EEPROM_PRESETS + i * 2) |
              (EEPROM.read(EEPROM_PRESETS + i * 2 + 1) << 8);
    if (val >= 0 && val < 360) {
      presets[i] = val;
    }
  }
}

void savePresets() {
  for (int i = 0; i < 3; i++) {
    EEPROM.write(EEPROM_PRESETS + i * 2, presets[i] & 0xFF);
    EEPROM.write(EEPROM_PRESETS + i * 2 + 1, (presets[i] >> 8) & 0xFF);
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Rotor Control"));
  if (rotating) {
    display.print(rotateDirection > 0 ? F(" CW>") : F(" <CCW"));
  }

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Aktueller Azimuth gross
  display.setTextSize(3);
  display.setCursor(20, 18);
  if (currentAzimuth < 100) display.print(" ");
  if (currentAzimuth < 10) display.print(" ");
  display.print(currentAzimuth);
  display.setTextSize(1);
  display.print((char)247);  // Grad

  // Ziel
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print(F("Ziel: "));
  display.print(targetAzimuth);
  display.print((char)247);

  // Presets
  display.setCursor(0, 56);
  display.print(F("P:"));
  display.print(presets[0]);
  display.print(F("/"));
  display.print(presets[1]);
  display.print(F("/"));
  display.print(presets[2]);

  // Kompass-Grafik
  drawCompass(100, 35, 25);

  display.display();
}

void drawCompass(int cx, int cy, int r) {
  // Kreis
  display.drawCircle(cx, cy, r, SSD1306_WHITE);

  // Richtungsmarken
  display.setCursor(cx - 2, cy - r - 8);
  display.print("N");

  // Zeiger für aktuelle Position
  float angle = (currentAzimuth - 90) * PI / 180.0;
  int px = cx + cos(angle) * (r - 3);
  int py = cy + sin(angle) * (r - 3);
  display.drawLine(cx, cy, px, py, SSD1306_WHITE);
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'rotor_controller.ino',

  wiring: [
    { from: 'Rotor Positionsgeber', to: 'Arduino A0', color: 'Grün', notes: '0-5V' },
    { from: 'Arduino D4', to: 'Relais 1 (CW)', color: 'Blau' },
    { from: 'Arduino D5', to: 'Relais 2 (CCW)', color: 'Orange' },
    { from: 'Arduino D2', to: 'Encoder A', color: 'Weiß' },
    { from: 'Arduino D3', to: 'Encoder B', color: 'Grau' },
    { from: 'Arduino D6', to: 'Encoder Taster', color: 'Gelb', notes: 'nach GND' },
    { from: 'Arduino D7-D9', to: 'Preset-Taster', color: 'Gelb', notes: 'nach GND' },
    { from: 'Arduino A4/A5', to: 'OLED SDA/SCL', color: 'Grün/Gelb' },
    { from: 'Relais COM', to: 'Rotor Motor', notes: 'nach Anleitung' },
  ],

  customizationSuggestions: [
    'Elevation-Steuerung für Sat-Betrieb',
    'Hamlib/rotctl Protokoll',
    'Automatische Nachführung via CAT',
    'Endschalter-Eingänge',
    'Soft-Start/Stop für schonenden Betrieb',
  ],

  externalLinks: [
    { title: 'Easycomm Protokoll', url: 'http://www.qsl.net/dh1ngp/soft/easycomm.txt' },
  ],
};
