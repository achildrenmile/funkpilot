import type { HamProject } from '../../types/projects';

export const meshtasticGettingStarted: HamProject = {
  id: 'meshtastic-getting-started',
  name: {
    de: 'Meshtastic Getting Started',
    en: 'Meshtastic Getting Started',
    sl: 'Meshtastic Getting Started',
  },
  category: 'mesh-lora',
  difficulty: 1,
  description: {
    de: 'Einstieg in Meshtastic - Das Open-Source LoRa Mesh-Netzwerk für Off-Grid Kommunikation. Perfekt für Outdoor, Notfunk und Experimentieren.',
    en: 'Getting started with Meshtastic - The open-source LoRa mesh network for off-grid communication. Perfect for outdoor activities, emergency communications, and experimentation.',
    sl: 'Začetek z Meshtastic - Odprtokodno LoRa mrežno omrežje za komunikacijo brez omrežja. Idealno za aktivnosti na prostem, komunikacijo v sili in eksperimentiranje.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: {
        de: 'LoRa-fähiges Board (T-Beam, Heltec, RAK)',
        en: 'LoRa-capable board (T-Beam, Heltec, RAK)',
        sl: 'LoRa-zmožna plošča (T-Beam, Heltec, RAK)',
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
        en: '868 MHz antenna',
        sl: 'Antena 868 MHz',
      },
      quantity: 1,
      notes: {
        de: 'Oft im Lieferumfang',
        en: 'Often included in delivery',
        sl: 'Pogosto vključeno v dostavi',
      },
    },
    {
      name: {
        de: 'LiPo Akku 18650 (optional)',
        en: 'LiPo battery 18650 (optional)',
        sl: 'LiPo baterija 18650 (neobvezno)',
      },
      quantity: 1,
      notes: {
        de: 'Für T-Beam',
        en: 'For T-Beam',
        sl: 'Za T-Beam',
      },
    },
  ],
  estimatedCost: '25-60 EUR',

  code: {
    de: `# Meshtastic Getting Started Guide

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
    en: `# Meshtastic Getting Started Guide

## What is Meshtastic?

Meshtastic is an **open-source project** for LoRa-based mesh communication.
It enables encrypted messages over long distances without internet or cellular networks.

### Key Features

- **Range**: Up to 10+ km (depending on terrain)
- **Mesh Network**: Messages are automatically relayed
- **Encryption**: AES256 end-to-end
- **No License Required**: Uses ISM band (868 MHz in EU)
- **Open Source**: Firmware, apps, and hardware designs

### Who is Meshtastic for?

- **Outdoor Enthusiasts**: Hikers, mountaineers, skiers
- **Emergency Communications**: Communication during power outages
- **Events**: Festivals, trade shows, group activities
- **Amateur Radio Operators**: Experimenting with LoRa
- **Preppers**: Off-grid communication

---

## Hardware Overview

### All Supported Devices

#### LILYGO (Recommended for Beginners)

| Device | Price | GPS | Display | Battery | Recommendation |
|--------|-------|-----|---------|---------|----------------|
| **T-Beam v1.2** | ~35€ | ✅ | ❌ | 18650 | All-rounder, very popular |
| **T-Echo** | ~60€ | ✅ | E-Paper | LiPo | Very efficient, outdoor |
| **T-Deck** | ~80€ | ✅ | TFT | LiPo | With keyboard, standalone |
| **T-LoRa Pager** | ~50€ | ❌ | OLED | LiPo | Compact with buttons |
| **LoRa32 V2.1** | ~25€ | ❌ | OLED | ❌ | Affordable, DIY-friendly |

#### Heltec

| Device | Price | GPS | Display | Battery | Recommendation |
|--------|-------|-----|---------|---------|----------------|
| **LoRa V3** | ~25€ | ❌ | OLED | ❌ | Affordable, good entry point |
| **Wireless Tracker** | ~30€ | ✅ | OLED | LiPo | GPS + compact |
| **Wireless Stick Lite** | ~20€ | ❌ | ❌ | ❌ | Minimal, affordable |
| **Vision Master** | ~35€ | ❌ | E-Paper | LiPo | Efficient |
| **Mesh Node** | ~40€ | Optional | Optional | LiPo | Modular |

#### RAKwireless

| Device | Price | GPS | Display | Battery | Recommendation |
|--------|-------|-----|---------|---------|----------------|
| **WisBlock Starter Kit** | ~45€ | Optional | Optional | LiPo | Modular, professional |
| **WisBlock Meshtastic Kit** | ~60€ | ✅ | OLED | LiPo | Complete package |
| **WisMesh Repeater** | ~100€ | ✅ | ❌ | LiPo | IP67, solar-ready |
| **WisMesh Repeater Mini** | ~80€ | ✅ | ❌ | 3200mAh | More compact, solar |

#### B&Q Consulting

| Device | Price | GPS | Display | Battery | Recommendation |
|--------|-------|-----|---------|---------|----------------|
| **Station G2** | ~100€ | ❌ | ❌ | ❌ | High power for ham operators |
| **Nano G2 Ultra** | ~70€ | ✅ | OLED | LiPo | Compact, robust |

#### Seeed Studio

| Device | Price | GPS | Display | Battery | Recommendation |
|--------|-------|-----|---------|---------|----------------|
| **SenseCAP T1000-E** | ~40€ | ✅ | ❌ | LiPo | Card tracker, IP65 |
| **SenseCAP Indicator** | ~80€ | ❌ | 4" Touch | ❌ | Touchscreen, dashboard |

#### Elecrow & Others

| Device | Price | GPS | Display | Battery | Recommendation |
|--------|-------|-----|---------|---------|----------------|
| **ThinkNode M1** | ~60€ | ✅ | OLED | LiPo | Robust, outdoor |
| **muzi R1 Neo** | ~50€ | ✅ | OLED | LiPo | Pager-style |
| **Raspberry Pi Pico** | ~15€ | ❌ | ❌ | ❌ | DIY projects |

### Hardware Buying Recommendations

**For Beginners**: LILYGO T-Beam v1.2
- GPS integrated, 18650 battery holder
- Large community & many tutorials
- Proven, reliable platform

**For Mobile Use**: LILYGO T-Echo or T-Deck
- E-Paper/TFT display, built-in battery
- Standalone operation without smartphone

**For Repeater/Gateway**: RAK WisMesh Repeater
- Weatherproof (IP67), solar-ready
- Professional quality

**Where to Buy**:
- AliExpress (cheapest option, 2-3 weeks delivery)
- Amazon (faster, more expensive)
- Official LILYGO/RAK/Heltec Store
- Seeed Studio (for SenseCAP)
- Tindie (for B&Q Station G2)

---

## Flashing Firmware

### Method 1: Web Flasher (Recommended)

1. Open **https://flasher.meshtastic.org** in Chrome/Edge
2. Connect your device via USB
3. Select your board from the list
4. Click "Flash"
5. Done in 2 minutes!

### Method 2: Python CLI

\`\`\`bash
# Install Meshtastic CLI
pip install meshtastic

# Flash firmware
meshtastic --flash
\`\`\`

### Method 3: ESPHome Flasher

For advanced users with custom firmware modifications.

---

## Initial Configuration

### Via Smartphone App

1. **Install the App**:
   - Android: [Google Play](https://play.google.com/store/apps/details?id=com.geeksville.mesh)
   - iOS: [App Store](https://apps.apple.com/app/meshtastic/id1586432531)

2. **Pair via Bluetooth**:
   - Turn on the device
   - Press "+" in the app
   - Select the device

3. **Basic Settings**:
   - **Region**: EU_868 (for Europe)
   - **Name**: Your display name
   - **Preset**: LONG_FAST (default) or MEDIUM (more range)

### Important Settings

| Setting | Recommendation | Explanation |
|---------|----------------|-------------|
| Region | EU_868 | Required in Europe! |
| Modem Preset | LONG_FAST | Good compromise |
| Hop Limit | 3 | Max. relays |
| GPS | Enabled | For position display |
| WiFi | Optional | For MQTT/Internet |

---

## Channels & Encryption

### Default Channel

Meshtastic has a preset "LongFast" channel.
**All devices with the same settings can communicate.**

### Creating Custom Channels

1. In the app: Channels → "+"
2. Assign a name
3. PSK (key) is automatically generated
4. Share the QR code

### Sharing Channels

- **QR Code**: Others scan your code
- **URL**: Share the channel link
- **NFC**: Tap devices together (if supported)

---

## Tips for Amateur Radio Operators

### Frequencies

- **ISM Band 868 MHz**: No license required, 25 mW ERP
- **70cm Ham Band (optional)**: More power possible with license

### Integration with Ham Radio

- **APRS Gateway**: Meshtastic → APRS possible
- **MQTT**: Bridge messages to the internet
- **Position Data**: GPS tracking in the mesh

### Legal in OE/DL

- ISM Band: No license required
- Transmit Power: Max 25 mW ERP (standard)
- Duty Cycle: 1% (enforced by firmware)

---

## Next Steps

1. **Join the Community**: [Discord](https://discord.gg/meshtastic)
2. **Find Local Groups**: Meshmap.net shows active nodes
3. **Experiment**: Do range tests
4. **Build a Solar Node**: For permanent nodes

### Further Reading

- [Meshtastic Documentation](https://meshtastic.org/docs/)
- [Meshmap.net](https://meshmap.net) - World map of all nodes
- [GitHub](https://github.com/meshtastic) - Source code
- [Reddit r/meshtastic](https://reddit.com/r/meshtastic)
`,
    sl: `# Meshtastic Vodnik za začetek

## Kaj je Meshtastic?

Meshtastic je **odprtokodni projekt** za komunikacijo prek LoRa mrežnega omrežja.
Omogoča šifrirane sporočila na dolge razdalje brez interneta ali mobilnega omrežja.

### Glavne značilnosti

- **Doseg**: Do 10+ km (odvisno od terena)
- **Mrežno omrežje**: Sporočila se samodejno posredujejo
- **Šifriranje**: AES256 od konca do konca
- **Licenca ni potrebna**: Uporablja ISM pas (868 MHz v EU)
- **Odprta koda**: Vdelana programska oprema, aplikacije in načrti strojne opreme

### Za koga je Meshtastic primeren?

- **Navdušenci za aktivnosti na prostem**: Pohodniki, alpinisti, smučarji
- **Komunikacija v sili**: Komunikacija ob izpadu elektrike
- **Dogodki**: Festivali, sejmi, skupinske dejavnosti
- **Radioamaterji**: Eksperimentiranje z LoRa
- **Preživetje**: Komunikacija brez omrežja

---

## Pregled strojne opreme

### Vse podprte naprave

#### LILYGO (Priporočeno za začetnike)

| Naprava | Cena | GPS | Zaslon | Baterija | Priporočilo |
|---------|------|-----|--------|----------|-------------|
| **T-Beam v1.2** | ~35€ | ✅ | ❌ | 18650 | Vsestransko, zelo priljubljeno |
| **T-Echo** | ~60€ | ✅ | E-Paper | LiPo | Zelo varčno, za zunanjo uporabo |
| **T-Deck** | ~80€ | ✅ | TFT | LiPo | S tipkovnico, samostojno |
| **T-LoRa Pager** | ~50€ | ❌ | OLED | LiPo | Kompaktno z gumbi |
| **LoRa32 V2.1** | ~25€ | ❌ | OLED | ❌ | Ugodno, prijazno do DIY |

#### Heltec

| Naprava | Cena | GPS | Zaslon | Baterija | Priporočilo |
|---------|------|-----|--------|----------|-------------|
| **LoRa V3** | ~25€ | ❌ | OLED | ❌ | Ugodno, dobra vstopna točka |
| **Wireless Tracker** | ~30€ | ✅ | OLED | LiPo | GPS + kompaktno |
| **Wireless Stick Lite** | ~20€ | ❌ | ❌ | ❌ | Minimalno, ugodno |
| **Vision Master** | ~35€ | ❌ | E-Paper | LiPo | Varčno |
| **Mesh Node** | ~40€ | Neobvezno | Neobvezno | LiPo | Modularno |

#### RAKwireless

| Naprava | Cena | GPS | Zaslon | Baterija | Priporočilo |
|---------|------|-----|--------|----------|-------------|
| **WisBlock Starter Kit** | ~45€ | Neobvezno | Neobvezno | LiPo | Modularno, profesionalno |
| **WisBlock Meshtastic Kit** | ~60€ | ✅ | OLED | LiPo | Celoten paket |
| **WisMesh Repeater** | ~100€ | ✅ | ❌ | LiPo | IP67, pripravljeno na sončno energijo |
| **WisMesh Repeater Mini** | ~80€ | ✅ | ❌ | 3200mAh | Bolj kompaktno, sončno |

#### B&Q Consulting

| Naprava | Cena | GPS | Zaslon | Baterija | Priporočilo |
|---------|------|-----|--------|----------|-------------|
| **Station G2** | ~100€ | ❌ | ❌ | ❌ | Visoka moč za radioamaterje |
| **Nano G2 Ultra** | ~70€ | ✅ | OLED | LiPo | Kompaktno, robustno |

#### Seeed Studio

| Naprava | Cena | GPS | Zaslon | Baterija | Priporočilo |
|---------|------|-----|--------|----------|-------------|
| **SenseCAP T1000-E** | ~40€ | ✅ | ❌ | LiPo | Sledilnik v obliki kartice, IP65 |
| **SenseCAP Indicator** | ~80€ | ❌ | 4" na dotik | ❌ | Zaslon na dotik, nadzorna plošča |

#### Elecrow in drugi

| Naprava | Cena | GPS | Zaslon | Baterija | Priporočilo |
|---------|------|-----|--------|----------|-------------|
| **ThinkNode M1** | ~60€ | ✅ | OLED | LiPo | Robustno, za zunanjo uporabo |
| **muzi R1 Neo** | ~50€ | ✅ | OLED | LiPo | V slogu pozivnika |
| **Raspberry Pi Pico** | ~15€ | ❌ | ❌ | ❌ | DIY projekti |

### Priporočila za nakup strojne opreme

**Za začetnike**: LILYGO T-Beam v1.2
- Vgrajen GPS, držalo za 18650 baterijo
- Velika skupnost in veliko vodnikov
- Preizkušena, zanesljiva platforma

**Za mobilno uporabo**: LILYGO T-Echo ali T-Deck
- E-Paper/TFT zaslon, vgrajena baterija
- Samostojno delovanje brez pametnega telefona

**Za repetitor/prehod**: RAK WisMesh Repeater
- Odporen na vremenske vplive (IP67), pripravljen na sončno energijo
- Profesionalna kakovost

**Kje kupiti**:
- AliExpress (najcenejša možnost, 2-3 tedne dostave)
- Amazon (hitreje, dražje)
- Uradna trgovina LILYGO/RAK/Heltec
- Seeed Studio (za SenseCAP)
- Tindie (za B&Q Station G2)

---

## Nalaganje vdelane programske opreme

### Metoda 1: Spletni Flasher (Priporočeno)

1. Odprite **https://flasher.meshtastic.org** v brskalniku Chrome/Edge
2. Povežite napravo prek USB
3. Izberite svojo ploščo s seznama
4. Kliknite "Flash"
5. Končano v 2 minutah!

### Metoda 2: Python CLI

\`\`\`bash
# Namestite Meshtastic CLI
pip install meshtastic

# Naložite vdelano programsko opremo
meshtastic --flash
\`\`\`

### Metoda 3: ESPHome Flasher

Za napredne uporabnike z lastnimi prilagoditvami vdelane programske opreme.

---

## Začetna konfiguracija

### Prek aplikacije za pametni telefon

1. **Namestite aplikacijo**:
   - Android: [Google Play](https://play.google.com/store/apps/details?id=com.geeksville.mesh)
   - iOS: [App Store](https://apps.apple.com/app/meshtastic/id1586432531)

2. **Povezava prek Bluetooth**:
   - Vklopite napravo
   - V aplikaciji pritisnite "+"
   - Izberite napravo

3. **Osnovne nastavitve**:
   - **Regija**: EU_868 (za Evropo)
   - **Ime**: Vaše prikazno ime
   - **Prednastavitev**: LONG_FAST (privzeto) ali MEDIUM (več dosega)

### Pomembne nastavitve

| Nastavitev | Priporočilo | Razlaga |
|------------|-------------|---------|
| Regija | EU_868 | Obvezno v Evropi! |
| Modem prednastavitev | LONG_FAST | Dober kompromis |
| Omejitev skokov | 3 | Maks. posredovanj |
| GPS | Omogočeno | Za prikaz položaja |
| WiFi | Neobvezno | Za MQTT/Internet |

---

## Kanali in šifriranje

### Privzeti kanal

Meshtastic ima prednastavljeni kanal "LongFast".
**Vse naprave z enakimi nastavitvami lahko komunicirajo.**

### Ustvarjanje lastnih kanalov

1. V aplikaciji: Kanali → "+"
2. Dodelite ime
3. PSK (ključ) se samodejno ustvari
4. Delite QR kodo

### Deljenje kanalov

- **QR koda**: Drugi skenirajo vašo kodo
- **URL**: Delite povezavo do kanala
- **NFC**: Približajte naprave (če je podprto)

---

## Nasveti za radioamaterje

### Frekvence

- **ISM pas 868 MHz**: Licenca ni potrebna, 25 mW ERP
- **70cm radioamaterski pas (neobvezno)**: Z licenco je možna večja moč

### Integracija z radioamaterstvom

- **APRS prehod**: Meshtastic → APRS je mogoče
- **MQTT**: Premoščanje sporočil na internet
- **Podatki o položaju**: GPS sledenje v mreži

### Pravno v OE/DL

- ISM pas: Licenca ni potrebna
- Oddajna moč: Maks. 25 mW ERP (standard)
- Cikel delovanja: 1% (uveljavlja vdelana programska oprema)

---

## Naslednji koraki

1. **Pridružite se skupnosti**: [Discord](https://discord.gg/meshtastic)
2. **Poiščite lokalne skupine**: Meshmap.net prikazuje aktivne vozlišča
3. **Eksperimentirajte**: Naredite teste dosega
4. **Zgradite solarno vozlišče**: Za trajne vozlišča

### Nadaljnje branje

- [Meshtastic dokumentacija](https://meshtastic.org/docs/)
- [Meshmap.net](https://meshmap.net) - Svetovni zemljevid vseh vozlišč
- [GitHub](https://github.com/meshtastic) - Izvorna koda
- [Reddit r/meshtastic](https://reddit.com/r/meshtastic)
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'GETTING_STARTED.md',

  externalLinks: [
    {
      title: {
        de: 'Meshtastic Dokumentation',
        en: 'Meshtastic Docs',
        sl: 'Meshtastic dokumentacija',
      },
      url: 'https://meshtastic.org/docs/',
    },
    {
      title: {
        de: 'Web-Flasher',
        en: 'Web Flasher',
        sl: 'Spletni Flasher',
      },
      url: 'https://flasher.meshtastic.org',
    },
    {
      title: {
        de: 'Meshmap.net',
        en: 'Meshmap.net',
        sl: 'Meshmap.net',
      },
      url: 'https://meshmap.net',
    },
    {
      title: {
        de: 'Discord Community',
        en: 'Discord Community',
        sl: 'Discord skupnost',
      },
      url: 'https://discord.gg/meshtastic',
    },
    {
      title: {
        de: 'Android App',
        en: 'Android App',
        sl: 'Android aplikacija',
      },
      url: 'https://play.google.com/store/apps/details?id=com.geeksville.mesh',
    },
    {
      title: {
        de: 'iOS App',
        en: 'iOS App',
        sl: 'iOS aplikacija',
      },
      url: 'https://apps.apple.com/app/meshtastic/id1586432531',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Welches Board ist am besten für Portabelbetrieb?',
      en: 'Which board is best for portable operation?',
      sl: 'Katera plošča je najboljša za prenosno uporabo?',
    },
    {
      de: 'Wie erhöhe ich die Reichweite?',
      en: 'How do I increase the range?',
      sl: 'Kako povečam doseg?',
    },
    {
      de: 'Kann ich Meshtastic mit APRS verbinden?',
      en: 'Can I connect Meshtastic with APRS?',
      sl: 'Ali lahko povežem Meshtastic z APRS?',
    },
    {
      de: 'Wie baue ich einen Solar-Node?',
      en: 'How do I build a solar node?',
      sl: 'Kako zgradim solarno vozlišče?',
    },
    {
      de: 'Welche Antenne ist am besten?',
      en: 'Which antenna is best?',
      sl: 'Katera antena je najboljša?',
    },
  ],

  guideSections: [
    {
      id: 'intro',
      title: {
        de: 'Was ist Meshtastic?',
        en: 'What is Meshtastic?',
        sl: 'Kaj je Meshtastic?',
      },
      icon: '🌐',
      content: {
        de: 'Open-Source LoRa Mesh-Netzwerk für Off-Grid Kommunikation ohne Internet oder Mobilfunk.',
        en: 'Open-source LoRa mesh network for off-grid communication without internet or cellular networks.',
        sl: 'Odprtokodno LoRa mrežno omrežje za komunikacijo brez omrežja, interneta ali mobilnega omrežja.',
      },
    },
    {
      id: 'hardware',
      title: {
        de: 'Hardware-Auswahl',
        en: 'Hardware Selection',
        sl: 'Izbira strojne opreme',
      },
      icon: '🔧',
      content: {
        de: 'T-Beam, Heltec, RAK WisBlock - Vergleich und Kaufempfehlungen.',
        en: 'T-Beam, Heltec, RAK WisBlock - Comparison and buying recommendations.',
        sl: 'T-Beam, Heltec, RAK WisBlock - Primerjava in priporočila za nakup.',
      },
    },
    {
      id: 'setup',
      title: {
        de: 'Firmware & Setup',
        en: 'Firmware & Setup',
        sl: 'Vdelana programska oprema in nastavitev',
      },
      icon: '⚡',
      content: {
        de: 'Flashen via Web-Flasher, App-Kopplung und erste Konfiguration.',
        en: 'Flashing via web flasher, app pairing, and initial configuration.',
        sl: 'Nalaganje prek spletnega flasherja, povezovanje aplikacije in začetna konfiguracija.',
      },
    },
    {
      id: 'channels',
      title: {
        de: 'Kanäle & Sicherheit',
        en: 'Channels & Security',
        sl: 'Kanali in varnost',
      },
      icon: '🔐',
      content: {
        de: 'Verschlüsselung, eigene Kanäle erstellen und teilen.',
        en: 'Encryption, creating and sharing custom channels.',
        sl: 'Šifriranje, ustvarjanje in deljenje lastnih kanalov.',
      },
    },
    {
      id: 'tips',
      title: {
        de: 'Tipps für Funkamateure',
        en: 'Tips for Amateur Radio Operators',
        sl: 'Nasveti za radioamaterje',
      },
      icon: '📻',
      content: {
        de: 'Integration mit APRS, rechtliche Aspekte, fortgeschrittene Nutzung.',
        en: 'Integration with APRS, legal aspects, advanced usage.',
        sl: 'Integracija z APRS, pravni vidiki, napredna uporaba.',
      },
    },
  ],

  hardwareOptions: [
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
          sl: 'Vgrajen GPS',
        },
        {
          de: '18650 Akkuhalterung',
          en: '18650 battery holder',
          sl: 'Držalo za 18650 baterijo',
        },
        {
          de: 'Große Community',
          en: 'Large community',
          sl: 'Velika skupnost',
        },
        {
          de: 'Viele Tutorials',
          en: 'Many tutorials',
          sl: 'Veliko vodnikov',
        },
      ],
      recommended: true,
      buyLinks: [
        { store: 'LILYGO Store', url: 'https://lilygo.cc/' },
        { store: 'AliExpress', url: 'https://aliexpress.com/w/wholesale-lilygo-t-beam.html' },
      ],
    },
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
          en: 'Keyboard integrated',
          sl: 'Vgrajena tipkovnica',
        },
        {
          de: 'TFT Display',
          en: 'TFT display',
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
          en: 'Very efficient',
          sl: 'Zelo varčno',
        },
        {
          de: 'GPS',
          en: 'GPS',
          sl: 'GPS',
        },
        {
          de: 'Outdoor-tauglich',
          en: 'Outdoor-suitable',
          sl: 'Primerno za zunanjo uporabo',
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
          de: 'Günstig',
          en: 'Affordable',
          sl: 'Ugodno',
        },
        {
          de: 'Kompakt',
          en: 'Compact',
          sl: 'Kompaktno',
        },
        {
          de: 'OLED Display',
          en: 'OLED display',
          sl: 'OLED zaslon',
        },
        {
          de: 'USB-C',
          en: 'USB-C',
          sl: 'USB-C',
        },
      ],
      buyLinks: [
        { store: 'Heltec Store', url: 'https://heltec.org/' },
        { store: 'AliExpress', url: 'https://aliexpress.com/w/wholesale-heltec-lora-v3.html' },
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
          sl: 'Vgrajen GPS',
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
          de: 'Professionell',
          en: 'Professional',
          sl: 'Profesionalno',
        },
        {
          de: 'GPS Option',
          en: 'GPS option',
          sl: 'GPS opcija',
        },
        {
          de: 'Outdoor-tauglich',
          en: 'Outdoor-suitable',
          sl: 'Primerno za zunanjo uporabo',
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
          sl: 'IP67 odporno na vremenske vplive',
        },
        {
          de: 'Solar-ready',
          en: 'Solar-ready',
          sl: 'Pripravljeno na sončno energijo',
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
          en: 'For ham operators',
          sl: 'Za radioamaterje',
        },
        {
          de: 'Robustes Gehäuse',
          en: 'Robust housing',
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
    {
      name: {
        de: 'SenseCAP T1000-E',
        en: 'SenseCAP T1000-E',
        sl: 'SenseCAP T1000-E',
      },
      price: '~40€',
      features: [
        {
          de: 'Card Tracker',
          en: 'Card tracker',
          sl: 'Sledilnik v obliki kartice',
        },
        {
          de: 'IP65',
          en: 'IP65',
          sl: 'IP65',
        },
        {
          de: 'GPS',
          en: 'GPS',
          sl: 'GPS',
        },
        {
          de: 'Vorkonfiguriert',
          en: 'Pre-configured',
          sl: 'Predkonfigurirano',
        },
      ],
      buyLinks: [
        { store: 'Seeed Studio', url: 'https://www.seeedstudio.com/' },
      ],
    },
  ],
};
