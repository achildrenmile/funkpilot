import type { HamProject } from '../../types/projects';

export const swrMeter: HamProject = {
  id: 'swr-meter',
  name: {
    de: 'SWR-Meter mit OLED',
    en: 'SWR Meter with OLED',
    sl: 'SWR meter z OLED'
  },
  category: 'measurement',
  difficulty: 2,
  description: {
    de: 'Digitales SWR-Meter mit OLED-Display. Zeigt SWR, Vorwärts- und Rücklaufleistung an. Verwendet einen Richtkoppler-Bausatz. Kalibrierbar über Software.',
    en: 'Digital SWR meter with OLED display. Shows SWR, forward and reflected power. Uses a directional coupler kit. Calibratable via software.',
    sl: 'Digitalni SWR meter z OLED zaslonom. Prikazuje SWR, oddano in odbito moč. Uporablja komplet smernega sklopnika. Kalibracija preko programske opreme.'
  },
  hardware: 'arduino-nano',

  components: [
    { name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' }, quantity: 1 },
    { name: { de: 'OLED Display 0.96" I2C', en: 'OLED Display 0.96" I2C', sl: 'OLED zaslon 0.96" I2C' }, quantity: 1, notes: { de: 'SSD1306, 128x64', en: 'SSD1306, 128x64', sl: 'SSD1306, 128x64' } },
    { name: { de: 'Richtkoppler-Bausatz', en: 'Directional coupler kit', sl: 'Komplet smernega sklopnika' }, quantity: 1, notes: { de: 'z.B. QRP-Labs oder Eigenbau', en: 'e.g. QRP-Labs or homebrew', sl: 'npr. QRP-Labs ali lastna izdelava' } },
    { name: { de: 'Schottky-Dioden 1N5711', en: 'Schottky diodes 1N5711', sl: 'Schottky diode 1N5711' }, quantity: 2, notes: { de: 'für HF-Gleichrichtung', en: 'for RF rectification', sl: 'za RF usmerjanje' } },
    { name: { de: 'Kondensator 100nF', en: 'Capacitor 100nF', sl: 'Kondenzator 100nF' }, quantity: 4 },
    { name: { de: 'Kondensator 10µF', en: 'Capacitor 10µF', sl: 'Kondenzator 10µF' }, quantity: 2 },
    { name: { de: 'Widerstand 10k', en: 'Resistor 10k', sl: 'Upor 10k' }, quantity: 2 },
    { name: { de: 'Widerstand 100k', en: 'Resistor 100k', sl: 'Upor 100k' }, quantity: 2 },
    { name: { de: 'Gehäuse Alu', en: 'Aluminum enclosure', sl: 'Aluminijasto ohišje' }, quantity: 1, notes: { de: 'für HF-Schirmung', en: 'for RF shielding', sl: 'za RF oklopljenje' } },
    { name: { de: 'BNC-Buchsen', en: 'BNC connectors', sl: 'BNC konektorji' }, quantity: 2, notes: { de: 'Input/Output', en: 'Input/Output', sl: 'Vhod/Izhod' } },
  ],
  estimatedCost: '~25€',

  code: `// =====================================================
// SWR Meter with OLED Display - FunkPilot DIY Project
// SWR-Meter mit OLED Display - FunkPilot Bastelprojekt
// SWR meter z OLED zaslonom - FunkPilot projekt
// Hardware: Arduino Nano + SSD1306 OLED
// Author/Autor/Avtor: FunkPilot / OE8YML
// License/Lizenz/Licenca: MIT
// =====================================================
//
// WARNING: Only use up to approx. 30W!
// ACHTUNG: Nur bis ca. 30W verwenden!
// OPOZORILO: Uporabljajte samo do pribl. 30W!
// For higher power, adjust voltage divider.
// Für höhere Leistungen Spannungsteiler anpassen.
// Za višje moči prilagodite napetostni delilnik.
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED Configuration / OLED Konfiguration / OLED nastavitve
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Pin assignment / Pin-Belegung / Razporeditev pinov
const int FWD_PIN = A0;     // Forward power from directional coupler / Vorwärtsleistung vom Richtkoppler / Oddana moč iz smernega sklopnika
const int REF_PIN = A1;     // Reflected power from directional coupler / Rücklaufleistung vom Richtkoppler / Odbita moč iz smernega sklopnika

// Calibration (adjust according to directional coupler!)
// Kalibrierung (anpassen nach Richtkoppler!)
// Kalibracija (prilagodite glede na smerni sklopnik!)
const float CAL_FACTOR = 0.1;   // Calibration factor / Kalibrierfaktor / Kalibracijski faktor
const float DIODE_DROP = 0.3;   // Diode voltage (Schottky) / Diodenspannung (Schottky) / Napetost diode (Schottky)

// Averaging / Mittelwertbildung / Povprečenje
const int NUM_SAMPLES = 50;

// Variables / Variablen / Spremenljivke
float fwdPower = 0;
float refPower = 0;
float swr = 1.0;
float fwdVoltage = 0;
float refVoltage = 0;

void setup() {
  Serial.begin(9600);

  // Initialize OLED / OLED initialisieren / Inicializacija OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 not found! / nicht gefunden! / ni najden!"));
    while (1);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(20, 25);
  display.println(F("SWR-Meter v1.0"));
  display.setCursor(25, 40);
  display.println(F("FunkPilot"));
  display.display();
  delay(2000);
}

void loop() {
  // Read measurements (with averaging) / Messwerte einlesen (mit Mittelwertbildung) / Branje meritev (s povprečenjem)
  readPower();

  // Calculate SWR / SWR berechnen / Izračun SWR
  calculateSWR();

  // Show on display / Auf Display anzeigen / Prikaz na zaslonu
  updateDisplay();

  // Serial Debug
  Serial.print("FWD: ");
  Serial.print(fwdPower, 1);
  Serial.print("W  REF: ");
  Serial.print(refPower, 1);
  Serial.print("W  SWR: ");
  Serial.println(swr, 2);

  delay(200);
}

void readPower() {
  long fwdSum = 0;
  long refSum = 0;

  // Multiple samples for averaging / Mehrere Samples für Mittelwert / Več vzorcev za povprečje
  for (int i = 0; i < NUM_SAMPLES; i++) {
    fwdSum += analogRead(FWD_PIN);
    refSum += analogRead(REF_PIN);
    delayMicroseconds(100);
  }

  // ADC to voltage (0-5V on Arduino) / ADC zu Spannung (0-5V bei Arduino) / ADC v napetost (0-5V pri Arduino)
  fwdVoltage = (fwdSum / NUM_SAMPLES) * (5.0 / 1023.0);
  refVoltage = (refSum / NUM_SAMPLES) * (5.0 / 1023.0);

  // Compensate diode voltage / Diodenspannung kompensieren / Kompenzacija napetosti diode
  if (fwdVoltage > DIODE_DROP) fwdVoltage -= DIODE_DROP;
  else fwdVoltage = 0;

  if (refVoltage > DIODE_DROP) refVoltage -= DIODE_DROP;
  else refVoltage = 0;

  // Voltage to power (adjust according to directional coupler!)
  // Spannung zu Leistung (anpassen nach Richtkoppler!)
  // Napetost v moč (prilagodite glede na smerni sklopnik!)
  // P = (V^2) / R, with calibration factor / mit Kalibrierfaktor / s kalibracijskim faktorjem
  fwdPower = (fwdVoltage * fwdVoltage) / CAL_FACTOR;
  refPower = (refVoltage * refVoltage) / CAL_FACTOR;
}

void calculateSWR() {
  if (fwdPower < 0.1) {
    // No power -> SWR undefined / Keine Leistung -> SWR undefiniert / Ni moči -> SWR nedefiniran
    swr = 0;
    return;
  }

  // Reflection coefficient / Reflexionskoeffizient / Koeficient odboja
  float rho = sqrt(refPower / fwdPower);

  // Calculate SWR / SWR berechnen / Izračun SWR
  if (rho >= 0.99) {
    swr = 99.9;  // Show maximum / Maximum anzeigen / Prikaz maksimuma
  } else {
    swr = (1 + rho) / (1 - rho);
  }

  // Limit to reasonable range / Begrenzen auf sinnvollen Bereich / Omejitev na smiselno območje
  if (swr > 99.9) swr = 99.9;
  if (swr < 1.0) swr = 1.0;
}

void updateDisplay() {
  display.clearDisplay();

  // Header / Überschrift / Naslov
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("=== SWR-Meter ==="));

  // Show SWR large / SWR gross anzeigen / Velik prikaz SWR
  display.setTextSize(2);
  display.setCursor(0, 16);
  display.print(F("SWR:"));

  if (swr == 0) {
    display.println(F(" ---"));
  } else if (swr > 10) {
    display.println(F(" HIGH"));
  } else {
    display.print(swr, 1);
    display.println(F(":1"));
  }

  // Power display / Leistungsanzeige / Prikaz moči
  display.setTextSize(1);
  display.setCursor(0, 40);
  display.print(F("FWD: "));
  display.print(fwdPower, 1);
  display.println(F(" W"));

  display.setCursor(0, 52);
  display.print(F("REF: "));
  display.print(refPower, 1);
  display.println(F(" W"));

  // SWR bar graph / SWR-Balkenanzeige / SWR stolpični prikaz
  int barWidth = 0;
  if (swr > 0 && swr <= 10) {
    barWidth = map(swr * 10, 10, 100, 0, 60);
  }
  display.drawRect(64, 40, 62, 20, SSD1306_WHITE);
  display.fillRect(65, 41, barWidth, 18, SSD1306_WHITE);

  // Scale / Skala / Lestvica
  display.setCursor(64, 52);
  display.print(F("1"));
  display.setCursor(90, 52);
  display.print(F("3"));
  display.setCursor(120, 52);
  display.print(F(">"));

  display.display();
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'swr_meter.ino',

  wiring: [
    { from: 'Arduino A4 (SDA)', to: 'OLED SDA', color: 'Blau', notes: { de: 'I2C Daten', en: 'I2C Data', sl: 'I2C podatki' } },
    { from: 'Arduino A5 (SCL)', to: 'OLED SCL', color: 'Gelb', notes: { de: 'I2C Clock', en: 'I2C Clock', sl: 'I2C ura' } },
    { from: 'Arduino A0', to: { de: 'Richtkoppler FWD', en: 'Directional coupler FWD', sl: 'Smerni sklopnik FWD' }, color: 'Rot', notes: { de: 'über Spannungsteiler', en: 'via voltage divider', sl: 'preko napetostnega delilnika' } },
    { from: 'Arduino A1', to: { de: 'Richtkoppler REF', en: 'Directional coupler REF', sl: 'Smerni sklopnik REF' }, color: 'Orange', notes: { de: 'über Spannungsteiler', en: 'via voltage divider', sl: 'preko napetostnega delilnika' } },
    { from: 'Arduino 5V', to: 'OLED VCC', color: 'Rot' },
    { from: 'Arduino GND', to: 'OLED GND', color: 'Schwarz' },
    { from: { de: 'BNC Input', en: 'BNC Input', sl: 'BNC vhod' }, to: { de: 'Richtkoppler IN', en: 'Directional coupler IN', sl: 'Smerni sklopnik IN' }, notes: { de: 'vom Transceiver', en: 'from transceiver', sl: 'iz oddajnika' } },
    { from: { de: 'Richtkoppler OUT', en: 'Directional coupler OUT', sl: 'Smerni sklopnik OUT' }, to: { de: 'BNC Output', en: 'BNC Output', sl: 'BNC izhod' }, notes: { de: 'zur Antenne', en: 'to antenna', sl: 'do antene' } },
  ],

  customizationSuggestions: [
    { de: 'Peak-Hold Funktion für maximalen SWR', en: 'Peak-hold function for maximum SWR', sl: 'Peak-hold funkcija za maksimalni SWR' },
    { de: 'Akustische Warnung bei hohem SWR', en: 'Audible warning for high SWR', sl: 'Zvočno opozorilo pri visokem SWR' },
    { de: 'Kalibrierung über Tasten im Menü', en: 'Calibration via buttons in menu', sl: 'Kalibracija preko tipk v meniju' },
    { de: 'Frequenzanzeige mit Frequenzzähler kombinieren', en: 'Combine frequency display with frequency counter', sl: 'Kombinacija prikaza frekvence s frekvenčnim števcem' },
    { de: 'Logging auf SD-Karte', en: 'Logging to SD card', sl: 'Beleženje na SD kartico' },
  ],

  externalLinks: [
    { title: { de: 'Richtkoppler Theorie', en: 'Directional Coupler Theory', sl: 'Teorija smernega sklopnika' }, url: 'https://www.qrp-labs.com/coupler.html' },
  ],
};
