import type { HamProject } from '../../types/projects';

export const aprsTracker: HamProject = {
  id: 'aprs-tracker',
  name: 'APRS-Tracker',
  category: 'digital-aprs',
  difficulty: 2,
  description: 'Mobiler APRS-Tracker mit ESP32 und GPS. Sendet automatisch Position über 2m FM. Ideal für Wanderungen, SOTA, Auto. Mit WiFi-Konfiguration und Batteriebetrieb.',
  hardware: 'esp32',

  components: [
    { name: 'ESP32 DevKit', quantity: 1, notes: 'oder ESP32-S3' },
    { name: 'GPS-Modul NEO-6M/7M', quantity: 1, notes: 'mit Antenne' },
    { name: 'SA818 VHF-Modul', quantity: 1, notes: '2m TX/RX Modul' },
    { name: 'OLED Display 0.96"', quantity: 1, notes: 'optional' },
    { name: 'Spannungsregler 3.3V', quantity: 1, notes: 'AMS1117' },
    { name: 'LiPo Akku 3.7V', quantity: 1, notes: '2000mAh empfohlen' },
    { name: 'TP4056 Lademodul', quantity: 1 },
    { name: 'Antenne 2m', quantity: 1, notes: 'SMA oder BNC' },
    { name: 'Taster', quantity: 2, notes: 'Beacon/Menü' },
    { name: 'Gehäuse wasserdicht', quantity: 1 },
  ],
  estimatedCost: '~45€',

  code: `// =====================================================
// APRS-Tracker - FunkPilot Bastelprojekt
// Hardware: ESP32 + NEO-6M GPS + SA818
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// WICHTIG: Nur mit gültiger Amateurfunklizenz betreiben!
// APRS Frequenz Europa: 144.800 MHz
//
// =====================================================

#include <TinyGPS++.h>
#include <WiFi.h>
#include <Wire.h>

// Optional: OLED Display
// #include <Adafruit_SSD1306.h>

// ===== KONFIGURATION =====
const char* CALLSIGN = "OE8XXX";    // Dein Rufzeichen
const char* SSID = "-9";             // APRS SSID (-9 = Mobil)
const char* SYMBOL = ">";            // APRS Symbol (> = Auto)
const char* COMMENT = "FunkPilot Tracker";

// APRS Pfad
const char* DIGI_PATH = "WIDE1-1,WIDE2-1";

// Beacon Intervall (Sekunden)
const int BEACON_INTERVAL_MOVING = 60;   // Bei Bewegung
const int BEACON_INTERVAL_STATIC = 300;  // Im Stillstand
const float SPEED_THRESHOLD = 5.0;       // km/h für Bewegungserkennung

// ===== PIN-BELEGUNG =====
#define GPS_RX 16
#define GPS_TX 17
#define SA818_RX 4
#define SA818_TX 5
#define SA818_PTT 18
#define SA818_PD 19
#define BUTTON_BEACON 25
#define BUTTON_MENU 26
#define LED_TX 2

// ===== OBJEKTE =====
TinyGPSPlus gps;
HardwareSerial gpsSerial(1);
HardwareSerial radioSerial(2);

// ===== VARIABLEN =====
unsigned long lastBeaconTime = 0;
bool gpsValid = false;
float lastLat = 0;
float lastLon = 0;
float currentSpeed = 0;

void setup() {
  Serial.begin(115200);
  Serial.println(F("APRS-Tracker Starting..."));

  // Pins konfigurieren
  pinMode(SA818_PTT, OUTPUT);
  pinMode(SA818_PD, OUTPUT);
  pinMode(LED_TX, OUTPUT);
  pinMode(BUTTON_BEACON, INPUT_PULLUP);
  pinMode(BUTTON_MENU, INPUT_PULLUP);

  digitalWrite(SA818_PTT, HIGH);  // PTT aus (active LOW)
  digitalWrite(SA818_PD, LOW);    // SA818 einschalten

  // GPS initialisieren
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println(F("GPS initialized"));

  // SA818 initialisieren
  radioSerial.begin(9600, SERIAL_8N1, SA818_RX, SA818_TX);
  delay(1000);
  setupSA818();

  Serial.println(F("Ready!"));
}

void loop() {
  // GPS einlesen
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      updateGpsData();
    }
  }

  // Manueller Beacon Button
  if (digitalRead(BUTTON_BEACON) == LOW) {
    delay(50);  // Entprellen
    if (digitalRead(BUTTON_BEACON) == LOW) {
      Serial.println(F("Manual beacon triggered"));
      sendAprsPacket();
      while (digitalRead(BUTTON_BEACON) == LOW);  // Warten bis losgelassen
    }
  }

  // Automatischer Beacon
  unsigned long now = millis();
  int interval = (currentSpeed > SPEED_THRESHOLD) ?
                  BEACON_INTERVAL_MOVING : BEACON_INTERVAL_STATIC;

  if (now - lastBeaconTime > (interval * 1000UL)) {
    if (gpsValid) {
      sendAprsPacket();
      lastBeaconTime = now;
    }
  }

  // Status auf Serial ausgeben
  static unsigned long lastStatus = 0;
  if (now - lastStatus > 5000) {
    printStatus();
    lastStatus = now;
  }
}

void updateGpsData() {
  if (gps.location.isValid()) {
    gpsValid = true;
    lastLat = gps.location.lat();
    lastLon = gps.location.lng();
    currentSpeed = gps.speed.kmph();
  }
}

void setupSA818() {
  // SA818 auf 144.800 MHz konfigurieren
  // Format: AT+DMOSETGROUP=0,144.8000,144.8000,0000,0,0000
  radioSerial.println("AT+DMOSETGROUP=0,144.8000,144.8000,0000,0,0000");
  delay(500);

  // Lautstärke
  radioSerial.println("AT+DMOSETVOLUME=4");
  delay(100);
}

void sendAprsPacket() {
  if (!gpsValid) {
    Serial.println(F("No GPS fix - skipping beacon"));
    return;
  }

  // APRS Packet zusammenbauen
  String packet = buildAprsPacket();

  Serial.print(F("Sending: "));
  Serial.println(packet);

  // TX einschalten
  digitalWrite(SA818_PTT, LOW);
  digitalWrite(LED_TX, HIGH);
  delay(500);  // PTT Delay

  // AFSK-Töne senden (vereinfacht - für echtes APRS brauchst du AFSK-Modem!)
  // Hier nur Platzhalter - nutze z.B. LibAPRS oder externe TNC
  sendAFSK(packet);

  delay(100);

  // TX ausschalten
  digitalWrite(SA818_PTT, HIGH);
  digitalWrite(LED_TX, LOW);

  Serial.println(F("Beacon sent!"));
}

String buildAprsPacket() {
  // APRS Position Format
  // OE8XXX-9>APRS,WIDE1-1:!4812.34N/01234.56E>123/045/FunkPilot

  String packet = "";
  packet += CALLSIGN;
  packet += SSID;
  packet += ">APRS,";
  packet += DIGI_PATH;
  packet += ":!";

  // Latitude (DDMM.MMN)
  packet += convertLatitude(lastLat);
  packet += "/";

  // Longitude (DDDMM.MME)
  packet += convertLongitude(lastLon);

  // Symbol
  packet += SYMBOL;

  // Kurs und Geschwindigkeit (optional)
  if (gps.course.isValid() && gps.speed.isValid()) {
    char courseSpeed[8];
    sprintf(courseSpeed, "%03d/%03d",
            (int)gps.course.deg(),
            (int)gps.speed.knots());
    packet += courseSpeed;
  }

  // Kommentar
  packet += "/";
  packet += COMMENT;

  return packet;
}

String convertLatitude(float lat) {
  char result[10];
  int deg = (int)abs(lat);
  float min = (abs(lat) - deg) * 60;
  char ns = (lat >= 0) ? 'N' : 'S';
  sprintf(result, "%02d%05.2f%c", deg, min, ns);
  return String(result);
}

String convertLongitude(float lon) {
  char result[11];
  int deg = (int)abs(lon);
  float min = (abs(lon) - deg) * 60;
  char ew = (lon >= 0) ? 'E' : 'W';
  sprintf(result, "%03d%05.2f%c", deg, min, ew);
  return String(result);
}

void sendAFSK(String packet) {
  // HINWEIS: Dies ist ein Platzhalter!
  // Für echtes APRS benötigst du:
  // - LibAPRS Library (ESP32)
  // - Oder externen TNC (Mobilinkd, etc.)
  // - Oder SA868 Modul mit eingebautem AFSK

  Serial.println(F("AFSK encoding would happen here..."));
  Serial.println(F("Consider using LibAPRS or external TNC"));

  // Simulierte TX-Zeit
  delay(1000);
}

void printStatus() {
  Serial.println(F("--- Status ---"));
  Serial.print(F("GPS: "));
  Serial.println(gpsValid ? "Valid" : "No Fix");

  if (gpsValid) {
    Serial.print(F("Position: "));
    Serial.print(lastLat, 6);
    Serial.print(F(", "));
    Serial.println(lastLon, 6);
    Serial.print(F("Speed: "));
    Serial.print(currentSpeed, 1);
    Serial.println(F(" km/h"));
  }

  Serial.print(F("Satellites: "));
  Serial.println(gps.satellites.value());
  Serial.println(F("--------------"));
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'aprs_tracker.ino',

  wiring: [
    { from: 'ESP32 GPIO16 (RX2)', to: 'GPS TX', color: 'Grün', notes: 'GPS Daten empfangen' },
    { from: 'ESP32 GPIO17 (TX2)', to: 'GPS RX', color: 'Gelb', notes: 'GPS Kommandos' },
    { from: 'ESP32 GPIO4', to: 'SA818 PTT', color: 'Orange', notes: 'Push-To-Talk' },
    { from: 'ESP32 GPIO25 (DAC)', to: 'SA818 MIC', color: 'Blau', notes: 'Audio-Ausgang' },
    { from: 'ESP32 GPIO21 (SDA)', to: 'OLED SDA', color: 'Weiß', notes: 'optional' },
    { from: 'ESP32 GPIO22 (SCL)', to: 'OLED SCL', color: 'Grau', notes: 'optional' },
    { from: 'ESP32 GPIO0', to: 'Taster Beacon', color: 'Gelb', notes: 'manueller Beacon' },
    { from: 'ESP32 3.3V', to: 'GPS VCC + OLED VCC', color: 'Rot' },
    { from: 'SA818 VCC', to: 'LiPo + (über Schalter)', color: 'Rot', notes: '3.3-5V' },
    { from: 'Alle GND', to: 'Gemeinsame Masse', color: 'Schwarz' },
    { from: 'LiPo', to: 'TP4056 BAT+/BAT-', notes: 'Lademodul' },
  ],

  customizationSuggestions: [
    'SmartBeaconing Algorithmus implementieren',
    'WiFi-Webinterface für Konfiguration',
    'APRS-IS Gateway über WiFi',
    'Bluetooth für Handy-App Verbindung',
    'Telemetrie (Batteriespannung, Temperatur)',
    'Geofencing mit Alarmfunktion',
  ],

  externalLinks: [
    { title: 'APRS.fi Live Map', url: 'https://aprs.fi/' },
    { title: 'SA818 Datenblatt', url: 'https://www.nicerf.com/product/sa818.html' },
  ],
};
