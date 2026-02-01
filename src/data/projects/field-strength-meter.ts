import type { HamProject } from '../../types/projects';

export const fieldStrengthMeter: HamProject = {
  id: 'field-strength-meter',
  name: {
    de: 'Feldstärkemessgerät',
    en: 'Field Strength Meter',
    sl: 'Merilnik jakosti polja',
  },
  category: 'measurement',
  difficulty: 1,
  description: {
    de: 'Einfaches Feldstärkemessgerät für Antennenabgleich und HF-Suche. Breitbandig von 1-500 MHz. Mit Peak-Hold und analoger Balkenanzeige.',
    en: 'Simple field strength meter for antenna tuning and RF detection. Broadband from 1-500 MHz. With peak hold and analog bar display.',
    sl: 'Preprost merilnik jakosti polja za nastavitev antene in iskanje RF signalov. Širokopasovni od 1-500 MHz. S funkcijo Peak-Hold in analognim prikazom.',
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
      name: { de: 'Schottky-Diode 1N5711', en: 'Schottky Diode 1N5711', sl: 'Schottky dioda 1N5711' },
      quantity: 2,
      notes: {
        de: 'Spannungsverdoppler',
        en: 'Voltage doubler',
        sl: 'Podvojevalnik napetosti',
      },
    },
    {
      name: { de: 'Kondensator 100pF', en: 'Capacitor 100pF', sl: 'Kondenzator 100pF' },
      quantity: 2,
    },
    {
      name: { de: 'Kondensator 100nF', en: 'Capacitor 100nF', sl: 'Kondenzator 100nF' },
      quantity: 2,
    },
    {
      name: { de: 'Widerstand 10k', en: 'Resistor 10k', sl: 'Upor 10k' },
      quantity: 1,
    },
    {
      name: { de: 'Widerstand 100k', en: 'Resistor 100k', sl: 'Upor 100k' },
      quantity: 1,
    },
    {
      name: { de: 'Teleskopantenne', en: 'Telescopic antenna', sl: 'Teleskopska antena' },
      quantity: 1,
      notes: {
        de: 'oder Drahtantenne',
        en: 'or wire antenna',
        sl: 'ali žična antena',
      },
    },
    {
      name: { de: 'BNC-Buchse', en: 'BNC connector', sl: 'BNC priključek' },
      quantity: 1,
      notes: {
        de: 'optional für ext. Antenne',
        en: 'optional for external antenna',
        sl: 'opcijsko za zunanjo anteno',
      },
    },
    {
      name: { de: 'Taster', en: 'Push button', sl: 'Tipka' },
      quantity: 1,
      notes: {
        de: 'Peak Reset',
        en: 'Peak Reset',
        sl: 'Ponastavitev vrha',
      },
    },
  ],
  estimatedCost: '~12€',

  code: {
    de: `// =====================================================
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
    en: `// =====================================================
// Field Strength Meter - FunkPilot DIY Project
// Hardware: Arduino Nano + OLED
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// Simple broadband field strength meter
// For antenna tuning and RF detection
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
const int RF_PIN = A0;         // RF input (rectified)
const int BTN_RESET = 2;       // Peak Reset button

// Calibration
const int NUM_SAMPLES = 100;   // Number of samples
const float SMOOTHING = 0.3;   // Smoothing factor (0-1)

// Measured values
float currentValue = 0;
float peakValue = 0;
float smoothedValue = 0;
unsigned long peakTime = 0;

// S-Meter simulation (approximate mapping)
const int S_LEVELS[] = {0, 50, 100, 150, 200, 270, 350, 450, 550, 700};

void setup() {
  Serial.begin(9600);

  pinMode(BTN_RESET, INPUT_PULLUP);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED not found"));
    while(1);
  }

  showWelcome();
  delay(2000);
}

