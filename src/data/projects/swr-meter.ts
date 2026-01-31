import type { HamProject } from '../../types/projects';

export const swrMeter: HamProject = {
  id: 'swr-meter',
  name: 'SWR-Meter mit OLED',
  category: 'measurement',
  difficulty: 2,
  description: 'Digitales SWR-Meter mit OLED-Display. Zeigt SWR, Vorwärts- und Rücklaufleistung an. Verwendet einen Richtkoppler-Bausatz. Kalibrierbar über Software.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'OLED Display 0.96" I2C', quantity: 1, notes: 'SSD1306, 128x64' },
    { name: 'Richtkoppler-Bausatz', quantity: 1, notes: 'z.B. QRP-Labs oder Eigenbau' },
    { name: 'Schottky-Dioden 1N5711', quantity: 2, notes: 'für HF-Gleichrichtung' },
    { name: 'Kondensator 100nF', quantity: 4 },
    { name: 'Kondensator 10µF', quantity: 2 },
    { name: 'Widerstand 10k', quantity: 2 },
    { name: 'Widerstand 100k', quantity: 2 },
    { name: 'Gehäuse Alu', quantity: 1, notes: 'für HF-Schirmung' },
    { name: 'BNC-Buchsen', quantity: 2, notes: 'Input/Output' },
  ],
  estimatedCost: '~25€',

  code: `// =====================================================
// SWR-Meter mit OLED Display - FunkPilot Bastelprojekt
// Hardware: Arduino Nano + SSD1306 OLED
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// ACHTUNG: Nur bis ca. 30W verwenden!
// Für höhere Leistungen Spannungsteiler anpassen.
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED Konfiguration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Pin-Belegung
const int FWD_PIN = A0;     // Vorwärtsleistung vom Richtkoppler
const int REF_PIN = A1;     // Rücklaufleistung vom Richtkoppler

// Kalibrierung (anpassen nach Richtkoppler!)
const float CAL_FACTOR = 0.1;   // Kalibrierfaktor
const float DIODE_DROP = 0.3;   // Diodenspannung (Schottky)

// Mittelwertbildung
const int NUM_SAMPLES = 50;

// Variablen
float fwdPower = 0;
float refPower = 0;
float swr = 1.0;
float fwdVoltage = 0;
float refVoltage = 0;

void setup() {
  Serial.begin(9600);

  // OLED initialisieren
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 nicht gefunden!"));
    while (1);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(20, 25);
  display.println(F("SWR-Meter v1.0"));
  display.setCursor(25, 40);
  display.println(F("FunkPilot"));
  display.display();
  delay(2000);
}

void loop() {
  // Messwerte einlesen (mit Mittelwertbildung)
  readPower();

  // SWR berechnen
  calculateSWR();

  // Auf Display anzeigen
  updateDisplay();

  // Serial Debug
  Serial.print("FWD: ");
  Serial.print(fwdPower, 1);
  Serial.print("W  REF: ");
  Serial.print(refPower, 1);
  Serial.print("W  SWR: ");
  Serial.println(swr, 2);

  delay(200);
}

void readPower() {
  long fwdSum = 0;
  long refSum = 0;

  // Mehrere Samples für Mittelwert
  for (int i = 0; i < NUM_SAMPLES; i++) {
    fwdSum += analogRead(FWD_PIN);
    refSum += analogRead(REF_PIN);
    delayMicroseconds(100);
  }

  // ADC zu Spannung (0-5V bei Arduino)
  fwdVoltage = (fwdSum / NUM_SAMPLES) * (5.0 / 1023.0);
  refVoltage = (refSum / NUM_SAMPLES) * (5.0 / 1023.0);

  // Diodenspannung kompensieren
  if (fwdVoltage > DIODE_DROP) fwdVoltage -= DIODE_DROP;
  else fwdVoltage = 0;

  if (refVoltage > DIODE_DROP) refVoltage -= DIODE_DROP;
  else refVoltage = 0;

  // Spannung zu Leistung (anpassen nach Richtkoppler!)
  // P = (V^2) / R, mit Kalibrierfaktor
  fwdPower = (fwdVoltage * fwdVoltage) / CAL_FACTOR;
  refPower = (refVoltage * refVoltage) / CAL_FACTOR;
}

void calculateSWR() {
  if (fwdPower < 0.1) {
    // Keine Leistung -> SWR undefiniert
    swr = 0;
    return;
  }

  // Reflexionskoeffizient
  float rho = sqrt(refPower / fwdPower);

  // SWR berechnen
  if (rho >= 0.99) {
    swr = 99.9;  // Maximum anzeigen
  } else {
    swr = (1 + rho) / (1 - rho);
  }

  // Begrenzen auf sinnvollen Bereich
  if (swr > 99.9) swr = 99.9;
  if (swr < 1.0) swr = 1.0;
}

void updateDisplay() {
  display.clearDisplay();

  // Überschrift
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("=== SWR-Meter ==="));

  // SWR gross anzeigen
  display.setTextSize(2);
  display.setCursor(0, 16);
  display.print(F("SWR:"));

  if (swr == 0) {
    display.println(F(" ---"));
  } else if (swr > 10) {
    display.println(F(" HIGH"));
  } else {
    display.print(swr, 1);
    display.println(F(":1"));
  }

  // Leistungsanzeige
  display.setTextSize(1);
  display.setCursor(0, 40);
  display.print(F("FWD: "));
  display.print(fwdPower, 1);
  display.println(F(" W"));

  display.setCursor(0, 52);
  display.print(F("REF: "));
  display.print(refPower, 1);
  display.println(F(" W"));

  // SWR-Balkenanzeige
  int barWidth = 0;
  if (swr > 0 && swr <= 10) {
    barWidth = map(swr * 10, 10, 100, 0, 60);
  }
  display.drawRect(64, 40, 62, 20, SSD1306_WHITE);
  display.fillRect(65, 41, barWidth, 18, SSD1306_WHITE);

  // Skala
  display.setCursor(64, 52);
  display.print(F("1"));
  display.setCursor(90, 52);
  display.print(F("3"));
  display.setCursor(120, 52);
  display.print(F(">"));

  display.display();
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'swr_meter.ino',

  customizationSuggestions: [
    'Peak-Hold Funktion für maximalen SWR',
    'Akustische Warnung bei hohem SWR',
    'Kalibrierung über Tasten im Menü',
    'Frequenzanzeige mit Frequenzzähler kombinieren',
    'Logging auf SD-Karte',
  ],

  externalLinks: [
    { title: 'Richtkoppler Theorie', url: 'https://www.qrp-labs.com/coupler.html' },
  ],
};
