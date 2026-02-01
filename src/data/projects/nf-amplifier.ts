import type { HamProject } from '../../types/projects';

export const nfAmplifier: HamProject = {
  id: 'nf-amplifier',
  name: {
    de: 'NF-Kopfhörerverstärker',
    en: 'AF Headphone Amplifier',
    sl: 'NF ojačevalnik za slušalke',
  },
  category: 'audio',
  difficulty: 1,
  description: {
    de: 'Kleiner Kopfhörerverstärker für Empfänger mit schwachem Audio-Ausgang. Regelbarer Pegel, geringe Verzerrung. Ideal für portable Geräte und QRP-Empfänger.',
    en: 'Small headphone amplifier for receivers with weak audio output. Adjustable level, low distortion. Ideal for portable devices and QRP receivers.',
    sl: 'Majhen ojačevalnik za slušalke za sprejemnike s šibkim avdio izhodom. Nastavljiva glasnost, nizko popačenje. Idealen za prenosne naprave in QRP sprejemnike.',
  },
  hardware: 'arduino-nano',

  components: [
    { name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' }, quantity: 1, notes: { de: 'nur für Pegelanzeige', en: 'only for level display', sl: 'samo za prikaz nivoja' } },
    { name: { de: 'LM386 Audioverstärker', en: 'LM386 audio amplifier', sl: 'LM386 avdio ojačevalnik' }, quantity: 1 },
    { name: { de: 'OLED Display 0.96"', en: 'OLED Display 0.96"', sl: 'OLED zaslon 0.96"' }, quantity: 1, notes: { de: 'VU-Meter', en: 'VU meter', sl: 'VU meter' } },
    { name: { de: 'Potentiometer 10k log', en: 'Potentiometer 10k log', sl: 'Potenciometer 10k log' }, quantity: 1, notes: { de: 'Lautstärke', en: 'volume', sl: 'glasnost' } },
    { name: { de: 'Kondensator 220µF', en: 'Capacitor 220µF', sl: 'Kondenzator 220µF' }, quantity: 2 },
    { name: { de: 'Kondensator 100µF', en: 'Capacitor 100µF', sl: 'Kondenzator 100µF' }, quantity: 1 },
    { name: { de: 'Kondensator 100nF', en: 'Capacitor 100nF', sl: 'Kondenzator 100nF' }, quantity: 2 },
    { name: { de: 'Kondensator 10µF', en: 'Capacitor 10µF', sl: 'Kondenzator 10µF' }, quantity: 1 },
    { name: { de: 'Widerstand 10 Ohm', en: 'Resistor 10 Ohm', sl: 'Upor 10 Ohm' }, quantity: 1 },
    { name: { de: 'Klinkenbuchse 3.5mm', en: '3.5mm jack socket', sl: '3.5mm vtičnica' }, quantity: 2, notes: { de: 'Ein-/Ausgang', en: 'input/output', sl: 'vhod/izhod' } },
    { name: { de: '9V Batterie + Clip', en: '9V battery + clip', sl: '9V baterija + priključek' }, quantity: 1, notes: { de: 'oder USB-Powerbank', en: 'or USB power bank', sl: 'ali USB powerbank' } },
  ],
  estimatedCost: '~10€',

  code: {
    de: `// =====================================================
// NF-Kopfhörerverstärker mit VU-Meter - FunkPilot
// Hardware: Arduino Nano + LM386 + OLED
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Der Arduino zeigt nur den Pegel an!
// Die Verstärkung macht der LM386 analog.
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Pins
const int AUDIO_IN_PIN = A0;   // Audio-Eingang (vor Verstärker)
const int AUDIO_OUT_PIN = A1;  // Audio-Ausgang (nach Verstärker)

// VU-Meter Parameter
const int PEAK_HOLD_TIME = 500;  // Peak-Hold in ms
const float DECAY_RATE = 0.95;   // Abfall-Rate

// Messwerte
int inputLevel = 0;
int outputLevel = 0;
int inputPeak = 0;
int outputPeak = 0;
unsigned long inputPeakTime = 0;
unsigned long outputPeakTime = 0;
float smoothedInput = 0;
float smoothedOutput = 0;

// dB-Berechnung
const int REF_LEVEL = 512;  // Mittelwert bei Stille

void setup() {
  Serial.begin(9600);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED nicht gefunden"));
    while(1);
  }

  showWelcome();
  delay(2000);
}

void loop() {
  // Audio-Pegel messen (AC-Signal um Mittelwert)
  measureLevels();

  // Peak-Hold
  updatePeaks();

  // Anzeige
  updateDisplay();

  delay(30);  // ~30 fps
}

void measureLevels() {
  int minIn = 1023, maxIn = 0;
  int minOut = 1023, maxOut = 0;

  // 100 Samples für Peak-to-Peak
  for (int i = 0; i < 100; i++) {
    int valIn = analogRead(AUDIO_IN_PIN);
    int valOut = analogRead(AUDIO_OUT_PIN);

    if (valIn < minIn) minIn = valIn;
    if (valIn > maxIn) maxIn = valIn;
    if (valOut < minOut) minOut = valOut;
    if (valOut > maxOut) maxOut = valOut;

    delayMicroseconds(100);
  }

  // Peak-to-Peak Amplitude
  inputLevel = maxIn - minIn;
  outputLevel = maxOut - minOut;

  // Glättung
  smoothedInput = (smoothedInput * DECAY_RATE) + (inputLevel * (1 - DECAY_RATE));
  smoothedOutput = (smoothedOutput * DECAY_RATE) + (outputLevel * (1 - DECAY_RATE));

  // Minimum für Rauschen
  if (smoothedInput < 5) smoothedInput = 0;
  if (smoothedOutput < 5) smoothedOutput = 0;
}

void updatePeaks() {
  unsigned long now = millis();

  // Input Peak
  if (smoothedInput > inputPeak) {
    inputPeak = smoothedInput;
    inputPeakTime = now;
  } else if (now - inputPeakTime > PEAK_HOLD_TIME) {
    inputPeak = inputPeak * 0.9;
  }

  // Output Peak
  if (smoothedOutput > outputPeak) {
    outputPeak = smoothedOutput;
    outputPeakTime = now;
  } else if (now - outputPeakTime > PEAK_HOLD_TIME) {
    outputPeak = outputPeak * 0.9;
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("NF Verstaerker"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // VU-Meter Eingangspegel
  display.setCursor(0, 14);
  display.print(F("IN:  "));
  drawVUMeter(30, 14, 95, 10, smoothedInput, inputPeak);

  // VU-Meter Ausgangspegel
  display.setCursor(0, 28);
  display.print(F("OUT: "));
  drawVUMeter(30, 28, 95, 10, smoothedOutput, outputPeak);

  // dB-Anzeige (ungefähre Berechnung)
  display.setCursor(0, 42);
  display.print(F("IN:  "));
  display.print(levelToDb(smoothedInput));
  display.println(F(" dB"));

  display.setCursor(0, 52);
  display.print(F("OUT: "));
  display.print(levelToDb(smoothedOutput));
  display.print(F(" dB  G="));
  display.print(levelToDb(smoothedOutput) - levelToDb(smoothedInput));

  display.display();
}

void drawVUMeter(int x, int y, int w, int h, float level, float peak) {
  // Rahmen
  display.drawRect(x, y, w, h, SSD1306_WHITE);

  // Balken (logarithmisch)
  int barWidth = map(constrain(level, 0, 500), 0, 500, 0, w - 2);
  display.fillRect(x + 1, y + 1, barWidth, h - 2, SSD1306_WHITE);

  // Peak-Marker
  int peakPos = map(constrain(peak, 0, 500), 0, 500, 0, w - 2);
  if (peakPos > 0) {
    display.drawLine(x + peakPos, y, x + peakPos, y + h, SSD1306_WHITE);
  }

  // Übersteuerungswarnung
  if (level > 480) {
    display.setCursor(x + w + 2, y);
    display.print(F("!"));
  }
}

int levelToDb(float level) {
  if (level < 1) return -60;
  // 20 * log10(level / reference)
  return 20 * log10(level / 100.0);
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(5, 15);
  display.println(F("NF Kopfhoerer"));
  display.setCursor(15, 30);
  display.println(F("Verstaerker"));
  display.setCursor(25, 50);
  display.println(F("FunkPilot"));
  display.display();
}
`,
    en: `// =====================================================
// AF Headphone Amplifier with VU Meter - FunkPilot
// Hardware: Arduino Nano + LM386 + OLED
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// The Arduino only displays the level!
// Amplification is done by the LM386 analog.
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Pins
const int AUDIO_IN_PIN = A0;   // Audio input (before amplifier)
const int AUDIO_OUT_PIN = A1;  // Audio output (after amplifier)

// VU meter parameters
const int PEAK_HOLD_TIME = 500;  // Peak hold in ms
const float DECAY_RATE = 0.95;   // Decay rate

// Measurements
int inputLevel = 0;
int outputLevel = 0;
int inputPeak = 0;
int outputPeak = 0;
unsigned long inputPeakTime = 0;
unsigned long outputPeakTime = 0;
float smoothedInput = 0;
float smoothedOutput = 0;

// dB calculation
const int REF_LEVEL = 512;  // Average value at silence

void setup() {
  Serial.begin(9600);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED not found"));
    while(1);
  }

  showWelcome();
  delay(2000);
}

void loop() {
  // Measure audio level (AC signal around midpoint)
  measureLevels();

  // Peak hold
  updatePeaks();

  // Display
  updateDisplay();

  delay(30);  // ~30 fps
}

void measureLevels() {
  int minIn = 1023, maxIn = 0;
  int minOut = 1023, maxOut = 0;

  // 100 samples for peak-to-peak
  for (int i = 0; i < 100; i++) {
    int valIn = analogRead(AUDIO_IN_PIN);
    int valOut = analogRead(AUDIO_OUT_PIN);

    if (valIn < minIn) minIn = valIn;
    if (valIn > maxIn) maxIn = valIn;
    if (valOut < minOut) minOut = valOut;
    if (valOut > maxOut) maxOut = valOut;

    delayMicroseconds(100);
  }

  // Peak-to-peak amplitude
  inputLevel = maxIn - minIn;
  outputLevel = maxOut - minOut;

  // Smoothing
  smoothedInput = (smoothedInput * DECAY_RATE) + (inputLevel * (1 - DECAY_RATE));
  smoothedOutput = (smoothedOutput * DECAY_RATE) + (outputLevel * (1 - DECAY_RATE));

  // Minimum for noise
  if (smoothedInput < 5) smoothedInput = 0;
  if (smoothedOutput < 5) smoothedOutput = 0;
}

void updatePeaks() {
  unsigned long now = millis();

  // Input peak
  if (smoothedInput > inputPeak) {
    inputPeak = smoothedInput;
    inputPeakTime = now;
  } else if (now - inputPeakTime > PEAK_HOLD_TIME) {
    inputPeak = inputPeak * 0.9;
  }

  // Output peak
  if (smoothedOutput > outputPeak) {
    outputPeak = smoothedOutput;
    outputPeakTime = now;
  } else if (now - outputPeakTime > PEAK_HOLD_TIME) {
    outputPeak = outputPeak * 0.9;
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("AF Amplifier"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // VU meter input level
  display.setCursor(0, 14);
  display.print(F("IN:  "));
  drawVUMeter(30, 14, 95, 10, smoothedInput, inputPeak);

  // VU meter output level
  display.setCursor(0, 28);
  display.print(F("OUT: "));
  drawVUMeter(30, 28, 95, 10, smoothedOutput, outputPeak);

  // dB display (approximate calculation)
  display.setCursor(0, 42);
  display.print(F("IN:  "));
  display.print(levelToDb(smoothedInput));
  display.println(F(" dB"));

  display.setCursor(0, 52);
  display.print(F("OUT: "));
  display.print(levelToDb(smoothedOutput));
  display.print(F(" dB  G="));
  display.print(levelToDb(smoothedOutput) - levelToDb(smoothedInput));

  display.display();
}

void drawVUMeter(int x, int y, int w, int h, float level, float peak) {
  // Frame
  display.drawRect(x, y, w, h, SSD1306_WHITE);

  // Bar (logarithmic)
  int barWidth = map(constrain(level, 0, 500), 0, 500, 0, w - 2);
  display.fillRect(x + 1, y + 1, barWidth, h - 2, SSD1306_WHITE);

  // Peak marker
  int peakPos = map(constrain(peak, 0, 500), 0, 500, 0, w - 2);
  if (peakPos > 0) {
    display.drawLine(x + peakPos, y, x + peakPos, y + h, SSD1306_WHITE);
  }

  // Clipping warning
  if (level > 480) {
    display.setCursor(x + w + 2, y);
    display.print(F("!"));
  }
}

int levelToDb(float level) {
  if (level < 1) return -60;
  // 20 * log10(level / reference)
  return 20 * log10(level / 100.0);
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(5, 15);
  display.println(F("AF Headphone"));
  display.setCursor(15, 30);
  display.println(F("Amplifier"));
  display.setCursor(25, 50);
  display.println(F("FunkPilot"));
  display.display();
}
`,
    sl: `// =====================================================
// NF ojačevalnik za slušalke z VU metrom - FunkPilot
// Strojna oprema: Arduino Nano + LM386 + OLED
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Arduino samo prikazuje nivo!
// Ojačanje izvaja LM386 analogno.
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Pini
const int AUDIO_IN_PIN = A0;   // Avdio vhod (pred ojačevalnikom)
const int AUDIO_OUT_PIN = A1;  // Avdio izhod (za ojačevalnikom)

// VU meter parametri
const int PEAK_HOLD_TIME = 500;  // Peak hold v ms
const float DECAY_RATE = 0.95;   // Stopnja upada

// Meritve
int inputLevel = 0;
int outputLevel = 0;
int inputPeak = 0;
int outputPeak = 0;
unsigned long inputPeakTime = 0;
unsigned long outputPeakTime = 0;
float smoothedInput = 0;
float smoothedOutput = 0;

// dB izračun
const int REF_LEVEL = 512;  // Povprečna vrednost pri tišini

void setup() {
  Serial.begin(9600);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED ni najden"));
    while(1);
  }

  showWelcome();
  delay(2000);
}

void loop() {
  // Meri avdio nivo (AC signal okoli sredine)
  measureLevels();

  // Peak hold
  updatePeaks();

  // Prikaz
  updateDisplay();

  delay(30);  // ~30 fps
}

void measureLevels() {
  int minIn = 1023, maxIn = 0;
  int minOut = 1023, maxOut = 0;

  // 100 vzorcev za peak-to-peak
  for (int i = 0; i < 100; i++) {
    int valIn = analogRead(AUDIO_IN_PIN);
    int valOut = analogRead(AUDIO_OUT_PIN);

    if (valIn < minIn) minIn = valIn;
    if (valIn > maxIn) maxIn = valIn;
    if (valOut < minOut) minOut = valOut;
    if (valOut > maxOut) maxOut = valOut;

    delayMicroseconds(100);
  }

  // Peak-to-peak amplituda
  inputLevel = maxIn - minIn;
  outputLevel = maxOut - minOut;

  // Glajenje
  smoothedInput = (smoothedInput * DECAY_RATE) + (inputLevel * (1 - DECAY_RATE));
  smoothedOutput = (smoothedOutput * DECAY_RATE) + (outputLevel * (1 - DECAY_RATE));

  // Minimum za šum
  if (smoothedInput < 5) smoothedInput = 0;
  if (smoothedOutput < 5) smoothedOutput = 0;
}

void updatePeaks() {
  unsigned long now = millis();

  // Vhodni peak
  if (smoothedInput > inputPeak) {
    inputPeak = smoothedInput;
    inputPeakTime = now;
  } else if (now - inputPeakTime > PEAK_HOLD_TIME) {
    inputPeak = inputPeak * 0.9;
  }

  // Izhodni peak
  if (smoothedOutput > outputPeak) {
    outputPeak = smoothedOutput;
    outputPeakTime = now;
  } else if (now - outputPeakTime > PEAK_HOLD_TIME) {
    outputPeak = outputPeak * 0.9;
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Glava
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("NF Ojacevalnik"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // VU meter vhodni nivo
  display.setCursor(0, 14);
  display.print(F("IN:  "));
  drawVUMeter(30, 14, 95, 10, smoothedInput, inputPeak);

  // VU meter izhodni nivo
  display.setCursor(0, 28);
  display.print(F("OUT: "));
  drawVUMeter(30, 28, 95, 10, smoothedOutput, outputPeak);

  // dB prikaz (približen izračun)
  display.setCursor(0, 42);
  display.print(F("IN:  "));
  display.print(levelToDb(smoothedInput));
  display.println(F(" dB"));

  display.setCursor(0, 52);
  display.print(F("OUT: "));
  display.print(levelToDb(smoothedOutput));
  display.print(F(" dB  G="));
  display.print(levelToDb(smoothedOutput) - levelToDb(smoothedInput));

  display.display();
}

void drawVUMeter(int x, int y, int w, int h, float level, float peak) {
  // Okvir
  display.drawRect(x, y, w, h, SSD1306_WHITE);

  // Stolpec (logaritmičen)
  int barWidth = map(constrain(level, 0, 500), 0, 500, 0, w - 2);
  display.fillRect(x + 1, y + 1, barWidth, h - 2, SSD1306_WHITE);

  // Peak označevalec
  int peakPos = map(constrain(peak, 0, 500), 0, 500, 0, w - 2);
  if (peakPos > 0) {
    display.drawLine(x + peakPos, y, x + peakPos, y + h, SSD1306_WHITE);
  }

  // Opozorilo o preobremenitvijo
  if (level > 480) {
    display.setCursor(x + w + 2, y);
    display.print(F("!"));
  }
}

int levelToDb(float level) {
  if (level < 1) return -60;
  // 20 * log10(level / reference)
  return 20 * log10(level / 100.0);
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(5, 15);
  display.println(F("NF Slusalke"));
  display.setCursor(15, 30);
  display.println(F("Ojacevalnik"));
  display.setCursor(25, 50);
  display.println(F("FunkPilot"));
  display.display();
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'nf_amplifier.ino',

  wiring: [
    { from: { de: 'Audio In Buchse', en: 'Audio in socket', sl: 'Avdio vhodna vtičnica' }, to: { de: 'Poti Eingang + Arduino A0', en: 'Pot input + Arduino A0', sl: 'Pot vhod + Arduino A0' }, color: 'Blau' },
    { from: { de: 'Poti Schleifer', en: 'Pot wiper', sl: 'Pot drsnik' }, to: { de: 'LM386 Pin 3', en: 'LM386 Pin 3', sl: 'LM386 Pin 3' }, color: 'Grün' },
    { from: { de: 'LM386 Pin 5', en: 'LM386 Pin 5', sl: 'LM386 Pin 5' }, to: { de: 'Kopfhörer + Arduino A1', en: 'Headphone + Arduino A1', sl: 'Slušalke + Arduino A1' }, color: 'Orange' },
    { from: { de: 'LM386 Pin 2 + Pin 4', en: 'LM386 Pin 2 + Pin 4', sl: 'LM386 Pin 2 + Pin 4' }, to: { de: 'GND', en: 'GND', sl: 'GND' }, color: 'Schwarz' },
    { from: { de: 'LM386 Pin 6', en: 'LM386 Pin 6', sl: 'LM386 Pin 6' }, to: { de: '9V +', en: '9V +', sl: '9V +' }, color: 'Rot' },
    { from: { de: '220µF +', en: '220µF +', sl: '220µF +' }, to: { de: 'LM386 Pin 5', en: 'LM386 Pin 5', sl: 'LM386 Pin 5' }, notes: { de: 'Ausgangs-Kopplung', en: 'Output coupling', sl: 'Izhodna sklopitev' } },
    { from: { de: '220µF -', en: '220µF -', sl: '220µF -' }, to: { de: 'Kopfhörer', en: 'Headphone', sl: 'Slušalke' }, notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' } },
    { from: { de: 'Arduino A4 (SDA)', en: 'Arduino A4 (SDA)', sl: 'Arduino A4 (SDA)' }, to: { de: 'OLED SDA', en: 'OLED SDA', sl: 'OLED SDA' }, color: 'Weiß' },
    { from: { de: 'Arduino A5 (SCL)', en: 'Arduino A5 (SCL)', sl: 'Arduino A5 (SCL)' }, to: { de: 'OLED SCL', en: 'OLED SCL', sl: 'OLED SCL' }, color: 'Grau' },
    { from: { de: 'Arduino VIN', en: 'Arduino VIN', sl: 'Arduino VIN' }, to: { de: '9V', en: '9V', sl: '9V' }, color: 'Rot', notes: { de: 'oder USB', en: 'or USB', sl: 'ali USB' } },
  ],

  customizationSuggestions: [
    { de: 'Stereoverstärker mit 2x LM386', en: 'Stereo amplifier with 2x LM386', sl: 'Stereo ojačevalnik z 2x LM386' },
    { de: 'Bassverstärkung über Pin 1-8 Kondensator', en: 'Bass boost via Pin 1-8 capacitor', sl: 'Ojačanje basov preko Pin 1-8 kondenzatorja' },
    { de: 'Klinkenschaltbuchse für Lautsprecher-Abschaltung', en: 'Switching jack socket for speaker cutoff', sl: 'Preklopna vtičnica za izklop zvočnika' },
    { de: 'Akkubetrieb mit LiPo und Lademodul', en: 'Battery operation with LiPo and charging module', sl: 'Baterijsko napajanje z LiPo in polnilnim modulom' },
    { de: 'Automatische Lautstärkeregelung', en: 'Automatic volume control', sl: 'Samodejna regulacija glasnosti' },
  ],

  externalLinks: [
    { title: { de: 'LM386 Datenblatt', en: 'LM386 Datasheet', sl: 'LM386 podatkovni list' }, url: 'https://www.ti.com/lit/ds/symlink/lm386.pdf' },
  ],
};
