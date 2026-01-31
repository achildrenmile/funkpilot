import type { HamProject } from '../../types/projects';

export const cwAudioFilter: HamProject = {
  id: 'cw-audio-filter',
  name: 'CW-Audiofilter',
  category: 'audio',
  difficulty: 2,
  description: 'Aktiver Bandpassfilter für CW-Empfang. Einstellbare Mittenfrequenz (400-1000 Hz) und Bandbreite. Unterdrückt QRM und verbessert die Lesbarkeit bei schwachen Signalen.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'Operationsverstärker LM358', quantity: 2, notes: 'oder TL072' },
    { name: 'OLED Display 0.96"', quantity: 1, notes: 'optional' },
    { name: 'Potentiometer 10k', quantity: 2, notes: 'Frequenz + Bandbreite' },
    { name: 'Digital-Poti MCP4131', quantity: 2, notes: 'für digitale Steuerung' },
    { name: 'Kondensator 100nF', quantity: 4 },
    { name: 'Kondensator 10nF', quantity: 4 },
    { name: 'Kondensator 1µF', quantity: 2 },
    { name: 'Widerstand div.', quantity: 1, notes: 'Set 1k-100k' },
    { name: 'Klinkenbuchse 3.5mm', quantity: 2, notes: 'Ein-/Ausgang' },
    { name: 'Drehencoder', quantity: 2, notes: 'optional statt Potis' },
  ],
  estimatedCost: '~18€',

  code: `// =====================================================
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
  codeLanguage: 'cpp',
  codeFileName: 'cw_audio_filter.ino',

  wiring: [
    { from: 'Arduino D10', to: 'MCP4131 #1 CS', color: 'Gelb', notes: 'Frequenz' },
    { from: 'Arduino D9', to: 'MCP4131 #2 CS', color: 'Orange', notes: 'Bandbreite' },
    { from: 'Arduino D11 (MOSI)', to: 'MCP4131 SDI', color: 'Grün' },
    { from: 'Arduino D13 (SCK)', to: 'MCP4131 SCK', color: 'Blau' },
    { from: 'Arduino D2', to: 'Encoder Freq A', color: 'Weiß' },
    { from: 'Arduino D3', to: 'Encoder Freq B', color: 'Grau' },
    { from: 'Arduino D4', to: 'Encoder BW A', color: 'Weiß' },
    { from: 'Arduino D5', to: 'Encoder BW B', color: 'Grau' },
    { from: 'Arduino D6', to: 'Taster Preset', color: 'Gelb', notes: 'nach GND' },
    { from: 'MCP4131 Wiper', to: 'OpAmp Filter', notes: 'zum analogen Teil' },
    { from: 'Audio In (Buchse)', to: 'OpAmp Eingang' },
    { from: 'OpAmp Ausgang', to: 'Audio Out (Buchse)' },
  ],

  customizationSuggestions: [
    'Automatische Frequenznachführung (AFC)',
    'Notch-Filter für QRM zusätzlich',
    'Speicherung der Einstellungen im EEPROM',
    'DSP-Version mit echtem Digital-Filter',
    'Automatische Pegelanpassung (AGC)',
  ],

  externalLinks: [
    { title: 'Aktive Filter Berechnung', url: 'https://www.ti.com/lit/an/sloa049b/sloa049b.pdf' },
  ],
};
