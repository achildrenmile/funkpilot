import type { HamProject } from '../../types/projects';

export const loraOutdoorEnclosure: HamProject = {
  id: 'lora-outdoor-enclosure',
  name: {
    de: 'Wetterfestes LoRa-Gehäuse',
    en: 'Weatherproof LoRa Enclosure',
    sl: 'Vremensko odporno LoRa ohišje',
  },
  category: 'mesh-lora',
  difficulty: 1,
  description: {
    de: 'IP67 Outdoor-Gehäuse für T-Beam, Heltec oder RAK Boards. Wetterfest für permanente Außenmontage.',
    en: 'IP67 outdoor enclosure for T-Beam, Heltec or RAK boards. Weatherproof for permanent outdoor installation.',
    sl: 'IP67 zunanje ohišje za T-Beam, Heltec ali RAK plošče. Vremensko odporno za trajno zunanjo montažo.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: {
        de: 'IP67 Kunststoffgehäuse',
        en: 'IP67 Plastic Enclosure',
        sl: 'IP67 plastično ohišje',
      },
      quantity: 1,
      notes: {
        de: '100x68x50mm oder 150x110x70mm',
        en: '100x68x50mm or 150x110x70mm',
        sl: '100x68x50mm ali 150x110x70mm',
      },
    },
    {
      name: {
        de: 'Kabelverschraubung PG7',
        en: 'Cable Gland PG7',
        sl: 'Kabelska uvodnica PG7',
      },
      quantity: 2,
      notes: {
        de: 'Für USB-Kabel und Antennenkabel',
        en: 'For USB cable and antenna cable',
        sl: 'Za USB kabel in antenski kabel',
      },
    },
    {
      name: {
        de: 'Kabelverschraubung PG9',
        en: 'Cable Gland PG9',
        sl: 'Kabelska uvodnica PG9',
      },
      quantity: 1,
      notes: {
        de: 'Optional für dickere Kabel',
        en: 'Optional for thicker cables',
        sl: 'Opcijsko za debelejše kable',
      },
    },
    {
      name: {
        de: 'SMA Einbaubuchse',
        en: 'SMA Panel Mount Connector',
        sl: 'SMA vgradna vtičnica',
      },
      quantity: 1,
      notes: {
        de: 'Wasserdichte Version empfohlen',
        en: 'Waterproof version recommended',
        sl: 'Priporočena vodoodporna različica',
      },
    },
    {
      name: {
        de: 'Entlüftungsventil M12',
        en: 'Vent Valve M12',
        sl: 'Odzračevalni ventil M12',
      },
      quantity: 1,
      notes: {
        de: 'Gore-Tex Membran gegen Kondenswasser',
        en: 'Gore-Tex membrane against condensation',
        sl: 'Gore-Tex membrana proti kondenzaciji',
      },
    },
    {
      name: {
        de: 'Silikondichtmasse',
        en: 'Silicone Sealant',
        sl: 'Silikonska tesnilna masa',
      },
      quantity: 1,
      notes: {
        de: 'Transparent, witterungsbeständig',
        en: 'Transparent, weather resistant',
        sl: 'Prozorna, odporna na vremenske vplive',
      },
    },
    {
      name: {
        de: 'Kabelbinder',
        en: 'Cable Ties',
        sl: 'Kabelske vezice',
      },
      quantity: 1,
      notes: {
        de: 'Für interne Befestigung',
        en: 'For internal mounting',
        sl: 'Za notranjo pritrditev',
      },
    },
    {
      name: {
        de: 'Schaumstoff-Klebepad',
        en: 'Foam Adhesive Pad',
        sl: 'Penasta lepilna podloga',
      },
      quantity: 1,
      notes: {
        de: 'Zur Board-Befestigung',
        en: 'For board mounting',
        sl: 'Za pritrditev plošče',
      },
    },
    {
      name: {
        de: 'Schrumpfschlauch',
        en: 'Heat Shrink Tubing',
        sl: 'Skrčljiva cev',
      },
      quantity: 1,
      notes: {
        de: 'Für Kabelenden',
        en: 'For cable ends',
        sl: 'Za konce kablov',
      },
    },
  ],
  estimatedCost: '15-25 EUR',

  code: {
    de: `# Wetterfestes LoRa-Gehäuse bauen

## Übersicht

Ein wetterfestes Gehäuse ist essentiell für Outdoor-Installationen.
Dieses Projekt zeigt, wie du ein günstiges IP67-Gehäuse für
Meshtastic/MeshCore/MeshCom Nodes vorbereitest.

---

## Materialien im Detail

### Gehäuse

| Größe | Geeignet für | Preis |
|-------|--------------|-------|
| 100x68x50mm | Heltec, RAK | ~5€ |
| 150x110x70mm | T-Beam + Akku | ~8€ |
| 200x120x75mm | Mit Solar-Laderegler | ~12€ |

**Tipp**: Auf IP67 achten (staubdicht, wasserdicht bei zeitweiligem Untertauchen).

### Kabelverschraubungen

- **PG7**: Für Kabel 3-6.5mm (USB, dünne Antennenkabel)
- **PG9**: Für Kabel 4-8mm (dickere Kabel)
- **PG11**: Für Kabel 5-10mm (Koax RG58)

**Wichtig**: Immer mit Gummidichtung!

### SMA-Einbaubuchse

- Standard SMA-Buchse reicht für die meisten Fälle
- Wasserdichte Version für extreme Bedingungen
- Alternativ: N-Buchse für bessere HF-Eigenschaften

---

## Schritt-für-Schritt Anleitung

### 1. Bohrungen planen

\`\`\`
┌─────────────────────────────────┐
│                                 │
│    ○ Entlüftung (M12)           │
│                                 │
│                                 │
│              ┌─────┐            │
│              │Board│            │
│              └─────┘            │
│                                 │
│ ○ USB (PG7)       ○ SMA (Ant)   │
└─────────────────────────────────┘
    Unterseite
\`\`\`

**Bohrungen:**
- USB-Kabel: 12mm (für PG7)
- Antenne: 6.5mm (für SMA) oder 12mm (für PG7)
- Entlüftung: 12mm (für M12 Ventil)

### 2. Löcher bohren

1. Position anzeichnen (von innen messen)
2. Ankörnen für präzises Bohren
3. Stufenbohrer verwenden (saubere Löcher in Kunststoff)
4. Grate mit Messer oder Feile entfernen

### 3. Verschraubungen einsetzen

1. Gummidichtung auf Verschraubung
2. Von außen durchstecken
3. Mutter von innen festziehen
4. Mit Silikon nachversiegeln

### 4. SMA-Buchse montieren

1. Loch bohren (meist 6.5mm)
2. Buchse von außen einsetzen
3. Mutter von innen festziehen
4. Mit Silikonband oder Dichtmasse abdichten

### 5. Entlüftungsventil

**Warum wichtig?**
- Temperaturwechsel erzeugt Druckunterschied
- Ohne Ventil: Feuchtigkeit wird eingesaugt
- Gore-Tex Membran: Luft raus, Wasser nicht rein

**Einbau:**
- Loch bohren (M12)
- Ventil einschrauben
- An höchster Stelle des Gehäuses

### 6. Board befestigen

Optionen:
1. **Schaumstoff-Klebepad**: Einfach, dämpft Vibrationen
2. **Abstandshalter**: Professioneller, schraubbar
3. **Kabelbinder + Bohrungen**: Günstig, stabil

### 7. Verkabelung

\`\`\`
Außen:                    Innen:
  │                         │
  │ USB-Kabel ────────────> Board
  │ (durch PG7)             │
  │                         │
  │ Antennenkabel ───────> SMA Pigtail ──> Board
  │ (durch SMA-Buchse)      │
  │                         │
  │ Solarkabel ───────────> TP4056 ──> Board
  │ (durch PG7)             (optional)
\`\`\`

### 8. Abdichten

**Kritische Stellen:**
- Kabelverschraubungen: Silikon um Gewinde
- SMA-Buchse: Silikonband oder Dichtmasse
- Deckel: Originaldichtung prüfen

**Test:** Gehäuse schließen und kurz unter Wasser halten.

---

## Montage-Tipps

### Standort

- **Höhe**: Je höher, desto besser (Reichweite)
- **Schatten**: Gehäuse nicht in praller Sonne (Überhitzung)
- **Ausrichtung**: Antenne vertikal, Entlüftung oben

### Befestigung

| Methode | Vorteile | Nachteile |
|---------|----------|-----------|
| Rohrschelle | Stabil, Mastmontage | Spezielle Größe |
| Kabelbinder | Günstig, flexibel | UV-beständige nehmen |
| Schrauben | Permanent | Bohrungen nötig |
| Magnetfuß | Keine Bohren | Nur auf Metall |

### Kabelführung

- Kabel nach unten führen (Wasserlauf)
- Tropfschlaufe vor Gehäuse
- Keine scharfen Knicke im Koaxkabel

---

## Häufige Fehler

1. **Falsche Dichtung**: Normale Silikondichtung statt IP67-Gehäuse
2. **Kein Entlüftungsventil**: Kondenswasser zerstört Elektronik
3. **Antenne im Gehäuse**: Stark reduzierte Reichweite
4. **Gehäuse zu klein**: Kein Platz für Akku
5. **Billige Kabelverschraubungen**: Dichtung versagt

---

## Material-Bezugsquellen

- Amazon: IP67 Gehäuse, Kabelverschraubungen
- Conrad/Reichelt: Elektronik-Gehäuse, SMA-Buchsen
- Baumarkt: Silikon, Schrumpfschlauch
- AliExpress: Günstige Gehäuse (längere Lieferzeit)

---

## Checkliste vor Verschließen

- [ ] Board mit Firmware geflasht und konfiguriert
- [ ] Alle Kabel angeschlossen
- [ ] Antenne angeschlossen (NIE ohne Antenne senden!)
- [ ] Akku geladen (falls vorhanden)
- [ ] Alle Verschraubungen fest
- [ ] Dichtungen sitzen korrekt
- [ ] Entlüftungsventil eingebaut
- [ ] Deckel-Dichtung sauber
`,
    en: `# Building a Weatherproof LoRa Enclosure

## Overview

A weatherproof enclosure is essential for outdoor installations.
This project shows you how to prepare an affordable IP67 enclosure for
Meshtastic/MeshCore/MeshCom nodes.

---

## Materials in Detail

### Enclosure

| Size | Suitable for | Price |
|------|--------------|-------|
| 100x68x50mm | Heltec, RAK | ~5€ |
| 150x110x70mm | T-Beam + Battery | ~8€ |
| 200x120x75mm | With Solar Charger | ~12€ |

**Tip**: Look for IP67 rating (dustproof, waterproof when temporarily submerged).

### Cable Glands

- **PG7**: For cables 3-6.5mm (USB, thin antenna cables)
- **PG9**: For cables 4-8mm (thicker cables)
- **PG11**: For cables 5-10mm (Coax RG58)

**Important**: Always use with rubber seal!

### SMA Panel Mount

- Standard SMA connector is sufficient for most cases
- Waterproof version for extreme conditions
- Alternative: N-connector for better RF characteristics

---

## Step-by-Step Instructions

### 1. Plan the Holes

\`\`\`
┌─────────────────────────────────┐
│                                 │
│    ○ Vent (M12)                 │
│                                 │
│                                 │
│              ┌─────┐            │
│              │Board│            │
│              └─────┘            │
│                                 │
│ ○ USB (PG7)       ○ SMA (Ant)   │
└─────────────────────────────────┘
    Bottom Side
\`\`\`

**Hole Sizes:**
- USB cable: 12mm (for PG7)
- Antenna: 6.5mm (for SMA) or 12mm (for PG7)
- Vent: 12mm (for M12 valve)

### 2. Drill the Holes

1. Mark positions (measure from inside)
2. Center punch for precise drilling
3. Use step drill bit (clean holes in plastic)
4. Remove burrs with knife or file

### 3. Install Cable Glands

1. Place rubber seal on gland
2. Insert from outside
3. Tighten nut from inside
4. Seal with silicone

### 4. Mount SMA Connector

1. Drill hole (usually 6.5mm)
2. Insert connector from outside
3. Tighten nut from inside
4. Seal with silicone tape or sealant

### 5. Vent Valve

**Why is it important?**
- Temperature changes create pressure differences
- Without valve: moisture is sucked in
- Gore-Tex membrane: air out, water stays out

**Installation:**
- Drill hole (M12)
- Screw in valve
- Place at highest point of enclosure

### 6. Mount the Board

Options:
1. **Foam adhesive pad**: Simple, dampens vibrations
2. **Standoffs**: More professional, screwable
3. **Cable ties + holes**: Cheap, stable

### 7. Wiring

\`\`\`
Outside:                  Inside:
  │                         │
  │ USB cable ────────────> Board
  │ (through PG7)           │
  │                         │
  │ Antenna cable ────────> SMA Pigtail ──> Board
  │ (through SMA mount)     │
  │                         │
  │ Solar cable ──────────> TP4056 ──> Board
  │ (through PG7)           (optional)
\`\`\`

### 8. Sealing

**Critical Points:**
- Cable glands: Silicone around threads
- SMA connector: Silicone tape or sealant
- Lid: Check original gasket

**Test:** Close enclosure and briefly submerge in water.

---

## Installation Tips

### Location

- **Height**: Higher is better (range)
- **Shade**: Keep enclosure out of direct sunlight (overheating)
- **Orientation**: Antenna vertical, vent at top

### Mounting

| Method | Advantages | Disadvantages |
|--------|------------|---------------|
| Pipe clamp | Stable, mast mounting | Specific size needed |
| Cable ties | Cheap, flexible | Use UV-resistant ones |
| Screws | Permanent | Drilling required |
| Magnetic base | No drilling | Metal surfaces only |

### Cable Routing

- Route cables downward (water runoff)
- Drip loop before enclosure
- No sharp bends in coax cable

---

## Common Mistakes

1. **Wrong sealing**: Regular silicone instead of IP67 enclosure
2. **No vent valve**: Condensation destroys electronics
3. **Antenna inside enclosure**: Greatly reduced range
4. **Enclosure too small**: No room for battery
5. **Cheap cable glands**: Seal fails

---

## Material Sources

- Amazon: IP67 enclosures, cable glands
- Conrad/Reichelt: Electronics enclosures, SMA connectors
- Hardware store: Silicone, heat shrink tubing
- AliExpress: Budget enclosures (longer delivery time)

---

## Checklist Before Closing

- [ ] Board flashed with firmware and configured
- [ ] All cables connected
- [ ] Antenna connected (NEVER transmit without antenna!)
- [ ] Battery charged (if applicable)
- [ ] All glands tightened
- [ ] Seals properly seated
- [ ] Vent valve installed
- [ ] Lid gasket clean
`,
    sl: `# Izdelava vremensko odpornega LoRa ohišja

## Pregled

Vremensko odporno ohišje je bistveno za zunanje namestitve.
Ta projekt prikazuje, kako pripravite cenovno ugodno IP67 ohišje za
Meshtastic/MeshCore/MeshCom vozlišča.

---

## Materiali podrobno

### Ohišje

| Velikost | Primerno za | Cena |
|----------|-------------|------|
| 100x68x50mm | Heltec, RAK | ~5€ |
| 150x110x70mm | T-Beam + baterija | ~8€ |
| 200x120x75mm | S solarnim polnilnikom | ~12€ |

**Nasvet**: Pazite na IP67 (odporno na prah, vodoodporno pri začasnem potapljanju).

### Kabelske uvodnice

- **PG7**: Za kable 3-6.5mm (USB, tanki antenski kabli)
- **PG9**: Za kable 4-8mm (debelejši kabli)
- **PG11**: Za kable 5-10mm (Koaks RG58)

**Pomembno**: Vedno z gumijastim tesnilom!

### SMA vgradna vtičnica

- Standardna SMA vtičnica zadostuje za večino primerov
- Vodoodporna različica za ekstremne pogoje
- Alternativa: N-vtičnica za boljše RF lastnosti

---

## Navodila po korakih

### 1. Načrtovanje lukenj

\`\`\`
┌─────────────────────────────────┐
│                                 │
│    ○ Odzračevanje (M12)         │
│                                 │
│                                 │
│              ┌─────┐            │
│              │Plošča│           │
│              └─────┘            │
│                                 │
│ ○ USB (PG7)       ○ SMA (Ant)   │
└─────────────────────────────────┘
    Spodnja stran
\`\`\`

**Velikosti lukenj:**
- USB kabel: 12mm (za PG7)
- Antena: 6.5mm (za SMA) ali 12mm (za PG7)
- Odzračevanje: 12mm (za M12 ventil)

### 2. Vrtanje lukenj

1. Označite pozicije (merite od znotraj)
2. Označite s punktirjem za natančno vrtanje
3. Uporabite stopničasti sveder (čiste luknje v plastiki)
4. Odstranite robove z nožem ali pilo

### 3. Namestitev uvodnic

1. Namestite gumijasto tesnilo na uvodnico
2. Vstavite od zunaj
3. Privijte matico od znotraj
4. Zatesnite s silikonom

### 4. Montaža SMA vtičnice

1. Izvrtajte luknjo (običajno 6.5mm)
2. Vstavite vtičnico od zunaj
3. Privijte matico od znotraj
4. Zatesnite s silikonskim trakom ali tesnilno maso

### 5. Odzračevalni ventil

**Zakaj je pomemben?**
- Temperaturne spremembe ustvarjajo tlačne razlike
- Brez ventila: vlaga se vsrka
- Gore-Tex membrana: zrak ven, voda ostane zunaj

**Namestitev:**
- Izvrtajte luknjo (M12)
- Privijte ventil
- Namestite na najvišjo točko ohišja

### 6. Pritrditev plošče

Možnosti:
1. **Penasta lepilna podloga**: Enostavno, blaži vibracije
2. **Distančniki**: Bolj profesionalno, vijačenje
3. **Kabelske vezice + luknje**: Poceni, stabilno

### 7. Povezovanje

\`\`\`
Zunaj:                    Znotraj:
  │                         │
  │ USB kabel ────────────> Plošča
  │ (skozi PG7)             │
  │                         │
  │ Antenski kabel ───────> SMA Pigtail ──> Plošča
  │ (skozi SMA vtičnico)    │
  │                         │
  │ Solarni kabel ────────> TP4056 ──> Plošča
  │ (skozi PG7)             (opcijsko)
\`\`\`

### 8. Tesnjenje

**Kritične točke:**
- Kabelske uvodnice: Silikon okrog navojev
- SMA vtičnica: Silikonski trak ali tesnilna masa
- Pokrov: Preverite originalno tesnilo

**Test:** Zaprite ohišje in ga na kratko potopite v vodo.

---

## Nasveti za namestitev

### Lokacija

- **Višina**: Višje je bolje (doseg)
- **Senca**: Ohišje ne sme biti na neposrednem soncu (pregrevanje)
- **Usmeritev**: Antena navpično, odzračevanje zgoraj

### Pritrditev

| Metoda | Prednosti | Slabosti |
|--------|-----------|----------|
| Objemka za cev | Stabilno, montaža na drog | Specifična velikost |
| Kabelske vezice | Poceni, prilagodljivo | Uporabite UV odporne |
| Vijaki | Trajno | Potrebno vrtanje |
| Magnetno podnožje | Brez vrtanja | Samo na kovini |

### Vodenje kablov

- Kable vodite navzdol (odtekanje vode)
- Kapljična zanka pred ohišjem
- Brez ostrih zavojev koaksialnega kabla

---

## Pogoste napake

1. **Napačno tesnjenje**: Navaden silikon namesto IP67 ohišja
2. **Brez odzračevalnega ventila**: Kondenzacija uniči elektroniko
3. **Antena v ohišju**: Močno zmanjšan doseg
4. **Premajhno ohišje**: Ni prostora za baterijo
5. **Poceni kabelske uvodnice**: Tesnilo odpove

---

## Viri materialov

- Amazon: IP67 ohišja, kabelske uvodnice
- Conrad/Reichelt: Elektronska ohišja, SMA vtičnice
- Trgovina z orodjem: Silikon, skrčljive cevi
- AliExpress: Ugodna ohišja (daljši dobavni rok)

---

## Kontrolni seznam pred zapiranjem

- [ ] Plošča naložena s firmware in konfigurirana
- [ ] Vsi kabli priključeni
- [ ] Antena priključena (NIKOLI ne oddajajte brez antene!)
- [ ] Baterija napolnjena (če je prisotna)
- [ ] Vse uvodnice privite
- [ ] Tesnila pravilno nameščena
- [ ] Odzračevalni ventil nameščen
- [ ] Tesnilo pokrova čisto
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'OUTDOOR_ENCLOSURE.md',

  externalLinks: [
    {
      title: {
        de: 'IP Schutzklassen erklärt',
        en: 'IP Protection Classes Explained',
        sl: 'Razlaga IP zaščitnih razredov',
      },
      url: 'https://de.wikipedia.org/wiki/IP-Code',
    },
    {
      title: {
        de: 'Meshtastic Outdoor Guide',
        en: 'Meshtastic Outdoor Guide',
        sl: 'Meshtastic vodnik za zunanjo uporabo',
      },
      url: 'https://meshtastic.org/docs/hardware/enclosures/',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Welche Gehäusegröße brauche ich?',
      en: 'What enclosure size do I need?',
      sl: 'Kakšno velikost ohišja potrebujem?',
    },
    {
      de: 'Wie verhindere ich Kondenswasser?',
      en: 'How do I prevent condensation?',
      sl: 'Kako preprečim kondenzacijo?',
    },
    {
      de: 'Welche Antenne passt durch das Gehäuse?',
      en: 'Which antenna fits through the enclosure?',
      sl: 'Katera antena gre skozi ohišje?',
    },
    {
      de: 'Kann ich das Gehäuse 3D-drucken?',
      en: 'Can I 3D print the enclosure?',
      sl: 'Ali lahko ohišje 3D natisnem?',
    },
    {
      de: 'Wie befestige ich es am Mast?',
      en: 'How do I mount it on a mast?',
      sl: 'Kako ga pritrdim na drog?',
    },
  ],

  hardwareOptions: [
    {
      name: {
        de: 'IP67 Gehäuse 100x68x50mm',
        en: 'IP67 Enclosure 100x68x50mm',
        sl: 'IP67 ohišje 100x68x50mm',
      },
      price: '~5€',
      features: [
        { de: 'Kompakt', en: 'Compact', sl: 'Kompaktno' },
        { de: 'Für Heltec/RAK', en: 'For Heltec/RAK', sl: 'Za Heltec/RAK' },
        { de: 'Günstig', en: 'Affordable', sl: 'Ugodno' },
      ],
      recommended: true,
    },
    {
      name: {
        de: 'IP67 Gehäuse 150x110x70mm',
        en: 'IP67 Enclosure 150x110x70mm',
        sl: 'IP67 ohišje 150x110x70mm',
      },
      price: '~8€',
      features: [
        { de: 'Für T-Beam + Akku', en: 'For T-Beam + Battery', sl: 'Za T-Beam + baterija' },
        { de: 'Mehr Platz', en: 'More space', sl: 'Več prostora' },
      ],
    },
    {
      name: {
        de: 'Kabelverschraubung Set PG7-PG11',
        en: 'Cable Gland Set PG7-PG11',
        sl: 'Komplet kabelskih uvodnic PG7-PG11',
      },
      price: '~6€',
      features: [
        { de: '10 Stück gemischt', en: '10 pieces mixed', sl: '10 kosov mešano' },
        { de: 'Mit Dichtungen', en: 'With seals', sl: 'S tesnili' },
      ],
    },
    {
      name: {
        de: 'SMA Einbaubuchse wasserdicht',
        en: 'SMA Panel Mount Waterproof',
        sl: 'SMA vgradna vtičnica vodoodporna',
      },
      price: '~4€',
      features: [
        { de: 'IP67', en: 'IP67', sl: 'IP67' },
        { de: 'Mit O-Ring', en: 'With O-Ring', sl: 'Z O-obročem' },
      ],
    },
    {
      name: {
        de: 'Gore-Tex Entlüftungsventil M12',
        en: 'Gore-Tex Vent Valve M12',
        sl: 'Gore-Tex odzračevalni ventil M12',
      },
      price: '~5€',
      features: [
        { de: 'Verhindert Kondenswasser', en: 'Prevents condensation', sl: 'Preprečuje kondenzacijo' },
        { de: 'Essential!', en: 'Essential!', sl: 'Nujno!' },
      ],
    },
  ],
};
