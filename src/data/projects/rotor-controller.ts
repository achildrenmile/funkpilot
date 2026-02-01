import type { HamProject } from '../../types/projects';

export const rotorController: HamProject = {
  id: 'rotor-controller',
  name: {
    de: 'Rotorsteuerung',
    en: 'Rotor Controller',
    sl: 'Krmilnik rotorja',
  },
  category: 'control',
  difficulty: 2,
  description: {
    de: 'Digitale Steuerung für Antennenrotoren. Anzeige des Azimuths auf OLED. Preset-Speicher für häufige Richtungen. USB-Fernsteuerung über PC.',
    en: 'Digital control for antenna rotators. Azimuth display on OLED. Preset memory for common directions. USB remote control via PC.',
    sl: 'Digitalno krmiljenje antenskih rotorjev. Prikaz azimuta na OLED zaslonu. Shranjeni prednastavitve za pogoste smeri. USB daljinsko upravljanje prek PC-ja.',
  },
  hardware: 'arduino-nano',

  components: [
    {
      name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' },
      quantity: 1,
    },
    {
      name: { de: 'OLED Display 0.96"', en: 'OLED Display 0.96"', sl: 'OLED zaslon 0,96"' },
      quantity: 1,
    },
    {
      name: { de: 'Relais-Modul 2-fach', en: '2-Channel Relay Module', sl: '2-kanalni relejni modul' },
      quantity: 1,
      notes: { de: 'für CW/CCW', en: 'for CW/CCW', sl: 'za CW/CCW' },
    },
    {
      name: { de: 'Potentiometer 10k', en: 'Potentiometer 10k', sl: 'Potenciometer 10k' },
      quantity: 1,
      notes: {
        de: 'falls Rotor keinen Positionsgeber hat',
        en: 'if rotor has no position sensor',
        sl: 'če rotor nima senzorja položaja',
      },
    },
    {
      name: { de: 'Drehencoder', en: 'Rotary Encoder', sl: 'Rotacijski enkoder' },
      quantity: 1,
      notes: { de: 'Manuelle Steuerung', en: 'Manual control', sl: 'Ročno upravljanje' },
    },
    {
      name: { de: 'Taster', en: 'Push Button', sl: 'Tipka' },
      quantity: 3,
      notes: { de: 'Preset 1/2/3', en: 'Preset 1/2/3', sl: 'Prednastavitev 1/2/3' },
    },
    {
      name: { de: 'LED', en: 'LED', sl: 'LED' },
      quantity: 3,
      notes: { de: 'CW/CCW/On', en: 'CW/CCW/On', sl: 'CW/CCW/Vklop' },
    },
    {
      name: { de: 'Widerstand 220 Ohm', en: 'Resistor 220 Ohm', sl: 'Upor 220 Ohm' },
      quantity: 3,
    },
    {
      name: { de: 'Klemmleiste', en: 'Terminal Block', sl: 'Priključna sponka' },
      quantity: 1,
      notes: { de: 'Anschluss Rotor', en: 'Rotor connection', sl: 'Priključek rotorja' },
    },
  ],
  estimatedCost: '~20€',

  code: {
    de: `// =====================================================
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
    en: `// =====================================================
// Rotor Controller - FunkPilot DIY Project
// Hardware: Arduino Nano + OLED + Relay
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// Controls azimuth rotors (Yaesu, Kenpro, etc.)
// Position sensor input for display
// USB remote control (Easycomm compatible)
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
const int POS_PIN = A0;        // Position sensor input
const int RELAY_CW = 4;        // Relay clockwise
const int RELAY_CCW = 5;       // Relay counter-clockwise
const int ENC_A = 2;           // Encoder A
const int ENC_B = 3;           // Encoder B
const int ENC_BTN = 6;         // Encoder button
const int BTN_PRESET1 = 7;     // Preset button
const int BTN_PRESET2 = 8;
const int BTN_PRESET3 = 9;
const int LED_CW = 10;
const int LED_CCW = 11;
const int LED_ON = 12;

// Calibration (adjust!)
const int POS_MIN = 50;        // ADC value at 0°
const int POS_MAX = 950;       // ADC value at 360°
const int TOLERANCE = 3;       // Tolerance in degrees

// Status
int currentAzimuth = 0;
int targetAzimuth = 0;
bool rotating = false;
int rotateDirection = 0;       // 1=CW, -1=CCW, 0=Stop

// Presets (in EEPROM)
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

  // Load presets
  loadPresets();

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED not found"));
  }

  digitalWrite(LED_ON, HIGH);

  Serial.println(F("Rotor Controller v1.0"));
  Serial.println(F("Commands: AZ xxx.x, STOP, P1, P2, P3"));
}

