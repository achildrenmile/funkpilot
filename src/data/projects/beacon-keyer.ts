import type { HamProject } from '../../types/projects';

export const beaconKeyer: HamProject = {
  id: 'beacon-keyer',
  name: 'Baken-Keyer',
  category: 'cw-morse',
  difficulty: 1,
  description: 'Automatischer Baken-Keyer für CW-Baken oder Fuchsjagd-Sender. Sendet konfigurierbare Nachricht in einstellbaren Intervallen. Mit Locator und Leistungsangabe.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'Relais-Modul 5V', quantity: 1, notes: 'für PTT/KEY' },
    { name: 'Piezo Buzzer', quantity: 1, notes: 'Seitenton' },
    { name: 'LED rot', quantity: 1, notes: 'TX-Anzeige' },
    { name: 'Taster', quantity: 1, notes: 'Start/Stop' },
    { name: 'DIP-Schalter 4-fach', quantity: 1, notes: 'Intervall-Einstellung' },
    { name: 'Widerstand 220 Ohm', quantity: 1 },
    { name: 'Klinkenbuchse 3.5mm', quantity: 1, notes: 'KEY-Out' },
  ],
  estimatedCost: '~10€',

  code: `// =====================================================
// Baken-Keyer - FunkPilot Bastelprojekt
// Hardware: Arduino Nano + Relais
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Sendet automatisch eine Baken-Nachricht
// Perfekt für Fuchsjagd, Baken oder Tests
//
// =====================================================

// ===== KONFIGURATION =====
// HIER ANPASSEN:
const char* CALLSIGN = "OE8YML/B";     // Rufzeichen der Bake
const char* LOCATOR = "JN66XT";         // Maidenhead Locator
const char* POWER = "1W";               // Sendeleistung
const int DEFAULT_WPM = 12;             // Geschwindigkeit

// Optionale Zusatznachricht (z.B. für Fuchsjagd)
const char* EXTRA_MSG = "";             // z.B. "MOE" für Fuchs 1
// =========================

// Pins
const int KEY_PIN = 4;       // Relais für KEY
const int BUZZER_PIN = 5;    // Seitenton
const int LED_PIN = 6;       // TX-LED
const int BTN_PIN = 2;       // Start/Stop
const int DIP1 = 7;          // Intervall Bit 0
const int DIP2 = 8;          // Intervall Bit 1
const int DIP3 = 9;          // Intervall Bit 2
const int DIP4 = 10;         // Intervall Bit 3

// Timing
int wpm = DEFAULT_WPM;
int ditLength;
int sidetoneFreq = 600;

// Intervalle in Sekunden (via DIP-Schalter)
const int intervals[] = {30, 60, 90, 120, 180, 240, 300, 600, 900, 1200, 1800, 3600};

// Status
bool beaconActive = false;
unsigned long lastBeacon = 0;

// Morse-Codes für alle Zeichen
const char* getMorse(char c) {
  switch(toupper(c)) {
    case 'A': return ".-";
    case 'B': return "-...";
    case 'C': return "-.-.";
    case 'D': return "-..";
    case 'E': return ".";
    case 'F': return "..-.";
    case 'G': return "--.";
    case 'H': return "....";
    case 'I': return "..";
    case 'J': return ".---";
    case 'K': return "-.-";
    case 'L': return ".-..";
    case 'M': return "--";
    case 'N': return "-.";
    case 'O': return "---";
    case 'P': return ".--.";
    case 'Q': return "--.-";
    case 'R': return ".-.";
    case 'S': return "...";
    case 'T': return "-";
    case 'U': return "..-";
    case 'V': return "...-";
    case 'W': return ".--";
    case 'X': return "-..-";
    case 'Y': return "-.--";
    case 'Z': return "--..";
    case '0': return "-----";
    case '1': return ".----";
    case '2': return "..---";
    case '3': return "...--";
    case '4': return "....-";
    case '5': return ".....";
    case '6': return "-....";
    case '7': return "--...";
    case '8': return "---..";
    case '9': return "----.";
    case '/': return "-..-.";
    case ' ': return " ";
    default: return "";
  }
}

void setup() {
  Serial.begin(9600);

  pinMode(KEY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);
  pinMode(DIP1, INPUT_PULLUP);
  pinMode(DIP2, INPUT_PULLUP);
  pinMode(DIP3, INPUT_PULLUP);
  pinMode(DIP4, INPUT_PULLUP);

  digitalWrite(KEY_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  ditLength = 1200 / wpm;

  Serial.println(F("Baken-Keyer gestartet"));
  Serial.print(F("Rufzeichen: "));
  Serial.println(CALLSIGN);
  Serial.print(F("Locator: "));
  Serial.println(LOCATOR);

  // Startmelodie
  playStartup();
}

void loop() {
  // Start/Stop Taster
  if (!digitalRead(BTN_PIN)) {
    delay(50);
    while(!digitalRead(BTN_PIN));
    beaconActive = !beaconActive;

    if (beaconActive) {
      Serial.println(F("Bake AKTIVIERT"));
      digitalWrite(LED_PIN, HIGH);
      delay(200);
      digitalWrite(LED_PIN, LOW);
      // Sofort erste Aussendung
      sendBeacon();
      lastBeacon = millis();
    } else {
      Serial.println(F("Bake DEAKTIVIERT"));
      // 3x blinken
      for (int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(100);
        digitalWrite(LED_PIN, LOW);
        delay(100);
      }
    }
    delay(300);
  }

  // Intervall prüfen
  if (beaconActive) {
    int intervalIndex = readDipSwitch();
    unsigned long interval = (unsigned long)intervals[intervalIndex] * 1000UL;

    if (millis() - lastBeacon >= interval) {
      sendBeacon();
      lastBeacon = millis();
    }
  }
}

int readDipSwitch() {
  int value = 0;
  if (!digitalRead(DIP1)) value |= 1;
  if (!digitalRead(DIP2)) value |= 2;
  if (!digitalRead(DIP3)) value |= 4;
  if (!digitalRead(DIP4)) value |= 8;
  return min(value, 11);  // Max 11 (Index für 3600s)
}

void sendBeacon() {
  Serial.println(F("--- Sende Bake ---"));

  // Baken-Nachricht aufbauen
  // Format: VVV VVV VVV DE CALL CALL LOCATOR PWR
  String msg = "VVV VVV VVV DE ";
  msg += CALLSIGN;
  msg += " ";
  msg += CALLSIGN;
  msg += " ";
  msg += LOCATOR;
  msg += " ";
  msg += POWER;

  if (strlen(EXTRA_MSG) > 0) {
    msg += " ";
    msg += EXTRA_MSG;
  }

  msg += " K";

  Serial.println(msg);
  sendMorse(msg);

  Serial.println(F("--- Bake beendet ---"));
}

void sendMorse(String text) {
  for (int i = 0; i < text.length(); i++) {
    char c = text[i];

    if (c == ' ') {
      delay(ditLength * 4);  // Wortpause (7-3=4 zusätzlich)
      continue;
    }

    const char* morse = getMorse(c);
    for (int j = 0; morse[j] != '\\0'; j++) {
      if (morse[j] == '.') {
        keyDown();
        delay(ditLength);
        keyUp();
      } else if (morse[j] == '-') {
        keyDown();
        delay(ditLength * 3);
        keyUp();
      }
      delay(ditLength);  // Element-Pause
    }
    delay(ditLength * 2);  // Buchstaben-Pause (3-1=2 zusätzlich)
  }
}

void keyDown() {
  digitalWrite(KEY_PIN, HIGH);
  digitalWrite(LED_PIN, HIGH);
  tone(BUZZER_PIN, sidetoneFreq);
}

void keyUp() {
  digitalWrite(KEY_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  noTone(BUZZER_PIN);
}

void playStartup() {
  // "R" für Ready
  tone(BUZZER_PIN, sidetoneFreq);
  delay(100);
  noTone(BUZZER_PIN);
  delay(100);
  tone(BUZZER_PIN, sidetoneFreq);
  delay(300);
  noTone(BUZZER_PIN);
  delay(100);
  tone(BUZZER_PIN, sidetoneFreq);
  delay(100);
  noTone(BUZZER_PIN);
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'beacon_keyer.ino',

  wiring: [
    { from: 'Arduino D2', to: 'Taster Start/Stop', color: 'Gelb', notes: 'nach GND' },
    { from: 'Arduino D4', to: 'Relais IN', color: 'Blau', notes: 'KEY-Ausgang' },
    { from: 'Arduino D5', to: 'Buzzer +', color: 'Orange' },
    { from: 'Arduino D6', to: 'LED Anode', color: 'Grün', notes: 'über 220Ω' },
    { from: 'Arduino D7-D10', to: 'DIP-Schalter 1-4', color: 'Weiß', notes: 'nach GND' },
    { from: 'Relais COM', to: 'KEY-Buchse Tip', notes: 'zum TRX' },
    { from: 'Relais NO', to: 'KEY-Buchse Sleeve', notes: 'GND' },
    { from: 'Arduino 5V', to: 'Relais VCC', color: 'Rot' },
    { from: 'Arduino GND', to: 'Alle GND', color: 'Schwarz' },
  ],

  customizationSuggestions: [
    'GPS-Modul für automatischen Locator',
    'Mehrere Nachrichten speicherbar (EEPROM)',
    'WSPR-Mode Unterstützung',
    'Temperatursensor für Telemetrie',
    'Solarbetrieb mit Tiefentladeschutz',
  ],

  externalLinks: [
    { title: 'Fuchsjagd Regeln', url: 'https://www.darc.de/der-club/referate/ardf/' },
  ],
};
