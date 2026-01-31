import type { HamProject } from '../../types/projects';

export const digimodeInterface: HamProject = {
  id: 'digimode-interface',
  name: 'RTTY/PSK Interface',
  category: 'digital-aprs',
  difficulty: 2,
  description: 'USB-Audio-Interface für Digimodes wie RTTY, PSK31, SSTV. Galvanische Trennung durch Übertrager. VOX oder CAT-PTT. Plug-and-Play mit WSJT-X, fldigi etc.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1, notes: 'nur für PTT-Steuerung' },
    { name: 'USB-Soundkarte', quantity: 1, notes: 'günstige China-Karte reicht' },
    { name: 'Audio-Übertrager 600:600', quantity: 2, notes: 'galvanische Trennung' },
    { name: 'Optokoppler PC817', quantity: 1, notes: 'PTT Isolation' },
    { name: 'Potentiometer 10k', quantity: 2, notes: 'TX/RX Pegel' },
    { name: 'Kondensator 100nF', quantity: 4 },
    { name: 'Widerstand div.', quantity: 1, notes: '1k, 10k Set' },
    { name: 'Klinkenbuchsen 3.5mm', quantity: 3, notes: 'Mic, Speaker, PTT' },
    { name: 'USB-B Buchse', quantity: 1, notes: 'für Soundkarte' },
    { name: 'LED rot', quantity: 1, notes: 'PTT-Anzeige' },
  ],
  estimatedCost: '~20€',

  code: `// =====================================================
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
  codeLanguage: 'cpp',
  codeFileName: 'digimode_interface.ino',

  wiring: [
    { from: 'Arduino D4', to: 'Optokoppler LED +', color: 'Orange', notes: 'über 1k' },
    { from: 'Optokoppler LED -', to: 'GND', color: 'Schwarz' },
    { from: 'Optokoppler Kollektor', to: 'PTT-Buchse Tip' },
    { from: 'Optokoppler Emitter', to: 'PTT-Buchse Sleeve' },
    { from: 'Arduino D5', to: 'LED PTT Anode', color: 'Rot', notes: 'über 220Ω' },
    { from: 'Arduino D2', to: 'Jumper VOX Enable', color: 'Gelb', notes: 'nach GND' },
    { from: 'Arduino A0', to: 'Audio TX (VOX)', color: 'Blau', notes: 'vor Übertrager' },
    { from: 'Soundkarte Speaker', to: 'Übertrager 1 Primär', notes: 'TX Audio' },
    { from: 'Übertrager 1 Sekundär', to: 'TRX Mic über Poti' },
    { from: 'TRX Speaker', to: 'Übertrager 2 Primär', notes: 'RX Audio' },
    { from: 'Übertrager 2 Sekundär', to: 'Soundkarte Mic über Poti' },
  ],

  customizationSuggestions: [
    'CAT-Durchleitung zum Transceiver',
    'FSK-Ausgang für RTTY',
    'Automatische Soundkarten-Erkennung',
    'Web-Interface für Einstellungen (ESP32)',
    'RigExpert-Kompatible Protokolle',
  ],

  externalLinks: [
    { title: 'WSJT-X Homepage', url: 'https://wsjt.sourceforge.io/wsjtx.html' },
    { title: 'fldigi Digimode Software', url: 'http://www.w1hkj.com/' },
  ],
};
