import type { HamProject } from '../../types/projects';

export const aprsGatewayGuide: HamProject = {
  id: 'aprs-gateway-guide',
  name: {
    de: 'Meshtastic ↔ APRS Gateway',
    en: 'Meshtastic ↔ APRS Gateway',
    sl: 'Meshtastic ↔ APRS prehod',
  },
  category: 'mesh-lora',
  difficulty: 3,
  description: {
    de: 'Verbinde Meshtastic mit dem APRS-Netzwerk. Positionen auf aprs.fi anzeigen und Nachrichten austauschen.',
    en: 'Connect Meshtastic to the APRS network. Display positions on aprs.fi and exchange messages.',
    sl: 'Poveži Meshtastic z omrežjem APRS. Prikaži položaje na aprs.fi in izmenjuj sporočila.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: {
        de: 'LoRa-Board mit WiFi',
        en: 'LoRa board with WiFi',
        sl: 'LoRa plošča z WiFi',
      },
      quantity: 1,
      notes: {
        de: 'T-Beam oder Heltec',
        en: 'T-Beam or Heltec',
        sl: 'T-Beam ali Heltec',
      },
    },
    {
      name: {
        de: 'Raspberry Pi (optional)',
        en: 'Raspberry Pi (optional)',
        sl: 'Raspberry Pi (neobvezno)',
      },
      quantity: 1,
      notes: {
        de: 'Für Direwolf/APRS-IS',
        en: 'For Direwolf/APRS-IS',
        sl: 'Za Direwolf/APRS-IS',
      },
    },
    {
      name: {
        de: 'Internet-Zugang',
        en: 'Internet access',
        sl: 'Dostop do interneta',
      },
      quantity: 1,
      notes: {
        de: 'Für APRS-IS Verbindung',
        en: 'For APRS-IS connection',
        sl: 'Za povezavo APRS-IS',
      },
    },
  ],
  estimatedCost: '35-100 EUR',

  code: {
    de: `# Meshtastic ↔ APRS Gateway

## Übersicht

Ein Gateway zwischen Meshtastic und APRS ermöglicht:

- **Positionen** auf aprs.fi anzeigen
- **Nachrichten** zwischen Mesh und APRS austauschen
- **Telemetrie** ins APRS-Netzwerk senden

**Voraussetzung**: Amateurfunklizenz (APRS nutzt 144.800 MHz)

---

## Gateway-Optionen

### Option 1: MQTT → APRS-IS (Empfohlen)

\`\`\`
┌─────────────┐     LoRa      ┌─────────────┐
│  Meshtastic │◄────────────► │   Gateway   │
│    Nodes    │               │  (ESP32)    │
└─────────────┘               └──────┬──────┘
                                     │ MQTT
                                     ▼
                              ┌─────────────┐
                              │  MQTT-to-   │
                              │  APRS-IS    │
                              │  (Script)   │
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │   APRS-IS   │
                              │  (Internet) │
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │   aprs.fi   │
                              └─────────────┘
\`\`\`

### Option 2: Direkt via Direwolf

Für fortgeschrittene Nutzer mit TNC/Soundkarte.

### Option 3: MeshCom (nativ)

MeshCom hat APRS-Integration eingebaut (für OE/DL).

---

## Option 1: MQTT → APRS-IS

### Schritt 1: MQTT-Gateway einrichten

Siehe "MQTT-Bridge einrichten" Guide.

\`\`\`bash
# Auf dem Meshtastic-Node
meshtastic --set network.wifi_enabled true
meshtastic --set network.wifi_ssid "DeinWiFi"
meshtastic --set network.wifi_psk "DeinPasswort"
meshtastic --set mqtt.enabled true
meshtastic --set mqtt.address mqtt.meshtastic.org
meshtastic --set mqtt.json_enabled true
meshtastic --ch-set uplink_enabled true --ch-index 0
\`\`\`

### Schritt 2: APRS-IS Zugangsdaten

Für APRS-IS brauchst du:
- **Rufzeichen** (z.B. OE8YML)
- **Passcode** (berechnen auf: https://apps.magicbug.co.uk/passcode/)

### Schritt 3: Bridge-Script (Python)

Auf einem Raspberry Pi oder Server:

\`\`\`python
#!/usr/bin/env python3
"""
Meshtastic MQTT to APRS-IS Bridge
Empfängt Positionen von Meshtastic und sendet sie an APRS-IS
"""

import paho.mqtt.client as mqtt
import aprslib
import json
import time

# Konfiguration
MQTT_BROKER = "mqtt.meshtastic.org"
MQTT_TOPIC = "msh/EU_868/2/json/LongFast/#"
MQTT_USER = "meshdev"
MQTT_PASS = "large4cats"

APRS_CALLSIGN = "OE8YML-15"  # Dein Rufzeichen + SSID
APRS_PASSCODE = "12345"      # Dein Passcode
APRS_SERVER = "euro.aprs2.net"
APRS_PORT = 14580

# Node-ID zu Rufzeichen Mapping
NODE_CALLSIGNS = {
    "!abcd1234": "OE8YML-7",
    "!efgh5678": "OE8ABC-9",
}

def on_mqtt_message(client, userdata, msg):
    """Verarbeite eingehende MQTT-Nachricht"""
    try:
        data = json.loads(msg.payload.decode())

        # Nur Positions-Pakete verarbeiten
        if data.get("type") != "position":
            return

        payload = data.get("payload", {})
        sender = data.get("sender", "")

        # Rufzeichen für Node finden
        callsign = NODE_CALLSIGNS.get(sender, f"MESH{sender[-4:]}")

        lat = payload.get("latitude_i", 0) / 1e7
        lon = payload.get("longitude_i", 0) / 1e7
        alt = payload.get("altitude", 0)

        if lat == 0 or lon == 0:
            return

        # APRS-Paket erstellen
        aprs_packet = create_aprs_position(callsign, lat, lon, alt)

        # An APRS-IS senden
        send_to_aprs(aprs_packet)

        print(f"Sent to APRS: {callsign} @ {lat:.5f}, {lon:.5f}")

    except Exception as e:
        print(f"Error: {e}")

def create_aprs_position(callsign, lat, lon, alt):
    """Erstelle APRS-Positionspaket"""
    # Latitude formatieren
    lat_deg = int(abs(lat))
    lat_min = (abs(lat) - lat_deg) * 60
    lat_dir = "N" if lat >= 0 else "S"
    lat_str = f"{lat_deg:02d}{lat_min:05.2f}{lat_dir}"

    # Longitude formatieren
    lon_deg = int(abs(lon))
    lon_min = (abs(lon) - lon_deg) * 60
    lon_dir = "E" if lon >= 0 else "W"
    lon_str = f"{lon_deg:03d}{lon_min:05.2f}{lon_dir}"

    # Symbol: /- = House (QTH)
    # Andere: /> = Car, /[ = Jogger, /k = Truck
    symbol_table = "/"
    symbol_code = "-"

    comment = f"Meshtastic via MQTT alt={alt}m"

    return f"{callsign}>APRS,TCPIP*:={lat_str}{symbol_table}{lon_str}{symbol_code}{comment}"

def send_to_aprs(packet):
    """Sende Paket an APRS-IS"""
    try:
        ais = aprslib.IS(APRS_CALLSIGN, passwd=APRS_PASSCODE,
                         host=APRS_SERVER, port=APRS_PORT)
        ais.connect()
        ais.sendall(packet)
        ais.close()
    except Exception as e:
        print(f"APRS-IS Error: {e}")

def main():
    # MQTT Client
    client = mqtt.Client()
    client.username_pw_set(MQTT_USER, MQTT_PASS)
    client.on_message = on_mqtt_message

    client.connect(MQTT_BROKER, 1883, 60)
    client.subscribe(MQTT_TOPIC)

    print(f"Connected to MQTT, forwarding to APRS-IS as {APRS_CALLSIGN}")
    client.loop_forever()

if __name__ == "__main__":
    main()
\`\`\`

### Schritt 4: Script starten

\`\`\`bash
# Dependencies installieren
pip install paho-mqtt aprslib

# Script starten
python3 meshtastic_aprs_bridge.py

# Als Service (systemd)
sudo nano /etc/systemd/system/mesh-aprs.service
\`\`\`

**Systemd Service:**

\`\`\`ini
[Unit]
Description=Meshtastic to APRS-IS Bridge
After=network.target

[Service]
Type=simple
User=pi
ExecStart=/usr/bin/python3 /home/pi/meshtastic_aprs_bridge.py
Restart=always

[Install]
WantedBy=multi-user.target
\`\`\`

---

## APRS-Symbole

| Symbol | Code | Beschreibung |
|--------|------|--------------|
| 🏠 | /- | Haus/QTH |
| 🚗 | /> | Auto |
| 🏃 | /[ | Wanderer |
| 📡 | /r | Repeater |
| ⛰️ | /\\ | Dreieck/Berg |

---

## Bidirektionale Kommunikation

### APRS → Meshtastic

Um Nachrichten von APRS ins Mesh zu senden:

\`\`\`python
def on_aprs_message(packet):
    """APRS Nachricht empfangen, an Mesh weiterleiten"""
    if packet.get("format") == "message":
        sender = packet.get("from")
        addressee = packet.get("addresse")
        message = packet.get("message_text")

        # An MQTT/Mesh senden
        mqtt_payload = {
            "type": "text",
            "payload": {"text": f"[APRS] {sender}: {message}"}
        }
        mqtt_client.publish(MQTT_TOPIC_DOWN, json.dumps(mqtt_payload))
\`\`\`

---

## MeshCom APRS (Alternative)

MeshCom hat APRS-Integration eingebaut:

1. **Gateway in OE**: OE1XUU, OE3XOR, etc.
2. **Automatisch**: Position wird an APRS gesendet
3. **Konfiguration**: Rufzeichen im MeshCom einstellen

Vorteile:
- Keine zusätzliche Software
- Funktioniert out-of-the-box
- Gateways vom ÖVSV betrieben

---

## Troubleshooting

### Position erscheint nicht auf aprs.fi

1. **Passcode korrekt?** Neu berechnen
2. **APRS-IS verbunden?** Server erreichbar?
3. **Koordinaten gültig?** Nicht 0/0?
4. **Rate Limit?** Max 1 Paket/30 Sekunden

### Fehler "Invalid callsign"

- Format: RUFZEICHEN-SSID (z.B. OE8YML-15)
- SSID: 0-15
- Keine Sonderzeichen

### MQTT keine Daten

- Uplink aktiviert?
- JSON-Format aktiviert?
- Richtiges Topic?

---

## Rechtliches

### APRS-IS Nutzung

- **Amateurfunklizenz erforderlich**
- Nur eigenes Rufzeichen verwenden
- Passcode nur für Lizenzinhaber

### Meshtastic Positionen

- Zustimmung der Node-Besitzer einholen
- Datenschutz beachten
- Nur öffentliche Positionen weiterleiten

---

## Checkliste

- [ ] Amateurfunklizenz vorhanden
- [ ] APRS Passcode berechnet
- [ ] Meshtastic MQTT-Gateway läuft
- [ ] Bridge-Script konfiguriert
- [ ] Node-zu-Rufzeichen Mapping erstellt
- [ ] Test-Position gesendet
- [ ] Auf aprs.fi sichtbar
`,
    en: `# Meshtastic ↔ APRS Gateway

## Overview

A gateway between Meshtastic and APRS enables:

- **Positions** displayed on aprs.fi
- **Messages** exchanged between Mesh and APRS
- **Telemetry** sent to the APRS network

**Prerequisite**: Amateur radio license (APRS uses 144.800 MHz)

---

## Gateway Options

### Option 1: MQTT → APRS-IS (Recommended)

\`\`\`
┌─────────────┐     LoRa      ┌─────────────┐
│  Meshtastic │◄────────────► │   Gateway   │
│    Nodes    │               │  (ESP32)    │
└─────────────┘               └──────┬──────┘
                                     │ MQTT
                                     ▼
                              ┌─────────────┐
                              │  MQTT-to-   │
                              │  APRS-IS    │
                              │  (Script)   │
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │   APRS-IS   │
                              │  (Internet) │
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │   aprs.fi   │
                              └─────────────┘
\`\`\`

### Option 2: Direct via Direwolf

For advanced users with TNC/sound card.

### Option 3: MeshCom (native)

MeshCom has built-in APRS integration (for OE/DL).

---

## Option 1: MQTT → APRS-IS

### Step 1: Set up MQTT Gateway

See "Set up MQTT Bridge" guide.

\`\`\`bash
# On the Meshtastic node
meshtastic --set network.wifi_enabled true
meshtastic --set network.wifi_ssid "YourWiFi"
meshtastic --set network.wifi_psk "YourPassword"
meshtastic --set mqtt.enabled true
meshtastic --set mqtt.address mqtt.meshtastic.org
meshtastic --set mqtt.json_enabled true
meshtastic --ch-set uplink_enabled true --ch-index 0
\`\`\`

### Step 2: APRS-IS Credentials

For APRS-IS you need:
- **Callsign** (e.g., OE8YML)
- **Passcode** (calculate at: https://apps.magicbug.co.uk/passcode/)

### Step 3: Bridge Script (Python)

On a Raspberry Pi or server:

\`\`\`python
#!/usr/bin/env python3
"""
Meshtastic MQTT to APRS-IS Bridge
Receives positions from Meshtastic and sends them to APRS-IS
"""

import paho.mqtt.client as mqtt
import aprslib
import json
import time

# Configuration
MQTT_BROKER = "mqtt.meshtastic.org"
MQTT_TOPIC = "msh/EU_868/2/json/LongFast/#"
MQTT_USER = "meshdev"
MQTT_PASS = "large4cats"

APRS_CALLSIGN = "OE8YML-15"  # Your callsign + SSID
APRS_PASSCODE = "12345"      # Your passcode
APRS_SERVER = "euro.aprs2.net"
APRS_PORT = 14580

# Node ID to callsign mapping
NODE_CALLSIGNS = {
    "!abcd1234": "OE8YML-7",
    "!efgh5678": "OE8ABC-9",
}

def on_mqtt_message(client, userdata, msg):
    """Process incoming MQTT message"""
    try:
        data = json.loads(msg.payload.decode())

        # Only process position packets
        if data.get("type") != "position":
            return

        payload = data.get("payload", {})
        sender = data.get("sender", "")

        # Find callsign for node
        callsign = NODE_CALLSIGNS.get(sender, f"MESH{sender[-4:]}")

        lat = payload.get("latitude_i", 0) / 1e7
        lon = payload.get("longitude_i", 0) / 1e7
        alt = payload.get("altitude", 0)

        if lat == 0 or lon == 0:
            return

        # Create APRS packet
        aprs_packet = create_aprs_position(callsign, lat, lon, alt)

        # Send to APRS-IS
        send_to_aprs(aprs_packet)

        print(f"Sent to APRS: {callsign} @ {lat:.5f}, {lon:.5f}")

    except Exception as e:
        print(f"Error: {e}")

def create_aprs_position(callsign, lat, lon, alt):
    """Create APRS position packet"""
    # Format latitude
    lat_deg = int(abs(lat))
    lat_min = (abs(lat) - lat_deg) * 60
    lat_dir = "N" if lat >= 0 else "S"
    lat_str = f"{lat_deg:02d}{lat_min:05.2f}{lat_dir}"

    # Format longitude
    lon_deg = int(abs(lon))
    lon_min = (abs(lon) - lon_deg) * 60
    lon_dir = "E" if lon >= 0 else "W"
    lon_str = f"{lon_deg:03d}{lon_min:05.2f}{lon_dir}"

    # Symbol: /- = House (QTH)
    # Others: /> = Car, /[ = Jogger, /k = Truck
    symbol_table = "/"
    symbol_code = "-"

    comment = f"Meshtastic via MQTT alt={alt}m"

    return f"{callsign}>APRS,TCPIP*:={lat_str}{symbol_table}{lon_str}{symbol_code}{comment}"

def send_to_aprs(packet):
    """Send packet to APRS-IS"""
    try:
        ais = aprslib.IS(APRS_CALLSIGN, passwd=APRS_PASSCODE,
                         host=APRS_SERVER, port=APRS_PORT)
        ais.connect()
        ais.sendall(packet)
        ais.close()
    except Exception as e:
        print(f"APRS-IS Error: {e}")

def main():
    # MQTT Client
    client = mqtt.Client()
    client.username_pw_set(MQTT_USER, MQTT_PASS)
    client.on_message = on_mqtt_message

    client.connect(MQTT_BROKER, 1883, 60)
    client.subscribe(MQTT_TOPIC)

    print(f"Connected to MQTT, forwarding to APRS-IS as {APRS_CALLSIGN}")
    client.loop_forever()

if __name__ == "__main__":
    main()
\`\`\`

### Step 4: Start Script

\`\`\`bash
# Install dependencies
pip install paho-mqtt aprslib

# Start script
python3 meshtastic_aprs_bridge.py

# As service (systemd)
sudo nano /etc/systemd/system/mesh-aprs.service
\`\`\`

**Systemd Service:**

\`\`\`ini
[Unit]
Description=Meshtastic to APRS-IS Bridge
After=network.target

[Service]
Type=simple
User=pi
ExecStart=/usr/bin/python3 /home/pi/meshtastic_aprs_bridge.py
Restart=always

[Install]
WantedBy=multi-user.target
\`\`\`

---

## APRS Symbols

| Symbol | Code | Description |
|--------|------|-------------|
| 🏠 | /- | House/QTH |
| 🚗 | /> | Car |
| 🏃 | /[ | Hiker |
| 📡 | /r | Repeater |
| ⛰️ | /\\ | Triangle/Mountain |

---

## Bidirectional Communication

### APRS → Meshtastic

To send messages from APRS to the mesh:

\`\`\`python
def on_aprs_message(packet):
    """APRS message received, forward to mesh"""
    if packet.get("format") == "message":
        sender = packet.get("from")
        addressee = packet.get("addresse")
        message = packet.get("message_text")

        # Send to MQTT/Mesh
        mqtt_payload = {
            "type": "text",
            "payload": {"text": f"[APRS] {sender}: {message}"}
        }
        mqtt_client.publish(MQTT_TOPIC_DOWN, json.dumps(mqtt_payload))
\`\`\`

---

## MeshCom APRS (Alternative)

MeshCom has built-in APRS integration:

1. **Gateway in OE**: OE1XUU, OE3XOR, etc.
2. **Automatic**: Position is sent to APRS
3. **Configuration**: Set callsign in MeshCom

Advantages:
- No additional software
- Works out-of-the-box
- Gateways operated by ÖVSV

---

## Troubleshooting

### Position not appearing on aprs.fi

1. **Passcode correct?** Recalculate
2. **APRS-IS connected?** Server reachable?
3. **Coordinates valid?** Not 0/0?
4. **Rate limit?** Max 1 packet/30 seconds

### Error "Invalid callsign"

- Format: CALLSIGN-SSID (e.g., OE8YML-15)
- SSID: 0-15
- No special characters

### MQTT no data

- Uplink enabled?
- JSON format enabled?
- Correct topic?

---

## Legal

### APRS-IS Usage

- **Amateur radio license required**
- Only use your own callsign
- Passcode only for license holders

### Meshtastic Positions

- Obtain consent from node owners
- Respect privacy
- Only forward public positions

---

## Checklist

- [ ] Amateur radio license available
- [ ] APRS passcode calculated
- [ ] Meshtastic MQTT gateway running
- [ ] Bridge script configured
- [ ] Node-to-callsign mapping created
- [ ] Test position sent
- [ ] Visible on aprs.fi
`,
    sl: `# Meshtastic ↔ APRS prehod

## Pregled

Prehod med Meshtastic in APRS omogoča:

- **Položaje** prikazane na aprs.fi
- **Sporočila** izmenjana med Mesh in APRS
- **Telemetrijo** poslano v omrežje APRS

**Predpogoj**: Radioamaterska licenca (APRS uporablja 144.800 MHz)

---

## Možnosti prehoda

### Možnost 1: MQTT → APRS-IS (priporočeno)

\`\`\`
┌─────────────┐     LoRa      ┌─────────────┐
│  Meshtastic │◄────────────► │   Gateway   │
│    Nodes    │               │  (ESP32)    │
└─────────────┘               └──────┬──────┘
                                     │ MQTT
                                     ▼
                              ┌─────────────┐
                              │  MQTT-to-   │
                              │  APRS-IS    │
                              │  (Script)   │
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │   APRS-IS   │
                              │  (Internet) │
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │   aprs.fi   │
                              └─────────────┘
\`\`\`

### Možnost 2: Neposredno preko Direwolf

Za napredne uporabnike s TNC/zvočno kartico.

### Možnost 3: MeshCom (vgrajen)

MeshCom ima vgrajeno integracijo APRS (za OE/DL).

---

## Možnost 1: MQTT → APRS-IS

### Korak 1: Nastavi MQTT prehod

Glej vodič "Nastavi MQTT most".

\`\`\`bash
# Na vozlišču Meshtastic
meshtastic --set network.wifi_enabled true
meshtastic --set network.wifi_ssid "TvojWiFi"
meshtastic --set network.wifi_psk "TvojeGeslo"
meshtastic --set mqtt.enabled true
meshtastic --set mqtt.address mqtt.meshtastic.org
meshtastic --set mqtt.json_enabled true
meshtastic --ch-set uplink_enabled true --ch-index 0
\`\`\`

### Korak 2: Poverilnice APRS-IS

Za APRS-IS potrebuješ:
- **Klicni znak** (npr. OE8YML)
- **Geslo** (izračunaj na: https://apps.magicbug.co.uk/passcode/)

### Korak 3: Skript mostu (Python)

Na Raspberry Pi ali strežniku:

\`\`\`python
#!/usr/bin/env python3
"""
Meshtastic MQTT to APRS-IS Bridge
Prejema položaje iz Meshtastic in jih pošilja v APRS-IS
"""

import paho.mqtt.client as mqtt
import aprslib
import json
import time

# Konfiguracija
MQTT_BROKER = "mqtt.meshtastic.org"
MQTT_TOPIC = "msh/EU_868/2/json/LongFast/#"
MQTT_USER = "meshdev"
MQTT_PASS = "large4cats"

APRS_CALLSIGN = "OE8YML-15"  # Tvoj klicni znak + SSID
APRS_PASSCODE = "12345"      # Tvoje geslo
APRS_SERVER = "euro.aprs2.net"
APRS_PORT = 14580

# Preslikava ID vozlišča v klicni znak
NODE_CALLSIGNS = {
    "!abcd1234": "OE8YML-7",
    "!efgh5678": "OE8ABC-9",
}

def on_mqtt_message(client, userdata, msg):
    """Obdelaj dohodno MQTT sporočilo"""
    try:
        data = json.loads(msg.payload.decode())

        # Obdelaj samo pozicijske pakete
        if data.get("type") != "position":
            return

        payload = data.get("payload", {})
        sender = data.get("sender", "")

        # Najdi klicni znak za vozlišče
        callsign = NODE_CALLSIGNS.get(sender, f"MESH{sender[-4:]}")

        lat = payload.get("latitude_i", 0) / 1e7
        lon = payload.get("longitude_i", 0) / 1e7
        alt = payload.get("altitude", 0)

        if lat == 0 or lon == 0:
            return

        # Ustvari APRS paket
        aprs_packet = create_aprs_position(callsign, lat, lon, alt)

        # Pošlji v APRS-IS
        send_to_aprs(aprs_packet)

        print(f"Sent to APRS: {callsign} @ {lat:.5f}, {lon:.5f}")

    except Exception as e:
        print(f"Error: {e}")

def create_aprs_position(callsign, lat, lon, alt):
    """Ustvari APRS pozicijski paket"""
    # Formatiraj geografsko širino
    lat_deg = int(abs(lat))
    lat_min = (abs(lat) - lat_deg) * 60
    lat_dir = "N" if lat >= 0 else "S"
    lat_str = f"{lat_deg:02d}{lat_min:05.2f}{lat_dir}"

    # Formatiraj geografsko dolžino
    lon_deg = int(abs(lon))
    lon_min = (abs(lon) - lon_deg) * 60
    lon_dir = "E" if lon >= 0 else "W"
    lon_str = f"{lon_deg:03d}{lon_min:05.2f}{lon_dir}"

    # Simbol: /- = Hiša (QTH)
    # Drugi: /> = Avto, /[ = Pohodnik, /k = Tovornjak
    symbol_table = "/"
    symbol_code = "-"

    comment = f"Meshtastic via MQTT alt={alt}m"

    return f"{callsign}>APRS,TCPIP*:={lat_str}{symbol_table}{lon_str}{symbol_code}{comment}"

def send_to_aprs(packet):
    """Pošlji paket v APRS-IS"""
    try:
        ais = aprslib.IS(APRS_CALLSIGN, passwd=APRS_PASSCODE,
                         host=APRS_SERVER, port=APRS_PORT)
        ais.connect()
        ais.sendall(packet)
        ais.close()
    except Exception as e:
        print(f"APRS-IS Error: {e}")

def main():
    # MQTT odjemalec
    client = mqtt.Client()
    client.username_pw_set(MQTT_USER, MQTT_PASS)
    client.on_message = on_mqtt_message

    client.connect(MQTT_BROKER, 1883, 60)
    client.subscribe(MQTT_TOPIC)

    print(f"Connected to MQTT, forwarding to APRS-IS as {APRS_CALLSIGN}")
    client.loop_forever()

if __name__ == "__main__":
    main()
\`\`\`

### Korak 4: Zaženi skript

\`\`\`bash
# Namesti odvisnosti
pip install paho-mqtt aprslib

# Zaženi skript
python3 meshtastic_aprs_bridge.py

# Kot storitev (systemd)
sudo nano /etc/systemd/system/mesh-aprs.service
\`\`\`

**Storitev systemd:**

\`\`\`ini
[Unit]
Description=Meshtastic to APRS-IS Bridge
After=network.target

[Service]
Type=simple
User=pi
ExecStart=/usr/bin/python3 /home/pi/meshtastic_aprs_bridge.py
Restart=always

[Install]
WantedBy=multi-user.target
\`\`\`

---

## APRS simboli

| Simbol | Koda | Opis |
|--------|------|------|
| 🏠 | /- | Hiša/QTH |
| 🚗 | /> | Avto |
| 🏃 | /[ | Pohodnik |
| 📡 | /r | Repetitor |
| ⛰️ | /\\ | Trikotnik/Gora |

---

## Dvosmerna komunikacija

### APRS → Meshtastic

Za pošiljanje sporočil iz APRS v mrežo:

\`\`\`python
def on_aprs_message(packet):
    """APRS sporočilo prejeto, posreduj v mrežo"""
    if packet.get("format") == "message":
        sender = packet.get("from")
        addressee = packet.get("addresse")
        message = packet.get("message_text")

        # Pošlji v MQTT/Mesh
        mqtt_payload = {
            "type": "text",
            "payload": {"text": f"[APRS] {sender}: {message}"}
        }
        mqtt_client.publish(MQTT_TOPIC_DOWN, json.dumps(mqtt_payload))
\`\`\`

---

## MeshCom APRS (alternativa)

MeshCom ima vgrajeno integracijo APRS:

1. **Prehod v OE**: OE1XUU, OE3XOR, itd.
2. **Samodejno**: Položaj se pošlje v APRS
3. **Konfiguracija**: Nastavi klicni znak v MeshCom

Prednosti:
- Brez dodatne programske opreme
- Deluje takoj po namestitvi
- Prehode upravlja ÖVSV

---

## Odpravljanje težav

### Položaj se ne prikaže na aprs.fi

1. **Geslo pravilno?** Ponovno izračunaj
2. **APRS-IS povezan?** Strežnik dosegljiv?
3. **Koordinate veljavne?** Ne 0/0?
4. **Omejitev hitrosti?** Največ 1 paket/30 sekund

### Napaka "Invalid callsign"

- Format: KLICNIZNAK-SSID (npr. OE8YML-15)
- SSID: 0-15
- Brez posebnih znakov

### MQTT brez podatkov

- Uplink omogočen?
- JSON format omogočen?
- Pravilna tema?

---

## Pravna določila

### Uporaba APRS-IS

- **Radioamaterska licenca obvezna**
- Uporabljaj samo svoj klicni znak
- Geslo samo za imetnike licence

### Položaji Meshtastic

- Pridobi soglasje lastnikov vozlišč
- Spoštuj zasebnost
- Posreduj samo javne položaje

---

## Kontrolni seznam

- [ ] Radioamaterska licenca na voljo
- [ ] APRS geslo izračunano
- [ ] Meshtastic MQTT prehod deluje
- [ ] Skript mostu konfiguriran
- [ ] Preslikava vozlišče-klicni znak ustvarjena
- [ ] Testni položaj poslan
- [ ] Vidno na aprs.fi
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'APRS_GATEWAY_GUIDE.md',

  externalLinks: [
    {
      title: 'APRS.fi',
      url: 'https://aprs.fi/',
    },
    {
      title: {
        de: 'APRS Passcode Generator',
        en: 'APRS Passcode Generator',
        sl: 'Generator gesel APRS',
      },
      url: 'https://apps.magicbug.co.uk/passcode/',
    },
    {
      title: 'aprslib (Python)',
      url: 'https://github.com/rossengeorgiev/aprs-python',
    },
    {
      title: {
        de: 'APRS-IS Server',
        en: 'APRS-IS Servers',
        sl: 'Strežniki APRS-IS',
      },
      url: 'http://www.aprs-is.net/javAPRSSrvr/ServerList.aspx',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Wie berechne ich meinen APRS Passcode?',
      en: 'How do I calculate my APRS passcode?',
      sl: 'Kako izračunam svoje APRS geslo?',
    },
    {
      de: 'Kann ich Nachrichten von APRS empfangen?',
      en: 'Can I receive messages from APRS?',
      sl: 'Ali lahko prejemam sporočila iz APRS?',
    },
    {
      de: 'Welche APRS-Symbole gibt es?',
      en: 'What APRS symbols are available?',
      sl: 'Kateri APRS simboli so na voljo?',
    },
    {
      de: 'Wie oft darf ich Positionen senden?',
      en: 'How often can I send positions?',
      sl: 'Kako pogosto lahko pošiljam položaje?',
    },
    {
      de: 'Brauche ich eine Lizenz für APRS?',
      en: 'Do I need a license for APRS?',
      sl: 'Ali potrebujem licenco za APRS?',
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
          de: 'WiFi',
          en: 'WiFi',
          sl: 'WiFi',
        },
        {
          de: 'Ideal als Gateway',
          en: 'Ideal as gateway',
          sl: 'Idealen kot prehod',
        },
      ],
      recommended: true,
    },
    {
      name: 'Raspberry Pi 4',
      price: '~60€',
      features: [
        {
          de: 'Bridge-Script',
          en: 'Bridge script',
          sl: 'Skript mostu',
        },
        {
          de: '24/7 Betrieb',
          en: '24/7 operation',
          sl: '24/7 delovanje',
        },
      ],
    },
  ],
};
