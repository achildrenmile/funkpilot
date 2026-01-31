import type { HamProject } from '../../types/projects';

export const morseTrainer: HamProject = {
  id: 'morse-trainer',
  name: 'CW-Übungsgenerator',
  category: 'cw-morse',
  difficulty: 1,
  description: 'Generiert zufällige Morsezeichen zum Üben. Einstellbare Geschwindigkeit (5-35 WPM), wählbare Zeichengruppen (Buchstaben, Zahlen, Sonderzeichen). Mit Koch-Methode Unterstützung.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'Piezo Buzzer', quantity: 1, notes: 'oder kleiner Lautsprecher' },
    { name: 'OLED Display 0.96"', quantity: 1, notes: 'optional, für Anzeige' },
    { name: 'Taster', quantity: 3, notes: 'Start/Stop, Speed+, Speed-' },
    { name: 'Potentiometer 10k', quantity: 1, notes: 'Lautstärke' },
    { name: 'Widerstand 1k', quantity: 3 },
  ],
  estimatedCost: '~12€',

  code: `// =====================================================
// CW-Übungsgenerator - FunkPilot Bastelprojekt
// Hardware: Arduino Nano + Buzzer + OLED
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Pins
const int BUZZER_PIN = 5;
const int BTN_START = 2;
const int BTN_SPEED_UP = 3;
const int BTN_SPEED_DOWN = 4;

// Einstellungen
int wpm = 15;
int sidetoneFreq = 700;
int ditLength;
bool running = false;

// Zeichensätze
const char* LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const char* NUMBERS = "0123456789";
const char* KOCH_ORDER = "KMRSUAPTLOWI.NJEF0YVG5/Q9ZH38B?427C1D6X"; // Koch-Methode

// Morse-Codes
const char* morseCodes[] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..",    // A-I
  ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.",  // J-R
  "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."          // S-Z
};
const char* numberCodes[] = {
  "-----", ".----", "..---", "...--", "....-",
  ".....", "-....", "--...", "---..", "----."
};

// Aktueller Modus
int kochLevel = 2;  // Anzahl Zeichen bei Koch-Methode
String currentChar = "";
int charIndex = 0;

void setup() {
  Serial.begin(9600);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BTN_START, INPUT_PULLUP);
  pinMode(BTN_SPEED_UP, INPUT_PULLUP);
  pinMode(BTN_SPEED_DOWN, INPUT_PULLUP);

  randomSeed(analogRead(A0));
  updateDitLength();

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED nicht gefunden"));
    while(1);
  }

  showWelcome();
}

void loop() {
  // Taster abfragen
  if (!digitalRead(BTN_START)) {
    delay(50);
    while(!digitalRead(BTN_START));
    running = !running;
    updateDisplay();
    delay(200);
  }

  if (!digitalRead(BTN_SPEED_UP)) {
    delay(50);
    while(!digitalRead(BTN_SPEED_UP));
    if (wpm < 35) {
      wpm += 2;
      updateDitLength();
      updateDisplay();
    }
    delay(100);
  }

  if (!digitalRead(BTN_SPEED_DOWN)) {
    delay(50);
    while(!digitalRead(BTN_SPEED_DOWN));
    if (wpm > 5) {
      wpm -= 2;
      updateDitLength();
      updateDisplay();
    }
    delay(100);
  }

  // Zeichen generieren wenn aktiv
  if (running) {
    generateRandomChar();
    delay(ditLength * 3);  // Pause zwischen Zeichen

    charIndex++;
    if (charIndex >= 5) {
      charIndex = 0;
      delay(ditLength * 7);  // Längere Pause alle 5 Zeichen
    }
  }
}

void updateDitLength() {
  ditLength = 1200 / wpm;
}

void generateRandomChar() {
  // Koch-Methode: nur die ersten kochLevel Zeichen verwenden
  int maxIdx = min(kochLevel, (int)strlen(KOCH_ORDER));
  int idx = random(0, maxIdx);
  char c = KOCH_ORDER[idx];

  currentChar = String(c);
  updateDisplay();

  // Morse-Code für dieses Zeichen finden und senden
  String code = getMorseCode(c);
  playMorse(code);

  Serial.print(c);
  Serial.print(" ");
}

String getMorseCode(char c) {
  if (c >= 'A' && c <= 'Z') {
    return morseCodes[c - 'A'];
  }
  if (c >= '0' && c <= '9') {
    return numberCodes[c - '0'];
  }
  if (c == '.') return ".-.-.-";
  if (c == ',') return "--..--";
  if (c == '?') return "..--..";
  if (c == '/') return "-..-.";
  if (c == '=') return "-...-";
  return "";
}

void playMorse(String code) {
  for (int i = 0; i < code.length(); i++) {
    if (code[i] == '.') {
      tone(BUZZER_PIN, sidetoneFreq);
      delay(ditLength);
      noTone(BUZZER_PIN);
    } else if (code[i] == '-') {
      tone(BUZZER_PIN, sidetoneFreq);
      delay(ditLength * 3);
      noTone(BUZZER_PIN);
    }
    delay(ditLength);  // Pause zwischen Elementen
  }
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(15, 20);
  display.println(F("CW Trainer v1.0"));
  display.setCursor(25, 35);
  display.println(F("FunkPilot"));
  display.setCursor(10, 50);
  display.println(F("START druecken"));
  display.display();
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setCursor(0, 0);
  display.print(F("CW Trainer  "));
  display.print(wpm);
  display.println(F(" WPM"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Status
  display.setCursor(0, 15);
  display.print(F("Status: "));
  display.println(running ? F("LAEUFT") : F("PAUSE"));

  // Koch Level
  display.setCursor(0, 27);
  display.print(F("Koch Level: "));
  display.print(kochLevel);
  display.print(F(" ("));
  for (int i = 0; i < min(kochLevel, 8); i++) {
    display.print(KOCH_ORDER[i]);
  }
  if (kochLevel > 8) display.print(F("..."));
  display.println(F(")"));

  // Aktuelles Zeichen gross
  if (running && currentChar.length() > 0) {
    display.setTextSize(3);
    display.setCursor(50, 40);
    display.println(currentChar);
  }

  display.display();
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'morse_trainer.ino',

  wiring: [
    { from: 'Arduino D2', to: 'Taster Start', color: 'Gelb', notes: 'nach GND' },
    { from: 'Arduino D3', to: 'Taster Speed+', color: 'Grün', notes: 'nach GND' },
    { from: 'Arduino D4', to: 'Taster Speed-', color: 'Blau', notes: 'nach GND' },
    { from: 'Arduino D5', to: 'Buzzer +', color: 'Orange' },
    { from: 'Arduino A4 (SDA)', to: 'OLED SDA', color: 'Weiß' },
    { from: 'Arduino A5 (SCL)', to: 'OLED SCL', color: 'Grau' },
    { from: 'Arduino 5V', to: 'OLED VCC', color: 'Rot' },
    { from: 'Arduino GND', to: 'Alle GND + Buzzer -', color: 'Schwarz' },
  ],

  customizationSuggestions: [
    'Farnsworth-Timing für Anfänger',
    'QSO-Simulation mit typischen Phrasen',
    'Rufzeichen-Generator (zufällige Calls)',
    'Statistik: Erfolgsquote speichern',
    'Bluetooth für Handy-App Steuerung',
  ],

  externalLinks: [
    { title: 'Koch-Methode erklärt', url: 'https://www.qsl.net/n1irz/finley.morse.html' },
    { title: 'LCWO Online CW Trainer', url: 'https://lcwo.net/' },
  ],
};
