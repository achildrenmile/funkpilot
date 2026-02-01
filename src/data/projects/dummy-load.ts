import type { HamProject } from '../../types/projects';

export const dummyLoad: HamProject = {
  id: 'dummy-load',
  name: {
    de: 'Dummy Load mit Leistungsmesser',
    en: 'Dummy Load with Power Meter',
    sl: 'Nadomestna breme z merilnikom moči',
  },
  category: 'measurement',
  difficulty: 2,
  description: {
    de: 'Abschlusswiderstand (50Ω) mit integrierter Leistungsmessung bis 30W. OLED-Anzeige für Leistung und Temperatur. Lüftersteuerung bei Überhitzung.',
    en: 'Terminating resistor (50Ω) with integrated power measurement up to 30W. OLED display for power and temperature. Fan control on overheating.',
    sl: 'Zaključni upor (50Ω) z integrirano meritvijo moči do 30W. OLED zaslon za moč in temperaturo. Krmiljenje ventilatorja ob pregrevanju.',
  },
  hardware: 'arduino-nano',

  components: [
    { name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' }, quantity: 1 },
    { name: { de: 'Leistungswiderstand 50Ω 50W', en: 'Power Resistor 50Ω 50W', sl: 'Močnostni upor 50Ω 50W' }, quantity: 1, notes: { de: 'oder 2x 100Ω 25W parallel', en: 'or 2x 100Ω 25W in parallel', sl: 'ali 2x 100Ω 25W vzporedno' } },
    { name: { de: 'OLED Display 0.96"', en: 'OLED Display 0.96"', sl: 'OLED zaslon 0.96"' }, quantity: 1 },
    { name: { de: 'NTC Thermistor 10k', en: 'NTC Thermistor 10k', sl: 'NTC termistor 10k' }, quantity: 1, notes: { de: 'Temperaturmessung', en: 'Temperature measurement', sl: 'Merjenje temperature' } },
    { name: { de: 'Schottky-Diode 1N5711', en: 'Schottky Diode 1N5711', sl: 'Schottky dioda 1N5711' }, quantity: 1 },
    { name: { de: 'Kondensator 100nF', en: 'Capacitor 100nF', sl: 'Kondenzator 100nF' }, quantity: 2 },
    { name: { de: 'Widerstand 10k', en: 'Resistor 10k', sl: 'Upor 10k' }, quantity: 2, notes: { de: 'Spannungsteiler', en: 'Voltage divider', sl: 'Napetostni delilnik' } },
    { name: { de: 'Widerstand 100k', en: 'Resistor 100k', sl: 'Upor 100k' }, quantity: 1 },
    { name: { de: 'SO239/BNC-Buchse', en: 'SO239/BNC Connector', sl: 'SO239/BNC priključek' }, quantity: 1 },
    { name: { de: 'Kühlkörper', en: 'Heat Sink', sl: 'Hladilno telo' }, quantity: 1, notes: { de: 'für Leistungswiderstand', en: 'for power resistor', sl: 'za močnostni upor' } },
    { name: { de: '5V Lüfter 40mm', en: '5V Fan 40mm', sl: '5V ventilator 40mm' }, quantity: 1, notes: { de: 'optional', en: 'optional', sl: 'opcijsko' } },
    { name: { de: 'MOSFET IRLZ44N', en: 'MOSFET IRLZ44N', sl: 'MOSFET IRLZ44N' }, quantity: 1, notes: { de: 'Lüftersteuerung', en: 'Fan control', sl: 'Krmiljenje ventilatorja' } },
  ],
  estimatedCost: '~22€',

  code: {
    de: `// =====================================================
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
    en: `// =====================================================
// Dummy Load with Power Meter - FunkPilot
// Hardware: Arduino Nano + OLED + NTC
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// WARNING: Maximum 30W continuous power!
// Heat sink required for higher power
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
const int RF_PIN = A0;         // RF voltage (rectified)
const int NTC_PIN = A1;        // Temperature sensor
const int FAN_PIN = 9;         // Fan PWM

// Calibration
const float CAL_FACTOR = 1.0;  // Adjust calibration factor!
const float DIODE_DROP = 0.25; // Schottky diode voltage
const float R_LOAD = 50.0;     // Load resistance in Ohm

// NTC Parameters (10k @ 25°C, B=3950)
const float NTC_R25 = 10000.0;
const float NTC_B = 3950.0;
const float NTC_R_SERIES = 10000.0;

// Temperature thresholds
const int TEMP_FAN_ON = 40;    // Fan on at °C
const int TEMP_FAN_MAX = 60;   // Fan 100% at °C
const int TEMP_ALARM = 80;     // Alarm at °C

// Measured values
float power = 0;
float peakPower = 0;
float temperature = 0;
unsigned long peakTime = 0;

void setup() {
  Serial.begin(9600);

  pinMode(FAN_PIN, OUTPUT);
  analogWrite(FAN_PIN, 0);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED not found"));
    while(1);
  }

  showWelcome();
  delay(2000);
}

void loop() {
  // Read measured values
  readPower();
  readTemperature();

  // Update peak
  if (power > peakPower) {
    peakPower = power;
    peakTime = millis();
  }

  // Reset peak after 5 seconds
  if (millis() - peakTime > 5000) {
    peakPower = power;
  }

  // Fan control
  controlFan();

  // Update display
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
  // Multiple samples for averaging
  long sum = 0;
  for (int i = 0; i < 50; i++) {
    sum += analogRead(RF_PIN);
    delayMicroseconds(100);
  }

  float voltage = (sum / 50.0) * (5.0 / 1023.0);

  // Compensate diode voltage
  if (voltage > DIODE_DROP) {
    voltage -= DIODE_DROP;
  } else {
    voltage = 0;
  }

  // RF voltage is peak voltage
  // P = Vrms² / R = (Vpeak/√2)² / R = Vpeak² / (2*R)
  float vPeak = voltage * CAL_FACTOR;  // Adjust for voltage divider
  power = (vPeak * vPeak) / (2.0 * R_LOAD);

  // Limit to sensible range
  if (power < 0.01) power = 0;
  if (power > 100) power = 100;
}

void readTemperature() {
  int adcValue = analogRead(NTC_PIN);

  // Calculate resistance (voltage divider)
  float resistance = NTC_R_SERIES * adcValue / (1023.0 - adcValue);

  // Temperature with Steinhart-Hart (simplified)
  // 1/T = 1/T0 + (1/B) * ln(R/R0)
  float steinhart = log(resistance / NTC_R25) / NTC_B;
  steinhart += 1.0 / (25.0 + 273.15);
  temperature = (1.0 / steinhart) - 273.15;
}

void controlFan() {
  int fanSpeed = 0;

  if (temperature >= TEMP_ALARM) {
    // Alarm! Full speed + warning
    fanSpeed = 255;
  } else if (temperature >= TEMP_FAN_MAX) {
    fanSpeed = 255;
  } else if (temperature >= TEMP_FAN_ON) {
    // Proportional control
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

  // Power large
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

  // Temperature
  display.setCursor(0, 48);
  display.print(F("Temp: "));
  display.print(temperature, 1);
  display.print((char)247);  // Degree symbol
  display.print(F("C"));

  // Temperature bar
  int barWidth = map(constrain(temperature, 20, 80), 20, 80, 0, 50);
  display.drawRect(75, 48, 52, 8, SSD1306_WHITE);
  display.fillRect(76, 49, barWidth, 6, SSD1306_WHITE);

  // Alarm warning
  if (temperature >= TEMP_ALARM) {
    display.setTextSize(1);
    display.setCursor(0, 56);
    display.println(F("!!! OVERHEATING !!!"));
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
    sl: `// =====================================================
// Nadomestna breme z merilnikom moči - FunkPilot
// Strojna oprema: Arduino Nano + OLED + NTC
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// OPOZORILO: Največja trajna moč 30W!
// Pri višji moči je potrebno hladilno telo
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

// Pini
const int RF_PIN = A0;         // RF napetost (usmerjeno)
const int NTC_PIN = A1;        // Temperaturni senzor
const int FAN_PIN = 9;         // Ventilator PWM

// Kalibracija
const float CAL_FACTOR = 1.0;  // Prilagodite kalibracijski faktor!
const float DIODE_DROP = 0.25; // Napetost Schottky diode
const float R_LOAD = 50.0;     // Upornost bremena v Ohm

// NTC parametri (10k @ 25°C, B=3950)
const float NTC_R25 = 10000.0;
const float NTC_B = 3950.0;
const float NTC_R_SERIES = 10000.0;

// Temperaturni pragovi
const int TEMP_FAN_ON = 40;    // Ventilator vklop pri °C
const int TEMP_FAN_MAX = 60;   // Ventilator 100% pri °C
const int TEMP_ALARM = 80;     // Alarm pri °C

// Izmerjene vrednosti
float power = 0;
float peakPower = 0;
float temperature = 0;
unsigned long peakTime = 0;

void setup() {
  Serial.begin(9600);

  pinMode(FAN_PIN, OUTPUT);
  analogWrite(FAN_PIN, 0);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED ni najden"));
    while(1);
  }

  showWelcome();
  delay(2000);
}

void loop() {
  // Branje izmerjenih vrednosti
  readPower();
  readTemperature();

  // Posodobitev vrha
  if (power > peakPower) {
    peakPower = power;
    peakTime = millis();
  }

  // Ponastavitev vrha po 5 sekundah
  if (millis() - peakTime > 5000) {
    peakPower = power;
  }

  // Krmiljenje ventilatorja
  controlFan();

  // Posodobitev zaslona
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
  // Več vzorcev za povprečenje
  long sum = 0;
  for (int i = 0; i < 50; i++) {
    sum += analogRead(RF_PIN);
    delayMicroseconds(100);
  }

  float voltage = (sum / 50.0) * (5.0 / 1023.0);

  // Kompenzacija napetosti diode
  if (voltage > DIODE_DROP) {
    voltage -= DIODE_DROP;
  } else {
    voltage = 0;
  }

  // RF napetost je vrhnja napetost
  // P = Vrms² / R = (Vpeak/√2)² / R = Vpeak² / (2*R)
  float vPeak = voltage * CAL_FACTOR;  // Prilagoditev za napetostni delilnik
  power = (vPeak * vPeak) / (2.0 * R_LOAD);

  // Omejitev na smiselno območje
  if (power < 0.01) power = 0;
  if (power > 100) power = 100;
}

void readTemperature() {
  int adcValue = analogRead(NTC_PIN);

  // Izračun upornosti (napetostni delilnik)
  float resistance = NTC_R_SERIES * adcValue / (1023.0 - adcValue);

  // Temperatura s Steinhart-Hart (poenostavljeno)
  // 1/T = 1/T0 + (1/B) * ln(R/R0)
  float steinhart = log(resistance / NTC_R25) / NTC_B;
  steinhart += 1.0 / (25.0 + 273.15);
  temperature = (1.0 / steinhart) - 273.15;
}

void controlFan() {
  int fanSpeed = 0;

  if (temperature >= TEMP_ALARM) {
    // Alarm! Polna hitrost + opozorilo
    fanSpeed = 255;
  } else if (temperature >= TEMP_FAN_MAX) {
    fanSpeed = 255;
  } else if (temperature >= TEMP_FAN_ON) {
    // Proporcionalno krmiljenje
    fanSpeed = map(temperature, TEMP_FAN_ON, TEMP_FAN_MAX, 80, 255);
  }

  analogWrite(FAN_PIN, fanSpeed);
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Glava
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Dummy Load 50"));
  display.print((char)233);  // Omega
  display.print(F(" 30W"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Moč veliko
  display.setTextSize(2);
  display.setCursor(0, 16);
  if (power < 10) {
    display.print(power, 2);
  } else {
    display.print(power, 1);
  }
  display.println(F(" W"));

  // Vrh
  display.setTextSize(1);
  display.setCursor(0, 36);
  display.print(F("Peak: "));
  display.print(peakPower, 1);
  display.println(F(" W"));

  // Temperatura
  display.setCursor(0, 48);
  display.print(F("Temp: "));
  display.print(temperature, 1);
  display.print((char)247);  // Simbol za stopinje
  display.print(F("C"));

  // Temperaturna vrstica
  int barWidth = map(constrain(temperature, 20, 80), 20, 80, 0, 50);
  display.drawRect(75, 48, 52, 8, SSD1306_WHITE);
  display.fillRect(76, 49, barWidth, 6, SSD1306_WHITE);

  // Opozorilo alarma
  if (temperature >= TEMP_ALARM) {
    display.setTextSize(1);
    display.setCursor(0, 56);
    display.println(F("!!! PREGREVANJE !!!"));
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
  },
  codeLanguage: 'cpp',
  codeFileName: 'dummy_load.ino',

  wiring: [
    { from: { de: 'Arduino A0', en: 'Arduino A0', sl: 'Arduino A0' }, to: { de: 'HF-Gleichrichter', en: 'RF Rectifier', sl: 'RF usmernik' }, color: 'Blau', notes: { de: 'über Spannungsteiler', en: 'via voltage divider', sl: 'prek napetostnega delilnika' } },
    { from: { de: 'Arduino A1', en: 'Arduino A1', sl: 'Arduino A1' }, to: { de: 'NTC Spannungsteiler', en: 'NTC Voltage Divider', sl: 'NTC napetostni delilnik' }, color: 'Grün', notes: { de: '10k + NTC', en: '10k + NTC', sl: '10k + NTC' } },
    { from: { de: 'Arduino D9', en: 'Arduino D9', sl: 'Arduino D9' }, to: { de: 'MOSFET Gate', en: 'MOSFET Gate', sl: 'MOSFET Gate' }, color: 'Orange', notes: { de: 'Lüfter PWM', en: 'Fan PWM', sl: 'Ventilator PWM' } },
    { from: { de: 'MOSFET Drain', en: 'MOSFET Drain', sl: 'MOSFET Drain' }, to: { de: 'Lüfter -', en: 'Fan -', sl: 'Ventilator -' }, color: 'Schwarz' },
    { from: { de: 'MOSFET Source', en: 'MOSFET Source', sl: 'MOSFET Source' }, to: { de: 'GND', en: 'GND', sl: 'GND' }, color: 'Schwarz' },
    { from: { de: 'Lüfter +', en: 'Fan +', sl: 'Ventilator +' }, to: { de: '5V', en: '5V', sl: '5V' }, color: 'Rot' },
    { from: { de: 'Arduino A4 (SDA)', en: 'Arduino A4 (SDA)', sl: 'Arduino A4 (SDA)' }, to: { de: 'OLED SDA', en: 'OLED SDA', sl: 'OLED SDA' }, color: 'Weiß' },
    { from: { de: 'Arduino A5 (SCL)', en: 'Arduino A5 (SCL)', sl: 'Arduino A5 (SCL)' }, to: { de: 'OLED SCL', en: 'OLED SCL', sl: 'OLED SCL' }, color: 'Grau' },
    { from: { de: 'SO239 Mitte', en: 'SO239 Center', sl: 'SO239 sredina' }, to: { de: '50Ω Widerstand', en: '50Ω Resistor', sl: '50Ω upor' }, notes: { de: 'HF-Eingang', en: 'RF input', sl: 'RF vhod' } },
    { from: { de: '50Ω Widerstand', en: '50Ω Resistor', sl: '50Ω upor' }, to: { de: 'Diode + Teiler', en: 'Diode + Divider', sl: 'Dioda + delilnik' }, notes: { de: 'zu A0', en: 'to A0', sl: 'do A0' } },
    { from: { de: 'NTC', en: 'NTC', sl: 'NTC' }, to: { de: 'Kühlkörper', en: 'Heat Sink', sl: 'Hladilno telo' }, notes: { de: 'thermischer Kontakt', en: 'thermal contact', sl: 'toplotni stik' } },
  ],

  customizationSuggestions: [
    { de: 'Mehrere Leistungsbereiche (1W/10W/100W)', en: 'Multiple power ranges (1W/10W/100W)', sl: 'Več mocnostnih obmocij (1W/10W/100W)' },
    { de: 'SWR-Anzeige hinzufügen', en: 'Add SWR display', sl: 'Dodaj prikaz SWR' },
    { de: 'USB-Logging für Leistungsprotokoll', en: 'USB logging for power log', sl: 'USB beleženje za dnevnik moci' },
    { de: 'Frequenzabhängige Kalibrierung', en: 'Frequency-dependent calibration', sl: 'Frekvenčno odvisna kalibracija' },
    { de: 'Energiezähler (Wh) für Dauertest', en: 'Energy counter (Wh) for endurance test', sl: 'Stevec energije (Wh) za trajnostni test' },
  ],

  externalLinks: [
    { title: { de: 'Dummy Load Design', en: 'Dummy Load Design', sl: 'Zasnova nadomestne bremena' }, url: 'https://www.qsl.net/va3iul/Homebrew_RF_Test_Equipment/Homebrew_RF_Test_Equipment.htm' },
  ],
};
