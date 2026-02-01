import type { HamProject } from '../../types/projects';

export const bandfilterSwitch: HamProject = {
  id: 'bandfilter-switch',
  name: {
    de: 'Automatischer Bandfilter-Umschalter',
    en: 'Automatic Band Filter Switch',
    sl: 'Avtomatsko stikalo za pasovne filtre'
  },
  category: 'control',
  difficulty: 2,
  description: {
    de: 'Schaltet automatisch das richtige Bandpassfilter basierend auf der Frequenz. Band-Decoder Eingang vom Transceiver oder CAT-Steuerung. Bis zu 10 Bänder.',
    en: 'Automatically switches to the correct bandpass filter based on frequency. Band decoder input from transceiver or CAT control. Up to 10 bands.',
    sl: 'Samodejno preklopi na pravi pasovni filter glede na frekvenco. Vhod za dekoder pasov iz oddajnika ali CAT-krmiljenje. Do 10 pasov.'
  },
  hardware: 'arduino-nano',

  components: [
    { name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' }, quantity: 1 },
    { name: { de: 'OLED Display 0.96"', en: 'OLED Display 0.96"', sl: 'OLED zaslon 0,96"' }, quantity: 1 },
    { name: { de: 'Relais-Modul 8-fach', en: '8-channel Relay Module', sl: '8-kanalni relejni modul' }, quantity: 1, notes: { de: 'für 8 Bandfilter', en: 'for 8 band filters', sl: 'za 8 pasovnih filtrov' } },
    { name: { de: 'Optokoppler PC817', en: 'Optocoupler PC817', sl: 'Optosklopnik PC817' }, quantity: 4, notes: { de: 'Band-Decoder Eingang', en: 'Band decoder input', sl: 'Vhod za dekoder pasov' } },
    { name: { de: 'LED 3mm', en: 'LED 3mm', sl: 'LED 3mm' }, quantity: 8, notes: { de: 'Band-Anzeige', en: 'Band indicator', sl: 'Indikator pasu' } },
    { name: { de: 'Widerstand 1k', en: 'Resistor 1k', sl: 'Upor 1k' }, quantity: 8 },
    { name: { de: 'Widerstand 220 Ohm', en: 'Resistor 220 Ohm', sl: 'Upor 220 Ohm' }, quantity: 8 },
    { name: { de: 'Stiftleiste', en: 'Pin Header', sl: 'Zatični konektor' }, quantity: 1, notes: { de: 'Band-Decoder Anschluss', en: 'Band decoder connection', sl: 'Priključek za dekoder pasov' } },
  ],
  estimatedCost: '~25€',

  code: {
    de: `// =====================================================
// Automatischer Bandfilter-Umschalter - FunkPilot
// Hardware: Arduino Nano + 8x Relais
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Unterstützt:
// - Band-Decoder (Yaesu, Icom, Elecraft Format)
// - CAT-Steuerung über Serial
// - Manuelle Auswahl per Taster
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Band-Decoder Eingänge (Active Low durch Optokoppler)
const int BD_A = 2;   // Bit 0
const int BD_B = 3;   // Bit 1
const int BD_C = 14;  // A0, Bit 2
const int BD_D = 15;  // A1, Bit 3

// Relais-Ausgänge
const int RELAY_PINS[] = {4, 5, 6, 7, 8, 9, 10, 11};
const int NUM_RELAYS = 8;

// LED-Ausgänge (optional, parallel zu Relais)
const int LED_ACTIVE = 12;

// Manuelle Taster
const int BTN_UP = A2;
const int BTN_DOWN = A3;

// Band-Definitionen
struct BandInfo {
  const char* name;
  int freqMHz;
  int decoderCode;  // Yaesu Band-Data Code
};

const BandInfo bands[] = {
  {"160m", 1,  0b0001},
  {"80m",  3,  0b0010},
  {"40m",  7,  0b0011},
  {"30m",  10, 0b0100},
  {"20m",  14, 0b0101},
  {"17m",  18, 0b0110},
  {"15m",  21, 0b0111},
  {"12m",  24, 0b1000},
  {"10m",  28, 0b1001},
  {"6m",   50, 0b1010},
};
const int NUM_BANDS = 10;

// Status
int currentBand = 4;  // 20m als Default
int lastDecoderValue = -1;
bool manualMode = false;

void setup() {
  Serial.begin(9600);

  // Band-Decoder Eingänge
  pinMode(BD_A, INPUT_PULLUP);
  pinMode(BD_B, INPUT_PULLUP);
  pinMode(BD_C, INPUT_PULLUP);
  pinMode(BD_D, INPUT_PULLUP);

  // Relais-Ausgänge
  for (int i = 0; i < NUM_RELAYS; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], LOW);
  }

  pinMode(LED_ACTIVE, OUTPUT);
  pinMode(BTN_UP, INPUT_PULLUP);
  pinMode(BTN_DOWN, INPUT_PULLUP);

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED nicht gefunden"));
  }

  // Startup
  selectBand(currentBand);

  Serial.println(F("Bandfilter-Umschalter v1.0"));
  Serial.println(F("Befehle: BAND <nr>, FREQ <MHz>, STATUS"));
}

void loop() {
  // Band-Decoder lesen
  int decoderValue = readBandDecoder();

  if (decoderValue != lastDecoderValue && decoderValue > 0) {
    lastDecoderValue = decoderValue;
    manualMode = false;

    // Band aus Decoder-Code finden
    int band = findBandByDecoder(decoderValue);
    if (band >= 0) {
      selectBand(band);
    }
  }

  // Manuelle Taster
  if (!digitalRead(BTN_UP)) {
    delay(50);
    while(!digitalRead(BTN_UP));
    manualMode = true;
    currentBand = (currentBand + 1) % NUM_BANDS;
    selectBand(currentBand);
    delay(100);
  }

  if (!digitalRead(BTN_DOWN)) {
    delay(50);
    while(!digitalRead(BTN_DOWN));
    manualMode = true;
    currentBand = (currentBand - 1 + NUM_BANDS) % NUM_BANDS;
    selectBand(currentBand);
    delay(100);
  }

  // Serial-Befehle
  processSerial();

  // Anzeige
  updateDisplay();

  delay(50);
}

int readBandDecoder() {
  int value = 0;
  if (!digitalRead(BD_A)) value |= 1;
  if (!digitalRead(BD_B)) value |= 2;
  if (!digitalRead(BD_C)) value |= 4;
  if (!digitalRead(BD_D)) value |= 8;
  return value;
}

int findBandByDecoder(int code) {
  for (int i = 0; i < NUM_BANDS; i++) {
    if (bands[i].decoderCode == code) {
      return i;
    }
  }
  return -1;
}

int findBandByFreq(int freqMHz) {
  for (int i = 0; i < NUM_BANDS; i++) {
    // Toleranz für Bandgrenzen
    if (freqMHz >= bands[i].freqMHz - 1 &&
        freqMHz <= bands[i].freqMHz + 3) {
      return i;
    }
  }
  return -1;
}

void selectBand(int band) {
  if (band < 0 || band >= NUM_BANDS) return;

  currentBand = band;

  // Alle Relais aus
  for (int i = 0; i < NUM_RELAYS; i++) {
    digitalWrite(RELAY_PINS[i], LOW);
  }

  // Passendes Relais ein (wenn Band <= 8)
  if (band < NUM_RELAYS) {
    digitalWrite(RELAY_PINS[band], HIGH);
  }

  digitalWrite(LED_ACTIVE, HIGH);
  delay(50);
  digitalWrite(LED_ACTIVE, LOW);

  Serial.print(F("Band: "));
  Serial.println(bands[band].name);
}

void processSerial() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    cmd.toUpperCase();

    if (cmd.startsWith("BAND ")) {
      int band = cmd.substring(5).toInt();
      if (band >= 0 && band < NUM_BANDS) {
        manualMode = true;
        selectBand(band);
        Serial.println(F("OK"));
      }
    }
    else if (cmd.startsWith("FREQ ")) {
      int freq = cmd.substring(5).toInt();
      int band = findBandByFreq(freq);
      if (band >= 0) {
        selectBand(band);
        Serial.println(F("OK"));
      } else {
        Serial.println(F("ERROR: Band nicht gefunden"));
      }
    }
    else if (cmd == "STATUS" || cmd == "?") {
      Serial.print(F("Aktuell: "));
      Serial.print(bands[currentBand].name);
      Serial.print(F(" ("));
      Serial.print(currentBand);
      Serial.print(F(") Modus: "));
      Serial.println(manualMode ? F("MANUELL") : F("AUTO"));
    }
    else if (cmd == "AUTO") {
      manualMode = false;
      Serial.println(F("Automodus aktiviert"));
    }
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Kopfzeile
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Bandfilter "));
  display.println(manualMode ? F("[MAN]") : F("[AUTO]"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Aktuelles Band gross
  display.setTextSize(3);
  display.setCursor(25, 18);
  display.println(bands[currentBand].name);

  // Frequenz
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print(bands[currentBand].freqMHz);
  display.println(F(" MHz"));

  // Band-Übersicht (kleine Balken)
  display.setCursor(0, 56);
  for (int i = 0; i < min(NUM_BANDS, 10); i++) {
    if (i == currentBand) {
      display.fillRect(i * 12, 56, 10, 7, SSD1306_WHITE);
    } else {
      display.drawRect(i * 12, 56, 10, 7, SSD1306_WHITE);
    }
  }

  display.display();
}
`,
    en: `// =====================================================
// Automatic Band Filter Switch - FunkPilot
// Hardware: Arduino Nano + 8x Relay
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// Supports:
// - Band Decoder (Yaesu, Icom, Elecraft format)
// - CAT control via Serial
// - Manual selection via buttons
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Band Decoder Inputs (Active Low via optocoupler)
const int BD_A = 2;   // Bit 0
const int BD_B = 3;   // Bit 1
const int BD_C = 14;  // A0, Bit 2
const int BD_D = 15;  // A1, Bit 3

// Relay Outputs
const int RELAY_PINS[] = {4, 5, 6, 7, 8, 9, 10, 11};
const int NUM_RELAYS = 8;

// LED Outputs (optional, parallel to relays)
const int LED_ACTIVE = 12;

// Manual Buttons
const int BTN_UP = A2;
const int BTN_DOWN = A3;

// Band Definitions
struct BandInfo {
  const char* name;
  int freqMHz;
  int decoderCode;  // Yaesu Band-Data Code
};

const BandInfo bands[] = {
  {"160m", 1,  0b0001},
  {"80m",  3,  0b0010},
  {"40m",  7,  0b0011},
  {"30m",  10, 0b0100},
  {"20m",  14, 0b0101},
  {"17m",  18, 0b0110},
  {"15m",  21, 0b0111},
  {"12m",  24, 0b1000},
  {"10m",  28, 0b1001},
  {"6m",   50, 0b1010},
};
const int NUM_BANDS = 10;

// Status
int currentBand = 4;  // 20m as default
int lastDecoderValue = -1;
bool manualMode = false;

void setup() {
  Serial.begin(9600);

  // Band Decoder Inputs
  pinMode(BD_A, INPUT_PULLUP);
  pinMode(BD_B, INPUT_PULLUP);
  pinMode(BD_C, INPUT_PULLUP);
  pinMode(BD_D, INPUT_PULLUP);

  // Relay Outputs
  for (int i = 0; i < NUM_RELAYS; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], LOW);
  }

  pinMode(LED_ACTIVE, OUTPUT);
  pinMode(BTN_UP, INPUT_PULLUP);
  pinMode(BTN_DOWN, INPUT_PULLUP);

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED not found"));
  }

  // Startup
  selectBand(currentBand);

  Serial.println(F("Band Filter Switch v1.0"));
  Serial.println(F("Commands: BAND <nr>, FREQ <MHz>, STATUS"));
}

void loop() {
  // Read Band Decoder
  int decoderValue = readBandDecoder();

  if (decoderValue != lastDecoderValue && decoderValue > 0) {
    lastDecoderValue = decoderValue;
    manualMode = false;

    // Find band from decoder code
    int band = findBandByDecoder(decoderValue);
    if (band >= 0) {
      selectBand(band);
    }
  }

  // Manual Buttons
  if (!digitalRead(BTN_UP)) {
    delay(50);
    while(!digitalRead(BTN_UP));
    manualMode = true;
    currentBand = (currentBand + 1) % NUM_BANDS;
    selectBand(currentBand);
    delay(100);
  }

  if (!digitalRead(BTN_DOWN)) {
    delay(50);
    while(!digitalRead(BTN_DOWN));
    manualMode = true;
    currentBand = (currentBand - 1 + NUM_BANDS) % NUM_BANDS;
    selectBand(currentBand);
    delay(100);
  }

  // Serial Commands
  processSerial();

  // Display
  updateDisplay();

  delay(50);
}

int readBandDecoder() {
  int value = 0;
  if (!digitalRead(BD_A)) value |= 1;
  if (!digitalRead(BD_B)) value |= 2;
  if (!digitalRead(BD_C)) value |= 4;
  if (!digitalRead(BD_D)) value |= 8;
  return value;
}

int findBandByDecoder(int code) {
  for (int i = 0; i < NUM_BANDS; i++) {
    if (bands[i].decoderCode == code) {
      return i;
    }
  }
  return -1;
}

int findBandByFreq(int freqMHz) {
  for (int i = 0; i < NUM_BANDS; i++) {
    // Tolerance for band edges
    if (freqMHz >= bands[i].freqMHz - 1 &&
        freqMHz <= bands[i].freqMHz + 3) {
      return i;
    }
  }
  return -1;
}

void selectBand(int band) {
  if (band < 0 || band >= NUM_BANDS) return;

  currentBand = band;

  // All relays off
  for (int i = 0; i < NUM_RELAYS; i++) {
    digitalWrite(RELAY_PINS[i], LOW);
  }

  // Matching relay on (if band <= 8)
  if (band < NUM_RELAYS) {
    digitalWrite(RELAY_PINS[band], HIGH);
  }

  digitalWrite(LED_ACTIVE, HIGH);
  delay(50);
  digitalWrite(LED_ACTIVE, LOW);

  Serial.print(F("Band: "));
  Serial.println(bands[band].name);
}

void processSerial() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    cmd.toUpperCase();

    if (cmd.startsWith("BAND ")) {
      int band = cmd.substring(5).toInt();
      if (band >= 0 && band < NUM_BANDS) {
        manualMode = true;
        selectBand(band);
        Serial.println(F("OK"));
      }
    }
    else if (cmd.startsWith("FREQ ")) {
      int freq = cmd.substring(5).toInt();
      int band = findBandByFreq(freq);
      if (band >= 0) {
        selectBand(band);
        Serial.println(F("OK"));
      } else {
        Serial.println(F("ERROR: Band not found"));
      }
    }
    else if (cmd == "STATUS" || cmd == "?") {
      Serial.print(F("Current: "));
      Serial.print(bands[currentBand].name);
      Serial.print(F(" ("));
      Serial.print(currentBand);
      Serial.print(F(") Mode: "));
      Serial.println(manualMode ? F("MANUAL") : F("AUTO"));
    }
    else if (cmd == "AUTO") {
      manualMode = false;
      Serial.println(F("Auto mode enabled"));
    }
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Band Filter "));
  display.println(manualMode ? F("[MAN]") : F("[AUTO]"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Current band large
  display.setTextSize(3);
  display.setCursor(25, 18);
  display.println(bands[currentBand].name);

  // Frequency
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print(bands[currentBand].freqMHz);
  display.println(F(" MHz"));

  // Band overview (small bars)
  display.setCursor(0, 56);
  for (int i = 0; i < min(NUM_BANDS, 10); i++) {
    if (i == currentBand) {
      display.fillRect(i * 12, 56, 10, 7, SSD1306_WHITE);
    } else {
      display.drawRect(i * 12, 56, 10, 7, SSD1306_WHITE);
    }
  }

  display.display();
}
`,
    sl: `// =====================================================
// Avtomatsko stikalo za pasovne filtre - FunkPilot
// Strojna oprema: Arduino Nano + 8x rele
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Podpira:
// - Dekoder pasov (Yaesu, Icom, Elecraft format)
// - CAT-krmiljenje preko Serial
// - Rocna izbira s tipkami
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Vhodi dekoderja pasov (Active Low preko optosklopnika)
const int BD_A = 2;   // Bit 0
const int BD_B = 3;   // Bit 1
const int BD_C = 14;  // A0, Bit 2
const int BD_D = 15;  // A1, Bit 3

// Izhodi relejev
const int RELAY_PINS[] = {4, 5, 6, 7, 8, 9, 10, 11};
const int NUM_RELAYS = 8;

// LED izhodi (neobvezno, vzporedno z releji)
const int LED_ACTIVE = 12;

// Rocne tipke
const int BTN_UP = A2;
const int BTN_DOWN = A3;

// Definicije pasov
struct BandInfo {
  const char* name;
  int freqMHz;
  int decoderCode;  // Yaesu Band-Data Code
};

const BandInfo bands[] = {
  {"160m", 1,  0b0001},
  {"80m",  3,  0b0010},
  {"40m",  7,  0b0011},
  {"30m",  10, 0b0100},
  {"20m",  14, 0b0101},
  {"17m",  18, 0b0110},
  {"15m",  21, 0b0111},
  {"12m",  24, 0b1000},
  {"10m",  28, 0b1001},
  {"6m",   50, 0b1010},
};
const int NUM_BANDS = 10;

// Status
int currentBand = 4;  // 20m kot privzeto
int lastDecoderValue = -1;
bool manualMode = false;

void setup() {
  Serial.begin(9600);

  // Vhodi dekoderja pasov
  pinMode(BD_A, INPUT_PULLUP);
  pinMode(BD_B, INPUT_PULLUP);
  pinMode(BD_C, INPUT_PULLUP);
  pinMode(BD_D, INPUT_PULLUP);

  // Izhodi relejev
  for (int i = 0; i < NUM_RELAYS; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], LOW);
  }

  pinMode(LED_ACTIVE, OUTPUT);
  pinMode(BTN_UP, INPUT_PULLUP);
  pinMode(BTN_DOWN, INPUT_PULLUP);

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED ni najden"));
  }

  // Zagon
  selectBand(currentBand);

  Serial.println(F("Stikalo za pasovne filtre v1.0"));
  Serial.println(F("Ukazi: BAND <st>, FREQ <MHz>, STATUS"));
}

void loop() {
  // Branje dekoderja pasov
  int decoderValue = readBandDecoder();

  if (decoderValue != lastDecoderValue && decoderValue > 0) {
    lastDecoderValue = decoderValue;
    manualMode = false;

    // Iskanje pasu iz kode dekoderja
    int band = findBandByDecoder(decoderValue);
    if (band >= 0) {
      selectBand(band);
    }
  }

  // Rocne tipke
  if (!digitalRead(BTN_UP)) {
    delay(50);
    while(!digitalRead(BTN_UP));
    manualMode = true;
    currentBand = (currentBand + 1) % NUM_BANDS;
    selectBand(currentBand);
    delay(100);
  }

  if (!digitalRead(BTN_DOWN)) {
    delay(50);
    while(!digitalRead(BTN_DOWN));
    manualMode = true;
    currentBand = (currentBand - 1 + NUM_BANDS) % NUM_BANDS;
    selectBand(currentBand);
    delay(100);
  }

  // Serijski ukazi
  processSerial();

  // Prikaz
  updateDisplay();

  delay(50);
}

int readBandDecoder() {
  int value = 0;
  if (!digitalRead(BD_A)) value |= 1;
  if (!digitalRead(BD_B)) value |= 2;
  if (!digitalRead(BD_C)) value |= 4;
  if (!digitalRead(BD_D)) value |= 8;
  return value;
}

int findBandByDecoder(int code) {
  for (int i = 0; i < NUM_BANDS; i++) {
    if (bands[i].decoderCode == code) {
      return i;
    }
  }
  return -1;
}

int findBandByFreq(int freqMHz) {
  for (int i = 0; i < NUM_BANDS; i++) {
    // Toleranca za meje pasu
    if (freqMHz >= bands[i].freqMHz - 1 &&
        freqMHz <= bands[i].freqMHz + 3) {
      return i;
    }
  }
  return -1;
}

void selectBand(int band) {
  if (band < 0 || band >= NUM_BANDS) return;

  currentBand = band;

  // Vsi releji izklopljeni
  for (int i = 0; i < NUM_RELAYS; i++) {
    digitalWrite(RELAY_PINS[i], LOW);
  }

  // Ustrezni rele vklopljen (ce je pas <= 8)
  if (band < NUM_RELAYS) {
    digitalWrite(RELAY_PINS[band], HIGH);
  }

  digitalWrite(LED_ACTIVE, HIGH);
  delay(50);
  digitalWrite(LED_ACTIVE, LOW);

  Serial.print(F("Pas: "));
  Serial.println(bands[band].name);
}

void processSerial() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    cmd.toUpperCase();

    if (cmd.startsWith("BAND ")) {
      int band = cmd.substring(5).toInt();
      if (band >= 0 && band < NUM_BANDS) {
        manualMode = true;
        selectBand(band);
        Serial.println(F("OK"));
      }
    }
    else if (cmd.startsWith("FREQ ")) {
      int freq = cmd.substring(5).toInt();
      int band = findBandByFreq(freq);
      if (band >= 0) {
        selectBand(band);
        Serial.println(F("OK"));
      } else {
        Serial.println(F("NAPAKA: Pas ni najden"));
      }
    }
    else if (cmd == "STATUS" || cmd == "?") {
      Serial.print(F("Trenutno: "));
      Serial.print(bands[currentBand].name);
      Serial.print(F(" ("));
      Serial.print(currentBand);
      Serial.print(F(") Nacin: "));
      Serial.println(manualMode ? F("ROCNO") : F("AUTO"));
    }
    else if (cmd == "AUTO") {
      manualMode = false;
      Serial.println(F("Samodejni nacin omogocen"));
    }
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Glava
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Pasovni filter "));
  display.println(manualMode ? F("[ROC]") : F("[AUTO]"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Trenutni pas veliko
  display.setTextSize(3);
  display.setCursor(25, 18);
  display.println(bands[currentBand].name);

  // Frekvenca
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print(bands[currentBand].freqMHz);
  display.println(F(" MHz"));

  // Pregled pasov (majhne vrstice)
  display.setCursor(0, 56);
  for (int i = 0; i < min(NUM_BANDS, 10); i++) {
    if (i == currentBand) {
      display.fillRect(i * 12, 56, 10, 7, SSD1306_WHITE);
    } else {
      display.drawRect(i * 12, 56, 10, 7, SSD1306_WHITE);
    }
  }

  display.display();
}
`
  },
  codeLanguage: 'cpp',
  codeFileName: 'bandfilter_switch.ino',

  wiring: [
    { from: { de: 'TRX Band-Data A', en: 'TRX Band-Data A', sl: 'TRX Band-Data A' }, to: { de: 'Optokoppler 1 → Arduino D2', en: 'Optocoupler 1 → Arduino D2', sl: 'Optosklopnik 1 → Arduino D2' }, color: 'Weiß' },
    { from: { de: 'TRX Band-Data B', en: 'TRX Band-Data B', sl: 'TRX Band-Data B' }, to: { de: 'Optokoppler 2 → Arduino D3', en: 'Optocoupler 2 → Arduino D3', sl: 'Optosklopnik 2 → Arduino D3' }, color: 'Grau' },
    { from: { de: 'TRX Band-Data C', en: 'TRX Band-Data C', sl: 'TRX Band-Data C' }, to: { de: 'Optokoppler 3 → Arduino A0', en: 'Optocoupler 3 → Arduino A0', sl: 'Optosklopnik 3 → Arduino A0' }, color: 'Braun' },
    { from: { de: 'TRX Band-Data D', en: 'TRX Band-Data D', sl: 'TRX Band-Data D' }, to: { de: 'Optokoppler 4 → Arduino A1', en: 'Optocoupler 4 → Arduino A1', sl: 'Optosklopnik 4 → Arduino A1' }, color: 'Gelb' },
    { from: { de: 'Arduino D4-D11', en: 'Arduino D4-D11', sl: 'Arduino D4-D11' }, to: { de: 'Relais-Modul IN1-IN8', en: 'Relay Module IN1-IN8', sl: 'Relejni modul IN1-IN8' }, color: 'Blau' },
    { from: { de: 'Relais COM', en: 'Relay COM', sl: 'Rele COM' }, to: { de: 'Bandfilter Eingang', en: 'Band Filter Input', sl: 'Vhod pasovnega filtra' }, notes: { de: 'HF-Pfad', en: 'RF path', sl: 'RF pot' } },
    { from: { de: 'Relais NO', en: 'Relay NO', sl: 'Rele NO' }, to: { de: 'Bandfilter Ausgang', en: 'Band Filter Output', sl: 'Izhod pasovnega filtra' }, notes: { de: 'zum jeweiligen Filter', en: 'to respective filter', sl: 'do ustreznega filtra' } },
    { from: { de: 'Arduino A2', en: 'Arduino A2', sl: 'Arduino A2' }, to: { de: 'Taster Band Up', en: 'Button Band Up', sl: 'Tipka pas gor' }, color: 'Gelb', notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' } },
    { from: { de: 'Arduino A3', en: 'Arduino A3', sl: 'Arduino A3' }, to: { de: 'Taster Band Down', en: 'Button Band Down', sl: 'Tipka pas dol' }, color: 'Grün', notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' } },
    { from: { de: 'Arduino A4/A5', en: 'Arduino A4/A5', sl: 'Arduino A4/A5' }, to: { de: 'OLED SDA/SCL', en: 'OLED SDA/SCL', sl: 'OLED SDA/SCL' } },
    { from: { de: 'Arduino 5V', en: 'Arduino 5V', sl: 'Arduino 5V' }, to: { de: 'Relais-Modul VCC + OLED VCC', en: 'Relay Module VCC + OLED VCC', sl: 'Relejni modul VCC + OLED VCC' }, color: 'Rot' },
    { from: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' }, to: { de: 'Alle GND', en: 'All GND', sl: 'Vsi GND' }, color: 'Schwarz' },
  ],

  customizationSuggestions: [
    { de: 'CAT-Steuerung für direkte Frequenzabfrage', en: 'CAT control for direct frequency query', sl: 'CAT-krmiljenje za neposredno poizvedbo frekvence' },
    { de: 'Sequencer-Funktion für PA', en: 'Sequencer function for PA', sl: 'Funkcija sekvenserja za PA' },
    { de: 'Logging der Bandwechsel', en: 'Logging of band changes', sl: 'Beleženje sprememb pasov' },
    { de: 'Web-Interface mit ESP32', en: 'Web interface with ESP32', sl: 'Spletni vmesnik z ESP32' },
    { de: 'LDMOS-Schutz bei falscher Filterauswahl', en: 'LDMOS protection for wrong filter selection', sl: 'LDMOS zascita pri napacni izbiri filtra' },
  ],

  externalLinks: [
    { title: { de: 'Yaesu Band Data', en: 'Yaesu Band Data', sl: 'Yaesu Band Data' }, url: 'https://www.yaesu.com/' },
    { title: { de: 'Icom CI-V Band Data', en: 'Icom CI-V Band Data', sl: 'Icom CI-V Band Data' }, url: 'https://www.icomamerica.com/' },
  ],
};
