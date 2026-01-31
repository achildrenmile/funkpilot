import type { HamProject } from '../../types/projects';

export const meshcoreGettingStarted: HamProject = {
  id: 'meshcore-getting-started',
  name: 'MeshCore Getting Started',
  category: 'mesh-lora',
  difficulty: 2,
  description: 'MeshCore - Der leistungsstarke Meshtastic-Fork mit erweiterten Funktionen für Repeater, Rooms und Client-Management.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    { name: 'LoRa-fähiges Board (T-Beam, Heltec, RAK, T-Deck)', quantity: 1, notes: 'Siehe Hardware-Empfehlungen' },
    { name: 'USB-C Kabel', quantity: 1 },
    { name: 'Antenne 868 MHz', quantity: 1, notes: 'Oft im Lieferumfang' },
    { name: 'LiPo Akku (optional)', quantity: 1, notes: 'Für mobilen Betrieb' },
  ],
  estimatedCost: '25-60 EUR',

  code: `# MeshCore Getting Started Guide

## Was ist MeshCore?

MeshCore ist ein **leistungsstarker Fork von Meshtastic** mit erweiterten Funktionen,
entwickelt von Scott Powell (aka "Ripple"). Es bietet zusätzliche Features wie Rooms,
Client-Repeater-Architektur und besseres Netzwerk-Management.

### Unterschiede zu Meshtastic

| Feature | Meshtastic | MeshCore |
|---------|------------|----------|
| Architektur | Peer-to-Peer | Client-Repeater |
| Chatrooms | Channels | Rooms (erweitert) |
| Repeater | Implicit Routing | Dedizierte Repeater-Rolle |
| Management | Dezentral | Zentrale Steuerung möglich |
| Firmware | Stabil, konservativ | Experimenteller, mehr Features |
| Community | Sehr groß | Wachsend, spezialisiert |

### Hauptvorteile von MeshCore

- **Rooms**: Chatrooms mit besserer Verwaltung
- **Repeater-Modus**: Dedizierte Relais-Stationen
- **Client-Management**: Sehen wer verbunden ist
- **Erweiterte Routing-Optionen**: Mehr Kontrolle über Paket-Weiterleitung
- **Schnellere Updates**: Experimentelle Features früher verfügbar

---

## Hardware-Kompatibilität

MeshCore unterstützt dieselbe Hardware wie Meshtastic:

### LILYGO Boards

| Board | Preis | GPS | Display | Akku | Empfehlung |
|-------|-------|-----|---------|------|------------|
| **T-Beam v1.2** | ~35€ | ✅ | ❌ | 18650 | Allrounder, sehr beliebt |
| **T-Deck** | ~80€ | ✅ | TFT | LiPo | Handheld mit Tastatur |
| **T-Echo** | ~60€ | ✅ | E-Paper | LiPo | Sehr sparsam |
| **T-LoRa Pager** | ~50€ | ❌ | OLED | LiPo | Kompakt mit Buttons |
| **LoRa32 V2.1** | ~25€ | ❌ | OLED | ❌ | Günstig, Bastelprojekte |

### Heltec Boards

| Board | Preis | GPS | Display | Akku | Empfehlung |
|-------|-------|-----|---------|------|------------|
| **LoRa V3** | ~25€ | ❌ | OLED | ❌ | Günstig, guter Einstieg |
| **Wireless Tracker** | ~30€ | ✅ | OLED | LiPo | GPS + kompakt |
| **Wireless Stick Lite** | ~20€ | ❌ | ❌ | ❌ | Minimal, günstig |
| **Vision Master** | ~35€ | ❌ | E-Paper | LiPo | Sparsam |

### RAK Wireless

| Board | Preis | GPS | Display | Akku | Empfehlung |
|-------|-------|-----|---------|------|------------|
| **WisBlock Starter Kit** | ~45€ | Optional | Optional | LiPo | Modular |
| **WisBlock Meshtastic Kit** | ~60€ | ✅ | OLED | LiPo | Komplett-Paket |
| **WisMesh Repeater** | ~100€ | ✅ | ❌ | LiPo | IP67, Solar-ready |
| **WisMesh Repeater Mini** | ~80€ | ✅ | ❌ | 3200mAh | Kompakter, Solar |

### Weitere Hardware

| Board | Preis | GPS | Display | Akku | Empfehlung |
|-------|-------|-----|---------|------|------------|
| **Station G2 (B&Q)** | ~100€ | ❌ | ❌ | ❌ | High Power, Funkamateure |
| **Nano G2 Ultra (B&Q)** | ~70€ | ✅ | OLED | LiPo | Kompakt, robust |
| **SenseCAP T1000-E** | ~40€ | ✅ | ❌ | LiPo | Card Tracker, IP65 |
| **SenseCAP Indicator** | ~80€ | ❌ | 4" Touch | ❌ | Dashboard, Touchscreen |
| **ThinkNode M1** | ~60€ | ✅ | OLED | LiPo | Robust, Outdoor |
| **muzi R1 Neo** | ~50€ | ✅ | OLED | LiPo | Pager-Style |

### Hardware-Empfehlung

**Für Einsteiger**: LILYGO T-Deck (~80€)
- Vollständiges Handheld mit Tastatur und Display
- Standalone-Betrieb ohne Smartphone
- Perfekt um MeshCore kennenzulernen

**Für mobilen Einsatz**: LILYGO T-Echo oder T-Beam
- E-Paper/kein Display, sparsam
- GPS integriert, gute Akkulaufzeit

**Für Repeater**: RAK WisMesh Repeater oder T-Beam
- Wetterfest (IP67) oder mit Gehäuse
- Solar-ready für Dauerbetrieb
- Gute Reichweite mit Außenantenne

---

## Firmware installieren

### Methode 1: MeshCore Web Flasher

1. Öffne **https://flasher.meshcore.co** (Chrome/Edge)
2. Board per USB verbinden
3. Hardware-Typ auswählen
4. "Flash" klicken
5. Warten bis fertig (~2 Minuten)

### Methode 2: Companion App

Die MeshCore Companion App kann auch zum Flashen verwendet werden:

1. App herunterladen (Android)
2. OTG-Kabel verwenden
3. In App: Settings → Flash Firmware

### Firmware-Versionen

- **Stable**: Empfohlen für Anfänger
- **Beta**: Neue Features, möglicherweise Bugs
- **Nightly**: Entwickler-Builds, nur für Tester

---

## Erste Einrichtung

### Mit Companion App

1. **App installieren**:
   - Android: Companion App von GitHub Releases
   - iOS: In Entwicklung

2. **Bluetooth verbinden**:
   - Gerät einschalten (Power-Taste)
   - In App Bluetooth aktivieren
   - Gerät suchen und koppeln

3. **Grundkonfiguration**:
   - **Region**: EU_868 (Europa)
   - **Node Name**: Dein Rufzeichen/Name
   - **Modem Preset**: LONG_FAST oder MEDIUM

### Wichtige Einstellungen

| Einstellung | Empfehlung | Beschreibung |
|-------------|------------|--------------|
| Region | EU_868 | Frequenzband Europa |
| TX Power | Standard (10 dBm) | Sendeleistung |
| Hop Limit | 3-5 | Max Weiterleitungen |
| Role | Client/Repeater | Node-Funktion |
| Position | GPS/Manual | Standort-Modus |

---

## Node-Rollen in MeshCore

### Client
- Standard-Rolle für Endgeräte
- Sendet und empfängt Nachrichten
- Verbindet sich mit Repeatern

### Repeater
- Leitet Nachrichten weiter
- Kein Benutzer-Interface nötig
- Permanent installiert empfohlen
- Erweitert die Netzwerk-Reichweite

### Router
- Wie Repeater, aber mit erweiterten Routing-Entscheidungen
- Für Backbone-Knoten im Netzwerk

### Client + Repeater
- Kombinierte Rolle
- Eigene Nutzung + Weiterleitung
- Höherer Stromverbrauch

---

## Rooms (Chatrooms)

### Was sind Rooms?

Rooms sind verschlüsselte Chatgruppen in MeshCore - ähnlich wie Channels in Meshtastic,
aber mit erweiterten Features.

### Room erstellen

1. App öffnen
2. Rooms → Neuer Room
3. Namen vergeben
4. Verschlüsselung wählen (AES256)
5. Teilnehmer einladen

### Room teilen

- **QR-Code**: Scannen zum Beitreten
- **Deep Link**: URL zum Teilen
- **Manuell**: Key und Name übertragen

### Öffentlicher Room

Der "LongFast" Room ist standardmäßig auf allen Geräten vorhanden
und dient als öffentlicher Kanal für die Community.

---

## Tipps für Funkamateure

### Frequenz-Nutzung

- **ISM 868 MHz**: Standard, keine Lizenz nötig
- **70cm Band (432-438 MHz)**: Mit Ham-Lizenz mehr Leistung
- **23cm Band**: Experimentell möglich

### APRS-Integration

MeshCore kann mit APRS-Gateways verbunden werden:

1. MQTT-Bridge einrichten
2. APRS-IS Gateway konfigurieren
3. Position wird auf aprs.fi sichtbar

### Rufzeichen als Node-Name

Als Funkamateur empfohlen:
- Node-Name: Rufzeichen (z.B. "OE8YML")
- Zeigt Lizenzstatus
- Vereinfacht Identifikation

---

## Netzwerk-Tipps

### Reichweite optimieren

1. **Antenne**: Außenantenne statt interner
2. **Höhe**: Je höher, desto besser
3. **Freie Sicht**: Hindernisse vermeiden
4. **Modem-Preset**: MEDIUM für mehr Reichweite

### Mesh-Planung

- **Repeater-Abstand**: 3-5 km typisch
- **Überlappung**: Immer mindestens 2 Pfade
- **Backbone**: Zentrale Repeater mit guter Lage
- **Edge-Nodes**: Clients am Rand des Netzwerks

### Stromversorgung Repeater

| Lösung | Kosten | Autonomie |
|--------|--------|-----------|
| USB-Netzteil | ~5€ | Netzabhängig |
| Powerbank 20Ah | ~20€ | 3-7 Tage |
| Solar + Akku | ~50€ | Unbegrenzt |
| 12V + DC-DC | ~15€ | Netzunabhängig |

---

## Troubleshooting

### Keine Verbindung via Bluetooth

1. Gerät neu starten
2. Bluetooth am Handy aus/ein
3. Gerät in App entfernen und neu koppeln
4. Firmware neu flashen

### Keine Nachrichten empfangen

1. Region prüfen (EU_868)
2. Antenne angeschlossen?
3. Channel/Room Einstellungen gleich?
4. Hop Limit erhöhen

### Gerät startet nicht

1. Akku prüfen/laden
2. USB-Kabel wechseln
3. Reset-Taste drücken (falls vorhanden)
4. Firmware neu flashen

---

## Community & Support

### Offizielle Ressourcen

- **GitHub**: github.com/meshcore
- **Discord**: Aktive Community
- **Dokumentation**: docs.meshcore.co

### Lokale Gruppen

- Suche nach Mesh-Gruppen in deiner Region
- Viele Ortsverbände experimentieren mit LoRa-Mesh
- Fielddays nutzen zum Kennenlernen

---

## Weiterführende Projekte

1. **Solar-Node bauen**: Autarker Repeater mit Solarpanel
2. **Gateway einrichten**: MQTT-Bridge zum Internet
3. **Multi-Hop testen**: Reichweiten-Experimente
4. **Eigenes Netzwerk**: Lokales Mesh mit Freunden aufbauen
`,
  codeLanguage: 'markdown',
  codeFileName: 'MESHCORE_GETTING_STARTED.md',

  externalLinks: [
    { title: 'MeshCore GitHub', url: 'https://github.com/ripplebiz/MeshCore' },
    { title: 'MeshCore Flasher', url: 'https://flasher.meshcore.co' },
    { title: 'MeshCore Discord', url: 'https://discord.gg/meshcore' },
    { title: 'Ripple YouTube', url: 'https://www.youtube.com/@RippleWireless' },
  ],

  customizationSuggestions: [
    'Unterschied zu Meshtastic erklären',
    'Wie richte ich einen Repeater ein?',
    'Kann ich MeshCore und Meshtastic mischen?',
    'Wie funktionieren Rooms?',
    'Welche Hardware ist am besten für MeshCore?',
  ],

  guideSections: [
    {
      id: 'intro',
      title: 'Was ist MeshCore?',
      icon: '⚡',
      content: 'Leistungsstarker Meshtastic-Fork mit Rooms, Repeater-Modus und Client-Management.',
    },
    {
      id: 'hardware',
      title: 'Hardware',
      icon: '🔧',
      content: 'Unterstützte Boards: T-Beam, T-Deck, Heltec, RAK WisBlock und mehr.',
    },
    {
      id: 'setup',
      title: 'Installation',
      icon: '📲',
      content: 'Firmware flashen via Web-Flasher oder Companion App.',
    },
    {
      id: 'roles',
      title: 'Node-Rollen',
      icon: '🎭',
      content: 'Client, Repeater, Router - verschiedene Rollen für verschiedene Einsatzzwecke.',
    },
    {
      id: 'rooms',
      title: 'Rooms & Kanäle',
      icon: '💬',
      content: 'Verschlüsselte Chatgruppen erstellen und verwalten.',
    },
    {
      id: 'tips',
      title: 'Funkamateure',
      icon: '📻',
      content: 'APRS-Integration, Frequenzen, Rufzeichen-Nutzung.',
    },
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Deck',
      price: '~80€',
      features: ['Tastatur integriert', 'TFT Display', 'GPS', 'Standalone-Betrieb'],
      recommended: true,
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
        { store: 'AliExpress', url: 'https://aliexpress.com/w/wholesale-lilygo-t-deck.html' },
      ],
    },
    {
      name: 'LILYGO T-Beam v1.2',
      price: '~35€',
      features: ['GPS integriert', '18650 Akku', 'Bewährt', 'Günstig'],
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
      ],
    },
    {
      name: 'LILYGO T-Echo',
      price: '~60€',
      features: ['E-Paper Display', 'Sehr sparsam', 'GPS', 'Kompakt'],
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
      ],
    },
    {
      name: 'Heltec LoRa V3',
      price: '~25€',
      features: ['Sehr günstig', 'OLED Display', 'Kompakt', 'Kein GPS'],
      buyLinks: [
        { store: 'Heltec Store', url: 'https://heltec.org/' },
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
      features: ['Modular', 'Outdoor-tauglich', 'GPS Option', 'Professionell'],
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
  ],
};
