import type { HamProject } from '../../types/projects';

export const ft8Sync: HamProject = {
  id: 'ft8-sync',
  name: 'FT8 Sync-Anzeige',
  category: 'digital-aprs',
  difficulty: 2,
  description: 'Zeigt FT8/FT4 Timing-Synchronisation an. GPS-gestützte Uhr mit sekundengenauer Anzeige. Countdown bis zum nächsten TX-Slot. Hilft beim Timing ohne PC.',
  hardware: 'esp32',

  components: [
    { name: 'ESP32 DevKit', quantity: 1, notes: 'mit WiFi für NTP' },
    { name: 'GPS-Modul NEO-6M', quantity: 1, notes: 'optional, für Offline' },
    { name: 'OLED Display 1.3"', quantity: 1, notes: 'SH1106 oder SSD1306' },
    { name: 'LED RGB', quantity: 1, notes: 'Timing-Anzeige' },
    { name: 'Piezo Buzzer', quantity: 1, notes: 'akustisches Signal' },
    { name: 'Taster', quantity: 2, notes: 'Mode/Settings' },
  ],
  estimatedCost: '~18€',

  code: `// =====================================================
// FT8 Sync-Anzeige - FunkPilot Bastelprojekt
// Hardware: ESP32 + OLED + GPS (optional)
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// Zeigt FT8/FT4 Timing mit Countdown an
// NTP über WiFi oder GPS für Zeitsync
//
// =====================================================

#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <time.h>

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// WiFi Zugangsdaten
const char* WIFI_SSID = "DEIN_WLAN";
const char* WIFI_PASS = "DEIN_PASSWORT";

// NTP Server
const char* NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET = 3600;      // UTC+1 für MEZ
const int DAYLIGHT_OFFSET = 3600;  // Sommerzeit

// Pins
const int LED_R = 25;
const int LED_G = 26;
const int LED_B = 27;
const int BUZZER = 32;
const int BTN_MODE = 33;

// Modi
enum Mode { FT8, FT4, WSPR };
Mode currentMode = FT8;
const char* modeNames[] = {"FT8", "FT4", "WSPR"};
const int cycleTimes[] = {15, 7, 120};  // Sekunden pro Zyklus

// Status
bool timeValid = false;
int lastSecond = -1;

void setup() {
  Serial.begin(115200);

  // LED Pins
  pinMode(LED_R, OUTPUT);
  pinMode(LED_G, OUTPUT);
  pinMode(LED_B, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(BTN_MODE, INPUT_PULLUP);

  setLED(0, 0, 1);  // Blau = Startup

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED nicht gefunden"));
    while(1);
  }

  showMessage("FT8 Sync", "Connecting...");

  // WiFi verbinden
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("\\nWiFi verbunden"));

    // NTP Zeit synchronisieren
    configTime(GMT_OFFSET, DAYLIGHT_OFFSET, NTP_SERVER);

    // Warten auf gültige Zeit
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
      timeValid = true;
      Serial.println(F("Zeit synchronisiert"));
    }
  } else {
    Serial.println(F("\\nWiFi fehlgeschlagen"));
    showMessage("WiFi", "FAILED!");
    delay(2000);
  }

  setLED(0, 0, 0);
}

void loop() {
  // Mode-Taster
  if (!digitalRead(BTN_MODE)) {
    delay(50);
    while(!digitalRead(BTN_MODE));
    currentMode = (Mode)((currentMode + 1) % 3);
    tone(BUZZER, 1000, 50);
    delay(100);
  }

  // Zeit holen
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    showMessage("ERROR", "No Time!");
    setLED(1, 0, 0);
    delay(1000);
    return;
  }

  int seconds = timeinfo.tm_sec;
  int cycleTime = cycleTimes[currentMode];

  // Nur bei Sekundenwechsel aktualisieren
  if (seconds != lastSecond) {
    lastSecond = seconds;
    updateDisplay(&timeinfo, cycleTime);
    updateLED(seconds, cycleTime);

    // Akustisches Signal bei Zyklusstart
    if (seconds % cycleTime == 0) {
      tone(BUZZER, 800, 100);
    }
    // Countdown-Beep bei 3, 2, 1
    else if (seconds % cycleTime >= cycleTime - 3) {
      tone(BUZZER, 600, 30);
    }
  }

  delay(50);
}

void updateDisplay(struct tm* time, int cycleTime) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header mit Mode
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Mode: "));
  display.print(modeNames[currentMode]);
  display.print(F("  "));
  display.print(cycleTime);
  display.println(F("s"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Uhrzeit gross
  display.setTextSize(2);
  display.setCursor(10, 15);
  char timeStr[10];
  sprintf(timeStr, "%02d:%02d:%02d", time->tm_hour, time->tm_min, time->tm_sec);
  display.println(timeStr);

  // Countdown
  int secondsInCycle = time->tm_sec % cycleTime;
  int countdown = cycleTime - secondsInCycle;

  display.setTextSize(3);
  display.setCursor(40, 38);
  if (countdown < 10) display.print(" ");
  display.print(countdown);

  // Progress Bar
  int progress = map(secondsInCycle, 0, cycleTime, 0, 120);
  display.drawRect(3, 56, 122, 8, SSD1306_WHITE);
  display.fillRect(4, 57, progress, 6, SSD1306_WHITE);

  display.display();
}

void updateLED(int seconds, int cycleTime) {
  int pos = seconds % cycleTime;

  if (pos < 2) {
    // Zyklusstart: Grün
    setLED(0, 1, 0);
  } else if (pos >= cycleTime - 3) {
    // Countdown: Rot blinkend
    setLED((millis() / 200) % 2, 0, 0);
  } else if (pos < cycleTime / 2) {
    // Erste Hälfte: Grün gedimmt
    setLED(0, 0.3, 0);
  } else {
    // Zweite Hälfte: Gelb gedimmt
    setLED(0.3, 0.3, 0);
  }
}

void setLED(float r, float g, float b) {
  analogWrite(LED_R, r * 255);
  analogWrite(LED_G, g * 255);
  analogWrite(LED_B, b * 255);
}

void showMessage(const char* line1, const char* line2) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(20, 20);
  display.println(line1);
  display.setCursor(20, 35);
  display.println(line2);
  display.display();
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'ft8_sync.ino',

  wiring: [
    { from: 'ESP32 GPIO21 (SDA)', to: 'OLED SDA', color: 'Grün' },
    { from: 'ESP32 GPIO22 (SCL)', to: 'OLED SCL', color: 'Gelb' },
    { from: 'ESP32 GPIO25', to: 'LED Rot', color: 'Rot', notes: 'über 220Ω' },
    { from: 'ESP32 GPIO26', to: 'LED Grün', color: 'Grün', notes: 'über 220Ω' },
    { from: 'ESP32 GPIO27', to: 'LED Blau', color: 'Blau', notes: 'über 220Ω' },
    { from: 'ESP32 GPIO32', to: 'Buzzer +', color: 'Orange' },
    { from: 'ESP32 GPIO33', to: 'Taster Mode', color: 'Weiß', notes: 'nach GND' },
    { from: 'ESP32 3.3V', to: 'OLED VCC', color: 'Rot' },
    { from: 'ESP32 GND', to: 'Alle GND', color: 'Schwarz' },
  ],

  customizationSuggestions: [
    'GPS-Modul für Offline-Betrieb',
    'Automatische Zeitzone über IP-Geolocation',
    'TX-Fenster Anzeige (gerade/ungerade)',
    'Integration mit CAT für Band-Anzeige',
    'Bluetooth für Handy-App Sync',
  ],

  externalLinks: [
    { title: 'FT8 Modus Beschreibung', url: 'https://wsjt.sourceforge.io/wsjtx.html' },
    { title: 'Accurate Time Sync', url: 'https://time.is/' },
  ],
};
