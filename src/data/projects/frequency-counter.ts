import type { HamProject } from '../../types/projects';

export const frequencyCounter: HamProject = {
  id: 'frequency-counter',
  name: {
    de: 'Frequenzzähler',
    en: 'Frequency Counter',
    sl: 'Frekvenčni števec'
  },
  category: 'measurement',
  difficulty: 2,
  description: {
    de: 'Einfacher Frequenzzähler bis 8 MHz (direkt) oder 50+ MHz mit Vorteiler. 7-stellige Anzeige auf OLED. Gate-Zeit einstellbar für Auflösung/Geschwindigkeit.',
    en: 'Simple frequency counter up to 8 MHz (direct) or 50+ MHz with prescaler. 7-digit display on OLED. Adjustable gate time for resolution/speed.',
    sl: 'Preprost frekvenčni števec do 8 MHz (neposredno) ali 50+ MHz s preddelilnikom. 7-mestni prikaz na OLED. Nastavljiv čas vrat za ločljivost/hitrost.'
  },
  hardware: 'arduino-nano',

  components: [
    {
      name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' },
      quantity: 1
    },
    {
      name: { de: 'OLED Display 0.96"', en: 'OLED Display 0.96"', sl: 'OLED zaslon 0.96"' },
      quantity: 1,
      notes: { de: 'SSD1306 I2C', en: 'SSD1306 I2C', sl: 'SSD1306 I2C' }
    },
    {
      name: { de: 'Schmitt-Trigger 74HC14', en: 'Schmitt-Trigger 74HC14', sl: 'Schmittov sprožilnik 74HC14' },
      quantity: 1,
      notes: { de: 'Signal-Aufbereitung', en: 'Signal conditioning', sl: 'Obdelava signala' }
    },
    {
      name: { de: 'Widerstand 10k', en: 'Resistor 10k', sl: 'Upor 10k' },
      quantity: 2
    },
    {
      name: { de: 'Widerstand 1k', en: 'Resistor 1k', sl: 'Upor 1k' },
      quantity: 1
    },
    {
      name: { de: 'Kondensator 100nF', en: 'Capacitor 100nF', sl: 'Kondenzator 100nF' },
      quantity: 3
    },
    {
      name: { de: 'Kondensator 10pF', en: 'Capacitor 10pF', sl: 'Kondenzator 10pF' },
      quantity: 2,
      notes: { de: 'Eingangs-Kopplung', en: 'Input coupling', sl: 'Vhodna sklopitev' }
    },
    {
      name: { de: 'BNC-Buchse', en: 'BNC connector', sl: 'BNC priključek' },
      quantity: 1,
      notes: { de: 'HF-Eingang', en: 'RF input', sl: 'RF vhod' }
    },
    {
      name: { de: 'Taster', en: 'Push button', sl: 'Tipka' },
      quantity: 2,
      notes: { de: 'Gate-Zeit Auswahl', en: 'Gate time selection', sl: 'Izbira časa vrat' }
    },
  ],
  estimatedCost: '~15€',

  code: {
    de: `// =====================================================
// Frequenzzähler - FunkPilot Bastelprojekt
// Hardware: Arduino Nano + SSD1306 OLED
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Misst Frequenzen bis ca. 8 MHz direkt
// Höhere Frequenzen mit Vorteiler (1:10, 1:100)
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
const int FREQ_PIN = 5;        // T1 Timer-Eingang (D5 = T1)
const int BTN_GATE = 2;        // Gate-Zeit Taster
const int BTN_PRESCALER = 3;   // Vorteiler-Auswahl

// Gate-Zeiten in ms
const int gateTimesMs[] = {100, 250, 500, 1000};
const char* gateLabels[] = {"0.1s", "0.25s", "0.5s", "1.0s"};
int gateIndex = 2;  // Standard: 500ms

// Vorteiler (1, 10, 100)
const int prescalers[] = {1, 10, 100};
int prescalerIndex = 0;

// Messwerte
volatile unsigned long overflowCount = 0;
unsigned long frequency = 0;
unsigned long lastFrequency = 0;

void setup() {
  Serial.begin(9600);

  pinMode(BTN_GATE, INPUT_PULLUP);
  pinMode(BTN_PRESCALER, INPUT_PULLUP);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED nicht gefunden"));
    while(1);
  }

  // Timer1 als Zähler konfigurieren
  // Externer Takt auf T1 (D5), steigende Flanke
  TCCR1A = 0;
  TCCR1B = 0;

  showWelcome();
  delay(2000);

  // Timer1 Overflow Interrupt aktivieren
  TIMSK1 = (1 << TOIE1);
}

// Timer1 Overflow ISR
ISR(TIMER1_OVF_vect) {
  overflowCount++;
}

void loop() {
  // Taster abfragen
  if (!digitalRead(BTN_GATE)) {
    delay(50);
    while(!digitalRead(BTN_GATE));
    gateIndex = (gateIndex + 1) % 4;
    delay(100);
  }

  if (!digitalRead(BTN_PRESCALER)) {
    delay(50);
    while(!digitalRead(BTN_PRESCALER));
    prescalerIndex = (prescalerIndex + 1) % 3;
    delay(100);
  }

  // Messung durchführen
  measureFrequency();

  // Anzeige aktualisieren
  updateDisplay();

  delay(50);
}

void measureFrequency() {
  int gateTime = gateTimesMs[gateIndex];

  // Zähler zurücksetzen
  noInterrupts();
  TCNT1 = 0;
  overflowCount = 0;

  // Timer1 starten (externer Takt, steigende Flanke)
  TCCR1B = (1 << CS12) | (1 << CS11) | (1 << CS10);
  interrupts();

  // Gate-Zeit warten
  delay(gateTime);

  // Timer stoppen
  noInterrupts();
  TCCR1B = 0;
  unsigned int count = TCNT1;
  unsigned long overflows = overflowCount;
  interrupts();

  // Gesamtzählerstand berechnen
  unsigned long totalCount = (overflows * 65536UL) + count;

  // Frequenz berechnen
  // f = count / gateTime * 1000 * prescaler
  frequency = (totalCount * 1000UL / gateTime) * prescalers[prescalerIndex];

  // Glättung (Mittelwert mit vorherigem Wert)
  if (lastFrequency > 0 && abs((long)(frequency - lastFrequency)) < lastFrequency / 10) {
    frequency = (frequency + lastFrequency) / 2;
  }
  lastFrequency = frequency;
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Freq.zaehler  "));
  display.print(gateLabels[gateIndex]);

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Frequenz anzeigen
  display.setTextSize(2);
  display.setCursor(0, 20);

  if (frequency == 0) {
    display.println(F("--- Hz"));
  } else if (frequency < 1000) {
    display.print(frequency);
    display.println(F(" Hz"));
  } else if (frequency < 1000000) {
    display.print(frequency / 1000.0, 3);
    display.println(F(" kHz"));
  } else {
    display.print(frequency / 1000000.0, 6);
    display.println(F(" MHz"));
  }

  // Vorteiler-Info
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print(F("Vorteiler: 1:"));
  display.println(prescalers[prescalerIndex]);

  // Rohdaten
  display.setCursor(0, 55);
  display.print(F("Raw: "));
  display.print(frequency);
  display.println(F(" Hz"));

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 20);
  display.println(F("Frequenzzaehler"));
  display.setCursor(30, 35);
  display.println(F("FunkPilot"));
  display.setCursor(20, 50);
  display.println(F("0 - 50+ MHz"));
  display.display();
}
`,
    en: `// =====================================================
// Frequency Counter - FunkPilot DIY Project
// Hardware: Arduino Nano + SSD1306 OLED
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// Measures frequencies up to approx. 8 MHz directly
// Higher frequencies with prescaler (1:10, 1:100)
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
const int FREQ_PIN = 5;        // T1 Timer input (D5 = T1)
const int BTN_GATE = 2;        // Gate time button
const int BTN_PRESCALER = 3;   // Prescaler selection

// Gate times in ms
const int gateTimesMs[] = {100, 250, 500, 1000};
const char* gateLabels[] = {"0.1s", "0.25s", "0.5s", "1.0s"};
int gateIndex = 2;  // Default: 500ms

// Prescaler (1, 10, 100)
const int prescalers[] = {1, 10, 100};
int prescalerIndex = 0;

// Measured values
volatile unsigned long overflowCount = 0;
unsigned long frequency = 0;
unsigned long lastFrequency = 0;

void setup() {
  Serial.begin(9600);

  pinMode(BTN_GATE, INPUT_PULLUP);
  pinMode(BTN_PRESCALER, INPUT_PULLUP);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED not found"));
    while(1);
  }

  // Configure Timer1 as counter
  // External clock on T1 (D5), rising edge
  TCCR1A = 0;
  TCCR1B = 0;

  showWelcome();
  delay(2000);

  // Enable Timer1 overflow interrupt
  TIMSK1 = (1 << TOIE1);
}

// Timer1 Overflow ISR
ISR(TIMER1_OVF_vect) {
  overflowCount++;
}

void loop() {
  // Check buttons
  if (!digitalRead(BTN_GATE)) {
    delay(50);
    while(!digitalRead(BTN_GATE));
    gateIndex = (gateIndex + 1) % 4;
    delay(100);
  }

  if (!digitalRead(BTN_PRESCALER)) {
    delay(50);
    while(!digitalRead(BTN_PRESCALER));
    prescalerIndex = (prescalerIndex + 1) % 3;
    delay(100);
  }

  // Perform measurement
  measureFrequency();

  // Update display
  updateDisplay();

  delay(50);
}

void measureFrequency() {
  int gateTime = gateTimesMs[gateIndex];

  // Reset counter
  noInterrupts();
  TCNT1 = 0;
  overflowCount = 0;

  // Start Timer1 (external clock, rising edge)
  TCCR1B = (1 << CS12) | (1 << CS11) | (1 << CS10);
  interrupts();

  // Wait for gate time
  delay(gateTime);

  // Stop timer
  noInterrupts();
  TCCR1B = 0;
  unsigned int count = TCNT1;
  unsigned long overflows = overflowCount;
  interrupts();

  // Calculate total count
  unsigned long totalCount = (overflows * 65536UL) + count;

  // Calculate frequency
  // f = count / gateTime * 1000 * prescaler
  frequency = (totalCount * 1000UL / gateTime) * prescalers[prescalerIndex];

  // Smoothing (average with previous value)
  if (lastFrequency > 0 && abs((long)(frequency - lastFrequency)) < lastFrequency / 10) {
    frequency = (frequency + lastFrequency) / 2;
  }
  lastFrequency = frequency;
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Freq.Counter  "));
  display.print(gateLabels[gateIndex]);

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Display frequency
  display.setTextSize(2);
  display.setCursor(0, 20);

  if (frequency == 0) {
    display.println(F("--- Hz"));
  } else if (frequency < 1000) {
    display.print(frequency);
    display.println(F(" Hz"));
  } else if (frequency < 1000000) {
    display.print(frequency / 1000.0, 3);
    display.println(F(" kHz"));
  } else {
    display.print(frequency / 1000000.0, 6);
    display.println(F(" MHz"));
  }

  // Prescaler info
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print(F("Prescaler: 1:"));
  display.println(prescalers[prescalerIndex]);

  // Raw data
  display.setCursor(0, 55);
  display.print(F("Raw: "));
  display.print(frequency);
  display.println(F(" Hz"));

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 20);
  display.println(F("Freq. Counter"));
  display.setCursor(30, 35);
  display.println(F("FunkPilot"));
  display.setCursor(20, 50);
  display.println(F("0 - 50+ MHz"));
  display.display();
}
`,
    sl: `// =====================================================
// Frekvenčni števec - FunkPilot DIY projekt
// Strojna oprema: Arduino Nano + SSD1306 OLED
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Meri frekvence do pribl. 8 MHz neposredno
// Višje frekvence s preddelilnikom (1:10, 1:100)
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
const int FREQ_PIN = 5;        // T1 vhod časovnika (D5 = T1)
const int BTN_GATE = 2;        // Tipka za čas vrat
const int BTN_PRESCALER = 3;   // Izbira preddelilnika

// Časi vrat v ms
const int gateTimesMs[] = {100, 250, 500, 1000};
const char* gateLabels[] = {"0.1s", "0.25s", "0.5s", "1.0s"};
int gateIndex = 2;  // Privzeto: 500ms

// Preddelilnik (1, 10, 100)
const int prescalers[] = {1, 10, 100};
int prescalerIndex = 0;

// Izmerjene vrednosti
volatile unsigned long overflowCount = 0;
unsigned long frequency = 0;
unsigned long lastFrequency = 0;

void setup() {
  Serial.begin(9600);

  pinMode(BTN_GATE, INPUT_PULLUP);
  pinMode(BTN_PRESCALER, INPUT_PULLUP);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED ni najden"));
    while(1);
  }

  // Nastavi Timer1 kot števec
  // Zunanja ura na T1 (D5), naraščajoči rob
  TCCR1A = 0;
  TCCR1B = 0;

  showWelcome();
  delay(2000);

  // Omogoči prekinitev prelivanja Timer1
  TIMSK1 = (1 << TOIE1);
}

// Timer1 prelivanje ISR
ISR(TIMER1_OVF_vect) {
  overflowCount++;
}

void loop() {
  // Preveri tipke
  if (!digitalRead(BTN_GATE)) {
    delay(50);
    while(!digitalRead(BTN_GATE));
    gateIndex = (gateIndex + 1) % 4;
    delay(100);
  }

  if (!digitalRead(BTN_PRESCALER)) {
    delay(50);
    while(!digitalRead(BTN_PRESCALER));
    prescalerIndex = (prescalerIndex + 1) % 3;
    delay(100);
  }

  // Izvedi meritev
  measureFrequency();

  // Posodobi zaslon
  updateDisplay();

  delay(50);
}

void measureFrequency() {
  int gateTime = gateTimesMs[gateIndex];

  // Ponastavi števec
  noInterrupts();
  TCNT1 = 0;
  overflowCount = 0;

  // Zaženi Timer1 (zunanja ura, naraščajoči rob)
  TCCR1B = (1 << CS12) | (1 << CS11) | (1 << CS10);
  interrupts();

  // Počakaj na čas vrat
  delay(gateTime);

  // Ustavi časovnik
  noInterrupts();
  TCCR1B = 0;
  unsigned int count = TCNT1;
  unsigned long overflows = overflowCount;
  interrupts();

  // Izračunaj skupno število
  unsigned long totalCount = (overflows * 65536UL) + count;

  // Izračunaj frekvenco
  // f = count / gateTime * 1000 * prescaler
  frequency = (totalCount * 1000UL / gateTime) * prescalers[prescalerIndex];

  // Glajenje (povprečje s prejšnjo vrednostjo)
  if (lastFrequency > 0 && abs((long)(frequency - lastFrequency)) < lastFrequency / 10) {
    frequency = (frequency + lastFrequency) / 2;
  }
  lastFrequency = frequency;
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Glava
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Frekv.stevec  "));
  display.print(gateLabels[gateIndex]);

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Prikaži frekvenco
  display.setTextSize(2);
  display.setCursor(0, 20);

  if (frequency == 0) {
    display.println(F("--- Hz"));
  } else if (frequency < 1000) {
    display.print(frequency);
    display.println(F(" Hz"));
  } else if (frequency < 1000000) {
    display.print(frequency / 1000.0, 3);
    display.println(F(" kHz"));
  } else {
    display.print(frequency / 1000000.0, 6);
    display.println(F(" MHz"));
  }

  // Info o preddelilniku
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print(F("Preddelilnik: 1:"));
  display.println(prescalers[prescalerIndex]);

  // Surovi podatki
  display.setCursor(0, 55);
  display.print(F("Raw: "));
  display.print(frequency);
  display.println(F(" Hz"));

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 20);
  display.println(F("Frekv. stevec"));
  display.setCursor(30, 35);
  display.println(F("FunkPilot"));
  display.setCursor(20, 50);
  display.println(F("0 - 50+ MHz"));
  display.display();
}
`
  },
  codeLanguage: 'cpp',
  codeFileName: 'frequency_counter.ino',

  wiring: [
    {
      from: { de: 'Arduino D5 (T1)', en: 'Arduino D5 (T1)', sl: 'Arduino D5 (T1)' },
      to: { de: '74HC14 Ausgang', en: '74HC14 Output', sl: '74HC14 Izhod' },
      color: 'Blau',
      notes: { de: 'Zähler-Eingang', en: 'Counter input', sl: 'Vhod števca' }
    },
    {
      from: { de: 'BNC Mitte', en: 'BNC Center', sl: 'BNC Sredina' },
      to: { de: '74HC14 Eingang', en: '74HC14 Input', sl: '74HC14 Vhod' },
      notes: { de: 'über 10pF + 10k', en: 'via 10pF + 10k', sl: 'preko 10pF + 10k' }
    },
    {
      from: { de: 'Arduino D2', en: 'Arduino D2', sl: 'Arduino D2' },
      to: { de: 'Taster Gate-Zeit', en: 'Gate time button', sl: 'Tipka čas vrat' },
      color: 'Gelb',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' }
    },
    {
      from: { de: 'Arduino D3', en: 'Arduino D3', sl: 'Arduino D3' },
      to: { de: 'Taster Vorteiler', en: 'Prescaler button', sl: 'Tipka preddelilnik' },
      color: 'Grün',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' }
    },
    {
      from: { de: 'Arduino A4 (SDA)', en: 'Arduino A4 (SDA)', sl: 'Arduino A4 (SDA)' },
      to: { de: 'OLED SDA', en: 'OLED SDA', sl: 'OLED SDA' },
      color: 'Weiß'
    },
    {
      from: { de: 'Arduino A5 (SCL)', en: 'Arduino A5 (SCL)', sl: 'Arduino A5 (SCL)' },
      to: { de: 'OLED SCL', en: 'OLED SCL', sl: 'OLED SCL' },
      color: 'Grau'
    },
    {
      from: { de: 'Arduino 5V', en: 'Arduino 5V', sl: 'Arduino 5V' },
      to: { de: '74HC14 VCC + OLED VCC', en: '74HC14 VCC + OLED VCC', sl: '74HC14 VCC + OLED VCC' },
      color: 'Rot'
    },
    {
      from: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' },
      to: { de: 'Alle GND + BNC Schirm', en: 'All GND + BNC Shield', sl: 'Vse GND + BNC ščit' },
      color: 'Schwarz'
    },
  ],

  customizationSuggestions: [
    {
      de: 'Vorteiler-IC für höhere Frequenzen (z.B. 74HC390)',
      en: 'Prescaler IC for higher frequencies (e.g. 74HC390)',
      sl: 'IC preddelilnik za višje frekvence (npr. 74HC390)'
    },
    {
      de: 'Frequenz-Offset für VFO-Anzeige',
      en: 'Frequency offset for VFO display',
      sl: 'Frekvenčni odmik za prikaz VFO'
    },
    {
      de: 'RS232/USB Ausgabe für PC-Logging',
      en: 'RS232/USB output for PC logging',
      sl: 'RS232/USB izhod za beleženje na PC'
    },
    {
      de: 'Referenz-Oszillator für Kalibrierung',
      en: 'Reference oscillator for calibration',
      sl: 'Referenčni oscilator za kalibracijo'
    },
    {
      de: 'Mehrkanal-Version für Frequenzvergleich',
      en: 'Multi-channel version for frequency comparison',
      sl: 'Večkanalna verzija za primerjavo frekvenc'
    },
  ],

  externalLinks: [
    {
      title: {
        de: 'Timer1 als Zähler',
        en: 'Timer1 as Counter',
        sl: 'Timer1 kot števec'
      },
      url: 'https://www.arduino.cc/reference/en/language/functions/time/millis/'
    },
  ],
};
