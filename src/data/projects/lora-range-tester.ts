import type { HamProject } from '../../types/projects';

export const loraRangeTester: HamProject = {
  id: 'lora-range-tester',
  name: 'LoRa Reichweiten-Tester',
  category: 'mesh-lora',
  difficulty: 2,
  description: 'RSSI und SNR Anzeige für LoRa-Signale. Perfekt um Antennen zu vergleichen und optimale Standorte zu finden.',
  hardware: 'esp32-lora',
  projectType: 'build',

  components: [
    { name: 'Heltec LoRa V3 oder T-Beam', quantity: 2, notes: 'Sender + Empfänger' },
    { name: 'OLED Display 0.96"', quantity: 1, notes: 'Falls nicht integriert (I2C)' },
    { name: 'Taster', quantity: 1, notes: 'Zum Senden von Test-Paketen' },
    { name: 'LiPo Akku', quantity: 1, notes: 'Für mobilen Betrieb' },
    { name: 'Verschiedene Antennen', quantity: 1, notes: 'Zum Vergleichen' },
  ],
  estimatedCost: '50-80 EUR',

  wiring: [
    { from: 'Taster Pin 1', to: 'GPIO 0', color: 'gelb', notes: 'Boot-Button oft vorhanden' },
    { from: 'Taster Pin 2', to: 'GND', color: 'schwarz' },
  ],

  code: `/*
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
  codeLanguage: 'cpp',
  codeFileName: 'lora_range_tester.ino',

  externalLinks: [
    { title: 'LoRa Library (Arduino)', url: 'https://github.com/sandeepmistry/arduino-LoRa' },
    { title: 'RSSI erklärt', url: 'https://de.wikipedia.org/wiki/Received_Signal_Strength_Indication' },
    { title: 'LoRa Reichweite maximieren', url: 'https://meshtastic.org/docs/overview/range-tests/' },
  ],

  customizationSuggestions: [
    'Wie kann ich die Sendeleistung ändern?',
    'Welcher Spreading Factor für mehr Reichweite?',
    'Kann ich GPS-Koordinaten mitsenden?',
    'Wie speichere ich die Messwerte?',
    'Wie vergleiche ich verschiedene Antennen?',
  ],

  hardwareOptions: [
    {
      name: 'Heltec LoRa V3 (2 Stück)',
      price: '~50€',
      features: ['OLED integriert', 'USB-C', 'Kompakt'],
      recommended: true,
    },
    {
      name: 'LILYGO T-Beam (2 Stück)',
      price: '~70€',
      features: ['GPS integriert', '18650 Akku', 'Mehr Features'],
    },
    {
      name: 'Verschiedene Antennen Set',
      price: '~20€',
      features: ['Stock, Groundplane, Fiberglas', 'Zum Vergleichen'],
    },
  ],
};
