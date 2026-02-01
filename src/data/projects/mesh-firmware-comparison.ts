import type { HamProject } from '../../types/projects';

export const meshFirmwareComparison: HamProject = {
  id: 'mesh-firmware-comparison',
  name: {
    de: 'Meshtastic vs MeshCore vs MeshCom',
    en: 'Meshtastic vs MeshCore vs MeshCom',
    sl: 'Meshtastic vs MeshCore vs MeshCom',
  },
  category: 'mesh-lora',
  difficulty: 1,
  description: {
    de: 'Detaillierter Vergleich der drei wichtigsten LoRa-Mesh-Firmwares. Finde die richtige für deine Anwendung.',
    en: 'Detailed comparison of the three most important LoRa mesh firmwares. Find the right one for your application.',
    sl: 'Podrobna primerjava treh najpomembnejših vdelanih programov za LoRa-Mesh. Poiščite pravega za vašo uporabo.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: {
        de: 'LoRa-fähiges Board',
        en: 'LoRa-capable board',
        sl: 'Plošča z LoRa zmogljivostjo',
      },
      quantity: 1,
      notes: {
        de: 'T-Beam, Heltec, RAK, etc.',
        en: 'T-Beam, Heltec, RAK, etc.',
        sl: 'T-Beam, Heltec, RAK, itd.',
      },
    },
  ],
  estimatedCost: '25-60 EUR',

  code: {
    de: `# Meshtastic vs MeshCore vs MeshCom

## Übersicht

Drei Firmware-Optionen für LoRa-Mesh-Kommunikation:

| Aspekt | Meshtastic | MeshCore | MeshCom |
|--------|------------|----------|---------|
| **Fokus** | Allgemein | Power-User | Funkamateure |
| **Frequenz** | 868 MHz (EU) | 868 MHz (EU) | 433 MHz (70cm) |
| **Lizenz nötig** | Nein (ISM) | Nein (ISM) | Ja (Ham) |
| **Community** | Sehr groß | Wachsend | OE/DL fokussiert |

---

## Meshtastic

### Was ist Meshtastic?

Das **Original** und **meistverbreitete** LoRa-Mesh-Projekt.
Open Source, große Community, viele Geräte unterstützt.

### Vorteile

✅ **Größte Community** - Viele Nutzer, viel Support
✅ **Beste Dokumentation** - Umfangreiche Docs
✅ **Stabile Firmware** - Gut getestet
✅ **Viele Apps** - Android, iOS, Web, CLI
✅ **Keine Lizenz** - Läuft auf ISM 868 MHz
✅ **Verschlüsselung** - AES256 End-to-End
✅ **MQTT-Integration** - Internet-Bridge möglich

### Nachteile

❌ Konservativere Entwicklung (langsamer neue Features)
❌ Keine dedizierten Repeater-Rollen (bis vor kurzem)
❌ Manchmal überfüllte Kanäle in Städten

### Ideal für

- Einsteiger
- Outdoor/Wandern
- Off-Grid Kommunikation
- Notfunk ohne Lizenz
- Internationale Nutzung

### Links

- Web: https://meshtastic.org
- Flasher: https://flasher.meshtastic.org
- Discord: discord.gg/meshtastic

---

## MeshCore

### Was ist MeshCore?

Ein **leistungsstarker Fork** von Meshtastic mit erweiterten Features.
Entwickelt von Scott Powell (Ripple).

### Vorteile

✅ **Rooms** - Bessere Chatroom-Verwaltung
✅ **Repeater-Modus** - Dedizierte Relais-Funktion
✅ **Client-Management** - Sehen wer verbunden ist
✅ **Schnellere Updates** - Experimentelle Features früher
✅ **Erweiterte Routing-Optionen**
✅ **Companion App** - Eigenständige Android-App

### Nachteile

❌ Kleinere Community
❌ Weniger Dokumentation
❌ Experimenteller (mögliche Bugs)
❌ Nicht 100% Meshtastic-kompatibel

### Ideal für

- Power-User
- Netzwerk-Betreiber
- Wer erweiterte Features braucht
- Experimentierfreudige

### Links

- GitHub: github.com/ripplebiz/MeshCore
- Flasher: flasher.meshcore.co
- YouTube: @RippleWireless

---

## MeshCom

### Was ist MeshCom?

**Österreichisches Projekt** vom ÖVSV für Funkamateure.
Nutzt das 70cm Band (433 MHz) statt ISM.

### Vorteile

✅ **Mehr Sendeleistung** - Bis 500 mW (mit Lizenz)
✅ **70cm Band** - Weniger überlaufen als ISM
✅ **Lokale Community** - Aktiv in OE/DL
✅ **APRS-Integration** - Verbindung zum APRS-Netz
✅ **Ham-fokussierte Features**
✅ **Gateways vom ÖVSV** - Infrastruktur vorhanden

### Nachteile

❌ **Amateurfunklizenz erforderlich**
❌ Kleinere internationale Community
❌ Andere Frequenz (433 MHz Geräte nötig)
❌ Nicht kompatibel mit Meshtastic/MeshCore

### Ideal für

- Lizenzierte Funkamateure in OE/DL
- Wer mehr Leistung braucht
- APRS-Integration gewünscht
- Lokale OE/DL Community

### Links

- Wiki: wiki.oevsv.at/wiki/MeshCom
- Firmware: icssw.org/meshcom
- Karte: map.meshcom.at

---

## Entscheidungshilfe

### Habe ich eine Amateurfunklizenz?

**JA** → MeshCom (OE/DL) oder Meshtastic/MeshCore möglich
**NEIN** → Meshtastic oder MeshCore

### Wie experimentierfreudig bin ich?

**Stabil bevorzugt** → Meshtastic
**Neue Features wichtig** → MeshCore
**Ham-Community OE/DL** → MeshCom

### Mit wem will ich kommunizieren?

**Internationale Community** → Meshtastic (größte Verbreitung)
**Lokale OE/DL Funkamateure** → MeshCom
**Eigenes Netzwerk** → MeshCore oder Meshtastic

### Brauche ich mehr Reichweite/Leistung?

**Ja, und ich habe Lizenz** → MeshCom (500 mW möglich)
**Ja, ohne Lizenz** → Bessere Antenne, höherer Standort

---

## Kompatibilität

### Können verschiedene Firmwares kommunizieren?

| Von/Nach | Meshtastic | MeshCore | MeshCom |
|----------|------------|----------|---------|
| **Meshtastic** | ✅ Ja | ⚠️ Teilweise | ❌ Nein |
| **MeshCore** | ⚠️ Teilweise | ✅ Ja | ❌ Nein |
| **MeshCom** | ❌ Nein | ❌ Nein | ✅ Ja |

**Hinweis**: Meshtastic und MeshCore können im Basis-Modus kommunizieren,
erweiterte Features funktionieren nur innerhalb der gleichen Firmware.

MeshCom ist komplett inkompatibel (andere Frequenz, anderes Protokoll).

---

## Hardware-Anforderungen

Alle drei Firmwares unterstützen ähnliche Hardware:

| Hardware | Meshtastic | MeshCore | MeshCom |
|----------|------------|----------|---------|
| T-Beam | ✅ | ✅ | ✅ |
| T-Deck | ✅ | ✅ | ⚠️ |
| Heltec V3 | ✅ | ✅ | ✅ |
| RAK WisBlock | ✅ | ✅ | ✅ |
| Station G2 | ✅ | ✅ | ❓ |

**Wichtig für MeshCom**: 433 MHz Version des Boards nötig!

---

## Firmware wechseln

### Von Meshtastic zu MeshCore

1. Web-Flasher von MeshCore öffnen
2. Board anschließen
3. MeshCore flashen
4. Neu konfigurieren (Einstellungen gehen verloren!)

### Von Meshtastic zu MeshCom

1. Board muss 433 MHz Version sein!
2. MeshCom Firmware herunterladen
3. Mit ESPTool oder MeshCom Flasher flashen
4. Komplett neu konfigurieren

### Zurück zu Meshtastic

1. Meshtastic Web-Flasher
2. "Full Erase" vor dem Flashen empfohlen
3. Neu konfigurieren

---

## Empfehlung

### Für die meisten Nutzer: **Meshtastic**

- Größte Community
- Beste Dokumentation
- Stabilste Firmware
- Funktioniert international

### Für Power-User: **MeshCore**

- Erweiterte Features
- Bessere Repeater-Unterstützung
- Aktive Entwicklung

### Für OE/DL Funkamateure: **MeshCom**

- Lokale Community
- Mehr Sendeleistung
- APRS-Integration
- Infrastruktur vom ÖVSV

---

## Fazit

Es gibt keine "beste" Firmware - nur die richtige für deine Situation:

1. **Anfänger ohne Lizenz** → Meshtastic
2. **Experimentierfreudige** → MeshCore
3. **Lizenzierte in OE/DL** → MeshCom oder Meshtastic
4. **Internationale Nutzung** → Meshtastic
5. **Eigenes Netzwerk betreiben** → MeshCore

Probiere einfach aus! Die Firmware kann jederzeit gewechselt werden.
`,
    en: `# Meshtastic vs MeshCore vs MeshCom

## Overview

Three firmware options for LoRa mesh communication:

| Aspect | Meshtastic | MeshCore | MeshCom |
|--------|------------|----------|---------|
| **Focus** | General | Power users | Ham radio operators |
| **Frequency** | 868 MHz (EU) | 868 MHz (EU) | 433 MHz (70cm) |
| **License required** | No (ISM) | No (ISM) | Yes (Ham) |
| **Community** | Very large | Growing | OE/DL focused |

---

## Meshtastic

### What is Meshtastic?

The **original** and **most widespread** LoRa mesh project.
Open source, large community, many devices supported.

### Advantages

✅ **Largest community** - Many users, lots of support
✅ **Best documentation** - Comprehensive docs
✅ **Stable firmware** - Well tested
✅ **Many apps** - Android, iOS, Web, CLI
✅ **No license** - Runs on ISM 868 MHz
✅ **Encryption** - AES256 end-to-end
✅ **MQTT integration** - Internet bridge possible

### Disadvantages

❌ More conservative development (slower new features)
❌ No dedicated repeater roles (until recently)
❌ Sometimes crowded channels in cities

### Ideal for

- Beginners
- Outdoor/hiking
- Off-grid communication
- Emergency communication without license
- International use

### Links

- Web: https://meshtastic.org
- Flasher: https://flasher.meshtastic.org
- Discord: discord.gg/meshtastic

---

## MeshCore

### What is MeshCore?

A **powerful fork** of Meshtastic with extended features.
Developed by Scott Powell (Ripple).

### Advantages

✅ **Rooms** - Better chatroom management
✅ **Repeater mode** - Dedicated relay function
✅ **Client management** - See who is connected
✅ **Faster updates** - Experimental features earlier
✅ **Extended routing options**
✅ **Companion App** - Standalone Android app

### Disadvantages

❌ Smaller community
❌ Less documentation
❌ More experimental (possible bugs)
❌ Not 100% Meshtastic compatible

### Ideal for

- Power users
- Network operators
- Those who need extended features
- Experimenters

### Links

- GitHub: github.com/ripplebiz/MeshCore
- Flasher: flasher.meshcore.co
- YouTube: @RippleWireless

---

## MeshCom

### What is MeshCom?

**Austrian project** by ÖVSV for ham radio operators.
Uses the 70cm band (433 MHz) instead of ISM.

### Advantages

✅ **More transmit power** - Up to 500 mW (with license)
✅ **70cm band** - Less crowded than ISM
✅ **Local community** - Active in OE/DL
✅ **APRS integration** - Connection to APRS network
✅ **Ham-focused features**
✅ **Gateways from ÖVSV** - Infrastructure available

### Disadvantages

❌ **Amateur radio license required**
❌ Smaller international community
❌ Different frequency (433 MHz devices needed)
❌ Not compatible with Meshtastic/MeshCore

### Ideal for

- Licensed ham radio operators in OE/DL
- Those who need more power
- APRS integration desired
- Local OE/DL community

### Links

- Wiki: wiki.oevsv.at/wiki/MeshCom
- Firmware: icssw.org/meshcom
- Map: map.meshcom.at

---

## Decision Guide

### Do I have a ham radio license?

**YES** → MeshCom (OE/DL) or Meshtastic/MeshCore possible
**NO** → Meshtastic or MeshCore

### How experimental do I want to be?

**Prefer stability** → Meshtastic
**New features important** → MeshCore
**Ham community OE/DL** → MeshCom

### Who do I want to communicate with?

**International community** → Meshtastic (largest reach)
**Local OE/DL ham operators** → MeshCom
**Own network** → MeshCore or Meshtastic

### Do I need more range/power?

**Yes, and I have a license** → MeshCom (500 mW possible)
**Yes, without license** → Better antenna, higher location

---

## Compatibility

### Can different firmwares communicate?

| From/To | Meshtastic | MeshCore | MeshCom |
|---------|------------|----------|---------|
| **Meshtastic** | ✅ Yes | ⚠️ Partial | ❌ No |
| **MeshCore** | ⚠️ Partial | ✅ Yes | ❌ No |
| **MeshCom** | ❌ No | ❌ No | ✅ Yes |

**Note**: Meshtastic and MeshCore can communicate in basic mode,
extended features only work within the same firmware.

MeshCom is completely incompatible (different frequency, different protocol).

---

## Hardware Requirements

All three firmwares support similar hardware:

| Hardware | Meshtastic | MeshCore | MeshCom |
|----------|------------|----------|---------|
| T-Beam | ✅ | ✅ | ✅ |
| T-Deck | ✅ | ✅ | ⚠️ |
| Heltec V3 | ✅ | ✅ | ✅ |
| RAK WisBlock | ✅ | ✅ | ✅ |
| Station G2 | ✅ | ✅ | ❓ |

**Important for MeshCom**: 433 MHz version of the board required!

---

## Switching Firmware

### From Meshtastic to MeshCore

1. Open MeshCore web flasher
2. Connect board
3. Flash MeshCore
4. Reconfigure (settings will be lost!)

### From Meshtastic to MeshCom

1. Board must be 433 MHz version!
2. Download MeshCom firmware
3. Flash with ESPTool or MeshCom flasher
4. Completely reconfigure

### Back to Meshtastic

1. Meshtastic web flasher
2. "Full Erase" before flashing recommended
3. Reconfigure

---

## Recommendation

### For most users: **Meshtastic**

- Largest community
- Best documentation
- Most stable firmware
- Works internationally

### For power users: **MeshCore**

- Extended features
- Better repeater support
- Active development

### For OE/DL ham operators: **MeshCom**

- Local community
- More transmit power
- APRS integration
- Infrastructure from ÖVSV

---

## Conclusion

There is no "best" firmware - only the right one for your situation:

1. **Beginners without license** → Meshtastic
2. **Experimenters** → MeshCore
3. **Licensed operators in OE/DL** → MeshCom or Meshtastic
4. **International use** → Meshtastic
5. **Running your own network** → MeshCore

Just try it out! The firmware can be changed at any time.
`,
    sl: `# Meshtastic vs MeshCore vs MeshCom

## Pregled

Tri možnosti vdelane programske opreme za LoRa-Mesh komunikacijo:

| Vidik | Meshtastic | MeshCore | MeshCom |
|-------|------------|----------|---------|
| **Fokus** | Splošno | Napredni uporabniki | Radioamaterji |
| **Frekvenca** | 868 MHz (EU) | 868 MHz (EU) | 433 MHz (70cm) |
| **Potrebna licenca** | Ne (ISM) | Ne (ISM) | Da (Ham) |
| **Skupnost** | Zelo velika | Rastoča | Osredotočena na OE/DL |

---

## Meshtastic

### Kaj je Meshtastic?

**Originalni** in **najbolj razširjen** LoRa-Mesh projekt.
Odprtokoden, velika skupnost, podprtih je veliko naprav.

### Prednosti

✅ **Največja skupnost** - Veliko uporabnikov, veliko podpore
✅ **Najboljša dokumentacija** - Obsežni dokumenti
✅ **Stabilna vdelana programska oprema** - Dobro preizkušena
✅ **Veliko aplikacij** - Android, iOS, Web, CLI
✅ **Brez licence** - Deluje na ISM 868 MHz
✅ **Šifriranje** - AES256 od konca do konca
✅ **MQTT integracija** - Internetni most možen

### Slabosti

❌ Bolj konzervativni razvoj (počasnejše nove funkcije)
❌ Brez namenskih vlog za repetitorje (do nedavnega)
❌ Včasih prenatrpani kanali v mestih

### Idealno za

- Začetnike
- Aktivnosti na prostem/pohodništvo
- Komunikacijo brez omrežja
- Zasilno komunikacijo brez licence
- Mednarodno uporabo

### Povezave

- Splet: https://meshtastic.org
- Flasher: https://flasher.meshtastic.org
- Discord: discord.gg/meshtastic

---

## MeshCore

### Kaj je MeshCore?

**Zmogljiv fork** Meshtastica z razširjenimi funkcijami.
Razvil ga je Scott Powell (Ripple).

### Prednosti

✅ **Sobe** - Boljše upravljanje klepetalnic
✅ **Način repetitorja** - Namenska funkcija releja
✅ **Upravljanje odjemalcev** - Vidite, kdo je povezan
✅ **Hitrejše posodobitve** - Eksperimentalne funkcije prej
✅ **Razširjene možnosti usmerjanja**
✅ **Spremljevalna aplikacija** - Samostojna Android aplikacija

### Slabosti

❌ Manjša skupnost
❌ Manj dokumentacije
❌ Bolj eksperimentalno (možne napake)
❌ Ni 100% združljivo z Meshtastic

### Idealno za

- Napredne uporabnike
- Operaterje omrežij
- Tiste, ki potrebujejo razširjene funkcije
- Eksperimentatorje

### Povezave

- GitHub: github.com/ripplebiz/MeshCore
- Flasher: flasher.meshcore.co
- YouTube: @RippleWireless

---

## MeshCom

### Kaj je MeshCom?

**Avstrijski projekt** ÖVSV za radioamaterje.
Uporablja 70cm pas (433 MHz) namesto ISM.

### Prednosti

✅ **Večja oddajna moč** - Do 500 mW (z licenco)
✅ **70cm pas** - Manj zaseden kot ISM
✅ **Lokalna skupnost** - Aktivna v OE/DL
✅ **APRS integracija** - Povezava z APRS omrežjem
✅ **Funkcije osredotočene na radioamaterje**
✅ **Prehodi od ÖVSV** - Infrastruktura na voljo

### Slabosti

❌ **Zahtevana radioamaterska licenca**
❌ Manjša mednarodna skupnost
❌ Drugačna frekvenca (potrebne 433 MHz naprave)
❌ Ni združljivo z Meshtastic/MeshCore

### Idealno za

- Licencirane radioamaterje v OE/DL
- Tiste, ki potrebujejo več moči
- Želeno APRS integracijo
- Lokalno OE/DL skupnost

### Povezave

- Wiki: wiki.oevsv.at/wiki/MeshCom
- Vdelana programska oprema: icssw.org/meshcom
- Zemljevid: map.meshcom.at

---

## Vodnik za odločanje

### Ali imam radioamatersko licenco?

**DA** → MeshCom (OE/DL) ali Meshtastic/MeshCore možno
**NE** → Meshtastic ali MeshCore

### Kako eksperimentalen želim biti?

**Raje stabilnost** → Meshtastic
**Nove funkcije pomembne** → MeshCore
**Ham skupnost OE/DL** → MeshCom

### S kom želim komunicirati?

**Mednarodna skupnost** → Meshtastic (največji doseg)
**Lokalni OE/DL radioamaterji** → MeshCom
**Lastno omrežje** → MeshCore ali Meshtastic

### Ali potrebujem večji doseg/moč?

**Da, in imam licenco** → MeshCom (500 mW možno)
**Da, brez licence** → Boljša antena, višja lokacija

---

## Združljivost

### Ali lahko različne vdelane programske opreme komunicirajo?

| Od/Do | Meshtastic | MeshCore | MeshCom |
|-------|------------|----------|---------|
| **Meshtastic** | ✅ Da | ⚠️ Delno | ❌ Ne |
| **MeshCore** | ⚠️ Delno | ✅ Da | ❌ Ne |
| **MeshCom** | ❌ Ne | ❌ Ne | ✅ Da |

**Opomba**: Meshtastic in MeshCore lahko komunicirata v osnovnem načinu,
razširjene funkcije delujejo samo znotraj iste vdelane programske opreme.

MeshCom je popolnoma nezdružljiv (drugačna frekvenca, drugačen protokol).

---

## Zahteve za strojno opremo

Vse tri vdelane programske opreme podpirajo podobno strojno opremo:

| Strojna oprema | Meshtastic | MeshCore | MeshCom |
|----------------|------------|----------|---------|
| T-Beam | ✅ | ✅ | ✅ |
| T-Deck | ✅ | ✅ | ⚠️ |
| Heltec V3 | ✅ | ✅ | ✅ |
| RAK WisBlock | ✅ | ✅ | ✅ |
| Station G2 | ✅ | ✅ | ❓ |

**Pomembno za MeshCom**: Potrebna je 433 MHz verzija plošče!

---

## Zamenjava vdelane programske opreme

### Od Meshtastic do MeshCore

1. Odprite MeshCore spletni flasher
2. Povežite ploščo
3. Namestite MeshCore
4. Ponovno konfigurirajte (nastavitve bodo izgubljene!)

### Od Meshtastic do MeshCom

1. Plošča mora biti 433 MHz verzija!
2. Prenesite MeshCom vdelano programsko opremo
3. Namestite z ESPTool ali MeshCom flasherjem
4. Popolnoma ponovno konfigurirajte

### Nazaj na Meshtastic

1. Meshtastic spletni flasher
2. Priporočen "Full Erase" pred namestitvijo
3. Ponovno konfigurirajte

---

## Priporočilo

### Za večino uporabnikov: **Meshtastic**

- Največja skupnost
- Najboljša dokumentacija
- Najbolj stabilna vdelana programska oprema
- Deluje mednarodno

### Za napredne uporabnike: **MeshCore**

- Razširjene funkcije
- Boljša podpora za repetitorje
- Aktiven razvoj

### Za OE/DL radioamaterje: **MeshCom**

- Lokalna skupnost
- Večja oddajna moč
- APRS integracija
- Infrastruktura od ÖVSV

---

## Zaključek

Ni "najboljše" vdelane programske opreme - le prava za vašo situacijo:

1. **Začetniki brez licence** → Meshtastic
2. **Eksperimentatorji** → MeshCore
3. **Licencirani v OE/DL** → MeshCom ali Meshtastic
4. **Mednarodna uporaba** → Meshtastic
5. **Upravljanje lastnega omrežja** → MeshCore

Preprosto preizkusite! Vdelano programsko opremo lahko kadarkoli zamenjate.
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'FIRMWARE_COMPARISON.md',

  externalLinks: [
    {
      title: {
        de: 'Meshtastic',
        en: 'Meshtastic',
        sl: 'Meshtastic',
      },
      url: 'https://meshtastic.org/',
    },
    {
      title: {
        de: 'MeshCore',
        en: 'MeshCore',
        sl: 'MeshCore',
      },
      url: 'https://github.com/ripplebiz/MeshCore',
    },
    {
      title: {
        de: 'MeshCom (ÖVSV)',
        en: 'MeshCom (ÖVSV)',
        sl: 'MeshCom (ÖVSV)',
      },
      url: 'https://wiki.oevsv.at/wiki/MeshCom',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Welche Firmware für meine Situation?',
      en: 'Which firmware for my situation?',
      sl: 'Katera vdelana programska oprema za mojo situacijo?',
    },
    {
      de: 'Kann ich zwischen Firmwares wechseln?',
      en: 'Can I switch between firmwares?',
      sl: 'Ali lahko preklapljam med vdelanimi programskimi opremami?',
    },
    {
      de: 'Sind Meshtastic und MeshCore kompatibel?',
      en: 'Are Meshtastic and MeshCore compatible?',
      sl: 'Ali sta Meshtastic in MeshCore združljiva?',
    },
    {
      de: 'Brauche ich eine Amateurfunklizenz?',
      en: 'Do I need a ham radio license?',
      sl: 'Ali potrebujem radioamatersko licenco?',
    },
    {
      de: 'Welche Hardware für welche Firmware?',
      en: 'Which hardware for which firmware?',
      sl: 'Katera strojna oprema za katero vdelano programsko opremo?',
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
          de: 'Meshtastic & MeshCore',
          en: 'Meshtastic & MeshCore',
          sl: 'Meshtastic & MeshCore',
        },
        {
          de: 'GPS',
          en: 'GPS',
          sl: 'GPS',
        },
        {
          de: 'Sehr beliebt',
          en: 'Very popular',
          sl: 'Zelo priljubljen',
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
          de: 'MeshCom (70cm)',
          en: 'MeshCom (70cm)',
          sl: 'MeshCom (70cm)',
        },
        {
          de: 'GPS',
          en: 'GPS',
          sl: 'GPS',
        },
        {
          de: 'Für Funkamateure',
          en: 'For ham radio operators',
          sl: 'Za radioamaterje',
        },
      ],
    },
    {
      name: {
        de: 'Heltec LoRa V3 (868MHz)',
        en: 'Heltec LoRa V3 (868MHz)',
        sl: 'Heltec LoRa V3 (868MHz)',
      },
      price: '~25€',
      features: [
        {
          de: 'Alle Firmwares',
          en: 'All firmwares',
          sl: 'Vse vdelane programske opreme',
        },
        {
          de: 'Günstig',
          en: 'Affordable',
          sl: 'Ugodno',
        },
        {
          de: 'Kompakt',
          en: 'Compact',
          sl: 'Kompakten',
        },
      ],
    },
  ],
};
