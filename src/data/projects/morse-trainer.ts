import type { HamProject } from '../../types/projects';

export const morseTrainer: HamProject = {
  id: 'morse-trainer',
  name: {
    de: 'CW-Übungsgenerator',
    en: 'CW Practice Generator',
    sl: 'Generator za vadbo CW',
  },
  category: 'cw-morse',
  difficulty: 1,
  description: {
    de: 'Generiert zufällige Morsezeichen zum Üben. Einstellbare Geschwindigkeit (5-35 WPM), wählbare Zeichengruppen (Buchstaben, Zahlen, Sonderzeichen). Mit Koch-Methode Unterstützung.',
    en: 'Generates random Morse characters for practice. Adjustable speed (5-35 WPM), selectable character groups (letters, numbers, special characters). With Koch method support.',
    sl: 'Generira naključne Morsejeve znake za vadbo. Nastavljiva hitrost (5-35 WPM), izbirne skupine znakov (črke, številke, posebni znaki). S podporo Koch metode.',
  },
  hardware: 'arduino-nano',

  components: [
    {
      name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' },
      quantity: 1,
    },
    {
      name: { de: 'Piezo Buzzer', en: 'Piezo Buzzer', sl: 'Piezo brenčač' },
      quantity: 1,
      notes: {
        de: 'oder kleiner Lautsprecher',
        en: 'or small speaker',
        sl: 'ali majhen zvočnik',
      },
    },
    {
      name: { de: 'OLED Display 0.96"', en: 'OLED Display 0.96"', sl: 'OLED zaslon 0.96"' },
      quantity: 1,
      notes: {
        de: 'optional, für Anzeige',
        en: 'optional, for display',
        sl: 'opcijsko, za prikaz',
      },
    },
    {
      name: { de: 'Taster', en: 'Push Button', sl: 'Tipka' },
      quantity: 3,
      notes: {
        de: 'Start/Stop, Speed+, Speed-',
        en: 'Start/Stop, Speed+, Speed-',
        sl: 'Start/Stop, Speed+, Speed-',
      },
    },
    {
      name: { de: 'Potentiometer 10k', en: 'Potentiometer 10k', sl: 'Potenciometer 10k' },
      quantity: 1,
      notes: {
        de: 'Lautstärke',
        en: 'Volume',
        sl: 'Glasnost',
      },
    },
    {
      name: { de: 'Widerstand 1k', en: 'Resistor 1k', sl: 'Upor 1k' },
      quantity: 3,
    },
  ],
  estimatedCost: '~12€',

  code: {
    de: `// =====================================================
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
    en: `// =====================================================
// CW Practice Generator - FunkPilot DIY Project
// Hardware: Arduino Nano + Buzzer + OLED
// Author: FunkPilot / OE8YML
// License: MIT
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

// Settings
int wpm = 15;
int sidetoneFreq = 700;
int ditLength;
bool running = false;

// Character sets
const char* LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const char* NUMBERS = "0123456789";
const char* KOCH_ORDER = "KMRSUAPTLOWI.NJEF0YVG5/Q9ZH38B?427C1D6X"; // Koch method

// Morse codes
const char* morseCodes[] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..",    // A-I
  ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.",  // J-R
  "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."          // S-Z
};
const char* numberCodes[] = {
  "-----", ".----", "..---", "...--", "....-",
  ".....", "-....", "--...", "---..", "----."
};

// Current mode
int kochLevel = 2;  // Number of characters for Koch method
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
    Serial.println(F("OLED not found"));
    while(1);
  }

  showWelcome();
}

void loop() {
  // Check buttons
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

  // Generate characters when active
  if (running) {
    generateRandomChar();
    delay(ditLength * 3);  // Pause between characters

    charIndex++;
    if (charIndex >= 5) {
      charIndex = 0;
      delay(ditLength * 7);  // Longer pause every 5 characters
    }
  }
}

void updateDitLength() {
  ditLength = 1200 / wpm;
}

void generateRandomChar() {
  // Koch method: only use first kochLevel characters
  int maxIdx = min(kochLevel, (int)strlen(KOCH_ORDER));
  int idx = random(0, maxIdx);
  char c = KOCH_ORDER[idx];

  currentChar = String(c);
  updateDisplay();

  // Find and send Morse code for this character
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
    delay(ditLength);  // Pause between elements
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
  display.println(F("Press START"));
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
  display.println(running ? F("RUNNING") : F("PAUSE"));

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

  // Current character large
  if (running && currentChar.length() > 0) {
    display.setTextSize(3);
    display.setCursor(50, 40);
    display.println(currentChar);
  }

  display.display();
}
`,
    sl: `// =====================================================
// Generator za vadbo CW - FunkPilot DIY projekt
// Strojna oprema: Arduino Nano + Brenčač + OLED
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Pini
const int BUZZER_PIN = 5;
const int BTN_START = 2;
const int BTN_SPEED_UP = 3;
const int BTN_SPEED_DOWN = 4;

// Nastavitve
int wpm = 15;
int sidetoneFreq = 700;
int ditLength;
bool running = false;

// Nabori znakov
const char* LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const char* NUMBERS = "0123456789";
const char* KOCH_ORDER = "KMRSUAPTLOWI.NJEF0YVG5/Q9ZH38B?427C1D6X"; // Koch metoda

// Morsejeve kode
const char* morseCodes[] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..",    // A-I
  ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.",  // J-R
  "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."          // S-Z
};
const char* numberCodes[] = {
  "-----", ".----", "..---", "...--", "....-",
  ".....", "-....", "--...", "---..", "----."
};

