import type { HamProject } from '../../types/projects';

export const cwAudioFilter: HamProject = {
  id: 'cw-audio-filter',
  name: {
    de: 'CW-Audiofilter',
    en: 'CW Audio Filter',
    sl: 'CW avdio filter',
  },
  category: 'audio',
  difficulty: 2,
  description: {
    de: 'Aktiver Bandpassfilter für CW-Empfang. Einstellbare Mittenfrequenz (400-1000 Hz) und Bandbreite. Unterdrückt QRM und verbessert die Lesbarkeit bei schwachen Signalen.',
    en: 'Active bandpass filter for CW reception. Adjustable center frequency (400-1000 Hz) and bandwidth. Suppresses QRM and improves readability with weak signals.',
    sl: 'Aktivni pasovno prepustni filter za CW sprejem. Nastavljiva srednja frekvenca (400-1000 Hz) in pasovna širina. Zmanjšuje QRM in izboljšuje berljivost šibkih signalov.',
  },
  hardware: 'arduino-nano',

  components: [
    { name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' }, quantity: 1 },
    { name: { de: 'Operationsverstärker LM358', en: 'Operational amplifier LM358', sl: 'Operacijski ojačevalnik LM358' }, quantity: 2, notes: { de: 'oder TL072', en: 'or TL072', sl: 'ali TL072' } },
    { name: { de: 'OLED Display 0.96"', en: 'OLED Display 0.96"', sl: 'OLED zaslon 0.96"' }, quantity: 1, notes: { de: 'optional', en: 'optional', sl: 'opcijsko' } },
    { name: { de: 'Potentiometer 10k', en: 'Potentiometer 10k', sl: 'Potenciometer 10k' }, quantity: 2, notes: { de: 'Frequenz + Bandbreite', en: 'Frequency + Bandwidth', sl: 'Frekvenca + Pasovna širina' } },
    { name: { de: 'Digital-Poti MCP4131', en: 'Digital pot MCP4131', sl: 'Digitalni pot MCP4131' }, quantity: 2, notes: { de: 'für digitale Steuerung', en: 'for digital control', sl: 'za digitalno krmiljenje' } },
    { name: { de: 'Kondensator 100nF', en: 'Capacitor 100nF', sl: 'Kondenzator 100nF' }, quantity: 4 },
    { name: { de: 'Kondensator 10nF', en: 'Capacitor 10nF', sl: 'Kondenzator 10nF' }, quantity: 4 },
    { name: { de: 'Kondensator 1µF', en: 'Capacitor 1µF', sl: 'Kondenzator 1µF' }, quantity: 2 },
    { name: { de: 'Widerstand div.', en: 'Resistors assorted', sl: 'Upori različni' }, quantity: 1, notes: { de: 'Set 1k-100k', en: 'Set 1k-100k', sl: 'Set 1k-100k' } },
    { name: { de: 'Klinkenbuchse 3.5mm', en: '3.5mm jack socket', sl: '3.5mm vtičnica' }, quantity: 2, notes: { de: 'Ein-/Ausgang', en: 'Input/Output', sl: 'Vhod/Izhod' } },
    { name: { de: 'Drehencoder', en: 'Rotary encoder', sl: 'Rotacijski enkoder' }, quantity: 2, notes: { de: 'optional statt Potis', en: 'optional instead of pots', sl: 'opcijsko namesto potov' } },
  ],
  estimatedCost: '~18€',

  code: {
    de: `// =====================================================
// CW-Audiofilter Digital Control - FunkPilot
// Hardware: Arduino Nano + MCP4131 + OLED
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Steuert digitale Potentiometer für einen aktiven
// CW-Bandpassfilter mit einstellbarer Frequenz/Bandbreite
//
// Die eigentliche Filterung erfolgt analog!
//
// =====================================================

#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// MCP4131 Digital Potis (SPI)
const int CS_FREQ = 10;    // Chip Select für Frequenz-Poti
const int CS_BW = 9;       // Chip Select für Bandbreite-Poti

// Drehencoder Pins
const int ENC_FREQ_A = 2;
const int ENC_FREQ_B = 3;
const int ENC_BW_A = 4;
const int ENC_BW_B = 5;
const int BTN_PRESET = 6;  // Preset-Taster

// Aktuelle Werte (0-127 für MCP4131)
int freqValue = 64;        // Mittenfrequenz
int bwValue = 64;          // Bandbreite

// Frequenz-Tabelle (ungefähre Zuordnung)
// Wert 0 = 400 Hz, Wert 127 = 1000 Hz
const int MIN_FREQ = 400;
const int MAX_FREQ = 1000;

// Bandbreite-Tabelle
// Wert 0 = 50 Hz (schmal), Wert 127 = 500 Hz (breit)
const int MIN_BW = 50;
const int MAX_BW = 500;

// Presets
struct Preset {
  const char* name;
  int freq;
  int bw;
};

const Preset presets[] = {
  {"Schmal", 700, 80},    // Sehr schmales Filter
  {"Normal", 700, 150},   // Standard CW
  {"Breit", 600, 300},    // Für schwache Signale
  {"Contest", 800, 100},  // Contest-Betrieb
};
int currentPreset = 1;
const int NUM_PRESETS = 4;

// Encoder-Status
volatile int freqEncoder = 0;
volatile int bwEncoder = 0;

void setup() {
  Serial.begin(9600);

  // SPI für Digital-Potis
  SPI.begin();
  pinMode(CS_FREQ, OUTPUT);
  pinMode(CS_BW, OUTPUT);
  digitalWrite(CS_FREQ, HIGH);
  digitalWrite(CS_BW, HIGH);

  // Encoder Pins
  pinMode(ENC_FREQ_A, INPUT_PULLUP);
  pinMode(ENC_FREQ_B, INPUT_PULLUP);
  pinMode(ENC_BW_A, INPUT_PULLUP);
  pinMode(ENC_BW_B, INPUT_PULLUP);
  pinMode(BTN_PRESET, INPUT_PULLUP);

  // Encoder Interrupts
  attachInterrupt(digitalPinToInterrupt(ENC_FREQ_A), freqEncoderISR, CHANGE);

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED nicht gefunden"));
  }

  // Standard-Preset laden
  loadPreset(currentPreset);

  showWelcome();
  delay(1500);
}

void loop() {
  // Frequenz-Encoder verarbeiten
  if (freqEncoder != 0) {
    freqValue = constrain(freqValue + freqEncoder, 0, 127);
    freqEncoder = 0;
    updatePoti(CS_FREQ, freqValue);
  }

  // Bandbreite-Encoder (Polling)
  static int lastBwA = HIGH;
  int bwA = digitalRead(ENC_BW_A);
  if (bwA != lastBwA && bwA == LOW) {
    if (digitalRead(ENC_BW_B) == HIGH) {
      bwValue = constrain(bwValue + 2, 0, 127);
    } else {
      bwValue = constrain(bwValue - 2, 0, 127);
    }
    updatePoti(CS_BW, bwValue);
  }
  lastBwA = bwA;

  // Preset-Taster
  if (!digitalRead(BTN_PRESET)) {
    delay(50);
    while(!digitalRead(BTN_PRESET));
    currentPreset = (currentPreset + 1) % NUM_PRESETS;
    loadPreset(currentPreset);
    delay(100);
  }

  // Anzeige aktualisieren
  updateDisplay();

  delay(20);
}

void freqEncoderISR() {
  static int lastA = HIGH;
  int a = digitalRead(ENC_FREQ_A);

  if (a != lastA) {
    if (digitalRead(ENC_FREQ_B) != a) {
      freqEncoder++;
    } else {
      freqEncoder--;
    }
  }
  lastA = a;
}

void updatePoti(int csPin, int value) {
  digitalWrite(csPin, LOW);
  SPI.transfer(0x00);        // Befehl: Write to Wiper 0
  SPI.transfer(value);       // Wert 0-127
  digitalWrite(csPin, HIGH);
}

void loadPreset(int idx) {
  int targetFreq = presets[idx].freq;
  int targetBw = presets[idx].bw;

  // Werte in Poti-Bereich umrechnen
  freqValue = map(targetFreq, MIN_FREQ, MAX_FREQ, 0, 127);
  bwValue = map(targetBw, MIN_BW, MAX_BW, 0, 127);

  updatePoti(CS_FREQ, freqValue);
  updatePoti(CS_BW, bwValue);

  Serial.print(F("Preset: "));
  Serial.println(presets[idx].name);
}

int getFrequency() {
  return map(freqValue, 0, 127, MIN_FREQ, MAX_FREQ);
}

int getBandwidth() {
  return map(bwValue, 0, 127, MIN_BW, MAX_BW);
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("CW Audio Filter"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Preset
  display.setCursor(0, 14);
  display.print(F("Preset: "));
  display.println(presets[currentPreset].name);

  // Frequenz
  display.setTextSize(1);
  display.setCursor(0, 26);
  display.print(F("Freq: "));
  display.setTextSize(2);
  display.print(getFrequency());
  display.setTextSize(1);
  display.println(F(" Hz"));

  // Bandbreite
  display.setCursor(0, 46);
  display.print(F("BW:   "));
  display.setTextSize(2);
  display.print(getBandwidth());
  display.setTextSize(1);
  display.println(F(" Hz"));

  // Grafische Darstellung des Filters
  int centerX = 100;
  int width = getBandwidth() / 20;
  display.drawLine(centerX - width, 60, centerX, 30, SSD1306_WHITE);
  display.drawLine(centerX, 30, centerX + width, 60, SSD1306_WHITE);

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(15, 20);
  display.println(F("CW Audio Filter"));
  display.setCursor(25, 40);
  display.println(F("FunkPilot"));
  display.display();
}
`,
    en: `// =====================================================
// CW Audio Filter Digital Control - FunkPilot
// Hardware: Arduino Nano + MCP4131 + OLED
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// Controls digital potentiometers for an active
// CW bandpass filter with adjustable frequency/bandwidth
//
// The actual filtering is done in the analog domain!
//
// =====================================================

#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// MCP4131 Digital Pots (SPI)
const int CS_FREQ = 10;    // Chip Select for frequency pot
const int CS_BW = 9;       // Chip Select for bandwidth pot

// Rotary encoder pins
const int ENC_FREQ_A = 2;
const int ENC_FREQ_B = 3;
const int ENC_BW_A = 4;
const int ENC_BW_B = 5;
const int BTN_PRESET = 6;  // Preset button

// Current values (0-127 for MCP4131)
int freqValue = 64;        // Center frequency
int bwValue = 64;          // Bandwidth

// Frequency table (approximate mapping)
// Value 0 = 400 Hz, Value 127 = 1000 Hz
const int MIN_FREQ = 400;
const int MAX_FREQ = 1000;

// Bandwidth table
// Value 0 = 50 Hz (narrow), Value 127 = 500 Hz (wide)
const int MIN_BW = 50;
const int MAX_BW = 500;

// Presets
struct Preset {
  const char* name;
  int freq;
  int bw;
};

const Preset presets[] = {
  {"Narrow", 700, 80},    // Very narrow filter
  {"Normal", 700, 150},   // Standard CW
  {"Wide", 600, 300},     // For weak signals
  {"Contest", 800, 100},  // Contest operation
};
int currentPreset = 1;
const int NUM_PRESETS = 4;

// Encoder status
volatile int freqEncoder = 0;
volatile int bwEncoder = 0;

void setup() {
  Serial.begin(9600);

  // SPI for digital pots
  SPI.begin();
  pinMode(CS_FREQ, OUTPUT);
  pinMode(CS_BW, OUTPUT);
  digitalWrite(CS_FREQ, HIGH);
  digitalWrite(CS_BW, HIGH);

  // Encoder pins
  pinMode(ENC_FREQ_A, INPUT_PULLUP);
  pinMode(ENC_FREQ_B, INPUT_PULLUP);
  pinMode(ENC_BW_A, INPUT_PULLUP);
  pinMode(ENC_BW_B, INPUT_PULLUP);
  pinMode(BTN_PRESET, INPUT_PULLUP);

  // Encoder interrupts
  attachInterrupt(digitalPinToInterrupt(ENC_FREQ_A), freqEncoderISR, CHANGE);

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED not found"));
  }

  // Load default preset
  loadPreset(currentPreset);

  showWelcome();
  delay(1500);
}

void loop() {
  // Process frequency encoder
  if (freqEncoder != 0) {
    freqValue = constrain(freqValue + freqEncoder, 0, 127);
    freqEncoder = 0;
    updatePoti(CS_FREQ, freqValue);
  }

  // Bandwidth encoder (polling)
  static int lastBwA = HIGH;
  int bwA = digitalRead(ENC_BW_A);
  if (bwA != lastBwA && bwA == LOW) {
    if (digitalRead(ENC_BW_B) == HIGH) {
      bwValue = constrain(bwValue + 2, 0, 127);
    } else {
      bwValue = constrain(bwValue - 2, 0, 127);
    }
    updatePoti(CS_BW, bwValue);
  }
  lastBwA = bwA;

  // Preset button
  if (!digitalRead(BTN_PRESET)) {
    delay(50);
    while(!digitalRead(BTN_PRESET));
    currentPreset = (currentPreset + 1) % NUM_PRESETS;
    loadPreset(currentPreset);
    delay(100);
  }

  // Update display
  updateDisplay();

  delay(20);
}

void freqEncoderISR() {
  static int lastA = HIGH;
  int a = digitalRead(ENC_FREQ_A);

  if (a != lastA) {
    if (digitalRead(ENC_FREQ_B) != a) {
      freqEncoder++;
    } else {
      freqEncoder--;
    }
  }
  lastA = a;
}

void updatePoti(int csPin, int value) {
  digitalWrite(csPin, LOW);
  SPI.transfer(0x00);        // Command: Write to Wiper 0
  SPI.transfer(value);       // Value 0-127
  digitalWrite(csPin, HIGH);
}

void loadPreset(int idx) {
  int targetFreq = presets[idx].freq;
  int targetBw = presets[idx].bw;

  // Convert values to pot range
  freqValue = map(targetFreq, MIN_FREQ, MAX_FREQ, 0, 127);
  bwValue = map(targetBw, MIN_BW, MAX_BW, 0, 127);

  updatePoti(CS_FREQ, freqValue);
  updatePoti(CS_BW, bwValue);

  Serial.print(F("Preset: "));
  Serial.println(presets[idx].name);
}

int getFrequency() {
  return map(freqValue, 0, 127, MIN_FREQ, MAX_FREQ);
}

int getBandwidth() {
  return map(bwValue, 0, 127, MIN_BW, MAX_BW);
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("CW Audio Filter"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Preset
  display.setCursor(0, 14);
  display.print(F("Preset: "));
  display.println(presets[currentPreset].name);

  // Frequency
  display.setTextSize(1);
  display.setCursor(0, 26);
  display.print(F("Freq: "));
  display.setTextSize(2);
  display.print(getFrequency());
  display.setTextSize(1);
  display.println(F(" Hz"));

  // Bandwidth
  display.setCursor(0, 46);
  display.print(F("BW:   "));
  display.setTextSize(2);
  display.print(getBandwidth());
  display.setTextSize(1);
  display.println(F(" Hz"));

  // Graphical filter representation
  int centerX = 100;
  int width = getBandwidth() / 20;
  display.drawLine(centerX - width, 60, centerX, 30, SSD1306_WHITE);
  display.drawLine(centerX, 30, centerX + width, 60, SSD1306_WHITE);

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(15, 20);
  display.println(F("CW Audio Filter"));
  display.setCursor(25, 40);
  display.println(F("FunkPilot"));
  display.display();
}
`,
    sl: `// =====================================================
// CW avdio filter digitalno krmiljenje - FunkPilot
// Strojna oprema: Arduino Nano + MCP4131 + OLED
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Krmili digitalne potenciometre za aktivni
// CW pasovno prepustni filter z nastavljivo frekvenco/pasovno širino
//
// Dejansko filtriranje poteka v analognem delu!
//
// =====================================================

#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// MCP4131 digitalni potenciometri (SPI)
const int CS_FREQ = 10;    // Chip Select za frekvenčni pot
const int CS_BW = 9;       // Chip Select za pot pasovne širine

// Pini rotacijskega enkoderja
const int ENC_FREQ_A = 2;
const int ENC_FREQ_B = 3;
const int ENC_BW_A = 4;
const int ENC_BW_B = 5;
const int BTN_PRESET = 6;  // Gumb za prednastavitev

// Trenutne vrednosti (0-127 za MCP4131)
int freqValue = 64;        // Srednja frekvenca
int bwValue = 64;          // Pasovna širina

// Tabela frekvenc (približna preslikava)
// Vrednost 0 = 400 Hz, Vrednost 127 = 1000 Hz
const int MIN_FREQ = 400;
const int MAX_FREQ = 1000;

// Tabela pasovne širine
// Vrednost 0 = 50 Hz (ozko), Vrednost 127 = 500 Hz (široko)
const int MIN_BW = 50;
const int MAX_BW = 500;

// Prednastavitve
struct Preset {
  const char* name;
  int freq;
  int bw;
};

const Preset presets[] = {
  {"Ozko", 700, 80},      // Zelo ozek filter
  {"Normal", 700, 150},   // Standardni CW
  {"Siroko", 600, 300},   // Za šibke signale
  {"Contest", 800, 100},  // Tekmovalni način
};
int currentPreset = 1;
const int NUM_PRESETS = 4;

// Status enkoderja
volatile int freqEncoder = 0;
volatile int bwEncoder = 0;

void setup() {
  Serial.begin(9600);

  // SPI za digitalne potenciometre
  SPI.begin();
  pinMode(CS_FREQ, OUTPUT);
  pinMode(CS_BW, OUTPUT);
  digitalWrite(CS_FREQ, HIGH);
  digitalWrite(CS_BW, HIGH);

  // Pini enkoderja
  pinMode(ENC_FREQ_A, INPUT_PULLUP);
  pinMode(ENC_FREQ_B, INPUT_PULLUP);
  pinMode(ENC_BW_A, INPUT_PULLUP);
  pinMode(ENC_BW_B, INPUT_PULLUP);
  pinMode(BTN_PRESET, INPUT_PULLUP);

  // Prekinitve enkoderja
  attachInterrupt(digitalPinToInterrupt(ENC_FREQ_A), freqEncoderISR, CHANGE);

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED ni najden"));
  }

  // Naloži privzeto prednastavitev
  loadPreset(currentPreset);

  showWelcome();
  delay(1500);
}

void loop() {
  // Obdelaj frekvenčni enkoder
  if (freqEncoder != 0) {
    freqValue = constrain(freqValue + freqEncoder, 0, 127);
    freqEncoder = 0;
    updatePoti(CS_FREQ, freqValue);
  }

  // Enkoder pasovne širine (polling)
  static int lastBwA = HIGH;
  int bwA = digitalRead(ENC_BW_A);
  if (bwA != lastBwA && bwA == LOW) {
    if (digitalRead(ENC_BW_B) == HIGH) {
      bwValue = constrain(bwValue + 2, 0, 127);
    } else {
      bwValue = constrain(bwValue - 2, 0, 127);
    }
    updatePoti(CS_BW, bwValue);
  }
  lastBwA = bwA;

  // Gumb za prednastavitev
  if (!digitalRead(BTN_PRESET)) {
    delay(50);
    while(!digitalRead(BTN_PRESET));
    currentPreset = (currentPreset + 1) % NUM_PRESETS;
    loadPreset(currentPreset);
    delay(100);
  }

  // Posodobi zaslon
  updateDisplay();

  delay(20);
}

void freqEncoderISR() {
  static int lastA = HIGH;
  int a = digitalRead(ENC_FREQ_A);

  if (a != lastA) {
    if (digitalRead(ENC_FREQ_B) != a) {
      freqEncoder++;
    } else {
      freqEncoder--;
    }
  }
  lastA = a;
}

void updatePoti(int csPin, int value) {
  digitalWrite(csPin, LOW);
  SPI.transfer(0x00);        // Ukaz: Zapiši na Wiper 0
  SPI.transfer(value);       // Vrednost 0-127
  digitalWrite(csPin, HIGH);
}

void loadPreset(int idx) {
  int targetFreq = presets[idx].freq;
  int targetBw = presets[idx].bw;

  // Pretvori vrednosti v obseg potenciometra
  freqValue = map(targetFreq, MIN_FREQ, MAX_FREQ, 0, 127);
  bwValue = map(targetBw, MIN_BW, MAX_BW, 0, 127);

  updatePoti(CS_FREQ, freqValue);
  updatePoti(CS_BW, bwValue);

  Serial.print(F("Prednastavitev: "));
  Serial.println(presets[idx].name);
}

int getFrequency() {
  return map(freqValue, 0, 127, MIN_FREQ, MAX_FREQ);
}

int getBandwidth() {
  return map(bwValue, 0, 127, MIN_BW, MAX_BW);
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Glava
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("CW Audio Filter"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Prednastavitev
  display.setCursor(0, 14);
  display.print(F("Preset: "));
  display.println(presets[currentPreset].name);

  // Frekvenca
  display.setTextSize(1);
  display.setCursor(0, 26);
  display.print(F("Freq: "));
  display.setTextSize(2);
  display.print(getFrequency());
  display.setTextSize(1);
  display.println(F(" Hz"));

  // Pasovna širina
  display.setCursor(0, 46);
  display.print(F("BW:   "));
  display.setTextSize(2);
  display.print(getBandwidth());
  display.setTextSize(1);
  display.println(F(" Hz"));

  // Grafični prikaz filtra
  int centerX = 100;
  int width = getBandwidth() / 20;
  display.drawLine(centerX - width, 60, centerX, 30, SSD1306_WHITE);
  display.drawLine(centerX, 30, centerX + width, 60, SSD1306_WHITE);

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(15, 20);
  display.println(F("CW Audio Filter"));
  display.setCursor(25, 40);
  display.println(F("FunkPilot"));
  display.display();
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'cw_audio_filter.ino',

  wiring: [
    { from: { de: 'Arduino D10', en: 'Arduino D10', sl: 'Arduino D10' }, to: { de: 'MCP4131 #1 CS', en: 'MCP4131 #1 CS', sl: 'MCP4131 #1 CS' }, color: 'Gelb', notes: { de: 'Frequenz', en: 'Frequency', sl: 'Frekvenca' } },
    { from: { de: 'Arduino D9', en: 'Arduino D9', sl: 'Arduino D9' }, to: { de: 'MCP4131 #2 CS', en: 'MCP4131 #2 CS', sl: 'MCP4131 #2 CS' }, color: 'Orange', notes: { de: 'Bandbreite', en: 'Bandwidth', sl: 'Pasovna širina' } },
    { from: { de: 'Arduino D11 (MOSI)', en: 'Arduino D11 (MOSI)', sl: 'Arduino D11 (MOSI)' }, to: { de: 'MCP4131 SDI', en: 'MCP4131 SDI', sl: 'MCP4131 SDI' }, color: 'Grün' },
    { from: { de: 'Arduino D13 (SCK)', en: 'Arduino D13 (SCK)', sl: 'Arduino D13 (SCK)' }, to: { de: 'MCP4131 SCK', en: 'MCP4131 SCK', sl: 'MCP4131 SCK' }, color: 'Blau' },
    { from: { de: 'Arduino D2', en: 'Arduino D2', sl: 'Arduino D2' }, to: { de: 'Encoder Freq A', en: 'Encoder Freq A', sl: 'Enkoder Freq A' }, color: 'Weiß' },
    { from: { de: 'Arduino D3', en: 'Arduino D3', sl: 'Arduino D3' }, to: { de: 'Encoder Freq B', en: 'Encoder Freq B', sl: 'Enkoder Freq B' }, color: 'Grau' },
    { from: { de: 'Arduino D4', en: 'Arduino D4', sl: 'Arduino D4' }, to: { de: 'Encoder BW A', en: 'Encoder BW A', sl: 'Enkoder BW A' }, color: 'Weiß' },
    { from: { de: 'Arduino D5', en: 'Arduino D5', sl: 'Arduino D5' }, to: { de: 'Encoder BW B', en: 'Encoder BW B', sl: 'Enkoder BW B' }, color: 'Grau' },
    { from: { de: 'Arduino D6', en: 'Arduino D6', sl: 'Arduino D6' }, to: { de: 'Taster Preset', en: 'Preset button', sl: 'Gumb za prednastavitev' }, color: 'Gelb', notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' } },
    { from: { de: 'MCP4131 Wiper', en: 'MCP4131 Wiper', sl: 'MCP4131 Wiper' }, to: { de: 'OpAmp Filter', en: 'OpAmp Filter', sl: 'OpAmp filter' }, notes: { de: 'zum analogen Teil', en: 'to analog section', sl: 'na analogni del' } },
    { from: { de: 'Audio In (Buchse)', en: 'Audio In (socket)', sl: 'Audio In (vtičnica)' }, to: { de: 'OpAmp Eingang', en: 'OpAmp input', sl: 'OpAmp vhod' } },
    { from: { de: 'OpAmp Ausgang', en: 'OpAmp output', sl: 'OpAmp izhod' }, to: { de: 'Audio Out (Buchse)', en: 'Audio Out (socket)', sl: 'Audio Out (vtičnica)' } },
  ],

  customizationSuggestions: [
    { de: 'Automatische Frequenznachführung (AFC)', en: 'Automatic Frequency Control (AFC)', sl: 'Avtomatsko sledenje frekvenci (AFC)' },
    { de: 'Notch-Filter für QRM zusätzlich', en: 'Additional notch filter for QRM', sl: 'Dodatni notch filter za QRM' },
    { de: 'Speicherung der Einstellungen im EEPROM', en: 'Save settings to EEPROM', sl: 'Shranjevanje nastavitev v EEPROM' },
    { de: 'DSP-Version mit echtem Digital-Filter', en: 'DSP version with real digital filter', sl: 'DSP verzija s pravim digitalnim filtrom' },
    { de: 'Automatische Pegelanpassung (AGC)', en: 'Automatic Gain Control (AGC)', sl: 'Avtomatsko prilagajanje ojačanja (AGC)' },
  ],

  externalLinks: [
    { title: { de: 'Aktive Filter Berechnung', en: 'Active Filter Calculation', sl: 'Izračun aktivnega filtra' }, url: 'https://www.ti.com/lit/an/sloa049b/sloa049b.pdf' },
  ],
};
