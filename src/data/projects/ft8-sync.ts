import type { HamProject } from '../../types/projects';

export const ft8Sync: HamProject = {
  id: 'ft8-sync',
  name: {
    de: 'FT8 Sync-Anzeige',
    en: 'FT8 Sync Display',
    sl: 'FT8 Sync prikazovalnik',
  },
  category: 'digital-aprs',
  difficulty: 2,
  description: {
    de: 'Zeigt FT8/FT4 Timing-Synchronisation an. GPS-gestützte Uhr mit sekundengenauer Anzeige. Countdown bis zum nächsten TX-Slot. Hilft beim Timing ohne PC.',
    en: 'Displays FT8/FT4 timing synchronization. GPS-based clock with second-accurate display. Countdown to next TX slot. Helps with timing without PC.',
    sl: 'Prikazuje FT8/FT4 časovno sinhronizacijo. GPS podprta ura s sekundno natančno prikazom. Odštevanje do naslednjega TX okna. Pomaga pri časovnem usklajevanju brez PC.',
  },
  hardware: 'esp32',

  components: [
    { name: { de: 'ESP32 DevKit', en: 'ESP32 DevKit', sl: 'ESP32 DevKit' }, quantity: 1, notes: { de: 'mit WiFi für NTP', en: 'with WiFi for NTP', sl: 'z WiFi za NTP' } },
    { name: { de: 'GPS-Modul NEO-6M', en: 'GPS module NEO-6M', sl: 'GPS modul NEO-6M' }, quantity: 1, notes: { de: 'optional, für Offline', en: 'optional, for offline use', sl: 'opcijsko, za offline uporabo' } },
    { name: { de: 'OLED Display 1.3"', en: 'OLED Display 1.3"', sl: 'OLED zaslon 1.3"' }, quantity: 1, notes: { de: 'SH1106 oder SSD1306', en: 'SH1106 or SSD1306', sl: 'SH1106 ali SSD1306' } },
    { name: { de: 'LED RGB', en: 'RGB LED', sl: 'RGB LED' }, quantity: 1, notes: { de: 'Timing-Anzeige', en: 'timing indicator', sl: 'časovni indikator' } },
    { name: { de: 'Piezo Buzzer', en: 'Piezo buzzer', sl: 'Piezo brenčač' }, quantity: 1, notes: { de: 'akustisches Signal', en: 'acoustic signal', sl: 'akustični signal' } },
    { name: { de: 'Taster', en: 'Push button', sl: 'Tipka' }, quantity: 2, notes: { de: 'Mode/Settings', en: 'Mode/Settings', sl: 'Način/Nastavitve' } },
  ],
  estimatedCost: '~18€',

  code: {
    de: `// =====================================================
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
    en: `// =====================================================
// FT8 Sync Display - FunkPilot DIY Project
// Hardware: ESP32 + OLED + GPS (optional)
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// Displays FT8/FT4 timing with countdown
// NTP via WiFi or GPS for time sync
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

// WiFi credentials
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASSWORD";

// NTP Server
const char* NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET = 3600;      // UTC+1 for CET
const int DAYLIGHT_OFFSET = 3600;  // Daylight saving time

// Pins
const int LED_R = 25;
const int LED_G = 26;
const int LED_B = 27;
const int BUZZER = 32;
const int BTN_MODE = 33;

// Modes
enum Mode { FT8, FT4, WSPR };
Mode currentMode = FT8;
const char* modeNames[] = {"FT8", "FT4", "WSPR"};
const int cycleTimes[] = {15, 7, 120};  // Seconds per cycle

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

  setLED(0, 0, 1);  // Blue = Startup

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED not found"));
    while(1);
  }

  showMessage("FT8 Sync", "Connecting...");

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("\\nWiFi connected"));

    // Sync NTP time
    configTime(GMT_OFFSET, DAYLIGHT_OFFSET, NTP_SERVER);

    // Wait for valid time
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
      timeValid = true;
      Serial.println(F("Time synchronized"));
    }
  } else {
    Serial.println(F("\\nWiFi failed"));
    showMessage("WiFi", "FAILED!");
    delay(2000);
  }

  setLED(0, 0, 0);
}

void loop() {
  // Mode button
  if (!digitalRead(BTN_MODE)) {
    delay(50);
    while(!digitalRead(BTN_MODE));
    currentMode = (Mode)((currentMode + 1) % 3);
    tone(BUZZER, 1000, 50);
    delay(100);
  }

  // Get time
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    showMessage("ERROR", "No Time!");
    setLED(1, 0, 0);
    delay(1000);
    return;
  }

  int seconds = timeinfo.tm_sec;
  int cycleTime = cycleTimes[currentMode];

  // Only update on second change
  if (seconds != lastSecond) {
    lastSecond = seconds;
    updateDisplay(&timeinfo, cycleTime);
    updateLED(seconds, cycleTime);

    // Acoustic signal at cycle start
    if (seconds % cycleTime == 0) {
      tone(BUZZER, 800, 100);
    }
    // Countdown beep at 3, 2, 1
    else if (seconds % cycleTime >= cycleTime - 3) {
      tone(BUZZER, 600, 30);
    }
  }

  delay(50);
}

