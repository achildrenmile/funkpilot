import type { HamProject } from '../../types/projects';

export const pttInterface: HamProject = {
  id: 'ptt-interface',
  name: {
    de: 'USB-PTT Interface',
    en: 'USB PTT Interface',
    sl: 'USB PTT vmesnik',
  },
  category: 'control',
  difficulty: 1,
  description: {
    de: 'USB-gesteuertes PTT-Interface für PC-Betrieb. Galvanisch getrennt durch Optokoppler. Kompatibel mit WSJT-X, fldigi, Ham Radio Deluxe und allen CAT-Programmen.',
    en: 'USB-controlled PTT interface for PC operation. Galvanically isolated via optocoupler. Compatible with WSJT-X, fldigi, Ham Radio Deluxe and all CAT programs.',
    sl: 'USB-krmiljen PTT vmesnik za delovanje z računalnikom. Galvansko ločen z optosklopnikom. Združljiv z WSJT-X, fldigi, Ham Radio Deluxe in vsemi CAT programi.',
  },
  hardware: 'arduino-nano',

  components: [
    {
      name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' },
      quantity: 1,
    },
    {
      name: { de: 'Optokoppler PC817', en: 'Optocoupler PC817', sl: 'Optosklopnik PC817' },
      quantity: 2,
      notes: { de: 'galvanische Trennung', en: 'galvanic isolation', sl: 'galvanska ločitev' },
    },
    {
      name: { de: 'LED rot', en: 'LED red', sl: 'LED rdeča' },
      quantity: 1,
      notes: { de: 'PTT-Anzeige', en: 'PTT indicator', sl: 'PTT indikator' },
    },
    {
      name: { de: 'LED grün', en: 'LED green', sl: 'LED zelena' },
      quantity: 1,
      notes: { de: 'Power-Anzeige', en: 'Power indicator', sl: 'Indikator napajanja' },
    },
    {
      name: { de: 'Widerstand 220 Ohm', en: 'Resistor 220 Ohm', sl: 'Upor 220 Ohm' },
      quantity: 2,
    },
    {
      name: { de: 'Widerstand 1k', en: 'Resistor 1k', sl: 'Upor 1k' },
      quantity: 2,
    },
    {
      name: { de: 'Klinkenbuchse 3.5mm', en: '3.5mm jack socket', sl: '3.5mm vtičnica' },
      quantity: 1,
      notes: { de: 'PTT-Ausgang', en: 'PTT output', sl: 'PTT izhod' },
    },
    {
      name: { de: 'Klinkenbuchse 3.5mm', en: '3.5mm jack socket', sl: '3.5mm vtičnica' },
      quantity: 1,
      notes: { de: 'CW-Key (optional)', en: 'CW key (optional)', sl: 'CW ključ (opcijsko)' },
    },
    {
      name: { de: 'Gehäuse klein', en: 'Small enclosure', sl: 'Malo ohišje' },
      quantity: 1,
      notes: { de: 'z.B. Hammond', en: 'e.g. Hammond', sl: 'npr. Hammond' },
    },
  ],
  estimatedCost: '~8€',

  code: `// =====================================================
// USB-PTT Interface - FunkPilot DIY Project
// USB-PTT vmesnik - FunkPilot projekt
// Hardware: Arduino Nano + Optocoupler / Optosklopnik
// Author / Avtor: FunkPilot / OE8YML
// License / Licenca: MIT
// =====================================================
//
// Simple PTT/CW interface via USB-Serial
// Einfaches PTT/CW Interface über USB-Serial
// Preprost PTT/CW vmesnik preko USB-Serial
//
// Compatible with / Kompatibel mit / Združljiv z:
// Hamlib, WSJT-X, fldigi
//
// Protocol / Protokoll / Protokol:
// - DTR or RTS for PTT (standard in many programs)
// - DTR oder RTS für PTT (Standard bei vielen Programmen)
// - DTR ali RTS za PTT (standardno pri večini programov)
// - Serial commands as alternative
// - Serial-Befehle als Alternative
// - Serijski ukazi kot alternativa
//
// =====================================================

// Pins / Pini
const int PTT_OUT = 4;       // PTT to optocoupler / PTT zu Optokoppler / PTT na optosklopnik
const int CW_OUT = 5;        // CW Key to optocoupler / CW Key zu Optokoppler / CW ključ na optosklopnik
const int LED_PTT = 6;       // PTT LED
const int LED_PWR = 7;       // Power LED / Napajanje LED

// Status / Stanje
bool pttState = false;
bool cwState = false;
unsigned long lastActivity = 0;

// Serial Buffer / Serijski medpomnilnik
String cmdBuffer = "";

void setup() {
  // USB Serial (for commands / für Befehle / za ukaze)
  Serial.begin(9600);

  // Configure pins / Pins konfigurieren / Konfiguracija pinov
  pinMode(PTT_OUT, OUTPUT);
  pinMode(CW_OUT, OUTPUT);
  pinMode(LED_PTT, OUTPUT);
  pinMode(LED_PWR, OUTPUT);

  // Initial: Everything off / Alles aus / Vse izklopljeno
  digitalWrite(PTT_OUT, LOW);
  digitalWrite(CW_OUT, LOW);
  digitalWrite(LED_PTT, LOW);
  digitalWrite(LED_PWR, HIGH);  // Power LED on / an / vklopljena

  Serial.println(F("USB-PTT Interface v1.0"));
  Serial.println(F("Commands / Befehle / Ukazi: PTT ON, PTT OFF, CW ON, CW OFF, STATUS"));
}

void loop() {
  // Process serial commands / Serial-Befehle verarbeiten / Obdelaj serijske ukaze
  processSerial();

  // Check DTR/RTS signals (for hardware flow control)
  // DTR/RTS Signale prüfen (für Hardware-Flow-Control)
  // Preveri DTR/RTS signale (za strojno krmiljenje pretoka)
  // Note: On Arduino Nano DTR is connected to Reset!
  // Bei Arduino Nano ist DTR an den Reset gekoppelt!
  // Pri Arduino Nano je DTR povezan na Reset!
  // For DTR-PTT you would need to disconnect the reset line
  // Für DTR-PTT müsste man die Reset-Leitung trennen
  // Za DTR-PTT bi morali odklopiti reset linijo
  // Here only software control / Hier nur Software-Steuerung / Tu samo programsko krmiljenje

  // Timeout safety: PTT off after 5 minutes
  // Timeout-Sicherheit: Nach 5 Minuten PTT aus
  // Varnostni timeout: PTT izklop po 5 minutah
  if (pttState && (millis() - lastActivity > 300000UL)) {
    setPTT(false);
    Serial.println(F("PTT TIMEOUT"));
  }

  // Heartbeat on Power LED / Heartbeat auf Power-LED / Utrip na Power-LED
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
      // Prevent buffer overflow / Buffer-Überlauf verhindern / Prepreči prekoračitev medpomnilnika
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

  // PTT commands / PTT Befehle / PTT ukazi
  if (cmd == "PTT ON" || cmd == "TX" || cmd == "T1" || cmd == "\\\\set_ptt 1") {
    setPTT(true);
    sendOK();
  }
  else if (cmd == "PTT OFF" || cmd == "RX" || cmd == "T0" || cmd == "\\\\set_ptt 0") {
    setPTT(false);
    sendOK();
  }
  // CW Key commands / CW Key Befehle / CW ključ ukazi
  else if (cmd == "CW ON" || cmd == "K1") {
    setCW(true);
    sendOK();
  }
  else if (cmd == "CW OFF" || cmd == "K0") {
    setCW(false);
    sendOK();
  }
  // Status query / Status-Abfrage / Poizvedba stanja
  else if (cmd == "STATUS" || cmd == "?" || cmd == "\\\\get_ptt" || cmd == "t") {
    Serial.print(F("PTT: "));
    Serial.print(pttState ? "1" : "0");
    Serial.print(F(" CW: "));
    Serial.println(cwState ? "1" : "0");
  }
  // Hamlib compatibility / Hamlib Kompatibilität / Hamlib združljivost
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
  // Ping for connection test / Ping für Verbindungstest / Ping za test povezave
  else if (cmd == "PING") {
    Serial.println(F("PONG"));
  }
  // Version / Verzija
  else if (cmd == "VER" || cmd == "VERSION") {
    Serial.println(F("USB-PTT Interface v1.0 FunkPilot"));
  }
  else {
    // Unknown command - just OK for compatibility
    // Unbekannter Befehl - einfach OK für Kompatibilität
    // Neznan ukaz - samo OK za združljivost
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
    {
      from: 'Arduino D4',
      to: { de: 'Optokoppler 1 LED +', en: 'Optocoupler 1 LED +', sl: 'Optosklopnik 1 LED +' },
      color: 'Orange',
      notes: { de: 'über 1k', en: 'via 1k', sl: 'preko 1k' },
    },
    {
      from: { de: 'Optokoppler 1 LED -', en: 'Optocoupler 1 LED -', sl: 'Optosklopnik 1 LED -' },
      to: 'GND',
      color: 'Schwarz',
    },
    {
      from: { de: 'Optokoppler 1 Kollektor', en: 'Optocoupler 1 Collector', sl: 'Optosklopnik 1 Kolektor' },
      to: { de: 'PTT-Buchse Tip', en: 'PTT jack tip', sl: 'PTT vtičnica konica' },
    },
    {
      from: { de: 'Optokoppler 1 Emitter', en: 'Optocoupler 1 Emitter', sl: 'Optosklopnik 1 Emitor' },
      to: { de: 'PTT-Buchse Sleeve', en: 'PTT jack sleeve', sl: 'PTT vtičnica plašč' },
    },
    {
      from: 'Arduino D5',
      to: { de: 'Optokoppler 2 LED +', en: 'Optocoupler 2 LED +', sl: 'Optosklopnik 2 LED +' },
      color: 'Blau',
      notes: { de: 'CW, über 1k', en: 'CW, via 1k', sl: 'CW, preko 1k' },
    },
    {
      from: { de: 'Optokoppler 2 Kollektor', en: 'Optocoupler 2 Collector', sl: 'Optosklopnik 2 Kolektor' },
      to: { de: 'CW-Buchse Tip', en: 'CW jack tip', sl: 'CW vtičnica konica' },
    },
    {
      from: { de: 'Optokoppler 2 Emitter', en: 'Optocoupler 2 Emitter', sl: 'Optosklopnik 2 Emitor' },
      to: { de: 'CW-Buchse Sleeve', en: 'CW jack sleeve', sl: 'CW vtičnica plašč' },
    },
    {
      from: 'Arduino D6',
      to: { de: 'LED PTT Anode', en: 'LED PTT Anode', sl: 'LED PTT Anoda' },
      color: 'Rot',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' },
    },
    {
      from: 'Arduino D7',
      to: { de: 'LED Power Anode', en: 'LED Power Anode', sl: 'LED Napajanje Anoda' },
      color: 'Grün',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' },
    },
    {
      from: 'Arduino USB',
      to: 'PC',
      notes: { de: 'Daten + Stromversorgung', en: 'Data + power supply', sl: 'Podatki + napajanje' },
    },
  ],

  customizationSuggestions: [
    { de: 'CAT-Durchleitung zum Transceiver', en: 'CAT passthrough to transceiver', sl: 'CAT prenos do oddajnika' },
    { de: 'Foot-Switch Eingang', en: 'Foot switch input', sl: 'Vhod za nožno stikalo' },
    { de: 'RTS/DTR Hardware-Erkennung', en: 'RTS/DTR hardware detection', sl: 'RTS/DTR strojna zaznava' },
    { de: 'Mehrere PTT-Ausgänge parallel', en: 'Multiple PTT outputs in parallel', sl: 'Več PTT izhodov vzporedno' },
    { de: 'Sequencer für PA/Antenne', en: 'Sequencer for PA/antenna', sl: 'Sekvencer za PA/anteno' },
  ],

  externalLinks: [
    {
      title: { de: 'Hamlib CAT Control', en: 'Hamlib CAT Control', sl: 'Hamlib CAT krmiljenje' },
      url: 'https://hamlib.github.io/',
    },
    {
      title: { de: 'WSJT-X Konfiguration', en: 'WSJT-X Configuration', sl: 'WSJT-X konfiguracija' },
      url: 'https://www.physics.princeton.edu/pulsar/k1jt/wsjtx.html',
    },
  ],
};
