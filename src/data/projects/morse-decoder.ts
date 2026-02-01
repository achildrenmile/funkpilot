import type { HamProject } from '../../types/projects';

export const morseDecoder: HamProject = {
  id: 'morse-decoder',
  name: {
    de: 'Morsedecoder',
    en: 'Morse Decoder',
    sl: 'Morsov dekoder',
  },
  category: 'cw-morse',
  difficulty: 2,
  description: {
    de: 'Dekodiert CW-Signale vom Audioeingang und zeigt den Text auf einem OLED-Display. Einstellbare Empfindlichkeit und WPM-Erkennung. Ideal zum Mitlesen von CW-QSOs.',
    en: 'Decodes CW signals from audio input and displays the text on an OLED display. Adjustable sensitivity and WPM detection. Ideal for following along with CW QSOs.',
    sl: 'Dekodira CW signale iz avdio vhoda in prikazuje besedilo na OLED zaslonu. Nastavljiva občutljivost in zaznavanje WPM. Idealno za spremljanje CW QSO-jev.',
  },
  hardware: 'arduino-nano',

  components: [
    { name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' }, quantity: 1 },
    { name: { de: 'OLED Display 0.96" I2C', en: 'OLED Display 0.96" I2C', sl: 'OLED zaslon 0.96" I2C' }, quantity: 1, notes: { de: 'SSD1306', en: 'SSD1306', sl: 'SSD1306' } },
    { name: { de: 'Elektret-Mikrofon mit Verstärker', en: 'Electret microphone with amplifier', sl: 'Elektretni mikrofon z ojačevalnikom' }, quantity: 1, notes: { de: 'MAX9814 oder ähnlich', en: 'MAX9814 or similar', sl: 'MAX9814 ali podoben' } },
    { name: { de: 'Potentiometer 10k', en: 'Potentiometer 10k', sl: 'Potenciometer 10k' }, quantity: 1, notes: { de: 'Empfindlichkeit', en: 'Sensitivity', sl: 'Občutljivost' } },
    { name: { de: 'LED 3mm grün', en: 'LED 3mm green', sl: 'LED 3mm zelena' }, quantity: 1, notes: { de: 'Signal-Anzeige', en: 'Signal indicator', sl: 'Indikator signala' } },
    { name: { de: 'Widerstand 220 Ohm', en: 'Resistor 220 Ohm', sl: 'Upor 220 Ohm' }, quantity: 1 },
    { name: { de: 'Kondensator 100nF', en: 'Capacitor 100nF', sl: 'Kondenzator 100nF' }, quantity: 2 },
    { name: { de: 'Klinkenbuchse 3.5mm', en: '3.5mm jack socket', sl: '3.5mm vtičnica' }, quantity: 1, notes: { de: 'Audio-Eingang', en: 'Audio input', sl: 'Avdio vhod' } },
  ],
  estimatedCost: '~18€',

  code: {
    de: `// =====================================================
// Morsedecoder - FunkPilot Bastelprojekt
// Hardware: Arduino Nano + SSD1306 OLED + Mikrofon
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED Konfiguration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Pin-Belegung
const int AUDIO_PIN = A0;      // Audio-Eingang
const int THRESH_PIN = A1;     // Schwellwert-Poti
const int LED_PIN = 6;         // Signal-LED

// Morse-Timing (wird automatisch angepasst)
int ditLength = 60;            // Basis DIT-Länge in ms
int threshold = 512;           // Audio-Schwellwert

// Morse-Dekodierung
String currentCode = "";
String decodedText = "";
unsigned long lastSignal = 0;
unsigned long signalStart = 0;
bool signalActive = false;

// Morse-Tabelle
const char* morseTable[] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..",    // A-I
  ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.",  // J-R
  "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."          // S-Z
};
const char* numberTable[] = {
  "-----", ".----", "..---", "...--", "....-",  // 0-4
  ".....", "-....", "--...", "---..", "----."   // 5-9
};

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED nicht gefunden!"));
    while (1);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 25);
  display.println(F("Morsedecoder v1.0"));
  display.setCursor(20, 40);
  display.println(F("FunkPilot"));
  display.display();
  delay(2000);

  display.clearDisplay();
  display.display();
}

void loop() {
  // Schwellwert vom Poti lesen
  threshold = map(analogRead(THRESH_PIN), 0, 1023, 300, 700);

  // Audio-Signal lesen
  int audioLevel = analogRead(AUDIO_PIN);
  bool signal = audioLevel > threshold;

  // LED anzeigen
  digitalWrite(LED_PIN, signal ? HIGH : LOW);

  unsigned long now = millis();

  if (signal && !signalActive) {
    // Signal beginnt
    signalActive = true;
    signalStart = now;

    // Pause zwischen Zeichen prüfen
    unsigned long pauseLength = now - lastSignal;
    if (pauseLength > ditLength * 2 && pauseLength < ditLength * 5) {
      // Pause zwischen Buchstaben
      decodeAndAdd();
    } else if (pauseLength > ditLength * 5 && currentCode.length() == 0) {
      // Pause zwischen Wörtern
      if (decodedText.length() > 0 && !decodedText.endsWith(" ")) {
        decodedText += " ";
        updateDisplay();
      }
    }
  }
  else if (!signal && signalActive) {
    // Signal endet
    signalActive = false;
    lastSignal = now;

    unsigned long signalLength = now - signalStart;

    // DIT oder DAH?
    if (signalLength > 20) { // Mindestlänge
      if (signalLength < ditLength * 2) {
        currentCode += ".";
        // DIT-Länge anpassen (adaptive Geschwindigkeit)
        ditLength = (ditLength * 3 + signalLength) / 4;
      } else {
        currentCode += "-";
        // DAH = 3x DIT
        ditLength = (ditLength * 3 + signalLength / 3) / 4;
      }
    }
  }

  // Timeout für Buchstaben-Ende
  if (!signalActive && currentCode.length() > 0 && (now - lastSignal) > ditLength * 3) {
    decodeAndAdd();
  }

  delay(5);
}

void decodeAndAdd() {
  if (currentCode.length() == 0) return;

  char decoded = decodeMorse(currentCode);
  if (decoded != '?') {
    decodedText += decoded;

    // Text auf 4 Zeilen begrenzen
    if (decodedText.length() > 84) {
      decodedText = decodedText.substring(decodedText.length() - 84);
    }

    updateDisplay();
  }

  Serial.print(currentCode);
  Serial.print(" = ");
  Serial.println(decoded);

  currentCode = "";
}

char decodeMorse(String code) {
  // Buchstaben A-Z
  for (int i = 0; i < 26; i++) {
    if (code == morseTable[i]) {
      return 'A' + i;
    }
  }

  // Zahlen 0-9
  for (int i = 0; i < 10; i++) {
    if (code == numberTable[i]) {
      return '0' + i;
    }
  }

  // Sonderzeichen
  if (code == ".-.-.-") return '.';
  if (code == "--..--") return ',';
  if (code == "..--..") return '?';
  if (code == ".----.") return '\\'';
  if (code == "-.-.--") return '!';
  if (code == "-..-.") return '/';
  if (code == "-.--.") return '(';
  if (code == "-.--.-") return ')';
  if (code == ".-...") return '&';
  if (code == "---...") return ':';
  if (code == "-.-.-.") return ';';
  if (code == "-...-") return '=';
  if (code == ".-.-.") return '+';
  if (code == "-....-") return '-';
  if (code == "..--.-") return '_';
  if (code == ".-..-.") return '"';
  if (code == "...-..-") return '$';
  if (code == ".--.-.") return '@';

  return '?';
}

void updateDisplay() {
  display.clearDisplay();

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("CW Decoder "));
  display.print(1200 / ditLength);
  display.println(F(" WPM"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Aktueller Code
  display.setCursor(0, 14);
  display.print(F("Code: "));
  display.println(currentCode);

  // Dekodierter Text (mehrzeilig)
  display.setCursor(0, 26);
  display.println(decodedText);

  display.display();
}
`,
    en: `// =====================================================
// Morse Decoder - FunkPilot DIY Project
// Hardware: Arduino Nano + SSD1306 OLED + Microphone
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Pin assignments
const int AUDIO_PIN = A0;      // Audio input
const int THRESH_PIN = A1;     // Threshold potentiometer
const int LED_PIN = 6;         // Signal LED

// Morse timing (automatically adjusted)
int ditLength = 60;            // Base DIT length in ms
int threshold = 512;           // Audio threshold

// Morse decoding
String currentCode = "";
String decodedText = "";
unsigned long lastSignal = 0;
unsigned long signalStart = 0;
bool signalActive = false;

// Morse table
const char* morseTable[] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..",    // A-I
  ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.",  // J-R
  "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."          // S-Z
};
const char* numberTable[] = {
  "-----", ".----", "..---", "...--", "....-",  // 0-4
  ".....", "-....", "--...", "---..", "----."   // 5-9
};

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED not found!"));
    while (1);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 25);
  display.println(F("Morse Decoder v1.0"));
  display.setCursor(20, 40);
  display.println(F("FunkPilot"));
  display.display();
  delay(2000);

  display.clearDisplay();
  display.display();
}

void loop() {
  // Read threshold from potentiometer
  threshold = map(analogRead(THRESH_PIN), 0, 1023, 300, 700);

  // Read audio signal
  int audioLevel = analogRead(AUDIO_PIN);
  bool signal = audioLevel > threshold;

  // Show LED
  digitalWrite(LED_PIN, signal ? HIGH : LOW);

  unsigned long now = millis();

  if (signal && !signalActive) {
    // Signal starts
    signalActive = true;
    signalStart = now;

    // Check pause between characters
    unsigned long pauseLength = now - lastSignal;
    if (pauseLength > ditLength * 2 && pauseLength < ditLength * 5) {
      // Pause between letters
      decodeAndAdd();
    } else if (pauseLength > ditLength * 5 && currentCode.length() == 0) {
      // Pause between words
      if (decodedText.length() > 0 && !decodedText.endsWith(" ")) {
        decodedText += " ";
        updateDisplay();
      }
    }
  }
  else if (!signal && signalActive) {
    // Signal ends
    signalActive = false;
    lastSignal = now;

    unsigned long signalLength = now - signalStart;

    // DIT or DAH?
    if (signalLength > 20) { // Minimum length
      if (signalLength < ditLength * 2) {
        currentCode += ".";
        // Adjust DIT length (adaptive speed)
        ditLength = (ditLength * 3 + signalLength) / 4;
      } else {
        currentCode += "-";
        // DAH = 3x DIT
        ditLength = (ditLength * 3 + signalLength / 3) / 4;
      }
    }
  }

  // Timeout for letter end
  if (!signalActive && currentCode.length() > 0 && (now - lastSignal) > ditLength * 3) {
    decodeAndAdd();
  }

  delay(5);
}

void decodeAndAdd() {
  if (currentCode.length() == 0) return;

  char decoded = decodeMorse(currentCode);
  if (decoded != '?') {
    decodedText += decoded;

    // Limit text to 4 lines
    if (decodedText.length() > 84) {
      decodedText = decodedText.substring(decodedText.length() - 84);
    }

    updateDisplay();
  }

  Serial.print(currentCode);
  Serial.print(" = ");
  Serial.println(decoded);

  currentCode = "";
}

char decodeMorse(String code) {
  // Letters A-Z
  for (int i = 0; i < 26; i++) {
    if (code == morseTable[i]) {
      return 'A' + i;
    }
  }

  // Numbers 0-9
  for (int i = 0; i < 10; i++) {
    if (code == numberTable[i]) {
      return '0' + i;
    }
  }

  // Special characters
  if (code == ".-.-.-") return '.';
  if (code == "--..--") return ',';
  if (code == "..--..") return '?';
  if (code == ".----.") return '\\'';
  if (code == "-.-.--") return '!';
  if (code == "-..-.") return '/';
  if (code == "-.--.") return '(';
  if (code == "-.--.-") return ')';
  if (code == ".-...") return '&';
  if (code == "---...") return ':';
  if (code == "-.-.-.") return ';';
  if (code == "-...-") return '=';
  if (code == ".-.-.") return '+';
  if (code == "-....-") return '-';
  if (code == "..--.-") return '_';
  if (code == ".-..-.") return '"';
  if (code == "...-..-") return '$';
  if (code == ".--.-.") return '@';

  return '?';
}

void updateDisplay() {
  display.clearDisplay();

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("CW Decoder "));
  display.print(1200 / ditLength);
  display.println(F(" WPM"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Current code
  display.setCursor(0, 14);
  display.print(F("Code: "));
  display.println(currentCode);

  // Decoded text (multiline)
  display.setCursor(0, 26);
  display.println(decodedText);

  display.display();
}
`,
    sl: `// =====================================================
// Morsov dekoder - FunkPilot DIY projekt
// Strojna oprema: Arduino Nano + SSD1306 OLED + Mikrofon
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED konfiguracija
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Dodelitev pinov
const int AUDIO_PIN = A0;      // Avdio vhod
const int THRESH_PIN = A1;     // Potenciometer za prag
const int LED_PIN = 6;         // Signal LED

// Morsov timing (samodejno prilagojen)
int ditLength = 60;            // Osnovna DIT dolžina v ms
int threshold = 512;           // Avdio prag

// Morsovo dekodiranje
String currentCode = "";
String decodedText = "";
unsigned long lastSignal = 0;
unsigned long signalStart = 0;
bool signalActive = false;

// Morsova tabela
const char* morseTable[] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..",    // A-I
  ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.",  // J-R
  "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."          // S-Z
};
const char* numberTable[] = {
  "-----", ".----", "..---", "...--", "....-",  // 0-4
  ".....", "-....", "--...", "---..", "----."   // 5-9
};

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED ni najden!"));
    while (1);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 25);
  display.println(F("Morsov dekoder v1.0"));
  display.setCursor(20, 40);
  display.println(F("FunkPilot"));
  display.display();
  delay(2000);

  display.clearDisplay();
  display.display();
}

void loop() {
  // Preberi prag iz potenciometra
  threshold = map(analogRead(THRESH_PIN), 0, 1023, 300, 700);

  // Preberi avdio signal
  int audioLevel = analogRead(AUDIO_PIN);
  bool signal = audioLevel > threshold;

  // Prikaži LED
  digitalWrite(LED_PIN, signal ? HIGH : LOW);

  unsigned long now = millis();

  if (signal && !signalActive) {
    // Signal se začne
    signalActive = true;
    signalStart = now;

    // Preveri premor med znaki
    unsigned long pauseLength = now - lastSignal;
    if (pauseLength > ditLength * 2 && pauseLength < ditLength * 5) {
      // Premor med črkami
      decodeAndAdd();
    } else if (pauseLength > ditLength * 5 && currentCode.length() == 0) {
      // Premor med besedami
      if (decodedText.length() > 0 && !decodedText.endsWith(" ")) {
        decodedText += " ";
        updateDisplay();
      }
    }
  }
  else if (!signal && signalActive) {
    // Signal se konča
    signalActive = false;
    lastSignal = now;

    unsigned long signalLength = now - signalStart;

    // DIT ali DAH?
    if (signalLength > 20) { // Minimalna dolžina
      if (signalLength < ditLength * 2) {
        currentCode += ".";
        // Prilagodi DIT dolžino (adaptivna hitrost)
        ditLength = (ditLength * 3 + signalLength) / 4;
      } else {
        currentCode += "-";
        // DAH = 3x DIT
        ditLength = (ditLength * 3 + signalLength / 3) / 4;
      }
    }
  }

  // Timeout za konec črke
  if (!signalActive && currentCode.length() > 0 && (now - lastSignal) > ditLength * 3) {
    decodeAndAdd();
  }

  delay(5);
}

void decodeAndAdd() {
  if (currentCode.length() == 0) return;

  char decoded = decodeMorse(currentCode);
  if (decoded != '?') {
    decodedText += decoded;

    // Omejitev besedila na 4 vrstice
    if (decodedText.length() > 84) {
      decodedText = decodedText.substring(decodedText.length() - 84);
    }

    updateDisplay();
  }

  Serial.print(currentCode);
  Serial.print(" = ");
  Serial.println(decoded);

  currentCode = "";
}

char decodeMorse(String code) {
  // Črke A-Z
  for (int i = 0; i < 26; i++) {
    if (code == morseTable[i]) {
      return 'A' + i;
    }
  }

  // Številke 0-9
  for (int i = 0; i < 10; i++) {
    if (code == numberTable[i]) {
      return '0' + i;
    }
  }

  // Posebni znaki
  if (code == ".-.-.-") return '.';
  if (code == "--..--") return ',';
  if (code == "..--..") return '?';
  if (code == ".----.") return '\\'';
  if (code == "-.-.--") return '!';
  if (code == "-..-.") return '/';
  if (code == "-.--.") return '(';
  if (code == "-.--.-") return ')';
  if (code == ".-...") return '&';
  if (code == "---...") return ':';
  if (code == "-.-.-.") return ';';
  if (code == "-...-") return '=';
  if (code == ".-.-.") return '+';
  if (code == "-....-") return '-';
  if (code == "..--.-") return '_';
  if (code == ".-..-.") return '"';
  if (code == "...-..-") return '$';
  if (code == ".--.-.") return '@';

  return '?';
}

void updateDisplay() {
  display.clearDisplay();

  // Glava
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("CW Decoder "));
  display.print(1200 / ditLength);
  display.println(F(" WPM"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Trenutna koda
  display.setCursor(0, 14);
  display.print(F("Koda: "));
  display.println(currentCode);

  // Dekodirano besedilo (večvrstično)
  display.setCursor(0, 26);
  display.println(decodedText);

  display.display();
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'morse_decoder.ino',

  wiring: [
    { from: { de: 'Arduino A0', en: 'Arduino A0', sl: 'Arduino A0' }, to: { de: 'Mikrofon OUT', en: 'Microphone OUT', sl: 'Mikrofon OUT' }, color: 'Blau', notes: { de: 'Audio-Signal', en: 'Audio signal', sl: 'Avdio signal' } },
    { from: { de: 'Arduino A1', en: 'Arduino A1', sl: 'Arduino A1' }, to: { de: 'Poti Schleifer', en: 'Pot wiper', sl: 'Pot drsnik' }, color: 'Weiß', notes: { de: 'Empfindlichkeit', en: 'Sensitivity', sl: 'Občutljivost' } },
    { from: { de: 'Arduino A4 (SDA)', en: 'Arduino A4 (SDA)', sl: 'Arduino A4 (SDA)' }, to: { de: 'OLED SDA', en: 'OLED SDA', sl: 'OLED SDA' }, color: 'Grün' },
    { from: { de: 'Arduino A5 (SCL)', en: 'Arduino A5 (SCL)', sl: 'Arduino A5 (SCL)' }, to: { de: 'OLED SCL', en: 'OLED SCL', sl: 'OLED SCL' }, color: 'Gelb' },
    { from: { de: 'Arduino D6', en: 'Arduino D6', sl: 'Arduino D6' }, to: { de: 'LED Anode', en: 'LED anode', sl: 'LED anoda' }, color: 'Orange', notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' } },
    { from: { de: 'Arduino 5V', en: 'Arduino 5V', sl: 'Arduino 5V' }, to: { de: 'OLED VCC + Mikrofon VCC', en: 'OLED VCC + Microphone VCC', sl: 'OLED VCC + Mikrofon VCC' }, color: 'Rot' },
    { from: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' }, to: { de: 'Alle GND', en: 'All GND', sl: 'Vsi GND' }, color: 'Schwarz' },
    { from: { de: 'Klinkenbuchse', en: 'Jack socket', sl: 'Vtičnica' }, to: { de: 'Mikrofon IN', en: 'Microphone IN', sl: 'Mikrofon IN' }, notes: { de: 'Audio vom Empfänger', en: 'Audio from receiver', sl: 'Avdio iz sprejemnika' } },
  ],

  customizationSuggestions: [
    { de: 'Goertzel-Algorithmus für bessere Tonerkennung', en: 'Goertzel algorithm for better tone detection', sl: 'Goertzelov algoritem za boljše zaznavanje tona' },
    { de: 'Einstellbare Tonfrequenz (600-800 Hz Filter)', en: 'Adjustable tone frequency (600-800 Hz filter)', sl: 'Nastavljiva frekvenca tona (600-800 Hz filter)' },
    { de: 'Speicherung der letzten 10 QSOs', en: 'Storage of last 10 QSOs', sl: 'Shranjevanje zadnjih 10 QSO-jev' },
    { de: 'USB-Ausgabe für PC-Logging', en: 'USB output for PC logging', sl: 'USB izhod za PC beleženje' },
    { de: 'Automatische Geschwindigkeitserkennung verbessern', en: 'Improve automatic speed detection', sl: 'Izboljšaj samodejno zaznavanje hitrosti' },
  ],

  externalLinks: [
    { title: { de: 'Morse-Code Tabelle', en: 'Morse Code Table', sl: 'Morsova kodna tabela' }, url: 'https://morsecode.world/international/morse.html' },
  ],
};
