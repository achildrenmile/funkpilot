import type { HamProject } from '../../types/projects';

export const aprsTracker: HamProject = {
  id: 'aprs-tracker',
  name: {
    de: 'APRS-Tracker',
    en: 'APRS Tracker',
    sl: 'APRS sledilnik'
  },
  category: 'digital-aprs',
  difficulty: 2,
  description: {
    de: 'Mobiler APRS-Tracker mit ESP32 und GPS. Sendet automatisch Position über 2m FM. Ideal für Wanderungen, SOTA, Auto. Mit WiFi-Konfiguration und Batteriebetrieb.',
    en: 'Mobile APRS tracker with ESP32 and GPS. Automatically transmits position via 2m FM. Ideal for hiking, SOTA, car. With WiFi configuration and battery operation.',
    sl: 'Mobilni APRS sledilnik z ESP32 in GPS. Samodejno oddaja položaj prek 2m FM. Idealen za pohodništvo, SOTA, avto. Z WiFi konfiguracijo in baterijskim napajanjem.'
  },
  hardware: 'esp32',

  components: [
    {
      name: { de: 'ESP32 DevKit', en: 'ESP32 DevKit', sl: 'ESP32 DevKit' },
      quantity: 1,
      notes: { de: 'oder ESP32-S3', en: 'or ESP32-S3', sl: 'ali ESP32-S3' }
    },
    {
      name: { de: 'GPS-Modul NEO-6M/7M', en: 'GPS Module NEO-6M/7M', sl: 'GPS modul NEO-6M/7M' },
      quantity: 1,
      notes: { de: 'mit Antenne', en: 'with antenna', sl: 'z anteno' }
    },
    {
      name: { de: 'SA818 VHF-Modul', en: 'SA818 VHF Module', sl: 'SA818 VHF modul' },
      quantity: 1,
      notes: { de: '2m TX/RX Modul', en: '2m TX/RX module', sl: '2m TX/RX modul' }
    },
    {
      name: { de: 'OLED Display 0.96"', en: 'OLED Display 0.96"', sl: 'OLED zaslon 0.96"' },
      quantity: 1,
      notes: { de: 'optional', en: 'optional', sl: 'neobvezno' }
    },
    {
      name: { de: 'Spannungsregler 3.3V', en: 'Voltage Regulator 3.3V', sl: 'Napetostni regulator 3.3V' },
      quantity: 1,
      notes: { de: 'AMS1117', en: 'AMS1117', sl: 'AMS1117' }
    },
    {
      name: { de: 'LiPo Akku 3.7V', en: 'LiPo Battery 3.7V', sl: 'LiPo baterija 3.7V' },
      quantity: 1,
      notes: { de: '2000mAh empfohlen', en: '2000mAh recommended', sl: '2000mAh priporočeno' }
    },
    {
      name: { de: 'TP4056 Lademodul', en: 'TP4056 Charging Module', sl: 'TP4056 polnilni modul' },
      quantity: 1
    },
    {
      name: { de: 'Antenne 2m', en: '2m Antenna', sl: '2m antena' },
      quantity: 1,
      notes: { de: 'SMA oder BNC', en: 'SMA or BNC', sl: 'SMA ali BNC' }
    },
    {
      name: { de: 'Taster', en: 'Push Buttons', sl: 'Tipke' },
      quantity: 2,
      notes: { de: 'Beacon/Menü', en: 'Beacon/Menu', sl: 'Beacon/Meni' }
    },
    {
      name: { de: 'Gehäuse wasserdicht', en: 'Waterproof Enclosure', sl: 'Vodotesno ohišje' },
      quantity: 1
    },
  ],
  estimatedCost: '~45€',

  code: {
    de: `// =====================================================
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
  delay(500);  // PTT Verzögerung

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

  // Breitengrad (DDMM.MMN)
  packet += convertLatitude(lastLat);
  packet += "/";

  // Längengrad (DDDMM.MME)
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
    en: `// =====================================================
// APRS Tracker - FunkPilot DIY Project
// Hardware: ESP32 + NEO-6M GPS + SA818
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// IMPORTANT: Only operate with a valid amateur radio license!
// APRS Frequency Europe: 144.800 MHz
//
// =====================================================

#include <TinyGPS++.h>
#include <WiFi.h>
#include <Wire.h>

// Optional: OLED Display
// #include <Adafruit_SSD1306.h>

// ===== CONFIGURATION =====
const char* CALLSIGN = "OE8XXX";    // Your callsign
const char* SSID = "-9";             // APRS SSID (-9 = Mobile)
const char* SYMBOL = ">";            // APRS Symbol (> = Car)
const char* COMMENT = "FunkPilot Tracker";

// APRS Path
const char* DIGI_PATH = "WIDE1-1,WIDE2-1";

// Beacon Interval (seconds)
const int BEACON_INTERVAL_MOVING = 60;   // When moving
const int BEACON_INTERVAL_STATIC = 300;  // When stationary
const float SPEED_THRESHOLD = 5.0;       // km/h for motion detection

// ===== PIN ASSIGNMENT =====
#define GPS_RX 16
#define GPS_TX 17
#define SA818_RX 4
#define SA818_TX 5
#define SA818_PTT 18
#define SA818_PD 19
#define BUTTON_BEACON 25
#define BUTTON_MENU 26
#define LED_TX 2

// ===== OBJECTS =====
TinyGPSPlus gps;
HardwareSerial gpsSerial(1);
HardwareSerial radioSerial(2);

// ===== VARIABLES =====
unsigned long lastBeaconTime = 0;
bool gpsValid = false;
float lastLat = 0;
float lastLon = 0;
float currentSpeed = 0;

void setup() {
  Serial.begin(115200);
  Serial.println(F("APRS Tracker Starting..."));

  // Configure pins
  pinMode(SA818_PTT, OUTPUT);
  pinMode(SA818_PD, OUTPUT);
  pinMode(LED_TX, OUTPUT);
  pinMode(BUTTON_BEACON, INPUT_PULLUP);
  pinMode(BUTTON_MENU, INPUT_PULLUP);

  digitalWrite(SA818_PTT, HIGH);  // PTT off (active LOW)
  digitalWrite(SA818_PD, LOW);    // Turn on SA818

  // Initialize GPS
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println(F("GPS initialized"));

  // Initialize SA818
  radioSerial.begin(9600, SERIAL_8N1, SA818_RX, SA818_TX);
  delay(1000);
  setupSA818();

  Serial.println(F("Ready!"));
}

void loop() {
  // Read GPS data
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      updateGpsData();
    }
  }

  // Manual Beacon Button
  if (digitalRead(BUTTON_BEACON) == LOW) {
    delay(50);  // Debounce
    if (digitalRead(BUTTON_BEACON) == LOW) {
      Serial.println(F("Manual beacon triggered"));
      sendAprsPacket();
      while (digitalRead(BUTTON_BEACON) == LOW);  // Wait until released
    }
  }

  // Automatic Beacon
  unsigned long now = millis();
  int interval = (currentSpeed > SPEED_THRESHOLD) ?
                  BEACON_INTERVAL_MOVING : BEACON_INTERVAL_STATIC;

  if (now - lastBeaconTime > (interval * 1000UL)) {
    if (gpsValid) {
      sendAprsPacket();
      lastBeaconTime = now;
    }
  }

  // Output status to Serial
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
  // Configure SA818 to 144.800 MHz
  // Format: AT+DMOSETGROUP=0,144.8000,144.8000,0000,0,0000
  radioSerial.println("AT+DMOSETGROUP=0,144.8000,144.8000,0000,0,0000");
  delay(500);

  // Volume
  radioSerial.println("AT+DMOSETVOLUME=4");
  delay(100);
}

