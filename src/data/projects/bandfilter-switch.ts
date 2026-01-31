import type { HamProject } from '../../types/projects';

export const bandfilterSwitch: HamProject = {
  id: 'bandfilter-switch',
  name: 'Automatischer Bandfilter-Umschalter',
  category: 'control',
  difficulty: 2,
  description: 'Schaltet automatisch das richtige Bandpassfilter basierend auf der Frequenz. Band-Decoder Eingang vom Transceiver oder CAT-Steuerung. Bis zu 10 Bänder.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'OLED Display 0.96"', quantity: 1 },
    { name: 'Relais-Modul 8-fach', quantity: 1, notes: 'für 8 Bandfilter' },
    { name: 'Optokoppler PC817', quantity: 4, notes: 'Band-Decoder Eingang' },
    { name: 'LED 3mm', quantity: 8, notes: 'Band-Anzeige' },
    { name: 'Widerstand 1k', quantity: 8 },
    { name: 'Widerstand 220 Ohm', quantity: 8 },
    { name: 'Stiftleiste', quantity: 1, notes: 'Band-Decoder Anschluss' },
  ],
  estimatedCost: '~25€',

  code: `// =====================================================
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
  codeLanguage: 'cpp',
  codeFileName: 'bandfilter_switch.ino',

  wiring: [
    { from: 'TRX Band-Data A', to: 'Optokoppler 1 → Arduino D2', color: 'Weiß' },
    { from: 'TRX Band-Data B', to: 'Optokoppler 2 → Arduino D3', color: 'Grau' },
    { from: 'TRX Band-Data C', to: 'Optokoppler 3 → Arduino A0', color: 'Braun' },
    { from: 'TRX Band-Data D', to: 'Optokoppler 4 → Arduino A1', color: 'Gelb' },
    { from: 'Arduino D4-D11', to: 'Relais-Modul IN1-IN8', color: 'Blau' },
    { from: 'Relais COM', to: 'Bandfilter Eingang', notes: 'HF-Pfad' },
    { from: 'Relais NO', to: 'Bandfilter Ausgang', notes: 'zum jeweiligen Filter' },
    { from: 'Arduino A2', to: 'Taster Band Up', color: 'Gelb', notes: 'nach GND' },
    { from: 'Arduino A3', to: 'Taster Band Down', color: 'Grün', notes: 'nach GND' },
    { from: 'Arduino A4/A5', to: 'OLED SDA/SCL' },
    { from: 'Arduino 5V', to: 'Relais-Modul VCC + OLED VCC', color: 'Rot' },
    { from: 'Arduino GND', to: 'Alle GND', color: 'Schwarz' },
  ],

  customizationSuggestions: [
    'CAT-Steuerung für direkte Frequenzabfrage',
    'Sequencer-Funktion für PA',
    'Logging der Bandwechsel',
    'Web-Interface mit ESP32',
    'LDMOS-Schutz bei falscher Filterauswahl',
  ],

  externalLinks: [
    { title: 'Yaesu Band Data', url: 'https://www.yaesu.com/' },
    { title: 'Icom CI-V Band Data', url: 'https://www.icomamerica.com/' },
  ],
};
