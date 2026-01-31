import type { HamProject } from '../../types/projects';

export const nfAmplifier: HamProject = {
  id: 'nf-amplifier',
  name: 'NF-Kopfhörerverstärker',
  category: 'audio',
  difficulty: 1,
  description: 'Kleiner Kopfhörerverstärker für Empfänger mit schwachem Audio-Ausgang. Regelbarer Pegel, geringe Verzerrung. Ideal für portable Geräte und QRP-Empfänger.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1, notes: 'nur für Pegelanzeige' },
    { name: 'LM386 Audioverstärker', quantity: 1 },
    { name: 'OLED Display 0.96"', quantity: 1, notes: 'VU-Meter' },
    { name: 'Potentiometer 10k log', quantity: 1, notes: 'Lautstärke' },
    { name: 'Kondensator 220µF', quantity: 2 },
    { name: 'Kondensator 100µF', quantity: 1 },
    { name: 'Kondensator 100nF', quantity: 2 },
    { name: 'Kondensator 10µF', quantity: 1 },
    { name: 'Widerstand 10 Ohm', quantity: 1 },
    { name: 'Klinkenbuchse 3.5mm', quantity: 2, notes: 'Ein-/Ausgang' },
    { name: '9V Batterie + Clip', quantity: 1, notes: 'oder USB-Powerbank' },
  ],
  estimatedCost: '~10€',

  code: `// =====================================================
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
  codeLanguage: 'cpp',
  codeFileName: 'nf_amplifier.ino',

  wiring: [
    { from: 'Audio In Buchse', to: 'Poti Eingang + Arduino A0', color: 'Blau' },
    { from: 'Poti Schleifer', to: 'LM386 Pin 3', color: 'Grün' },
    { from: 'LM386 Pin 5', to: 'Kopfhörer + Arduino A1', color: 'Orange' },
    { from: 'LM386 Pin 2 + Pin 4', to: 'GND', color: 'Schwarz' },
    { from: 'LM386 Pin 6', to: '9V +', color: 'Rot' },
    { from: '220µF +', to: 'LM386 Pin 5', notes: 'Ausgangs-Kopplung' },
    { from: '220µF -', to: 'Kopfhörer', notes: 'nach GND' },
    { from: 'Arduino A4 (SDA)', to: 'OLED SDA', color: 'Weiß' },
    { from: 'Arduino A5 (SCL)', to: 'OLED SCL', color: 'Grau' },
    { from: 'Arduino VIN', to: '9V', color: 'Rot', notes: 'oder USB' },
  ],

  customizationSuggestions: [
    'Stereoverstärker mit 2x LM386',
    'Bassverstärkung über Pin 1-8 Kondensator',
    'Klinkenschaltbuchse für Lautsprecher-Abschaltung',
    'Akkubetrieb mit LiPo und Lademodul',
    'Automatische Lautstärkeregelung',
  ],

  externalLinks: [
    { title: 'LM386 Datenblatt', url: 'https://www.ti.com/lit/ds/symlink/lm386.pdf' },
  ],
};