void loop() {
  // Read measurement
  readFieldStrength();

  // Update peak
  if (currentValue > peakValue) {
    peakValue = currentValue;
    peakTime = millis();
  }

  // Peak Reset button
  if (!digitalRead(BTN_RESET)) {
    delay(50);
    while(!digitalRead(BTN_RESET));
    peakValue = 0;
    delay(100);
  }

  // Slowly decay peak after 10 seconds
  if (millis() - peakTime > 10000) {
    peakValue = peakValue * 0.99;
  }

  // Update display
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

  // Read multiple samples
  for (int i = 0; i < NUM_SAMPLES; i++) {
    int val = analogRead(RF_PIN);
    sum += val;
    if (val > maxVal) maxVal = val;
    delayMicroseconds(50);
  }

  // Peak detection (maximum of samples)
  currentValue = maxVal;

  // Smoothing for stable display
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
  display.println(F("Field Strength Meter"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Analog bar
  int barWidth = map(constrain(smoothedValue, 0, 1023), 0, 1023, 0, 120);
  int peakPos = map(constrain(peakValue, 0, 1023), 0, 1023, 0, 120);

  display.drawRect(3, 15, 122, 16, SSD1306_WHITE);
  display.fillRect(4, 16, barWidth, 14, SSD1306_WHITE);

  // Peak marker
  if (peakPos > 0) {
    display.drawLine(4 + peakPos, 14, 4 + peakPos, 32, SSD1306_WHITE);
  }

  // S-Meter scale
  display.setTextSize(1);
  display.setCursor(0, 33);
  display.print(F("1 3 5 7 9 +20 +40"));

  // S-Meter ticks
  for (int i = 0; i < 10; i++) {
    int x = 4 + (i * 12);
    display.drawLine(x, 31, x, 33, SSD1306_WHITE);
  }

  // Digital display
  display.setTextSize(2);
  display.setCursor(0, 45);

  int sLevel = getSMeterLevel(smoothedValue);
  if (sLevel <= 9) {
    display.print(F("S"));
    display.print(sLevel);
  }

  // Percentage display
  display.setTextSize(1);
  display.setCursor(50, 48);
  int percent = map(constrain(smoothedValue, 0, 1023), 0, 1023, 0, 100);
  display.print(percent);
  display.println(F("%"));

  // Peak value
  display.setCursor(50, 56);
  display.print(F("Pk:"));
  int peakPercent = map(constrain(peakValue, 0, 1023), 0, 1023, 0, 100);
  display.print(peakPercent);
  display.println(F("%"));

  // Raw value small
  display.setCursor(90, 48);
  display.print((int)smoothedValue);

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 15);
  display.println(F("Field Strength"));
  display.setCursor(25, 30);
  display.println(F("Meter"));
  display.setCursor(20, 50);
  display.println(F("FunkPilot"));
  display.display();
}
`,
    sl: `// =====================================================
// Merilnik jakosti polja - FunkPilot DIY projekt
// Strojna oprema: Arduino Nano + OLED
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Preprost sirokopasovni merilnik jakosti polja
// Za nastavitev antene in iskanje RF signalov
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
const int RF_PIN = A0;         // RF vhod (usmerjen)
const int BTN_RESET = 2;       // Tipka za ponastavitev vrha

// Kalibracija
const int NUM_SAMPLES = 100;   // Stevilo vzorcev
const float SMOOTHING = 0.3;   // Faktor glajenja (0-1)

// Izmerjene vrednosti
float currentValue = 0;
float peakValue = 0;
float smoothedValue = 0;
unsigned long peakTime = 0;

// S-Meter simulacija (priblizna dodelitev)
const int S_LEVELS[] = {0, 50, 100, 150, 200, 270, 350, 450, 550, 700};

void setup() {
  Serial.begin(9600);

  pinMode(BTN_RESET, INPUT_PULLUP);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED ni najden"));
    while(1);
  }

  showWelcome();
  delay(2000);
}

