import type { HamProject } from '../../types/projects';

export const meshcoreGettingStarted: HamProject = {
  id: 'meshcore-getting-started',
  name: {
    de: 'MeshCore Getting Started',
    en: 'MeshCore Getting Started',
    sl: 'MeshCore Uvod',
  },
  category: 'mesh-lora',
  difficulty: 2,
  description: {
    de: 'MeshCore - Der leistungsstarke Meshtastic-Fork mit erweiterten Funktionen für Repeater, Rooms und Client-Management.',
    en: 'MeshCore - The powerful Meshtastic fork with advanced features for repeaters, rooms and client management.',
    sl: 'MeshCore - Zmogljiva različica Meshtastic z naprednimi funkcijami za repetitorje, sobe in upravljanje odjemalcev.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: {
        de: 'LoRa-fähiges Board (T-Beam, Heltec, RAK, T-Deck)',
        en: 'LoRa-capable board (T-Beam, Heltec, RAK, T-Deck)',
        sl: 'Plošča z LoRa (T-Beam, Heltec, RAK, T-Deck)',
      },
      quantity: 1,
      notes: {
        de: 'Siehe Hardware-Empfehlungen',
        en: 'See hardware recommendations',
        sl: 'Glejte priporočila za strojno opremo',
      },
    },
    {
      name: {
        de: 'USB-C Kabel',
        en: 'USB-C cable',
        sl: 'USB-C kabel',
      },
      quantity: 1,
    },
    {
      name: {
        de: 'Antenne 868 MHz',
        en: 'Antenna 868 MHz',
        sl: 'Antena 868 MHz',
      },
      quantity: 1,
      notes: {
        de: 'Oft im Lieferumfang',
        en: 'Often included',
        sl: 'Pogosto vključena',
      },
    },
    {
      name: {
        de: 'LiPo Akku (optional)',
        en: 'LiPo battery (optional)',
        sl: 'LiPo baterija (opcijsko)',
      },
      quantity: 1,
      notes: {
        de: 'Für mobilen Betrieb',
        en: 'For mobile operation',
        sl: 'Za mobilno uporabo',
      },
    },
  ],
  estimatedCost: '25-60 EUR',

  code: {
    de: `# MeshCore Getting Started Guide

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
    en: `# MeshCore Getting Started Guide

## What is MeshCore?

MeshCore is a **powerful fork of Meshtastic** with advanced features,
developed by Scott Powell (aka "Ripple"). It offers additional features like Rooms,
client-repeater architecture and better network management.

### Differences from Meshtastic

| Feature | Meshtastic | MeshCore |
|---------|------------|----------|
| Architecture | Peer-to-Peer | Client-Repeater |
| Chatrooms | Channels | Rooms (extended) |
| Repeater | Implicit Routing | Dedicated Repeater Role |
| Management | Decentralized | Central control possible |
| Firmware | Stable, conservative | More experimental, more features |
| Community | Very large | Growing, specialized |

### Main advantages of MeshCore

- **Rooms**: Chatrooms with better management
- **Repeater mode**: Dedicated relay stations
- **Client management**: See who is connected
- **Extended routing options**: More control over packet forwarding
- **Faster updates**: Experimental features available earlier

---

## Hardware Compatibility

MeshCore supports the same hardware as Meshtastic:

### LILYGO Boards

| Board | Price | GPS | Display | Battery | Recommendation |
|-------|-------|-----|---------|---------|----------------|
| **T-Beam v1.2** | ~35€ | ✅ | ❌ | 18650 | All-rounder, very popular |
| **T-Deck** | ~80€ | ✅ | TFT | LiPo | Handheld with keyboard |
| **T-Echo** | ~60€ | ✅ | E-Paper | LiPo | Very power efficient |
| **T-LoRa Pager** | ~50€ | ❌ | OLED | LiPo | Compact with buttons |
| **LoRa32 V2.1** | ~25€ | ❌ | OLED | ❌ | Budget, DIY projects |

### Heltec Boards

| Board | Price | GPS | Display | Battery | Recommendation |
|-------|-------|-----|---------|---------|----------------|
| **LoRa V3** | ~25€ | ❌ | OLED | ❌ | Budget, good for beginners |
| **Wireless Tracker** | ~30€ | ✅ | OLED | LiPo | GPS + compact |
| **Wireless Stick Lite** | ~20€ | ❌ | ❌ | ❌ | Minimal, budget |
| **Vision Master** | ~35€ | ❌ | E-Paper | LiPo | Power efficient |

### RAK Wireless

| Board | Price | GPS | Display | Battery | Recommendation |
|-------|-------|-----|---------|---------|----------------|
| **WisBlock Starter Kit** | ~45€ | Optional | Optional | LiPo | Modular |
| **WisBlock Meshtastic Kit** | ~60€ | ✅ | OLED | LiPo | Complete package |
| **WisMesh Repeater** | ~100€ | ✅ | ❌ | LiPo | IP67, Solar-ready |
| **WisMesh Repeater Mini** | ~80€ | ✅ | ❌ | 3200mAh | More compact, Solar |

### Other Hardware

| Board | Price | GPS | Display | Battery | Recommendation |
|-------|-------|-----|---------|---------|----------------|
| **Station G2 (B&Q)** | ~100€ | ❌ | ❌ | ❌ | High Power, ham radio operators |
| **Nano G2 Ultra (B&Q)** | ~70€ | ✅ | OLED | LiPo | Compact, robust |
| **SenseCAP T1000-E** | ~40€ | ✅ | ❌ | LiPo | Card Tracker, IP65 |
| **SenseCAP Indicator** | ~80€ | ❌ | 4" Touch | ❌ | Dashboard, Touchscreen |
| **ThinkNode M1** | ~60€ | ✅ | OLED | LiPo | Robust, Outdoor |
| **muzi R1 Neo** | ~50€ | ✅ | OLED | LiPo | Pager-Style |

### Hardware Recommendation

**For beginners**: LILYGO T-Deck (~80€)
- Complete handheld with keyboard and display
- Standalone operation without smartphone
- Perfect for getting to know MeshCore

**For mobile use**: LILYGO T-Echo or T-Beam
- E-Paper/no display, power efficient
- GPS integrated, good battery life

**For repeaters**: RAK WisMesh Repeater or T-Beam
- Weatherproof (IP67) or with enclosure
- Solar-ready for continuous operation
- Good range with external antenna

---

## Installing Firmware

### Method 1: MeshCore Web Flasher

1. Open **https://flasher.meshcore.co** (Chrome/Edge)
2. Connect board via USB
3. Select hardware type
4. Click "Flash"
5. Wait until complete (~2 minutes)

### Method 2: Companion App

The MeshCore Companion App can also be used for flashing:

1. Download app (Android)
2. Use OTG cable
3. In app: Settings → Flash Firmware

### Firmware Versions

- **Stable**: Recommended for beginners
- **Beta**: New features, possibly bugs
- **Nightly**: Developer builds, for testers only

---

## Initial Setup

### With Companion App

1. **Install app**:
   - Android: Companion App from GitHub Releases
   - iOS: In development

2. **Connect Bluetooth**:
   - Turn on device (power button)
   - Enable Bluetooth in app
   - Search and pair device

3. **Basic configuration**:
   - **Region**: EU_868 (Europe)
   - **Node Name**: Your callsign/name
   - **Modem Preset**: LONG_FAST or MEDIUM

### Important Settings

| Setting | Recommendation | Description |
|---------|----------------|-------------|
| Region | EU_868 | European frequency band |
| TX Power | Default (10 dBm) | Transmit power |
| Hop Limit | 3-5 | Max forwards |
| Role | Client/Repeater | Node function |
| Position | GPS/Manual | Location mode |

---

## Node Roles in MeshCore

### Client
- Default role for end devices
- Sends and receives messages
- Connects to repeaters

### Repeater
- Forwards messages
- No user interface needed
- Permanent installation recommended
- Extends network range

### Router
- Like repeater, but with extended routing decisions
- For backbone nodes in the network

### Client + Repeater
- Combined role
- Own use + forwarding
- Higher power consumption

---

## Rooms (Chatrooms)

### What are Rooms?

Rooms are encrypted chat groups in MeshCore - similar to Channels in Meshtastic,
but with extended features.

### Creating a Room

1. Open app
2. Rooms → New Room
3. Assign name
4. Choose encryption (AES256)
5. Invite participants

### Sharing a Room

- **QR Code**: Scan to join
- **Deep Link**: URL for sharing
- **Manual**: Transfer key and name

### Public Room

The "LongFast" Room is available by default on all devices
and serves as a public channel for the community.

---

## Tips for Ham Radio Operators

### Frequency Usage

- **ISM 868 MHz**: Standard, no license required
- **70cm Band (432-438 MHz)**: More power with ham license
- **23cm Band**: Experimentally possible

### APRS Integration

MeshCore can be connected to APRS gateways:

1. Set up MQTT bridge
2. Configure APRS-IS gateway
3. Position becomes visible on aprs.fi

### Callsign as Node Name

Recommended for ham radio operators:
- Node name: Callsign (e.g. "OE8YML")
- Shows license status
- Simplifies identification

---

## Network Tips

### Optimizing Range

1. **Antenna**: External antenna instead of internal
2. **Height**: The higher the better
3. **Line of sight**: Avoid obstacles
4. **Modem preset**: MEDIUM for more range

### Mesh Planning

- **Repeater spacing**: 3-5 km typical
- **Overlap**: Always at least 2 paths
- **Backbone**: Central repeaters with good location
- **Edge nodes**: Clients at the edge of the network

### Repeater Power Supply

| Solution | Cost | Autonomy |
|----------|------|----------|
| USB power supply | ~5€ | Grid dependent |
| Powerbank 20Ah | ~20€ | 3-7 days |
| Solar + Battery | ~50€ | Unlimited |
| 12V + DC-DC | ~15€ | Grid independent |

---

## Troubleshooting

### No Bluetooth Connection

1. Restart device
2. Toggle Bluetooth on phone off/on
3. Remove device in app and re-pair
4. Re-flash firmware

### Not Receiving Messages

1. Check region (EU_868)
2. Antenna connected?
3. Channel/Room settings the same?
4. Increase hop limit

### Device Won't Start

1. Check/charge battery
2. Change USB cable
3. Press reset button (if available)
4. Re-flash firmware

---

## Community & Support

### Official Resources

- **GitHub**: github.com/meshcore
- **Discord**: Active community
- **Documentation**: docs.meshcore.co

### Local Groups

- Search for mesh groups in your region
- Many local clubs experiment with LoRa mesh
- Use field days to get to know others

---

## Further Projects

1. **Build solar node**: Self-sufficient repeater with solar panel
2. **Set up gateway**: MQTT bridge to the internet
3. **Test multi-hop**: Range experiments
4. **Own network**: Build local mesh with friends
`,
    sl: `# MeshCore Vodnik za Začetek

## Kaj je MeshCore?

MeshCore je **zmogljiva različica Meshtastic** z naprednimi funkcijami,
ki jo je razvil Scott Powell (aka "Ripple"). Ponuja dodatne funkcije kot so Rooms,
arhitektura odjemalec-repetitor in boljše upravljanje omrežja.

### Razlike od Meshtastic

| Funkcija | Meshtastic | MeshCore |
|----------|------------|----------|
| Arhitektura | Peer-to-Peer | Odjemalec-Repetitor |
| Klepetalnice | Channels | Rooms (razširjeno) |
| Repetitor | Implicitno usmerjanje | Namenjena vloga repetitorja |
| Upravljanje | Decentralizirano | Centralni nadzor mogoč |
| Firmware | Stabilen, konzervativen | Bolj eksperimentalen, več funkcij |
| Skupnost | Zelo velika | Rastoča, specializirana |

### Glavne prednosti MeshCore

- **Rooms**: Klepetalnice z boljšim upravljanjem
- **Način repetitorja**: Namenske relejne postaje
- **Upravljanje odjemalcev**: Oglejte si, kdo je povezan
- **Razširjene možnosti usmerjanja**: Več nadzora nad posredovanjem paketov
- **Hitrejše posodobitve**: Eksperimentalne funkcije na voljo prej

---

## Združljivost Strojne Opreme

MeshCore podpira isto strojno opremo kot Meshtastic:

### LILYGO Plošče

| Plošča | Cena | GPS | Zaslon | Baterija | Priporočilo |
|--------|------|-----|--------|----------|-------------|
| **T-Beam v1.2** | ~35€ | ✅ | ❌ | 18650 | Vsestransko, zelo priljubljeno |
| **T-Deck** | ~80€ | ✅ | TFT | LiPo | Ročna naprava s tipkovnico |
| **T-Echo** | ~60€ | ✅ | E-Paper | LiPo | Zelo varčno |
| **T-LoRa Pager** | ~50€ | ❌ | OLED | LiPo | Kompaktno z gumbi |
| **LoRa32 V2.1** | ~25€ | ❌ | OLED | ❌ | Ugodno, DIY projekti |

### Heltec Plošče

| Plošča | Cena | GPS | Zaslon | Baterija | Priporočilo |
|--------|------|-----|--------|----------|-------------|
| **LoRa V3** | ~25€ | ❌ | OLED | ❌ | Ugodno, dobro za začetnike |
| **Wireless Tracker** | ~30€ | ✅ | OLED | LiPo | GPS + kompaktno |
| **Wireless Stick Lite** | ~20€ | ❌ | ❌ | ❌ | Minimalno, ugodno |
| **Vision Master** | ~35€ | ❌ | E-Paper | LiPo | Energijsko učinkovito |

### RAK Wireless

| Plošča | Cena | GPS | Zaslon | Baterija | Priporočilo |
|--------|------|-----|--------|----------|-------------|
| **WisBlock Starter Kit** | ~45€ | Opcijsko | Opcijsko | LiPo | Modularno |
| **WisBlock Meshtastic Kit** | ~60€ | ✅ | OLED | LiPo | Kompletni paket |
| **WisMesh Repeater** | ~100€ | ✅ | ❌ | LiPo | IP67, pripravljen za sončno energijo |
| **WisMesh Repeater Mini** | ~80€ | ✅ | ❌ | 3200mAh | Bolj kompaktno, sončna energija |

### Druga Strojna Oprema

| Plošča | Cena | GPS | Zaslon | Baterija | Priporočilo |
|--------|------|-----|--------|----------|-------------|
| **Station G2 (B&Q)** | ~100€ | ❌ | ❌ | ❌ | Visoka moč, radioamaterji |
| **Nano G2 Ultra (B&Q)** | ~70€ | ✅ | OLED | LiPo | Kompaktno, robustno |
| **SenseCAP T1000-E** | ~40€ | ✅ | ❌ | LiPo | Sledilnik kartic, IP65 |
| **SenseCAP Indicator** | ~80€ | ❌ | 4" na dotik | ❌ | Nadzorna plošča, zaslon na dotik |
| **ThinkNode M1** | ~60€ | ✅ | OLED | LiPo | Robustno, za zunaj |
| **muzi R1 Neo** | ~50€ | ✅ | OLED | LiPo | V stilu pozivnika |

### Priporočilo za Strojno Opremo

**Za začetnike**: LILYGO T-Deck (~80€)
- Popolna ročna naprava s tipkovnico in zaslonom
- Samostojno delovanje brez pametnega telefona
- Odlično za spoznavanje MeshCore

**Za mobilno uporabo**: LILYGO T-Echo ali T-Beam
- E-Paper/brez zaslona, energijsko učinkovito
- GPS integriran, dobra avtonomija baterije

**Za repetitorje**: RAK WisMesh Repeater ali T-Beam
- Odporno na vremenske vplive (IP67) ali z ohišjem
- Pripravljeno za sončno energijo za neprekinjeno delovanje
- Dober doseg z zunanjo anteno

---

## Namestitev Firmware

### Metoda 1: MeshCore Spletni Flasher

1. Odprite **https://flasher.meshcore.co** (Chrome/Edge)
2. Povežite ploščo prek USB
3. Izberite tip strojne opreme
4. Kliknite "Flash"
5. Počakajte do zaključka (~2 minuti)

### Metoda 2: Spremljevalna Aplikacija

MeshCore Companion App se lahko uporablja tudi za flashanje:

1. Prenesite aplikacijo (Android)
2. Uporabite OTG kabel
3. V aplikaciji: Settings → Flash Firmware

### Različice Firmware

- **Stable**: Priporočeno za začetnike
- **Beta**: Nove funkcije, morebitne napake
- **Nightly**: Razvojne verzije, samo za testerje

---

## Začetna Nastavitev

### S Spremljevalno Aplikacijo

1. **Namestite aplikacijo**:
   - Android: Companion App iz GitHub Releases
   - iOS: V razvoju

2. **Povežite Bluetooth**:
   - Vklopite napravo (gumb za vklop)
   - Omogočite Bluetooth v aplikaciji
   - Poiščite in seznanite napravo

3. **Osnovna konfiguracija**:
   - **Region**: EU_868 (Evropa)
   - **Node Name**: Vaš klicni znak/ime
   - **Modem Preset**: LONG_FAST ali MEDIUM

### Pomembne Nastavitve

| Nastavitev | Priporočilo | Opis |
|------------|-------------|------|
| Region | EU_868 | Evropski frekvenčni pas |
| TX Power | Privzeto (10 dBm) | Oddajna moč |
| Hop Limit | 3-5 | Maks. posredovanja |
| Role | Client/Repeater | Funkcija vozlišča |
| Position | GPS/Manual | Način lokacije |

---

## Vloge Vozlišč v MeshCore

### Client (Odjemalec)
- Privzeta vloga za končne naprave
- Pošilja in prejema sporočila
- Se povezuje z repetitorji

### Repeater (Repetitor)
- Posreduje sporočila
- Uporabniški vmesnik ni potreben
- Priporočena trajna namestitev
- Razširja doseg omrežja

### Router (Usmerjevalnik)
- Kot repetitor, vendar z razširjenimi odločitvami o usmerjanju
- Za hrbtenična vozlišča v omrežju

### Client + Repeater
- Kombinirana vloga
- Lastna uporaba + posredovanje
- Višja poraba energije

---

## Rooms (Klepetalnice)

### Kaj so Rooms?

Rooms so šifrirane skupine za klepet v MeshCore - podobno kot Channels v Meshtastic,
vendar z razširjenimi funkcijami.

### Ustvarjanje Room

1. Odprite aplikacijo
2. Rooms → New Room
3. Dodelite ime
4. Izberite šifriranje (AES256)
5. Povabite udeležence

### Deljenje Room

- **QR koda**: Skenirajte za pridružitev
- **Deep Link**: URL za deljenje
- **Ročno**: Prenesite ključ in ime

### Javni Room

"LongFast" Room je privzeto na voljo na vseh napravah
in služi kot javni kanal za skupnost.

---

## Nasveti za Radioamaterje

### Uporaba Frekvenc

- **ISM 868 MHz**: Standard, licenca ni potrebna
- **70cm pas (432-438 MHz)**: Več moči z amatersko licenco
- **23cm pas**: Eksperimentalno mogoče

### APRS Integracija

MeshCore se lahko poveže z APRS prehodi:

1. Nastavite MQTT most
2. Konfigurirajte APRS-IS prehod
3. Položaj postane viden na aprs.fi

### Klicni Znak kot Ime Vozlišča

Priporočeno za radioamaterje:
- Ime vozlišča: Klicni znak (npr. "OE8YML")
- Prikazuje status licence
- Poenostavi identifikacijo

---

## Omrežni Nasveti

### Optimizacija Dosega

1. **Antena**: Zunanja antena namesto notranje
2. **Višina**: Višje je boljše
3. **Prosta vidljivost**: Izogibajte se oviram
4. **Modem preset**: MEDIUM za večji doseg

### Načrtovanje Mesh

- **Razmik repetitorjev**: 3-5 km tipično
- **Prekrivanje**: Vedno vsaj 2 poti
- **Hrbtenica**: Centralni repetitorji z dobro lokacijo
- **Robna vozlišča**: Odjemalci na robu omrežja

### Napajanje Repetitorja

| Rešitev | Strošek | Avtonomija |
|---------|---------|------------|
| USB napajalnik | ~5€ | Odvisno od omrežja |
| Powerbank 20Ah | ~20€ | 3-7 dni |
| Sončna energija + baterija | ~50€ | Neomejeno |
| 12V + DC-DC | ~15€ | Neodvisno od omrežja |

---

## Odpravljanje Težav

### Ni Bluetooth Povezave

1. Znova zaženite napravo
2. Izklopite/vklopite Bluetooth na telefonu
3. Odstranite napravo v aplikaciji in znova seznanite
4. Znova flashajte firmware

### Ne Prejemam Sporočil

1. Preverite regijo (EU_868)
2. Je antena priključena?
3. So nastavitve Channel/Room enake?
4. Povečajte hop limit

### Naprava se ne Zažene

1. Preverite/napolnite baterijo
2. Zamenjajte USB kabel
3. Pritisnite gumb za ponastavitev (če je na voljo)
4. Znova flashajte firmware

---

## Skupnost & Podpora

### Uradni Viri

- **GitHub**: github.com/meshcore
- **Discord**: Aktivna skupnost
- **Dokumentacija**: docs.meshcore.co

### Lokalne Skupine

- Poiščite mesh skupine v vaši regiji
- Mnogi lokalni klubi eksperimentirajo z LoRa mesh
- Izkoristite terenske dneve za spoznavanje

---

## Nadaljnji Projekti

1. **Zgradite solarno vozlišče**: Samooskrbni repetitor s solarno ploščo
2. **Nastavite prehod**: MQTT most do interneta
3. **Testirajte multi-hop**: Eksperimenti z dosegom
4. **Lastno omrežje**: Zgradite lokalni mesh s prijatelji
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'MESHCORE_GETTING_STARTED.md',

  externalLinks: [
    {
      title: {
        de: 'MeshCore GitHub',
        en: 'MeshCore GitHub',
        sl: 'MeshCore GitHub',
      },
      url: 'https://github.com/ripplebiz/MeshCore',
    },
    {
      title: {
        de: 'MeshCore Flasher',
        en: 'MeshCore Flasher',
        sl: 'MeshCore Flasher',
      },
      url: 'https://flasher.meshcore.co',
    },
    {
      title: {
        de: 'MeshCore Discord',
        en: 'MeshCore Discord',
        sl: 'MeshCore Discord',
      },
      url: 'https://discord.gg/meshcore',
    },
    {
      title: {
        de: 'Ripple YouTube',
        en: 'Ripple YouTube',
        sl: 'Ripple YouTube',
      },
      url: 'https://www.youtube.com/@RippleWireless',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Unterschied zu Meshtastic erklären',
      en: 'Explain the difference to Meshtastic',
      sl: 'Razložite razliko od Meshtastic',
    },
    {
      de: 'Wie richte ich einen Repeater ein?',
      en: 'How do I set up a repeater?',
      sl: 'Kako nastavim repetitor?',
    },
    {
      de: 'Kann ich MeshCore und Meshtastic mischen?',
      en: 'Can I mix MeshCore and Meshtastic?',
      sl: 'Ali lahko mešam MeshCore in Meshtastic?',
    },
    {
      de: 'Wie funktionieren Rooms?',
      en: 'How do Rooms work?',
      sl: 'Kako delujejo Rooms?',
    },
    {
      de: 'Welche Hardware ist am besten für MeshCore?',
      en: 'Which hardware is best for MeshCore?',
      sl: 'Katera strojna oprema je najboljša za MeshCore?',
    },
  ],

  guideSections: [
    {
      id: 'intro',
      title: {
        de: 'Was ist MeshCore?',
        en: 'What is MeshCore?',
        sl: 'Kaj je MeshCore?',
      },
      icon: '⚡',
      content: {
        de: 'Leistungsstarker Meshtastic-Fork mit Rooms, Repeater-Modus und Client-Management.',
        en: 'Powerful Meshtastic fork with Rooms, repeater mode and client management.',
        sl: 'Zmogljiva različica Meshtastic z Rooms, načinom repetitorja in upravljanjem odjemalcev.',
      },
    },
    {
      id: 'hardware',
      title: {
        de: 'Hardware',
        en: 'Hardware',
        sl: 'Strojna oprema',
      },
      icon: '🔧',
      content: {
        de: 'Unterstützte Boards: T-Beam, T-Deck, Heltec, RAK WisBlock und mehr.',
        en: 'Supported boards: T-Beam, T-Deck, Heltec, RAK WisBlock and more.',
        sl: 'Podprte plošče: T-Beam, T-Deck, Heltec, RAK WisBlock in več.',
      },
    },
    {
      id: 'setup',
      title: {
        de: 'Installation',
        en: 'Installation',
        sl: 'Namestitev',
      },
      icon: '📲',
      content: {
        de: 'Firmware flashen via Web-Flasher oder Companion App.',
        en: 'Flash firmware via web flasher or companion app.',
        sl: 'Flashajte firmware prek spletnega flasherja ali spremljevalne aplikacije.',
      },
    },
    {
      id: 'roles',
      title: {
        de: 'Node-Rollen',
        en: 'Node Roles',
        sl: 'Vloge vozlišč',
      },
      icon: '🎭',
      content: {
        de: 'Client, Repeater, Router - verschiedene Rollen für verschiedene Einsatzzwecke.',
        en: 'Client, Repeater, Router - different roles for different use cases.',
        sl: 'Client, Repeater, Router - različne vloge za različne primere uporabe.',
      },
    },
    {
      id: 'rooms',
      title: {
        de: 'Rooms & Kanäle',
        en: 'Rooms & Channels',
        sl: 'Rooms in kanali',
      },
      icon: '💬',
      content: {
        de: 'Verschlüsselte Chatgruppen erstellen und verwalten.',
        en: 'Create and manage encrypted chat groups.',
        sl: 'Ustvarite in upravljajte šifrirane skupine za klepet.',
      },
    },
    {
      id: 'tips',
      title: {
        de: 'Funkamateure',
        en: 'Ham Radio Operators',
        sl: 'Radioamaterji',
      },
      icon: '📻',
      content: {
        de: 'APRS-Integration, Frequenzen, Rufzeichen-Nutzung.',
        en: 'APRS integration, frequencies, callsign usage.',
        sl: 'APRS integracija, frekvence, uporaba klicnih znakov.',
      },
    },
  ],

  hardwareOptions: [
    {
      name: {
        de: 'LILYGO T-Deck',
        en: 'LILYGO T-Deck',
        sl: 'LILYGO T-Deck',
      },
      price: '~80€',
      features: [
        {
          de: 'Tastatur integriert',
          en: 'Integrated keyboard',
          sl: 'Integrirana tipkovnica',
        },
        {
          de: 'TFT Display',
          en: 'TFT Display',
          sl: 'TFT zaslon',
        },
        {
          de: 'GPS',
          en: 'GPS',
          sl: 'GPS',
        },
        {
          de: 'Standalone-Betrieb',
          en: 'Standalone operation',
          sl: 'Samostojno delovanje',
        },
      ],
      recommended: true,
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
        { store: 'AliExpress', url: 'https://aliexpress.com/w/wholesale-lilygo-t-deck.html' },
      ],
    },
    {
      name: {
        de: 'LILYGO T-Beam v1.2',
        en: 'LILYGO T-Beam v1.2',
        sl: 'LILYGO T-Beam v1.2',
      },
      price: '~35€',
      features: [
        {
          de: 'GPS integriert',
          en: 'GPS integrated',
          sl: 'GPS integriran',
        },
        {
          de: '18650 Akku',
          en: '18650 battery',
          sl: '18650 baterija',
        },
        {
          de: 'Bewährt',
          en: 'Proven',
          sl: 'Preizkušeno',
        },
        {
          de: 'Günstig',
          en: 'Affordable',
          sl: 'Ugodno',
        },
      ],
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
      ],
    },
    {
      name: {
        de: 'LILYGO T-Echo',
        en: 'LILYGO T-Echo',
        sl: 'LILYGO T-Echo',
      },
      price: '~60€',
      features: [
        {
          de: 'E-Paper Display',
          en: 'E-Paper display',
          sl: 'E-Paper zaslon',
        },
        {
          de: 'Sehr sparsam',
          en: 'Very power efficient',
          sl: 'Zelo varčno',
        },
        {
          de: 'GPS',
          en: 'GPS',
          sl: 'GPS',
        },
        {
          de: 'Kompakt',
          en: 'Compact',
          sl: 'Kompaktno',
        },
      ],
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
      ],
    },
    {
      name: {
        de: 'Heltec LoRa V3',
        en: 'Heltec LoRa V3',
        sl: 'Heltec LoRa V3',
      },
      price: '~25€',
      features: [
        {
          de: 'Sehr günstig',
          en: 'Very affordable',
          sl: 'Zelo ugodno',
        },
        {
          de: 'OLED Display',
          en: 'OLED display',
          sl: 'OLED zaslon',
        },
        {
          de: 'Kompakt',
          en: 'Compact',
          sl: 'Kompaktno',
        },
        {
          de: 'Kein GPS',
          en: 'No GPS',
          sl: 'Brez GPS',
        },
      ],
      buyLinks: [
        { store: 'Heltec Store', url: 'https://heltec.org/' },
      ],
    },
    {
      name: {
        de: 'Heltec Wireless Tracker',
        en: 'Heltec Wireless Tracker',
        sl: 'Heltec Wireless Tracker',
      },
      price: '~30€',
      features: [
        {
          de: 'GPS integriert',
          en: 'GPS integrated',
          sl: 'GPS integriran',
        },
        {
          de: 'OLED Display',
          en: 'OLED display',
          sl: 'OLED zaslon',
        },
        {
          de: 'Kompakt',
          en: 'Compact',
          sl: 'Kompaktno',
        },
        {
          de: 'LiPo Akku',
          en: 'LiPo battery',
          sl: 'LiPo baterija',
        },
      ],
      buyLinks: [
        { store: 'Heltec Store', url: 'https://heltec.org/' },
      ],
    },
    {
      name: {
        de: 'RAK WisBlock Kit',
        en: 'RAK WisBlock Kit',
        sl: 'RAK WisBlock Kit',
      },
      price: '~60€',
      features: [
        {
          de: 'Modular',
          en: 'Modular',
          sl: 'Modularno',
        },
        {
          de: 'Outdoor-tauglich',
          en: 'Outdoor suitable',
          sl: 'Primerno za zunaj',
        },
        {
          de: 'GPS Option',
          en: 'GPS option',
          sl: 'GPS opcija',
        },
        {
          de: 'Professionell',
          en: 'Professional',
          sl: 'Profesionalno',
        },
      ],
      buyLinks: [
        { store: 'RAK Store', url: 'https://store.rakwireless.com/' },
      ],
    },
    {
      name: {
        de: 'RAK WisMesh Repeater',
        en: 'RAK WisMesh Repeater',
        sl: 'RAK WisMesh Repeater',
      },
      price: '~100€',
      features: [
        {
          de: 'IP67 Wetterfest',
          en: 'IP67 weatherproof',
          sl: 'IP67 vodoodporno',
        },
        {
          de: 'Solar-ready',
          en: 'Solar-ready',
          sl: 'Pripravljeno za sončno energijo',
        },
        {
          de: 'GPS',
          en: 'GPS',
          sl: 'GPS',
        },
        {
          de: 'Für Dauerbetrieb',
          en: 'For continuous operation',
          sl: 'Za neprekinjeno delovanje',
        },
      ],
      buyLinks: [
        { store: 'RAK Store', url: 'https://store.rakwireless.com/' },
      ],
    },
    {
      name: {
        de: 'Station G2 (B&Q)',
        en: 'Station G2 (B&Q)',
        sl: 'Station G2 (B&Q)',
      },
      price: '~100€',
      features: [
        {
          de: 'High Power',
          en: 'High power',
          sl: 'Visoka moč',
        },
        {
          de: 'Für Funkamateure',
          en: 'For ham radio operators',
          sl: 'Za radioamaterje',
        },
        {
          de: 'Robustes Gehäuse',
          en: 'Robust enclosure',
          sl: 'Robustno ohišje',
        },
        {
          de: 'Base Station',
          en: 'Base station',
          sl: 'Bazna postaja',
        },
      ],
      buyLinks: [
        { store: 'Tindie', url: 'https://www.tindie.com/stores/neilhao/' },
      ],
    },
  ],
};