// Trenutni nacin
int kochLevel = 2;  // Stevilo znakov za Koch metodo
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
    Serial.println(F("OLED ni najden"));
    while(1);
  }

  showWelcome();
}

void loop() {
  // Preveri tipke
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

  // Generiraj znake ko je aktivno
  if (running) {
    generateRandomChar();
    delay(ditLength * 3);  // Premor med znaki

    charIndex++;
    if (charIndex >= 5) {
      charIndex = 0;
      delay(ditLength * 7);  // Daljsi premor vsakih 5 znakov
    }
  }
}

void updateDitLength() {
  ditLength = 1200 / wpm;
}

void generateRandomChar() {
  // Koch metoda: uporabi samo prvih kochLevel znakov
  int maxIdx = min(kochLevel, (int)strlen(KOCH_ORDER));
  int idx = random(0, maxIdx);
  char c = KOCH_ORDER[idx];

  currentChar = String(c);
  updateDisplay();

  // Najdi in posli Morsejevo kodo za ta znak
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
    delay(ditLength);  // Premor med elementi
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
  display.println(F("Pritisni START"));
  display.display();
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // Glava
  display.setCursor(0, 0);
  display.print(F("CW Trainer  "));
  display.print(wpm);
  display.println(F(" WPM"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Status
  display.setCursor(0, 15);
  display.print(F("Status: "));
  display.println(running ? F("TECE") : F("PREMOR"));

  // Koch nivo
  display.setCursor(0, 27);
  display.print(F("Koch nivo: "));
  display.print(kochLevel);
  display.print(F(" ("));
  for (int i = 0; i < min(kochLevel, 8); i++) {
    display.print(KOCH_ORDER[i]);
  }
  if (kochLevel > 8) display.print(F("..."));
  display.println(F(")"));

  // Trenutni znak velik
  if (running && currentChar.length() > 0) {
    display.setTextSize(3);
    display.setCursor(50, 40);
    display.println(currentChar);
  }

  display.display();
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'morse_trainer.ino',

  wiring: [
    {
      from: { de: 'Arduino D2', en: 'Arduino D2', sl: 'Arduino D2' },
      to: { de: 'Taster Start', en: 'Start Button', sl: 'Tipka Start' },
      color: 'Gelb',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' },
    },
    {
      from: { de: 'Arduino D3', en: 'Arduino D3', sl: 'Arduino D3' },
      to: { de: 'Taster Speed+', en: 'Speed+ Button', sl: 'Tipka Speed+' },
      color: 'Grün',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' },
    },
    {
      from: { de: 'Arduino D4', en: 'Arduino D4', sl: 'Arduino D4' },
      to: { de: 'Taster Speed-', en: 'Speed- Button', sl: 'Tipka Speed-' },
      color: 'Blau',
      notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' },
    },
    {
      from: { de: 'Arduino D5', en: 'Arduino D5', sl: 'Arduino D5' },
      to: { de: 'Buzzer +', en: 'Buzzer +', sl: 'Brenčač +' },
      color: 'Orange',
    },
    {
      from: { de: 'Arduino A4 (SDA)', en: 'Arduino A4 (SDA)', sl: 'Arduino A4 (SDA)' },
      to: { de: 'OLED SDA', en: 'OLED SDA', sl: 'OLED SDA' },
      color: 'Weiß',
    },
    {
      from: { de: 'Arduino A5 (SCL)', en: 'Arduino A5 (SCL)', sl: 'Arduino A5 (SCL)' },
      to: { de: 'OLED SCL', en: 'OLED SCL', sl: 'OLED SCL' },
      color: 'Grau',
    },
    {
      from: { de: 'Arduino 5V', en: 'Arduino 5V', sl: 'Arduino 5V' },
      to: { de: 'OLED VCC', en: 'OLED VCC', sl: 'OLED VCC' },
      color: 'Rot',
    },
    {
      from: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' },
      to: { de: 'Alle GND + Buzzer -', en: 'All GND + Buzzer -', sl: 'Vsi GND + Brenčač -' },
      color: 'Schwarz',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Farnsworth-Timing für Anfänger',
      en: 'Farnsworth timing for beginners',
      sl: 'Farnsworth casovna razporeditev za zacetnike',
    },
    {
      de: 'QSO-Simulation mit typischen Phrasen',
      en: 'QSO simulation with typical phrases',
      sl: 'QSO simulacija s tipicnimi frazami',
    },
    {
      de: 'Rufzeichen-Generator (zufällige Calls)',
      en: 'Callsign generator (random calls)',
      sl: 'Generator klicnih znakov (nakljucni klici)',
    },
    {
      de: 'Statistik: Erfolgsquote speichern',
      en: 'Statistics: save success rate',
      sl: 'Statistika: shrani stopnjo uspesnosti',
    },
    {
      de: 'Bluetooth für Handy-App Steuerung',
      en: 'Bluetooth for mobile app control',
      sl: 'Bluetooth za nadzor z mobilno aplikacijo',
    },
  ],

  externalLinks: [
    {
      title: {
        de: 'Koch-Methode erklärt',
        en: 'Koch method explained',
        sl: 'Koch metoda razlozena',
      },
      url: 'https://www.qsl.net/n1irz/finley.morse.html',
    },
    {
      title: {
        de: 'LCWO Online CW Trainer',
        en: 'LCWO Online CW Trainer',
        sl: 'LCWO spletni CW trener',
      },
      url: 'https://lcwo.net/',
    },
  ],
};
