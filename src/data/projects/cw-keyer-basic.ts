import type { HamProject } from '../../types/projects';

export const cwKeyerBasic: HamProject = {
  id: 'cw-keyer-basic',
  name: 'CW-Keyer Basic',
  category: 'cw-morse',
  difficulty: 1,
  description: 'Einfacher Iambic-A/B Keyer für CW-Betrieb. Geschwindigkeit einstellbar über Potentiometer (10-30 WPM). Seitenton über Piezo-Summer. Perfekt für Einsteiger!',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'Paddle oder 2x Taster', quantity: 1, notes: 'für DIT/DAH' },
    { name: 'Piezo Buzzer', quantity: 1 },
    { name: 'Potentiometer 10k', quantity: 1, notes: 'für Geschwindigkeit' },
    { name: 'Widerstand 1k', quantity: 2 },
    { name: 'LED rot 3mm', quantity: 1, notes: 'TX-Anzeige' },
    { name: 'Klinkenbuchse 3.5mm', quantity: 2, notes: 'Paddle + KEY-Out' },
    { name: 'Lochrasterplatine', quantity: 1 },
  ],
  estimatedCost: '~12€',

  code: `// =====================================================
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
  codeLanguage: 'cpp',
  codeFileName: 'cw_keyer_basic.ino',

  customizationSuggestions: [
    'OLED-Display für WPM-Anzeige hinzufügen',
    'Memory-Funktion für CQ-Ruf speichern',
    'Drehencoder statt Potentiometer',
    'Iambic-A/B per Jumper umschaltbar',
    'USB-Schnittstelle für PC-Steuerung (Winkeyer-kompatibel)',
  ],

  externalLinks: [
    { title: 'Arduino Nano Pinout', url: 'https://www.arduino.cc/en/uploads/Main/ArduinoNanoManual23.pdf' },
  ],
};
