import type { HamProject } from '../../types/projects';

export const mqttBridgeGuide: HamProject = {
  id: 'mqtt-bridge-guide',
  name: 'MQTT-Bridge einrichten',
  category: 'mesh-lora',
  difficulty: 2,
  description: 'Verbinde dein Mesh-Netzwerk mit dem Internet über MQTT. Nachrichten weltweit senden und empfangen.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    { name: 'LoRa-Board mit WiFi (ESP32)', quantity: 1, notes: 'T-Beam, Heltec, etc.' },
    { name: 'WiFi-Zugang', quantity: 1, notes: 'Am Gateway-Standort' },
    { name: 'MQTT-Broker (optional)', quantity: 1, notes: 'Oder öffentlichen nutzen' },
  ],
  estimatedCost: '25-40 EUR',

  code: `# MQTT-Bridge für Meshtastic einrichten

## Was ist MQTT?

**MQTT** (Message Queuing Telemetry Transport) ist ein leichtgewichtiges
Protokoll für IoT-Kommunikation. Mit einer MQTT-Bridge kannst du:

- Mesh-Nachrichten ins Internet senden
- Nachrichten von anderen Mesh-Netzwerken empfangen
- Nodes weltweit verbinden
- Daten in Home Assistant, Node-RED etc. nutzen

---

## Architektur

\`\`\`
┌─────────────┐     LoRa      ┌─────────────┐
│   Client    │◄────────────► │   Gateway   │
│   (mobil)   │               │  (ESP32+WiFi)│
└─────────────┘               └──────┬──────┘
                                     │ WiFi
                                     ▼
                              ┌─────────────┐
                              │ MQTT-Broker │
                              │ (Internet)  │
                              └──────┬──────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
       ┌───────────┐          ┌───────────┐          ┌───────────┐
       │ Anderes   │          │  Home     │          │  Web-     │
       │ Mesh-Netz │          │ Assistant │          │  Client   │
       └───────────┘          └───────────┘          └───────────┘
\`\`\`

---

## Voraussetzungen

1. **ESP32-basiertes Board** (T-Beam, Heltec V3, etc.)
2. **WiFi am Standort** des Gateways
3. **Meshtastic Firmware** (aktuell)
4. **MQTT-Broker** (öffentlich oder eigener)

---

## MQTT-Broker Optionen

### Option 1: Öffentlicher Broker (meshtastic.org)

**Vorteile**: Keine Einrichtung, sofort nutzbar
**Nachteile**: Öffentlich (wenn auch verschlüsselt)

\`\`\`
Adresse: mqtt.meshtastic.org
Port: 1883 (unverschlüsselt) oder 8883 (TLS)
Username: meshdev
Password: large4cats
\`\`\`

### Option 2: Eigener Broker (Mosquitto)

**Installation auf Linux/Raspberry Pi:**

\`\`\`bash
# Mosquitto installieren
sudo apt update
sudo apt install mosquitto mosquitto-clients

# Starten
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Passwort setzen
sudo mosquitto_passwd -c /etc/mosquitto/passwd meshuser
\`\`\`

**Konfiguration (/etc/mosquitto/mosquitto.conf):**

\`\`\`
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd
\`\`\`

### Option 3: Cloud-Broker

- **HiveMQ Cloud** (kostenloser Tier)
- **CloudMQTT**
- **AWS IoT Core**

---

## Gateway konfigurieren

### Schritt 1: WiFi einrichten

\`\`\`bash
# WiFi aktivieren
meshtastic --set network.wifi_enabled true

# Zugangsdaten
meshtastic --set network.wifi_ssid "DeinWiFiName"
meshtastic --set network.wifi_psk "DeinPasswort"
\`\`\`

### Schritt 2: MQTT aktivieren

**Für öffentlichen Broker:**

\`\`\`bash
# MQTT aktivieren
meshtastic --set mqtt.enabled true

# Broker-Adresse
meshtastic --set mqtt.address mqtt.meshtastic.org

# Credentials (öffentlicher Broker)
meshtastic --set mqtt.username meshdev
meshtastic --set mqtt.password large4cats

# Root-Topic
meshtastic --set mqtt.root msh/EU_868
\`\`\`

**Für eigenen Broker:**

\`\`\`bash
meshtastic --set mqtt.enabled true
meshtastic --set mqtt.address 192.168.1.100
meshtastic --set mqtt.username meshuser
meshtastic --set mqtt.password deinpasswort
meshtastic --set mqtt.root msh/home
\`\`\`

### Schritt 3: Verschlüsselung

\`\`\`bash
# Verschlüsselung aktivieren (WICHTIG!)
meshtastic --set mqtt.encryption_enabled true

# JSON-Ausgabe (für Home Assistant etc.)
meshtastic --set mqtt.json_enabled true
\`\`\`

### Schritt 4: Channels konfigurieren

\`\`\`bash
# Uplink aktivieren (Mesh → Internet)
meshtastic --ch-set uplink_enabled true --ch-index 0

# Downlink aktivieren (Internet → Mesh)
meshtastic --ch-set downlink_enabled true --ch-index 0
\`\`\`

---

## Topic-Struktur

Meshtastic verwendet folgende MQTT-Topics:

\`\`\`
msh/EU_868/2/json/LongFast/!abcd1234
│   │      │ │    │        └── Node-ID
│   │      │ │    └── Channel-Name
│   │      │ └── Format (json oder protobuf)
│   │      └── Version
│   └── Region
└── Root-Topic
\`\`\`

### Wichtige Topics

| Topic | Beschreibung |
|-------|-------------|
| \`.../json/.../\` | JSON-formatierte Nachrichten |
| \`.../c/.../\` | Verschlüsselte Pakete |
| \`.../stat/...\` | Status-Updates |

---

## Nachrichten-Format (JSON)

\`\`\`json
{
  "channel": 0,
  "from": 1234567890,
  "id": 123456789,
  "payload": {
    "text": "Hallo Welt!"
  },
  "sender": "!abcd1234",
  "timestamp": 1704067200,
  "to": 4294967295,
  "type": "text"
}
\`\`\`

### Payload-Typen

- **text**: Textnachrichten
- **position**: GPS-Koordinaten
- **telemetry**: Gerätestatus, Sensordaten
- **nodeinfo**: Node-Informationen

---

## Home Assistant Integration

### MQTT-Sensor für Nachrichten

\`\`\`yaml
# configuration.yaml
mqtt:
  sensor:
    - name: "Meshtastic Letzte Nachricht"
      state_topic: "msh/EU_868/2/json/LongFast/#"
      value_template: "{{ value_json.payload.text }}"

    - name: "Meshtastic Node Batterie"
      state_topic: "msh/EU_868/2/json/LongFast/!abcd1234"
      value_template: "{{ value_json.payload.battery_level }}"
      unit_of_measurement: "%"
\`\`\`

### Automatisierung

\`\`\`yaml
automation:
  - alias: "Meshtastic Nachricht empfangen"
    trigger:
      platform: mqtt
      topic: "msh/EU_868/2/json/LongFast/#"
    action:
      service: notify.mobile_app
      data:
        message: "{{ trigger.payload_json.payload.text }}"
\`\`\`

---

## Node-RED Integration

### Flow: Nachrichten anzeigen

\`\`\`json
[
  {
    "id": "mqtt-in",
    "type": "mqtt in",
    "topic": "msh/EU_868/2/json/LongFast/#",
    "broker": "mqtt-broker"
  },
  {
    "id": "json-parse",
    "type": "json",
    "wires": [["debug"]]
  },
  {
    "id": "debug",
    "type": "debug",
    "complete": "payload"
  }
]
\`\`\`

---

## Troubleshooting

### WiFi verbindet nicht

\`\`\`bash
# Status prüfen
meshtastic --info

# WiFi neu konfigurieren
meshtastic --set network.wifi_enabled false
meshtastic --set network.wifi_enabled true
\`\`\`

### MQTT keine Verbindung

1. **Broker erreichbar?** \`ping mqtt.meshtastic.org\`
2. **Port offen?** Firewall prüfen (1883/8883)
3. **Credentials korrekt?**
4. **WiFi verbunden?**

### Keine Nachrichten

1. **Uplink aktiviert?** \`--ch-set uplink_enabled true\`
2. **Richtiger Channel?** \`--ch-index 0\`
3. **Verschlüsselung?** Sender und Empfänger gleich

---

## Sicherheit

### Best Practices

1. **Eigenen Broker verwenden** für private Daten
2. **TLS aktivieren** (Port 8883)
3. **Verschlüsselung nie deaktivieren**
4. **Starke Passwörter** für Broker
5. **Firewall** konfigurieren

### Öffentlicher Broker

- Nachrichten sind Ende-zu-Ende verschlüsselt
- Metadaten (wer, wann) sind sichtbar
- Für sensible Daten eigenen Broker nutzen

---

## Checkliste

- [ ] ESP32-Board mit WiFi
- [ ] WiFi konfiguriert und verbunden
- [ ] MQTT-Broker erreichbar
- [ ] MQTT aktiviert und konfiguriert
- [ ] Uplink/Downlink aktiviert
- [ ] Verschlüsselung aktiviert
- [ ] Test-Nachricht gesendet
- [ ] Nachricht im Broker angekommen
`,
  codeLanguage: 'markdown',
  codeFileName: 'MQTT_BRIDGE_GUIDE.md',

  externalLinks: [
    { title: 'Meshtastic MQTT Docs', url: 'https://meshtastic.org/docs/configuration/module/mqtt/' },
    { title: 'Mosquitto Broker', url: 'https://mosquitto.org/' },
    { title: 'MQTT Explorer', url: 'https://mqtt-explorer.com/' },
    { title: 'Home Assistant MQTT', url: 'https://www.home-assistant.io/integrations/mqtt/' },
  ],

  customizationSuggestions: [
    'Wie richte ich einen eigenen MQTT-Broker ein?',
    'Wie integriere ich Meshtastic in Home Assistant?',
    'Kann ich Nachrichten aus dem Internet ins Mesh senden?',
    'Wie sichere ich die MQTT-Verbindung ab?',
    'Welche Daten werden über MQTT gesendet?',
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2',
      price: '~35€',
      features: ['WiFi + LoRa', 'GPS', 'Ideal als Gateway'],
      recommended: true,
    },
    {
      name: 'Heltec LoRa V3',
      price: '~25€',
      features: ['WiFi + LoRa', 'Kompakt', 'Günstig'],
    },
    {
      name: 'Raspberry Pi + Broker',
      price: '~50€',
      features: ['Eigener MQTT-Broker', '24/7 Betrieb'],
    },
  ],
};
