import type { HamProject } from '../../types/projects';

export const voxCircuit: HamProject = {
  id: 'vox-circuit',
  name: {
    de: 'VOX-Schaltung',
    en: 'VOX Circuit',
    sl: 'VOX vezje',
  },
  category: 'audio',
  difficulty: 1,
  description: {
    de: 'Sprachgesteuerte PTT-Schaltung (Voice Operated Switch). Einstellbare Empfindlichkeit und Haltezeit. Mit Anti-VOX für Lautsprecher-Betrieb.',
    en: 'Voice-operated PTT switch (Voice Operated Switch). Adjustable sensitivity and hold time. With Anti-VOX for speaker operation.',
    sl: 'Glasovno krmiljeno PTT stikalo (Voice Operated Switch). Nastavljiva občutljivost in zadrževalni čas. Z Anti-VOX za delovanje z zvočnikom.',
  },
  hardware: 'arduino-nano',

  components: [
    {
      name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' },
      quantity: 1,
    },
    {
      name: { de: 'Elektret-Mikrofon', en: 'Electret Microphone', sl: 'Elektretni mikrofon' },
      quantity: 1,
      notes: { de: 'mit Verstärkermodul', en: 'with amplifier module', sl: 'z ojačevalnim modulom' },
    },
    {
      name: { de: 'OLED Display 0.96"', en: 'OLED Display 0.96"', sl: 'OLED zaslon 0.96"' },
      quantity: 1,
      notes: { de: 'optional', en: 'optional', sl: 'opcijsko' },
    },
    {
      name: { de: 'Relais 5V', en: '5V Relay', sl: '5V rele' },
      quantity: 1,
      notes: { de: 'für PTT', en: 'for PTT', sl: 'za PTT' },
    },
    {
      name: { de: 'Potentiometer 10k', en: '10k Potentiometer', sl: '10k potenciometer' },
      quantity: 2,
      notes: { de: 'Empfindlichkeit + Haltezeit', en: 'Sensitivity + Hold time', sl: 'Občutljivost + Zadrževalni čas' },
    },
    {
      name: { de: 'LED rot', en: 'Red LED', sl: 'Rdeča LED' },
      quantity: 1,
      notes: { de: 'TX-Anzeige', en: 'TX indicator', sl: 'TX indikator' },
    },
    {
      name: { de: 'LED grün', en: 'Green LED', sl: 'Zelena LED' },
      quantity: 1,
      notes: { de: 'RX-Anzeige', en: 'RX indicator', sl: 'RX indikator' },
    },
    {
      name: { de: 'Widerstand 220 Ohm', en: '220 Ohm Resistor', sl: '220 Ohm upor' },
      quantity: 2,
    },
    {
      name: { de: 'Transistor BC547', en: 'BC547 Transistor', sl: 'Tranzistor BC547' },
      quantity: 1,
      notes: { de: 'Relais-Treiber', en: 'Relay driver', sl: 'Gonilnik releja' },
    },
    {
      name: { de: 'Diode 1N4001', en: '1N4001 Diode', sl: 'Dioda 1N4001' },
      quantity: 1,
      notes: { de: 'Freilaufdiode', en: 'Flyback diode', sl: 'Prostotočna dioda' },
    },
    {
      name: { de: 'Klinkenbuchse 3.5mm', en: '3.5mm Audio Jack', sl: '3.5mm avdio vtičnica' },
      quantity: 2,
      notes: { de: 'Mikrofon + PTT', en: 'Microphone + PTT', sl: 'Mikrofon + PTT' },
    },
  ],
  estimatedCost: '~12€',

  code: {
    de: `// =====================================================
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
    en: `// =====================================================
// VOX Circuit - FunkPilot DIY Project
// Hardware: Arduino Nano + Microphone + Relay
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// Voice-operated transmit/receive switching
// With Anti-VOX and adjustable parameters
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
const int MIC_PIN = A0;        // Microphone input
const int ANTI_VOX_PIN = A1;   // Anti-VOX input (speaker)
const int SENS_PIN = A2;       // Sensitivity potentiometer
const int DELAY_PIN = A3;      // Hold time potentiometer
const int PTT_PIN = 4;         // Relay output
const int LED_TX = 5;          // TX LED
const int LED_RX = 6;          // RX LED
const int BTN_MANUAL = 2;      // Manual PTT button

// Status
bool pttActive = false;
unsigned long lastVoice = 0;
unsigned long voxHoldTime = 500;  // Hold time in ms
int sensitivity = 100;             // Threshold

// Audio measurement
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
  digitalWrite(LED_RX, HIGH);  // RX active

  // Try to initialize OLED
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    hasDisplay = true;
    showWelcome();
    delay(1500);
  }

  Serial.println(F("VOX ready"));
}

