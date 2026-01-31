import type { HamProject } from '../../types/projects';

export const dummyLoad: HamProject = {
  id: 'dummy-load',
  name: 'Dummy Load mit Leistungsmesser',
  category: 'measurement',
  difficulty: 2,
  description: 'Abschlusswiderstand (50Ω) mit integrierter Leistungsmessung bis 30W. OLED-Anzeige für Leistung und Temperatur. Lüftersteuerung bei Überhitzung.',
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'Leistungswiderstand 50Ω 50W', quantity: 1, notes: 'oder 2x 100Ω 25W parallel' },
    { name: 'OLED Display 0.96"', quantity: 1 },
    { name: 'NTC Thermistor 10k', quantity: 1, notes: 'Temperaturmessung' },
    { name: 'Schottky-Diode 1N5711', quantity: 1 },
    { name: 'Kondensator 100nF', quantity: 2 },
    { name: 'Widerstand 10k', quantity: 2, notes: 'Spannungsteiler' },
    { name: 'Widerstand 100k', quantity: 1 },
    { name: 'SO239/BNC-Buchse', quantity: 1 },
    { name: 'Kühlkörper', quantity: 1, notes: 'für Leistungswiderstand' },
    { name: '5V Lüfter 40mm', quantity: 1, notes: 'optional' },
    { name: 'MOSFET IRLZ44N', quantity: 1, notes: 'Lüftersteuerung' },
  ],
  estimatedCost: '~22€',

  code: `// =====================================================
// Dummy Load mit Leistungsmesser - FunkPilot
// Hardware: Arduino Nano + OLED + NTC
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// ACHTUNG: Maximal 30W Dauerleistung!
// Bei höherer Leistung Kühlkörper erforderlich
//
// =====================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <math.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Pins
const int RF_PIN = A0;         // HF-Spannung (gleichgerichtet)
const int NTC_PIN = A1;        // Temperatursensor
const int FAN_PIN = 9;         // Lüfter PWM

// Kalibrierung
const float CAL_FACTOR = 1.0;  // Kalibrierfaktor anpassen!
const float DIODE_DROP = 0.25; // Schottky-Diodenspannung
const float R_LOAD = 50.0;     // Lastwiderstand in Ohm

// NTC Parameter (10k @ 25°C, B=3950)
const float NTC_R25 = 10000.0;
const float NTC_B = 3950.0;
const float NTC_R_SERIES = 10000.0;

// Temperatur-Schwellen
const int TEMP_FAN_ON = 40;    // Lüfter an bei °C
const int TEMP_FAN_MAX = 60;   // Lüfter 100% bei °C
const int TEMP_ALARM = 80;     // Alarm bei °C

// Messwerte
float power = 0;
float peakPower = 0;
float temperature = 0;
unsigned long peakTime = 0;

void setup() {
  Serial.begin(9600);

  pinMode(FAN_PIN, OUTPUT);
  analogWrite(FAN_PIN, 0);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED nicht gefunden"));
    while(1);
  }

  showWelcome();
  delay(2000);
}

void loop() {
  // Messwerte lesen
  readPower();
  readTemperature();

  // Peak aktualisieren
  if (power > peakPower) {
    peakPower = power;
    peakTime = millis();
  }

  // Peak nach 5 Sekunden zurücksetzen
  if (millis() - peakTime > 5000) {
    peakPower = power;
  }

  // Lüftersteuerung
  controlFan();

  // Anzeige aktualisieren
  updateDisplay();

  // Serial Debug
  Serial.print(F("P="));
  Serial.print(power, 1);
  Serial.print(F("W T="));
  Serial.print(temperature, 1);
  Serial.println(F("C"));

  delay(200);
}

void readPower() {
  // Mehrere Samples für Mittelwert
  long sum = 0;
  for (int i = 0; i < 50; i++) {
    sum += analogRead(RF_PIN);
    delayMicroseconds(100);
  }

  float voltage = (sum / 50.0) * (5.0 / 1023.0);

  // Diodenspannung kompensieren
  if (voltage > DIODE_DROP) {
    voltage -= DIODE_DROP;
  } else {
    voltage = 0;
  }

  // HF-Spannung ist Spitzenspannung
  // P = Vrms² / R = (Vpeak/√2)² / R = Vpeak² / (2*R)
  float vPeak = voltage * CAL_FACTOR;  // Anpassen nach Spannungsteiler
  power = (vPeak * vPeak) / (2.0 * R_LOAD);

  // Auf sinnvollen Bereich begrenzen
  if (power < 0.01) power = 0;
  if (power > 100) power = 100;
}

void readTemperature() {
  int adcValue = analogRead(NTC_PIN);

  // Widerstand berechnen (Spannungsteiler)
  float resistance = NTC_R_SERIES * adcValue / (1023.0 - adcValue);

  // Temperatur mit Steinhart-Hart (vereinfacht)
  // 1/T = 1/T0 + (1/B) * ln(R/R0)
  float steinhart = log(resistance / NTC_R25) / NTC_B;
  steinhart += 1.0 / (25.0 + 273.15);
  temperature = (1.0 / steinhart) - 273.15;
}

void controlFan() {
  int fanSpeed = 0;

  if (temperature >= TEMP_ALARM) {
    // Alarm! Volle Drehzahl + Warnung
    fanSpeed = 255;
  } else if (temperature >= TEMP_FAN_MAX) {
    fanSpeed = 255;
  } else if (temperature >= TEMP_FAN_ON) {
    // Proportionale Steuerung
    fanSpeed = map(temperature, TEMP_FAN_ON, TEMP_FAN_MAX, 80, 255);
  }

  analogWrite(FAN_PIN, fanSpeed);
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Dummy Load 50"));
  display.print((char)233);  // Omega
  display.print(F(" 30W"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Leistung gross
  display.setTextSize(2);
  display.setCursor(0, 16);
  if (power < 10) {
    display.print(power, 2);
  } else {
    display.print(power, 1);
  }
  display.println(F(" W"));

  // Peak
  display.setTextSize(1);
  display.setCursor(0, 36);
  display.print(F("Peak: "));
  display.print(peakPower, 1);
  display.println(F(" W"));

  // Temperatur
  display.setCursor(0, 48);
  display.print(F("Temp: "));
  display.print(temperature, 1);
  display.print((char)247);  // Grad-Zeichen
  display.print(F("C"));

  // Temperatur-Balken
  int barWidth = map(constrain(temperature, 20, 80), 20, 80, 0, 50);
  display.drawRect(75, 48, 52, 8, SSD1306_WHITE);
  display.fillRect(76, 49, barWidth, 6, SSD1306_WHITE);

  // Alarm-Warnung
  if (temperature >= TEMP_ALARM) {
    display.setTextSize(1);
    display.setCursor(0, 56);
    display.println(F("!!! UEBERHITZUNG !!!"));
  }

  display.display();
}

void showWelcome() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(15, 15);
  display.println(F("Dummy Load"));
  display.setCursor(20, 30);
  display.println(F("50 Ohm / 30W"));
  display.setCursor(25, 45);
  display.println(F("FunkPilot"));
  display.display();
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'dummy_load.ino',

  wiring: [
    { from: 'Arduino A0', to: 'HF-Gleichrichter', color: 'Blau', notes: 'über Spannungsteiler' },
    { from: 'Arduino A1', to: 'NTC Spannungsteiler', color: 'Grün', notes: '10k + NTC' },
    { from: 'Arduino D9', to: 'MOSFET Gate', color: 'Orange', notes: 'Lüfter PWM' },
    { from: 'MOSFET Drain', to: 'Lüfter -', color: 'Schwarz' },
    { from: 'MOSFET Source', to: 'GND', color: 'Schwarz' },
    { from: 'Lüfter +', to: '5V', color: 'Rot' },
    { from: 'Arduino A4 (SDA)', to: 'OLED SDA', color: 'Weiß' },
    { from: 'Arduino A5 (SCL)', to: 'OLED SCL', color: 'Grau' },
    { from: 'SO239 Mitte', to: '50Ω Widerstand', notes: 'HF-Eingang' },
    { from: '50Ω Widerstand', to: 'Diode + Teiler', notes: 'zu A0' },
    { from: 'NTC', to: 'Kühlkörper', notes: 'thermischer Kontakt' },
  ],

  customizationSuggestions: [
    'Mehrere Leistungsbereiche (1W/10W/100W)',
    'SWR-Anzeige hinzufügen',
    'USB-Logging für Leistungsprotokoll',
    'Frequenzabhängige Kalibrierung',
    'Energiezähler (Wh) für Dauertest',
  ],

  externalLinks: [
    { title: 'Dummy Load Design', url: 'https://www.qsl.net/va3iul/Homebrew_RF_Test_Equipment/Homebrew_RF_Test_Equipment.htm' },
  ],
};
