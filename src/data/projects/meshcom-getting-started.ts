import type { HamProject } from '../../types/projects';

export const meshcomGettingStarted: HamProject = {
  id: 'meshcom-getting-started',
  name: 'MeshCom Getting Started',
  category: 'mesh-lora',
  difficulty: 2,
  description: 'MeshCom - Das LoRa-Mesh-Netzwerk für Funkamateure in Österreich und Deutschland. Entwickelt vom ÖVSV mit Fokus auf Ham Radio.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    { name: 'LoRa-Board (T-Beam, Heltec, RAK)', quantity: 1, notes: 'Gleiche Hardware wie Meshtastic' },
    { name: 'USB-C Kabel', quantity: 1 },
    { name: 'Antenne 433 MHz', quantity: 1, notes: '70cm Band für Funkamateure' },
    { name: '18650 LiPo Akku', quantity: 1, notes: 'Für portablen Betrieb' },
  ],
  estimatedCost: '25-60 EUR',

  code: `# MeshCom Getting Started Guide

## Was ist MeshCom?

MeshCom ist ein **österreichisches Projekt** für LoRa-basierte Mesh-Kommunikation,
entwickelt vom **ÖVSV** (Österreichischer Versuchssenderverband) speziell für Funkamateure.

### Unterschied zu Meshtastic

| Aspekt | MeshCom | Meshtastic |
|--------|---------|------------|
| **Fokus** | Amateurfunk | Allgemein |
| **Frequenz** | 433 MHz (70cm) | 868 MHz (ISM) |
| **Lizenz** | Amateurfunklizenz | Keine nötig |
| **Leistung** | Bis 500 mW | 25 mW (ISM) |
| **Community** | OE/DL fokussiert | International |

### Vorteile von MeshCom

- **Mehr Leistung**: Bis 500 mW erlaubt (mit Lizenz)
- **70cm Band**: Weniger überlaufen als ISM
- **Lokale Community**: Aktive Gruppen in OE/DL
- **Ham-Fokus**: Features für Funkamateure

---

## Voraussetzungen

### Amateurfunklizenz

MeshCom nutzt das 70cm Amateurfunkband (433 MHz).
**Du benötigst eine gültige Amateurfunklizenz!**

In Österreich:
- Bewilligungsklasse 1 (CEPT)
- Oder Bewilligungsklasse 4

### Hardware

Gleiche Hardware wie Meshtastic:
- LILYGO T-Beam
- Heltec LoRa
- RAK WisBlock

**Wichtig**: Antenne für 433 MHz verwenden, nicht 868 MHz!

---

## Firmware installieren

### Schritt 1: Firmware herunterladen

1. Gehe zu [icssw.org/meshcom](https://icssw.org/meshcom/)
2. Lade die aktuelle Firmware für dein Board herunter
3. Firmware-Datei (.bin) speichern

### Schritt 2: Flashen

**Option A: MeshCom Flasher (Empfohlen)**

1. MeshCom Flasher von Website herunterladen
2. Board per USB verbinden
3. Firmware auswählen
4. "Flash" klicken

**Option B: ESPTool**

\`\`\`bash
# ESPTool installieren
pip install esptool

# Flashen
esptool.py --chip esp32 write_flash 0x1000 meshcom_firmware.bin
\`\`\`

---

## Konfiguration

### MeshCom App

1. **Android App** aus dem Play Store installieren
2. Per Bluetooth mit Node verbinden
3. Grundeinstellungen vornehmen

### Wichtige Einstellungen

| Parameter | Wert | Erklärung |
|-----------|------|-----------|
| Rufzeichen | OE8XXX | Dein Amateurfunkrufzeichen |
| Frequenz | 433.175 MHz | MeshCom Hauptfrequenz |
| TX Power | 20 dBm | ~100 mW (anpassbar) |
| SF/BW | SF10/125 | Standard Spreading Factor |

### Frequenzen in OE

- **433.175 MHz**: MeshCom Hauptfrequenz
- **433.775 MHz**: Alternative
- **433.900 MHz**: Gateway-Frequenz

---

## Netzwerk-Struktur

### Node-Typen

1. **Client-Node**: Normales Endgerät
2. **Router-Node**: Leitet Nachrichten weiter
3. **Gateway-Node**: Verbindung zum Internet/APRS

### Mesh-Funktion

- Nachrichten werden automatisch über mehrere Nodes geleitet
- Reichweite erhöht sich mit jedem Zwischennode
- Typische Reichweite: 5-20 km (je nach Terrain)

---

## MeshCom Gateway

### Was ist ein Gateway?

Gateways verbinden das MeshCom-Netzwerk mit:
- Internet (MQTT)
- APRS-Netzwerk
- Anderen MeshCom-Regionen

### Gateway in OE

Der ÖVSV betreibt mehrere Gateways:
- **OE1XUU**: Wien
- **OE3XOR**: Niederösterreich
- **OE5XBL**: Oberösterreich
- **OE7XLR**: Tirol

---

## Integration mit APRS

### MeshCom → APRS

MeshCom-Positionen können auf APRS.fi erscheinen:
1. Gateway-Nähe erforderlich
2. Position wird automatisch gesendet
3. Sichtbar auf aprs.fi

### APRS → MeshCom

APRS-Nachrichten können an MeshCom weitergeleitet werden.
Konfiguration am Gateway erforderlich.

---

## Tipps & Best Practices

### Antenne

- **433 MHz Antenne** verwenden (nicht 868!)
- Teleskopantenne oder 1/4 Wave
- Für Portabel: Flexible Whip-Antenne

### Reichweite optimieren

1. **Höhe gewinnen**: Berge, Gebäude nutzen
2. **Freie Sicht**: Line-of-Sight wichtig
3. **Gute Antenne**: Macht den Unterschied

### QSO-Etikette

- Rufzeichen verwenden
- Position aktivieren
- Höflicher Umgangston (Ham Spirit!)

---

## Weiterführende Links

- [MeshCom Wiki](https://wiki.oevsv.at/wiki/MeshCom)
- [ÖVSV MeshCom Seite](https://icssw.org/meshcom/)
- [MeshCom Telegram Gruppe](https://t.me/meshcom_oe)
- [MeshCom Karte](https://map.meshcom.at)

---

## Vergleich: MeshCom vs Meshtastic

### Wann MeshCom?

- Du hast eine Amateurfunklizenz
- Du möchtest mehr Sendeleistung
- Du bist in OE/DL aktiv
- Du möchtest APRS-Integration

### Wann Meshtastic?

- Keine Amateurfunklizenz
- Internationale Kompatibilität wichtig
- Größere globale Community
- Einfacherer Einstieg
`,
  codeLanguage: 'markdown',
  codeFileName: 'MESHCOM_GUIDE.md',

  externalLinks: [
    { title: 'MeshCom Wiki (ÖVSV)', url: 'https://wiki.oevsv.at/wiki/MeshCom' },
    { title: 'MeshCom Firmware', url: 'https://icssw.org/meshcom/' },
    { title: 'MeshCom Karte', url: 'https://map.meshcom.at' },
    { title: 'Telegram Gruppe', url: 'https://t.me/meshcom_oe' },
  ],

  customizationSuggestions: [
    'Wie verbinde ich MeshCom mit APRS?',
    'Welche Antenne für 433 MHz?',
    'Kann ich einen Gateway aufstellen?',
    'MeshCom vs Meshtastic - was ist besser für mich?',
    'Wie erhöhe ich die Sendeleistung legal?',
  ],

  guideSections: [
    {
      id: 'intro',
      title: 'Was ist MeshCom?',
      icon: '📻',
      content: 'ÖVSV-Projekt für Funkamateure im 70cm Band mit höherer Leistung.',
    },
    {
      id: 'requirements',
      title: 'Voraussetzungen',
      icon: '📜',
      content: 'Amateurfunklizenz erforderlich, gleiche Hardware wie Meshtastic.',
    },
    {
      id: 'setup',
      title: 'Firmware & Setup',
      icon: '⚡',
      content: 'MeshCom Firmware flashen und Grundkonfiguration.',
    },
    {
      id: 'network',
      title: 'Netzwerk',
      icon: '🌐',
      content: 'Node-Typen, Mesh-Funktion und Gateways.',
    },
    {
      id: 'aprs',
      title: 'APRS Integration',
      icon: '📡',
      content: 'Verbindung zum APRS-Netzwerk herstellen.',
    },
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2 (433MHz)',
      price: '~35€',
      features: ['GPS integriert', '18650 Akku', 'Bewährt für MeshCom', '433 MHz Version!'],
      recommended: true,
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
        { store: 'AliExpress', url: 'https://aliexpress.com/w/wholesale-lilygo-t-beam-433.html' },
      ],
    },
    {
      name: 'LILYGO T-Deck (433MHz)',
      price: '~80€',
      features: ['Tastatur', 'TFT Display', 'GPS', 'Standalone'],
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
      ],
    },
    {
      name: 'Heltec LoRa V3 (433MHz)',
      price: '~25€',
      features: ['Günstig', 'Kompakt', 'OLED Display', '433 MHz Version!'],
      buyLinks: [
        { store: 'Heltec Store', url: 'https://heltec.org/' },
      ],
    },
    {
      name: 'RAK WisBlock (433MHz)',
      price: '~60€',
      features: ['Modular', 'Outdoor-tauglich', 'Professionell'],
      buyLinks: [
        { store: 'RAK Store', url: 'https://store.rakwireless.com/' },
      ],
    },
    {
      name: '433 MHz Antenne',
      price: '~10€',
      features: ['1/4 Wave', 'SMA Anschluss', 'Für 70cm Band'],
    },
  ],
};
