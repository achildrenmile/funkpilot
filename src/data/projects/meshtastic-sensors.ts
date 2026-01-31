import type { HamProject } from '../../types/projects';

export const meshtasticSensors: HamProject = {
  id: 'meshtastic-sensors',
  name: 'Sensoren integrieren',
  category: 'mesh-lora',
  difficulty: 2,
  description: 'Temperatur, Luftfeuchtigkeit, Luftdruck und mehr über das Mesh-Netzwerk übertragen.',
  hardware: 'esp32-lora',
  projectType: 'build',

  components: [
    { name: 'LoRa-Board (T-Beam, Heltec, RAK)', quantity: 1 },
    { name: 'BME280 Sensor', quantity: 1, notes: 'Temp, Feuchte, Druck' },
    { name: 'Dupont-Kabel', quantity: 4, notes: 'Für I2C Verbindung' },
  ],
  estimatedCost: '35-50 EUR',

  wiring: [
    { from: 'BME280 VCC', to: '3.3V', color: 'rot' },
    { from: 'BME280 GND', to: 'GND', color: 'schwarz' },
    { from: 'BME280 SDA', to: 'GPIO 21 (SDA)', color: 'blau', notes: 'I2C Daten' },
    { from: 'BME280 SCL', to: 'GPIO 22 (SCL)', color: 'gelb', notes: 'I2C Clock' },
  ],

  code: `/*
 * Meshtastic Sensor-Integration
 * ==============================
 *
 * Meshtastic unterstützt verschiedene Sensoren nativ.
 * Diese werden über das Telemetrie-Modul ausgelesen
 * und automatisch ins Mesh-Netzwerk gesendet.
 *
 * Unterstützte Sensoren:
 * - BME280/BMP280 (Temperatur, Feuchte, Druck)
 * - BME680 (+ Luftqualität)
 * - DHT11/DHT22 (Temperatur, Feuchte)
 * - DS18B20 (Temperatur)
 * - INA219/INA260 (Strom, Spannung)
 * - MCP9808 (Präzisions-Temperatur)
 * - SHTC3 (Temperatur, Feuchte)
 * - LPS22 (Druck)
 */

// =====================================================
// HARDWARE-SETUP: BME280
// =====================================================

/*
VERDRAHTUNG (I2C):

BME280        ESP32 (T-Beam/Heltec)
-------       ---------------------
VCC    ────►  3.3V
GND    ────►  GND
SDA    ────►  GPIO 21 (SDA)
SCL    ────►  GPIO 22 (SCL)

I2C-Adressen:
- BME280: 0x76 oder 0x77
- BMP280: 0x76 oder 0x77
- BME680: 0x76 oder 0x77

Tipp: Bei Heltec V3 sind SDA/SCL anders!
      SDA = GPIO 41, SCL = GPIO 42
*/

// =====================================================
// KONFIGURATION VIA CLI
// =====================================================

/*
TELEMETRIE AKTIVIEREN:

# Umgebungssensoren aktivieren
meshtastic --set telemetry.environment_measurement_enabled true

# Update-Intervall (Sekunden)
meshtastic --set telemetry.environment_update_interval 300

# Anzeige auf Display
meshtastic --set telemetry.environment_screen_enabled true

# Gerätestatus (Batterie, etc.)
meshtastic --set telemetry.device_update_interval 1800


SENSOR-SPEZIFISCH:

# I2C-Adresse (falls nicht Standard)
meshtastic --set telemetry.environment_sensor_pin 0x76

# Sensor-Typ (meist automatisch erkannt)
# 0 = BME280, 1 = BME680, 2 = MCP9808, etc.
*/

// =====================================================
// UNTERSTÜTZTE SENSOREN
// =====================================================

/*
┌──────────────┬─────────────────────────────────────┐
│ Sensor       │ Messwerte                           │
├──────────────┼─────────────────────────────────────┤
│ BME280       │ Temperatur, Feuchte, Druck          │
│ BMP280       │ Temperatur, Druck                   │
│ BME680       │ Temp, Feuchte, Druck, Luftqualität  │
│ DHT11        │ Temperatur, Feuchte (ungenau)       │
│ DHT22        │ Temperatur, Feuchte (besser)        │
│ DS18B20      │ Temperatur (wasserdicht verfügbar)  │
│ INA219       │ Strom, Spannung, Leistung           │
│ INA260       │ Strom, Spannung, Leistung           │
│ MCP9808      │ Präzisions-Temperatur (±0.25°C)     │
│ SHTC3        │ Temperatur, Feuchte                 │
│ LPS22        │ Druck (hochpräzise)                 │
│ OPT3001      │ Lichtstärke (Lux)                   │
│ TSL2591      │ Lichtstärke (Lux)                   │
└──────────────┴─────────────────────────────────────┘

EMPFEHLUNG:
- Allgemein: BME280 (günstig, genau genug)
- Luftqualität: BME680 (teurer, aber VOC)
- Outdoor: DS18B20 (wasserdicht)
- Batterie-Überwachung: INA219
*/

// =====================================================
// BEISPIEL: BME280 ANSCHLUSS
// =====================================================

/*
Benötigte Teile:
- BME280 Breakout Board (~5€)
- 4× Dupont-Kabel

Schaltung:
                    ┌─────────────┐
                    │   BME280    │
                    │             │
   3.3V ────────────┤ VCC         │
                    │             │
   GND  ────────────┤ GND         │
                    │             │
   GPIO21 (SDA) ────┤ SDA         │
                    │             │
   GPIO22 (SCL) ────┤ SCL         │
                    │             │
                    └─────────────┘

Nach dem Anschluss:
1. Meshtastic Firmware flashen
2. Telemetrie aktivieren (siehe CLI-Befehle)
3. Sensor wird automatisch erkannt
4. Werte erscheinen auf Display und im Mesh
*/

// =====================================================
// TELEMETRIE-DATEN IM MESH
// =====================================================

/*
Die Sensordaten werden automatisch übertragen:

1. Im Display:
   - Aktuelle Werte auf dem eigenen Node
   - Werte anderer Nodes in der Node-Liste

2. In der App:
   - Unter "Device Metrics"
   - Verlaufsgrafiken

3. Via MQTT (JSON):
   {
     "type": "telemetry",
     "payload": {
       "temperature": 21.5,
       "relative_humidity": 65.0,
       "barometric_pressure": 1013.25
     }
   }
*/

// =====================================================
// INA219 FÜR BATTERIE-MONITORING
// =====================================================

/*
Mit dem INA219 kannst du Strom und Spannung messen:

Anwendungen:
- Batterieverbrauch überwachen
- Solarladung messen
- Stromversorgung diagnostizieren

Verdrahtung:
INA219        ESP32
-------       -----
VCC    ────►  3.3V
GND    ────►  GND
SDA    ────►  GPIO 21
SCL    ────►  GPIO 22
VIN+   ────►  Batterie + (durch Shunt)
VIN-   ────►  Last + (durch Shunt)

Konfiguration:
meshtastic --set telemetry.power_measurement_enabled true
meshtastic --set telemetry.power_update_interval 300
*/

// =====================================================
// CUSTOM SENSOR (Fortgeschritten)
// =====================================================

/*
Für nicht unterstützte Sensoren:
Eigene Firmware kompilieren mit PlatformIO.

Schritte:
1. Meshtastic Source Code klonen
2. Sensor-Library hinzufügen
3. In src/modules/Telemetry/ einbinden
4. Firmware kompilieren und flashen

Beispiel für eigenen Sensor:
(Siehe Meshtastic Dokumentation für Details)
*/

// =====================================================
// TROUBLESHOOTING
// =====================================================

/*
SENSOR WIRD NICHT ERKANNT:

1. Verdrahtung prüfen (VCC, GND, SDA, SCL)
2. I2C-Adresse prüfen (0x76 vs 0x77)
3. I2C-Scanner laufen lassen
4. Pull-Up Widerstände vorhanden?

KEINE WERTE IM MESH:

1. Telemetrie aktiviert?
   meshtastic --get telemetry

2. Update-Intervall zu lang?
   --set telemetry.environment_update_interval 60

3. Channel korrekt konfiguriert?

FALSCHE WERTE:

1. Sensor kalibriert?
2. Offset in Firmware konfigurieren
3. Anderer Sensor-Typ erkannt?
*/

void setup() {
  // Dieser Code dient nur zur Dokumentation.
  // Die Sensor-Integration erfolgt über die
  // Meshtastic-Firmware Konfiguration.

  // Anschluss:
  // BME280 an I2C (SDA=21, SCL=22)

  // Konfiguration via CLI:
  // meshtastic --set telemetry.environment_measurement_enabled true
  // meshtastic --set telemetry.environment_update_interval 300
}

void loop() {
  // Meshtastic liest Sensor automatisch aus
  // und sendet Daten ins Mesh-Netzwerk.
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'meshtastic_sensors.ino',

  externalLinks: [
    { title: 'Meshtastic Telemetry Docs', url: 'https://meshtastic.org/docs/configuration/module/telemetry/' },
    { title: 'BME280 Datenblatt', url: 'https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/' },
    { title: 'I2C Scanner', url: 'https://playground.arduino.cc/Main/I2cScanner/' },
  ],

  customizationSuggestions: [
    'Welcher Sensor ist für Outdoor geeignet?',
    'Wie überwache ich die Batteriespannung?',
    'Kann ich mehrere Sensoren anschließen?',
    'Wie kalibriere ich den Temperatursensor?',
    'Wie bekomme ich die Daten in Home Assistant?',
  ],

  hardwareOptions: [
    {
      name: 'BME280 Breakout',
      price: '~5€',
      features: ['Temp, Feuchte, Druck', 'I2C', 'Sehr beliebt'],
      recommended: true,
    },
    {
      name: 'BME680 Breakout',
      price: '~15€',
      features: ['+ Luftqualität (VOC)', 'I2C'],
    },
    {
      name: 'DS18B20 wasserdicht',
      price: '~3€',
      features: ['Nur Temperatur', 'Outdoor', 'Kabellänge bis 20m'],
    },
    {
      name: 'INA219 Strommonitor',
      price: '~3€',
      features: ['Strom + Spannung', 'Für Batterie-Monitoring'],
    },
  ],
};
