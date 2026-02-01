import type { HamProject } from '../../types/projects';

export const solarNode: HamProject = {
  id: 'solar-node',
  name: {
    de: 'Solar Mesh-Node',
    en: 'Solar Mesh Node',
    sl: 'Solarni mrežni vozel',
  },
  category: 'mesh-lora',
  difficulty: 2,
  description: {
    de: 'Autarker LoRa Mesh-Repeater mit Solarpanel für Dauerbetrieb ohne Stromanschluss. Perfekt für Berggipfel, Gartenhütten oder abgelegene Standorte.',
    en: 'Self-sufficient LoRa mesh repeater with solar panel for continuous operation without power connection. Perfect for mountain peaks, garden sheds, or remote locations.',
    sl: 'Samozadosten LoRa mrežni repetitor s solarnim panelom za neprekinjeno delovanje brez priključka na elektriko. Idealen za gorske vrhove, vrtne ute ali oddaljene lokacije.',
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
      notes: {
        de: 'Mit 18650 oder LiPo',
        en: 'With 18650 or LiPo',
        sl: 'Z 18650 ali LiPo',
      },
    },
    {
      name: {
        de: 'Solarpanel 6V 1-2W',
        en: 'Solar Panel 6V 1-2W',
        sl: 'Solarni panel 6V 1-2W',
      },
      quantity: 1,
      notes: {
        de: 'Mini-Panel, ca. 10x10cm',
        en: 'Mini panel, approx. 10x10cm',
        sl: 'Mini panel, pribl. 10x10cm',
      },
    },
    {
      name: {
        de: 'TP4056 Lademodul',
        en: 'TP4056 Charging Module',
        sl: 'TP4056 polnilni modul',
      },
      quantity: 1,
      notes: {
        de: 'Mit Schutzschaltung (USB-C Version empfohlen)',
        en: 'With protection circuit (USB-C version recommended)',
        sl: 'Z zaščitnim vezjem (priporočena USB-C različica)',
      },
    },
    {
      name: {
        de: '18650 LiPo Akku',
        en: '18650 LiPo Battery',
        sl: '18650 LiPo baterija',
      },
      quantity: 1,
      notes: {
        de: '3000-3500mAh, geschützt',
        en: '3000-3500mAh, protected',
        sl: '3000-3500mAh, zaščitena',
      },
    },
    {
      name: {
        de: '18650 Batteriehalter',
        en: '18650 Battery Holder',
        sl: '18650 držalo za baterijo',
      },
      quantity: 1,
      notes: {
        de: 'Falls nicht im Board integriert',
        en: 'If not integrated in the board',
        sl: 'Če ni vgrajeno v plošči',
      },
    },
    {
      name: {
        de: 'Wetterfestes Gehäuse',
        en: 'Weatherproof Enclosure',
        sl: 'Vremensko odporno ohišje',
      },
      quantity: 1,
      notes: {
        de: 'IP65 Kunststoffbox, ca. 100x68x50mm',
        en: 'IP65 plastic box, approx. 100x68x50mm',
        sl: 'IP65 plastična škatla, pribl. 100x68x50mm',
      },
    },
    {
      name: {
        de: 'Kabelverschraubung PG7',
        en: 'Cable Gland PG7',
        sl: 'Kabelska uvodnica PG7',
      },
      quantity: 2,
      notes: {
        de: 'Für Antenne und Solarkabel',
        en: 'For antenna and solar cable',
        sl: 'Za anteno in solarni kabel',
      },
    },
    {
      name: {
        de: 'SMA Einbaubuchse',
        en: 'SMA Panel Mount Connector',
        sl: 'SMA vgradna vtičnica',
      },
      quantity: 1,
      notes: {
        de: 'Für externe Antenne',
        en: 'For external antenna',
        sl: 'Za zunanjo anteno',
      },
    },
    {
      name: {
        de: '868 MHz Außenantenne',
        en: '868 MHz Outdoor Antenna',
        sl: '868 MHz zunanja antena',
      },
      quantity: 1,
      notes: {
        de: 'Fiberglas oder Groundplane',
        en: 'Fiberglass or ground plane',
        sl: 'Steklena vlakna ali ozemljitvena ravnina',
      },
    },
    {
      name: {
        de: 'Silikon-Dichtmasse',
        en: 'Silicone Sealant',
        sl: 'Silikonsko tesnilo',
      },
      quantity: 1,
      notes: {
        de: 'Für Wasserdichtigkeit',
        en: 'For waterproofing',
        sl: 'Za vodotesnost',
      },
    },
    {
      name: {
        de: 'Kabelbinder & Schrauben',
        en: 'Cable Ties & Screws',
        sl: 'Kabelske vezice in vijaki',
      },
      quantity: 1,
      notes: {
        de: 'Zur Montage',
        en: 'For mounting',
        sl: 'Za montažo',
      },
    },
  ],
  estimatedCost: '40-80 EUR',

  wiring: [
    {
      from: {
        de: 'Solarpanel +',
        en: 'Solar Panel +',
        sl: 'Solarni panel +',
      },
      to: 'TP4056 IN+',
      color: 'rot',
      notes: {
        de: 'Plus vom Panel',
        en: 'Plus from panel',
        sl: 'Plus s panela',
      },
    },
    {
      from: {
        de: 'Solarpanel -',
        en: 'Solar Panel -',
        sl: 'Solarni panel -',
      },
      to: 'TP4056 IN-',
      color: 'schwarz',
      notes: {
        de: 'Minus vom Panel',
        en: 'Minus from panel',
        sl: 'Minus s panela',
      },
    },
    {
      from: 'TP4056 B+',
      to: {
        de: '18650 Halter +',
        en: '18650 Holder +',
        sl: '18650 držalo +',
      },
      color: 'rot',
      notes: {
        de: 'Batterie Plus',
        en: 'Battery plus',
        sl: 'Baterija plus',
      },
    },
    {
      from: 'TP4056 B-',
      to: {
        de: '18650 Halter -',
        en: '18650 Holder -',
        sl: '18650 držalo -',
      },
      color: 'schwarz',
      notes: {
        de: 'Batterie Minus',
        en: 'Battery minus',
        sl: 'Baterija minus',
      },
    },
    {
      from: 'TP4056 OUT+',
      to: 'Board VIN/5V',
      color: 'rot',
      notes: {
        de: 'Versorgung Board',
        en: 'Board power supply',
        sl: 'Napajanje plošče',
      },
    },
    {
      from: 'TP4056 OUT-',
      to: 'Board GND',
      color: 'schwarz',
      notes: {
        de: 'Masse',
        en: 'Ground',
        sl: 'Masa',
      },
    },
    {
      from: {
        de: 'Board Antenne',
        en: 'Board Antenna',
        sl: 'Antena plošče',
      },
      to: {
        de: 'SMA Buchse',
        en: 'SMA Connector',
        sl: 'SMA vtičnica',
      },
      color: 'koax',
      notes: {
        de: 'Kurzes Pigtail-Kabel',
        en: 'Short pigtail cable',
        sl: 'Kratek pigtail kabel',
      },
    },
  ],

  code: {
    de: `/*
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
    en: `/*
 * Solar Mesh Node - Configuration Tips
 * =====================================
 *
 * This code shows the optimal settings for a
 * solar-powered mesh repeater with minimal power consumption.
 *
 * Hardware: T-Beam, Heltec LoRa V3, or RAK WisBlock
 * Firmware: Meshtastic, MeshCore or MeshCom
 */

// =====================================================
// HARDWARE SETUP
// =====================================================

/*
WIRING:
-------
Solar Panel (6V, 1-2W)
    │
    ▼
┌─────────────┐
│   TP4056    │ ◄── Charging module with protection circuit
│  Charger    │
└─────────────┘
    │
    ▼
┌─────────────┐
│   18650     │ ◄── 3000-3500mAh LiPo battery
│   Battery   │
└─────────────┘
    │
    ▼
┌─────────────┐
│  LoRa Board │ ◄── T-Beam / Heltec / RAK
│  (ESP32)    │
└─────────────┘
    │
    ▼
┌─────────────┐
│  Antenna    │ ◄── 868 MHz outdoor antenna
└─────────────┘
*/

// =====================================================
// MESHTASTIC CONFIGURATION (via App or CLI)
// =====================================================

/*
DEVICE ROLE:
------------
For repeater/router operation:
  - Role: ROUTER or ROUTER_CLIENT
  - The board forwards messages even when no client is connected

POWER SETTINGS (very important for solar!):
-------------------------------------------
  - Power Saving: ENABLED
  - Wait Bluetooth: 60 seconds (then Bluetooth off)
  - Screen Timeout: 60 seconds (if display present)
  - GPS Update Interval: 3600 seconds (once per hour is enough for stationary)
  - GPS Mode: DISABLED (for stationary repeater) or ENABLED (with position)

LORA SETTINGS:
--------------
  - Region: EU_868
  - Modem Preset: LONG_FAST (standard) or LONG_SLOW (more range, more power)
  - Hop Limit: 3-5 (depending on network)
  - TX Power: 20-27 dBm (standard usually optimal)

POSITION:
---------
  - If GPS disabled: Set manual position!
  - Smart Position: DISABLED (for stationary)
  - Position Broadcast: 3600-7200 seconds
*/

// =====================================================
// OPTIMIZE POWER CONSUMPTION
// =====================================================

/*
TYPICAL POWER CONSUMPTION:
--------------------------
  - ESP32 Deep Sleep: ~10 µA
  - ESP32 Active (WiFi off, BT off): ~20-30 mA
  - ESP32 Active (BT on): ~80-100 mA
  - LoRa TX (20 dBm): ~120 mA (short bursts)
  - GPS active: ~30-50 mA
  - OLED Display: ~20 mA

SOLAR DIMENSIONING:
-------------------
  Average consumption router mode: ~40 mA
  Per day: 40mA × 24h = 960 mAh

  Minimum battery: 3000 mAh (3 days autonomy in bad weather)

  Solar panel: 6V, 1W = ~160mA at full sun
  Effective (4-5h good sun): 600-800 mAh per day

  → 1W panel + 3000mAh battery = works in Central Europe
  → 2W panel recommended for reliable year-round operation

TIPS FOR MINIMAL CONSUMPTION:
-----------------------------
  1. Disable GPS (stationary node doesn't need GPS)
  2. Disable Bluetooth after 60s
  3. Disable WiFi (if not needed for MQTT)
  4. Disable display or short timeout
  5. nRF52-based boards (RAK) are more efficient than ESP32
*/

// =====================================================
// ENCLOSURE & MOUNTING
// =====================================================

/*
WEATHERPROOF ENCLOSURE:
-----------------------
  1. Use IP65 plastic box
  2. Cable glands (PG7) for cable entry
  3. SMA panel mount connector for antenna
  4. Seal all penetrations with silicone
  5. Vent valve (Gore-Tex) prevents condensation

MOUNTING TIPS:
--------------
  - Solar panel: Face south, 30-45° tilt
  - Antenna: As high as possible, clear line of sight
  - Enclosure: Mount in shade (avoid overheating)
  - Batteries don't like cold below 0°C (insulation or indoor)

ANTENNA OPTIONS:
----------------
  1. Ground plane (DIY): Cheap, simple, good performance
  2. Fiberglass rod antenna: Robust, weatherproof, ~20€
  3. Yagi antenna: For point-to-point, more range
  4. Collinear (DIY): Best range, some effort
*/

// =====================================================
// MAINTENANCE & MONITORING
// =====================================================

/*
REMOTE MONITORING:
------------------
  - Enable MQTT (if WiFi available)
  - Telemetry module enabled:
    - Battery voltage
    - Ambient temperature (with sensor)
    - Uptime

REGULAR CHECKS:
---------------
  - Battery voltage > 3.3V (otherwise recharge)
  - Corrosion on connections
  - Antenna connector tight
  - Enclosure sealed

TYPICAL PROBLEMS:
-----------------
  - Battery not charging: Panel dirty or misaligned
  - No range: Antenna or connector defective
  - Resets: Undervoltage, use larger battery
  - Overheating: Better ventilation, shade
*/

// =====================================================
// MESHTASTIC CLI EXAMPLE CONFIGURATION
// =====================================================

/*
# Flash firmware (if not done yet)
meshtastic --flash

# Basic configuration
meshtastic --set device.role ROUTER
meshtastic --set lora.region EU_868

# Power-saving settings
meshtastic --set power.wait_bluetooth_secs 60
meshtastic --set power.sds_secs 0
meshtastic --set display.screen_on_secs 60

# Disable GPS for stationary node
meshtastic --set position.gps_mode DISABLED
meshtastic --set position.fixed_position true
meshtastic --setlat 47.0 --setlon 13.0 --setalt 500

# Enable telemetry (battery monitoring)
meshtastic --set telemetry.device_update_interval 3600
meshtastic --set telemetry.environment_update_interval 3600
*/

void setup() {
  // This sketch is for documentation only
  // The actual configuration is done via the
  // Meshtastic/MeshCore/MeshCom firmware and app
}

void loop() {
  // Solar node runs autonomously with Meshtastic firmware
}
`,
    sl: `/*
 * Solarni mrežni vozel - Nasveti za konfiguracijo
 * ================================================
 *
 * Ta koda prikazuje optimalne nastavitve za
 * solarno napajan mrežni repetitor z minimalno porabo energije.
 *
 * Strojna oprema: T-Beam, Heltec LoRa V3, ali RAK WisBlock
 * Firmware: Meshtastic, MeshCore ali MeshCom
 */

// =====================================================
// NASTAVITEV STROJNE OPREME
// =====================================================

/*
VEZAVA:
-------
Solarni panel (6V, 1-2W)
    │
    ▼
┌─────────────┐
│   TP4056    │ ◄── Polnilni modul z zaščitnim vezjem
│  Polnilnik  │
└─────────────┘
    │
    ▼
┌─────────────┐
│   18650     │ ◄── 3000-3500mAh LiPo baterija
│  Baterija   │
└─────────────┘
    │
    ▼
┌─────────────┐
│ LoRa plošča │ ◄── T-Beam / Heltec / RAK
│  (ESP32)    │
└─────────────┘
    │
    ▼
┌─────────────┐
│  Antena     │ ◄── 868 MHz zunanja antena
└─────────────┘
*/

// =====================================================
// MESHTASTIC KONFIGURACIJA (preko aplikacije ali CLI)
// =====================================================

/*
VLOGA NAPRAVE:
--------------
Za delovanje repetitorja/usmerjevalnika:
  - Vloga: ROUTER ali ROUTER_CLIENT
  - Plošča posreduje sporočila, tudi ko ni povezan noben odjemalec

NASTAVITVE PORABE (zelo pomembno za solar!):
--------------------------------------------
  - Varčevanje z energijo: ENABLED
  - Čakaj Bluetooth: 60 sekund (nato Bluetooth izključi)
  - Časovna omejitev zaslona: 60 sekund (če je zaslon prisoten)
  - Interval posodobitve GPS: 3600 sekund (enkrat na uro zadostuje za stacionarno)
  - GPS način: DISABLED (za stacionarni repetitor) ali ENABLED (s pozicijo)

LORA NASTAVITVE:
----------------
  - Regija: EU_868
  - Modem prednastavitev: LONG_FAST (standard) ali LONG_SLOW (večji doseg, več energije)
  - Omejitev skokov: 3-5 (odvisno od omrežja)
  - TX moč: 20-27 dBm (standard je običajno optimalen)

POZICIJA:
---------
  - Če je GPS onemogočen: Ročno nastavi pozicijo!
  - Pametna pozicija: DISABLED (za stacionarno)
  - Oddajanje pozicije: 3600-7200 sekund
*/

// =====================================================
// OPTIMIZACIJA PORABE ENERGIJE
// =====================================================

/*
TIPIČNA PORABA ENERGIJE:
------------------------
  - ESP32 globoko spanje: ~10 µA
  - ESP32 aktiven (WiFi izključen, BT izključen): ~20-30 mA
  - ESP32 aktiven (BT vključen): ~80-100 mA
  - LoRa TX (20 dBm): ~120 mA (kratki sunki)
  - GPS aktiven: ~30-50 mA
  - OLED zaslon: ~20 mA

DIMENZIONIRANJE SOLARJA:
------------------------
  Povprečna poraba v načinu usmerjevalnika: ~40 mA
  Na dan: 40mA × 24h = 960 mAh

  Minimalna baterija: 3000 mAh (3 dni avtonomije pri slabem vremenu)

  Solarni panel: 6V, 1W = ~160mA pri polnem soncu
  Učinkovito (4-5h dobrega sonca): 600-800 mAh na dan

  → 1W panel + 3000mAh baterija = deluje v Srednji Evropi
  → 2W panel priporočen za zanesljivo celoletno delovanje

NASVETI ZA MINIMALNO PORABO:
----------------------------
  1. Onemogoči GPS (stacionarni vozel ne potrebuje GPS)
  2. Onemogoči Bluetooth po 60s
  3. Onemogoči WiFi (če ni potreben za MQTT)
  4. Onemogoči zaslon ali kratka časovna omejitev
  5. nRF52 plošče (RAK) so varčnejše od ESP32
*/

// =====================================================
// OHIŠJE IN MONTAŽA
// =====================================================

/*
VREMENSKO ODPORNO OHIŠJE:
-------------------------
  1. Uporabi IP65 plastično škatlo
  2. Kabelske uvodnice (PG7) za vstop kablov
  3. SMA vgradna vtičnica za anteno
  4. Zatesnite vse prehode s silikonom
  5. Odzračevalni ventil (Gore-Tex) preprečuje kondenz

NASVETI ZA MONTAŽO:
-------------------
  - Solarni panel: Usmeri proti jugu, 30-45° nagib
  - Antena: Čim višje, prosta vidljivost
  - Ohišje: Montiraj v senci (izogibaj se pregrevanju)
  - Baterije ne marajo mraza pod 0°C (izolacija ali notranjost)

MOŽNOSTI ANTEN:
---------------
  1. Ozemljitvena ravnina (DIY): Poceni, preprosta, dobra zmogljivost
  2. Palična antena iz steklenih vlaken: Robustna, vremenska odporna, ~20€
  3. Yagi antena: Za točko-do-točke, večji doseg
  4. Kolinearna (DIY): Najboljši doseg, nekaj truda
*/

// =====================================================
// VZDRŽEVANJE IN NADZOR
// =====================================================

/*
ODDALJENI NADZOR:
-----------------
  - Omogoči MQTT (če je WiFi na voljo)
  - Telemetrijski modul omogočen:
    - Napetost baterije
    - Temperatura okolice (s senzorjem)
    - Čas delovanja

REDNI PREGLEDI:
---------------
  - Napetost baterije > 3.3V (sicer napolni)
  - Korozija na spojih
  - Konektor antene tesen
  - Ohišje zatesnjen

TIPIČNE TEŽAVE:
---------------
  - Baterija se ne polni: Panel umazan ali napačno usmerjen
  - Ni dosega: Antena ali konektor pokvarjen
  - Ponovni zagoni: Podnapetost, uporabi večjo baterijo
  - Pregrevanje: Boljše prezračevanje, senca
*/

// =====================================================
// MESHTASTIC CLI PRIMER KONFIGURACIJE
// =====================================================

/*
# Naloži firmware (če še ni naložen)
meshtastic --flash

# Osnovna konfiguracija
meshtastic --set device.role ROUTER
meshtastic --set lora.region EU_868

# Nastavitve varčevanja z energijo
meshtastic --set power.wait_bluetooth_secs 60
meshtastic --set power.sds_secs 0
meshtastic --set display.screen_on_secs 60

# Onemogoči GPS za stacionarni vozel
meshtastic --set position.gps_mode DISABLED
meshtastic --set position.fixed_position true
meshtastic --setlat 47.0 --setlon 13.0 --setalt 500

# Omogoči telemetrijo (nadzor baterije)
meshtastic --set telemetry.device_update_interval 3600
meshtastic --set telemetry.environment_update_interval 3600
*/

void setup() {
  // Ta sketch je samo za dokumentacijo
  // Dejanska konfiguracija se izvede preko
  // Meshtastic/MeshCore/MeshCom firmwarea in aplikacije
}

void loop() {
  // Solarni vozel deluje avtonomno z Meshtastic firmwareom
}
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'solar_node_config.ino',

  externalLinks: [
    {
      title: {
        de: 'Meshtastic Power Settings',
        en: 'Meshtastic Power Settings',
        sl: 'Meshtastic nastavitve porabe',
      },
      url: 'https://meshtastic.org/docs/configuration/radio/power/',
    },
    {
      title: {
        de: 'TP4056 Lademodul',
        en: 'TP4056 Charging Module',
        sl: 'TP4056 polnilni modul',
      },
      url: 'https://www.az-delivery.de/products/tp4056-micro-usb-5v-1a',
    },
    {
      title: {
        de: 'Meshtastic Router Setup',
        en: 'Meshtastic Router Setup',
        sl: 'Meshtastic nastavitev usmerjevalnika',
      },
      url: 'https://meshtastic.org/docs/configuration/radio/device/',
    },
    {
      title: {
        de: 'Solar Panel Guide',
        en: 'Solar Panel Guide',
        sl: 'Vodnik za solarne panele',
      },
      url: 'https://meshtastic.org/docs/hardware/solar/',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Welches Solarpanel ist am besten für meinen Standort?',
      en: 'Which solar panel is best for my location?',
      sl: 'Kateri solarni panel je najboljši za mojo lokacijo?',
    },
    {
      de: 'Wie kann ich die Batteriespannung überwachen?',
      en: 'How can I monitor the battery voltage?',
      sl: 'Kako lahko nadziram napetost baterije?',
    },
    {
      de: 'Welche Antenne gibt die beste Reichweite?',
      en: 'Which antenna gives the best range?',
      sl: 'Katera antena daje najboljši doseg?',
    },
    {
      de: 'Kann ich einen Temperatursensor hinzufügen?',
      en: 'Can I add a temperature sensor?',
      sl: 'Ali lahko dodam temperaturni senzor?',
    },
    {
      de: 'Wie mache ich das Gehäuse wasserdicht?',
      en: 'How do I make the enclosure waterproof?',
      sl: 'Kako naredim ohišje vodotesno?',
    },
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2',
      price: '~35€',
      features: [
        {
          de: '18650 Halterung integriert',
          en: '18650 holder integrated',
          sl: '18650 držalo vgrajeno',
        },
        { de: 'GPS', en: 'GPS', sl: 'GPS' },
        { de: 'Bewährt', en: 'Proven', sl: 'Preizkušen' },
      ],
      recommended: true,
    },
    {
      name: 'Heltec LoRa V3',
      price: '~25€',
      features: [
        { de: 'Günstig', en: 'Affordable', sl: 'Ugoden' },
        { de: 'Kompakt', en: 'Compact', sl: 'Kompakten' },
        {
          de: 'Externer Akku nötig',
          en: 'External battery needed',
          sl: 'Potrebna zunanja baterija',
        },
      ],
    },
    {
      name: 'RAK WisBlock 4631',
      price: '~30€',
      features: [
        {
          de: 'nRF52840 (sparsamer!)',
          en: 'nRF52840 (more efficient!)',
          sl: 'nRF52840 (varčnejši!)',
        },
        { de: 'Solar-Eingang', en: 'Solar input', sl: 'Solarni vhod' },
        { de: 'Modular', en: 'Modular', sl: 'Modularen' },
      ],
    },
    {
      name: {
        de: 'Solarpanel 6V 1W',
        en: 'Solar Panel 6V 1W',
        sl: 'Solarni panel 6V 1W',
      },
      price: '~8€',
      features: [
        { de: 'Mini-Panel', en: 'Mini panel', sl: 'Mini panel' },
        {
          de: 'Für kleine Nodes',
          en: 'For small nodes',
          sl: 'Za majhne vozle',
        },
      ],
    },
    {
      name: {
        de: 'Solarpanel 6V 2W',
        en: 'Solar Panel 6V 2W',
        sl: 'Solarni panel 6V 2W',
      },
      price: '~12€',
      features: [
        { de: 'Mehr Leistung', en: 'More power', sl: 'Več moči' },
        {
          de: 'Empfohlen für Ganzjahr',
          en: 'Recommended for year-round',
          sl: 'Priporočeno za celoletno',
        },
      ],
    },
    {
      name: {
        de: 'TP4056 USB-C Lademodul',
        en: 'TP4056 USB-C Charging Module',
        sl: 'TP4056 USB-C polnilni modul',
      },
      price: '~2€',
      features: [
        { de: 'Schutzschaltung', en: 'Protection circuit', sl: 'Zaščitno vezje' },
        { de: 'USB-C', en: 'USB-C', sl: 'USB-C' },
        { de: '1A Ladestrom', en: '1A charging current', sl: '1A polnilni tok' },
      ],
    },
    {
      name: {
        de: 'IP65 Gehäuse 100x68x50',
        en: 'IP65 Enclosure 100x68x50',
        sl: 'IP65 ohišje 100x68x50',
      },
      price: '~8€',
      features: [
        { de: 'Wetterfest', en: 'Weatherproof', sl: 'Vremensko odporno' },
        { de: 'Kunststoff', en: 'Plastic', sl: 'Plastika' },
        { de: 'Mit Deckel', en: 'With lid', sl: 'S pokrovom' },
      ],
    },
    {
      name: {
        de: '868MHz Fiberglas-Antenne',
        en: '868MHz Fiberglass Antenna',
        sl: '868MHz antena iz steklenih vlaken',
      },
      price: '~15€',
      features: [
        { de: '5dBi Gewinn', en: '5dBi gain', sl: '5dBi ojačenje' },
        { de: 'Wetterfest', en: 'Weatherproof', sl: 'Vremensko odporna' },
        { de: 'N-Buchse', en: 'N-connector', sl: 'N-konektor' },
      ],
    },
  ],
};
