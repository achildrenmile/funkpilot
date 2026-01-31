import type { HamProject } from '../../types/projects';

export const meshtasticGettingStarted: HamProject = {
  id: 'meshtastic-getting-started',
  name: 'Meshtastic Getting Started',
  category: 'mesh-lora',
  difficulty: 1,
  description: 'Einstieg in Meshtastic - Das Open-Source LoRa Mesh-Netzwerk für Off-Grid Kommunikation. Perfekt für Outdoor, Notfunk und Experimentieren.',
  hardware: 't-beam',
  projectType: 'guide',

  components: [
    { name: 'LoRa-fähiges Board (T-Beam, Heltec, RAK)', quantity: 1, notes: 'Siehe Hardware-Empfehlungen' },
    { name: 'USB-C Kabel', quantity: 1 },
    { name: 'Antenne 868 MHz', quantity: 1, notes: 'Oft im Lieferumfang' },
    { name: 'LiPo Akku 18650 (optional)', quantity: 1, notes: 'Für T-Beam' },
  ],
  estimatedCost: '25-60 EUR',

  code: `# Meshtastic Getting Started Guide

## Was ist Meshtastic?

Meshtastic ist ein **Open-Source Projekt** für LoRa-basierte Mesh-Kommunikation.
Es ermöglicht verschlüsselte Nachrichten über große Entfernungen ohne Internet oder Mobilfunk.

### Hauptmerkmale

- **Reichweite**: Bis zu 10+ km (je nach Terrain)
- **Mesh-Netzwerk**: Nachrichten werden automatisch weitergeleitet
- **Verschlüsselung**: AES256 End-to-End
- **Keine Lizenz nötig**: Nutzt ISM-Band (868 MHz in EU)
- **Open Source**: Firmware, Apps und Hardware-Designs

### Für wen ist Meshtastic geeignet?

- **Outdoor-Enthusiasten**: Wanderer, Bergsteiger, Skifahrer
- **Notfunk**: Kommunikation bei Stromausfall
- **Events**: Festivals, Messen, Gruppenaktivitäten
- **Funkamateure**: Experimentieren mit LoRa
- **Preppers**: Off-Grid Kommunikation

---

## Hardware-Übersicht

### Empfohlene Geräte

| Gerät | Preis | Vorteile | Nachteile |
|-------|-------|----------|-----------|
| **LILYGO T-Beam** | ~35€ | GPS, 18650 Akku, bewährt | Größer |
| **Heltec V3** | ~25€ | Günstig, kompakt, OLED | Kein GPS |
| **RAK WisBlock** | ~40€ | Modular, professionell | Komplexer |
| **T-Echo** | ~60€ | E-Paper, sehr sparsam | Teurer |
| **Station G2** | ~50€ | Fertiggerät mit Gehäuse | Weniger flexibel |

### Hardware-Kaufempfehlung

**Für Einsteiger**: LILYGO T-Beam v1.2 (mit GPS und Akkuhalterung)
- Alles dabei was man braucht
- Große Community & Support
- Viele Tutorials verfügbar

**Bezugsquellen**:
- AliExpress (günstigste Option, 2-3 Wochen Lieferzeit)
- Amazon (schneller, teurer)
- Banggood
- Offizieller LILYGO Store

---

## Firmware flashen

### Methode 1: Web-Flasher (Empfohlen)

1. Öffne **https://flasher.meshtastic.org** in Chrome/Edge
2. Verbinde dein Gerät per USB
3. Wähle dein Board aus der Liste
4. Klicke "Flash"
5. Fertig in 2 Minuten!

### Methode 2: Python CLI

\`\`\`bash
# Meshtastic CLI installieren
pip install meshtastic

# Firmware flashen
meshtastic --flash
\`\`\`

### Methode 3: ESPHome Flasher

Für fortgeschrittene Nutzer mit eigenen Firmware-Anpassungen.

---

## Erste Konfiguration

### Per Smartphone App

1. **App installieren**:
   - Android: [Google Play](https://play.google.com/store/apps/details?id=com.geeksville.mesh)
   - iOS: [App Store](https://apps.apple.com/app/meshtastic/id1586432531)

2. **Bluetooth koppeln**:
   - Gerät einschalten
   - In App "+" drücken
   - Gerät auswählen

3. **Grundeinstellungen**:
   - **Region**: EU_868 (für Europa)
   - **Name**: Dein Anzeigename
   - **Preset**: LONG_FAST (Standard) oder MEDIUM (mehr Reichweite)

### Wichtige Einstellungen

| Einstellung | Empfehlung | Erklärung |
|-------------|------------|-----------|
| Region | EU_868 | Pflicht in Europa! |
| Modem Preset | LONG_FAST | Guter Kompromiss |
| Hop Limit | 3 | Max. Weiterleitungen |
| GPS | Aktiviert | Für Positionsanzeige |
| WiFi | Optional | Für MQTT/Internet |

---

## Kanäle & Verschlüsselung

### Standard-Kanal

Meshtastic hat einen voreingestellten "LongFast" Kanal.
**Alle Geräte mit gleichen Einstellungen können kommunizieren.**

### Eigene Kanäle erstellen

1. In App: Kanäle → "+"
2. Namen vergeben
3. PSK (Schlüssel) wird automatisch generiert
4. QR-Code teilen

### Kanal teilen

- **QR-Code**: Andere scannen deinen Code
- **URL**: Teile den Channel-Link
- **NFC**: Tippe Geräte aneinander (wenn unterstützt)

---

## Tipps für Funkamateure

### Frequenzen

- **ISM-Band 868 MHz**: Keine Lizenz nötig, 25 mW ERP
- **70cm Ham-Band (optional)**: Mit Lizenz mehr Leistung möglich

### Integration mit Ham Radio

- **APRS-Gateway**: Meshtastic → APRS möglich
- **MQTT**: Nachrichten ins Internet bridgen
- **Positionsdaten**: GPS-Tracking im Mesh

### Rechtliches in OE/DL

- ISM-Band: Keine Lizenz erforderlich
- Sendeleistung: Max 25 mW ERP (Standard)
- Duty Cycle: 1% (von Firmware eingehalten)

---

## Nächste Schritte

1. **Community beitreten**: [Discord](https://discord.gg/meshtastic)
2. **Lokale Gruppe finden**: Meshmap.net zeigt aktive Nodes
3. **Experimentieren**: Reichweitentests machen
4. **Solar-Node bauen**: Für permanente Nodes

### Weiterführende Links

- [Meshtastic Dokumentation](https://meshtastic.org/docs/)
- [Meshmap.net](https://meshmap.net) - Weltkarte aller Nodes
- [GitHub](https://github.com/meshtastic) - Quellcode
- [Reddit r/meshtastic](https://reddit.com/r/meshtastic)
`,
  codeLanguage: 'markdown',
  codeFileName: 'GETTING_STARTED.md',

  externalLinks: [
    { title: 'Meshtastic Docs', url: 'https://meshtastic.org/docs/' },
    { title: 'Web Flasher', url: 'https://flasher.meshtastic.org' },
    { title: 'Meshmap.net', url: 'https://meshmap.net' },
    { title: 'Discord Community', url: 'https://discord.gg/meshtastic' },
    { title: 'Android App', url: 'https://play.google.com/store/apps/details?id=com.geeksville.mesh' },
    { title: 'iOS App', url: 'https://apps.apple.com/app/meshtastic/id1586432531' },
  ],

  customizationSuggestions: [
    'Welches Board ist am besten für Portabelbetrieb?',
    'Wie erhöhe ich die Reichweite?',
    'Kann ich Meshtastic mit APRS verbinden?',
    'Wie baue ich einen Solar-Node?',
    'Welche Antenne ist am besten?',
  ],

  guideSections: [
    {
      id: 'intro',
      title: 'Was ist Meshtastic?',
      icon: '🌐',
      content: 'Open-Source LoRa Mesh-Netzwerk für Off-Grid Kommunikation ohne Internet oder Mobilfunk.',
    },
    {
      id: 'hardware',
      title: 'Hardware-Auswahl',
      icon: '🔧',
      content: 'T-Beam, Heltec, RAK WisBlock - Vergleich und Kaufempfehlungen.',
    },
    {
      id: 'setup',
      title: 'Firmware & Setup',
      icon: '⚡',
      content: 'Flashen via Web-Flasher, App-Kopplung und erste Konfiguration.',
    },
    {
      id: 'channels',
      title: 'Kanäle & Sicherheit',
      icon: '🔐',
      content: 'Verschlüsselung, eigene Kanäle erstellen und teilen.',
    },
    {
      id: 'tips',
      title: 'Tipps für Funkamateure',
      icon: '📻',
      content: 'Integration mit APRS, rechtliche Aspekte, fortgeschrittene Nutzung.',
    },
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2',
      price: '~35€',
      features: ['GPS integriert', '18650 Akkuhalterung', 'Große Community', 'Viele Tutorials'],
      recommended: true,
      buyLinks: [
        { store: 'AliExpress', url: 'https://s.click.aliexpress.com/e/_DkQHGFR' },
        { store: 'Amazon', url: 'https://www.amazon.de/s?k=lilygo+t-beam' },
      ],
    },
    {
      name: 'Heltec LoRa V3',
      price: '~25€',
      features: ['Günstig', 'Kompakt', 'OLED Display', 'USB-C'],
      buyLinks: [
        { store: 'AliExpress', url: 'https://s.click.aliexpress.com/e/_DmYqfxR' },
      ],
    },
    {
      name: 'RAK WisBlock',
      price: '~40€',
      features: ['Modular', 'Professionell', 'Viele Sensoren', 'Outdoor-tauglich'],
      buyLinks: [
        { store: 'RAK Store', url: 'https://store.rakwireless.com/' },
      ],
    },
    {
      name: 'LILYGO T-Echo',
      price: '~60€',
      features: ['E-Paper Display', 'Sehr sparsam', 'GPS', 'Kompakt'],
    },
  ],
};
