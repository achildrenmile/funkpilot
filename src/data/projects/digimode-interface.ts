import type { HamProject } from '../../types/projects';

export const digimodeInterface: HamProject = {
  id: 'digimode-interface',
  name: {
    de: 'RTTY/PSK Interface',
    en: 'RTTY/PSK Interface',
    sl: 'RTTY/PSK vmesnik'
  },
  category: 'digital-aprs',
  difficulty: 2,
  description: {
    de: 'USB-Audio-Interface für Digimodes wie RTTY, PSK31, SSTV. Galvanische Trennung durch Übertrager. VOX oder CAT-PTT. Plug-and-Play mit WSJT-X, fldigi etc.',
    en: 'USB audio interface for digital modes like RTTY, PSK31, SSTV. Galvanic isolation via transformers. VOX or CAT-PTT. Plug-and-play with WSJT-X, fldigi etc.',
    sl: 'USB avdio vmesnik za digitalne načine kot RTTY, PSK31, SSTV. Galvanska izolacija preko transformatorjev. VOX ali CAT-PTT. Plug-and-play z WSJT-X, fldigi itd.'
  },
  hardware: 'arduino-nano',

  components: [
    {
      name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' },
      quantity: 1,
      notes: { de: 'nur für PTT-Steuerung', en: 'only for PTT control', sl: 'samo za PTT krmiljenje' }
    },
    {
      name: { de: 'USB-Soundkarte', en: 'USB Sound Card', sl: 'USB zvočna kartica' },
      quantity: 1,
      notes: { de: 'günstige China-Karte reicht', en: 'cheap Chinese card is sufficient', sl: 'poceni kitajska kartica zadostuje' }
    },
    {
      name: { de: 'Audio-Übertrager 600:600', en: 'Audio Transformer 600:600', sl: 'Avdio transformator 600:600' },
      quantity: 2,
      notes: { de: 'galvanische Trennung', en: 'galvanic isolation', sl: 'galvanska izolacija' }
    },
    {
      name: { de: 'Optokoppler PC817', en: 'Optocoupler PC817', sl: 'Optični sklopnik PC817' },
      quantity: 1,
      notes: { de: 'PTT Isolation', en: 'PTT isolation', sl: 'PTT izolacija' }
    },
    {
      name: { de: 'Potentiometer 10k', en: 'Potentiometer 10k', sl: 'Potenciometer 10k' },
      quantity: 2,
      notes: { de: 'TX/RX Pegel', en: 'TX/RX level', sl: 'TX/RX nivo' }
    },
    {
      name: { de: 'Kondensator 100nF', en: 'Capacitor 100nF', sl: 'Kondenzator 100nF' },
      quantity: 4
    },
    {
      name: { de: 'Widerstand div.', en: 'Resistors misc.', sl: 'Upori razni' },
      quantity: 1,
      notes: { de: '1k, 10k Set', en: '1k, 10k set', sl: '1k, 10k komplet' }
    },
    {
      name: { de: 'Klinkenbuchsen 3.5mm', en: '3.5mm Jack Sockets', sl: '3.5mm jack vtičnice' },
      quantity: 3,
      notes: { de: 'Mic, Speaker, PTT', en: 'Mic, Speaker, PTT', sl: 'Mikrofon, zvočnik, PTT' }
    },
    {
      name: { de: 'USB-B Buchse', en: 'USB-B Socket', sl: 'USB-B vtičnica' },
      quantity: 1,
      notes: { de: 'für Soundkarte', en: 'for sound card', sl: 'za zvočno kartico' }
    },
    {
      name: { de: 'LED rot', en: 'Red LED', sl: 'Rdeča LED' },
      quantity: 1,
      notes: { de: 'PTT-Anzeige', en: 'PTT indicator', sl: 'PTT indikator' }
    },
  ],
  estimatedCost: '~20€',

  code: {
    de: `// =====================================================
// Digimode Interface PTT Controller - FunkPilot
// Hardware: Arduino Nano
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Steuert PTT für Digimode-Software
// Empfängt Befehle über USB-Serial (CAT-ähnlich)
// VOX-Option als Fallback
//
// =====================================================

// Pins
const int PTT_OUT = 4;         // PTT zu Optokoppler
const int LED_PTT = 5;         // PTT-Anzeige
const int VOX_IN = A0;         // VOX Audio-Eingang
const int VOX_ENABLE = 2;      // VOX aktivieren (Jumper/Schalter)

// VOX Parameter
const int VOX_THRESHOLD = 100;
const int VOX_HOLD_TIME = 300;  // ms

// Status
bool pttActive = false;
unsigned long lastVoxSignal = 0;
bool voxEnabled = false;

// Serial Buffer
String serialBuffer = "";

void setup() {
  Serial.begin(9600);  // Kann auch 19200 oder 38400 sein

  pinMode(PTT_OUT, OUTPUT);
  pinMode(LED_PTT, OUTPUT);
  pinMode(VOX_ENABLE, INPUT_PULLUP);

  digitalWrite(PTT_OUT, LOW);
  digitalWrite(LED_PTT, LOW);

  Serial.println(F("Digimode Interface v1.0"));
  Serial.println(F("Befehle: PTT ON, PTT OFF, STATUS"));
}

void loop() {
  // VOX-Modus prüfen
  voxEnabled = !digitalRead(VOX_ENABLE);

  // Serial-Befehle verarbeiten
  processSerial();

  // VOX wenn aktiviert
  if (voxEnabled) {
    processVOX();
  }

  // PTT-Timeout (Sicherheit)
  static unsigned long pttStartTime = 0;
  if (pttActive) {
    if (pttStartTime == 0) pttStartTime = millis();
    // Timeout nach 3 Minuten
    if (millis() - pttStartTime > 180000UL) {
      setPTT(false);
      Serial.println(F("PTT TIMEOUT!"));
    }
  } else {
    pttStartTime = 0;
  }

  delay(10);
}

void processSerial() {
  while (Serial.available()) {
    char c = Serial.read();

    if (c == '\\n' || c == '\\r') {
      if (serialBuffer.length() > 0) {
        handleCommand(serialBuffer);
        serialBuffer = "";
      }
    } else {
      serialBuffer += c;
      if (serialBuffer.length() > 50) {
        serialBuffer = "";  // Buffer überlauf verhindern
      }
    }
  }
}

void handleCommand(String cmd) {
  cmd.toUpperCase();
  cmd.trim();

  Serial.print(F("CMD: "));
  Serial.println(cmd);

  if (cmd == "PTT ON" || cmd == "TX" || cmd == "1") {
    setPTT(true);
    Serial.println(F("OK PTT ON"));
  }
  else if (cmd == "PTT OFF" || cmd == "RX" || cmd == "0") {
    setPTT(false);
    Serial.println(F("OK PTT OFF"));
  }
  else if (cmd == "STATUS" || cmd == "?") {
    Serial.print(F("PTT: "));
    Serial.println(pttActive ? F("ON") : F("OFF"));
    Serial.print(F("VOX: "));
    Serial.println(voxEnabled ? F("ENABLED") : F("DISABLED"));
  }
  else if (cmd == "VOX ON") {
    // Software VOX override
    voxEnabled = true;
    Serial.println(F("VOX ENABLED"));
  }
  else if (cmd == "VOX OFF") {
    voxEnabled = false;
    Serial.println(F("VOX DISABLED"));
  }
  else if (cmd.startsWith("CAT") || cmd.startsWith("FA") || cmd.startsWith("FB")) {
    // Dummy-Antworten für CAT-Polling (manche Programme senden das)
    Serial.println(F("OK"));
  }
  else {
    Serial.println(F("ERROR Unknown command"));
  }
}

void processVOX() {
  // Audio-Pegel messen
  int level = 0;
  for (int i = 0; i < 20; i++) {
    int sample = abs(analogRead(VOX_IN) - 512);
    if (sample > level) level = sample;
    delayMicroseconds(50);
  }

  if (level > VOX_THRESHOLD) {
    lastVoxSignal = millis();
    if (!pttActive) {
      setPTT(true);
      Serial.println(F("VOX TX"));
    }
  }

  // Hold-Time
  if (pttActive && (millis() - lastVoxSignal > VOX_HOLD_TIME)) {
    setPTT(false);
    Serial.println(F("VOX RX"));
  }
}

void setPTT(bool active) {
  pttActive = active;
  digitalWrite(PTT_OUT, active ? HIGH : LOW);
  digitalWrite(LED_PTT, active ? HIGH : LOW);
}

// Hamlib/rigctl Kompatibilität
// Manche Programme erwarten bestimmte Antworten
void sendRigResponse(String cmd) {
  if (cmd == "\\\\get_ptt" || cmd == "t") {
    Serial.println(pttActive ? "1" : "0");
  }
  else if (cmd.startsWith("\\\\set_ptt") || cmd.startsWith("T")) {
    if (cmd.indexOf("1") >= 0) {
      setPTT(true);
    } else {
      setPTT(false);
    }
    Serial.println("RPRT 0");
  }
}
`,
    en: `// =====================================================
// Digimode Interface PTT Controller - FunkPilot
// Hardware: Arduino Nano
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// Controls PTT for digimode software
// Receives commands via USB-Serial (CAT-like)
// VOX option as fallback
//
// =====================================================

// Pins
const int PTT_OUT = 4;         // PTT to optocoupler
const int LED_PTT = 5;         // PTT indicator
const int VOX_IN = A0;         // VOX audio input
const int VOX_ENABLE = 2;      // Enable VOX (jumper/switch)

// VOX parameters
const int VOX_THRESHOLD = 100;
const int VOX_HOLD_TIME = 300;  // ms

// Status
bool pttActive = false;
unsigned long lastVoxSignal = 0;
bool voxEnabled = false;

// Serial buffer
String serialBuffer = "";

void setup() {
  Serial.begin(9600);  // Can also be 19200 or 38400

  pinMode(PTT_OUT, OUTPUT);
  pinMode(LED_PTT, OUTPUT);
  pinMode(VOX_ENABLE, INPUT_PULLUP);

  digitalWrite(PTT_OUT, LOW);
  digitalWrite(LED_PTT, LOW);

  Serial.println(F("Digimode Interface v1.0"));
  Serial.println(F("Commands: PTT ON, PTT OFF, STATUS"));
}

void loop() {
  // Check VOX mode
  voxEnabled = !digitalRead(VOX_ENABLE);

  // Process serial commands
  processSerial();

  // VOX if enabled
  if (voxEnabled) {
    processVOX();
  }

  // PTT timeout (safety)
  static unsigned long pttStartTime = 0;
  if (pttActive) {
    if (pttStartTime == 0) pttStartTime = millis();
    // Timeout after 3 minutes
    if (millis() - pttStartTime > 180000UL) {
      setPTT(false);
      Serial.println(F("PTT TIMEOUT!"));
    }
  } else {
    pttStartTime = 0;
  }

  delay(10);
}

void processSerial() {
  while (Serial.available()) {
    char c = Serial.read();

    if (c == '\\n' || c == '\\r') {
      if (serialBuffer.length() > 0) {
        handleCommand(serialBuffer);
        serialBuffer = "";
      }
    } else {
      serialBuffer += c;
      if (serialBuffer.length() > 50) {
        serialBuffer = "";  // Prevent buffer overflow
      }
    }
  }
}

void handleCommand(String cmd) {
  cmd.toUpperCase();
  cmd.trim();

  Serial.print(F("CMD: "));
  Serial.println(cmd);

  if (cmd == "PTT ON" || cmd == "TX" || cmd == "1") {
    setPTT(true);
    Serial.println(F("OK PTT ON"));
  }
  else if (cmd == "PTT OFF" || cmd == "RX" || cmd == "0") {
    setPTT(false);
    Serial.println(F("OK PTT OFF"));
  }
  else if (cmd == "STATUS" || cmd == "?") {
    Serial.print(F("PTT: "));
    Serial.println(pttActive ? F("ON") : F("OFF"));
    Serial.print(F("VOX: "));
    Serial.println(voxEnabled ? F("ENABLED") : F("DISABLED"));
  }
  else if (cmd == "VOX ON") {
    // Software VOX override
    voxEnabled = true;
    Serial.println(F("VOX ENABLED"));
  }
  else if (cmd == "VOX OFF") {
    voxEnabled = false;
    Serial.println(F("VOX DISABLED"));
  }
  else if (cmd.startsWith("CAT") || cmd.startsWith("FA") || cmd.startsWith("FB")) {
    // Dummy responses for CAT polling (some programs send this)
    Serial.println(F("OK"));
  }
  else {
    Serial.println(F("ERROR Unknown command"));
  }
}

void processVOX() {
  // Measure audio level
  int level = 0;
  for (int i = 0; i < 20; i++) {
    int sample = abs(analogRead(VOX_IN) - 512);
    if (sample > level) level = sample;
    delayMicroseconds(50);
  }

  if (level > VOX_THRESHOLD) {
    lastVoxSignal = millis();
    if (!pttActive) {
      setPTT(true);
      Serial.println(F("VOX TX"));
    }
  }

  // Hold time
  if (pttActive && (millis() - lastVoxSignal > VOX_HOLD_TIME)) {
    setPTT(false);
    Serial.println(F("VOX RX"));
  }
}

void setPTT(bool active) {
  pttActive = active;
  digitalWrite(PTT_OUT, active ? HIGH : LOW);
  digitalWrite(LED_PTT, active ? HIGH : LOW);
}

// Hamlib/rigctl compatibility
// Some programs expect specific responses
void sendRigResponse(String cmd) {
  if (cmd == "\\\\get_ptt" || cmd == "t") {
    Serial.println(pttActive ? "1" : "0");
  }
  else if (cmd.startsWith("\\\\set_ptt") || cmd.startsWith("T")) {
    if (cmd.indexOf("1") >= 0) {
      setPTT(true);
    } else {
      setPTT(false);
    }
    Serial.println("RPRT 0");
  }
}
`,
    sl: `// =====================================================
// Digimode Interface PTT krmilnik - FunkPilot
// Strojna oprema: Arduino Nano
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Krmili PTT za digimode programsko opremo
// Prejema ukaze preko USB-Serial (podobno CAT)
// VOX možnost kot rezerva
//
// =====================================================

// Pini
const int PTT_OUT = 4;         // PTT do optičnega sklopnika
const int LED_PTT = 5;         // PTT indikator
const int VOX_IN = A0;         // VOX avdio vhod
const int VOX_ENABLE = 2;      // Omogoči VOX (jumper/stikalo)

// VOX parametri
const int VOX_THRESHOLD = 100;
const int VOX_HOLD_TIME = 300;  // ms

// Stanje
bool pttActive = false;
unsigned long lastVoxSignal = 0;
bool voxEnabled = false;

// Serijski medpomnilnik
String serialBuffer = "";

void setup() {
  Serial.begin(9600);  // Lahko tudi 19200 ali 38400

  pinMode(PTT_OUT, OUTPUT);
  pinMode(LED_PTT, OUTPUT);
  pinMode(VOX_ENABLE, INPUT_PULLUP);

  digitalWrite(PTT_OUT, LOW);
  digitalWrite(LED_PTT, LOW);

  Serial.println(F("Digimode Interface v1.0"));
  Serial.println(F("Ukazi: PTT ON, PTT OFF, STATUS"));
}

void loop() {
  // Preveri VOX način
  voxEnabled = !digitalRead(VOX_ENABLE);

  // Obdelaj serijske ukaze
  processSerial();

  // VOX če je omogočen
  if (voxEnabled) {
    processVOX();
  }

  // PTT časovna omejitev (varnost)
  static unsigned long pttStartTime = 0;
  if (pttActive) {
    if (pttStartTime == 0) pttStartTime = millis();
    // Časovna omejitev po 3 minutah
    if (millis() - pttStartTime > 180000UL) {
      setPTT(false);
      Serial.println(F("PTT TIMEOUT!"));
    }
  } else {
    pttStartTime = 0;
  }

  delay(10);
}

void processSerial() {
  while (Serial.available()) {
    char c = Serial.read();

    if (c == '\\n' || c == '\\r') {
      if (serialBuffer.length() > 0) {
        handleCommand(serialBuffer);
        serialBuffer = "";
      }
    } else {
      serialBuffer += c;
      if (serialBuffer.length() > 50) {
        serialBuffer = "";  // Prepreči prekoračitev medpomnilnika
      }
    }
  }
}

void handleCommand(String cmd) {
  cmd.toUpperCase();
  cmd.trim();

  Serial.print(F("CMD: "));
  Serial.println(cmd);

  if (cmd == "PTT ON" || cmd == "TX" || cmd == "1") {
    setPTT(true);
    Serial.println(F("OK PTT ON"));
  }
  else if (cmd == "PTT OFF" || cmd == "RX" || cmd == "0") {
    setPTT(false);
    Serial.println(F("OK PTT OFF"));
  }
  else if (cmd == "STATUS" || cmd == "?") {
    Serial.print(F("PTT: "));
    Serial.println(pttActive ? F("ON") : F("OFF"));
    Serial.print(F("VOX: "));
    Serial.println(voxEnabled ? F("ENABLED") : F("DISABLED"));
  }
  else if (cmd == "VOX ON") {
    // Programska preglasitev VOX
    voxEnabled = true;
    Serial.println(F("VOX ENABLED"));
  }
  else if (cmd == "VOX OFF") {
    voxEnabled = false;
    Serial.println(F("VOX DISABLED"));
  }
  else if (cmd.startsWith("CAT") || cmd.startsWith("FA") || cmd.startsWith("FB")) {
    // Navidezni odgovori za CAT poizvedovanje (nekateri programi to pošiljajo)
    Serial.println(F("OK"));
  }
  else {
    Serial.println(F("ERROR Unknown command"));
  }
}

void processVOX() {
  // Izmeri nivo zvoka
  int level = 0;
  for (int i = 0; i < 20; i++) {
    int sample = abs(analogRead(VOX_IN) - 512);
    if (sample > level) level = sample;
    delayMicroseconds(50);
  }

  if (level > VOX_THRESHOLD) {
    lastVoxSignal = millis();
    if (!pttActive) {
      setPTT(true);
      Serial.println(F("VOX TX"));
    }
  }

  // Čas zadrževanja
  if (pttActive && (millis() - lastVoxSignal > VOX_HOLD_TIME)) {
    setPTT(false);
    Serial.println(F("VOX RX"));
  }
}

void setPTT(bool active) {
  pttActive = active;
  digitalWrite(PTT_OUT, active ? HIGH : LOW);
  digitalWrite(LED_PTT, active ? HIGH : LOW);
}

// Hamlib/rigctl združljivost
// Nekateri programi pričakujejo določene odgovore
void sendRigResponse(String cmd) {
  if (cmd == "\\\\get_ptt" || cmd == "t") {
    Serial.println(pttActive ? "1" : "0");
  }
  else if (cmd.startsWith("\\\\set_ptt") || cmd.startsWith("T")) {
    if (cmd.indexOf("1") >= 0) {
      setPTT(true);
    } else {
      setPTT(false);
    }
    Serial.println("RPRT 0");
  }
}
`
  },
  codeLanguage: 'cpp',
  codeFileName: 'digimode_interface.ino',

  wiring: [
    {
      from: { de: 'Arduino D4', en: 'Arduino D4', sl: 'Arduino D4' },
      to: { de: 'Optokoppler LED +', en: 'Optocoupler LED +', sl: 'Optični sklopnik LED +' },
      color: 'Orange',
      notes: { de: 'über 1k', en: 'via 1k', sl: 'preko 1k' }
    },
    {
      from: { de: 'Optokoppler LED -', en: 'Optocoupler LED -', sl: 'Optični sklopnik LED -' },
      to: { de: 'GND', en: 'GND', sl: 'GND' },
      color: 'Schwarz'
    },
    {
      from: { de: 'Optokoppler Kollektor', en: 'Optocoupler Collector', sl: 'Optični sklopnik kolektor' },
      to: { de: 'PTT-Buchse Tip', en: 'PTT Jack Tip', sl: 'PTT vtičnica konica' }
    },
    {
      from: { de: 'Optokoppler Emitter', en: 'Optocoupler Emitter', sl: 'Optični sklopnik emiter' },
      to: { de: 'PTT-Buchse Sleeve', en: 'PTT Jack Sleeve', sl: 'PTT vtičnica tulec' }
    },
    {
      from: { de: 'Arduino D5', en: 'Arduino D5', sl: 'Arduino D5' },
      to: { de: 'LED PTT Anode', en: 'LED PTT Anode', sl: 'LED PTT anoda' },
      color: 'Rot',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' }
    },
    {
      from: { de: 'Arduino D2', en: 'Arduino D2', sl: 'Arduino D2' },
      to: { de: 'Jumper VOX Enable', en: 'Jumper VOX Enable', sl: 'Jumper VOX omogoči' },
      color: 'Gelb',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' }
    },
    {
      from: { de: 'Arduino A0', en: 'Arduino A0', sl: 'Arduino A0' },
      to: { de: 'Audio TX (VOX)', en: 'Audio TX (VOX)', sl: 'Avdio TX (VOX)' },
      color: 'Blau',
      notes: { de: 'vor Übertrager', en: 'before transformer', sl: 'pred transformatorjem' }
    },
    {
      from: { de: 'Soundkarte Speaker', en: 'Sound Card Speaker', sl: 'Zvočna kartica zvočnik' },
      to: { de: 'Übertrager 1 Primär', en: 'Transformer 1 Primary', sl: 'Transformator 1 primarni' },
      notes: { de: 'TX Audio', en: 'TX Audio', sl: 'TX avdio' }
    },
    {
      from: { de: 'Übertrager 1 Sekundär', en: 'Transformer 1 Secondary', sl: 'Transformator 1 sekundarni' },
      to: { de: 'TRX Mic über Poti', en: 'TRX Mic via Pot', sl: 'TRX mikrofon preko potenciometra' }
    },
    {
      from: { de: 'TRX Speaker', en: 'TRX Speaker', sl: 'TRX zvočnik' },
      to: { de: 'Übertrager 2 Primär', en: 'Transformer 2 Primary', sl: 'Transformator 2 primarni' },
      notes: { de: 'RX Audio', en: 'RX Audio', sl: 'RX avdio' }
    },
    {
      from: { de: 'Übertrager 2 Sekundär', en: 'Transformer 2 Secondary', sl: 'Transformator 2 sekundarni' },
      to: { de: 'Soundkarte Mic über Poti', en: 'Sound Card Mic via Pot', sl: 'Zvočna kartica mikrofon preko potenciometra' }
    },
  ],

  customizationSuggestions: [
    {
      de: 'CAT-Durchleitung zum Transceiver',
      en: 'CAT passthrough to transceiver',
      sl: 'CAT prehod do oddajnika/sprejemnika'
    },
    {
      de: 'FSK-Ausgang für RTTY',
      en: 'FSK output for RTTY',
      sl: 'FSK izhod za RTTY'
    },
    {
      de: 'Automatische Soundkarten-Erkennung',
      en: 'Automatic sound card detection',
      sl: 'Samodejna zaznava zvočne kartice'
    },
    {
      de: 'Web-Interface für Einstellungen (ESP32)',
      en: 'Web interface for settings (ESP32)',
      sl: 'Spletni vmesnik za nastavitve (ESP32)'
    },
    {
      de: 'RigExpert-Kompatible Protokolle',
      en: 'RigExpert compatible protocols',
      sl: 'RigExpert združljivi protokoli'
    },
  ],

  externalLinks: [
    {
      title: { de: 'WSJT-X Homepage', en: 'WSJT-X Homepage', sl: 'WSJT-X domača stran' },
      url: 'https://wsjt.sourceforge.io/wsjtx.html'
    },
    {
      title: { de: 'fldigi Digimode Software', en: 'fldigi Digimode Software', sl: 'fldigi Digimode programska oprema' },
      url: 'http://www.w1hkj.com/'
    },
  ],
};
