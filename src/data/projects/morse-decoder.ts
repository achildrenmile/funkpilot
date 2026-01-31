import type { HamProject } from '../../types/projects';

export const morseDecoder: HamProject = {
  id: 'morse-decoder',
  name: 'Morsedecoder',
  category: 'cw-morse',
  difficulty: 2,
  description: 'Dekodiert CW-Signale vom Audioeingang und zeigt den Text auf einem OLED-Display. Einstellbare Empfindlichkeit und WPM-Erkennung. Ideal zum Mitlesen von CW-QSOs.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'OLED Display 0.96" I2C', quantity: 1, notes: 'SSD1306' },
    { name: 'Elektret-Mikrofon mit Verstärker', quantity: 1, notes: 'MAX9814 oder ähnlich' },
    { name: 'Potentiometer 10k', quantity: 1, notes: 'Empfindlichkeit' },
    { name: 'LED 3mm grün', quantity: 1, notes: 'Signal-Anzeige' },
    { name: 'Widerstand 220 Ohm', quantity: 1 },
    { name: 'Kondensator 100nF', quantity: 2 },
    { name: 'Klinkenbuchse 3.5mm', quantity: 1, notes: 'Audio-Eingang' },
  ],
  estimatedCost: '~18€',

  code: `// =====================================================
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
  codeLanguage: 'cpp',
  codeFileName: 'morse_decoder.ino',

  wiring: [
    { from: 'Arduino A0', to: 'Mikrofon OUT', color: 'Blau', notes: 'Audio-Signal' },
    { from: 'Arduino A1', to: 'Poti Schleifer', color: 'Weiß', notes: 'Empfindlichkeit' },
    { from: 'Arduino A4 (SDA)', to: 'OLED SDA', color: 'Grün' },
    { from: 'Arduino A5 (SCL)', to: 'OLED SCL', color: 'Gelb' },
    { from: 'Arduino D6', to: 'LED Anode', color: 'Orange', notes: 'über 220Ω' },
    { from: 'Arduino 5V', to: 'OLED VCC + Mikrofon VCC', color: 'Rot' },
    { from: 'Arduino GND', to: 'Alle GND', color: 'Schwarz' },
    { from: 'Klinkenbuchse', to: 'Mikrofon IN', notes: 'Audio vom Empfänger' },
  ],

  customizationSuggestions: [
    'Goertzel-Algorithmus für bessere Tonerkennung',
    'Einstellbare Tonfrequenz (600-800 Hz Filter)',
    'Speicherung der letzten 10 QSOs',
    'USB-Ausgabe für PC-Logging',
    'Automatische Geschwindigkeitserkennung verbessern',
  ],

  externalLinks: [
    { title: 'Morse-Code Tabelle', url: 'https://morsecode.world/international/morse.html' },
  ],
};