void loop() {
  // Branje meritve
  readFieldStrength();

  // Posodobitev vrha
  if (currentValue > peakValue) {
    peakValue = currentValue;
    peakTime = millis();
  }

  // Tipka za ponastavitev vrha
  if (!digitalRead(BTN_RESET)) {
    delay(50);
    while(!digitalRead(BTN_RESET));
    peakValue = 0;
    delay(100);
  }

  // Pocasno zmanjsevanje vrha po 10 sekundah
  if (millis() - peakTime > 10000) {
    peakValue = peakValue * 0.99;
  }

  // Posodobitev zaslona
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

  // Branje vec vzorcev
  for (int i = 0; i < NUM_SAMPLES; i++) {
    int val = analogRead(RF_PIN);
    sum += val;
    if (val > maxVal) maxVal = val;
    delayMicroseconds(50);
  }

  // Detekcija vrha (maksimum vzorcev)
  currentValue = maxVal;

  // Glajenje za stabilnejsi prikaz
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

  // Glava
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("Merilnik jakosti"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Analogna vrstica
  int barWidth = map(constrain(smoothedValue, 0, 1023), 0, 1023, 0, 120);
  int peakPos = map(constrain(peakValue, 0, 1023), 0, 1023, 0, 120);

  display.drawRect(3, 15, 122, 16, SSD1306_WHITE);
  display.fillRect(4, 16, barWidth, 14, SSD1306_WHITE);

  // Oznaka vrha
  if (peakPos > 0) {
    display.drawLine(4 + peakPos, 14, 4 + peakPos, 32, SSD1306_WHITE);
  }

  // S-Meter lestvica
  display.setTextSize(1);
  display.setCursor(0, 33);
  display.print(F("1 3 5 7 9 +20 +40"));

  // S-Meter crtice
  for (int i = 0; i < 10; i++) {
    int x = 4 + (i * 12);
    display.drawLine(x, 31, x, 33, SSD1306_WHITE);
  }

  // Digitalni prikaz
  display.setTextSize(2);
  display.setCursor(0, 45);

  int sLevel = getSMeterLevel(smoothedValue);
  if (sLevel <= 9) {
    display.print(F("S"));
    display.print(sLevel);
  }

  // Odstotni prikaz
  display.setTextSize(1);
  display.setCursor(50, 48);
  int percent = map(constrain(smoothedValue, 0, 1023), 0, 1023, 0, 100);
  display.print(percent);
  display.println(F("%"));

  // Vrhovna vrednost
  display.setCursor(50, 56);
  display.print(F("Pk:"));
  int peakPercent = map(constrain(peakValue, 0, 1023), 0, 1023, 0, 100);
  display.print(peakPercent);
  display.println(F("%"));

  // Surova vrednost majhna
  display.setCursor(90, 48);
  display.print((int)smoothedValue);

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 15);
  display.println(F("Jakost polja"));
  display.setCursor(25, 30);
  display.println(F("Merilnik"));
  display.setCursor(20, 50);
  display.println(F("FunkPilot"));
  display.display();
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'field_strength_meter.ino',

  wiring: [
    {
      from: { de: 'Antenne', en: 'Antenna', sl: 'Antena' },
      to: { de: 'Dioden-Detektor', en: 'Diode detector', sl: 'Diodni detektor' },
      notes: { de: 'Spannungsverdoppler', en: 'Voltage doubler', sl: 'Podvojevalnik napetosti' },
    },
    {
      from: { de: 'Detektor Ausgang', en: 'Detector output', sl: 'Izhod detektorja' },
      to: { de: 'Arduino A0', en: 'Arduino A0', sl: 'Arduino A0' },
      color: 'Blau',
      notes: { de: 'über 100k', en: 'via 100k', sl: 'preko 100k' },
    },
    {
      from: { de: 'Arduino D2', en: 'Arduino D2', sl: 'Arduino D2' },
      to: { de: 'Taster Peak Reset', en: 'Peak Reset button', sl: 'Tipka za ponastavitev vrha' },
      color: 'Gelb',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' },
    },
    {
      from: { de: 'Arduino A4 (SDA)', en: 'Arduino A4 (SDA)', sl: 'Arduino A4 (SDA)' },
      to: { de: 'OLED SDA', en: 'OLED SDA', sl: 'OLED SDA' },
      color: 'Grün',
    },
    {
      from: { de: 'Arduino A5 (SCL)', en: 'Arduino A5 (SCL)', sl: 'Arduino A5 (SCL)' },
      to: { de: 'OLED SCL', en: 'OLED SCL', sl: 'OLED SCL' },
      color: 'Weiß',
    },
    {
      from: { de: 'Arduino 5V', en: 'Arduino 5V', sl: 'Arduino 5V' },
      to: { de: 'OLED VCC', en: 'OLED VCC', sl: 'OLED VCC' },
      color: 'Rot',
    },
    {
      from: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' },
      to: { de: 'OLED GND + Detektor GND', en: 'OLED GND + Detector GND', sl: 'OLED GND + Detektor GND' },
      color: 'Schwarz',
    },
    {
      from: { de: 'BNC (optional)', en: 'BNC (optional)', sl: 'BNC (opcijsko)' },
      to: { de: 'Detektor Eingang', en: 'Detector input', sl: 'Vhod detektorja' },
      notes: { de: 'externe Antenne', en: 'external antenna', sl: 'zunanja antena' },
    },
  ],

  customizationSuggestions: [
    {
      de: 'Akustischer Signalton proportional zur Stärke',
      en: 'Acoustic tone proportional to signal strength',
      sl: 'Zvocni signal sorazmeren z jakostjo',
    },
    {
      de: 'Min/Max Speicherung',
      en: 'Min/Max storage',
      sl: 'Shranjevanje min/max vrednosti',
    },
    {
      de: 'Kalibrierung mit bekannter Quelle',
      en: 'Calibration with known source',
      sl: 'Kalibracija z znanim virom',
    },
    {
      de: 'Frequenzselektiver Eingang mit LC-Filter',
      en: 'Frequency-selective input with LC filter',
      sl: 'Frekvencno selektiven vhod z LC filtrom',
    },
    {
      de: 'Logging auf SD-Karte für Feldmessungen',
      en: 'Logging to SD card for field measurements',
      sl: 'Beleženje na SD kartico za terenske meritve',
    },
  ],

  externalLinks: [
    {
      title: {
        de: 'Dioden-Detektor Schaltung',
        en: 'Diode detector circuit',
        sl: 'Vezje diodnega detektorja',
      },
      url: 'https://www.electronics-tutorials.ws/diode/diode_7.html',
    },
  ],
};
