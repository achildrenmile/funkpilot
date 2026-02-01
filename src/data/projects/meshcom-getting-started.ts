import type { HamProject } from '../../types/projects';

export const meshcomGettingStarted: HamProject = {
  id: 'meshcom-getting-started',
  name: {
    de: 'MeshCom Einstieg',
    en: 'MeshCom Getting Started',
    sl: 'MeshCom - Začetni vodnik',
  },
  category: 'mesh-lora',
  difficulty: 2,
  description: {
    de: 'MeshCom - Das LoRa-Mesh-Netzwerk für Funkamateure in Österreich und Deutschland. Entwickelt vom ÖVSV mit Fokus auf Ham Radio.',
    en: 'MeshCom - The LoRa mesh network for amateur radio operators in Austria and Germany. Developed by ÖVSV with focus on ham radio.',
    sl: 'MeshCom - LoRa mrežno omrežje za radioamaterje v Avstriji in Nemčiji. Razvito s strani ÖVSV s poudarkom na amaterski radijski zvezi.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: {
        de: 'LoRa-Board (T-Beam, Heltec, RAK)',
        en: 'LoRa Board (T-Beam, Heltec, RAK)',
        sl: 'LoRa plošča (T-Beam, Heltec, RAK)',
      },
      quantity: 1,
      notes: {
        de: 'Gleiche Hardware wie Meshtastic',
        en: 'Same hardware as Meshtastic',
        sl: 'Enaka strojna oprema kot Meshtastic',
      },
    },
    {
      name: {
        de: 'USB-C Kabel',
        en: 'USB-C Cable',
        sl: 'USB-C kabel',
      },
      quantity: 1,
    },
    {
      name: {
        de: 'Antenne 433 MHz',
        en: '433 MHz Antenna',
        sl: 'Antena 433 MHz',
      },
      quantity: 1,
      notes: {
        de: '70cm Band für Funkamateure',
        en: '70cm band for amateur radio',
        sl: '70cm pas za radioamaterje',
      },
    },
    {
      name: {
        de: '18650 LiPo Akku',
        en: '18650 LiPo Battery',
        sl: '18650 LiPo baterija',
      },
      quantity: 1,
      notes: {
        de: 'Für portablen Betrieb',
        en: 'For portable operation',
        sl: 'Za prenosno uporabo',
      },
    },
  ],
  estimatedCost: '25-60 EUR',

  code: {
    de: `# MeshCom Einstieg

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
    en: `# MeshCom Getting Started Guide

## What is MeshCom?

MeshCom is an **Austrian project** for LoRa-based mesh communication,
developed by **ÖVSV** (Austrian Amateur Radio Association) specifically for amateur radio operators.

### Difference from Meshtastic

| Aspect | MeshCom | Meshtastic |
|--------|---------|------------|
| **Focus** | Amateur radio | General |
| **Frequency** | 433 MHz (70cm) | 868 MHz (ISM) |
| **License** | Amateur radio license | Not required |
| **Power** | Up to 500 mW | 25 mW (ISM) |
| **Community** | OE/DL focused | International |

### Advantages of MeshCom

- **More power**: Up to 500 mW allowed (with license)
- **70cm band**: Less congested than ISM
- **Local community**: Active groups in OE/DL
- **Ham focus**: Features for amateur radio operators

---

## Requirements

### Amateur Radio License

MeshCom uses the 70cm amateur radio band (433 MHz).
**You need a valid amateur radio license!**

In Austria:
- License class 1 (CEPT)
- Or license class 4

### Hardware

Same hardware as Meshtastic:
- LILYGO T-Beam
- Heltec LoRa
- RAK WisBlock

**Important**: Use a 433 MHz antenna, not 868 MHz!

---

## Installing Firmware

### Step 1: Download Firmware

1. Go to [icssw.org/meshcom](https://icssw.org/meshcom/)
2. Download the current firmware for your board
3. Save the firmware file (.bin)

### Step 2: Flashing

**Option A: MeshCom Flasher (Recommended)**

1. Download MeshCom Flasher from the website
2. Connect board via USB
3. Select firmware
4. Click "Flash"

**Option B: ESPTool**

\`\`\`bash
# Install ESPTool
pip install esptool

# Flash
esptool.py --chip esp32 write_flash 0x1000 meshcom_firmware.bin
\`\`\`

---

## Configuration

### MeshCom App

1. Install **Android App** from the Play Store
2. Connect to node via Bluetooth
3. Configure basic settings

### Important Settings

| Parameter | Value | Explanation |
|-----------|-------|-------------|
| Callsign | OE8XXX | Your amateur radio callsign |
| Frequency | 433.175 MHz | MeshCom main frequency |
| TX Power | 20 dBm | ~100 mW (adjustable) |
| SF/BW | SF10/125 | Standard Spreading Factor |

### Frequencies in OE

- **433.175 MHz**: MeshCom main frequency
- **433.775 MHz**: Alternative
- **433.900 MHz**: Gateway frequency

---

## Network Structure

### Node Types

1. **Client Node**: Normal end device
2. **Router Node**: Forwards messages
3. **Gateway Node**: Connection to Internet/APRS

### Mesh Function

- Messages are automatically routed through multiple nodes
- Range increases with each intermediate node
- Typical range: 5-20 km (depending on terrain)

---

## MeshCom Gateway

### What is a Gateway?

Gateways connect the MeshCom network with:
- Internet (MQTT)
- APRS network
- Other MeshCom regions

### Gateways in OE

ÖVSV operates several gateways:
- **OE1XUU**: Vienna
- **OE3XOR**: Lower Austria
- **OE5XBL**: Upper Austria
- **OE7XLR**: Tyrol

---

## Integration with APRS

### MeshCom → APRS

MeshCom positions can appear on APRS.fi:
1. Proximity to gateway required
2. Position is sent automatically
3. Visible on aprs.fi

### APRS → MeshCom

APRS messages can be forwarded to MeshCom.
Configuration at the gateway required.

---

## Tips & Best Practices

### Antenna

- Use a **433 MHz antenna** (not 868!)
- Telescopic antenna or 1/4 wave
- For portable: Flexible whip antenna

### Optimizing Range

1. **Gain height**: Use mountains, buildings
2. **Clear view**: Line-of-sight is important
3. **Good antenna**: Makes the difference

### QSO Etiquette

- Use callsigns
- Activate position
- Polite communication (Ham Spirit!)

---

## Further Links

- [MeshCom Wiki](https://wiki.oevsv.at/wiki/MeshCom)
- [ÖVSV MeshCom Page](https://icssw.org/meshcom/)
- [MeshCom Telegram Group](https://t.me/meshcom_oe)
- [MeshCom Map](https://map.meshcom.at)

---

## Comparison: MeshCom vs Meshtastic

### When MeshCom?

- You have an amateur radio license
- You want more transmit power
- You are active in OE/DL
- You want APRS integration

### When Meshtastic?

- No amateur radio license
- International compatibility important
- Larger global community
- Easier to get started
`,
    sl: `# MeshCom - Začetni vodnik

## Kaj je MeshCom?

MeshCom je **avstrijski projekt** za LoRa mrežno komunikacijo,
razvit s strani **ÖVSV** (Avstrijsko združenje radioamaterjev) posebej za radioamaterje.

### Razlika od Meshtastic

| Vidik | MeshCom | Meshtastic |
|-------|---------|------------|
| **Fokus** | Radioamaterstvo | Splošno |
| **Frekvenca** | 433 MHz (70cm) | 868 MHz (ISM) |
| **Licenca** | Radioamaterska licenca | Ni potrebna |
| **Moč** | Do 500 mW | 25 mW (ISM) |
| **Skupnost** | Usmerjena v OE/DL | Mednarodna |

### Prednosti MeshCom

- **Več moči**: Do 500 mW dovoljeno (z licenco)
- **70cm pas**: Manj zaseden kot ISM
- **Lokalna skupnost**: Aktivne skupine v OE/DL
- **Ham fokus**: Funkcije za radioamaterje

---

## Zahteve

### Radioamaterska licenca

MeshCom uporablja 70cm radioamaterski pas (433 MHz).
**Potrebujete veljavno radioamatersko licenco!**

V Avstriji:
- Dovoljenje razred 1 (CEPT)
- Ali dovoljenje razred 4

### Strojna oprema

Enaka strojna oprema kot Meshtastic:
- LILYGO T-Beam
- Heltec LoRa
- RAK WisBlock

**Pomembno**: Uporabite anteno za 433 MHz, ne 868 MHz!

---

## Namestitev firmware

### Korak 1: Prenos firmware

1. Pojdite na [icssw.org/meshcom](https://icssw.org/meshcom/)
2. Prenesite trenutni firmware za vašo ploščo
3. Shranite datoteko firmware (.bin)

### Korak 2: Nalaganje

**Možnost A: MeshCom Flasher (Priporočeno)**

1. Prenesite MeshCom Flasher s spletne strani
2. Povežite ploščo preko USB
3. Izberite firmware
4. Kliknite "Flash"

**Možnost B: ESPTool**

\`\`\`bash
# Namestite ESPTool
pip install esptool

# Naložite
esptool.py --chip esp32 write_flash 0x1000 meshcom_firmware.bin
\`\`\`

---

## Konfiguracija

### MeshCom aplikacija

1. Namestite **Android aplikacijo** iz Play Store
2. Povežite se z vozliščem preko Bluetooth
3. Konfigurirajte osnovne nastavitve

### Pomembne nastavitve

| Parameter | Vrednost | Razlaga |
|-----------|----------|---------|
| Klicni znak | OE8XXX | Vaš radioamaterski klicni znak |
| Frekvenca | 433.175 MHz | MeshCom glavna frekvenca |
| TX moč | 20 dBm | ~100 mW (prilagodljivo) |
| SF/BW | SF10/125 | Standardni razpršitveni faktor |

### Frekvence v OE

- **433.175 MHz**: MeshCom glavna frekvenca
- **433.775 MHz**: Alternativa
- **433.900 MHz**: Gateway frekvenca

---

## Struktura omrežja

### Tipi vozlišč

1. **Client vozlišče**: Normalna končna naprava
2. **Router vozlišče**: Posreduje sporočila
3. **Gateway vozlišče**: Povezava z internetom/APRS

### Mesh funkcija

- Sporočila se samodejno usmerjajo preko več vozlišč
- Doseg se povečuje z vsakim vmesnim vozliščem
- Tipični doseg: 5-20 km (odvisno od terena)

---

## MeshCom Gateway

### Kaj je Gateway?

Gateway-i povezujejo omrežje MeshCom z:
- Internetom (MQTT)
- APRS omrežjem
- Drugimi MeshCom regijami

### Gateway-i v OE

ÖVSV upravlja več gateway-ev:
- **OE1XUU**: Dunaj
- **OE3XOR**: Spodnja Avstrija
- **OE5XBL**: Zgornja Avstrija
- **OE7XLR**: Tirolska

---

## Integracija z APRS

### MeshCom → APRS

MeshCom pozicije se lahko pojavijo na APRS.fi:
1. Potrebna bližina gateway-a
2. Pozicija se samodejno pošlje
3. Vidno na aprs.fi

### APRS → MeshCom

APRS sporočila se lahko posredujejo v MeshCom.
Potrebna konfiguracija na gateway-u.

---

## Nasveti in najboljše prakse

### Antena

- Uporabite **433 MHz anteno** (ne 868!)
- Teleskopska antena ali 1/4 valovne dolžine
- Za prenosno uporabo: Fleksibilna whip antena

### Optimizacija dosega

1. **Pridobite višino**: Uporabite gore, stavbe
2. **Prost pogled**: Line-of-sight je pomemben
3. **Dobra antena**: Naredi razliko

### QSO bonton

- Uporabljajte klicne znake
- Aktivirajte pozicijo
- Vljudna komunikacija (Ham Spirit!)

---

## Dodatne povezave

- [MeshCom Wiki](https://wiki.oevsv.at/wiki/MeshCom)
- [ÖVSV MeshCom stran](https://icssw.org/meshcom/)
- [MeshCom Telegram skupina](https://t.me/meshcom_oe)
- [MeshCom zemljevid](https://map.meshcom.at)

---

## Primerjava: MeshCom vs Meshtastic

### Kdaj MeshCom?

- Imate radioamatersko licenco
- Želite več oddajne moči
- Ste aktivni v OE/DL
- Želite APRS integracijo

### Kdaj Meshtastic?

- Brez radioamaterske licence
- Mednarodna združljivost pomembna
- Večja globalna skupnost
- Lažji začetek
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'MESHCOM_GUIDE.md',

  externalLinks: [
    {
      title: {
        de: 'MeshCom Wiki (ÖVSV)',
        en: 'MeshCom Wiki (ÖVSV)',
        sl: 'MeshCom Wiki (ÖVSV)',
      },
      url: 'https://wiki.oevsv.at/wiki/MeshCom',
    },
    {
      title: {
        de: 'MeshCom Firmware',
        en: 'MeshCom Firmware',
        sl: 'MeshCom Firmware',
      },
      url: 'https://icssw.org/meshcom/',
    },
    {
      title: {
        de: 'MeshCom Karte',
        en: 'MeshCom Map',
        sl: 'MeshCom zemljevid',
      },
      url: 'https://map.meshcom.at',
    },
    {
      title: {
        de: 'Telegram Gruppe',
        en: 'Telegram Group',
        sl: 'Telegram skupina',
      },
      url: 'https://t.me/meshcom_oe',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Wie verbinde ich MeshCom mit APRS?',
      en: 'How do I connect MeshCom with APRS?',
      sl: 'Kako povežem MeshCom z APRS?',
    },
    {
      de: 'Welche Antenne für 433 MHz?',
      en: 'Which antenna for 433 MHz?',
      sl: 'Katera antena za 433 MHz?',
    },
    {
      de: 'Kann ich einen Gateway aufstellen?',
      en: 'Can I set up a gateway?',
      sl: 'Ali lahko postavim gateway?',
    },
    {
      de: 'MeshCom vs Meshtastic - was ist besser für mich?',
      en: 'MeshCom vs Meshtastic - which is better for me?',
      sl: 'MeshCom vs Meshtastic - kaj je boljše zame?',
    },
    {
      de: 'Wie erhöhe ich die Sendeleistung legal?',
      en: 'How do I increase transmit power legally?',
      sl: 'Kako zakonito povečam oddajno moč?',
    },
  ],

  guideSections: [
    {
      id: 'intro',
      title: {
        de: 'Was ist MeshCom?',
        en: 'What is MeshCom?',
        sl: 'Kaj je MeshCom?',
      },
      icon: '📻',
      content: {
        de: 'ÖVSV-Projekt für Funkamateure im 70cm Band mit höherer Leistung.',
        en: 'ÖVSV project for amateur radio operators on 70cm band with higher power.',
        sl: 'ÖVSV projekt za radioamaterje na 70cm pasu z višjo močjo.',
      },
    },
    {
      id: 'requirements',
      title: {
        de: 'Voraussetzungen',
        en: 'Requirements',
        sl: 'Zahteve',
      },
      icon: '📜',
      content: {
        de: 'Amateurfunklizenz erforderlich, gleiche Hardware wie Meshtastic.',
        en: 'Amateur radio license required, same hardware as Meshtastic.',
        sl: 'Potrebna radioamaterska licenca, enaka strojna oprema kot Meshtastic.',
      },
    },
    {
      id: 'setup',
      title: {
        de: 'Firmware & Setup',
        en: 'Firmware & Setup',
        sl: 'Firmware & nastavitev',
      },
      icon: '⚡',
      content: {
        de: 'MeshCom Firmware flashen und Grundkonfiguration.',
        en: 'Flash MeshCom firmware and basic configuration.',
        sl: 'Naložite MeshCom firmware in osnovna konfiguracija.',
      },
    },
    {
      id: 'network',
      title: {
        de: 'Netzwerk',
        en: 'Network',
        sl: 'Omrežje',
      },
      icon: '🌐',
      content: {
        de: 'Node-Typen, Mesh-Funktion und Gateways.',
        en: 'Node types, mesh function and gateways.',
        sl: 'Tipi vozlišč, mesh funkcija in gateway-i.',
      },
    },
    {
      id: 'aprs',
      title: {
        de: 'APRS Integration',
        en: 'APRS Integration',
        sl: 'APRS integracija',
      },
      icon: '📡',
      content: {
        de: 'Verbindung zum APRS-Netzwerk herstellen.',
        en: 'Connect to the APRS network.',
        sl: 'Povezava z APRS omrežjem.',
      },
    },
  ],

  hardwareOptions: [
    {
      name: {
        de: 'LILYGO T-Beam v1.2 (433MHz)',
        en: 'LILYGO T-Beam v1.2 (433MHz)',
        sl: 'LILYGO T-Beam v1.2 (433MHz)',
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
          de: 'Bewährt für MeshCom',
          en: 'Proven for MeshCom',
          sl: 'Preizkušeno za MeshCom',
        },
        {
          de: '433 MHz Version!',
          en: '433 MHz version!',
          sl: '433 MHz različica!',
        },
      ],
      recommended: true,
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
        { store: 'AliExpress', url: 'https://aliexpress.com/w/wholesale-lilygo-t-beam-433.html' },
      ],
    },
    {
      name: {
        de: 'LILYGO T-Deck (433MHz)',
        en: 'LILYGO T-Deck (433MHz)',
        sl: 'LILYGO T-Deck (433MHz)',
      },
      price: '~80€',
      features: [
        {
          de: 'Tastatur',
          en: 'Keyboard',
          sl: 'Tipkovnica',
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
          de: 'Standalone',
          en: 'Standalone',
          sl: 'Samostojna',
        },
      ],
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
      ],
    },
    {
      name: {
        de: 'Heltec LoRa V3 (433MHz)',
        en: 'Heltec LoRa V3 (433MHz)',
        sl: 'Heltec LoRa V3 (433MHz)',
      },
      price: '~25€',
      features: [
        {
          de: 'Günstig',
          en: 'Affordable',
          sl: 'Ugodno',
        },
        {
          de: 'Kompakt',
          en: 'Compact',
          sl: 'Kompaktna',
        },
        {
          de: 'OLED Display',
          en: 'OLED Display',
          sl: 'OLED zaslon',
        },
        {
          de: '433 MHz Version!',
          en: '433 MHz version!',
          sl: '433 MHz različica!',
        },
      ],
      buyLinks: [
        { store: 'Heltec Store', url: 'https://heltec.org/' },
      ],
    },
    {
      name: {
        de: 'RAK WisBlock (433MHz)',
        en: 'RAK WisBlock (433MHz)',
        sl: 'RAK WisBlock (433MHz)',
      },
      price: '~60€',
      features: [
        {
          de: 'Modular',
          en: 'Modular',
          sl: 'Modularna',
        },
        {
          de: 'Outdoor-tauglich',
          en: 'Outdoor-ready',
          sl: 'Primerna za zunanjo uporabo',
        },
        {
          de: 'Professionell',
          en: 'Professional',
          sl: 'Profesionalna',
        },
      ],
      buyLinks: [
        { store: 'RAK Store', url: 'https://store.rakwireless.com/' },
      ],
    },
    {
      name: {
        de: '433 MHz Antenne',
        en: '433 MHz Antenna',
        sl: '433 MHz antena',
      },
      price: '~10€',
      features: [
        {
          de: '1/4 Wave',
          en: '1/4 Wave',
          sl: '1/4 valovne dolžine',
        },
        {
          de: 'SMA Anschluss',
          en: 'SMA connector',
          sl: 'SMA priključek',
        },
        {
          de: 'Für 70cm Band',
          en: 'For 70cm band',
          sl: 'Za 70cm pas',
        },
      ],
    },
  ],
};
