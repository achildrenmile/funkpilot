import type { HamProject } from '../../types/projects';

export const voxCircuit: HamProject = {
  id: 'vox-circuit',
  name: 'VOX-Schaltung',
  category: 'audio',
  difficulty: 1,
  description: 'Sprachgesteuerte PTT-Schaltung (Voice Operated Switch). Einstellbare Empfindlichkeit und Haltezeit. Mit Anti-VOX für Lautsprecher-Betrieb.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'Elektret-Mikrofon', quantity: 1, notes: 'mit Verstärkermodul' },
    { name: 'OLED Display 0.96"', quantity: 1, notes: 'optional' },
    { name: 'Relais 5V', quantity: 1, notes: 'für PTT' },
    { name: 'Potentiometer 10k', quantity: 2, notes: 'Empfindlichkeit + Haltezeit' },
    { name: 'LED rot', quantity: 1, notes: 'TX-Anzeige' },
    { name: 'LED grün', quantity: 1, notes: 'RX-Anzeige' },
    { name: 'Widerstand 220 Ohm', quantity: 2 },
    { name: 'Transistor BC547', quantity: 1, notes: 'Relais-Treiber' },
    { name: 'Diode 1N4001', quantity: 1, notes: 'Freilaufdiode' },
    { name: 'Klinkenbuchse 3.5mm', quantity: 2, notes: 'Mikrofon + PTT' },
  ],
  estimatedCost: '~12€',

  code: `// =====================================================
// VOX-Schaltung - FunkPilot Bastelprojekt
// Hardware: Arduino Nano + Mikrofon + Relais
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Sprachgesteuerte Sende-/Empfangsumschaltung
// Mit Anti-VOX und einstellbaren Parametern
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED (optional)
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
bool hasDisplay = false;

// Pins
const int MIC_PIN = A0;        // Mikrofon-Eingang
const int ANTI_VOX_PIN = A1;   // Anti-VOX Eingang (Lautsprecher)
const int SENS_PIN = A2;       // Empfindlichkeits-Poti
const int DELAY_PIN = A3;      // Haltezeit-Poti
const int PTT_PIN = 4;         // Relais-Ausgang
const int LED_TX = 5;          // TX-LED
const int LED_RX = 6;          // RX-LED
const int BTN_MANUAL = 2;      // Manueller PTT-Taster

// Status
bool pttActive = false;
unsigned long lastVoice = 0;
unsigned long voxHoldTime = 500;  // Haltezeit in ms
int sensitivity = 100;             // Schwellwert

// Audio-Messung
int micLevel = 0;
int antiVoxLevel = 0;
int peakMic = 0;

// Timing
unsigned long lastUpdate = 0;

void setup() {
  Serial.begin(9600);

  pinMode(PTT_PIN, OUTPUT);
  pinMode(LED_TX, OUTPUT);
  pinMode(LED_RX, OUTPUT);
  pinMode(BTN_MANUAL, INPUT_PULLUP);

  digitalWrite(PTT_PIN, LOW);
  digitalWrite(LED_TX, LOW);
  digitalWrite(LED_RX, HIGH);  // RX aktiv

  // OLED versuchen zu initialisieren
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    hasDisplay = true;
    showWelcome();
    delay(1500);
  }

  Serial.println(F("VOX bereit"));
}

void loop() {
  // Einstellungen lesen
  readSettings();

  // Audio-Pegel messen
  measureAudio();

  // VOX-Logik
  processVOX();

  // Manueller PTT
  if (!digitalRead(BTN_MANUAL)) {
    activatePTT();
    while(!digitalRead(BTN_MANUAL));
    // Normale Haltezeit nach manuellem PTT
  }

  // Display aktualisieren (nicht zu oft)
  if (hasDisplay && millis() - lastUpdate > 100) {
    updateDisplay();
    lastUpdate = millis();
  }

  // Debug
  Serial.print(F("Mic:"));
  Serial.print(micLevel);
  Serial.print(F(" Sens:"));
  Serial.print(sensitivity);
  Serial.print(F(" PTT:"));
  Serial.println(pttActive ? "TX" : "RX");

  delay(10);
}

void readSettings() {
  // Empfindlichkeit: 20-300
  sensitivity = map(analogRead(SENS_PIN), 0, 1023, 20, 300);

  // Haltezeit: 100-2000 ms
  voxHoldTime = map(analogRead(DELAY_PIN), 0, 1023, 100, 2000);
}

void measureAudio() {
  int minMic = 1023, maxMic = 0;
  int minAnti = 1023, maxAnti = 0;

  // Schnelle Peak-to-Peak Messung
  for (int i = 0; i < 50; i++) {
    int mic = analogRead(MIC_PIN);
    int anti = analogRead(ANTI_VOX_PIN);

    if (mic < minMic) minMic = mic;
    if (mic > maxMic) maxMic = mic;
    if (anti < minAnti) minAnti = anti;
    if (anti > maxAnti) maxAnti = anti;

    delayMicroseconds(100);
  }

  micLevel = maxMic - minMic;
  antiVoxLevel = maxAnti - minAnti;

  // Peak für Anzeige
  if (micLevel > peakMic) {
    peakMic = micLevel;
  } else {
    peakMic = peakMic * 0.95;  // Langsamer Abfall
  }
}

void processVOX() {
  unsigned long now = millis();

  // Anti-VOX: Wenn Lautsprecher aktiv, nicht senden
  bool antiVoxBlock = (antiVoxLevel > sensitivity / 2);

  // Stimme erkannt?
  bool voiceDetected = (micLevel > sensitivity) && !antiVoxBlock;

  if (voiceDetected) {
    lastVoice = now;
    if (!pttActive) {
      activatePTT();
    }
  }

  // Haltezeit abgelaufen?
  if (pttActive && (now - lastVoice > voxHoldTime)) {
    deactivatePTT();
  }
}

void activatePTT() {
  pttActive = true;
  digitalWrite(PTT_PIN, HIGH);
  digitalWrite(LED_TX, HIGH);
  digitalWrite(LED_RX, LOW);
  Serial.println(F(">>> TX"));
}

void deactivatePTT() {
  pttActive = false;
  digitalWrite(PTT_PIN, LOW);
  digitalWrite(LED_TX, LOW);
  digitalWrite(LED_RX, HIGH);
  Serial.println(F("<<< RX"));
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("VOX  "));
  display.print(pttActive ? F("[TX]") : F("[RX]"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Mikrofon-Pegel
  display.setCursor(0, 14);
  display.print(F("MIC: "));
  int barMic = map(constrain(peakMic, 0, 500), 0, 500, 0, 80);
  display.drawRect(30, 14, 82, 8, SSD1306_WHITE);
  display.fillRect(31, 15, barMic, 6, SSD1306_WHITE);

  // Schwellwert-Linie
  int threshPos = map(sensitivity, 0, 500, 0, 80);
  display.drawLine(30 + threshPos, 12, 30 + threshPos, 24, SSD1306_WHITE);

  // Anti-VOX
  display.setCursor(0, 26);
  display.print(F("A-V: "));
  int barAnti = map(constrain(antiVoxLevel, 0, 300), 0, 300, 0, 80);
  display.drawRect(30, 26, 82, 8, SSD1306_WHITE);
  display.fillRect(31, 27, barAnti, 6, SSD1306_WHITE);

  // Einstellungen
  display.setCursor(0, 40);
  display.print(F("Sens: "));
  display.print(sensitivity);

  display.setCursor(0, 50);
  display.print(F("Delay: "));
  display.print(voxHoldTime);
  display.print(F(" ms"));

  // TX/RX Status gross
  display.setTextSize(2);
  display.setCursor(90, 40);
  display.println(pttActive ? F("TX") : F("RX"));

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(30, 20);
  display.println(F("VOX Control"));
  display.setCursor(25, 40);
  display.println(F("FunkPilot"));
  display.display();
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'vox_circuit.ino',

  wiring: [
    { from: 'Mikrofon OUT', to: 'Arduino A0', color: 'Blau' },
    { from: 'Lautsprecher (Anti-VOX)', to: 'Arduino A1', color: 'Grün', notes: 'über Teiler' },
    { from: 'Poti Empfindlichkeit', to: 'Arduino A2', color: 'Weiß' },
    { from: 'Poti Haltezeit', to: 'Arduino A3', color: 'Grau' },
    { from: 'Arduino D4', to: 'BC547 Basis', color: 'Orange', notes: 'über 1k' },
    { from: 'BC547 Kollektor', to: 'Relais -', color: 'Blau' },
    { from: 'BC547 Emitter', to: 'GND', color: 'Schwarz' },
    { from: 'Relais +', to: '5V', color: 'Rot' },
    { from: 'Relais COM + NO', to: 'PTT-Buchse', notes: 'zum TRX' },
    { from: 'Arduino D5', to: 'LED TX Anode', color: 'Rot', notes: 'über 220Ω' },
    { from: 'Arduino D6', to: 'LED RX Anode', color: 'Grün', notes: 'über 220Ω' },
    { from: 'Arduino D2', to: 'Taster PTT', color: 'Gelb', notes: 'nach GND' },
  ],

  customizationSuggestions: [
    'Mehrere Empfindlichkeits-Presets',
    'CAT-Steuerung für PTT statt Relais',
    'Foot-Switch Eingang zusätzlich',
    'Audio-Kompressor integrieren',
    'EEPROM-Speicherung der Einstellungen',
  ],

  externalLinks: [
    { title: 'VOX Schaltungstechnik', url: 'https://www.arrl.org/files/file/Technology/tis/info/pdf/9407041.pdf' },
  ],
};