void updateDisplay(struct tm* time, int cycleTime) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header with mode
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Mode: "));
  display.print(modeNames[currentMode]);
  display.print(F("  "));
  display.print(cycleTime);
  display.println(F("s"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Time large
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
    // Cycle start: Green
    setLED(0, 1, 0);
  } else if (pos >= cycleTime - 3) {
    // Countdown: Red blinking
    setLED((millis() / 200) % 2, 0, 0);
  } else if (pos < cycleTime / 2) {
    // First half: Green dimmed
    setLED(0, 0.3, 0);
  } else {
    // Second half: Yellow dimmed
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
    sl: `// =====================================================
// FT8 Sync prikazovalnik - FunkPilot DIY projekt
// Strojna oprema: ESP32 + OLED + GPS (opcijsko)
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// Prikazuje FT8/FT4 časovanje z odštevanjem
// NTP preko WiFi ali GPS za časovno sinhronizacijo
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

// WiFi poverilnice
const char* WIFI_SSID = "TVOJ_WIFI";
const char* WIFI_PASS = "TVOJE_GESLO";

// NTP strežnik
const char* NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET = 3600;      // UTC+1 za CET
const int DAYLIGHT_OFFSET = 3600;  // Poletni čas

// Pini
const int LED_R = 25;
const int LED_G = 26;
const int LED_B = 27;
const int BUZZER = 32;
const int BTN_MODE = 33;

// Načini
enum Mode { FT8, FT4, WSPR };
Mode currentMode = FT8;
const char* modeNames[] = {"FT8", "FT4", "WSPR"};
const int cycleTimes[] = {15, 7, 120};  // Sekund na cikel

// Status
bool timeValid = false;
int lastSecond = -1;

void setup() {
  Serial.begin(115200);

  // LED pini
  pinMode(LED_R, OUTPUT);
  pinMode(LED_G, OUTPUT);
  pinMode(LED_B, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(BTN_MODE, INPUT_PULLUP);

  setLED(0, 0, 1);  // Modra = Zagon

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED ni najden"));
    while(1);
  }

  showMessage("FT8 Sync", "Connecting...");

  // Poveži na WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("\\nWiFi povezan"));

    // Sinhroniziraj NTP čas
    configTime(GMT_OFFSET, DAYLIGHT_OFFSET, NTP_SERVER);

    // Počakaj na veljaven čas
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
      timeValid = true;
      Serial.println(F("Čas sinhroniziran"));
    }
  } else {
    Serial.println(F("\\nWiFi ni uspel"));
    showMessage("WiFi", "FAILED!");
    delay(2000);
  }

  setLED(0, 0, 0);
}

void loop() {
  // Tipka za način
  if (!digitalRead(BTN_MODE)) {
    delay(50);
    while(!digitalRead(BTN_MODE));
    currentMode = (Mode)((currentMode + 1) % 3);
    tone(BUZZER, 1000, 50);
    delay(100);
  }

  // Pridobi čas
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    showMessage("ERROR", "No Time!");
    setLED(1, 0, 0);
    delay(1000);
    return;
  }

  int seconds = timeinfo.tm_sec;
  int cycleTime = cycleTimes[currentMode];

  // Posodobi samo ob spremembi sekunde
  if (seconds != lastSecond) {
    lastSecond = seconds;
    updateDisplay(&timeinfo, cycleTime);
    updateLED(seconds, cycleTime);

    // Akustični signal ob začetku cikla
    if (seconds % cycleTime == 0) {
      tone(BUZZER, 800, 100);
    }
    // Odštevalni pisk pri 3, 2, 1
    else if (seconds % cycleTime >= cycleTime - 3) {
      tone(BUZZER, 600, 30);
    }
  }

  delay(50);
}

void updateDisplay(struct tm* time, int cycleTime) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Glava z načinom
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("Mode: "));
  display.print(modeNames[currentMode]);
  display.print(F("  "));
  display.print(cycleTime);
  display.println(F("s"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Čas velik
  display.setTextSize(2);
  display.setCursor(10, 15);
  char timeStr[10];
  sprintf(timeStr, "%02d:%02d:%02d", time->tm_hour, time->tm_min, time->tm_sec);
  display.println(timeStr);

  // Odštevanje
  int secondsInCycle = time->tm_sec % cycleTime;
  int countdown = cycleTime - secondsInCycle;

  display.setTextSize(3);
  display.setCursor(40, 38);
  if (countdown < 10) display.print(" ");
  display.print(countdown);

  // Vrstica napredka
  int progress = map(secondsInCycle, 0, cycleTime, 0, 120);
  display.drawRect(3, 56, 122, 8, SSD1306_WHITE);
  display.fillRect(4, 57, progress, 6, SSD1306_WHITE);

  display.display();
}

void updateLED(int seconds, int cycleTime) {
  int pos = seconds % cycleTime;

  if (pos < 2) {
    // Začetek cikla: Zelena
    setLED(0, 1, 0);
  } else if (pos >= cycleTime - 3) {
    // Odštevanje: Rdeče utripanje
    setLED((millis() / 200) % 2, 0, 0);
  } else if (pos < cycleTime / 2) {
    // Prva polovica: Zelena zatemnjena
    setLED(0, 0.3, 0);
  } else {
    // Druga polovica: Rumena zatemnjena
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
  },
  codeLanguage: 'cpp',
  codeFileName: 'ft8_sync.ino',

  wiring: [
    { from: { de: 'ESP32 GPIO21 (SDA)', en: 'ESP32 GPIO21 (SDA)', sl: 'ESP32 GPIO21 (SDA)' }, to: { de: 'OLED SDA', en: 'OLED SDA', sl: 'OLED SDA' }, color: 'Grün' },
    { from: { de: 'ESP32 GPIO22 (SCL)', en: 'ESP32 GPIO22 (SCL)', sl: 'ESP32 GPIO22 (SCL)' }, to: { de: 'OLED SCL', en: 'OLED SCL', sl: 'OLED SCL' }, color: 'Gelb' },
    { from: { de: 'ESP32 GPIO25', en: 'ESP32 GPIO25', sl: 'ESP32 GPIO25' }, to: { de: 'LED Rot', en: 'LED Red', sl: 'LED rdeča' }, color: 'Rot', notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' } },
    { from: { de: 'ESP32 GPIO26', en: 'ESP32 GPIO26', sl: 'ESP32 GPIO26' }, to: { de: 'LED Grün', en: 'LED Green', sl: 'LED zelena' }, color: 'Grün', notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' } },
    { from: { de: 'ESP32 GPIO27', en: 'ESP32 GPIO27', sl: 'ESP32 GPIO27' }, to: { de: 'LED Blau', en: 'LED Blue', sl: 'LED modra' }, color: 'Blau', notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' } },
    { from: { de: 'ESP32 GPIO32', en: 'ESP32 GPIO32', sl: 'ESP32 GPIO32' }, to: { de: 'Buzzer +', en: 'Buzzer +', sl: 'Brenčač +' }, color: 'Orange' },
    { from: { de: 'ESP32 GPIO33', en: 'ESP32 GPIO33', sl: 'ESP32 GPIO33' }, to: { de: 'Taster Mode', en: 'Mode button', sl: 'Tipka način' }, color: 'Weiß', notes: { de: 'nach GND', en: 'to GND', sl: 'na GND' } },
    { from: { de: 'ESP32 3.3V', en: 'ESP32 3.3V', sl: 'ESP32 3.3V' }, to: { de: 'OLED VCC', en: 'OLED VCC', sl: 'OLED VCC' }, color: 'Rot' },
    { from: { de: 'ESP32 GND', en: 'ESP32 GND', sl: 'ESP32 GND' }, to: { de: 'Alle GND', en: 'All GND', sl: 'Vsi GND' }, color: 'Schwarz' },
  ],

  customizationSuggestions: [
    { de: 'GPS-Modul für Offline-Betrieb', en: 'GPS module for offline operation', sl: 'GPS modul za offline delovanje' },
    { de: 'Automatische Zeitzone über IP-Geolocation', en: 'Automatic timezone via IP geolocation', sl: 'Avtomatski časovni pas preko IP geolokacije' },
    { de: 'TX-Fenster Anzeige (gerade/ungerade)', en: 'TX window display (even/odd)', sl: 'Prikaz TX okna (sodo/liho)' },
    { de: 'Integration mit CAT für Band-Anzeige', en: 'Integration with CAT for band display', sl: 'Integracija s CAT za prikaz banda' },
    { de: 'Bluetooth für Handy-App Sync', en: 'Bluetooth for phone app sync', sl: 'Bluetooth za sinhronizacijo z mobilno aplikacijo' },
  ],

  externalLinks: [
    { title: { de: 'FT8 Modus Beschreibung', en: 'FT8 Mode Description', sl: 'Opis FT8 načina' }, url: 'https://wsjt.sourceforge.io/wsjtx.html' },
    { title: { de: 'Accurate Time Sync', en: 'Accurate Time Sync', sl: 'Natančna časovna sinhronizacija' }, url: 'https://time.is/' },
  ],
};