void loop() {
  // Read position
  readPosition();

  // Process encoder
  processEncoder();

  // Process buttons
  processButtons();

  // Serial commands
  processSerial();

  // Rotor logic
  processRotor();

  // Update display
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

  // Map to 0-360°
  currentAzimuth = map(raw, POS_MIN, POS_MAX, 0, 360);
  currentAzimuth = constrain(currentAzimuth, 0, 360);
}

void processEncoder() {
  if (encoderValue != 0) {
    targetAzimuth += encoderValue * 5;  // 5° per step
    targetAzimuth = ((targetAzimuth % 360) + 360) % 360;
    encoderValue = 0;
  }

  // Encoder button: Target = current (Stop)
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
      // Set preset: SP1 180
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

  // Calculate shortest path
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  if (abs(diff) <= TOLERANCE) {
    // Target reached
    stopRotor();
  } else if (diff > 0) {
    // Rotate CW
    rotateDirection = 1;
    digitalWrite(RELAY_CW, HIGH);
    digitalWrite(RELAY_CCW, LOW);
    digitalWrite(LED_CW, HIGH);
    digitalWrite(LED_CCW, LOW);
    rotating = true;
  } else {
    // Rotate CCW
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

  // Current azimuth large
  display.setTextSize(3);
  display.setCursor(20, 18);
  if (currentAzimuth < 100) display.print(" ");
  if (currentAzimuth < 10) display.print(" ");
  display.print(currentAzimuth);
  display.setTextSize(1);
  display.print((char)247);  // Degree

  // Target
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print(F("Target: "));
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

  // Compass graphic
  drawCompass(100, 35, 25);

  display.display();
}

void drawCompass(int cx, int cy, int r) {
  // Circle
  display.drawCircle(cx, cy, r, SSD1306_WHITE);

  // Direction markers
  display.setCursor(cx - 2, cy - r - 8);
  display.print("N");

  // Pointer for current position
  float angle = (currentAzimuth - 90) * PI / 180.0;
  int px = cx + cos(angle) * (r - 3);
  int py = cy + sin(angle) * (r - 3);
  display.drawLine(cx, cy, px, py, SSD1306_WHITE);
}
`,
    sl: `// =====================================================
// Krmilnik rotorja - FunkPilot DIY projekt
// Strojna oprema: Arduino Nano + OLED + Rele
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Krmili azimutne rotorje (Yaesu, Kenpro, itd.)
// Vhod senzorja položaja za prikaz
// USB daljinsko upravljanje (Easycomm kompatibilno)
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

// Pini
const int POS_PIN = A0;        // Vhod senzorja položaja
const int RELAY_CW = 4;        // Rele v smeri urinega kazalca
const int RELAY_CCW = 5;       // Rele v nasprotni smeri urinega kazalca
const int ENC_A = 2;           // Enkoder A
const int ENC_B = 3;           // Enkoder B
const int ENC_BTN = 6;         // Tipka enkoderja
const int BTN_PRESET1 = 7;     // Tipka prednastavitve
const int BTN_PRESET2 = 8;
const int BTN_PRESET3 = 9;
const int LED_CW = 10;
const int LED_CCW = 11;
const int LED_ON = 12;

// Kalibracija (prilagodite!)
const int POS_MIN = 50;        // ADC vrednost pri 0°
const int POS_MAX = 950;       // ADC vrednost pri 360°
const int TOLERANCE = 3;       // Toleranca v stopinjah

// Status
int currentAzimuth = 0;
int targetAzimuth = 0;
bool rotating = false;
int rotateDirection = 0;       // 1=CW, -1=CCW, 0=Stop

// Prednastavitve (v EEPROM)
int presets[3] = {0, 90, 180};
const int EEPROM_PRESETS = 0;

// Enkoder
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

  // Prekinitev enkoderja
  attachInterrupt(digitalPinToInterrupt(ENC_A), encoderISR, CHANGE);

  // Naloži prednastavitve
  loadPresets();

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED ni najden"));
  }

  digitalWrite(LED_ON, HIGH);

  Serial.println(F("Rotor Controller v1.0"));
  Serial.println(F("Ukazi: AZ xxx.x, STOP, P1, P2, P3"));
}

