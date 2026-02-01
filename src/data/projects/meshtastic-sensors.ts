import type { HamProject } from '../../types/projects';

export const meshtasticSensors: HamProject = {
  id: 'meshtastic-sensors',
  name: {
    de: 'Sensoren integrieren',
    en: 'Integrate Sensors',
    sl: 'Integracija senzorjev',
  },
  category: 'mesh-lora',
  difficulty: 2,
  description: {
    de: 'Temperatur, Luftfeuchtigkeit, Luftdruck und mehr über das Mesh-Netzwerk übertragen.',
    en: 'Transmit temperature, humidity, air pressure and more over the mesh network.',
    sl: 'Prenos temperature, vlažnosti, zračnega tlaka in več prek mesh omrežja.',
  },
  hardware: 'esp32-lora',
  projectType: 'build',

  components: [
    {
      name: {
        de: 'LoRa-Board (T-Beam, Heltec, RAK)',
        en: 'LoRa Board (T-Beam, Heltec, RAK)',
        sl: 'LoRa plošča (T-Beam, Heltec, RAK)',
      },
      quantity: 1,
    },
    {
      name: {
        de: 'BME280 Sensor',
        en: 'BME280 Sensor',
        sl: 'BME280 senzor',
      },
      quantity: 1,
      notes: {
        de: 'Temp, Feuchte, Druck',
        en: 'Temp, Humidity, Pressure',
        sl: 'Temp, vlažnost, tlak',
      },
    },
    {
      name: {
        de: 'Dupont-Kabel',
        en: 'Dupont Cables',
        sl: 'Dupont kabli',
      },
      quantity: 4,
      notes: {
        de: 'Für I2C Verbindung',
        en: 'For I2C connection',
        sl: 'Za I2C povezavo',
      },
    },
  ],
  estimatedCost: '35-50 EUR',

  wiring: [
    { from: 'BME280 VCC', to: '3.3V', color: 'rot' },
    { from: 'BME280 GND', to: 'GND', color: 'schwarz' },
    { from: 'BME280 SDA', to: 'GPIO 21 (SDA)', color: 'blau', notes: 'I2C Daten' },
    { from: 'BME280 SCL', to: 'GPIO 22 (SCL)', color: 'gelb', notes: 'I2C Clock' },
  ],

  code: {
    de: `/*
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
    en: `/*
 * Meshtastic Sensor Integration
 * ==============================
 *
 * Meshtastic natively supports various sensors.
 * These are read via the telemetry module
 * and automatically sent to the mesh network.
 *
 * Supported sensors:
 * - BME280/BMP280 (Temperature, Humidity, Pressure)
 * - BME680 (+ Air Quality)
 * - DHT11/DHT22 (Temperature, Humidity)
 * - DS18B20 (Temperature)
 * - INA219/INA260 (Current, Voltage)
 * - MCP9808 (Precision Temperature)
 * - SHTC3 (Temperature, Humidity)
 * - LPS22 (Pressure)
 */

// =====================================================
// HARDWARE SETUP: BME280
// =====================================================

/*
WIRING (I2C):

BME280        ESP32 (T-Beam/Heltec)
-------       ---------------------
VCC    ────►  3.3V
GND    ────►  GND
SDA    ────►  GPIO 21 (SDA)
SCL    ────►  GPIO 22 (SCL)

I2C Addresses:
- BME280: 0x76 or 0x77
- BMP280: 0x76 or 0x77
- BME680: 0x76 or 0x77

Tip: On Heltec V3 SDA/SCL are different!
     SDA = GPIO 41, SCL = GPIO 42
*/

// =====================================================
// CONFIGURATION VIA CLI
// =====================================================

/*
ENABLE TELEMETRY:

# Enable environment sensors
meshtastic --set telemetry.environment_measurement_enabled true

# Update interval (seconds)
meshtastic --set telemetry.environment_update_interval 300

# Display on screen
meshtastic --set telemetry.environment_screen_enabled true

# Device status (battery, etc.)
meshtastic --set telemetry.device_update_interval 1800


SENSOR-SPECIFIC:

# I2C address (if not default)
meshtastic --set telemetry.environment_sensor_pin 0x76

# Sensor type (usually auto-detected)
# 0 = BME280, 1 = BME680, 2 = MCP9808, etc.
*/

// =====================================================
// SUPPORTED SENSORS
// =====================================================

/*
┌──────────────┬─────────────────────────────────────┐
│ Sensor       │ Measurements                        │
├──────────────┼─────────────────────────────────────┤
│ BME280       │ Temperature, Humidity, Pressure     │
│ BMP280       │ Temperature, Pressure               │
│ BME680       │ Temp, Humidity, Pressure, Air Qual. │
│ DHT11        │ Temperature, Humidity (inaccurate)  │
│ DHT22        │ Temperature, Humidity (better)      │
│ DS18B20      │ Temperature (waterproof available)  │
│ INA219       │ Current, Voltage, Power             │
│ INA260       │ Current, Voltage, Power             │
│ MCP9808      │ Precision Temperature (±0.25°C)     │
│ SHTC3        │ Temperature, Humidity               │
│ LPS22        │ Pressure (high precision)           │
│ OPT3001      │ Light Intensity (Lux)               │
│ TSL2591      │ Light Intensity (Lux)               │
└──────────────┴─────────────────────────────────────┘

RECOMMENDATION:
- General: BME280 (affordable, accurate enough)
- Air Quality: BME680 (more expensive, but VOC)
- Outdoor: DS18B20 (waterproof)
- Battery Monitoring: INA219
*/

// =====================================================
// EXAMPLE: BME280 CONNECTION
// =====================================================

/*
Required parts:
- BME280 Breakout Board (~5€)
- 4× Dupont cables

Circuit:
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

After connection:
1. Flash Meshtastic firmware
2. Enable telemetry (see CLI commands)
3. Sensor is automatically detected
4. Values appear on display and in mesh
*/

// =====================================================
// TELEMETRY DATA IN MESH
// =====================================================

/*
Sensor data is automatically transmitted:

1. On Display:
   - Current values on your own node
   - Values from other nodes in node list

2. In the App:
   - Under "Device Metrics"
   - History graphs

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
// INA219 FOR BATTERY MONITORING
// =====================================================

/*
With the INA219 you can measure current and voltage:

Applications:
- Monitor battery consumption
- Measure solar charging
- Diagnose power supply

Wiring:
INA219        ESP32
-------       -----
VCC    ────►  3.3V
GND    ────►  GND
SDA    ────►  GPIO 21
SCL    ────►  GPIO 22
VIN+   ────►  Battery + (through shunt)
VIN-   ────►  Load + (through shunt)

Configuration:
meshtastic --set telemetry.power_measurement_enabled true
meshtastic --set telemetry.power_update_interval 300
*/

// =====================================================
// CUSTOM SENSOR (Advanced)
// =====================================================

/*
For unsupported sensors:
Compile your own firmware with PlatformIO.

Steps:
1. Clone Meshtastic source code
2. Add sensor library
3. Include in src/modules/Telemetry/
4. Compile and flash firmware

Example for custom sensor:
(See Meshtastic documentation for details)
*/

// =====================================================
// TROUBLESHOOTING
// =====================================================

/*
SENSOR NOT DETECTED:

1. Check wiring (VCC, GND, SDA, SCL)
2. Check I2C address (0x76 vs 0x77)
3. Run I2C scanner
4. Pull-up resistors present?

NO VALUES IN MESH:

1. Telemetry enabled?
   meshtastic --get telemetry

2. Update interval too long?
   --set telemetry.environment_update_interval 60

3. Channel correctly configured?

WRONG VALUES:

1. Sensor calibrated?
2. Configure offset in firmware
3. Wrong sensor type detected?
*/

void setup() {
  // This code is for documentation only.
  // Sensor integration is done via
  // Meshtastic firmware configuration.

  // Connection:
  // BME280 to I2C (SDA=21, SCL=22)

  // Configuration via CLI:
  // meshtastic --set telemetry.environment_measurement_enabled true
  // meshtastic --set telemetry.environment_update_interval 300
}

void loop() {
  // Meshtastic reads sensor automatically
  // and sends data to mesh network.
}
`,
    sl: `/*
 * Meshtastic integracija senzorjev
 * =================================
 *
 * Meshtastic izvorno podpira različne senzorje.
 * Ti se berejo preko telemetrijskega modula
 * in samodejno pošiljajo v mesh omrežje.
 *
 * Podprti senzorji:
 * - BME280/BMP280 (Temperatura, Vlažnost, Tlak)
 * - BME680 (+ Kakovost zraka)
 * - DHT11/DHT22 (Temperatura, Vlažnost)
 * - DS18B20 (Temperatura)
 * - INA219/INA260 (Tok, Napetost)
 * - MCP9808 (Precizna temperatura)
 * - SHTC3 (Temperatura, Vlažnost)
 * - LPS22 (Tlak)
 */

// =====================================================
// NAMESTITEV STROJNE OPREME: BME280
// =====================================================

/*
OŽIČENJE (I2C):

BME280        ESP32 (T-Beam/Heltec)
-------       ---------------------
VCC    ────►  3.3V
GND    ────►  GND
SDA    ────►  GPIO 21 (SDA)
SCL    ────►  GPIO 22 (SCL)

I2C naslovi:
- BME280: 0x76 ali 0x77
- BMP280: 0x76 ali 0x77
- BME680: 0x76 ali 0x77

Nasvet: Pri Heltec V3 sta SDA/SCL drugačna!
        SDA = GPIO 41, SCL = GPIO 42
*/

// =====================================================
// KONFIGURACIJA PREKO CLI
// =====================================================

/*
OMOGOČI TELEMETRIJO:

# Omogoči okoljske senzorje
meshtastic --set telemetry.environment_measurement_enabled true

# Interval posodabljanja (sekunde)
meshtastic --set telemetry.environment_update_interval 300

# Prikaz na zaslonu
meshtastic --set telemetry.environment_screen_enabled true

# Status naprave (baterija itd.)
meshtastic --set telemetry.device_update_interval 1800


SPECIFIČNO ZA SENZOR:

# I2C naslov (če ni privzeti)
meshtastic --set telemetry.environment_sensor_pin 0x76

# Tip senzorja (običajno samodejno zaznan)
# 0 = BME280, 1 = BME680, 2 = MCP9808 itd.
*/

// =====================================================
// PODPRTI SENZORJI
// =====================================================

/*
┌──────────────┬─────────────────────────────────────┐
│ Senzor       │ Meritve                             │
├──────────────┼─────────────────────────────────────┤
│ BME280       │ Temperatura, Vlažnost, Tlak         │
│ BMP280       │ Temperatura, Tlak                   │
│ BME680       │ Temp, Vlažnost, Tlak, Kakovost zr.  │
│ DHT11        │ Temperatura, Vlažnost (nenatančno)  │
│ DHT22        │ Temperatura, Vlažnost (boljše)      │
│ DS18B20      │ Temperatura (vodoodporen na voljo)  │
│ INA219       │ Tok, Napetost, Moč                  │
│ INA260       │ Tok, Napetost, Moč                  │
│ MCP9808      │ Precizna temperatura (±0.25°C)      │
│ SHTC3        │ Temperatura, Vlažnost               │
│ LPS22        │ Tlak (visoka natančnost)            │
│ OPT3001      │ Jakost svetlobe (Lux)               │
│ TSL2591      │ Jakost svetlobe (Lux)               │
└──────────────┴─────────────────────────────────────┘

PRIPOROČILO:
- Splošno: BME280 (cenovno ugoden, dovolj natančen)
- Kakovost zraka: BME680 (dražji, a VOC)
- Zunaj: DS18B20 (vodoodporen)
- Nadzor baterije: INA219
*/

// =====================================================
// PRIMER: PRIKLJUČITEV BME280
// =====================================================

/*
Potrebni deli:
- BME280 Breakout plošča (~5€)
- 4× Dupont kabli

Vezje:
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

Po priključitvi:
1. Naložite Meshtastic firmware
2. Omogočite telemetrijo (glejte CLI ukaze)
3. Senzor je samodejno zaznan
4. Vrednosti se prikažejo na zaslonu in v mesh
*/

// =====================================================
// TELEMETRIJSKI PODATKI V MESH
// =====================================================

/*
Podatki senzorjev se samodejno prenašajo:

1. Na zaslonu:
   - Trenutne vrednosti na vašem vozlišču
   - Vrednosti drugih vozlišč na seznamu

2. V aplikaciji:
   - Pod "Device Metrics"
   - Grafi zgodovine

3. Preko MQTT (JSON):
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
// INA219 ZA NADZOR BATERIJE
// =====================================================

/*
Z INA219 lahko merite tok in napetost:

Uporaba:
- Nadzor porabe baterije
- Merjenje solarnega polnjenja
- Diagnostika napajanja

Ožičenje:
INA219        ESP32
-------       -----
VCC    ────►  3.3V
GND    ────►  GND
SDA    ────►  GPIO 21
SCL    ────►  GPIO 22
VIN+   ────►  Baterija + (skozi shunt)
VIN-   ────►  Breme + (skozi shunt)

Konfiguracija:
meshtastic --set telemetry.power_measurement_enabled true
meshtastic --set telemetry.power_update_interval 300
*/

// =====================================================
// LASTNI SENZOR (Napredno)
// =====================================================

/*
Za nepodprte senzorje:
Prevajanje lastnega firmwarea s PlatformIO.

Koraki:
1. Klonirajte Meshtastic izvorno kodo
2. Dodajte knjižnico senzorja
3. Vključite v src/modules/Telemetry/
4. Prevedite in naložite firmware

Primer za lastni senzor:
(Glejte Meshtastic dokumentacijo za podrobnosti)
*/

// =====================================================
// ODPRAVLJANJE TEŽAV
// =====================================================

/*
SENZOR NI ZAZNAN:

1. Preverite ožičenje (VCC, GND, SDA, SCL)
2. Preverite I2C naslov (0x76 proti 0x77)
3. Zaženite I2C skener
4. Ali so prisotni pull-up upori?

NI VREDNOSTI V MESH:

1. Je telemetrija omogočena?
   meshtastic --get telemetry

2. Je interval posodabljanja predolg?
   --set telemetry.environment_update_interval 60

3. Je kanal pravilno konfiguriran?

NAPAČNE VREDNOSTI:

1. Je senzor kalibriran?
2. Konfigurirajte odmik v firmwareu
3. Je zaznan napačen tip senzorja?
*/

void setup() {
  // Ta koda je samo za dokumentacijo.
  // Integracija senzorjev poteka preko
  // konfiguracije Meshtastic firmwarea.

  // Priključitev:
  // BME280 na I2C (SDA=21, SCL=22)

  // Konfiguracija preko CLI:
  // meshtastic --set telemetry.environment_measurement_enabled true
  // meshtastic --set telemetry.environment_update_interval 300
}

void loop() {
  // Meshtastic samodejno bere senzor
  // in pošilja podatke v mesh omrežje.
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'meshtastic_sensors.ino',

  externalLinks: [
    {
      title: {
        de: 'Meshtastic Telemetry Docs',
        en: 'Meshtastic Telemetry Docs',
        sl: 'Meshtastic Telemetry dokumentacija',
      },
      url: 'https://meshtastic.org/docs/configuration/module/telemetry/',
    },
    {
      title: {
        de: 'BME280 Datenblatt',
        en: 'BME280 Datasheet',
        sl: 'BME280 podatkovni list',
      },
      url: 'https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/',
    },
    {
      title: {
        de: 'I2C Scanner',
        en: 'I2C Scanner',
        sl: 'I2C skener',
      },
      url: 'https://playground.arduino.cc/Main/I2cScanner/',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Welcher Sensor ist für Outdoor geeignet?',
      en: 'Which sensor is suitable for outdoor use?',
      sl: 'Kateri senzor je primeren za zunanjo uporabo?',
    },
    {
      de: 'Wie überwache ich die Batteriespannung?',
      en: 'How do I monitor battery voltage?',
      sl: 'Kako spremljam napetost baterije?',
    },
    {
      de: 'Kann ich mehrere Sensoren anschließen?',
      en: 'Can I connect multiple sensors?',
      sl: 'Ali lahko priključim več senzorjev?',
    },
    {
      de: 'Wie kalibriere ich den Temperatursensor?',
      en: 'How do I calibrate the temperature sensor?',
      sl: 'Kako kalibriram temperaturni senzor?',
    },
    {
      de: 'Wie bekomme ich die Daten in Home Assistant?',
      en: 'How do I get the data into Home Assistant?',
      sl: 'Kako dobim podatke v Home Assistant?',
    },
  ],

  hardwareOptions: [
    {
      name: {
        de: 'BME280 Breakout',
        en: 'BME280 Breakout',
        sl: 'BME280 Breakout',
      },
      price: '~5€',
      features: [
        {
          de: 'Temp, Feuchte, Druck',
          en: 'Temp, Humidity, Pressure',
          sl: 'Temp, vlažnost, tlak',
        },
        { de: 'I2C', en: 'I2C', sl: 'I2C' },
        {
          de: 'Sehr beliebt',
          en: 'Very popular',
          sl: 'Zelo priljubljen',
        },
      ],
      recommended: true,
    },
    {
      name: {
        de: 'BME680 Breakout',
        en: 'BME680 Breakout',
        sl: 'BME680 Breakout',
      },
      price: '~15€',
      features: [
        {
          de: '+ Luftqualität (VOC)',
          en: '+ Air Quality (VOC)',
          sl: '+ Kakovost zraka (VOC)',
        },
        { de: 'I2C', en: 'I2C', sl: 'I2C' },
      ],
    },
    {
      name: {
        de: 'DS18B20 wasserdicht',
        en: 'DS18B20 waterproof',
        sl: 'DS18B20 vodoodporen',
      },
      price: '~3€',
      features: [
        {
          de: 'Nur Temperatur',
          en: 'Temperature only',
          sl: 'Samo temperatura',
        },
        { de: 'Outdoor', en: 'Outdoor', sl: 'Zunanja uporaba' },
        {
          de: 'Kabellänge bis 20m',
          en: 'Cable length up to 20m',
          sl: 'Dolžina kabla do 20m',
        },
      ],
    },
    {
      name: {
        de: 'INA219 Strommonitor',
        en: 'INA219 Current Monitor',
        sl: 'INA219 monitor toka',
      },
      price: '~3€',
      features: [
        {
          de: 'Strom + Spannung',
          en: 'Current + Voltage',
          sl: 'Tok + napetost',
        },
        {
          de: 'Für Batterie-Monitoring',
          en: 'For battery monitoring',
          sl: 'Za nadzor baterije',
        },
      ],
    },
  ],
};