void loop() {
  // Read settings
  readSettings();

  // Measure audio level
  measureAudio();

  // VOX logic
  processVOX();

  // Manual PTT
  if (!digitalRead(BTN_MANUAL)) {
    activatePTT();
    while(!digitalRead(BTN_MANUAL));
    // Normal hold time after manual PTT
  }

  // Update display (not too often)
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
  // Sensitivity: 20-300
  sensitivity = map(analogRead(SENS_PIN), 0, 1023, 20, 300);

  // Hold time: 100-2000 ms
  voxHoldTime = map(analogRead(DELAY_PIN), 0, 1023, 100, 2000);
}

void measureAudio() {
  int minMic = 1023, maxMic = 0;
  int minAnti = 1023, maxAnti = 0;

  // Fast peak-to-peak measurement
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

  // Peak for display
  if (micLevel > peakMic) {
    peakMic = micLevel;
  } else {
    peakMic = peakMic * 0.95;  // Slow decay
  }
}

void processVOX() {
  unsigned long now = millis();

  // Anti-VOX: If speaker active, don't transmit
  bool antiVoxBlock = (antiVoxLevel > sensitivity / 2);

  // Voice detected?
  bool voiceDetected = (micLevel > sensitivity) && !antiVoxBlock;

  if (voiceDetected) {
    lastVoice = now;
    if (!pttActive) {
      activatePTT();
    }
  }

  // Hold time expired?
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

  // Microphone level
  display.setCursor(0, 14);
  display.print(F("MIC: "));
  int barMic = map(constrain(peakMic, 0, 500), 0, 500, 0, 80);
  display.drawRect(30, 14, 82, 8, SSD1306_WHITE);
  display.fillRect(31, 15, barMic, 6, SSD1306_WHITE);

  // Threshold line
  int threshPos = map(sensitivity, 0, 500, 0, 80);
  display.drawLine(30 + threshPos, 12, 30 + threshPos, 24, SSD1306_WHITE);

  // Anti-VOX
  display.setCursor(0, 26);
  display.print(F("A-V: "));
  int barAnti = map(constrain(antiVoxLevel, 0, 300), 0, 300, 0, 80);
  display.drawRect(30, 26, 82, 8, SSD1306_WHITE);
  display.fillRect(31, 27, barAnti, 6, SSD1306_WHITE);

  // Settings
  display.setCursor(0, 40);
  display.print(F("Sens: "));
  display.print(sensitivity);

  display.setCursor(0, 50);
  display.print(F("Delay: "));
  display.print(voxHoldTime);
  display.print(F(" ms"));

  // TX/RX status large
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
    sl: `// =====================================================
// VOX vezje - FunkPilot DIY projekt
// Strojna oprema: Arduino Nano + Mikrofon + Rele
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Glasovno krmiljeno preklapljanje oddaja/sprejem
// Z Anti-VOX in nastavljivimi parametri
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED (opcijsko)
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
bool hasDisplay = false;

// Pini
const int MIC_PIN = A0;        // Vhod mikrofona
const int ANTI_VOX_PIN = A1;   // Anti-VOX vhod (zvočnik)
const int SENS_PIN = A2;       // Potenciometer občutljivosti
const int DELAY_PIN = A3;      // Potenciometer zadrževalnega časa
const int PTT_PIN = 4;         // Izhod releja
const int LED_TX = 5;          // TX LED
const int LED_RX = 6;          // RX LED
const int BTN_MANUAL = 2;      // Ročni PTT gumb

// Status
bool pttActive = false;
unsigned long lastVoice = 0;
unsigned long voxHoldTime = 500;  // Zadrževalni čas v ms
int sensitivity = 100;             // Prag

// Merjenje zvoka
int micLevel = 0;
int antiVoxLevel = 0;
int peakMic = 0;

// Časovnik
unsigned long lastUpdate = 0;

void setup() {
  Serial.begin(9600);

  pinMode(PTT_PIN, OUTPUT);
  pinMode(LED_TX, OUTPUT);
  pinMode(LED_RX, OUTPUT);
  pinMode(BTN_MANUAL, INPUT_PULLUP);

  digitalWrite(PTT_PIN, LOW);
  digitalWrite(LED_TX, LOW);
  digitalWrite(LED_RX, HIGH);  // RX aktiven

  // Poskusi inicializirati OLED
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    hasDisplay = true;
    showWelcome();
    delay(1500);
  }

  Serial.println(F("VOX pripravljen"));
}

void loop() {
  // Preberi nastavitve
  readSettings();

  // Izmeri nivo zvoka
  measureAudio();

  // VOX logika
  processVOX();

  // Ročni PTT
  if (!digitalRead(BTN_MANUAL)) {
    activatePTT();
    while(!digitalRead(BTN_MANUAL));
    // Normalen zadrževalni čas po ročnem PTT
  }

  // Posodobi zaslon (ne prepogosto)
  if (hasDisplay && millis() - lastUpdate > 100) {
    updateDisplay();
    lastUpdate = millis();
  }

  // Razhroščevanje
  Serial.print(F("Mic:"));
  Serial.print(micLevel);
  Serial.print(F(" Sens:"));
  Serial.print(sensitivity);
  Serial.print(F(" PTT:"));
  Serial.println(pttActive ? "TX" : "RX");

  delay(10);
}

void readSettings() {
  // Občutljivost: 20-300
  sensitivity = map(analogRead(SENS_PIN), 0, 1023, 20, 300);

  // Zadrževalni čas: 100-2000 ms
  voxHoldTime = map(analogRead(DELAY_PIN), 0, 1023, 100, 2000);
}

void measureAudio() {
  int minMic = 1023, maxMic = 0;
  int minAnti = 1023, maxAnti = 0;

  // Hitro merjenje od vrha do vrha
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

  // Vrh za prikaz
  if (micLevel > peakMic) {
    peakMic = micLevel;
  } else {
    peakMic = peakMic * 0.95;  // Počasen upad
  }
}

void processVOX() {
  unsigned long now = millis();

  // Anti-VOX: Če je zvočnik aktiven, ne oddajaj
  bool antiVoxBlock = (antiVoxLevel > sensitivity / 2);

  // Glas zaznan?
  bool voiceDetected = (micLevel > sensitivity) && !antiVoxBlock;

  if (voiceDetected) {
    lastVoice = now;
    if (!pttActive) {
      activatePTT();
    }
  }

  // Zadrževalni čas potekel?
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

  // Glava
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("VOX  "));
  display.print(pttActive ? F("[TX]") : F("[RX]"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Nivo mikrofona
  display.setCursor(0, 14);
  display.print(F("MIC: "));
  int barMic = map(constrain(peakMic, 0, 500), 0, 500, 0, 80);
  display.drawRect(30, 14, 82, 8, SSD1306_WHITE);
  display.fillRect(31, 15, barMic, 6, SSD1306_WHITE);

  // Črta praga
  int threshPos = map(sensitivity, 0, 500, 0, 80);
  display.drawLine(30 + threshPos, 12, 30 + threshPos, 24, SSD1306_WHITE);

  // Anti-VOX
  display.setCursor(0, 26);
  display.print(F("A-V: "));
  int barAnti = map(constrain(antiVoxLevel, 0, 300), 0, 300, 0, 80);
  display.drawRect(30, 26, 82, 8, SSD1306_WHITE);
  display.fillRect(31, 27, barAnti, 6, SSD1306_WHITE);

  // Nastavitve
  display.setCursor(0, 40);
  display.print(F("Sens: "));
  display.print(sensitivity);

  display.setCursor(0, 50);
  display.print(F("Delay: "));
  display.print(voxHoldTime);
  display.print(F(" ms"));

  // TX/RX status velik
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
  },
  codeLanguage: 'cpp',
  codeFileName: 'vox_circuit.ino',

  wiring: [
    {
      from: { de: 'Mikrofon OUT', en: 'Microphone OUT', sl: 'Mikrofon OUT' },
      to: { de: 'Arduino A0', en: 'Arduino A0', sl: 'Arduino A0' },
      color: 'Blau',
    },
    {
      from: { de: 'Lautsprecher (Anti-VOX)', en: 'Speaker (Anti-VOX)', sl: 'Zvočnik (Anti-VOX)' },
      to: { de: 'Arduino A1', en: 'Arduino A1', sl: 'Arduino A1' },
      color: 'Grün',
      notes: { de: 'über Teiler', en: 'via divider', sl: 'preko delilnika' },
    },
    {
      from: { de: 'Poti Empfindlichkeit', en: 'Sensitivity Pot', sl: 'Poti občutljivosti' },
      to: { de: 'Arduino A2', en: 'Arduino A2', sl: 'Arduino A2' },
      color: 'Weiß',
    },
    {
      from: { de: 'Poti Haltezeit', en: 'Hold Time Pot', sl: 'Poti zadrževalnega časa' },
      to: { de: 'Arduino A3', en: 'Arduino A3', sl: 'Arduino A3' },
      color: 'Grau',
    },
    {
      from: { de: 'Arduino D4', en: 'Arduino D4', sl: 'Arduino D4' },
      to: { de: 'BC547 Basis', en: 'BC547 Base', sl: 'BC547 baza' },
      color: 'Orange',
      notes: { de: 'über 1k', en: 'via 1k', sl: 'preko 1k' },
    },
    {
      from: { de: 'BC547 Kollektor', en: 'BC547 Collector', sl: 'BC547 kolektor' },
      to: { de: 'Relais -', en: 'Relay -', sl: 'Rele -' },
      color: 'Blau',
    },
    {
      from: { de: 'BC547 Emitter', en: 'BC547 Emitter', sl: 'BC547 emiter' },
      to: { de: 'GND', en: 'GND', sl: 'GND' },
      color: 'Schwarz',
    },
    {
      from: { de: 'Relais +', en: 'Relay +', sl: 'Rele +' },
      to: { de: '5V', en: '5V', sl: '5V' },
      color: 'Rot',
    },
    {
      from: { de: 'Relais COM + NO', en: 'Relay COM + NO', sl: 'Rele COM + NO' },
      to: { de: 'PTT-Buchse', en: 'PTT Jack', sl: 'PTT vtičnica' },
      notes: { de: 'zum TRX', en: 'to TRX', sl: 'do TRX' },
    },
    {
      from: { de: 'Arduino D5', en: 'Arduino D5', sl: 'Arduino D5' },
      to: { de: 'LED TX Anode', en: 'TX LED Anode', sl: 'TX LED anoda' },
      color: 'Rot',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' },
    },
    {
      from: { de: 'Arduino D6', en: 'Arduino D6', sl: 'Arduino D6' },
      to: { de: 'LED RX Anode', en: 'RX LED Anode', sl: 'RX LED anoda' },
      color: 'Grün',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' },
    },
    {
      from: { de: 'Arduino D2', en: 'Arduino D2', sl: 'Arduino D2' },
      to: { de: 'Taster PTT', en: 'PTT Button', sl: 'PTT tipka' },
      color: 'Gelb',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' },
    },
  ],

  customizationSuggestions: [
    {
      de: 'Mehrere Empfindlichkeits-Presets',
      en: 'Multiple sensitivity presets',
      sl: 'Več prednastavitev občutljivosti',
    },
    {
      de: 'CAT-Steuerung für PTT statt Relais',
      en: 'CAT control for PTT instead of relay',
      sl: 'CAT krmiljenje za PTT namesto releja',
    },
    {
      de: 'Foot-Switch Eingang zusätzlich',
      en: 'Additional foot switch input',
      sl: 'Dodatni vhod za nožno stikalo',
    },
    {
      de: 'Audio-Kompressor integrieren',
      en: 'Integrate audio compressor',
      sl: 'Integracija avdio kompresorja',
    },
    {
      de: 'EEPROM-Speicherung der Einstellungen',
      en: 'EEPROM storage of settings',
      sl: 'EEPROM shranjevanje nastavitev',
    },
  ],

  externalLinks: [
    {
      title: {
        de: 'VOX Schaltungstechnik',
        en: 'VOX Circuit Technology',
        sl: 'VOX tehnika vezij',
      },
      url: 'https://www.arrl.org/files/file/Technology/tis/info/pdf/9407041.pdf',
    },
  ],
};
