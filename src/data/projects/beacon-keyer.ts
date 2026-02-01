import type { HamProject } from '../../types/projects';

export const beaconKeyer: HamProject = {
  id: 'beacon-keyer',
  name: {
    de: 'Baken-Keyer',
    en: 'Beacon Keyer',
    sl: 'Svetilnik Keyer'
  },
  category: 'cw-morse',
  difficulty: 1,
  description: {
    de: 'Automatischer Baken-Keyer für CW-Baken oder Fuchsjagd-Sender. Sendet konfigurierbare Nachricht in einstellbaren Intervallen. Mit Locator und Leistungsangabe.',
    en: 'Automatic beacon keyer for CW beacons or fox hunting transmitters. Sends configurable messages at adjustable intervals. Includes locator and power indication.',
    sl: 'Avtomatski svetilnik keyer za CW svetilnike ali oddajnike za lov na lisico. Pošilja nastavljiva sporočila v nastavljivih intervalih. Vključuje lokator in oznako moči.'
  },
  hardware: 'arduino-nano',

  components: [
    {
      name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' },
      quantity: 1
    },
    {
      name: { de: 'Relais-Modul 5V', en: '5V Relay Module', sl: '5V relejni modul' },
      quantity: 1,
      notes: { de: 'für PTT/KEY', en: 'for PTT/KEY', sl: 'za PTT/KEY' }
    },
    {
      name: { de: 'Piezo Buzzer', en: 'Piezo Buzzer', sl: 'Piezo brenčalo' },
      quantity: 1,
      notes: { de: 'Seitenton', en: 'Sidetone', sl: 'Stranski ton' }
    },
    {
      name: { de: 'LED rot', en: 'Red LED', sl: 'Rdeča LED' },
      quantity: 1,
      notes: { de: 'TX-Anzeige', en: 'TX indicator', sl: 'TX indikator' }
    },
    {
      name: { de: 'Taster', en: 'Push Button', sl: 'Tipka' },
      quantity: 1,
      notes: { de: 'Start/Stop', en: 'Start/Stop', sl: 'Start/Stop' }
    },
    {
      name: { de: 'DIP-Schalter 4-fach', en: '4-way DIP Switch', sl: '4-kanalno DIP stikalo' },
      quantity: 1,
      notes: { de: 'Intervall-Einstellung', en: 'Interval setting', sl: 'Nastavitev intervala' }
    },
    {
      name: { de: 'Widerstand 220 Ohm', en: '220 Ohm Resistor', sl: '220 Ohm upor' },
      quantity: 1
    },
    {
      name: { de: 'Klinkenbuchse 3.5mm', en: '3.5mm Jack Socket', sl: '3.5mm jack vtičnica' },
      quantity: 1,
      notes: { de: 'KEY-Out', en: 'KEY-Out', sl: 'KEY-Out' }
    },
  ],
  estimatedCost: '~10€',

  code: {
    de: `// =====================================================
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
    en: `// =====================================================
// Beacon Keyer - FunkPilot DIY Project
// Hardware: Arduino Nano + Relay
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// Automatically sends a beacon message
// Perfect for fox hunting, beacons or tests
//
// =====================================================

// ===== CONFIGURATION =====
// ADJUST HERE:
const char* CALLSIGN = "OE8YML/B";     // Beacon callsign
const char* LOCATOR = "JN66XT";         // Maidenhead Locator
const char* POWER = "1W";               // Transmit power
const int DEFAULT_WPM = 12;             // Speed

// Optional additional message (e.g. for fox hunting)
const char* EXTRA_MSG = "";             // e.g. "MOE" for fox 1
// =========================

// Pins
const int KEY_PIN = 4;       // Relay for KEY
const int BUZZER_PIN = 5;    // Sidetone
const int LED_PIN = 6;       // TX LED
const int BTN_PIN = 2;       // Start/Stop
const int DIP1 = 7;          // Interval bit 0
const int DIP2 = 8;          // Interval bit 1
const int DIP3 = 9;          // Interval bit 2
const int DIP4 = 10;         // Interval bit 3

// Timing
int wpm = DEFAULT_WPM;
int ditLength;
int sidetoneFreq = 600;

// Intervals in seconds (via DIP switch)
const int intervals[] = {30, 60, 90, 120, 180, 240, 300, 600, 900, 1200, 1800, 3600};

// Status
bool beaconActive = false;
unsigned long lastBeacon = 0;

// Morse codes for all characters
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

  Serial.println(F("Beacon Keyer started"));
  Serial.print(F("Callsign: "));
  Serial.println(CALLSIGN);
  Serial.print(F("Locator: "));
  Serial.println(LOCATOR);

  // Startup melody
  playStartup();
}

void loop() {
  // Start/Stop button
  if (!digitalRead(BTN_PIN)) {
    delay(50);
    while(!digitalRead(BTN_PIN));
    beaconActive = !beaconActive;

    if (beaconActive) {
      Serial.println(F("Beacon ACTIVATED"));
      digitalWrite(LED_PIN, HIGH);
      delay(200);
      digitalWrite(LED_PIN, LOW);
      // Immediate first transmission
      sendBeacon();
      lastBeacon = millis();
    } else {
      Serial.println(F("Beacon DEACTIVATED"));
      // Blink 3 times
      for (int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(100);
        digitalWrite(LED_PIN, LOW);
        delay(100);
      }
    }
    delay(300);
  }

  // Check interval
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
  return min(value, 11);  // Max 11 (index for 3600s)
}

void sendBeacon() {
  Serial.println(F("--- Sending Beacon ---"));

  // Build beacon message
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

  Serial.println(F("--- Beacon finished ---"));
}

void sendMorse(String text) {
  for (int i = 0; i < text.length(); i++) {
    char c = text[i];

    if (c == ' ') {
      delay(ditLength * 4);  // Word pause (7-3=4 additional)
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
      delay(ditLength);  // Element pause
    }
    delay(ditLength * 2);  // Letter pause (3-1=2 additional)
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
  // "R" for Ready
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
    sl: `// =====================================================
// Svetilnik Keyer - FunkPilot DIY projekt
// Strojna oprema: Arduino Nano + Rele
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Samodejno pošilja sporočilo svetilnika
// Odlično za lov na lisico, svetilnike ali teste
//
// =====================================================

// ===== KONFIGURACIJA =====
// PRILAGODI TUKAJ:
const char* CALLSIGN = "OE8YML/B";     // Klicni znak svetilnika
const char* LOCATOR = "JN66XT";         // Maidenhead Lokator
const char* POWER = "1W";               // Oddajna moč
const int DEFAULT_WPM = 12;             // Hitrost

// Neobvezno dodatno sporočilo (npr. za lov na lisico)
const char* EXTRA_MSG = "";             // npr. "MOE" za lisico 1
// =========================

// Pini
const int KEY_PIN = 4;       // Rele za KEY
const int BUZZER_PIN = 5;    // Stranski ton
const int LED_PIN = 6;       // TX LED
const int BTN_PIN = 2;       // Start/Stop
const int DIP1 = 7;          // Interval bit 0
const int DIP2 = 8;          // Interval bit 1
const int DIP3 = 9;          // Interval bit 2
const int DIP4 = 10;         // Interval bit 3

// Casovanje
int wpm = DEFAULT_WPM;
int ditLength;
int sidetoneFreq = 600;

// Intervali v sekundah (preko DIP stikala)
const int intervals[] = {30, 60, 90, 120, 180, 240, 300, 600, 900, 1200, 1800, 3600};

// Status
bool beaconActive = false;
unsigned long lastBeacon = 0;

// Morsejeve kode za vse znake
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

  Serial.println(F("Svetilnik Keyer zagnan"));
  Serial.print(F("Klicni znak: "));
  Serial.println(CALLSIGN);
  Serial.print(F("Lokator: "));
  Serial.println(LOCATOR);

  // Zagonska melodija
  playStartup();
}

void loop() {
  // Start/Stop tipka
  if (!digitalRead(BTN_PIN)) {
    delay(50);
    while(!digitalRead(BTN_PIN));
    beaconActive = !beaconActive;

    if (beaconActive) {
      Serial.println(F("Svetilnik AKTIVIRAN"));
      digitalWrite(LED_PIN, HIGH);
      delay(200);
      digitalWrite(LED_PIN, LOW);
      // Takojsnje prvo oddajanje
      sendBeacon();
      lastBeacon = millis();
    } else {
      Serial.println(F("Svetilnik DEAKTIVIRAN"));
      // 3x utripanje
      for (int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(100);
        digitalWrite(LED_PIN, LOW);
        delay(100);
      }
    }
    delay(300);
  }

  // Preveri interval
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
  return min(value, 11);  // Max 11 (indeks za 3600s)
}

void sendBeacon() {
  Serial.println(F("--- Posiljam svetilnik ---"));

  // Sestavi sporocilo svetilnika
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

  Serial.println(F("--- Svetilnik zakljucen ---"));
}

void sendMorse(String text) {
  for (int i = 0; i < text.length(); i++) {
    char c = text[i];

    if (c == ' ') {
      delay(ditLength * 4);  // Premor besede (7-3=4 dodatno)
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
      delay(ditLength);  // Premor elementa
    }
    delay(ditLength * 2);  // Premor crke (3-1=2 dodatno)
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
  // "R" za Pripravljeno
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
`
  },
  codeLanguage: 'cpp',
  codeFileName: 'beacon_keyer.ino',

  wiring: [
    {
      from: { de: 'Arduino D2', en: 'Arduino D2', sl: 'Arduino D2' },
      to: { de: 'Taster Start/Stop', en: 'Start/Stop Button', sl: 'Tipka Start/Stop' },
      color: 'Gelb',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' }
    },
    {
      from: { de: 'Arduino D4', en: 'Arduino D4', sl: 'Arduino D4' },
      to: { de: 'Relais IN', en: 'Relay IN', sl: 'Rele IN' },
      color: 'Blau',
      notes: { de: 'KEY-Ausgang', en: 'KEY output', sl: 'KEY izhod' }
    },
    {
      from: { de: 'Arduino D5', en: 'Arduino D5', sl: 'Arduino D5' },
      to: { de: 'Buzzer +', en: 'Buzzer +', sl: 'Brenčalo +' },
      color: 'Orange'
    },
    {
      from: { de: 'Arduino D6', en: 'Arduino D6', sl: 'Arduino D6' },
      to: { de: 'LED Anode', en: 'LED Anode', sl: 'LED Anoda' },
      color: 'Grün',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' }
    },
    {
      from: { de: 'Arduino D7-D10', en: 'Arduino D7-D10', sl: 'Arduino D7-D10' },
      to: { de: 'DIP-Schalter 1-4', en: 'DIP Switch 1-4', sl: 'DIP stikalo 1-4' },
      color: 'Weiß',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' }
    },
    {
      from: { de: 'Relais COM', en: 'Relay COM', sl: 'Rele COM' },
      to: { de: 'KEY-Buchse Tip', en: 'KEY Jack Tip', sl: 'KEY vtičnica Tip' },
      notes: { de: 'zum TRX', en: 'to TRX', sl: 'do TRX' }
    },
    {
      from: { de: 'Relais NO', en: 'Relay NO', sl: 'Rele NO' },
      to: { de: 'KEY-Buchse Sleeve', en: 'KEY Jack Sleeve', sl: 'KEY vtičnica Sleeve' },
      notes: { de: 'GND', en: 'GND', sl: 'GND' }
    },
    {
      from: { de: 'Arduino 5V', en: 'Arduino 5V', sl: 'Arduino 5V' },
      to: { de: 'Relais VCC', en: 'Relay VCC', sl: 'Rele VCC' },
      color: 'Rot'
    },
    {
      from: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' },
      to: { de: 'Alle GND', en: 'All GND', sl: 'Vsi GND' },
      color: 'Schwarz'
    },
  ],

  customizationSuggestions: [
    {
      de: 'GPS-Modul für automatischen Locator',
      en: 'GPS module for automatic locator',
      sl: 'GPS modul za avtomatski lokator'
    },
    {
      de: 'Mehrere Nachrichten speicherbar (EEPROM)',
      en: 'Multiple messages storable (EEPROM)',
      sl: 'Več sporočil shranjenih (EEPROM)'
    },
    {
      de: 'WSPR-Mode Unterstützung',
      en: 'WSPR mode support',
      sl: 'Podpora za WSPR način'
    },
    {
      de: 'Temperatursensor für Telemetrie',
      en: 'Temperature sensor for telemetry',
      sl: 'Temperaturni senzor za telemetrijo'
    },
    {
      de: 'Solarbetrieb mit Tiefentladeschutz',
      en: 'Solar operation with deep discharge protection',
      sl: 'Solarno delovanje z zaščito pred globokim praznjenjem'
    },
  ],

  externalLinks: [
    {
      title: {
        de: 'Fuchsjagd Regeln',
        en: 'Fox Hunting Rules',
        sl: 'Pravila lova na lisico'
      },
      url: 'https://www.darc.de/der-club/referate/ardf/'
    },
  ],
};
