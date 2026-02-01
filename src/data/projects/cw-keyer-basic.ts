import type { HamProject } from '../../types/projects';

export const cwKeyerBasic: HamProject = {
  id: 'cw-keyer-basic',
  name: {
    de: 'CW-Keyer Basic',
    en: 'CW Keyer Basic',
    sl: 'CW ključar Basic',
  },
  category: 'cw-morse',
  difficulty: 1,
  description: {
    de: 'Einfacher Iambic-A/B Keyer für CW-Betrieb. Geschwindigkeit einstellbar über Potentiometer (10-30 WPM). Seitenton über Piezo-Summer. Perfekt für Einsteiger!',
    en: 'Simple Iambic A/B keyer for CW operation. Speed adjustable via potentiometer (10-30 WPM). Sidetone via piezo buzzer. Perfect for beginners!',
    sl: 'Preprost Iambic A/B ključar za CW operacijo. Hitrost nastavljiva preko potenciometra (10-30 WPM). Stranski ton preko piezo brenčača. Odličen za začetnike!',
  },
  hardware: 'arduino-nano',

  components: [
    { name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' }, quantity: 1 },
    { name: { de: 'Paddle oder 2x Taster', en: 'Paddle or 2x buttons', sl: 'Paddle ali 2x tipka' }, quantity: 1, notes: { de: 'für DIT/DAH', en: 'for DIT/DAH', sl: 'za DIT/DAH' } },
    { name: { de: 'Piezo Buzzer', en: 'Piezo buzzer', sl: 'Piezo brenčač' }, quantity: 1 },
    { name: { de: 'Potentiometer 10k', en: 'Potentiometer 10k', sl: 'Potenciometer 10k' }, quantity: 1, notes: { de: 'für Geschwindigkeit', en: 'for speed', sl: 'za hitrost' } },
    { name: { de: 'Widerstand 1k', en: 'Resistor 1k', sl: 'Upor 1k' }, quantity: 2 },
    { name: { de: 'LED rot 3mm', en: 'LED red 3mm', sl: 'LED rdeča 3mm' }, quantity: 1, notes: { de: 'TX-Anzeige', en: 'TX indicator', sl: 'TX indikator' } },
    { name: { de: 'Klinkenbuchse 3.5mm', en: '3.5mm jack socket', sl: '3.5mm vtičnica' }, quantity: 2, notes: { de: 'Paddle + KEY-Out', en: 'Paddle + KEY-Out', sl: 'Paddle + KEY-Out' } },
    { name: { de: 'Lochrasterplatine', en: 'Perfboard', sl: 'Prototipna plošča' }, quantity: 1 },
  ],
  estimatedCost: '~12€',

  code: {
    de: `// =====================================================
// CW-Keyer Basic - FunkPilot Bastelprojekt
// Hardware: Arduino Nano
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================

// Pin-Belegung
const int DIT_PIN = 2;      // Paddle DIT (active LOW)
const int DAH_PIN = 3;      // Paddle DAH (active LOW)
const int KEY_OUT = 4;      // Ausgang zum Transceiver
const int BUZZER = 5;       // Seitenton-Buzzer
const int LED_TX = 6;       // TX-Anzeige LED
const int SPEED_POT = A0;   // Potentiometer für Geschwindigkeit

// Einstellungen
int wpm = 15;               // Aktuelle Geschwindigkeit
int ditLength;              // DIT-Länge in Millisekunden
bool iambicB = true;        // true = Iambic-B, false = Iambic-A
int sidetoneFreq = 700;     // Seitenton-Frequenz in Hz

// Variablen für Iambic-Logik
bool lastWasDit = false;

void setup() {
  // Pins konfigurieren
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);
  pinMode(KEY_OUT, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_TX, OUTPUT);

  // Initial ausschalten
  digitalWrite(KEY_OUT, LOW);
  digitalWrite(LED_TX, LOW);

  // Geschwindigkeit einlesen
  updateSpeed();

  // Startmelodie (optional)
  playStartupTone();
}

void loop() {
  // Geschwindigkeit aktualisieren
  updateSpeed();

  // Paddle-Status lesen (active LOW durch PULLUP)
  bool ditPressed = !digitalRead(DIT_PIN);
  bool dahPressed = !digitalRead(DAH_PIN);

  // Squeeze-Modus (beide gedrückt)
  if (ditPressed && dahPressed) {
    if (iambicB) {
      // Iambic-B: Alternieren
      if (lastWasDit) {
        sendDah();
        lastWasDit = false;
      } else {
        sendDit();
        lastWasDit = true;
      }
    } else {
      // Iambic-A: Nur aktuelles Element
      sendDit();
    }
  }
  // Nur DIT
  else if (ditPressed) {
    sendDit();
    lastWasDit = true;
  }
  // Nur DAH
  else if (dahPressed) {
    sendDah();
    lastWasDit = false;
  }
}

// Geschwindigkeit aus Poti lesen und berechnen
void updateSpeed() {
  int potValue = analogRead(SPEED_POT);
  // Mapping: 0-1023 -> 10-35 WPM
  wpm = map(potValue, 0, 1023, 10, 35);
  // DIT-Länge berechnen: 1200 / WPM = ms pro DIT
  ditLength = 1200 / wpm;
}

// DIT senden (1 Einheit)
void sendDit() {
  keyDown();
  delay(ditLength);
  keyUp();
  delay(ditLength);  // Pause zwischen Elementen
}

// DAH senden (3 Einheiten)
void sendDah() {
  keyDown();
  delay(ditLength * 3);
  keyUp();
  delay(ditLength);  // Pause zwischen Elementen
}

// Taste drücken (KEY + Ton + LED)
void keyDown() {
  digitalWrite(KEY_OUT, HIGH);
  digitalWrite(LED_TX, HIGH);
  tone(BUZZER, sidetoneFreq);
}

// Taste loslassen
void keyUp() {
  digitalWrite(KEY_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  noTone(BUZZER);
}

// Startmelodie beim Einschalten
void playStartupTone() {
  // "R" in Morse: .-.
  tone(BUZZER, sidetoneFreq);
  delay(100);
  noTone(BUZZER);
  delay(100);
  tone(BUZZER, sidetoneFreq);
  delay(300);
  noTone(BUZZER);
  delay(100);
  tone(BUZZER, sidetoneFreq);
  delay(100);
  noTone(BUZZER);
}
`,
    en: `// =====================================================
// CW Keyer Basic - FunkPilot DIY Project
// Hardware: Arduino Nano
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================

// Pin assignments
const int DIT_PIN = 2;      // Paddle DIT (active LOW)
const int DAH_PIN = 3;      // Paddle DAH (active LOW)
const int KEY_OUT = 4;      // Output to transceiver
const int BUZZER = 5;       // Sidetone buzzer
const int LED_TX = 6;       // TX indicator LED
const int SPEED_POT = A0;   // Potentiometer for speed

// Settings
int wpm = 15;               // Current speed
int ditLength;              // DIT length in milliseconds
bool iambicB = true;        // true = Iambic-B, false = Iambic-A
int sidetoneFreq = 700;     // Sidetone frequency in Hz

// Variables for iambic logic
bool lastWasDit = false;

void setup() {
  // Configure pins
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);
  pinMode(KEY_OUT, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_TX, OUTPUT);

  // Initially off
  digitalWrite(KEY_OUT, LOW);
  digitalWrite(LED_TX, LOW);

  // Read speed
  updateSpeed();

  // Startup melody (optional)
  playStartupTone();
}

void loop() {
  // Update speed
  updateSpeed();

  // Read paddle status (active LOW due to PULLUP)
  bool ditPressed = !digitalRead(DIT_PIN);
  bool dahPressed = !digitalRead(DAH_PIN);

  // Squeeze mode (both pressed)
  if (ditPressed && dahPressed) {
    if (iambicB) {
      // Iambic-B: Alternate
      if (lastWasDit) {
        sendDah();
        lastWasDit = false;
      } else {
        sendDit();
        lastWasDit = true;
      }
    } else {
      // Iambic-A: Current element only
      sendDit();
    }
  }
  // DIT only
  else if (ditPressed) {
    sendDit();
    lastWasDit = true;
  }
  // DAH only
  else if (dahPressed) {
    sendDah();
    lastWasDit = false;
  }
}

// Read speed from potentiometer
void updateSpeed() {
  int potValue = analogRead(SPEED_POT);
  // Mapping: 0-1023 -> 10-35 WPM
  wpm = map(potValue, 0, 1023, 10, 35);
  // Calculate DIT length: 1200 / WPM = ms per DIT
  ditLength = 1200 / wpm;
}

// Send DIT (1 unit)
void sendDit() {
  keyDown();
  delay(ditLength);
  keyUp();
  delay(ditLength);  // Pause between elements
}

// Send DAH (3 units)
void sendDah() {
  keyDown();
  delay(ditLength * 3);
  keyUp();
  delay(ditLength);  // Pause between elements
}

// Key down (KEY + tone + LED)
void keyDown() {
  digitalWrite(KEY_OUT, HIGH);
  digitalWrite(LED_TX, HIGH);
  tone(BUZZER, sidetoneFreq);
}

// Key up
void keyUp() {
  digitalWrite(KEY_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  noTone(BUZZER);
}

// Startup melody
void playStartupTone() {
  // "R" in Morse: .-.
  tone(BUZZER, sidetoneFreq);
  delay(100);
  noTone(BUZZER);
  delay(100);
  tone(BUZZER, sidetoneFreq);
  delay(300);
  noTone(BUZZER);
  delay(100);
  tone(BUZZER, sidetoneFreq);
  delay(100);
  noTone(BUZZER);
}
`,
    sl: `// =====================================================
// CW ključar Basic - FunkPilot DIY projekt
// Strojna oprema: Arduino Nano
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================

// Dodelitev pinov
const int DIT_PIN = 2;      // Paddle DIT (aktiven LOW)
const int DAH_PIN = 3;      // Paddle DAH (aktiven LOW)
const int KEY_OUT = 4;      // Izhod na oddajnik
const int BUZZER = 5;       // Brenčač za stranski ton
const int LED_TX = 6;       // TX indikator LED
const int SPEED_POT = A0;   // Potenciometer za hitrost

// Nastavitve
int wpm = 15;               // Trenutna hitrost
int ditLength;              // Dolžina DIT v milisekundah
bool iambicB = true;        // true = Iambic-B, false = Iambic-A
int sidetoneFreq = 700;     // Frekvenca stranskega tona v Hz

// Spremenljivke za iambic logiko
bool lastWasDit = false;

void setup() {
  // Konfiguracija pinov
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);
  pinMode(KEY_OUT, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_TX, OUTPUT);

  // Začetno stanje - izklopljeno
  digitalWrite(KEY_OUT, LOW);
  digitalWrite(LED_TX, LOW);

  // Preberi hitrost
  updateSpeed();

  // Zagonska melodija (opcijsko)
  playStartupTone();
}

void loop() {
  // Posodobi hitrost
  updateSpeed();

  // Preberi stanje paddle-a (aktiven LOW zaradi PULLUP)
  bool ditPressed = !digitalRead(DIT_PIN);
  bool dahPressed = !digitalRead(DAH_PIN);

  // Squeeze način (oba pritisnjena)
  if (ditPressed && dahPressed) {
    if (iambicB) {
      // Iambic-B: Izmenjuj
      if (lastWasDit) {
        sendDah();
        lastWasDit = false;
      } else {
        sendDit();
        lastWasDit = true;
      }
    } else {
      // Iambic-A: Samo trenutni element
      sendDit();
    }
  }
  // Samo DIT
  else if (ditPressed) {
    sendDit();
    lastWasDit = true;
  }
  // Samo DAH
  else if (dahPressed) {
    sendDah();
    lastWasDit = false;
  }
}

// Preberi hitrost iz potenciometra
void updateSpeed() {
  int potValue = analogRead(SPEED_POT);
  // Preslikava: 0-1023 -> 10-35 WPM
  wpm = map(potValue, 0, 1023, 10, 35);
  // Izračunaj dolžino DIT: 1200 / WPM = ms na DIT
  ditLength = 1200 / wpm;
}

// Pošlji DIT (1 enota)
void sendDit() {
  keyDown();
  delay(ditLength);
  keyUp();
  delay(ditLength);  // Premor med elementi
}

// Pošlji DAH (3 enote)
void sendDah() {
  keyDown();
  delay(ditLength * 3);
  keyUp();
  delay(ditLength);  // Premor med elementi
}

// Tipka dol (KEY + ton + LED)
void keyDown() {
  digitalWrite(KEY_OUT, HIGH);
  digitalWrite(LED_TX, HIGH);
  tone(BUZZER, sidetoneFreq);
}

// Tipka gor
void keyUp() {
  digitalWrite(KEY_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  noTone(BUZZER);
}

// Zagonska melodija
void playStartupTone() {
  // "R" v Morseju: .-.
  tone(BUZZER, sidetoneFreq);
  delay(100);
  noTone(BUZZER);
  delay(100);
  tone(BUZZER, sidetoneFreq);
  delay(300);
  noTone(BUZZER);
  delay(100);
  tone(BUZZER, sidetoneFreq);
  delay(100);
  noTone(BUZZER);
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'cw_keyer_basic.ino',

  wiring: [
    { from: { de: 'Arduino D2', en: 'Arduino D2', sl: 'Arduino D2' }, to: { de: 'Paddle DIT', en: 'Paddle DIT', sl: 'Paddle DIT' }, color: 'Gelb', notes: { de: 'über 1k Widerstand', en: 'via 1k resistor', sl: 'preko 1k upora' } },
    { from: { de: 'Arduino D3', en: 'Arduino D3', sl: 'Arduino D3' }, to: { de: 'Paddle DAH', en: 'Paddle DAH', sl: 'Paddle DAH' }, color: 'Orange', notes: { de: 'über 1k Widerstand', en: 'via 1k resistor', sl: 'preko 1k upora' } },
    { from: { de: 'Arduino D4', en: 'Arduino D4', sl: 'Arduino D4' }, to: { de: 'KEY-Out Buchse', en: 'KEY-Out socket', sl: 'KEY-Out vtičnica' }, color: 'Rot', notes: { de: 'zum TRX', en: 'to TRX', sl: 'na TRX' } },
    { from: { de: 'Arduino D5', en: 'Arduino D5', sl: 'Arduino D5' }, to: { de: 'Piezo Buzzer +', en: 'Piezo buzzer +', sl: 'Piezo brenčač +' }, color: 'Blau' },
    { from: { de: 'Arduino D6', en: 'Arduino D6', sl: 'Arduino D6' }, to: { de: 'LED Anode', en: 'LED anode', sl: 'LED anoda' }, color: 'Grün', notes: { de: 'über Vorwiderstand', en: 'via current limiting resistor', sl: 'preko predpora' } },
    { from: { de: 'Arduino A0', en: 'Arduino A0', sl: 'Arduino A0' }, to: { de: 'Poti Schleifer', en: 'Pot wiper', sl: 'Pot drsnik' }, color: 'Weiß' },
    { from: { de: 'Poti Außen 1', en: 'Pot outer 1', sl: 'Pot zunanji 1' }, to: { de: 'Arduino 5V', en: 'Arduino 5V', sl: 'Arduino 5V' }, color: 'Rot' },
    { from: { de: 'Poti Außen 2', en: 'Pot outer 2', sl: 'Pot zunanji 2' }, to: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' }, color: 'Schwarz' },
    { from: { de: 'Piezo Buzzer -', en: 'Piezo buzzer -', sl: 'Piezo brenčač -' }, to: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' }, color: 'Schwarz' },
    { from: { de: 'LED Kathode', en: 'LED cathode', sl: 'LED katoda' }, to: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' }, color: 'Schwarz' },
    { from: { de: 'Paddle Common', en: 'Paddle common', sl: 'Paddle skupni' }, to: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' }, color: 'Schwarz' },
  ],

  wokwiUrl: 'https://wokwi.com/projects/new/arduino-nano',

  customizationSuggestions: [
    { de: 'OLED-Display für WPM-Anzeige hinzufügen', en: 'Add OLED display for WPM indication', sl: 'Dodaj OLED zaslon za prikaz WPM' },
    { de: 'Memory-Funktion für CQ-Ruf speichern', en: 'Add memory function to store CQ call', sl: 'Dodaj funkcijo pomnilnika za shranjevanje CQ klica' },
    { de: 'Drehencoder statt Potentiometer', en: 'Rotary encoder instead of potentiometer', sl: 'Rotacijski enkoder namesto potenciometra' },
    { de: 'Iambic-A/B per Jumper umschaltbar', en: 'Iambic A/B switchable via jumper', sl: 'Iambic A/B preklopljivo preko mostiča' },
    { de: 'USB-Schnittstelle für PC-Steuerung (Winkeyer-kompatibel)', en: 'USB interface for PC control (Winkeyer compatible)', sl: 'USB vmesnik za PC krmiljenje (Winkeyer združljivo)' },
  ],

  externalLinks: [
    { title: { de: 'Arduino Nano Pinout', en: 'Arduino Nano Pinout', sl: 'Arduino Nano razpored pinov' }, url: 'https://www.arduino.cc/en/uploads/Main/ArduinoNanoManual23.pdf' },
  ],
};
