import type { HamProject } from '../../types/projects';

export const simpleTnc: HamProject = {
  id: 'simple-tnc',
  name: 'Simple Packet TNC',
  category: 'digital-aprs',
  difficulty: 3,
  description: 'Einfacher Terminal Node Controller für Packet Radio und APRS. 1200 Baud AFSK (Bell 202). Sendet und empfängt AX.25 Frames. USB-Serial Interface.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'MCP6002 OpAmp', quantity: 1, notes: 'oder LM358' },
    { name: 'Quarz 3.579545 MHz', quantity: 1, notes: 'für exaktes Timing' },
    { name: 'Potentiometer 10k', quantity: 2, notes: 'TX/RX Pegel' },
    { name: 'Kondensator div.', quantity: 1, notes: 'Set 100pF-10µF' },
    { name: 'Widerstand div.', quantity: 1, notes: 'Set' },
    { name: 'LED 3mm', quantity: 2, notes: 'TX/RX' },
    { name: 'Klinkenbuchse 3.5mm', quantity: 2, notes: 'Audio In/Out' },
  ],
  estimatedCost: '~15€',

  code: `// =====================================================
// Simple Packet TNC - FunkPilot Bastelprojekt
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

  // Timer für Sampling konfigurieren
  setupTimer();

  Serial.println(F("Simple TNC v1.0"));
  Serial.println(F("Befehle: SEND <text>, BEACON, STATUS"));
}

void loop() {
  // Serial Eingabe verarbeiten
  if (Serial.available()) {
    String input = Serial.readStringUntil('\\n');
    input.trim();
    processCommand(input);
  }

  // RX LED bei Carrier
  int audioLevel = measureAudioLevel();
  digitalWrite(LED_RX, audioLevel > 100 ? HIGH : LOW);

  delay(10);
}

void setupTimer() {
  // Timer2 für Audio-Ausgabe (PWM)
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
    // Rufzeichen setzen (nicht implementiert)
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

  // PTT aktivieren
  digitalWrite(PTT_OUT, HIGH);
  digitalWrite(LED_TX, HIGH);
  transmitting = true;

  delay(100);  // PTT Delay

  // Preamble senden (Flags)
  for (int i = 0; i < 50; i++) {
    sendByte(HDLC_FLAG);
  }

  // Vereinfachter AX.25 Frame
  // Destination (7 bytes)
  sendCallsign(dst, 0xE0);

  // Source (7 bytes)
  sendCallsign(src, 0x61);

  // Control (UI Frame)
  sendByte(0x03);

  // PID (No Layer 3)
  sendByte(0xF0);

  // Info Field
  for (int i = 0; i < info.length(); i++) {
    sendByte(info[i]);
  }

  // FCS (vereinfacht - sollte CRC-16 sein)
  sendByte(0xFF);
  sendByte(0xFF);

  // Closing Flag
  sendByte(HDLC_FLAG);

  delay(50);

  // PTT deaktivieren
  digitalWrite(PTT_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  transmitting = false;

  Serial.println(F("TX complete"));
}

void sendCallsign(const char* call, byte ssidByte) {
  // AX.25 Callsign: 6 Zeichen + SSID, alle << 1
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
  codeLanguage: 'cpp',
  codeFileName: 'simple_tnc.ino',

  wiring: [
    { from: 'Arduino D9 (PWM)', to: 'Tiefpass-Filter', color: 'Orange', notes: 'Audio Out' },
    { from: 'Tiefpass Ausgang', to: 'Poti TX-Pegel', notes: 'zum TRX Mic' },
    { from: 'TRX Speaker', to: 'Poti RX-Pegel', notes: 'Audio In' },
    { from: 'Poti RX-Pegel', to: 'Arduino A0', color: 'Blau' },
    { from: 'Arduino D4', to: 'PTT-Ausgang', color: 'Gelb' },
    { from: 'Arduino D5', to: 'LED TX', color: 'Rot', notes: 'über 220Ω' },
    { from: 'Arduino D6', to: 'LED RX', color: 'Grün', notes: 'über 220Ω' },
    { from: 'Arduino GND', to: 'Alle GND', color: 'Schwarz' },
  ],

  customizationSuggestions: [
    'Echter AFSK-Demodulator mit PLL',
    'KISS-Protokoll für Hostmode',
    'Digipeater-Funktion',
    'GPS-Integration für APRS Position',
    'Besser: MicroModem oder Mobilinkd verwenden',
  ],

  externalLinks: [
    { title: 'AX.25 Protokoll', url: 'https://www.tapr.org/pub_ax25.html' },
    { title: 'MicroModem Projekt', url: 'https://unsigned.io/micromodem/' },
  ],
};
