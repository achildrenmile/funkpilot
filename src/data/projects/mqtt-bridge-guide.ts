import type { HamProject } from '../../types/projects';

export const mqttBridgeGuide: HamProject = {
  id: 'mqtt-bridge-guide',
  name: {
    de: 'MQTT-Bridge einrichten',
    en: 'Set up MQTT Bridge',
    sl: 'Nastavitev MQTT mostu',
  },
  category: 'mesh-lora',
  difficulty: 2,
  description: {
    de: 'Verbinde dein Mesh-Netzwerk mit dem Internet über MQTT. Nachrichten weltweit senden und empfangen.',
    en: 'Connect your mesh network to the internet via MQTT. Send and receive messages worldwide.',
    sl: 'Poveži svoje mesh omrežje z internetom prek MQTT. Pošiljaj in prejemaj sporočila po vsem svetu.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: {
        de: 'LoRa-Board mit WiFi (ESP32)',
        en: 'LoRa board with WiFi (ESP32)',
        sl: 'LoRa plošča z WiFi (ESP32)',
      },
      quantity: 1,
      notes: {
        de: 'T-Beam, Heltec, etc.',
        en: 'T-Beam, Heltec, etc.',
        sl: 'T-Beam, Heltec, itd.',
      },
    },
    {
      name: {
        de: 'WiFi-Zugang',
        en: 'WiFi access',
        sl: 'WiFi dostop',
      },
      quantity: 1,
      notes: {
        de: 'Am Gateway-Standort',
        en: 'At the gateway location',
        sl: 'Na lokaciji prehoda',
      },
    },
    {
      name: {
        de: 'MQTT-Broker (optional)',
        en: 'MQTT broker (optional)',
        sl: 'MQTT posrednik (neobvezno)',
      },
      quantity: 1,
      notes: {
        de: 'Oder öffentlichen nutzen',
        en: 'Or use a public one',
        sl: 'Ali uporabi javnega',
      },
    },
  ],
  estimatedCost: '25-40 EUR',

  code: {
    de: `# MQTT-Bridge für Meshtastic einrichten

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
    en: `# Set up MQTT Bridge for Meshtastic

## What is MQTT?

**MQTT** (Message Queuing Telemetry Transport) is a lightweight
protocol for IoT communication. With an MQTT bridge you can:

- Send mesh messages to the internet
- Receive messages from other mesh networks
- Connect nodes worldwide
- Use data in Home Assistant, Node-RED, etc.

---

## Architecture

\`\`\`
┌─────────────┐     LoRa      ┌─────────────┐
│   Client    │◄────────────► │   Gateway   │
│   (mobile)  │               │  (ESP32+WiFi)│
└─────────────┘               └──────┬──────┘
                                     │ WiFi
                                     ▼
                              ┌─────────────┐
                              │ MQTT Broker │
                              │ (Internet)  │
                              └──────┬──────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
       ┌───────────┐          ┌───────────┐          ┌───────────┐
       │  Other    │          │  Home     │          │  Web      │
       │ Mesh Net  │          │ Assistant │          │  Client   │
       └───────────┘          └───────────┘          └───────────┘
\`\`\`

---

## Prerequisites

1. **ESP32-based board** (T-Beam, Heltec V3, etc.)
2. **WiFi at the location** of the gateway
3. **Meshtastic Firmware** (current version)
4. **MQTT Broker** (public or private)

---

## MQTT Broker Options

### Option 1: Public Broker (meshtastic.org)

**Advantages**: No setup required, immediately usable
**Disadvantages**: Public (although encrypted)

\`\`\`
Address: mqtt.meshtastic.org
Port: 1883 (unencrypted) or 8883 (TLS)
Username: meshdev
Password: large4cats
\`\`\`

### Option 2: Own Broker (Mosquitto)

**Installation on Linux/Raspberry Pi:**

\`\`\`bash
# Install Mosquitto
sudo apt update
sudo apt install mosquitto mosquitto-clients

# Start
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Set password
sudo mosquitto_passwd -c /etc/mosquitto/passwd meshuser
\`\`\`

**Configuration (/etc/mosquitto/mosquitto.conf):**

\`\`\`
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd
\`\`\`

### Option 3: Cloud Broker

- **HiveMQ Cloud** (free tier)
- **CloudMQTT**
- **AWS IoT Core**

---

## Configure Gateway

### Step 1: Set up WiFi

\`\`\`bash
# Enable WiFi
meshtastic --set network.wifi_enabled true

# Credentials
meshtastic --set network.wifi_ssid "YourWiFiName"
meshtastic --set network.wifi_psk "YourPassword"
\`\`\`

### Step 2: Enable MQTT

**For public broker:**

\`\`\`bash
# Enable MQTT
meshtastic --set mqtt.enabled true

# Broker address
meshtastic --set mqtt.address mqtt.meshtastic.org

# Credentials (public broker)
meshtastic --set mqtt.username meshdev
meshtastic --set mqtt.password large4cats

# Root topic
meshtastic --set mqtt.root msh/EU_868
\`\`\`

**For own broker:**

\`\`\`bash
meshtastic --set mqtt.enabled true
meshtastic --set mqtt.address 192.168.1.100
meshtastic --set mqtt.username meshuser
meshtastic --set mqtt.password yourpassword
meshtastic --set mqtt.root msh/home
\`\`\`

### Step 3: Encryption

\`\`\`bash
# Enable encryption (IMPORTANT!)
meshtastic --set mqtt.encryption_enabled true

# JSON output (for Home Assistant etc.)
meshtastic --set mqtt.json_enabled true
\`\`\`

### Step 4: Configure Channels

\`\`\`bash
# Enable uplink (Mesh → Internet)
meshtastic --ch-set uplink_enabled true --ch-index 0

# Enable downlink (Internet → Mesh)
meshtastic --ch-set downlink_enabled true --ch-index 0
\`\`\`

---

## Topic Structure

Meshtastic uses the following MQTT topics:

\`\`\`
msh/EU_868/2/json/LongFast/!abcd1234
│   │      │ │    │        └── Node ID
│   │      │ │    └── Channel name
│   │      │ └── Format (json or protobuf)
│   │      └── Version
│   └── Region
└── Root topic
\`\`\`

### Important Topics

| Topic | Description |
|-------|-------------|
| \`.../json/.../\` | JSON-formatted messages |
| \`.../c/.../\` | Encrypted packets |
| \`.../stat/...\` | Status updates |

---

## Message Format (JSON)

\`\`\`json
{
  "channel": 0,
  "from": 1234567890,
  "id": 123456789,
  "payload": {
    "text": "Hello World!"
  },
  "sender": "!abcd1234",
  "timestamp": 1704067200,
  "to": 4294967295,
  "type": "text"
}
\`\`\`

### Payload Types

- **text**: Text messages
- **position**: GPS coordinates
- **telemetry**: Device status, sensor data
- **nodeinfo**: Node information

---

## Home Assistant Integration

### MQTT Sensor for Messages

\`\`\`yaml
# configuration.yaml
mqtt:
  sensor:
    - name: "Meshtastic Last Message"
      state_topic: "msh/EU_868/2/json/LongFast/#"
      value_template: "{{ value_json.payload.text }}"

    - name: "Meshtastic Node Battery"
      state_topic: "msh/EU_868/2/json/LongFast/!abcd1234"
      value_template: "{{ value_json.payload.battery_level }}"
      unit_of_measurement: "%"
\`\`\`

### Automation

\`\`\`yaml
automation:
  - alias: "Meshtastic Message Received"
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

### Flow: Display Messages

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

### WiFi won't connect

\`\`\`bash
# Check status
meshtastic --info

# Reconfigure WiFi
meshtastic --set network.wifi_enabled false
meshtastic --set network.wifi_enabled true
\`\`\`

### MQTT no connection

1. **Broker reachable?** \`ping mqtt.meshtastic.org\`
2. **Port open?** Check firewall (1883/8883)
3. **Credentials correct?**
4. **WiFi connected?**

### No messages

1. **Uplink enabled?** \`--ch-set uplink_enabled true\`
2. **Correct channel?** \`--ch-index 0\`
3. **Encryption?** Sender and receiver must match

---

## Security

### Best Practices

1. **Use your own broker** for private data
2. **Enable TLS** (Port 8883)
3. **Never disable encryption**
4. **Strong passwords** for broker
5. **Configure firewall**

### Public Broker

- Messages are end-to-end encrypted
- Metadata (who, when) is visible
- Use your own broker for sensitive data

---

## Checklist

- [ ] ESP32 board with WiFi
- [ ] WiFi configured and connected
- [ ] MQTT broker reachable
- [ ] MQTT enabled and configured
- [ ] Uplink/Downlink enabled
- [ ] Encryption enabled
- [ ] Test message sent
- [ ] Message received at broker
`,
    sl: `# Nastavitev MQTT mostu za Meshtastic

## Kaj je MQTT?

**MQTT** (Message Queuing Telemetry Transport) je lahek
protokol za IoT komunikacijo. Z MQTT mostom lahko:

- Pošiljaš mesh sporočila na internet
- Prejemaš sporočila iz drugih mesh omrežij
- Povezuješ vozlišča po vsem svetu
- Uporabljaš podatke v Home Assistant, Node-RED itd.

---

## Arhitektura

\`\`\`
┌─────────────┐     LoRa      ┌─────────────┐
│   Odjemalec │◄────────────► │   Prehod    │
│   (mobilni) │               │  (ESP32+WiFi)│
└─────────────┘               └──────┬──────┘
                                     │ WiFi
                                     ▼
                              ┌─────────────┐
                              │ MQTT Posred-│
                              │ nik (Intern.)│
                              └──────┬──────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
       ┌───────────┐          ┌───────────┐          ┌───────────┐
       │  Drugo    │          │  Home     │          │  Spletni  │
       │ Mesh omr. │          │ Assistant │          │  odjemalec│
       └───────────┘          └───────────┘          └───────────┘
\`\`\`

---

## Predpogoji

1. **ESP32 plošča** (T-Beam, Heltec V3, itd.)
2. **WiFi na lokaciji** prehoda
3. **Meshtastic Firmware** (trenutna verzija)
4. **MQTT Posrednik** (javni ali zasebni)

---

## Možnosti MQTT posrednika

### Možnost 1: Javni posrednik (meshtastic.org)

**Prednosti**: Brez nastavitev, takoj uporaben
**Slabosti**: Javen (čeprav šifriran)

\`\`\`
Naslov: mqtt.meshtastic.org
Vrata: 1883 (nešifrirano) ali 8883 (TLS)
Username: meshdev
Password: large4cats
\`\`\`

### Možnost 2: Lastni posrednik (Mosquitto)

**Namestitev na Linux/Raspberry Pi:**

\`\`\`bash
# Namesti Mosquitto
sudo apt update
sudo apt install mosquitto mosquitto-clients

# Zaženi
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Nastavi geslo
sudo mosquitto_passwd -c /etc/mosquitto/passwd meshuser
\`\`\`

**Konfiguracija (/etc/mosquitto/mosquitto.conf):**

\`\`\`
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd
\`\`\`

### Možnost 3: Oblačni posrednik

- **HiveMQ Cloud** (brezplačna raven)
- **CloudMQTT**
- **AWS IoT Core**

---

## Konfiguracija prehoda

### Korak 1: Nastavitev WiFi

\`\`\`bash
# Omogoči WiFi
meshtastic --set network.wifi_enabled true

# Poverilnice
meshtastic --set network.wifi_ssid "TvojeWiFiIme"
meshtastic --set network.wifi_psk "TvojeGeslo"
\`\`\`

### Korak 2: Omogoči MQTT

**Za javni posrednik:**

\`\`\`bash
# Omogoči MQTT
meshtastic --set mqtt.enabled true

# Naslov posrednika
meshtastic --set mqtt.address mqtt.meshtastic.org

# Poverilnice (javni posrednik)
meshtastic --set mqtt.username meshdev
meshtastic --set mqtt.password large4cats

# Korenska tema
meshtastic --set mqtt.root msh/EU_868
\`\`\`

**Za lastni posrednik:**

\`\`\`bash
meshtastic --set mqtt.enabled true
meshtastic --set mqtt.address 192.168.1.100
meshtastic --set mqtt.username meshuser
meshtastic --set mqtt.password tvojegeslo
meshtastic --set mqtt.root msh/home
\`\`\`

### Korak 3: Šifriranje

\`\`\`bash
# Omogoči šifriranje (POMEMBNO!)
meshtastic --set mqtt.encryption_enabled true

# JSON izhod (za Home Assistant itd.)
meshtastic --set mqtt.json_enabled true
\`\`\`

### Korak 4: Konfiguracija kanalov

\`\`\`bash
# Omogoči uplink (Mesh → Internet)
meshtastic --ch-set uplink_enabled true --ch-index 0

# Omogoči downlink (Internet → Mesh)
meshtastic --ch-set downlink_enabled true --ch-index 0
\`\`\`

---

## Struktura tem

Meshtastic uporablja naslednje MQTT teme:

\`\`\`
msh/EU_868/2/json/LongFast/!abcd1234
│   │      │ │    │        └── ID vozlišča
│   │      │ │    └── Ime kanala
│   │      │ └── Format (json ali protobuf)
│   │      └── Verzija
│   └── Regija
└── Korenska tema
\`\`\`

### Pomembne teme

| Tema | Opis |
|-------|-------------|
| \`.../json/.../\` | JSON formatirana sporočila |
| \`.../c/.../\` | Šifrirani paketi |
| \`.../stat/...\` | Posodobitve stanja |

---

## Format sporočil (JSON)

\`\`\`json
{
  "channel": 0,
  "from": 1234567890,
  "id": 123456789,
  "payload": {
    "text": "Pozdravljen svet!"
  },
  "sender": "!abcd1234",
  "timestamp": 1704067200,
  "to": 4294967295,
  "type": "text"
}
\`\`\`

### Tipi vsebine

- **text**: Besedilna sporočila
- **position**: GPS koordinate
- **telemetry**: Stanje naprave, podatki senzorjev
- **nodeinfo**: Informacije o vozlišču

---

## Integracija Home Assistant

### MQTT senzor za sporočila

\`\`\`yaml
# configuration.yaml
mqtt:
  sensor:
    - name: "Meshtastic Zadnje sporočilo"
      state_topic: "msh/EU_868/2/json/LongFast/#"
      value_template: "{{ value_json.payload.text }}"

    - name: "Meshtastic Baterija vozlišča"
      state_topic: "msh/EU_868/2/json/LongFast/!abcd1234"
      value_template: "{{ value_json.payload.battery_level }}"
      unit_of_measurement: "%"
\`\`\`

### Avtomatizacija

\`\`\`yaml
automation:
  - alias: "Meshtastic Sporočilo prejeto"
    trigger:
      platform: mqtt
      topic: "msh/EU_868/2/json/LongFast/#"
    action:
      service: notify.mobile_app
      data:
        message: "{{ trigger.payload_json.payload.text }}"
\`\`\`

---

## Integracija Node-RED

### Tok: Prikaz sporočil

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

## Odpravljanje težav

### WiFi se ne poveže

\`\`\`bash
# Preveri stanje
meshtastic --info

# Ponovno konfiguriraj WiFi
meshtastic --set network.wifi_enabled false
meshtastic --set network.wifi_enabled true
\`\`\`

### MQTT brez povezave

1. **Posrednik dosegljiv?** \`ping mqtt.meshtastic.org\`
2. **Vrata odprta?** Preveri požarni zid (1883/8883)
3. **Poverilnice pravilne?**
4. **WiFi povezan?**

### Ni sporočil

1. **Uplink omogočen?** \`--ch-set uplink_enabled true\`
2. **Pravi kanal?** \`--ch-index 0\`
3. **Šifriranje?** Pošiljatelj in prejemnik morata biti enaka

---

## Varnost

### Najboljše prakse

1. **Uporabi lastni posrednik** za zasebne podatke
2. **Omogoči TLS** (Vrata 8883)
3. **Nikoli ne onemogoči šifriranja**
4. **Močna gesla** za posrednika
5. **Konfiguriraj požarni zid**

### Javni posrednik

- Sporočila so od konca do konca šifrirana
- Metapodatki (kdo, kdaj) so vidni
- Za občutljive podatke uporabi lastni posrednik

---

## Kontrolni seznam

- [ ] ESP32 plošča z WiFi
- [ ] WiFi konfiguriran in povezan
- [ ] MQTT posrednik dosegljiv
- [ ] MQTT omogočen in konfiguriran
- [ ] Uplink/Downlink omogočen
- [ ] Šifriranje omogočeno
- [ ] Testno sporočilo poslano
- [ ] Sporočilo prejeto pri posredniku
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'MQTT_BRIDGE_GUIDE.md',

  externalLinks: [
    {
      title: {
        de: 'Meshtastic MQTT Docs',
        en: 'Meshtastic MQTT Docs',
        sl: 'Meshtastic MQTT dokumentacija',
      },
      url: 'https://meshtastic.org/docs/configuration/module/mqtt/',
    },
    {
      title: {
        de: 'Mosquitto Broker',
        en: 'Mosquitto Broker',
        sl: 'Mosquitto posrednik',
      },
      url: 'https://mosquitto.org/',
    },
    {
      title: {
        de: 'MQTT Explorer',
        en: 'MQTT Explorer',
        sl: 'MQTT Explorer',
      },
      url: 'https://mqtt-explorer.com/',
    },
    {
      title: {
        de: 'Home Assistant MQTT',
        en: 'Home Assistant MQTT',
        sl: 'Home Assistant MQTT',
      },
      url: 'https://www.home-assistant.io/integrations/mqtt/',
    },
  ],

  customizationSuggestions: [
    { de: 'Wie richte ich einen eigenen MQTT-Broker ein?', en: 'How do I set up my own MQTT broker?', sl: 'Kako nastavim lastni MQTT posrednik?' },
    { de: 'Wie integriere ich Meshtastic in Home Assistant?', en: 'How do I integrate Meshtastic into Home Assistant?', sl: 'Kako integriram Meshtastic v Home Assistant?' },
    { de: 'Kann ich Nachrichten aus dem Internet ins Mesh senden?', en: 'Can I send messages from the internet to the mesh?', sl: 'Ali lahko pošiljam sporočila z interneta v mesh?' },
    { de: 'Wie sichere ich die MQTT-Verbindung ab?', en: 'How do I secure the MQTT connection?', sl: 'Kako zaščitim MQTT povezavo?' },
    { de: 'Welche Daten werden über MQTT gesendet?', en: 'What data is sent via MQTT?', sl: 'Kateri podatki se pošiljajo prek MQTT?' },
  ],

  hardwareOptions: [
    {
      name: { de: 'LILYGO T-Beam v1.2', en: 'LILYGO T-Beam v1.2', sl: 'LILYGO T-Beam v1.2' },
      price: '~35€',
      features: [
        { de: 'WiFi + LoRa', en: 'WiFi + LoRa', sl: 'WiFi + LoRa' },
        { de: 'GPS', en: 'GPS', sl: 'GPS' },
        { de: 'Ideal als Gateway', en: 'Ideal as gateway', sl: 'Idealen kot prehod' },
      ],
      recommended: true,
    },
    {
      name: { de: 'Heltec LoRa V3', en: 'Heltec LoRa V3', sl: 'Heltec LoRa V3' },
      price: '~25€',
      features: [
        { de: 'WiFi + LoRa', en: 'WiFi + LoRa', sl: 'WiFi + LoRa' },
        { de: 'Kompakt', en: 'Compact', sl: 'Kompakten' },
        { de: 'Günstig', en: 'Affordable', sl: 'Ugoden' },
      ],
    },
    {
      name: { de: 'Raspberry Pi + Broker', en: 'Raspberry Pi + Broker', sl: 'Raspberry Pi + Posrednik' },
      price: '~50€',
      features: [
        { de: 'Eigener MQTT-Broker', en: 'Own MQTT broker', sl: 'Lastni MQTT posrednik' },
        { de: '24/7 Betrieb', en: '24/7 operation', sl: '24/7 delovanje' },
      ],
    },
  ],
};
