import type { HamProject } from '../../types/projects';

export const pttInterface: HamProject = {
  id: 'ptt-interface',
  name: 'USB-PTT Interface',
  category: 'control',
  difficulty: 1,
  description: 'USB-gesteuertes PTT-Interface für PC-Betrieb. Galvanisch getrennt durch Optokoppler. Kompatibel mit WSJT-X, fldigi, Ham Radio Deluxe und allen CAT-Programmen.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'Optokoppler PC817', quantity: 2, notes: 'galvanische Trennung' },
    { name: 'LED rot', quantity: 1, notes: 'PTT-Anzeige' },
    { name: 'LED grün', quantity: 1, notes: 'Power-Anzeige' },
    { name: 'Widerstand 220 Ohm', quantity: 2 },
    { name: 'Widerstand 1k', quantity: 2 },
    { name: 'Klinkenbuchse 3.5mm', quantity: 1, notes: 'PTT-Ausgang' },
    { name: 'Klinkenbuchse 3.5mm', quantity: 1, notes: 'CW-Key (optional)' },
    { name: 'Gehäuse klein', quantity: 1, notes: 'z.B. Hammond' },
  ],
  estimatedCost: '~8€',

  code: `// =====================================================
// USB-PTT Interface - FunkPilot Bastelprojekt
// Hardware: Arduino Nano + Optokoppler
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Einfaches PTT/CW Interface über USB-Serial
// Kompatibel mit Hamlib, WSJT-X, fldigi
//
// Protokoll:
// - DTR oder RTS für PTT (Standard bei vielen Programmen)
// - Serial-Befehle als Alternative
//
// =====================================================

// Pins
const int PTT_OUT = 4;       // PTT zu Optokoppler
const int CW_OUT = 5;        // CW Key zu Optokoppler
const int LED_PTT = 6;       // PTT LED
const int LED_PWR = 7;       // Power LED

// Status
bool pttState = false;
bool cwState = false;
unsigned long lastActivity = 0;

// Serial Buffer
String cmdBuffer = "";

void setup() {
  // USB Serial (für Befehle)
  Serial.begin(9600);

  // Pins konfigurieren
  pinMode(PTT_OUT, OUTPUT);
  pinMode(CW_OUT, OUTPUT);
  pinMode(LED_PTT, OUTPUT);
  pinMode(LED_PWR, OUTPUT);

  // Initial: Alles aus
  digitalWrite(PTT_OUT, LOW);
  digitalWrite(CW_OUT, LOW);
  digitalWrite(LED_PTT, LOW);
  digitalWrite(LED_PWR, HIGH);  // Power LED an

  Serial.println(F("USB-PTT Interface v1.0"));
  Serial.println(F("Befehle: PTT ON, PTT OFF, CW ON, CW OFF, STATUS"));
}

void loop() {
  // Serial-Befehle verarbeiten
  processSerial();

  // DTR/RTS Signale prüfen (für Hardware-Flow-Control)
  // Note: Bei Arduino Nano ist DTR an den Reset gekoppelt!
  // Für DTR-PTT müsste man die Reset-Leitung trennen
  // Hier nur Software-Steuerung

  // Timeout-Sicherheit: Nach 5 Minuten PTT aus
  if (pttState && (millis() - lastActivity > 300000UL)) {
    setPTT(false);
    Serial.println(F("PTT TIMEOUT"));
  }

  // Heartbeat auf Power-LED
  digitalWrite(LED_PWR, (millis() / 1000) % 2 ? HIGH : LOW);

  delay(10);
}

void processSerial() {
  while (Serial.available()) {
    char c = Serial.read();

    if (c == '\\n' || c == '\\r') {
      if (cmdBuffer.length() > 0) {
        handleCommand(cmdBuffer);
        cmdBuffer = "";
      }
    } else {
      cmdBuffer += c;
      // Buffer-Überlauf verhindern
      if (cmdBuffer.length() > 30) {
        cmdBuffer = "";
      }
    }
  }
}

void handleCommand(String cmd) {
  cmd.toUpperCase();
  cmd.trim();

  lastActivity = millis();

  // PTT Befehle
  if (cmd == "PTT ON" || cmd == "TX" || cmd == "T1" || cmd == "\\\\set_ptt 1") {
    setPTT(true);
    sendOK();
  }
  else if (cmd == "PTT OFF" || cmd == "RX" || cmd == "T0" || cmd == "\\\\set_ptt 0") {
    setPTT(false);
    sendOK();
  }
  // CW Key Befehle
  else if (cmd == "CW ON" || cmd == "K1") {
    setCW(true);
    sendOK();
  }
  else if (cmd == "CW OFF" || cmd == "K0") {
    setCW(false);
    sendOK();
  }
  // Status-Abfrage
  else if (cmd == "STATUS" || cmd == "?" || cmd == "\\\\get_ptt" || cmd == "t") {
    Serial.print(F("PTT: "));
    Serial.print(pttState ? "1" : "0");
    Serial.print(F(" CW: "));
    Serial.println(cwState ? "1" : "0");
  }
  // Hamlib Kompatibilität
  else if (cmd == "T") {
    Serial.println(pttState ? "1" : "0");
  }
  else if (cmd.startsWith("T ")) {
    if (cmd.indexOf("1") >= 0) {
      setPTT(true);
    } else {
      setPTT(false);
    }
    Serial.println(F("RPRT 0"));
  }
  // Ping für Verbindungstest
  else if (cmd == "PING") {
    Serial.println(F("PONG"));
  }
  // Version
  else if (cmd == "VER" || cmd == "VERSION") {
    Serial.println(F("USB-PTT Interface v1.0 FunkPilot"));
  }
  else {
    // Unbekannter Befehl - einfach OK für Kompatibilität
    Serial.println(F("OK"));
  }
}

void setPTT(bool state) {
  pttState = state;
  digitalWrite(PTT_OUT, state ? HIGH : LOW);
  digitalWrite(LED_PTT, state ? HIGH : LOW);

  Serial.print(F("PTT: "));
  Serial.println(state ? F("ON") : F("OFF"));
}

void setCW(bool state) {
  cwState = state;
  digitalWrite(CW_OUT, state ? HIGH : LOW);
}

void sendOK() {
  Serial.println(F("OK"));
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'ptt_interface.ino',

  wiring: [
    { from: 'Arduino D4', to: 'Optokoppler 1 LED +', color: 'Orange', notes: 'über 1k' },
    { from: 'Optokoppler 1 LED -', to: 'GND', color: 'Schwarz' },
    { from: 'Optokoppler 1 Kollektor', to: 'PTT-Buchse Tip' },
    { from: 'Optokoppler 1 Emitter', to: 'PTT-Buchse Sleeve' },
    { from: 'Arduino D5', to: 'Optokoppler 2 LED +', color: 'Blau', notes: 'CW, über 1k' },
    { from: 'Optokoppler 2 Kollektor', to: 'CW-Buchse Tip' },
    { from: 'Optokoppler 2 Emitter', to: 'CW-Buchse Sleeve' },
    { from: 'Arduino D6', to: 'LED PTT Anode', color: 'Rot', notes: 'über 220Ω' },
    { from: 'Arduino D7', to: 'LED Power Anode', color: 'Grün', notes: 'über 220Ω' },
    { from: 'Arduino USB', to: 'PC', notes: 'Daten + Stromversorgung' },
  ],

  customizationSuggestions: [
    'CAT-Durchleitung zum Transceiver',
    'Foot-Switch Eingang',
    'RTS/DTR Hardware-Erkennung',
    'Mehrere PTT-Ausgänge parallel',
    'Sequencer für PA/Antenne',
  ],

  externalLinks: [
    { title: 'Hamlib CAT Control', url: 'https://hamlib.github.io/' },
    { title: 'WSJT-X Konfiguration', url: 'https://www.physics.princeton.edu/pulsar/k1jt/wsjtx.html' },
  ],
};