void loop() {
  // Preberi položaj
  readPosition();

  // Obdelaj enkoder
  processEncoder();

  // Obdelaj tipke
  processButtons();

  // Serijski ukazi
  processSerial();

  // Logika rotorja
  processRotor();

  // Posodobi zaslon
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

  // Preslika na 0-360°
  currentAzimuth = map(raw, POS_MIN, POS_MAX, 0, 360);
  currentAzimuth = constrain(currentAzimuth, 0, 360);
}

void processEncoder() {
  if (encoderValue != 0) {
    targetAzimuth += encoderValue * 5;  // 5° na korak
    targetAzimuth = ((targetAzimuth % 360) + 360) % 360;
    encoderValue = 0;
  }

  // Tipka enkoderja: Cilj = trenutni (Stop)
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
      // Nastavi prednastavitev: SP1 180
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

  // Izračunaj najkrajšo pot
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  if (abs(diff) <= TOLERANCE) {
    // Cilj dosežen
    stopRotor();
  } else if (diff > 0) {
    // Zavrti CW
    rotateDirection = 1;
    digitalWrite(RELAY_CW, HIGH);
    digitalWrite(RELAY_CCW, LOW);
    digitalWrite(LED_CW, HIGH);
    digitalWrite(LED_CCW, LOW);
    rotating = true;
  } else {
    // Zavrti CCW
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

  // Glava
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Rotor Control"));
  if (rotating) {
    display.print(rotateDirection > 0 ? F(" CW>") : F(" <CCW"));
  }

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Trenutni azimut velik
  display.setTextSize(3);
  display.setCursor(20, 18);
  if (currentAzimuth < 100) display.print(" ");
  if (currentAzimuth < 10) display.print(" ");
  display.print(currentAzimuth);
  display.setTextSize(1);
  display.print((char)247);  // Stopinja

  // Cilj
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print(F("Cilj: "));
  display.print(targetAzimuth);
  display.print((char)247);

  // Prednastavitve
  display.setCursor(0, 56);
  display.print(F("P:"));
  display.print(presets[0]);
  display.print(F("/"));
  display.print(presets[1]);
  display.print(F("/"));
  display.print(presets[2]);

  // Grafika kompasa
  drawCompass(100, 35, 25);

  display.display();
}

void drawCompass(int cx, int cy, int r) {
  // Krog
  display.drawCircle(cx, cy, r, SSD1306_WHITE);

  // Oznake smeri
  display.setCursor(cx - 2, cy - r - 8);
  display.print("N");

  // Kazalec za trenutni položaj
  float angle = (currentAzimuth - 90) * PI / 180.0;
  int px = cx + cos(angle) * (r - 3);
  int py = cy + sin(angle) * (r - 3);
  display.drawLine(cx, cy, px, py, SSD1306_WHITE);
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'rotor_controller.ino',

  wiring: [
    {
      from: { de: 'Rotor Positionsgeber', en: 'Rotor Position Sensor', sl: 'Senzor položaja rotorja' },
      to: { de: 'Arduino A0', en: 'Arduino A0', sl: 'Arduino A0' },
      color: 'Grün',
      notes: { de: '0-5V', en: '0-5V', sl: '0-5V' },
    },
    {
      from: { de: 'Arduino D4', en: 'Arduino D4', sl: 'Arduino D4' },
      to: { de: 'Relais 1 (CW)', en: 'Relay 1 (CW)', sl: 'Rele 1 (CW)' },
      color: 'Blau',
    },
    {
      from: { de: 'Arduino D5', en: 'Arduino D5', sl: 'Arduino D5' },
      to: { de: 'Relais 2 (CCW)', en: 'Relay 2 (CCW)', sl: 'Rele 2 (CCW)' },
      color: 'Orange',
    },
    {
      from: { de: 'Arduino D2', en: 'Arduino D2', sl: 'Arduino D2' },
      to: { de: 'Encoder A', en: 'Encoder A', sl: 'Enkoder A' },
      color: 'Weiß',
    },
    {
      from: { de: 'Arduino D3', en: 'Arduino D3', sl: 'Arduino D3' },
      to: { de: 'Encoder B', en: 'Encoder B', sl: 'Enkoder B' },
      color: 'Grau',
    },
    {
      from: { de: 'Arduino D6', en: 'Arduino D6', sl: 'Arduino D6' },
      to: { de: 'Encoder Taster', en: 'Encoder Button', sl: 'Tipka enkoderja' },
      color: 'Gelb',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' },
    },
    {
      from: { de: 'Arduino D7-D9', en: 'Arduino D7-D9', sl: 'Arduino D7-D9' },
      to: { de: 'Preset-Taster', en: 'Preset Buttons', sl: 'Tipke prednastavitev' },
      color: 'Gelb',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' },
    },
    {
      from: { de: 'Arduino A4/A5', en: 'Arduino A4/A5', sl: 'Arduino A4/A5' },
      to: { de: 'OLED SDA/SCL', en: 'OLED SDA/SCL', sl: 'OLED SDA/SCL' },
      color: 'Grün/Gelb',
    },
    {
      from: { de: 'Relais COM', en: 'Relay COM', sl: 'Rele COM' },
      to: { de: 'Rotor Motor', en: 'Rotor Motor', sl: 'Motor rotorja' },
      notes: { de: 'nach Anleitung', en: 'according to manual', sl: 'po navodilih' },
    },
  ],

  customizationSuggestions: [
    {
      de: 'Elevation-Steuerung für Sat-Betrieb',
      en: 'Elevation control for satellite operation',
      sl: 'Krmiljenje elevacije za satelitsko delovanje',
    },
    {
      de: 'Hamlib/rotctl Protokoll',
      en: 'Hamlib/rotctl protocol',
      sl: 'Hamlib/rotctl protokol',
    },
    {
      de: 'Automatische Nachführung via CAT',
      en: 'Automatic tracking via CAT',
      sl: 'Samodejno sledenje prek CAT',
    },
    {
      de: 'Endschalter-Eingänge',
      en: 'Limit switch inputs',
      sl: 'Vhodi končnih stikal',
    },
    {
      de: 'Soft-Start/Stop für schonenden Betrieb',
      en: 'Soft start/stop for gentle operation',
      sl: 'Mehki zagon/ustavitev za nežno delovanje',
    },
  ],

  externalLinks: [
    {
      title: { de: 'Easycomm Protokoll', en: 'Easycomm Protocol', sl: 'Easycomm protokol' },
      url: 'http://www.qsl.net/dh1ngp/soft/easycomm.txt',
    },
  ],
};
