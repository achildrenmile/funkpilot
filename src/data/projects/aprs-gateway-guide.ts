import type { HamProject } from '../../types/projects';

export const aprsGatewayGuide: HamProject = {
  id: 'aprs-gateway-guide',
  name: 'Meshtastic ↔ APRS Gateway',
  category: 'mesh-lora',
  difficulty: 3,
  description: 'Verbinde Meshtastic mit dem APRS-Netzwerk. Positionen auf aprs.fi anzeigen und Nachrichten austauschen.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    { name: 'LoRa-Board mit WiFi', quantity: 1, notes: 'T-Beam oder Heltec' },
    { name: 'Raspberry Pi (optional)', quantity: 1, notes: 'Für Direwolf/APRS-IS' },
    { name: 'Internet-Zugang', quantity: 1, notes: 'Für APRS-IS Verbindung' },
  ],
  estimatedCost: '35-100 EUR',

  code: `# Meshtastic ↔ APRS Gateway

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
  codeLanguage: 'markdown',
  codeFileName: 'APRS_GATEWAY_GUIDE.md',

  externalLinks: [
    { title: 'APRS.fi', url: 'https://aprs.fi/' },
    { title: 'APRS Passcode Generator', url: 'https://apps.magicbug.co.uk/passcode/' },
    { title: 'aprslib (Python)', url: 'https://github.com/rossengeorgiev/aprs-python' },
    { title: 'APRS-IS Servers', url: 'http://www.aprs-is.net/javAPRSSrvr/ServerList.aspx' },
  ],

  customizationSuggestions: [
    'Wie berechne ich meinen APRS Passcode?',
    'Kann ich Nachrichten von APRS empfangen?',
    'Welche APRS-Symbole gibt es?',
    'Wie oft darf ich Positionen senden?',
    'Brauche ich eine Lizenz für APRS?',
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2',
      price: '~35€',
      features: ['GPS', 'WiFi', 'Ideal als Gateway'],
      recommended: true,
    },
    {
      name: 'Raspberry Pi 4',
      price: '~60€',
      features: ['Bridge-Script', '24/7 Betrieb'],
    },
  ],
};
