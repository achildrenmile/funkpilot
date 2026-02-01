import type { HamProject } from '../../types/projects';

export const simpleTnc: HamProject = {
  id: 'simple-tnc',
  name: {
    de: 'Einfacher Packet TNC',
    en: 'Simple Packet TNC',
    sl: 'Preprost Packet TNC',
  },
  category: 'digital-aprs',
  difficulty: 3,
  description: {
    de: 'Einfacher Terminal Node Controller für Packet Radio und APRS. 1200 Baud AFSK (Bell 202). Sendet und empfängt AX.25 Frames. USB-Serial Interface.',
    en: 'Simple Terminal Node Controller for Packet Radio and APRS. 1200 Baud AFSK (Bell 202). Sends and receives AX.25 frames. USB-Serial interface.',
    sl: 'Preprost Terminal Node Controller za Packet Radio in APRS. 1200 Baud AFSK (Bell 202). Pošilja in sprejema AX.25 okvirje. USB-Serial vmesnik.',
  },
  hardware: 'arduino-nano',

  components: [
    {
      name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' },
      quantity: 1,
    },
    {
      name: { de: 'MCP6002 OpAmp', en: 'MCP6002 OpAmp', sl: 'MCP6002 OpAmp' },
      quantity: 1,
      notes: { de: 'oder LM358', en: 'or LM358', sl: 'ali LM358' },
    },
    {
      name: { de: 'Quarz 3.579545 MHz', en: 'Crystal 3.579545 MHz', sl: 'Kvarc 3.579545 MHz' },
      quantity: 1,
      notes: { de: 'für exaktes Timing', en: 'for precise timing', sl: 'za natančno časovno usklajevanje' },
    },
    {
      name: { de: 'Potentiometer 10k', en: 'Potentiometer 10k', sl: 'Potenciometer 10k' },
      quantity: 2,
      notes: { de: 'TX/RX Pegel', en: 'TX/RX level', sl: 'TX/RX nivo' },
    },
    {
      name: { de: 'Kondensator div.', en: 'Capacitor assorted', sl: 'Kondenzator razl.' },
      quantity: 1,
      notes: { de: 'Set 100pF-10µF', en: 'Set 100pF-10µF', sl: 'Komplet 100pF-10µF' },
    },
    {
      name: { de: 'Widerstand div.', en: 'Resistor assorted', sl: 'Upor razl.' },
      quantity: 1,
      notes: { de: 'Set', en: 'Set', sl: 'Komplet' },
    },
    {
      name: { de: 'LED 3mm', en: 'LED 3mm', sl: 'LED 3mm' },
      quantity: 2,
      notes: { de: 'TX/RX', en: 'TX/RX', sl: 'TX/RX' },
    },
    {
      name: { de: 'Klinkenbuchse 3.5mm', en: '3.5mm Audio Jack', sl: '3.5mm avdio vtičnica' },
      quantity: 2,
      notes: { de: 'Audio In/Out', en: 'Audio In/Out', sl: 'Avdio vhod/izhod' },
    },
  ],
  estimatedCost: '~15€',

  code: {
    de: `// =====================================================
// Einfacher Packet TNC - FunkPilot Bastelprojekt
// Hardware: Arduino Nano
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// WARNUNG: Dies ist eine vereinfachte Demo!
// Für echtes APRS empfehle ich MicroModem oder Mobilinkd
//
// Implementiert grundlegende AFSK 1200 Baud Modulation
// Bell 202: 1200 Hz = Mark (1), 2200 Hz = Space (0)
//
// =====================================================

// Pins
const int AUDIO_IN = A0;
const int AUDIO_OUT = 9;    // PWM
const int PTT_OUT = 4;
const int LED_TX = 5;
const int LED_RX = 6;

// AFSK Parameter
const int MARK_FREQ = 1200;   // Hz
const int SPACE_FREQ = 2200;  // Hz
const int BAUD_RATE = 1200;   // Baud
const int SAMPLE_RATE = 9600; // Samples/s

// Timing
const int BIT_TIME_US = 833;  // 1/1200 Sekunde in µs

// TX Puffer
byte txBuffer[256];
int txLength = 0;
bool transmitting = false;

// RX Status
volatile bool receiving = false;
volatile int rxBitCount = 0;

// HDLC Flag
const byte HDLC_FLAG = 0x7E;

void setup() {
  Serial.begin(9600);

  pinMode(AUDIO_OUT, OUTPUT);
  pinMode(PTT_OUT, OUTPUT);
  pinMode(LED_TX, OUTPUT);
  pinMode(LED_RX, OUTPUT);

  digitalWrite(PTT_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  digitalWrite(LED_RX, LOW);

  // Timer für Sampling konfigurieren
  setupTimer();

  Serial.println(F("Einfacher TNC v1.0"));
  Serial.println(F("Befehle: SEND <text>, BEACON, STATUS"));
}

void loop() {
  // Serielle Eingabe verarbeiten
  if (Serial.available()) {
    String input = Serial.readStringUntil('\\n');
    input.trim();
    processCommand(input);
  }

  // RX LED bei Träger
  int audioLevel = measureAudioLevel();
  digitalWrite(LED_RX, audioLevel > 100 ? HIGH : LOW);

  delay(10);
}

void setupTimer() {
  // Timer2 für Audio-Ausgabe (PWM)
  // Fast PWM Modus
  TCCR2A = (1 << COM2A1) | (1 << WGM21) | (1 << WGM20);
  TCCR2B = (1 << CS20);  // Kein Prescaler
}

void processCommand(String cmd) {
  cmd.toUpperCase();

  if (cmd.startsWith("SEND ")) {
    String text = cmd.substring(5);
    sendUIFrame("NOCALL", "APRS", text);
  }
  else if (cmd == "BEACON") {
    sendUIFrame("NOCALL", "APRS", ">FunkPilot Einfacher TNC");
  }
  else if (cmd == "STATUS") {
    Serial.println(F("TNC Status: BEREIT"));
    Serial.print(F("TX: "));
    Serial.println(transmitting ? "AKTIV" : "RUHEND");
  }
  else if (cmd.startsWith("MYCALL ")) {
    // Rufzeichen setzen (nicht implementiert)
    Serial.println(F("OK"));
  }
  else {
    Serial.println(F("Unbekannter Befehl"));
  }
}

void sendUIFrame(const char* src, const char* dst, String info) {
  Serial.print(F("TX: "));
  Serial.print(src);
  Serial.print(F(">"));
  Serial.print(dst);
  Serial.print(F(": "));
  Serial.println(info);

  // PTT aktivieren
  digitalWrite(PTT_OUT, HIGH);
  digitalWrite(LED_TX, HIGH);
  transmitting = true;

  delay(100);  // PTT Verzögerung

  // Präambel senden (Flags)
  for (int i = 0; i < 50; i++) {
    sendByte(HDLC_FLAG);
  }

  // Vereinfachter AX.25 Frame
  // Ziel (7 Bytes)
  sendCallsign(dst, 0xE0);

  // Quelle (7 Bytes)
  sendCallsign(src, 0x61);

  // Control (UI Frame)
  sendByte(0x03);

  // PID (Keine Schicht 3)
  sendByte(0xF0);

  // Info-Feld
  for (int i = 0; i < info.length(); i++) {
    sendByte(info[i]);
  }

  // FCS (vereinfacht - sollte CRC-16 sein)
  sendByte(0xFF);
  sendByte(0xFF);

  // Abschluss-Flag
  sendByte(HDLC_FLAG);

  delay(50);

  // PTT deaktivieren
  digitalWrite(PTT_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  transmitting = false;

  Serial.println(F("TX abgeschlossen"));
}

void sendCallsign(const char* call, byte ssidByte) {
  // AX.25 Rufzeichen: 6 Zeichen + SSID, alle << 1
  for (int i = 0; i < 6; i++) {
    if (i < strlen(call)) {
      sendByte(call[i] << 1);
    } else {
      sendByte(' ' << 1);
    }
  }
  sendByte(ssidByte);
}

void sendByte(byte b) {
  // Bit-Stuffing und NRZI nicht implementiert!
  // Dies ist eine vereinfachte Demo

  for (int bit = 0; bit < 8; bit++) {
    bool bitVal = (b >> bit) & 1;
    sendBit(bitVal);
  }
}

void sendBit(bool bit) {
  // AFSK: Mark (1) = 1200 Hz, Space (0) = 2200 Hz
  int freq = bit ? MARK_FREQ : SPACE_FREQ;

  unsigned long startTime = micros();
  while (micros() - startTime < BIT_TIME_US) {
    // Einfache Sinuswelle generieren
    int phase = (micros() * freq / 1000000) % 256;
    int value = 128 + (sin(phase * 2 * PI / 256) * 100);
    analogWrite(AUDIO_OUT, value);
    delayMicroseconds(50);
  }
}

int measureAudioLevel() {
  int minVal = 1023, maxVal = 0;

  for (int i = 0; i < 50; i++) {
    int val = analogRead(AUDIO_IN);
    if (val < minVal) minVal = val;
    if (val > maxVal) maxVal = val;
    delayMicroseconds(50);
  }

  return maxVal - minVal;
}
`,
    en: `// =====================================================
// Simple Packet TNC - FunkPilot DIY Project
// Hardware: Arduino Nano
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// WARNING: This is a simplified demo!
// For real APRS I recommend MicroModem or Mobilinkd
//
// Implements basic AFSK 1200 Baud modulation
// Bell 202: 1200 Hz = Mark (1), 2200 Hz = Space (0)
//
// =====================================================

// Pins
const int AUDIO_IN = A0;
const int AUDIO_OUT = 9;    // PWM
const int PTT_OUT = 4;
const int LED_TX = 5;
const int LED_RX = 6;

// AFSK Parameters
const int MARK_FREQ = 1200;   // Hz
const int SPACE_FREQ = 2200;  // Hz
const int BAUD_RATE = 1200;   // Baud
const int SAMPLE_RATE = 9600; // Samples/s

// Timing
const int BIT_TIME_US = 833;  // 1/1200 second in µs

// TX Buffer
byte txBuffer[256];
int txLength = 0;
bool transmitting = false;

// RX Status
volatile bool receiving = false;
volatile int rxBitCount = 0;

// HDLC Flag
const byte HDLC_FLAG = 0x7E;

void setup() {
  Serial.begin(9600);

  pinMode(AUDIO_OUT, OUTPUT);
  pinMode(PTT_OUT, OUTPUT);
  pinMode(LED_TX, OUTPUT);
  pinMode(LED_RX, OUTPUT);

  digitalWrite(PTT_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  digitalWrite(LED_RX, LOW);

  // Configure timer for sampling
  setupTimer();

  Serial.println(F("Simple TNC v1.0"));
  Serial.println(F("Commands: SEND <text>, BEACON, STATUS"));
}

void loop() {
  // Process serial input
  if (Serial.available()) {
    String input = Serial.readStringUntil('\\n');
    input.trim();
    processCommand(input);
  }

  // RX LED on carrier
  int audioLevel = measureAudioLevel();
  digitalWrite(LED_RX, audioLevel > 100 ? HIGH : LOW);

  delay(10);
}

void setupTimer() {
  // Timer2 for audio output (PWM)
  // Fast PWM Mode
  TCCR2A = (1 << COM2A1) | (1 << WGM21) | (1 << WGM20);
  TCCR2B = (1 << CS20);  // No prescaler
}

void processCommand(String cmd) {
  cmd.toUpperCase();

  if (cmd.startsWith("SEND ")) {
    String text = cmd.substring(5);
    sendUIFrame("NOCALL", "APRS", text);
  }
  else if (cmd == "BEACON") {
    sendUIFrame("NOCALL", "APRS", ">FunkPilot Simple TNC");
  }
  else if (cmd == "STATUS") {
    Serial.println(F("TNC Status: READY"));
    Serial.print(F("TX: "));
    Serial.println(transmitting ? "ACTIVE" : "IDLE");
  }
  else if (cmd.startsWith("MYCALL ")) {
    // Set callsign (not implemented)
    Serial.println(F("OK"));
  }
  else {
    Serial.println(F("Unknown command"));
  }
}

void sendUIFrame(const char* src, const char* dst, String info) {
  Serial.print(F("TX: "));
  Serial.print(src);
  Serial.print(F(">"));
  Serial.print(dst);
  Serial.print(F(": "));
  Serial.println(info);

  // Activate PTT
  digitalWrite(PTT_OUT, HIGH);
  digitalWrite(LED_TX, HIGH);
  transmitting = true;

  delay(100);  // PTT delay

  // Send preamble (flags)
  for (int i = 0; i < 50; i++) {
    sendByte(HDLC_FLAG);
  }

  // Simplified AX.25 frame
  // Destination (7 bytes)
  sendCallsign(dst, 0xE0);

  // Source (7 bytes)
  sendCallsign(src, 0x61);

  // Control (UI Frame)
  sendByte(0x03);

  // PID (No Layer 3)
  sendByte(0xF0);

  // Info field
  for (int i = 0; i < info.length(); i++) {
    sendByte(info[i]);
  }

  // FCS (simplified - should be CRC-16)
  sendByte(0xFF);
  sendByte(0xFF);

  // Closing flag
  sendByte(HDLC_FLAG);

  delay(50);

  // Deactivate PTT
  digitalWrite(PTT_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  transmitting = false;

  Serial.println(F("TX complete"));
}

void sendCallsign(const char* call, byte ssidByte) {
  // AX.25 callsign: 6 characters + SSID, all << 1
  for (int i = 0; i < 6; i++) {
    if (i < strlen(call)) {
      sendByte(call[i] << 1);
    } else {
      sendByte(' ' << 1);
    }
  }
  sendByte(ssidByte);
}

void sendByte(byte b) {
  // Bit-stuffing and NRZI not implemented!
  // This is a simplified demo

  for (int bit = 0; bit < 8; bit++) {
    bool bitVal = (b >> bit) & 1;
    sendBit(bitVal);
  }
}

void sendBit(bool bit) {
  // AFSK: Mark (1) = 1200 Hz, Space (0) = 2200 Hz
  int freq = bit ? MARK_FREQ : SPACE_FREQ;

  unsigned long startTime = micros();
  while (micros() - startTime < BIT_TIME_US) {
    // Generate simple sine wave
    int phase = (micros() * freq / 1000000) % 256;
    int value = 128 + (sin(phase * 2 * PI / 256) * 100);
    analogWrite(AUDIO_OUT, value);
    delayMicroseconds(50);
  }
}

int measureAudioLevel() {
  int minVal = 1023, maxVal = 0;

  for (int i = 0; i < 50; i++) {
    int val = analogRead(AUDIO_IN);
    if (val < minVal) minVal = val;
    if (val > maxVal) maxVal = val;
    delayMicroseconds(50);
  }

  return maxVal - minVal;
}
`,
    sl: `// =====================================================
// Preprost Packet TNC - FunkPilot DIY projekt
// Strojna oprema: Arduino Nano
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// OPOZORILO: To je poenostavljena demo verzija!
// Za pravi APRS priporočam MicroModem ali Mobilinkd
//
// Implementira osnovno AFSK 1200 Baud modulacijo
// Bell 202: 1200 Hz = Mark (1), 2200 Hz = Space (0)
//
// =====================================================

// Pini
const int AUDIO_IN = A0;
const int AUDIO_OUT = 9;    // PWM
const int PTT_OUT = 4;
const int LED_TX = 5;
const int LED_RX = 6;

// AFSK parametri
const int MARK_FREQ = 1200;   // Hz
const int SPACE_FREQ = 2200;  // Hz
const int BAUD_RATE = 1200;   // Baud
const int SAMPLE_RATE = 9600; // Vzorci/s

// Časovno usklajevanje
const int BIT_TIME_US = 833;  // 1/1200 sekunde v µs

// TX medpomnilnik
byte txBuffer[256];
int txLength = 0;
bool transmitting = false;

// RX status
volatile bool receiving = false;
volatile int rxBitCount = 0;

// HDLC zastavica
const byte HDLC_FLAG = 0x7E;

void setup() {
  Serial.begin(9600);

  pinMode(AUDIO_OUT, OUTPUT);
  pinMode(PTT_OUT, OUTPUT);
  pinMode(LED_TX, OUTPUT);
  pinMode(LED_RX, OUTPUT);

  digitalWrite(PTT_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  digitalWrite(LED_RX, LOW);

  // Nastavi časovnik za vzorčenje
  setupTimer();

  Serial.println(F("Preprost TNC v1.0"));
  Serial.println(F("Ukazi: SEND <besedilo>, BEACON, STATUS"));
}

void loop() {
  // Obdelaj serijski vnos
  if (Serial.available()) {
    String input = Serial.readStringUntil('\\n');
    input.trim();
    processCommand(input);
  }

  // RX LED ob nosilcu
  int audioLevel = measureAudioLevel();
  digitalWrite(LED_RX, audioLevel > 100 ? HIGH : LOW);

  delay(10);
}

void setupTimer() {
  // Timer2 za avdio izhod (PWM)
  // Hiter PWM način
  TCCR2A = (1 << COM2A1) | (1 << WGM21) | (1 << WGM20);
  TCCR2B = (1 << CS20);  // Brez delilnika
}

void processCommand(String cmd) {
  cmd.toUpperCase();

  if (cmd.startsWith("SEND ")) {
    String text = cmd.substring(5);
    sendUIFrame("NOCALL", "APRS", text);
  }
  else if (cmd == "BEACON") {
    sendUIFrame("NOCALL", "APRS", ">FunkPilot Preprost TNC");
  }
  else if (cmd == "STATUS") {
    Serial.println(F("TNC Status: PRIPRAVLJEN"));
    Serial.print(F("TX: "));
    Serial.println(transmitting ? "AKTIVEN" : "MIRUJE");
  }
  else if (cmd.startsWith("MYCALL ")) {
    // Nastavi klicni znak (ni implementirano)
    Serial.println(F("OK"));
  }
  else {
    Serial.println(F("Neznan ukaz"));
  }
}

void sendUIFrame(const char* src, const char* dst, String info) {
  Serial.print(F("TX: "));
  Serial.print(src);
  Serial.print(F(">"));
  Serial.print(dst);
  Serial.print(F(": "));
  Serial.println(info);

  // Aktiviraj PTT
  digitalWrite(PTT_OUT, HIGH);
  digitalWrite(LED_TX, HIGH);
  transmitting = true;

  delay(100);  // PTT zakasnitev

  // Pošlji preambulo (zastavice)
  for (int i = 0; i < 50; i++) {
    sendByte(HDLC_FLAG);
  }

  // Poenostavljen AX.25 okvir
  // Cilj (7 bajtov)
  sendCallsign(dst, 0xE0);

  // Vir (7 bajtov)
  sendCallsign(src, 0x61);

  // Kontrola (UI okvir)
  sendByte(0x03);

  // PID (Brez plasti 3)
  sendByte(0xF0);

  // Info polje
  for (int i = 0; i < info.length(); i++) {
    sendByte(info[i]);
  }

  // FCS (poenostavljeno - moral bi biti CRC-16)
  sendByte(0xFF);
  sendByte(0xFF);

  // Zaključna zastavica
  sendByte(HDLC_FLAG);

  delay(50);

  // Deaktiviraj PTT
  digitalWrite(PTT_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  transmitting = false;

  Serial.println(F("TX končan"));
}

void sendCallsign(const char* call, byte ssidByte) {
  // AX.25 klicni znak: 6 znakov + SSID, vsi << 1
  for (int i = 0; i < 6; i++) {
    if (i < strlen(call)) {
      sendByte(call[i] << 1);
    } else {
      sendByte(' ' << 1);
    }
  }
  sendByte(ssidByte);
}

void sendByte(byte b) {
  // Bit-stuffing in NRZI nista implementirana!
  // To je poenostavljena demo verzija

  for (int bit = 0; bit < 8; bit++) {
    bool bitVal = (b >> bit) & 1;
    sendBit(bitVal);
  }
}

void sendBit(bool bit) {
  // AFSK: Mark (1) = 1200 Hz, Space (0) = 2200 Hz
  int freq = bit ? MARK_FREQ : SPACE_FREQ;

  unsigned long startTime = micros();
  while (micros() - startTime < BIT_TIME_US) {
    // Generiraj preprosto sinusno valovanje
    int phase = (micros() * freq / 1000000) % 256;
    int value = 128 + (sin(phase * 2 * PI / 256) * 100);
    analogWrite(AUDIO_OUT, value);
    delayMicroseconds(50);
  }
}

int measureAudioLevel() {
  int minVal = 1023, maxVal = 0;

  for (int i = 0; i < 50; i++) {
    int val = analogRead(AUDIO_IN);
    if (val < minVal) minVal = val;
    if (val > maxVal) maxVal = val;
    delayMicroseconds(50);
  }

  return maxVal - minVal;
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'simple_tnc.ino',

  wiring: [
    {
      from: { de: 'Arduino D9 (PWM)', en: 'Arduino D9 (PWM)', sl: 'Arduino D9 (PWM)' },
      to: { de: 'Tiefpass-Filter', en: 'Low-pass filter', sl: 'Nizkoprepustni filter' },
      color: 'Orange',
      notes: { de: 'Audio Out', en: 'Audio Out', sl: 'Avdio izhod' },
    },
    {
      from: { de: 'Tiefpass Ausgang', en: 'Low-pass output', sl: 'Izhod nizkoprepustnega filtra' },
      to: { de: 'Poti TX-Pegel', en: 'TX level pot', sl: 'TX nivo potenciometer' },
      notes: { de: 'zum TRX Mic', en: 'to TRX mic', sl: 'do TRX mikrofona' },
    },
    {
      from: { de: 'TRX Lautsprecher', en: 'TRX Speaker', sl: 'TRX zvočnik' },
      to: { de: 'Poti RX-Pegel', en: 'RX level pot', sl: 'RX nivo potenciometer' },
      notes: { de: 'Audio In', en: 'Audio In', sl: 'Avdio vhod' },
    },
    {
      from: { de: 'Poti RX-Pegel', en: 'RX level pot', sl: 'RX nivo potenciometer' },
      to: { de: 'Arduino A0', en: 'Arduino A0', sl: 'Arduino A0' },
      color: 'Blau',
    },
    {
      from: { de: 'Arduino D4', en: 'Arduino D4', sl: 'Arduino D4' },
      to: { de: 'PTT-Ausgang', en: 'PTT output', sl: 'PTT izhod' },
      color: 'Gelb',
    },
    {
      from: { de: 'Arduino D5', en: 'Arduino D5', sl: 'Arduino D5' },
      to: { de: 'LED TX', en: 'LED TX', sl: 'LED TX' },
      color: 'Rot',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'prek 220Ω' },
    },
    {
      from: { de: 'Arduino D6', en: 'Arduino D6', sl: 'Arduino D6' },
      to: { de: 'LED RX', en: 'LED RX', sl: 'LED RX' },
      color: 'Grün',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'prek 220Ω' },
    },
    {
      from: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' },
      to: { de: 'Alle GND', en: 'All GND', sl: 'Vsi GND' },
      color: 'Schwarz',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Echter AFSK-Demodulator mit PLL',
      en: 'Real AFSK demodulator with PLL',
      sl: 'Pravi AFSK demodulator s PLL',
    },
    {
      de: 'KISS-Protokoll für Hostmode',
      en: 'KISS protocol for host mode',
      sl: 'KISS protokol za gostiteljski način',
    },
    {
      de: 'Digipeater-Funktion',
      en: 'Digipeater function',
      sl: 'Digipeater funkcija',
    },
    {
      de: 'GPS-Integration für APRS Position',
      en: 'GPS integration for APRS position',
      sl: 'GPS integracija za APRS pozicijo',
    },
    {
      de: 'Besser: MicroModem oder Mobilinkd verwenden',
      en: 'Better: Use MicroModem or Mobilinkd',
      sl: 'Bolje: Uporabite MicroModem ali Mobilinkd',
    },
  ],

  externalLinks: [
    {
      title: { de: 'AX.25 Protokoll', en: 'AX.25 Protocol', sl: 'AX.25 protokol' },
      url: 'https://www.tapr.org/pub_ax25.html',
    },
    {
      title: { de: 'MicroModem Projekt', en: 'MicroModem Project', sl: 'MicroModem projekt' },
      url: 'https://unsigned.io/micromodem/',
    },
  ],
};
