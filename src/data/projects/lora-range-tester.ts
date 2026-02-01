import type { HamProject } from '../../types/projects';

export const loraRangeTester: HamProject = {
  id: 'lora-range-tester',
  name: {
    de: 'LoRa Reichweiten-Tester',
    en: 'LoRa Range Tester',
    sl: 'LoRa tester dosega',
  },
  category: 'mesh-lora',
  difficulty: 2,
  description: {
    de: 'RSSI und SNR Anzeige für LoRa-Signale. Perfekt um Antennen zu vergleichen und optimale Standorte zu finden.',
    en: 'RSSI and SNR display for LoRa signals. Perfect for comparing antennas and finding optimal locations.',
    sl: 'RSSI in SNR prikaz za LoRa signale. Odlično za primerjavo anten in iskanje optimalnih lokacij.',
  },
  hardware: 'esp32-lora',
  projectType: 'build',

  components: [
    { name: { de: 'Heltec LoRa V3 oder T-Beam', en: 'Heltec LoRa V3 or T-Beam', sl: 'Heltec LoRa V3 ali T-Beam' }, quantity: 2, notes: { de: 'Sender + Empfänger', en: 'Transmitter + Receiver', sl: 'Oddajnik + Sprejemnik' } },
    { name: { de: 'OLED Display 0.96"', en: 'OLED Display 0.96"', sl: 'OLED zaslon 0.96"' }, quantity: 1, notes: { de: 'Falls nicht integriert (I2C)', en: 'If not integrated (I2C)', sl: 'Če ni vgrajen (I2C)' } },
    { name: { de: 'Taster', en: 'Button', sl: 'Tipka' }, quantity: 1, notes: { de: 'Zum Senden von Test-Paketen', en: 'For sending test packets', sl: 'Za pošiljanje testnih paketov' } },
    { name: { de: 'LiPo Akku', en: 'LiPo battery', sl: 'LiPo baterija' }, quantity: 1, notes: { de: 'Für mobilen Betrieb', en: 'For mobile operation', sl: 'Za mobilno uporabo' } },
    { name: { de: 'Verschiedene Antennen', en: 'Various antennas', sl: 'Različne antene' }, quantity: 1, notes: { de: 'Zum Vergleichen', en: 'For comparison', sl: 'Za primerjavo' } },
  ],
  estimatedCost: '50-80 EUR',

  wiring: [
    { from: { de: 'Taster Pin 1', en: 'Button Pin 1', sl: 'Tipka Pin 1' }, to: { de: 'GPIO 0', en: 'GPIO 0', sl: 'GPIO 0' }, color: 'gelb', notes: { de: 'Boot-Button oft vorhanden', en: 'Boot button often present', sl: 'Boot tipka pogosto prisotna' } },
    { from: { de: 'Taster Pin 2', en: 'Button Pin 2', sl: 'Tipka Pin 2' }, to: { de: 'GND', en: 'GND', sl: 'GND' }, color: 'schwarz' },
  ],

  code: {
    de: `/*
 * LoRa Reichweiten-Tester
 * =======================
 *
 * Zeigt RSSI (Signalstärke) und SNR (Signal-Rausch-Verhältnis)
 * von empfangenen LoRa-Paketen auf dem OLED-Display an.
 *
 * Hardware: Heltec LoRa V3, T-Beam, oder ESP32 + SX1276/SX1262
 *
 * Modus 1 (SENDER): Sendet regelmäßig Test-Pakete
 * Modus 2 (EMPFÄNGER): Zeigt RSSI/SNR der empfangenen Pakete
 */

#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// =====================================================
// KONFIGURATION - An dein Board anpassen!
// =====================================================

// Modus: true = Sender, false = Empfänger
#define IS_SENDER false

// LoRa Frequenz (EU: 868 MHz)
#define LORA_FREQ 868E6

// LoRa Parameter
#define LORA_BANDWIDTH 125E3      // 125 kHz
#define LORA_SPREADING_FACTOR 10  // SF7-SF12 (höher = mehr Reichweite)
#define LORA_CODING_RATE 5        // 4/5

// Sende-Intervall (nur für Sender)
#define SEND_INTERVAL 3000  // 3 Sekunden

// Display
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// Pin-Konfiguration (Heltec LoRa V3)
// Für andere Boards anpassen!
#define LORA_SCK   9
#define LORA_MISO  11
#define LORA_MOSI  10
#define LORA_SS    8
#define LORA_RST   12
#define LORA_DIO0  14

#define OLED_SDA   17
#define OLED_SCL   18
#define OLED_RST   21

// =====================================================
// GLOBALE VARIABLEN
// =====================================================

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RST);

unsigned long lastSendTime = 0;
unsigned long packetCount = 0;
unsigned long rxPacketCount = 0;

// Letzte empfangene Werte
int lastRssi = 0;
float lastSnr = 0;
int minRssi = 0;
int maxRssi = -200;
float avgRssi = 0;

// =====================================================
// SETUP
// =====================================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Display Reset (falls Pin vorhanden)
  #ifdef OLED_RST
  pinMode(OLED_RST, OUTPUT);
  digitalWrite(OLED_RST, LOW);
  delay(20);
  digitalWrite(OLED_RST, HIGH);
  #endif

  // I2C & Display initialisieren
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Display nicht gefunden!");
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("LoRa Range Tester");
  display.println(IS_SENDER ? "Mode: SENDER" : "Mode: RECEIVER");
  display.display();
  delay(1000);

  // SPI für LoRa
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);

  // LoRa initialisieren
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  if (!LoRa.begin(LORA_FREQ)) {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("LoRa FEHLER!");
    display.display();
    while (1);
  }

  // LoRa Parameter setzen
  LoRa.setSpreadingFactor(LORA_SPREADING_FACTOR);
  LoRa.setSignalBandwidth(LORA_BANDWIDTH);
  LoRa.setCodingRate4(LORA_CODING_RATE);
  LoRa.setSyncWord(0x12);  // Privater Sync-Word

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("LoRa OK!");
  display.print("Freq: ");
  display.print(LORA_FREQ / 1E6, 1);
  display.println(" MHz");
  display.print("SF: ");
  display.println(LORA_SPREADING_FACTOR);
  display.display();
  delay(2000);

  Serial.println("LoRa Range Tester bereit");
}

// =====================================================
// MAIN LOOP
// =====================================================

void loop() {
  if (IS_SENDER) {
    senderLoop();
  } else {
    receiverLoop();
  }
}

// =====================================================
// SENDER
// =====================================================

void senderLoop() {
  unsigned long currentTime = millis();

  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    packetCount++;

    // Paket senden
    LoRa.beginPacket();
    LoRa.print("TEST#");
    LoRa.print(packetCount);
    LoRa.endPacket();

    // Display aktualisieren
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("=== SENDER ===");
    display.println();
    display.setTextSize(2);
    display.print("TX #");
    display.println(packetCount);
    display.setTextSize(1);
    display.println();
    display.print("Freq: ");
    display.print(LORA_FREQ / 1E6, 1);
    display.println(" MHz");
    display.print("SF: ");
    display.print(LORA_SPREADING_FACTOR);
    display.print(" BW: ");
    display.print(LORA_BANDWIDTH / 1000, 0);
    display.display();

    Serial.print("Sent packet #");
    Serial.println(packetCount);

    lastSendTime = currentTime;
  }
}

// =====================================================
// EMPFÄNGER
// =====================================================

void receiverLoop() {
  int packetSize = LoRa.parsePacket();

  if (packetSize) {
    rxPacketCount++;

    // Paket lesen
    String incoming = "";
    while (LoRa.available()) {
      incoming += (char)LoRa.read();
    }

    // RSSI und SNR auslesen
    lastRssi = LoRa.packetRssi();
    lastSnr = LoRa.packetSnr();

    // Statistik aktualisieren
    if (lastRssi < minRssi) minRssi = lastRssi;
    if (lastRssi > maxRssi) maxRssi = lastRssi;
    avgRssi = (avgRssi * (rxPacketCount - 1) + lastRssi) / rxPacketCount;

    // Display aktualisieren
    updateReceiverDisplay(incoming);

    // Serial ausgabe
    Serial.print("RX: ");
    Serial.print(incoming);
    Serial.print(" | RSSI: ");
    Serial.print(lastRssi);
    Serial.print(" dBm | SNR: ");
    Serial.print(lastSnr);
    Serial.println(" dB");
  }

  // Display regelmäßig aktualisieren (auch ohne Empfang)
  static unsigned long lastDisplayUpdate = 0;
  if (millis() - lastDisplayUpdate > 500) {
    if (rxPacketCount > 0) {
      updateReceiverDisplay("");
    } else {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("=== EMPFAENGER ===");
      display.println();
      display.println("Warte auf Pakete...");
      display.println();
      display.print("Freq: ");
      display.print(LORA_FREQ / 1E6, 1);
      display.println(" MHz");
      display.print("SF: ");
      display.println(LORA_SPREADING_FACTOR);
      display.display();
    }
    lastDisplayUpdate = millis();
  }
}

void updateReceiverDisplay(String lastPacket) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);

  display.println("=== EMPFAENGER ===");

  // RSSI groß anzeigen
  display.setTextSize(2);
  display.print(lastRssi);
  display.setTextSize(1);
  display.println(" dBm");

  // SNR
  display.print("SNR: ");
  display.print(lastSnr, 1);
  display.println(" dB");

  // Signalqualität als Balken
  display.print("Qual: ");
  int bars = map(lastRssi, -120, -40, 0, 10);
  bars = constrain(bars, 0, 10);
  for (int i = 0; i < bars; i++) {
    display.print("|");
  }
  display.println();

  // Statistik
  display.print("Min:");
  display.print(minRssi);
  display.print(" Max:");
  display.print(maxRssi);
  display.println();

  display.print("Avg:");
  display.print(avgRssi, 0);
  display.print(" Pkts:");
  display.println(rxPacketCount);

  display.display();
}

// =====================================================
// RSSI INTERPRETATION
// =====================================================

/*
RSSI Werte interpretieren:
--------------------------
  -30 bis -50 dBm: Ausgezeichnet (sehr nah)
  -50 bis -70 dBm: Sehr gut
  -70 bis -85 dBm: Gut
  -85 bis -100 dBm: Akzeptabel
  -100 bis -110 dBm: Schwach
  -110 bis -120 dBm: Grenzwertig
  < -120 dBm: Kein Empfang

SNR (Signal-Rausch-Verhältnis):
-------------------------------
  > 10 dB: Ausgezeichnet
  5-10 dB: Sehr gut
  0-5 dB: Gut
  -5 bis 0 dB: Akzeptabel
  < -5 dB: Schwach (aber LoRa kann das!)

LoRa kann Signale bis -20 dB SNR decodieren!
Das macht es so gut für große Reichweiten.

TIPPS FÜR REICHWEITEN-TESTS:
----------------------------
1. Sender an festem Standort
2. Mit Empfänger umhergehen
3. RSSI und SNR beobachten
4. Verschiedene Antennen vergleichen
5. Hindernisse identifizieren
*/
`,
    en: `/*
 * LoRa Range Tester
 * =================
 *
 * Displays RSSI (signal strength) and SNR (signal-to-noise ratio)
 * of received LoRa packets on the OLED display.
 *
 * Hardware: Heltec LoRa V3, T-Beam, or ESP32 + SX1276/SX1262
 *
 * Mode 1 (TRANSMITTER): Sends test packets periodically
 * Mode 2 (RECEIVER): Shows RSSI/SNR of received packets
 */

#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// =====================================================
// CONFIGURATION - Adjust for your board!
// =====================================================

// Mode: true = Transmitter, false = Receiver
#define IS_SENDER false

// LoRa frequency (EU: 868 MHz)
#define LORA_FREQ 868E6

// LoRa parameters
#define LORA_BANDWIDTH 125E3      // 125 kHz
#define LORA_SPREADING_FACTOR 10  // SF7-SF12 (higher = more range)
#define LORA_CODING_RATE 5        // 4/5

// Transmit interval (transmitter only)
#define SEND_INTERVAL 3000  // 3 seconds

// Display
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// Pin configuration (Heltec LoRa V3)
// Adjust for other boards!
#define LORA_SCK   9
#define LORA_MISO  11
#define LORA_MOSI  10
#define LORA_SS    8
#define LORA_RST   12
#define LORA_DIO0  14

#define OLED_SDA   17
#define OLED_SCL   18
#define OLED_RST   21

// =====================================================
// GLOBAL VARIABLES
// =====================================================

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RST);

unsigned long lastSendTime = 0;
unsigned long packetCount = 0;
unsigned long rxPacketCount = 0;

// Last received values
int lastRssi = 0;
float lastSnr = 0;
int minRssi = 0;
int maxRssi = -200;
float avgRssi = 0;

// =====================================================
// SETUP
// =====================================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Display reset (if pin available)
  #ifdef OLED_RST
  pinMode(OLED_RST, OUTPUT);
  digitalWrite(OLED_RST, LOW);
  delay(20);
  digitalWrite(OLED_RST, HIGH);
  #endif

  // Initialize I2C & display
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Display not found!");
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("LoRa Range Tester");
  display.println(IS_SENDER ? "Mode: SENDER" : "Mode: RECEIVER");
  display.display();
  delay(1000);

  // SPI for LoRa
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);

  // Initialize LoRa
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  if (!LoRa.begin(LORA_FREQ)) {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("LoRa ERROR!");
    display.display();
    while (1);
  }

  // Set LoRa parameters
  LoRa.setSpreadingFactor(LORA_SPREADING_FACTOR);
  LoRa.setSignalBandwidth(LORA_BANDWIDTH);
  LoRa.setCodingRate4(LORA_CODING_RATE);
  LoRa.setSyncWord(0x12);  // Private sync word

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("LoRa OK!");
  display.print("Freq: ");
  display.print(LORA_FREQ / 1E6, 1);
  display.println(" MHz");
  display.print("SF: ");
  display.println(LORA_SPREADING_FACTOR);
  display.display();
  delay(2000);

  Serial.println("LoRa Range Tester ready");
}

// =====================================================
// MAIN LOOP
// =====================================================

void loop() {
  if (IS_SENDER) {
    senderLoop();
  } else {
    receiverLoop();
  }
}

// =====================================================
// TRANSMITTER
// =====================================================

void senderLoop() {
  unsigned long currentTime = millis();

  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    packetCount++;

    // Send packet
    LoRa.beginPacket();
    LoRa.print("TEST#");
    LoRa.print(packetCount);
    LoRa.endPacket();

    // Update display
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("=== SENDER ===");
    display.println();
    display.setTextSize(2);
    display.print("TX #");
    display.println(packetCount);
    display.setTextSize(1);
    display.println();
    display.print("Freq: ");
    display.print(LORA_FREQ / 1E6, 1);
    display.println(" MHz");
    display.print("SF: ");
    display.print(LORA_SPREADING_FACTOR);
    display.print(" BW: ");
    display.print(LORA_BANDWIDTH / 1000, 0);
    display.display();

    Serial.print("Sent packet #");
    Serial.println(packetCount);

    lastSendTime = currentTime;
  }
}

// =====================================================
// RECEIVER
// =====================================================

void receiverLoop() {
  int packetSize = LoRa.parsePacket();

  if (packetSize) {
    rxPacketCount++;

    // Read packet
    String incoming = "";
    while (LoRa.available()) {
      incoming += (char)LoRa.read();
    }

    // Read RSSI and SNR
    lastRssi = LoRa.packetRssi();
    lastSnr = LoRa.packetSnr();

    // Update statistics
    if (lastRssi < minRssi) minRssi = lastRssi;
    if (lastRssi > maxRssi) maxRssi = lastRssi;
    avgRssi = (avgRssi * (rxPacketCount - 1) + lastRssi) / rxPacketCount;

    // Update display
    updateReceiverDisplay(incoming);

    // Serial output
    Serial.print("RX: ");
    Serial.print(incoming);
    Serial.print(" | RSSI: ");
    Serial.print(lastRssi);
    Serial.print(" dBm | SNR: ");
    Serial.print(lastSnr);
    Serial.println(" dB");
  }

  // Update display periodically (even without reception)
  static unsigned long lastDisplayUpdate = 0;
  if (millis() - lastDisplayUpdate > 500) {
    if (rxPacketCount > 0) {
      updateReceiverDisplay("");
    } else {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("=== RECEIVER ===");
      display.println();
      display.println("Waiting for packets...");
      display.println();
      display.print("Freq: ");
      display.print(LORA_FREQ / 1E6, 1);
      display.println(" MHz");
      display.print("SF: ");
      display.println(LORA_SPREADING_FACTOR);
      display.display();
    }
    lastDisplayUpdate = millis();
  }
}

void updateReceiverDisplay(String lastPacket) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);

  display.println("=== RECEIVER ===");

  // Display RSSI large
  display.setTextSize(2);
  display.print(lastRssi);
  display.setTextSize(1);
  display.println(" dBm");

  // SNR
  display.print("SNR: ");
  display.print(lastSnr, 1);
  display.println(" dB");

  // Signal quality as bar
  display.print("Qual: ");
  int bars = map(lastRssi, -120, -40, 0, 10);
  bars = constrain(bars, 0, 10);
  for (int i = 0; i < bars; i++) {
    display.print("|");
  }
  display.println();

  // Statistics
  display.print("Min:");
  display.print(minRssi);
  display.print(" Max:");
  display.print(maxRssi);
  display.println();

  display.print("Avg:");
  display.print(avgRssi, 0);
  display.print(" Pkts:");
  display.println(rxPacketCount);

  display.display();
}

// =====================================================
// RSSI INTERPRETATION
// =====================================================

/*
Interpreting RSSI values:
-------------------------
  -30 to -50 dBm: Excellent (very close)
  -50 to -70 dBm: Very good
  -70 to -85 dBm: Good
  -85 to -100 dBm: Acceptable
  -100 to -110 dBm: Weak
  -110 to -120 dBm: Marginal
  < -120 dBm: No reception

SNR (Signal-to-Noise Ratio):
----------------------------
  > 10 dB: Excellent
  5-10 dB: Very good
  0-5 dB: Good
  -5 to 0 dB: Acceptable
  < -5 dB: Weak (but LoRa can handle it!)

LoRa can decode signals down to -20 dB SNR!
That's what makes it so good for long range.

TIPS FOR RANGE TESTING:
-----------------------
1. Place transmitter at fixed location
2. Walk around with receiver
3. Observe RSSI and SNR
4. Compare different antennas
5. Identify obstacles
*/
`,
    sl: `/*
 * LoRa tester dosega
 * ==================
 *
 * Prikazuje RSSI (moč signala) in SNR (razmerje signal-šum)
 * prejetih LoRa paketov na OLED zaslonu.
 *
 * Strojna oprema: Heltec LoRa V3, T-Beam ali ESP32 + SX1276/SX1262
 *
 * Način 1 (ODDAJNIK): Periodično pošilja testne pakete
 * Način 2 (SPREJEMNIK): Prikazuje RSSI/SNR prejetih paketov
 */

#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// =====================================================
// KONFIGURACIJA - Prilagodi za svojo ploščo!
// =====================================================

// Način: true = Oddajnik, false = Sprejemnik
#define IS_SENDER false

// LoRa frekvenca (EU: 868 MHz)
#define LORA_FREQ 868E6

// LoRa parametri
#define LORA_BANDWIDTH 125E3      // 125 kHz
#define LORA_SPREADING_FACTOR 10  // SF7-SF12 (višje = večji doseg)
#define LORA_CODING_RATE 5        // 4/5

// Interval oddajanja (samo za oddajnik)
#define SEND_INTERVAL 3000  // 3 sekunde

// Zaslon
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// Konfiguracija pinov (Heltec LoRa V3)
// Prilagodi za druge plošče!
#define LORA_SCK   9
#define LORA_MISO  11
#define LORA_MOSI  10
#define LORA_SS    8
#define LORA_RST   12
#define LORA_DIO0  14

#define OLED_SDA   17
#define OLED_SCL   18
#define OLED_RST   21

// =====================================================
// GLOBALNE SPREMENLJIVKE
// =====================================================

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RST);

unsigned long lastSendTime = 0;
unsigned long packetCount = 0;
unsigned long rxPacketCount = 0;

// Zadnje prejete vrednosti
int lastRssi = 0;
float lastSnr = 0;
int minRssi = 0;
int maxRssi = -200;
float avgRssi = 0;

// =====================================================
// SETUP
// =====================================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Ponastavitev zaslona (če je pin na voljo)
  #ifdef OLED_RST
  pinMode(OLED_RST, OUTPUT);
  digitalWrite(OLED_RST, LOW);
  delay(20);
  digitalWrite(OLED_RST, HIGH);
  #endif

  // Inicializacija I2C in zaslona
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Zaslon ni najden!");
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("LoRa Range Tester");
  display.println(IS_SENDER ? "Mode: SENDER" : "Mode: RECEIVER");
  display.display();
  delay(1000);

  // SPI za LoRa
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);

  // Inicializacija LoRa
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  if (!LoRa.begin(LORA_FREQ)) {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("LoRa NAPAKA!");
    display.display();
    while (1);
  }

  // Nastavitev LoRa parametrov
  LoRa.setSpreadingFactor(LORA_SPREADING_FACTOR);
  LoRa.setSignalBandwidth(LORA_BANDWIDTH);
  LoRa.setCodingRate4(LORA_CODING_RATE);
  LoRa.setSyncWord(0x12);  // Zasebna sinhronizacijska beseda

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("LoRa OK!");
  display.print("Freq: ");
  display.print(LORA_FREQ / 1E6, 1);
  display.println(" MHz");
  display.print("SF: ");
  display.println(LORA_SPREADING_FACTOR);
  display.display();
  delay(2000);

  Serial.println("LoRa Range Tester pripravljen");
}

// =====================================================
// GLAVNA ZANKA
// =====================================================

void loop() {
  if (IS_SENDER) {
    senderLoop();
  } else {
    receiverLoop();
  }
}

// =====================================================
// ODDAJNIK
// =====================================================

void senderLoop() {
  unsigned long currentTime = millis();

  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    packetCount++;

    // Pošlji paket
    LoRa.beginPacket();
    LoRa.print("TEST#");
    LoRa.print(packetCount);
    LoRa.endPacket();

    // Posodobi zaslon
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("=== ODDAJNIK ===");
    display.println();
    display.setTextSize(2);
    display.print("TX #");
    display.println(packetCount);
    display.setTextSize(1);
    display.println();
    display.print("Freq: ");
    display.print(LORA_FREQ / 1E6, 1);
    display.println(" MHz");
    display.print("SF: ");
    display.print(LORA_SPREADING_FACTOR);
    display.print(" BW: ");
    display.print(LORA_BANDWIDTH / 1000, 0);
    display.display();

    Serial.print("Poslan paket #");
    Serial.println(packetCount);

    lastSendTime = currentTime;
  }
}

// =====================================================
// SPREJEMNIK
// =====================================================

void receiverLoop() {
  int packetSize = LoRa.parsePacket();

  if (packetSize) {
    rxPacketCount++;

    // Preberi paket
    String incoming = "";
    while (LoRa.available()) {
      incoming += (char)LoRa.read();
    }

    // Preberi RSSI in SNR
    lastRssi = LoRa.packetRssi();
    lastSnr = LoRa.packetSnr();

    // Posodobi statistiko
    if (lastRssi < minRssi) minRssi = lastRssi;
    if (lastRssi > maxRssi) maxRssi = lastRssi;
    avgRssi = (avgRssi * (rxPacketCount - 1) + lastRssi) / rxPacketCount;

    // Posodobi zaslon
    updateReceiverDisplay(incoming);

    // Serijski izhod
    Serial.print("RX: ");
    Serial.print(incoming);
    Serial.print(" | RSSI: ");
    Serial.print(lastRssi);
    Serial.print(" dBm | SNR: ");
    Serial.print(lastSnr);
    Serial.println(" dB");
  }

  // Periodično posodabljaj zaslon (tudi brez sprejema)
  static unsigned long lastDisplayUpdate = 0;
  if (millis() - lastDisplayUpdate > 500) {
    if (rxPacketCount > 0) {
      updateReceiverDisplay("");
    } else {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("=== SPREJEMNIK ===");
      display.println();
      display.println("Cakam na pakete...");
      display.println();
      display.print("Freq: ");
      display.print(LORA_FREQ / 1E6, 1);
      display.println(" MHz");
      display.print("SF: ");
      display.println(LORA_SPREADING_FACTOR);
      display.display();
    }
    lastDisplayUpdate = millis();
  }
}

void updateReceiverDisplay(String lastPacket) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);

  display.println("=== SPREJEMNIK ===");

  // Prikaži RSSI veliko
  display.setTextSize(2);
  display.print(lastRssi);
  display.setTextSize(1);
  display.println(" dBm");

  // SNR
  display.print("SNR: ");
  display.print(lastSnr, 1);
  display.println(" dB");

  // Kakovost signala kot stolpec
  display.print("Kval: ");
  int bars = map(lastRssi, -120, -40, 0, 10);
  bars = constrain(bars, 0, 10);
  for (int i = 0; i < bars; i++) {
    display.print("|");
  }
  display.println();

  // Statistika
  display.print("Min:");
  display.print(minRssi);
  display.print(" Max:");
  display.print(maxRssi);
  display.println();

  display.print("Avg:");
  display.print(avgRssi, 0);
  display.print(" Pkts:");
  display.println(rxPacketCount);

  display.display();
}

// =====================================================
// INTERPRETACIJA RSSI
// =====================================================

/*
Interpretacija RSSI vrednosti:
------------------------------
  -30 do -50 dBm: Odlično (zelo blizu)
  -50 do -70 dBm: Zelo dobro
  -70 do -85 dBm: Dobro
  -85 do -100 dBm: Sprejemljivo
  -100 do -110 dBm: Šibko
  -110 do -120 dBm: Mejno
  < -120 dBm: Ni sprejema

SNR (razmerje signal-šum):
--------------------------
  > 10 dB: Odlično
  5-10 dB: Zelo dobro
  0-5 dB: Dobro
  -5 do 0 dB: Sprejemljivo
  < -5 dB: Šibko (vendar LoRa to zmore!)

LoRa lahko dekodira signale do -20 dB SNR!
To je tisto, kar ga naredi tako dobrega za velike razdalje.

NASVETI ZA TESTIRANJE DOSEGA:
-----------------------------
1. Postavite oddajnik na fiksno lokacijo
2. Hodite naokoli s sprejemnikom
3. Opazujte RSSI in SNR
4. Primerjajte različne antene
5. Identificirajte ovire
*/
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'lora_range_tester.ino',

  externalLinks: [
    { title: { de: 'LoRa Library (Arduino)', en: 'LoRa Library (Arduino)', sl: 'LoRa knjižnica (Arduino)' }, url: 'https://github.com/sandeepmistry/arduino-LoRa' },
    { title: { de: 'RSSI erklärt', en: 'RSSI explained', sl: 'RSSI razložen' }, url: 'https://de.wikipedia.org/wiki/Received_Signal_Strength_Indication' },
    { title: { de: 'LoRa Reichweite maximieren', en: 'Maximizing LoRa range', sl: 'Maksimiziranje dosega LoRa' }, url: 'https://meshtastic.org/docs/overview/range-tests/' },
  ],

  customizationSuggestions: [
    { de: 'Wie kann ich die Sendeleistung ändern?', en: 'How can I change the transmit power?', sl: 'Kako lahko spremenim oddajno moč?' },
    { de: 'Welcher Spreading Factor für mehr Reichweite?', en: 'Which spreading factor for more range?', sl: 'Kateri spreading factor za večji doseg?' },
    { de: 'Kann ich GPS-Koordinaten mitsenden?', en: 'Can I send GPS coordinates along?', sl: 'Ali lahko pošljem GPS koordinate?' },
    { de: 'Wie speichere ich die Messwerte?', en: 'How do I save the measurements?', sl: 'Kako shranim meritve?' },
    { de: 'Wie vergleiche ich verschiedene Antennen?', en: 'How do I compare different antennas?', sl: 'Kako primerjam različne antene?' },
  ],

  hardwareOptions: [
    {
      name: { de: 'Heltec LoRa V3 (2 Stück)', en: 'Heltec LoRa V3 (2 pieces)', sl: 'Heltec LoRa V3 (2 kosa)' },
      price: '~50€',
      features: [
        { de: 'OLED integriert', en: 'OLED integrated', sl: 'OLED vgrajen' },
        { de: 'USB-C', en: 'USB-C', sl: 'USB-C' },
        { de: 'Kompakt', en: 'Compact', sl: 'Kompakten' },
      ],
      recommended: true,
    },
    {
      name: { de: 'LILYGO T-Beam (2 Stück)', en: 'LILYGO T-Beam (2 pieces)', sl: 'LILYGO T-Beam (2 kosa)' },
      price: '~70€',
      features: [
        { de: 'GPS integriert', en: 'GPS integrated', sl: 'GPS vgrajen' },
        { de: '18650 Akku', en: '18650 battery', sl: '18650 baterija' },
        { de: 'Mehr Features', en: 'More features', sl: 'Več funkcij' },
      ],
    },
    {
      name: { de: 'Verschiedene Antennen Set', en: 'Various antennas set', sl: 'Komplet različnih anten' },
      price: '~20€',
      features: [
        { de: 'Stock, Groundplane, Fiberglas', en: 'Stock, Groundplane, Fiberglass', sl: 'Stock, Groundplane, Steklena vlakna' },
        { de: 'Zum Vergleichen', en: 'For comparison', sl: 'Za primerjavo' },
      ],
    },
  ],
};
