import type { HamProject } from '../../types/projects';

export const meshtasticRepeaterGuide: HamProject = {
  id: 'meshtastic-repeater-guide',
  name: {
    de: 'Repeater & Gateway einrichten',
    en: 'Setting Up Repeater & Gateway',
    sl: 'Nastavitev repetitorja in prehoda',
  },
  category: 'mesh-lora',
  difficulty: 2,
  description: {
    de: 'Schritt-für-Schritt Anleitung zum Einrichten eines permanenten Meshtastic Repeaters oder MQTT-Gateways.',
    en: 'Step-by-step guide for setting up a permanent Meshtastic repeater or MQTT gateway.',
    sl: 'Navodila po korakih za nastavitev stalnega Meshtastic repetitorja ali MQTT prehoda.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: {
        de: 'LoRa-Board (T-Beam, Heltec, RAK)',
        en: 'LoRa Board (T-Beam, Heltec, RAK)',
        sl: 'LoRa plošča (T-Beam, Heltec, RAK)',
      },
      quantity: 1,
      notes: {
        de: 'Für Dauerbetrieb geeignet',
        en: 'Suitable for continuous operation',
        sl: 'Primerno za neprekinjeno delovanje',
      },
    },
    {
      name: {
        de: 'Netzteil 5V 2A',
        en: 'Power Supply 5V 2A',
        sl: 'Napajalnik 5V 2A',
      },
      quantity: 1,
      notes: {
        de: 'USB-C oder Micro-USB',
        en: 'USB-C or Micro-USB',
        sl: 'USB-C ali Micro-USB',
      },
    },
    {
      name: {
        de: 'Outdoor-Antenne',
        en: 'Outdoor Antenna',
        sl: 'Zunanja antena',
      },
      quantity: 1,
      notes: {
        de: 'Für bessere Reichweite',
        en: 'For better range',
        sl: 'Za boljši doseg',
      },
    },
    {
      name: {
        de: 'Wetterfestes Gehäuse',
        en: 'Weatherproof Enclosure',
        sl: 'Vodoodporno ohišje',
      },
      quantity: 1,
      notes: {
        de: 'Bei Außenmontage',
        en: 'For outdoor installation',
        sl: 'Za zunanjo montažo',
      },
    },
  ],
  estimatedCost: '40-80 EUR',

  code: {
    de: `# Repeater & Gateway einrichten

## Übersicht

Ein **Repeater** erweitert die Reichweite des Mesh-Netzwerks.
Ein **Gateway** verbindet das Mesh mit dem Internet (MQTT).

Dieses Guide zeigt beide Konfigurationen.

---

## Node-Rollen verstehen

### CLIENT
- Standard-Rolle für Endgeräte
- Sendet eigene Nachrichten
- Leitet Nachrichten weiter (wenn sinnvoll)
- Reagiert auf Bluetooth-Verbindungen

### CLIENT_MUTE
- Wie CLIENT, aber sendet keine Position
- Für Nutzer die anonym bleiben wollen

### ROUTER
- **Empfohlen für Repeater**
- Leitet Nachrichten aktiv weiter
- Sendet minimale eigene Daten
- Optimiert für Dauerbetrieb
- Bluetooth nach kurzer Zeit aus

### ROUTER_CLIENT
- Kombination aus Router und Client
- Für Nodes die beides können sollen
- Höherer Stromverbrauch

### REPEATER
- Nur Weiterleitung, keine eigene Kommunikation
- Für reine Relais-Stationen
- Minimaler Stromverbrauch

---

## Repeater einrichten (Meshtastic)

### Schritt 1: Firmware flashen

1. Öffne https://flasher.meshtastic.org
2. Board anschließen
3. Aktuelle Firmware flashen

### Schritt 2: Grundkonfiguration

Per App oder CLI:

\`\`\`bash
# Region setzen (WICHTIG!)
meshtastic --set lora.region EU_868

# Rolle auf ROUTER setzen
meshtastic --set device.role ROUTER

# Name setzen
meshtastic --set device.name "Repeater-1"
\`\`\`

### Schritt 3: Position setzen

Für stationäre Repeater GPS deaktivieren und Position manuell setzen:

\`\`\`bash
# GPS deaktivieren (spart Strom)
meshtastic --set position.gps_mode DISABLED

# Feste Position setzen (Breitengrad, Längengrad, Höhe in m)
meshtastic --setlat 47.1234 --setlon 13.5678 --setalt 850

# Position als fest markieren
meshtastic --set position.fixed_position true
\`\`\`

### Schritt 4: Stromspar-Einstellungen

\`\`\`bash
# Bluetooth nach 60 Sekunden aus
meshtastic --set power.wait_bluetooth_secs 60

# Screen nach 60 Sekunden aus (falls vorhanden)
meshtastic --set display.screen_on_secs 60

# Light Sleep aktivieren (spart Strom)
meshtastic --set power.ls_secs 300
\`\`\`

### Schritt 5: LoRa optimieren

\`\`\`bash
# Hop Limit (Standard: 3, für große Netze: 5-7)
meshtastic --set lora.hop_limit 5

# TX Power (Standard meist OK)
# meshtastic --set lora.tx_power 20

# Modem Preset (LONG_FAST ist gut)
# Für mehr Reichweite: LONG_MODERATE oder LONG_SLOW
meshtastic --set lora.modem_preset LONG_FAST
\`\`\`

---

## MQTT-Gateway einrichten

Ein Gateway verbindet das Mesh-Netzwerk mit dem Internet.

### Voraussetzungen

- Repeater-Node mit WiFi (ESP32-basiert)
- WiFi-Zugang am Standort
- MQTT-Broker (öffentlich oder eigener)

### Schritt 1: WiFi konfigurieren

\`\`\`bash
# WiFi aktivieren
meshtastic --set wifi.enabled true

# Zugangsdaten setzen
meshtastic --set wifi.ssid "DeinWiFiName"
meshtastic --set wifi.psk "DeinWiFiPasswort"
\`\`\`

### Schritt 2: MQTT konfigurieren

**Öffentlicher Broker (meshtastic.org):**

\`\`\`bash
# MQTT aktivieren
meshtastic --set mqtt.enabled true

# Öffentlichen Broker verwenden
meshtastic --set mqtt.address mqtt.meshtastic.org

# Root Topic (Standard: msh)
meshtastic --set mqtt.root msh/EU_868

# Verschlüsselung beibehalten!
meshtastic --set mqtt.encryption_enabled true
\`\`\`

**Eigener Broker:**

\`\`\`bash
meshtastic --set mqtt.enabled true
meshtastic --set mqtt.address mqtt.deinserver.at
meshtastic --set mqtt.username deinuser
meshtastic --set mqtt.password deinpasswort
meshtastic --set mqtt.root msh/custom
\`\`\`

### Schritt 3: Uplink/Downlink

\`\`\`bash
# Nachrichten ins Internet senden
meshtastic --ch-set uplink_enabled true --ch-index 0

# Nachrichten aus Internet empfangen
meshtastic --ch-set downlink_enabled true --ch-index 0
\`\`\`

---

## Monitoring & Wartung

### Telemetrie aktivieren

\`\`\`bash
# Gerätestatus senden (alle 30 min)
meshtastic --set telemetry.device_update_interval 1800

# Batteriespannung überwachen
meshtastic --set telemetry.environment_measurement_enabled true
\`\`\`

### Fernwartung per MQTT

Mit MQTT kannst du den Node remote überwachen:
- Position
- Batteriestatus
- Uptime
- Letzte Pakete

Tools:
- MQTT Explorer (Desktop)
- Meshtastic Web Client

### Typische Probleme

| Problem | Lösung |
|---------|--------|
| Keine Pakete weitergeleitet | Hop Limit prüfen, Role = ROUTER |
| WiFi verbindet nicht | SSID/PSK prüfen, Reichweite |
| MQTT keine Verbindung | Broker-Adresse, Port, Firewall |
| Hoher Stromverbrauch | GPS aus, Bluetooth Timeout |
| Resets | Stromversorgung prüfen |

---

## Standort-Tipps

### Ideal für Repeater

- **Höhe**: Je höher, desto besser
- **Freie Sicht**: Keine Hindernisse in Hauptrichtungen
- **Strom**: Zuverlässige Versorgung (Netzteil > Akku)
- **Internet**: Für MQTT-Gateway WiFi nötig

### Beispiel-Standorte

| Standort | Vorteile | Nachteile |
|----------|----------|-----------|
| Dachboden | Geschützt, Strom | Evtl. Dämpfung durch Dach |
| Balkon | Gute Höhe, Strom | Wetterschutz nötig |
| Berghütte | Beste Reichweite | Strom, Zugang |
| Büro | Strom, WiFi | Oft niedrig |

### Abdeckung testen

1. Repeater installieren
2. Mit mobilem Node umhergehen
3. RSSI/SNR beobachten
4. Lücken identifizieren
5. Ggf. weitere Repeater planen

---

## Netzwerk-Planung

### Mesh-Architektur

\`\`\`
                   [Gateway]
                      │
                      │ MQTT
                      ▼
    [Repeater A] ◄──► [Repeater B]
         │                │
         ▼                ▼
    [Client 1]       [Client 2]
    [Client 2]       [Client 3]
\`\`\`

### Empfehlungen

- **Hop Limit**: Nicht zu hoch (3-5 optimal)
- **Überlappung**: Jeder Node sollte 2+ Nachbarn sehen
- **Backbone**: Repeater mit besten Standorten verbinden
- **Redundanz**: Keine Single-Points-of-Failure

---

## Checkliste: Repeater live schalten

- [ ] Firmware aktuell
- [ ] Region korrekt (EU_868)
- [ ] Role = ROUTER
- [ ] Position gesetzt (manuell oder GPS)
- [ ] Stromspar-Einstellungen aktiv
- [ ] Antenne angeschlossen
- [ ] Gehäuse wetterfest (bei Outdoor)
- [ ] Stromversorgung stabil
- [ ] Test-Paket empfangen und weitergeleitet
`,
    en: `# Setting Up Repeater & Gateway

## Overview

A **Repeater** extends the range of the mesh network.
A **Gateway** connects the mesh to the internet (MQTT).

This guide shows both configurations.

---

## Understanding Node Roles

### CLIENT
- Default role for end devices
- Sends own messages
- Forwards messages (when appropriate)
- Responds to Bluetooth connections

### CLIENT_MUTE
- Like CLIENT, but does not send position
- For users who want to remain anonymous

### ROUTER
- **Recommended for repeaters**
- Actively forwards messages
- Sends minimal own data
- Optimized for continuous operation
- Bluetooth turns off after short time

### ROUTER_CLIENT
- Combination of router and client
- For nodes that should do both
- Higher power consumption

### REPEATER
- Only forwarding, no own communication
- For pure relay stations
- Minimal power consumption

---

## Setting Up Repeater (Meshtastic)

### Step 1: Flash Firmware

1. Open https://flasher.meshtastic.org
2. Connect board
3. Flash current firmware

### Step 2: Basic Configuration

Via app or CLI:

\`\`\`bash
# Set region (IMPORTANT!)
meshtastic --set lora.region EU_868

# Set role to ROUTER
meshtastic --set device.role ROUTER

# Set name
meshtastic --set device.name "Repeater-1"
\`\`\`

### Step 3: Set Position

For stationary repeaters, disable GPS and set position manually:

\`\`\`bash
# Disable GPS (saves power)
meshtastic --set position.gps_mode DISABLED

# Set fixed position (latitude, longitude, altitude in m)
meshtastic --setlat 47.1234 --setlon 13.5678 --setalt 850

# Mark position as fixed
meshtastic --set position.fixed_position true
\`\`\`

### Step 4: Power Saving Settings

\`\`\`bash
# Bluetooth off after 60 seconds
meshtastic --set power.wait_bluetooth_secs 60

# Screen off after 60 seconds (if present)
meshtastic --set display.screen_on_secs 60

# Enable light sleep (saves power)
meshtastic --set power.ls_secs 300
\`\`\`

### Step 5: Optimize LoRa

\`\`\`bash
# Hop limit (default: 3, for large networks: 5-7)
meshtastic --set lora.hop_limit 5

# TX Power (default usually OK)
# meshtastic --set lora.tx_power 20

# Modem preset (LONG_FAST is good)
# For more range: LONG_MODERATE or LONG_SLOW
meshtastic --set lora.modem_preset LONG_FAST
\`\`\`

---

## Setting Up MQTT Gateway

A gateway connects the mesh network to the internet.

### Prerequisites

- Repeater node with WiFi (ESP32-based)
- WiFi access at location
- MQTT broker (public or own)

### Step 1: Configure WiFi

\`\`\`bash
# Enable WiFi
meshtastic --set wifi.enabled true

# Set credentials
meshtastic --set wifi.ssid "YourWiFiName"
meshtastic --set wifi.psk "YourWiFiPassword"
\`\`\`

### Step 2: Configure MQTT

**Public broker (meshtastic.org):**

\`\`\`bash
# Enable MQTT
meshtastic --set mqtt.enabled true

# Use public broker
meshtastic --set mqtt.address mqtt.meshtastic.org

# Root topic (default: msh)
meshtastic --set mqtt.root msh/EU_868

# Keep encryption enabled!
meshtastic --set mqtt.encryption_enabled true
\`\`\`

**Own broker:**

\`\`\`bash
meshtastic --set mqtt.enabled true
meshtastic --set mqtt.address mqtt.yourserver.com
meshtastic --set mqtt.username youruser
meshtastic --set mqtt.password yourpassword
meshtastic --set mqtt.root msh/custom
\`\`\`

### Step 3: Uplink/Downlink

\`\`\`bash
# Send messages to internet
meshtastic --ch-set uplink_enabled true --ch-index 0

# Receive messages from internet
meshtastic --ch-set downlink_enabled true --ch-index 0
\`\`\`

---

## Monitoring & Maintenance

### Enable Telemetry

\`\`\`bash
# Send device status (every 30 min)
meshtastic --set telemetry.device_update_interval 1800

# Monitor battery voltage
meshtastic --set telemetry.environment_measurement_enabled true
\`\`\`

### Remote Maintenance via MQTT

With MQTT you can monitor the node remotely:
- Position
- Battery status
- Uptime
- Recent packets

Tools:
- MQTT Explorer (Desktop)
- Meshtastic Web Client

### Common Problems

| Problem | Solution |
|---------|----------|
| No packets forwarded | Check hop limit, Role = ROUTER |
| WiFi not connecting | Check SSID/PSK, range |
| MQTT no connection | Broker address, port, firewall |
| High power consumption | GPS off, Bluetooth timeout |
| Resets | Check power supply |

---

## Location Tips

### Ideal for Repeaters

- **Height**: The higher, the better
- **Clear line of sight**: No obstacles in main directions
- **Power**: Reliable supply (power adapter > battery)
- **Internet**: WiFi needed for MQTT gateway

### Example Locations

| Location | Advantages | Disadvantages |
|----------|------------|---------------|
| Attic | Protected, power | Possible attenuation through roof |
| Balcony | Good height, power | Weather protection needed |
| Mountain cabin | Best range | Power, access |
| Office | Power, WiFi | Often low |

### Test Coverage

1. Install repeater
2. Walk around with mobile node
3. Observe RSSI/SNR
4. Identify gaps
5. Plan additional repeaters if needed

---

## Network Planning

### Mesh Architecture

\`\`\`
                   [Gateway]
                      │
                      │ MQTT
                      ▼
    [Repeater A] ◄──► [Repeater B]
         │                │
         ▼                ▼
    [Client 1]       [Client 2]
    [Client 2]       [Client 3]
\`\`\`

### Recommendations

- **Hop Limit**: Not too high (3-5 optimal)
- **Overlap**: Each node should see 2+ neighbors
- **Backbone**: Connect repeaters with best locations
- **Redundancy**: No single points of failure

---

## Checklist: Going Live with Repeater

- [ ] Firmware up to date
- [ ] Region correct (EU_868)
- [ ] Role = ROUTER
- [ ] Position set (manual or GPS)
- [ ] Power saving settings active
- [ ] Antenna connected
- [ ] Enclosure weatherproof (for outdoor)
- [ ] Power supply stable
- [ ] Test packet received and forwarded
`,
    sl: `# Nastavitev repetitorja in prehoda

## Pregled

**Repetitor** razširi doseg mesh omrežja.
**Prehod** poveže mesh z internetom (MQTT).

Ta vodnik prikazuje obe konfiguraciji.

---

## Razumevanje vlog vozlišč

### CLIENT
- Privzeta vloga za končne naprave
- Pošilja lastna sporočila
- Posreduje sporočila (ko je smiselno)
- Odziva se na Bluetooth povezave

### CLIENT_MUTE
- Kot CLIENT, vendar ne pošilja položaja
- Za uporabnike, ki želijo ostati anonimni

### ROUTER
- **Priporočeno za repetitorje**
- Aktivno posreduje sporočila
- Pošilja minimalne lastne podatke
- Optimizirano za neprekinjeno delovanje
- Bluetooth se po kratkem času izklopi

### ROUTER_CLIENT
- Kombinacija usmerjevalnika in odjemalca
- Za vozlišča, ki naj bi delala oboje
- Višja poraba energije

### REPEATER
- Samo posredovanje, brez lastne komunikacije
- Za čiste relejne postaje
- Minimalna poraba energije

---

## Nastavitev repetitorja (Meshtastic)

### Korak 1: Naložite firmware

1. Odprite https://flasher.meshtastic.org
2. Priključite ploščo
3. Naložite trenutni firmware

### Korak 2: Osnovna konfiguracija

Preko aplikacije ali CLI:

\`\`\`bash
# Nastavite regijo (POMEMBNO!)
meshtastic --set lora.region EU_868

# Nastavite vlogo na ROUTER
meshtastic --set device.role ROUTER

# Nastavite ime
meshtastic --set device.name "Repeater-1"
\`\`\`

### Korak 3: Nastavite položaj

Za stacionarne repetitorje onemogočite GPS in ročno nastavite položaj:

\`\`\`bash
# Onemogočite GPS (varčuje energijo)
meshtastic --set position.gps_mode DISABLED

# Nastavite fiksni položaj (zemljepisna širina, dolžina, višina v m)
meshtastic --setlat 47.1234 --setlon 13.5678 --setalt 850

# Označite položaj kot fiksen
meshtastic --set position.fixed_position true
\`\`\`

### Korak 4: Nastavitve varčevanja z energijo

\`\`\`bash
# Bluetooth izklop po 60 sekundah
meshtastic --set power.wait_bluetooth_secs 60

# Zaslon izklop po 60 sekundah (če je prisoten)
meshtastic --set display.screen_on_secs 60

# Omogočite lahki spanec (varčuje energijo)
meshtastic --set power.ls_secs 300
\`\`\`

### Korak 5: Optimizacija LoRa

\`\`\`bash
# Omejitev skokov (privzeto: 3, za velika omrežja: 5-7)
meshtastic --set lora.hop_limit 5

# TX moč (privzeto običajno OK)
# meshtastic --set lora.tx_power 20

# Modem preset (LONG_FAST je dober)
# Za večji doseg: LONG_MODERATE ali LONG_SLOW
meshtastic --set lora.modem_preset LONG_FAST
\`\`\`

---

## Nastavitev MQTT prehoda

Prehod povezuje mesh omrežje z internetom.

### Predpogoji

- Repetitorsko vozlišče z WiFi (na osnovi ESP32)
- WiFi dostop na lokaciji
- MQTT posrednik (javni ali lastni)

### Korak 1: Konfiguracija WiFi

\`\`\`bash
# Omogočite WiFi
meshtastic --set wifi.enabled true

# Nastavite poverilnice
meshtastic --set wifi.ssid "VašeWiFiIme"
meshtastic --set wifi.psk "VašeWiFiGeslo"
\`\`\`

### Korak 2: Konfiguracija MQTT

**Javni posrednik (meshtastic.org):**

\`\`\`bash
# Omogočite MQTT
meshtastic --set mqtt.enabled true

# Uporabite javni posrednik
meshtastic --set mqtt.address mqtt.meshtastic.org

# Korenski topic (privzeto: msh)
meshtastic --set mqtt.root msh/EU_868

# Obdržite šifriranje omogočeno!
meshtastic --set mqtt.encryption_enabled true
\`\`\`

**Lastni posrednik:**

\`\`\`bash
meshtastic --set mqtt.enabled true
meshtastic --set mqtt.address mqtt.vasstreznik.si
meshtastic --set mqtt.username vasuser
meshtastic --set mqtt.password vasegeslo
meshtastic --set mqtt.root msh/custom
\`\`\`

### Korak 3: Uplink/Downlink

\`\`\`bash
# Pošiljanje sporočil na internet
meshtastic --ch-set uplink_enabled true --ch-index 0

# Prejemanje sporočil z interneta
meshtastic --ch-set downlink_enabled true --ch-index 0
\`\`\`

---

## Spremljanje in vzdrževanje

### Omogočite telemetrijo

\`\`\`bash
# Pošiljanje statusa naprave (vsakih 30 min)
meshtastic --set telemetry.device_update_interval 1800

# Spremljanje napetosti baterije
meshtastic --set telemetry.environment_measurement_enabled true
\`\`\`

### Oddaljeno vzdrževanje preko MQTT

Z MQTT lahko oddaljeno spremljate vozlišče:
- Položaj
- Status baterije
- Čas delovanja
- Zadnji paketi

Orodja:
- MQTT Explorer (namizna aplikacija)
- Meshtastic Web Client

### Pogoste težave

| Težava | Rešitev |
|--------|---------|
| Ni posredovanih paketov | Preverite omejitev skokov, Role = ROUTER |
| WiFi se ne poveže | Preverite SSID/PSK, doseg |
| MQTT brez povezave | Naslov posrednika, vrata, požarni zid |
| Visoka poraba energije | GPS izklop, Bluetooth timeout |
| Ponovni zagoni | Preverite napajanje |

---

## Nasveti za lokacijo

### Idealno za repetitorje

- **Višina**: Višje je bolje
- **Prosta vidljivost**: Brez ovir v glavnih smereh
- **Napajanje**: Zanesljiva oskrba (napajalnik > baterija)
- **Internet**: Za MQTT prehod potreben WiFi

### Primeri lokacij

| Lokacija | Prednosti | Slabosti |
|----------|-----------|----------|
| Podstrešje | Zaščiteno, napajanje | Možna slabitev skozi streho |
| Balkon | Dobra višina, napajanje | Potrebna zaščita pred vremenom |
| Planinska koča | Najboljši doseg | Napajanje, dostop |
| Pisarna | Napajanje, WiFi | Pogosto nizko |

### Testiranje pokritosti

1. Namestite repetitor
2. Hodite naokoli z mobilnim vozliščem
3. Opazujte RSSI/SNR
4. Identificirajte vrzeli
5. Po potrebi načrtujte dodatne repetitorje

---

## Načrtovanje omrežja

### Mesh arhitektura

\`\`\`
                   [Prehod]
                      │
                      │ MQTT
                      ▼
    [Repetitor A] ◄──► [Repetitor B]
         │                │
         ▼                ▼
    [Odjemalec 1]   [Odjemalec 2]
    [Odjemalec 2]   [Odjemalec 3]
\`\`\`

### Priporočila

- **Omejitev skokov**: Ne previsoko (3-5 optimalno)
- **Prekrivanje**: Vsako vozlišče naj vidi 2+ sosedov
- **Hrbtenica**: Povežite repetitorje z najboljšimi lokacijami
- **Redundanca**: Brez enotnih točk odpovedi

---

## Kontrolni seznam: Zagon repetitorja

- [ ] Firmware posodobljen
- [ ] Regija pravilna (EU_868)
- [ ] Role = ROUTER
- [ ] Položaj nastavljen (ročno ali GPS)
- [ ] Nastavitve varčevanja z energijo aktivne
- [ ] Antena priključena
- [ ] Ohišje vodoodporno (za zunanjo uporabo)
- [ ] Napajanje stabilno
- [ ] Testni paket prejet in posredovan
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'REPEATER_GATEWAY_GUIDE.md',

  externalLinks: [
    {
      title: {
        de: 'Meshtastic Device Roles',
        en: 'Meshtastic Device Roles',
        sl: 'Meshtastic vloge naprav',
      },
      url: 'https://meshtastic.org/docs/configuration/radio/device/',
    },
    {
      title: {
        de: 'MQTT Konfiguration',
        en: 'MQTT Configuration',
        sl: 'MQTT konfiguracija',
      },
      url: 'https://meshtastic.org/docs/configuration/module/mqtt/',
    },
    {
      title: {
        de: 'Meshtastic WiFi Setup',
        en: 'Meshtastic WiFi Setup',
        sl: 'Meshtastic WiFi nastavitev',
      },
      url: 'https://meshtastic.org/docs/configuration/radio/network/',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Welche Rolle für meinen Node?',
      en: 'Which role for my node?',
      sl: 'Katera vloga za moje vozlišče?',
    },
    {
      de: 'Wie verbinde ich mit eigenem MQTT-Broker?',
      en: 'How do I connect to my own MQTT broker?',
      sl: 'Kako se povežem z lastnim MQTT posrednikom?',
    },
    {
      de: 'Wie überwache ich den Repeater remote?',
      en: 'How do I monitor the repeater remotely?',
      sl: 'Kako oddaljeno spremljam repetitor?',
    },
    {
      de: 'Optimale Hop-Limit Einstellung?',
      en: 'Optimal hop limit setting?',
      sl: 'Optimalna nastavitev omejitve skokov?',
    },
    {
      de: 'Wie plane ich ein Mesh-Netzwerk?',
      en: 'How do I plan a mesh network?',
      sl: 'Kako načrtujem mesh omrežje?',
    },
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2',
      price: '~35€',
      features: [
        {
          de: 'GPS',
          en: 'GPS',
          sl: 'GPS',
        },
        {
          de: '18650 Akku',
          en: '18650 Battery',
          sl: '18650 baterija',
        },
        {
          de: 'WiFi für MQTT',
          en: 'WiFi for MQTT',
          sl: 'WiFi za MQTT',
        },
      ],
      recommended: true,
    },
    {
      name: 'Heltec LoRa V3',
      price: '~25€',
      features: [
        {
          de: 'Kompakt',
          en: 'Compact',
          sl: 'Kompakten',
        },
        {
          de: 'WiFi',
          en: 'WiFi',
          sl: 'WiFi',
        },
        {
          de: 'Günstig',
          en: 'Affordable',
          sl: 'Ugoden',
        },
      ],
    },
    {
      name: 'RAK WisMesh Repeater',
      price: '~100€',
      features: [
        {
          de: 'Wetterfest',
          en: 'Weatherproof',
          sl: 'Vodoodporen',
        },
        {
          de: 'Solar',
          en: 'Solar',
          sl: 'Solarni',
        },
        {
          de: 'Fertiggerät',
          en: 'Ready-made device',
          sl: 'Gotova naprava',
        },
      ],
    },
    {
      name: 'Station G2',
      price: '~100€',
      features: [
        {
          de: 'High Power',
          en: 'High Power',
          sl: 'Visoka moč',
        },
        {
          de: 'Robustes Gehäuse',
          en: 'Robust enclosure',
          sl: 'Robustno ohišje',
        },
      ],
    },
  ],
};
