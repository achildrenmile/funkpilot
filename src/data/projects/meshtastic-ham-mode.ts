import type { HamProject } from '../../types/projects';

export const meshtasticHamMode: HamProject = {
  id: 'meshtastic-ham-mode',
  name: {
    de: 'HAM-Modus aktivieren',
    en: 'Activate HAM Mode',
    sl: 'Aktivacija HAM nacina',
  },
  category: 'mesh-lora',
  difficulty: 1,
  description: {
    de: 'Meshtastic für lizenzierte Funkamateure: Mehr Sendeleistung, Rufzeichen-Anzeige und erweiterte Frequenzen.',
    en: 'Meshtastic for licensed amateur radio operators: Higher transmit power, callsign display and extended frequencies.',
    sl: 'Meshtastic za licencirane radioamaterje: Vecja oddajna moc, prikaz klicnega znaka in razsirjene frekvence.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: {
        de: 'LoRa-Board',
        en: 'LoRa Board',
        sl: 'LoRa plosca',
      },
      quantity: 1,
      notes: {
        de: 'T-Beam, Heltec, RAK etc.',
        en: 'T-Beam, Heltec, RAK etc.',
        sl: 'T-Beam, Heltec, RAK itd.',
      },
    },
    {
      name: {
        de: 'Amateurfunklizenz',
        en: 'Amateur Radio License',
        sl: 'Radioamaterska licenca',
      },
      quantity: 1,
      notes: {
        de: 'Gültige Lizenz erforderlich!',
        en: 'Valid license required!',
        sl: 'Potrebna veljavna licenca!',
      },
    },
  ],
  estimatedCost: '25-60 EUR',

  code: {
    de: `# HAM-Modus für Meshtastic

## Übersicht

Der **HAM-Modus** schaltet erweiterte Funktionen für lizenzierte
Funkamateure frei:

- Höhere Sendeleistung
- Rufzeichen-Anzeige (statt Node-ID)
- Verschlüsselung deaktivierbar
- Erweiterte Frequenzoptionen

**WICHTIG**: Nur für Inhaber einer gültigen Amateurfunklizenz!

---

## Vorteile HAM-Modus

### Mehr Sendeleistung

| Modus | Max. Leistung | Regelung |
|-------|--------------|----------|
| Standard (ISM) | 25 mW ERP | ETSI EN 300 220 |
| HAM 70cm | 25 W ERP | CEPT |
| HAM 23cm | 100 W ERP | National |

### Rufzeichen-Anzeige

- Statt "!abcd1234" → "OE8YML"
- Erfüllt Identifikationspflicht
- Professioneller Auftritt

### Keine Verschlüsselung

- Amateurfunk verbietet Verschlüsselung
- Klartext-Übertragung
- Transparenz für alle

---

## HAM-Modus aktivieren

### Methode 1: CLI (Empfohlen)

\`\`\`bash
# Lizenz-Nutzung aktivieren
meshtastic --set lora.override_duty_cycle true

# Rufzeichen als Node-Name setzen
meshtastic --set device.name "OE8YML"

# Sendeleistung erhöhen (in dBm)
# Vorsicht: Hardware-Limits beachten!
meshtastic --set lora.tx_power 27

# Verschlüsselung deaktivieren
meshtastic --ch-set psk none --ch-index 0
\`\`\`

### Methode 2: App

1. Einstellungen → LoRa
2. "Override Duty Cycle" aktivieren
3. TX Power erhöhen
4. Kanal → PSK auf "none"

### Methode 3: Web-Interface

1. Node im Browser öffnen (IP-Adresse)
2. Config → LoRa
3. Einstellungen anpassen

---

## Rechtliche Aspekte

### Was erlaubt ist

✅ Höhere Sendeleistung (bis 25W auf 70cm)
✅ Duty Cycle ignorieren (Dauerträger erlaubt)
✅ Unverschlüsselte Kommunikation
✅ Experimentelle Frequenzen

### Was erforderlich ist

⚠️ Gültige Amateurfunklizenz
⚠️ Rufzeichen-Identifikation
⚠️ Stationstagebuch (je nach Land)
⚠️ Klartext (keine Verschlüsselung)

### Was verboten bleibt

❌ Verschlüsselte Inhalte (auch mit Lizenz!)
❌ Kommerzielle Nutzung
❌ Weitergabe an Unlizenzierte
❌ Störungen verursachen

---

## Frequenzwahl

### ISM-Band (Standard)

\`\`\`
Frequenz: 868.0 - 868.6 MHz
Leistung: Max 25 mW ERP
Duty Cycle: 1%
Lizenz: Nicht erforderlich
\`\`\`

### 70cm Amateurfunkband

\`\`\`
Frequenz: 433.05 - 434.79 MHz (Region 1)
         430.0 - 440.0 MHz (allgemein)
Leistung: Max 25 W ERP (mit Lizenz)
Duty Cycle: Keiner
Lizenz: Erforderlich
\`\`\`

**Hinweis**: Für 70cm benötigst du 433 MHz Hardware!

### 23cm Amateurfunkband

\`\`\`
Frequenz: 1240 - 1300 MHz
Leistung: Bis 100 W ERP
Lizenz: Erforderlich
Hardware: Speziell (selten für Meshtastic)
\`\`\`

---

## Konfiguration für 70cm (433 MHz)

Wenn du ein 433 MHz Board hast:

\`\`\`bash
# Region für 433 MHz
meshtastic --set lora.region EU_433

# Sendeleistung (mit Lizenz)
meshtastic --set lora.tx_power 20

# Duty Cycle überschreiben
meshtastic --set lora.override_duty_cycle true

# Rufzeichen
meshtastic --set device.name "OE8YML"

# Verschlüsselung aus
meshtastic --ch-set psk none --ch-index 0
\`\`\`

---

## TX Power Einstellungen

### Typische Werte

| Board | Max TX Power | Empfehlung |
|-------|-------------|------------|
| Heltec V3 | 22 dBm | 20 dBm |
| T-Beam | 22 dBm | 20 dBm |
| RAK 4631 | 22 dBm | 20 dBm |
| Station G2 | 30 dBm | 27 dBm |

### Power in Watt

| dBm | mW | W |
|-----|-----|---|
| 10 | 10 | 0.01 |
| 14 | 25 | 0.025 |
| 20 | 100 | 0.1 |
| 27 | 500 | 0.5 |
| 30 | 1000 | 1.0 |

**WARNUNG**: Höhere Leistung = mehr Stromverbrauch, mehr Wärme!

---

## Rufzeichen-Identifikation

### Automatisch

Mit \`device.name = "OE8YML"\` wird dein Rufzeichen
bei jeder Nachricht mitgesendet.

### Manuell

Regelmäßig Rufzeichen senden:
- Alle 10 Minuten empfohlen
- Bei jedem QSO-Beginn/Ende

### Portable-Kennung

\`\`\`bash
# Portable-Betrieb
meshtastic --set device.name "OE8YML/P"

# Mobile
meshtastic --set device.name "OE8YML/M"
\`\`\`

---

## MeshCom: Native HAM-Unterstützung

MeshCom (vom ÖVSV) ist speziell für Funkamateure:

- Nutzt 70cm Band (433 MHz)
- Automatische APRS-Integration
- ÖVSV-Gateway-Infrastruktur
- Rufzeichen nativ unterstützt

**Siehe**: MeshCom Getting Started Guide

---

## Gemischter Betrieb

### Lizenzierte + Unlizenzierte

In einem Mesh mit gemischten Nutzern:

- **ISM-Band bleiben** (868 MHz)
- **Verschlüsselung AUS** für alle
- Lizenzierte können mit höherer Leistung senden
- Rufzeichen für alle empfohlen (auch ohne Lizenz legal)

### Separates HAM-Netzwerk

Für reinen Amateurfunk-Betrieb:

- 433 MHz Hardware
- Eigener Kanal mit PSK=none
- Nur Lizenzierte Teilnehmer
- Volle Leistung nutzbar

---

## Zusammenfassung

### HAM-Modus Checkliste

- [ ] Gültige Amateurfunklizenz
- [ ] Rufzeichen als device.name gesetzt
- [ ] override_duty_cycle aktiviert
- [ ] tx_power nach Bedarf erhöht
- [ ] Verschlüsselung deaktiviert (psk none)
- [ ] Richtige Region gewählt (EU_868 oder EU_433)

### Quick Setup (HAM auf 868 MHz)

\`\`\`bash
meshtastic --set device.name "DEINRUFZEICHEN"
meshtastic --set lora.override_duty_cycle true
meshtastic --set lora.tx_power 20
meshtastic --ch-set psk none --ch-index 0
\`\`\`

### Quick Setup (HAM auf 433 MHz)

\`\`\`bash
meshtastic --set device.name "DEINRUFZEICHEN"
meshtastic --set lora.region EU_433
meshtastic --set lora.override_duty_cycle true
meshtastic --set lora.tx_power 20
meshtastic --ch-set psk none --ch-index 0
\`\`\`

---

## FAQ

**Kann ich verschlüsselt senden?**
Nein, im Amateurfunk ist Verschlüsselung verboten.

**Brauche ich spezielle Hardware?**
Für 433 MHz ja, für 868 MHz dieselbe wie ISM.

**Können Unlizenzierte mitlesen?**
Ja, ohne Verschlüsselung kann jeder mitlesen.

**Ist Meshtastic legal für HAM?**
Ja, solange Identifikation und Klartext eingehalten werden.
`,
    en: `# HAM Mode for Meshtastic

## Overview

**HAM Mode** unlocks extended features for licensed
amateur radio operators:

- Higher transmit power
- Callsign display (instead of Node-ID)
- Encryption can be disabled
- Extended frequency options

**IMPORTANT**: Only for holders of a valid amateur radio license!

---

## HAM Mode Benefits

### Higher Transmit Power

| Mode | Max. Power | Regulation |
|------|-----------|------------|
| Standard (ISM) | 25 mW ERP | ETSI EN 300 220 |
| HAM 70cm | 25 W ERP | CEPT |
| HAM 23cm | 100 W ERP | National |

### Callsign Display

- Instead of "!abcd1234" → "OE8YML"
- Fulfills identification requirement
- Professional appearance

### No Encryption

- Amateur radio prohibits encryption
- Plain text transmission
- Transparency for everyone

---

## Activating HAM Mode

### Method 1: CLI (Recommended)

\`\`\`bash
# Enable license usage
meshtastic --set lora.override_duty_cycle true

# Set callsign as node name
meshtastic --set device.name "OE8YML"

# Increase transmit power (in dBm)
# Caution: Observe hardware limits!
meshtastic --set lora.tx_power 27

# Disable encryption
meshtastic --ch-set psk none --ch-index 0
\`\`\`

### Method 2: App

1. Settings → LoRa
2. Enable "Override Duty Cycle"
3. Increase TX Power
4. Channel → Set PSK to "none"

### Method 3: Web Interface

1. Open node in browser (IP address)
2. Config → LoRa
3. Adjust settings

---

## Legal Aspects

### What is Allowed

✅ Higher transmit power (up to 25W on 70cm)
✅ Ignore duty cycle (continuous carrier allowed)
✅ Unencrypted communication
✅ Experimental frequencies

### What is Required

⚠️ Valid amateur radio license
⚠️ Callsign identification
⚠️ Station logbook (depending on country)
⚠️ Plain text (no encryption)

### What Remains Prohibited

❌ Encrypted content (even with license!)
❌ Commercial use
❌ Sharing with unlicensed persons
❌ Causing interference

---

## Frequency Selection

### ISM Band (Standard)

\`\`\`
Frequency: 868.0 - 868.6 MHz
Power: Max 25 mW ERP
Duty Cycle: 1%
License: Not required
\`\`\`

### 70cm Amateur Radio Band

\`\`\`
Frequency: 433.05 - 434.79 MHz (Region 1)
          430.0 - 440.0 MHz (general)
Power: Max 25 W ERP (with license)
Duty Cycle: None
License: Required
\`\`\`

**Note**: For 70cm you need 433 MHz hardware!

### 23cm Amateur Radio Band

\`\`\`
Frequency: 1240 - 1300 MHz
Power: Up to 100 W ERP
License: Required
Hardware: Special (rare for Meshtastic)
\`\`\`

---

## Configuration for 70cm (433 MHz)

If you have a 433 MHz board:

\`\`\`bash
# Region for 433 MHz
meshtastic --set lora.region EU_433

# Transmit power (with license)
meshtastic --set lora.tx_power 20

# Override duty cycle
meshtastic --set lora.override_duty_cycle true

# Callsign
meshtastic --set device.name "OE8YML"

# Disable encryption
meshtastic --ch-set psk none --ch-index 0
\`\`\`

---

## TX Power Settings

### Typical Values

| Board | Max TX Power | Recommendation |
|-------|-------------|----------------|
| Heltec V3 | 22 dBm | 20 dBm |
| T-Beam | 22 dBm | 20 dBm |
| RAK 4631 | 22 dBm | 20 dBm |
| Station G2 | 30 dBm | 27 dBm |

### Power in Watts

| dBm | mW | W |
|-----|-----|---|
| 10 | 10 | 0.01 |
| 14 | 25 | 0.025 |
| 20 | 100 | 0.1 |
| 27 | 500 | 0.5 |
| 30 | 1000 | 1.0 |

**WARNING**: Higher power = more power consumption, more heat!

---

## Callsign Identification

### Automatic

With \`device.name = "OE8YML"\` your callsign
is transmitted with every message.

### Manual

Send callsign regularly:
- Every 10 minutes recommended
- At the beginning/end of each QSO

### Portable Designation

\`\`\`bash
# Portable operation
meshtastic --set device.name "OE8YML/P"

# Mobile
meshtastic --set device.name "OE8YML/M"
\`\`\`

---

## MeshCom: Native HAM Support

MeshCom (by OEVSV) is designed specifically for amateur radio operators:

- Uses 70cm band (433 MHz)
- Automatic APRS integration
- OEVSV gateway infrastructure
- Native callsign support

**See**: MeshCom Getting Started Guide

---

## Mixed Operation

### Licensed + Unlicensed

In a mesh with mixed users:

- **Stay on ISM band** (868 MHz)
- **Encryption OFF** for everyone
- Licensed operators can transmit with higher power
- Callsign recommended for everyone (legal even without license)

### Separate HAM Network

For pure amateur radio operation:

- 433 MHz hardware
- Own channel with PSK=none
- Only licensed participants
- Full power available

---

## Summary

### HAM Mode Checklist

- [ ] Valid amateur radio license
- [ ] Callsign set as device.name
- [ ] override_duty_cycle enabled
- [ ] tx_power increased as needed
- [ ] Encryption disabled (psk none)
- [ ] Correct region selected (EU_868 or EU_433)

### Quick Setup (HAM on 868 MHz)

\`\`\`bash
meshtastic --set device.name "YOURCALLSIGN"
meshtastic --set lora.override_duty_cycle true
meshtastic --set lora.tx_power 20
meshtastic --ch-set psk none --ch-index 0
\`\`\`

### Quick Setup (HAM on 433 MHz)

\`\`\`bash
meshtastic --set device.name "YOURCALLSIGN"
meshtastic --set lora.region EU_433
meshtastic --set lora.override_duty_cycle true
meshtastic --set lora.tx_power 20
meshtastic --ch-set psk none --ch-index 0
\`\`\`

---

## FAQ

**Can I transmit encrypted?**
No, encryption is prohibited in amateur radio.

**Do I need special hardware?**
For 433 MHz yes, for 868 MHz the same as ISM.

**Can unlicensed people read along?**
Yes, without encryption anyone can read along.

**Is Meshtastic legal for HAM?**
Yes, as long as identification and plain text are maintained.
`,
    sl: `# HAM nacin za Meshtastic

## Pregled

**HAM nacin** odklene razsirjene funkcije za licencirane
radioamaterje:

- Visja oddajna moc
- Prikaz klicnega znaka (namesto Node-ID)
- Sifriranje je mogoce onemogociti
- Razsirjene moznosti frekvenc

**POMEMBNO**: Samo za imetnike veljavne radioamaterske licence!

---

## Prednosti HAM nacina

### Visja oddajna moc

| Nacin | Max. moc | Predpis |
|-------|----------|---------|
| Standard (ISM) | 25 mW ERP | ETSI EN 300 220 |
| HAM 70cm | 25 W ERP | CEPT |
| HAM 23cm | 100 W ERP | Nacionalno |

### Prikaz klicnega znaka

- Namesto "!abcd1234" → "OE8YML"
- Izpolnjuje obveznost identifikacije
- Profesionalen videz

### Brez sifriranja

- Radioamaterstvo prepoveduje sifriranje
- Prenos v cistopisu
- Transparentnost za vse

---

## Aktivacija HAM nacina

### Metoda 1: CLI (Priporoceno)

\`\`\`bash
# Omogoci uporabo licence
meshtastic --set lora.override_duty_cycle true

# Nastavi klicni znak kot ime vozlisca
meshtastic --set device.name "OE8YML"

# Povecaj oddajno moc (v dBm)
# Pozor: Upostevaj omejitve strojne opreme!
meshtastic --set lora.tx_power 27

# Onemogoci sifriranje
meshtastic --ch-set psk none --ch-index 0
\`\`\`

### Metoda 2: Aplikacija

1. Nastavitve → LoRa
2. Omogoci "Override Duty Cycle"
3. Povecaj TX Power
4. Kanal → Nastavi PSK na "none"

### Metoda 3: Spletni vmesnik

1. Odpri vozlisce v brskalniku (IP naslov)
2. Config → LoRa
3. Prilagodi nastavitve

---

## Pravni vidiki

### Kaj je dovoljeno

✅ Visja oddajna moc (do 25W na 70cm)
✅ Ignoriranje duty cycle (dovoljen trajen nosilec)
✅ Nesifrirana komunikacija
✅ Eksperimentalne frekvence

### Kaj je zahtevano

⚠️ Veljavna radioamaterska licenca
⚠️ Identifikacija s klicnim znakom
⚠️ Dnevnik postaje (odvisno od drzave)
⚠️ Cistopis (brez sifriranja)

### Kaj ostaja prepovedano

❌ Sifrirana vsebina (tudi z licenco!)
❌ Komercialna uporaba
❌ Deljenje z nelicenciranimi osebami
❌ Povzrocanje motenj

---

## Izbira frekvence

### ISM pas (Standard)

\`\`\`
Frekvenca: 868.0 - 868.6 MHz
Moc: Max 25 mW ERP
Duty Cycle: 1%
Licenca: Ni potrebna
\`\`\`

### 70cm radioamaterski pas

\`\`\`
Frekvenca: 433.05 - 434.79 MHz (Regija 1)
           430.0 - 440.0 MHz (splosno)
Moc: Max 25 W ERP (z licenco)
Duty Cycle: Brez
Licenca: Potrebna
\`\`\`

**Opomba**: Za 70cm potrebujes 433 MHz strojno opremo!

### 23cm radioamaterski pas

\`\`\`
Frekvenca: 1240 - 1300 MHz
Moc: Do 100 W ERP
Licenca: Potrebna
Strojna oprema: Posebna (redka za Meshtastic)
\`\`\`

---

## Konfiguracija za 70cm (433 MHz)

Ce imas 433 MHz plosco:

\`\`\`bash
# Regija za 433 MHz
meshtastic --set lora.region EU_433

# Oddajna moc (z licenco)
meshtastic --set lora.tx_power 20

# Preglasi duty cycle
meshtastic --set lora.override_duty_cycle true

# Klicni znak
meshtastic --set device.name "OE8YML"

# Onemogoci sifriranje
meshtastic --ch-set psk none --ch-index 0
\`\`\`

---

## Nastavitve TX Power

### Tipicne vrednosti

| Plosca | Max TX Power | Priporocilo |
|--------|-------------|-------------|
| Heltec V3 | 22 dBm | 20 dBm |
| T-Beam | 22 dBm | 20 dBm |
| RAK 4631 | 22 dBm | 20 dBm |
| Station G2 | 30 dBm | 27 dBm |

### Moc v vatih

| dBm | mW | W |
|-----|-----|---|
| 10 | 10 | 0.01 |
| 14 | 25 | 0.025 |
| 20 | 100 | 0.1 |
| 27 | 500 | 0.5 |
| 30 | 1000 | 1.0 |

**OPOZORILO**: Visja moc = vecja poraba energije, vec toplote!

---

## Identifikacija s klicnim znakom

### Avtomatsko

Z \`device.name = "OE8YML"\` se tvoj klicni znak
poslje z vsakim sporocilom.

### Rocno

Redno posiljaj klicni znak:
- Vsakih 10 minut priporoceno
- Na zacetku/koncu vsakega QSO

### Prenosna oznaka

\`\`\`bash
# Prenosno delovanje
meshtastic --set device.name "OE8YML/P"

# Mobilno
meshtastic --set device.name "OE8YML/M"
\`\`\`

---

## MeshCom: Nativna HAM podpora

MeshCom (od OEVSV) je zasnovan posebej za radioamaterje:

- Uporablja 70cm pas (433 MHz)
- Avtomatska APRS integracija
- OEVSV infrastruktura prehodov
- Nativna podpora klicnih znakov

**Glej**: MeshCom Getting Started Guide

---

## Mesani nacin delovanja

### Licencirani + Nelicencirani

V mesh omrezju z mesanimi uporabniki:

- **Ostani na ISM pasu** (868 MHz)
- **Sifriranje IZKLOPLJENO** za vse
- Licencirani operaterji lahko oddajajo z visjo mocjo
- Klicni znak priporocen za vse (zakonito tudi brez licence)

### Loceno HAM omrezje

Za cisto radioamatersko delovanje:

- 433 MHz strojna oprema
- Lasten kanal s PSK=none
- Samo licencirani udelezenci
- Polna moc na voljo

---

## Povzetek

### HAM nacin kontrolni seznam

- [ ] Veljavna radioamaterska licenca
- [ ] Klicni znak nastavljen kot device.name
- [ ] override_duty_cycle omogocen
- [ ] tx_power povecana po potrebi
- [ ] Sifriranje onemogoceno (psk none)
- [ ] Pravilna regija izbrana (EU_868 ali EU_433)

### Hitra nastavitev (HAM na 868 MHz)

\`\`\`bash
meshtastic --set device.name "TVOJKLICNIZNAK"
meshtastic --set lora.override_duty_cycle true
meshtastic --set lora.tx_power 20
meshtastic --ch-set psk none --ch-index 0
\`\`\`

### Hitra nastavitev (HAM na 433 MHz)

\`\`\`bash
meshtastic --set device.name "TVOJKLICNIZNAK"
meshtastic --set lora.region EU_433
meshtastic --set lora.override_duty_cycle true
meshtastic --set lora.tx_power 20
meshtastic --ch-set psk none --ch-index 0
\`\`\`

---

## Pogosta vprasanja

**Ali lahko oddajam sifrirano?**
Ne, sifriranje je v radioamaterstvu prepovedano.

**Ali potrebujem posebno strojno opremo?**
Za 433 MHz da, za 868 MHz enako kot ISM.

**Ali lahko nelicencirani berejo?**
Da, brez sifriranja lahko vsak bere.

**Ali je Meshtastic zakonit za HAM?**
Da, dokler se vzdrzuje identifikacija in cistopis.
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'HAM_MODE_GUIDE.md',

  externalLinks: [
    {
      title: {
        de: 'Meshtastic HAM Docs',
        en: 'Meshtastic HAM Docs',
        sl: 'Meshtastic HAM dokumentacija',
      },
      url: 'https://meshtastic.org/docs/configuration/radio/lora/#ham-mode',
    },
    {
      title: {
        de: 'IARU Region 1 Bandplan',
        en: 'IARU Region 1 Band Plan',
        sl: 'IARU Regija 1 nacrt pasov',
      },
      url: 'https://www.iaru-r1.org/reference/band-plans/',
    },
    {
      title: {
        de: 'ÖVSV Bandplan',
        en: 'OEVSV Band Plan',
        sl: 'OEVSV nacrt pasov',
      },
      url: 'https://www.oevsv.at/funkbetrieb/bandplaene/',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Wie viel Sendeleistung ist erlaubt?',
      en: 'How much transmit power is allowed?',
      sl: 'Koliko oddajne moci je dovoljeno?',
    },
    {
      de: 'Muss ich die Verschlüsselung deaktivieren?',
      en: 'Do I have to disable encryption?',
      sl: 'Ali moram onemogociti sifriranje?',
    },
    {
      de: 'Kann ich auf 433 MHz senden?',
      en: 'Can I transmit on 433 MHz?',
      sl: 'Ali lahko oddajam na 433 MHz?',
    },
    {
      de: 'Was ist der Unterschied zu MeshCom?',
      en: 'What is the difference to MeshCom?',
      sl: 'Kakšna je razlika z MeshCom?',
    },
    {
      de: 'Wie identifiziere ich mich korrekt?',
      en: 'How do I identify myself correctly?',
      sl: 'Kako se pravilno identificiram?',
    },
  ],

  hardwareOptions: [
    {
      name: {
        de: 'LILYGO T-Beam v1.2 (868MHz)',
        en: 'LILYGO T-Beam v1.2 (868MHz)',
        sl: 'LILYGO T-Beam v1.2 (868MHz)',
      },
      price: '~35€',
      features: [
        {
          de: 'ISM + HAM möglich',
          en: 'ISM + HAM possible',
          sl: 'ISM + HAM mozno',
        },
        {
          de: 'GPS',
          en: 'GPS',
          sl: 'GPS',
        },
        {
          de: 'Höhere Leistung mit Lizenz',
          en: 'Higher power with license',
          sl: 'Visja moc z licenco',
        },
      ],
      recommended: true,
    },
    {
      name: {
        de: 'LILYGO T-Beam v1.2 (433MHz)',
        en: 'LILYGO T-Beam v1.2 (433MHz)',
        sl: 'LILYGO T-Beam v1.2 (433MHz)',
      },
      price: '~35€',
      features: [
        {
          de: 'Für 70cm Band',
          en: 'For 70cm band',
          sl: 'Za 70cm pas',
        },
        {
          de: 'GPS',
          en: 'GPS',
          sl: 'GPS',
        },
        {
          de: 'Volle HAM-Leistung',
          en: 'Full HAM power',
          sl: 'Polna HAM moc',
        },
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
          de: 'Bis 1W Ausgang',
          en: 'Up to 1W output',
          sl: 'Do 1W izhodne moci',
        },
        {
          de: 'Für High-Power HAM',
          en: 'For High-Power HAM',
          sl: 'Za visoko-mocni HAM',
        },
      ],
    },
  ],
};
