import type { HamProject } from '../../types/projects';

export const fieldStrengthMeter: HamProject = {
  id: 'field-strength-meter',
  name: 'Feldstärkemessgerät',
  category: 'measurement',
  difficulty: 1,
  description: 'Einfaches Feldstärkemessgerät für Antennenabgleich und HF-Suche. Breitbandig von 1-500 MHz. Mit Peak-Hold und analoger Balkenanzeige.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'OLED Display 0.96"', quantity: 1 },
    { name: 'Schottky-Diode 1N5711', quantity: 2, notes: 'Spannungsverdoppler' },
    { name: 'Kondensator 100pF', quantity: 2 },
    { name: 'Kondensator 100nF', quantity: 2 },
    { name: 'Widerstand 10k', quantity: 1 },
    { name: 'Widerstand 100k', quantity: 1 },
    { name: 'Teleskopantenne', quantity: 1, notes: 'oder Drahtantenne' },
    { name: 'BNC-Buchse', quantity: 1, notes: 'optional für ext. Antenne' },
    { name: 'Taster', quantity: 1, notes: 'Peak Reset' },
  ],
  estimatedCost: '~12€',

  code: `// =====================================================
// Feldstärkemessgerät - FunkPilot Bastelprojekt
// Hardware: Arduino Nano + OLED
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Einfaches Breitband-Feldstärkemessgerät
// Für Antennenabgleich und HF-Suche
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
const int RF_PIN = A0;         // HF-Eingang (gleichgerichtet)
const int BTN_RESET = 2;       // Peak Reset Taster

// Kalibrierung
const int NUM_SAMPLES = 100;   // Anzahl Samples
const float SMOOTHING = 0.3;   // Glättungsfaktor (0-1)

// Messwerte
float currentValue = 0;
float peakValue = 0;
float smoothedValue = 0;
unsigned long peakTime = 0;

// S-Meter Simulation (ungefähre Zuordnung)
const int S_LEVELS[] = {0, 50, 100, 150, 200, 270, 350, 450, 550, 700};

void setup() {
  Serial.begin(9600);

  pinMode(BTN_RESET, INPUT_PULLUP);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED nicht gefunden"));
    while(1);
  }

  showWelcome();
  delay(2000);
}

void loop() {
  // Messwert lesen
  readFieldStrength();

  // Peak aktualisieren
  if (currentValue > peakValue) {
    peakValue = currentValue;
    peakTime = millis();
  }

  // Peak Reset Taster
  if (!digitalRead(BTN_RESET)) {
    delay(50);
    while(!digitalRead(BTN_RESET));
    peakValue = 0;
    delay(100);
  }

  // Peak nach 10 Sekunden langsam abfallen lassen
  if (millis() - peakTime > 10000) {
    peakValue = peakValue * 0.99;
  }

  // Anzeige aktualisieren
  updateDisplay();

  // Serial Debug
  Serial.print(F("Raw: "));
  Serial.print(currentValue);
  Serial.print(F(" Peak: "));
  Serial.println(peakValue);

  delay(50);
}

void readFieldStrength() {
  long sum = 0;
  int maxVal = 0;

  // Mehrere Samples lesen
  for (int i = 0; i < NUM_SAMPLES; i++) {
    int val = analogRead(RF_PIN);
    sum += val;
    if (val > maxVal) maxVal = val;
    delayMicroseconds(50);
  }

  // Peak-Detektion (Maximum der Samples)
  currentValue = maxVal;

  // Glättung für stabilere Anzeige
  smoothedValue = (SMOOTHING * currentValue) + ((1 - SMOOTHING) * smoothedValue);
}

int getSMeterLevel(float value) {
  for (int i = 9; i >= 0; i--) {
    if (value >= S_LEVELS[i]) {
      return i;
    }
  }
  return 0;
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("Feldstaerke-Meter"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Analoger Balken
  int barWidth = map(constrain(smoothedValue, 0, 1023), 0, 1023, 0, 120);
  int peakPos = map(constrain(peakValue, 0, 1023), 0, 1023, 0, 120);

  display.drawRect(3, 15, 122, 16, SSD1306_WHITE);
  display.fillRect(4, 16, barWidth, 14, SSD1306_WHITE);

  // Peak-Marker
  if (peakPos > 0) {
    display.drawLine(4 + peakPos, 14, 4 + peakPos, 32, SSD1306_WHITE);
  }

  // S-Meter Skala
  display.setTextSize(1);
  display.setCursor(0, 33);
  display.print(F("1 3 5 7 9 +20 +40"));

  // S-Meter Striche
  for (int i = 0; i < 10; i++) {
    int x = 4 + (i * 12);
    display.drawLine(x, 31, x, 33, SSD1306_WHITE);
  }

  // Digitale Anzeige
  display.setTextSize(2);
  display.setCursor(0, 45);

  int sLevel = getSMeterLevel(smoothedValue);
  if (sLevel <= 9) {
    display.print(F("S"));
    display.print(sLevel);
  }

  // Prozent-Anzeige
  display.setTextSize(1);
  display.setCursor(50, 48);
  int percent = map(constrain(smoothedValue, 0, 1023), 0, 1023, 0, 100);
  display.print(percent);
  display.println(F("%"));

  // Peak-Wert
  display.setCursor(50, 56);
  display.print(F("Pk:"));
  int peakPercent = map(constrain(peakValue, 0, 1023), 0, 1023, 0, 100);
  display.print(peakPercent);
  display.println(F("%"));

  // Raw-Wert klein
  display.setCursor(90, 48);
  display.print((int)smoothedValue);

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 15);
  display.println(F("Feldstaerke"));
  display.setCursor(25, 30);
  display.println(F("Messer"));
  display.setCursor(20, 50);
  display.println(F("FunkPilot"));
  display.display();
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'field_strength_meter.ino',

  wiring: [
    { from: 'Antenne', to: 'Dioden-Detektor', notes: 'Spannungsverdoppler' },
    { from: 'Detektor Ausgang', to: 'Arduino A0', color: 'Blau', notes: 'über 100k' },
    { from: 'Arduino D2', to: 'Taster Peak Reset', color: 'Gelb', notes: 'nach GND' },
    { from: 'Arduino A4 (SDA)', to: 'OLED SDA', color: 'Grün' },
    { from: 'Arduino A5 (SCL)', to: 'OLED SCL', color: 'Weiß' },
    { from: 'Arduino 5V', to: 'OLED VCC', color: 'Rot' },
    { from: 'Arduino GND', to: 'OLED GND + Detektor GND', color: 'Schwarz' },
    { from: 'BNC (optional)', to: 'Detektor Eingang', notes: 'externe Antenne' },
  ],

  customizationSuggestions: [
    'Akustischer Signalton proportional zur Stärke',
    'Min/Max Speicherung',
    'Kalibrierung mit bekannter Quelle',
    'Frequenzselektiver Eingang mit LC-Filter',
    'Logging auf SD-Karte für Feldmessungen',
  ],

  externalLinks: [
    { title: 'Dioden-Detektor Schaltung', url: 'https://www.electronics-tutorials.ws/diode/diode_7.html' },
  ],
};
