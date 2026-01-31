import type { HamProject } from '../../types/projects';

export const solarNode: HamProject = {
  id: 'solar-node',
  name: 'Solar Mesh-Node',
  category: 'mesh-lora',
  difficulty: 2,
  description: 'Autarker LoRa Mesh-Repeater mit Solarpanel für Dauerbetrieb ohne Stromanschluss. Perfekt für Berggipfel, Gartenhütten oder abgelegene Standorte.',
  hardware: 'esp32-lora',
  projectType: 'build',

  components: [
    { name: 'LoRa-Board (T-Beam, Heltec, RAK)', quantity: 1, notes: 'Mit 18650 oder LiPo' },
    { name: 'Solarpanel 6V 1-2W', quantity: 1, notes: 'Mini-Panel, ca. 10x10cm' },
    { name: 'TP4056 Lademodul', quantity: 1, notes: 'Mit Schutzschaltung (USB-C Version empfohlen)' },
    { name: '18650 LiPo Akku', quantity: 1, notes: '3000-3500mAh, geschützt' },
    { name: '18650 Batteriehalter', quantity: 1, notes: 'Falls nicht im Board integriert' },
    { name: 'Wetterfestes Gehäuse', quantity: 1, notes: 'IP65 Kunststoffbox, ca. 100x68x50mm' },
    { name: 'Kabelverschraubung PG7', quantity: 2, notes: 'Für Antenne und Solarkabel' },
    { name: 'SMA Einbaubuchse', quantity: 1, notes: 'Für externe Antenne' },
    { name: '868 MHz Außenantenne', quantity: 1, notes: 'Fiberglas oder Groundplane' },
    { name: 'Silikon-Dichtmasse', quantity: 1, notes: 'Für Wasserdichtigkeit' },
    { name: 'Kabelbinder & Schrauben', quantity: 1, notes: 'Zur Montage' },
  ],
  estimatedCost: '40-80 EUR',

  wiring: [
    { from: 'Solarpanel +', to: 'TP4056 IN+', color: 'rot', notes: 'Plus vom Panel' },
    { from: 'Solarpanel -', to: 'TP4056 IN-', color: 'schwarz', notes: 'Minus vom Panel' },
    { from: 'TP4056 B+', to: '18650 Halter +', color: 'rot', notes: 'Batterie Plus' },
    { from: 'TP4056 B-', to: '18650 Halter -', color: 'schwarz', notes: 'Batterie Minus' },
    { from: 'TP4056 OUT+', to: 'Board VIN/5V', color: 'rot', notes: 'Versorgung Board' },
    { from: 'TP4056 OUT-', to: 'Board GND', color: 'schwarz', notes: 'Masse' },
    { from: 'Board Antenne', to: 'SMA Buchse', color: 'koax', notes: 'Kurzes Pigtail-Kabel' },
  ],

  code: `/*
 * Solar Mesh-Node - Konfigurationstipps
 * =====================================
 *
 * Dieser Code zeigt die optimalen Einstellungen für einen
 * solarbetriebenen Mesh-Repeater mit minimaler Stromaufnahme.
 *
 * Hardware: T-Beam, Heltec LoRa V3, oder RAK WisBlock
 * Firmware: Meshtastic, MeshCore oder MeshCom
 */

// =====================================================
// HARDWARE-SETUP
// =====================================================

/*
VERDRAHTUNG:
-----------
Solarpanel (6V, 1-2W)
    │
    ▼
┌─────────────┐
│   TP4056    │ ◄── Lademodul mit Schutzschaltung
│  Lademodul  │
└─────────────┘
    │
    ▼
┌─────────────┐
│   18650     │ ◄── 3000-3500mAh LiPo Akku
│   Akku      │
└─────────────┘
    │
    ▼
┌─────────────┐
│  LoRa-Board │ ◄── T-Beam / Heltec / RAK
│  (ESP32)    │
└─────────────┘
    │
    ▼
┌─────────────┐
│  Antenne    │ ◄── 868 MHz Außenantenne
└─────────────┘
*/

// =====================================================
// MESHTASTIC KONFIGURATION (über App oder CLI)
// =====================================================

/*
DEVICE ROLE:
------------
Für Repeater/Router Betrieb:
  - Role: ROUTER oder ROUTER_CLIENT
  - Das Board leitet Nachrichten weiter, auch wenn kein Client verbunden

POWER SETTINGS (sehr wichtig für Solar!):
-----------------------------------------
  - Power Saving: ENABLED
  - Wait Bluetooth: 60 Sekunden (dann Bluetooth aus)
  - Screen Timeout: 60 Sekunden (falls Display vorhanden)
  - GPS Update Interval: 3600 Sekunden (1x pro Stunde reicht für stationär)
  - GPS Mode: DISABLED (für stationären Repeater) oder ENABLED (mit Position)

LORA SETTINGS:
--------------
  - Region: EU_868
  - Modem Preset: LONG_FAST (Standard) oder LONG_SLOW (mehr Reichweite, mehr Strom)
  - Hop Limit: 3-5 (je nach Netzwerk)
  - TX Power: 20-27 dBm (Standard meist optimal)

POSITION:
---------
  - Wenn GPS deaktiviert: Manuelle Position setzen!
  - Smart Position: DISABLED (für stationär)
  - Position Broadcast: 3600-7200 Sekunden
*/

// =====================================================
// STROMVERBRAUCH OPTIMIEREN
// =====================================================

/*
TYPISCHER STROMVERBRAUCH:
-------------------------
  - ESP32 Deep Sleep: ~10 µA
  - ESP32 Active (WiFi off, BT off): ~20-30 mA
  - ESP32 Active (BT on): ~80-100 mA
  - LoRa TX (20 dBm): ~120 mA (kurze Bursts)
  - GPS aktiv: ~30-50 mA
  - OLED Display: ~20 mA

SOLAR-DIMENSIONIERUNG:
----------------------
  Durchschnittlicher Verbrauch Router-Mode: ~40 mA
  Pro Tag: 40mA × 24h = 960 mAh

  Minimum Akku: 3000 mAh (3 Tage Autonomie bei Schlechtwetter)

  Solarpanel: 6V, 1W = ~160mA bei voller Sonne
  Effektiv (4-5h gute Sonne): 600-800 mAh pro Tag

  → 1W Panel + 3000mAh Akku = funktioniert in Mitteleuropa
  → 2W Panel empfohlen für zuverlässigen Ganzjahresbetrieb

TIPPS FÜR MINIMALEN VERBRAUCH:
------------------------------
  1. GPS deaktivieren (stationärer Node braucht kein GPS)
  2. Bluetooth nach 60s deaktivieren
  3. WiFi deaktivieren (wenn nicht für MQTT benötigt)
  4. Display deaktivieren oder kurzes Timeout
  5. nRF52-basierte Boards (RAK) sind sparsamer als ESP32
*/

// =====================================================
// GEHÄUSE & MONTAGE
// =====================================================

/*
WETTERFESTES GEHÄUSE:
---------------------
  1. IP65 Kunststoffbox verwenden
  2. Kabelverschraubungen (PG7) für Kabeleinführung
  3. SMA-Einbaubuchse für Antenne
  4. Alle Durchführungen mit Silikon abdichten
  5. Entlüftungsventil (Gore-Tex) verhindert Kondenswasser

MONTAGE-TIPPS:
--------------
  - Solarpanel: Nach Süden ausrichten, 30-45° Neigung
  - Antenne: So hoch wie möglich, freie Sicht
  - Gehäuse: Im Schatten montieren (Überhitzung vermeiden)
  - Akkus mögen keine Kälte unter 0°C (Isolierung oder Indoor)

ANTENNEN-OPTIONEN:
------------------
  1. Groundplane (DIY): Günstig, einfach, gute Leistung
  2. Fiberglas-Stabantenne: Robust, wetterfest, ~20€
  3. Yagi-Antenne: Für Punkt-zu-Punkt, mehr Reichweite
  4. Collinear (Eigenbau): Beste Reichweite, etwas Aufwand
*/

// =====================================================
// WARTUNG & MONITORING
// =====================================================

/*
FERNÜBERWACHUNG:
----------------
  - MQTT aktivieren (wenn WiFi verfügbar)
  - Telemetrie-Modul aktiviert:
    - Batteriespannung
    - Umgebungstemperatur (mit Sensor)
    - Uptime

REGELMÄSSIGE CHECKS:
--------------------
  - Akkuspannung > 3.3V (ansonsten nachladen)
  - Korrosion an Verbindungen
  - Antennenstecker fest
  - Gehäuse dicht

TYPISCHE PROBLEME:
------------------
  - Akku lädt nicht: Panel verschmutzt oder falsch ausgerichtet
  - Keine Reichweite: Antenne oder Stecker defekt
  - Resets: Unterspannung, größeren Akku verwenden
  - Überhitzung: Bessere Belüftung, Schatten
*/

// =====================================================
// MESHTASTIC CLI BEISPIEL-KONFIGURATION
// =====================================================

/*
# Firmware flashen (falls noch nicht gemacht)
meshtastic --flash

# Grundkonfiguration
meshtastic --set device.role ROUTER
meshtastic --set lora.region EU_868

# Stromsparende Einstellungen
meshtastic --set power.wait_bluetooth_secs 60
meshtastic --set power.sds_secs 0
meshtastic --set display.screen_on_secs 60

# GPS für stationären Node deaktivieren
meshtastic --set position.gps_mode DISABLED
meshtastic --set position.fixed_position true
meshtastic --setlat 47.0 --setlon 13.0 --setalt 500

# Telemetrie aktivieren (Batterie-Monitoring)
meshtastic --set telemetry.device_update_interval 3600
meshtastic --set telemetry.environment_update_interval 3600
*/

void setup() {
  // Dieser Sketch ist nur zur Dokumentation
  // Die eigentliche Konfiguration erfolgt über die
  // Meshtastic/MeshCore/MeshCom Firmware und App
}

void loop() {
  // Solar-Node läuft autonom mit Meshtastic Firmware
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'solar_node_config.ino',

  externalLinks: [
    { title: 'Meshtastic Power Settings', url: 'https://meshtastic.org/docs/configuration/radio/power/' },
    { title: 'TP4056 Lademodul', url: 'https://www.az-delivery.de/products/tp4056-micro-usb-5v-1a' },
    { title: 'Meshtastic Router Setup', url: 'https://meshtastic.org/docs/configuration/radio/device/' },
    { title: 'Solar Panel Guide', url: 'https://meshtastic.org/docs/hardware/solar/' },
  ],

  customizationSuggestions: [
    'Welches Solarpanel ist am besten für meinen Standort?',
    'Wie kann ich die Batteriespannung überwachen?',
    'Welche Antenne gibt die beste Reichweite?',
    'Kann ich einen Temperatursensor hinzufügen?',
    'Wie mache ich das Gehäuse wasserdicht?',
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2',
      price: '~35€',
      features: ['18650 Halterung integriert', 'GPS', 'Bewährt'],
      recommended: true,
    },
    {
      name: 'Heltec LoRa V3',
      price: '~25€',
      features: ['Günstig', 'Kompakt', 'Externer Akku nötig'],
    },
    {
      name: 'RAK WisBlock 4631',
      price: '~30€',
      features: ['nRF52840 (sparsamer!)', 'Solar-Eingang', 'Modular'],
    },
    {
      name: 'Solarpanel 6V 1W',
      price: '~8€',
      features: ['Mini-Panel', 'Für kleine Nodes'],
    },
    {
      name: 'Solarpanel 6V 2W',
      price: '~12€',
      features: ['Mehr Leistung', 'Empfohlen für Ganzjahr'],
    },
    {
      name: 'TP4056 USB-C Lademodul',
      price: '~2€',
      features: ['Schutzschaltung', 'USB-C', '1A Ladestrom'],
    },
    {
      name: 'IP65 Gehäuse 100x68x50',
      price: '~8€',
      features: ['Wetterfest', 'Kunststoff', 'Mit Deckel'],
    },
    {
      name: '868MHz Fiberglas-Antenne',
      price: '~15€',
      features: ['5dBi Gewinn', 'Wetterfest', 'N-Buchse'],
    },
  ],
};
