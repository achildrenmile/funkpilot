import type { HamProject } from '../../types/projects';

export const meshtasticRepeaterGuide: HamProject = {
  id: 'meshtastic-repeater-guide',
  name: 'Repeater & Gateway einrichten',
  category: 'mesh-lora',
  difficulty: 2,
  description: 'Schritt-für-Schritt Anleitung zum Einrichten eines permanenten Meshtastic Repeaters oder MQTT-Gateways.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    { name: 'LoRa-Board (T-Beam, Heltec, RAK)', quantity: 1, notes: 'Für Dauerbetrieb geeignet' },
    { name: 'Netzteil 5V 2A', quantity: 1, notes: 'USB-C oder Micro-USB' },
    { name: 'Outdoor-Antenne', quantity: 1, notes: 'Für bessere Reichweite' },
    { name: 'Wetterfestes Gehäuse', quantity: 1, notes: 'Bei Außenmontage' },
  ],
  estimatedCost: '40-80 EUR',

  code: `# Repeater & Gateway einrichten

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
  codeLanguage: 'markdown',
  codeFileName: 'REPEATER_GATEWAY_GUIDE.md',

  externalLinks: [
    { title: 'Meshtastic Device Roles', url: 'https://meshtastic.org/docs/configuration/radio/device/' },
    { title: 'MQTT Konfiguration', url: 'https://meshtastic.org/docs/configuration/module/mqtt/' },
    { title: 'Meshtastic WiFi Setup', url: 'https://meshtastic.org/docs/configuration/radio/network/' },
  ],

  customizationSuggestions: [
    'Welche Rolle für meinen Node?',
    'Wie verbinde ich mit eigenem MQTT-Broker?',
    'Wie überwache ich den Repeater remote?',
    'Optimale Hop-Limit Einstellung?',
    'Wie plane ich ein Mesh-Netzwerk?',
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2',
      price: '~35€',
      features: ['GPS', '18650 Akku', 'WiFi für MQTT'],
      recommended: true,
    },
    {
      name: 'Heltec LoRa V3',
      price: '~25€',
      features: ['Kompakt', 'WiFi', 'Günstig'],
    },
    {
      name: 'RAK WisMesh Repeater',
      price: '~100€',
      features: ['Wetterfest', 'Solar', 'Fertiggerät'],
    },
    {
      name: 'Station G2',
      price: '~100€',
      features: ['High Power', 'Robustes Gehäuse'],
    },
  ],
};