void sendAprsPacket() {
  if (!gpsValid) {
    Serial.println(F("No GPS fix - skipping beacon"));
    return;
  }

  // Build APRS Packet
  String packet = buildAprsPacket();

  Serial.print(F("Sending: "));
  Serial.println(packet);

  // Turn on TX
  digitalWrite(SA818_PTT, LOW);
  digitalWrite(LED_TX, HIGH);
  delay(500);  // PTT Delay

  // Send AFSK tones (simplified - for real APRS you need an AFSK modem!)
  // This is just a placeholder - use e.g. LibAPRS or external TNC
  sendAFSK(packet);

  delay(100);

  // Turn off TX
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

  // Course and Speed (optional)
  if (gps.course.isValid() && gps.speed.isValid()) {
    char courseSpeed[8];
    sprintf(courseSpeed, "%03d/%03d",
            (int)gps.course.deg(),
            (int)gps.speed.knots());
    packet += courseSpeed;
  }

  // Comment
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
  // NOTE: This is a placeholder!
  // For real APRS you need:
  // - LibAPRS Library (ESP32)
  // - Or external TNC (Mobilinkd, etc.)
  // - Or SA868 module with built-in AFSK

  Serial.println(F("AFSK encoding would happen here..."));
  Serial.println(F("Consider using LibAPRS or external TNC"));

  // Simulated TX time
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
    sl: `// =====================================================
// APRS sledilnik - FunkPilot DIY projekt
// Strojna oprema: ESP32 + NEO-6M GPS + SA818
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// POMEMBNO: Uporabljajte samo z veljavno radioamatersko licenco!
// APRS frekvenca Evropa: 144.800 MHz
//
// =====================================================

#include <TinyGPS++.h>
#include <WiFi.h>
#include <Wire.h>

// Neobvezno: OLED zaslon
// #include <Adafruit_SSD1306.h>

// ===== KONFIGURACIJA =====
const char* CALLSIGN = "OE8XXX";    // Vaš klicni znak
const char* SSID = "-9";             // APRS SSID (-9 = Mobilno)
const char* SYMBOL = ">";            // APRS simbol (> = Avto)
const char* COMMENT = "FunkPilot Tracker";

// APRS pot
const char* DIGI_PATH = "WIDE1-1,WIDE2-1";

// Interval oddajanja (sekunde)
const int BEACON_INTERVAL_MOVING = 60;   // Med gibanjem
const int BEACON_INTERVAL_STATIC = 300;  // V mirovanju
const float SPEED_THRESHOLD = 5.0;       // km/h za zaznavanje gibanja

// ===== RAZPORED PINOV =====
#define GPS_RX 16
#define GPS_TX 17
#define SA818_RX 4
#define SA818_TX 5
#define SA818_PTT 18
#define SA818_PD 19
#define BUTTON_BEACON 25
#define BUTTON_MENU 26
#define LED_TX 2

// ===== OBJEKTI =====
TinyGPSPlus gps;
HardwareSerial gpsSerial(1);
HardwareSerial radioSerial(2);

// ===== SPREMENLJIVKE =====
unsigned long lastBeaconTime = 0;
bool gpsValid = false;
float lastLat = 0;
float lastLon = 0;
float currentSpeed = 0;

void setup() {
  Serial.begin(115200);
  Serial.println(F("APRS sledilnik se zaganja..."));

  // Konfiguracija pinov
  pinMode(SA818_PTT, OUTPUT);
  pinMode(SA818_PD, OUTPUT);
  pinMode(LED_TX, OUTPUT);
  pinMode(BUTTON_BEACON, INPUT_PULLUP);
  pinMode(BUTTON_MENU, INPUT_PULLUP);

  digitalWrite(SA818_PTT, HIGH);  // PTT izključen (aktiven LOW)
  digitalWrite(SA818_PD, LOW);    // Vklop SA818

  // Inicializacija GPS
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println(F("GPS inicializiran"));

  // Inicializacija SA818
  radioSerial.begin(9600, SERIAL_8N1, SA818_RX, SA818_TX);
  delay(1000);
  setupSA818();

  Serial.println(F("Pripravljen!"));
}

void loop() {
  // Branje GPS podatkov
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      updateGpsData();
    }
  }

  // Ročni Beacon gumb
  if (digitalRead(BUTTON_BEACON) == LOW) {
    delay(50);  // Odprava odskakovanja
    if (digitalRead(BUTTON_BEACON) == LOW) {
      Serial.println(F("Ročni beacon sprožen"));
      sendAprsPacket();
      while (digitalRead(BUTTON_BEACON) == LOW);  // Čakaj dokler ni spuščen
    }
  }

  // Samodejni Beacon
  unsigned long now = millis();
  int interval = (currentSpeed > SPEED_THRESHOLD) ?
                  BEACON_INTERVAL_MOVING : BEACON_INTERVAL_STATIC;

  if (now - lastBeaconTime > (interval * 1000UL)) {
    if (gpsValid) {
      sendAprsPacket();
      lastBeaconTime = now;
    }
  }

  // Izpis statusa na Serial
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
  // Konfiguracija SA818 na 144.800 MHz
  // Format: AT+DMOSETGROUP=0,144.8000,144.8000,0000,0,0000
  radioSerial.println("AT+DMOSETGROUP=0,144.8000,144.8000,0000,0,0000");
  delay(500);

  // Glasnost
  radioSerial.println("AT+DMOSETVOLUME=4");
  delay(100);
}

void sendAprsPacket() {
  if (!gpsValid) {
    Serial.println(F("Ni GPS signala - preskakujem beacon"));
    return;
  }

  // Sestavi APRS paket
  String packet = buildAprsPacket();

  Serial.print(F("Pošiljam: "));
  Serial.println(packet);

  // Vklop TX
  digitalWrite(SA818_PTT, LOW);
  digitalWrite(LED_TX, HIGH);
  delay(500);  // PTT zakasnitev

  // Pošlji AFSK tone (poenostavljeno - za pravi APRS potrebujete AFSK modem!)
  // To je samo nadomestek - uporabite npr. LibAPRS ali zunanji TNC
  sendAFSK(packet);

  delay(100);

  // Izklop TX
  digitalWrite(SA818_PTT, HIGH);
  digitalWrite(LED_TX, LOW);

  Serial.println(F("Beacon poslan!"));
}

String buildAprsPacket() {
  // APRS format položaja
  // OE8XXX-9>APRS,WIDE1-1:!4812.34N/01234.56E>123/045/FunkPilot

  String packet = "";
  packet += CALLSIGN;
  packet += SSID;
  packet += ">APRS,";
  packet += DIGI_PATH;
  packet += ":!";

  // Zemljepisna širina (DDMM.MMN)
  packet += convertLatitude(lastLat);
  packet += "/";

  // Zemljepisna dolžina (DDDMM.MME)
  packet += convertLongitude(lastLon);

  // Simbol
  packet += SYMBOL;

  // Smer in hitrost (neobvezno)
  if (gps.course.isValid() && gps.speed.isValid()) {
    char courseSpeed[8];
    sprintf(courseSpeed, "%03d/%03d",
            (int)gps.course.deg(),
            (int)gps.speed.knots());
    packet += courseSpeed;
  }

  // Komentar
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
  // OPOMBA: To je nadomestek!
  // Za pravi APRS potrebujete:
  // - LibAPRS knjižnico (ESP32)
  // - Ali zunanji TNC (Mobilinkd, itd.)
  // - Ali SA868 modul z vgrajenim AFSK

  Serial.println(F("AFSK kodiranje bi se zgodilo tukaj..."));
  Serial.println(F("Razmislite o uporabi LibAPRS ali zunanjega TNC"));

  // Simuliran čas oddajanja
  delay(1000);
}

void printStatus() {
  Serial.println(F("--- Status ---"));
  Serial.print(F("GPS: "));
  Serial.println(gpsValid ? "Veljaven" : "Ni signala");

  if (gpsValid) {
    Serial.print(F("Položaj: "));
    Serial.print(lastLat, 6);
    Serial.print(F(", "));
    Serial.println(lastLon, 6);
    Serial.print(F("Hitrost: "));
    Serial.print(currentSpeed, 1);
    Serial.println(F(" km/h"));
  }

  Serial.print(F("Sateliti: "));
  Serial.println(gps.satellites.value());
  Serial.println(F("--------------"));
}
`
  },
  codeLanguage: 'cpp',
  codeFileName: 'aprs_tracker.ino',

  wiring: [
    {
      from: 'ESP32 GPIO16 (RX2)',
      to: 'GPS TX',
      color: 'Grün',
      notes: { de: 'GPS Daten empfangen', en: 'Receive GPS data', sl: 'Sprejem GPS podatkov' }
    },
    {
      from: 'ESP32 GPIO17 (TX2)',
      to: 'GPS RX',
      color: 'Gelb',
      notes: { de: 'GPS Kommandos', en: 'GPS commands', sl: 'GPS ukazi' }
    },
    {
      from: 'ESP32 GPIO4',
      to: 'SA818 PTT',
      color: 'Orange',
      notes: { de: 'Push-To-Talk', en: 'Push-To-Talk', sl: 'Push-To-Talk' }
    },
    {
      from: 'ESP32 GPIO25 (DAC)',
      to: 'SA818 MIC',
      color: 'Blau',
      notes: { de: 'Audio-Ausgang', en: 'Audio output', sl: 'Avdio izhod' }
    },
    {
      from: 'ESP32 GPIO21 (SDA)',
      to: 'OLED SDA',
      color: 'Weiß',
      notes: { de: 'optional', en: 'optional', sl: 'neobvezno' }
    },
    {
      from: 'ESP32 GPIO22 (SCL)',
      to: 'OLED SCL',
      color: 'Grau',
      notes: { de: 'optional', en: 'optional', sl: 'neobvezno' }
    },
    {
      from: 'ESP32 GPIO0',
      to: { de: 'Taster Beacon', en: 'Beacon Button', sl: 'Tipka Beacon' },
      color: 'Gelb',
      notes: { de: 'manueller Beacon', en: 'manual beacon', sl: 'ročni beacon' }
    },
    {
      from: 'ESP32 3.3V',
      to: 'GPS VCC + OLED VCC',
      color: 'Rot'
    },
    {
      from: 'SA818 VCC',
      to: { de: 'LiPo + (über Schalter)', en: 'LiPo + (via switch)', sl: 'LiPo + (preko stikala)' },
      color: 'Rot',
      notes: { de: '3.3-5V', en: '3.3-5V', sl: '3.3-5V' }
    },
    {
      from: { de: 'Alle GND', en: 'All GND', sl: 'Vsi GND' },
      to: { de: 'Gemeinsame Masse', en: 'Common Ground', sl: 'Skupna masa' },
      color: 'Schwarz'
    },
    {
      from: 'LiPo',
      to: 'TP4056 BAT+/BAT-',
      notes: { de: 'Lademodul', en: 'Charging module', sl: 'Polnilni modul' }
    },
  ],

  customizationSuggestions: [
    {
      de: 'SmartBeaconing Algorithmus implementieren',
      en: 'Implement SmartBeaconing algorithm',
      sl: 'Implementirajte algoritem SmartBeaconing'
    },
    {
      de: 'WiFi-Webinterface für Konfiguration',
      en: 'WiFi web interface for configuration',
      sl: 'WiFi spletni vmesnik za konfiguracijo'
    },
    {
      de: 'APRS-IS Gateway über WiFi',
      en: 'APRS-IS gateway via WiFi',
      sl: 'APRS-IS prehod prek WiFi'
    },
    {
      de: 'Bluetooth für Handy-App Verbindung',
      en: 'Bluetooth for mobile app connection',
      sl: 'Bluetooth za povezavo z mobilno aplikacijo'
    },
    {
      de: 'Telemetrie (Batteriespannung, Temperatur)',
      en: 'Telemetry (battery voltage, temperature)',
      sl: 'Telemetrija (napetost baterije, temperatura)'
    },
    {
      de: 'Geofencing mit Alarmfunktion',
      en: 'Geofencing with alarm function',
      sl: 'Geofencing z alarmno funkcijo'
    },
  ],

  externalLinks: [
    {
      title: { de: 'APRS.fi Live-Karte', en: 'APRS.fi Live Map', sl: 'APRS.fi živi zemljevid' },
      url: 'https://aprs.fi/'
    },
    {
      title: { de: 'SA818 Datenblatt', en: 'SA818 Datasheet', sl: 'SA818 podatkovni list' },
      url: 'https://www.nicerf.com/product/sa818.html'
    },
  ],
};
