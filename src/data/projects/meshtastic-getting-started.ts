import type { HamProject } from '../../types/projects';

export const meshtasticGettingStarted: HamProject = {
  id: 'meshtastic-getting-started',
  name: 'Meshtastic Getting Started',
  category: 'mesh-lora',
  difficulty: 1,
  description: 'Einstieg in Meshtastic - Das Open-Source LoRa Mesh-Netzwerk für Off-Grid Kommunikation. Perfekt für Outdoor, Notfunk und Experimentieren.',
  hardware: 'esp32-lora',
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

### Alle unterstützten Geräte

#### LILYGO (Empfohlen für Einsteiger)

| Gerät | Preis | GPS | Display | Akku | Empfehlung |
|-------|-------|-----|---------|------|------------|
| **T-Beam v1.2** | ~35€ | ✅ | ❌ | 18650 | Allrounder, sehr beliebt |
| **T-Echo** | ~60€ | ✅ | E-Paper | LiPo | Sehr sparsam, Outdoor |
| **T-Deck** | ~80€ | ✅ | TFT | LiPo | Mit Tastatur, Standalone |
| **T-LoRa Pager** | ~50€ | ❌ | OLED | LiPo | Kompakt mit Buttons |
| **LoRa32 V2.1** | ~25€ | ❌ | OLED | ❌ | Günstig, Bastelfreundlich |

#### Heltec

| Gerät | Preis | GPS | Display | Akku | Empfehlung |
|-------|-------|-----|---------|------|------------|
| **LoRa V3** | ~25€ | ❌ | OLED | ❌ | Günstig, guter Einstieg |
| **Wireless Tracker** | ~30€ | ✅ | OLED | LiPo | GPS + kompakt |
| **Wireless Stick Lite** | ~20€ | ❌ | ❌ | ❌ | Minimal, günstig |
| **Vision Master** | ~35€ | ❌ | E-Paper | LiPo | Sparsam |
| **Mesh Node** | ~40€ | Optional | Optional | LiPo | Modular |

#### RAKwireless

| Gerät | Preis | GPS | Display | Akku | Empfehlung |
|-------|-------|-----|---------|------|------------|
| **WisBlock Starter Kit** | ~45€ | Optional | Optional | LiPo | Modular, professionell |
| **WisBlock Meshtastic Kit** | ~60€ | ✅ | OLED | LiPo | Komplett-Paket |
| **WisMesh Repeater** | ~100€ | ✅ | ❌ | LiPo | IP67, Solar-ready |
| **WisMesh Repeater Mini** | ~80€ | ✅ | ❌ | 3200mAh | Kompakter, Solar |

#### B&Q Consulting

| Gerät | Preis | GPS | Display | Akku | Empfehlung |
|-------|-------|-----|---------|------|------------|
| **Station G2** | ~100€ | ❌ | ❌ | ❌ | High Power für Funkamateure |
| **Nano G2 Ultra** | ~70€ | ✅ | OLED | LiPo | Kompakt, robust |

#### Seeed Studio

| Gerät | Preis | GPS | Display | Akku | Empfehlung |
|-------|-------|-----|---------|------|------------|
| **SenseCAP T1000-E** | ~40€ | ✅ | ❌ | LiPo | Card Tracker, IP65 |
| **SenseCAP Indicator** | ~80€ | ❌ | 4" Touch | ❌ | Touchscreen, Dashboard |

#### Elecrow & Andere

| Gerät | Preis | GPS | Display | Akku | Empfehlung |
|-------|-------|-----|---------|------|------------|
| **ThinkNode M1** | ~60€ | ✅ | OLED | LiPo | Robust, Outdoor |
| **muzi R1 Neo** | ~50€ | ✅ | OLED | LiPo | Pager-Style |
| **Raspberry Pi Pico** | ~15€ | ❌ | ❌ | ❌ | DIY-Projekte |

### Hardware-Kaufempfehlung

**Für Einsteiger**: LILYGO T-Beam v1.2
- GPS integriert, 18650 Akkuhalterung
- Große Community & viele Tutorials
- Bewährte, zuverlässige Plattform

**Für mobilen Einsatz**: LILYGO T-Echo oder T-Deck
- E-Paper/TFT Display, eingebauter Akku
- Standalone-Betrieb ohne Smartphone

**Für Repeater/Gateway**: RAK WisMesh Repeater
- Wetterfest (IP67), Solar-ready
- Professionelle Qualität

**Bezugsquellen**:
- AliExpress (günstigste Option, 2-3 Wochen Lieferzeit)
- Amazon (schneller, teurer)
- Offizieller LILYGO/RAK/Heltec Store
- Seeed Studio (für SenseCAP)
- Tindie (für B&Q Station G2)

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
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
        { store: 'AliExpress', url: 'https://aliexpress.com/w/wholesale-lilygo-t-beam.html' },
      ],
    },
    {
      name: 'LILYGO T-Deck',
      price: '~80€',
      features: ['Tastatur integriert', 'TFT Display', 'GPS', 'Standalone-Betrieb'],
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
      ],
    },
    {
      name: 'LILYGO T-Echo',
      price: '~60€',
      features: ['E-Paper Display', 'Sehr sparsam', 'GPS', 'Outdoor-tauglich'],
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
      ],
    },
    {
      name: 'Heltec LoRa V3',
      price: '~25€',
      features: ['Günstig', 'Kompakt', 'OLED Display', 'USB-C'],
      buyLinks: [
        { store: 'Heltec Store', url: 'https://heltec.org/' },
        { store: 'AliExpress', url: 'https://aliexpress.com/w/wholesale-heltec-lora-v3.html' },
      ],
    },
    {
      name: 'Heltec Wireless Tracker',
      price: '~30€',
      features: ['GPS integriert', 'OLED Display', 'Kompakt', 'LiPo Akku'],
      buyLinks: [
        { store: 'Heltec Store', url: 'https://heltec.org/' },
      ],
    },
    {
      name: 'RAK WisBlock Kit',
      price: '~60€',
      features: ['Modular', 'Professionell', 'GPS Option', 'Outdoor-tauglich'],
      buyLinks: [
        { store: 'RAK Store', url: 'https://store.rakwireless.com/' },
      ],
    },
    {
      name: 'RAK WisMesh Repeater',
      price: '~100€',
      features: ['IP67 Wetterfest', 'Solar-ready', 'GPS', 'Für Dauerbetrieb'],
      buyLinks: [
        { store: 'RAK Store', url: 'https://store.rakwireless.com/' },
      ],
    },
    {
      name: 'Station G2 (B&Q)',
      price: '~100€',
      features: ['High Power', 'Für Funkamateure', 'Robustes Gehäuse', 'Base Station'],
      buyLinks: [
        { store: 'Tindie', url: 'https://www.tindie.com/stores/neilhao/' },
      ],
    },
    {
      name: 'SenseCAP T1000-E',
      price: '~40€',
      features: ['Card Tracker', 'IP65', 'GPS', 'Vorkonfiguriert'],
      buyLinks: [
        { store: 'Seeed Studio', url: 'https://www.seeedstudio.com/' },
      ],
    },
  ],
};
