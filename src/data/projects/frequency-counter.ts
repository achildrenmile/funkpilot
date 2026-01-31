import type { HamProject } from '../../types/projects';

export const frequencyCounter: HamProject = {
  id: 'frequency-counter',
  name: 'Frequenzzähler',
  category: 'measurement',
  difficulty: 2,
  description: 'Einfacher Frequenzzähler bis 8 MHz (direkt) oder 50+ MHz mit Vorteiler. 7-stellige Anzeige auf OLED. Gate-Zeit einstellbar für Auflösung/Geschwindigkeit.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'OLED Display 0.96"', quantity: 1, notes: 'SSD1306 I2C' },
    { name: 'Schmitt-Trigger 74HC14', quantity: 1, notes: 'Signal-Aufbereitung' },
    { name: 'Widerstand 10k', quantity: 2 },
    { name: 'Widerstand 1k', quantity: 1 },
    { name: 'Kondensator 100nF', quantity: 3 },
    { name: 'Kondensator 10pF', quantity: 2, notes: 'Eingangs-Kopplung' },
    { name: 'BNC-Buchse', quantity: 1, notes: 'HF-Eingang' },
    { name: 'Taster', quantity: 2, notes: 'Gate-Zeit Auswahl' },
  ],
  estimatedCost: '~15€',

  code: `// =====================================================
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
  codeLanguage: 'cpp',
  codeFileName: 'frequency_counter.ino',

  wiring: [
    { from: 'Arduino D5 (T1)', to: '74HC14 Ausgang', color: 'Blau', notes: 'Zähler-Eingang' },
    { from: 'BNC Mitte', to: '74HC14 Eingang', notes: 'über 10pF + 10k' },
    { from: 'Arduino D2', to: 'Taster Gate-Zeit', color: 'Gelb', notes: 'nach GND' },
    { from: 'Arduino D3', to: 'Taster Vorteiler', color: 'Grün', notes: 'nach GND' },
    { from: 'Arduino A4 (SDA)', to: 'OLED SDA', color: 'Weiß' },
    { from: 'Arduino A5 (SCL)', to: 'OLED SCL', color: 'Grau' },
    { from: 'Arduino 5V', to: '74HC14 VCC + OLED VCC', color: 'Rot' },
    { from: 'Arduino GND', to: 'Alle GND + BNC Schirm', color: 'Schwarz' },
  ],

  customizationSuggestions: [
    'Vorteiler-IC für höhere Frequenzen (z.B. 74HC390)',
    'Frequenz-Offset für VFO-Anzeige',
    'RS232/USB Ausgabe für PC-Logging',
    'Referenz-Oszillator für Kalibrierung',
    'Mehrkanal-Version für Frequenzvergleich',
  ],

  externalLinks: [
    { title: 'Timer1 als Zähler', url: 'https://www.arduino.cc/reference/en/language/functions/time/millis/' },
  ],
};
