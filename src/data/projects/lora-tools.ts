import type { HamProject } from '../../types/projects';

export const loraTools: HamProject = {
  id: 'lora-tools',
  name: {
    de: 'LoRa Tools & Rechner',
    en: 'LoRa Tools & Calculator',
    sl: 'LoRa Orodja in Kalkulator'
  },
  category: 'mesh-lora',
  difficulty: 1,
  description: {
    de: 'Interaktive Tools: Hardware-Vergleich und Reichweiten-Rechner für LoRa Mesh-Netzwerke.',
    en: 'Interactive tools: Hardware comparison and range calculator for LoRa mesh networks.',
    sl: 'Interaktivna orodja: Primerjava strojne opreme in kalkulator dosega za LoRa mesh omrežja.'
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [],
  estimatedCost: '0 EUR',

  code: {
    de: `# LoRa Tools & Rechner

Diese Seite enthält interaktive Tools für LoRa Mesh-Planung.

## Hardware-Vergleich

Filtere und vergleiche alle unterstützten LoRa-Boards:
- Nach Einsatzzweck (Repeater, Portabel, Tracker, etc.)
- Nach Hersteller (LILYGO, Heltec, RAK, etc.)
- Nach Features (GPS, Display, Akku)
- Nach Preis

## Reichweiten-Rechner

Berechne die theoretische Reichweite basierend auf:
- Sendeleistung (TX Power)
- Antennengewinn
- Spreading Factor
- Umgebung/Terrain
- Antennenhöhe

Die Tools sind direkt in der App als interaktive Komponenten verfügbar.

---

## So nutzt du die Tools

### Hardware-Vergleich

1. Wähle deinen Einsatzzweck (z.B. "Portabel")
2. Setze Filter (GPS, Display, Akku)
3. Vergleiche die passenden Geräte
4. Achte auf das Preis-Leistungs-Verhältnis

### Reichweiten-Rechner

1. Stelle deine Sendeleistung ein
2. Wähle die Antennen (Sender & Empfänger)
3. Setze die Antennenhöhen
4. Wähle die Umgebung
5. Experimentiere mit Spreading Factor

**Tipp**: Der Rechner zeigt auch die Fresnel-Zone an -
diese sollte möglichst frei von Hindernissen sein!
`,
    en: `# LoRa Tools & Calculator

This page contains interactive tools for LoRa mesh planning.

## Hardware Comparison

Filter and compare all supported LoRa boards:
- By use case (Repeater, Portable, Tracker, etc.)
- By manufacturer (LILYGO, Heltec, RAK, etc.)
- By features (GPS, Display, Battery)
- By price

## Range Calculator

Calculate the theoretical range based on:
- Transmit power (TX Power)
- Antenna gain
- Spreading Factor
- Environment/Terrain
- Antenna height

The tools are available directly in the app as interactive components.

---

## How to use the tools

### Hardware Comparison

1. Choose your use case (e.g. "Portable")
2. Set filters (GPS, Display, Battery)
3. Compare the matching devices
4. Pay attention to the price-performance ratio

### Range Calculator

1. Set your transmit power
2. Choose the antennas (Transmitter & Receiver)
3. Set the antenna heights
4. Choose the environment
5. Experiment with Spreading Factor

**Tip**: The calculator also shows the Fresnel zone -
this should be as free from obstacles as possible!
`,
    sl: `# LoRa Orodja in Kalkulator

Ta stran vsebuje interaktivna orodja za načrtovanje LoRa mesh omrežij.

## Primerjava strojne opreme

Filtrirajte in primerjajte vse podprte LoRa plošče:
- Po namenu uporabe (Repeater, Prenosni, Sledilnik, itd.)
- Po proizvajalcu (LILYGO, Heltec, RAK, itd.)
- Po funkcijah (GPS, Zaslon, Baterija)
- Po ceni

## Kalkulator dosega

Izračunajte teoretični doseg na podlagi:
- Oddajna moč (TX Power)
- Ojačenje antene
- Spreading Factor
- Okolje/Teren
- Višina antene

Orodja so na voljo neposredno v aplikaciji kot interaktivne komponente.

---

## Kako uporabljati orodja

### Primerjava strojne opreme

1. Izberite namen uporabe (npr. "Prenosni")
2. Nastavite filtre (GPS, Zaslon, Baterija)
3. Primerjajte ustrezne naprave
4. Bodite pozorni na razmerje med ceno in zmogljivostjo

### Kalkulator dosega

1. Nastavite oddajno moč
2. Izberite antene (Oddajnik in Sprejemnik)
3. Nastavite višine anten
4. Izberite okolje
5. Eksperimentirajte s Spreading Factor

**Nasvet**: Kalkulator prikazuje tudi Fresnelovo cono -
ta naj bo čim bolj prosta ovir!
`
  },
  codeLanguage: 'markdown',
  codeFileName: 'LORA_TOOLS.md',

  externalLinks: [
    {
      title: {
        de: 'Meshtastic Hardware',
        en: 'Meshtastic Hardware',
        sl: 'Meshtastic Strojna oprema'
      },
      url: 'https://meshtastic.org/docs/hardware/'
    },
    {
      title: {
        de: 'LoRa Calculator (Online)',
        en: 'LoRa Calculator (Online)',
        sl: 'LoRa Kalkulator (Spletni)'
      },
      url: 'https://www.semtech.com/design-support/lora-calculator'
    },
  ],

  customizationSuggestions: [
    {
      de: 'Welches Board für meinen Einsatzzweck?',
      en: 'Which board for my use case?',
      sl: 'Katera plošča za moj namen uporabe?'
    },
    {
      de: 'Wie berechne ich die Reichweite?',
      en: 'How do I calculate the range?',
      sl: 'Kako izračunam doseg?'
    },
    {
      de: 'Was ist der beste Spreading Factor?',
      en: 'What is the best Spreading Factor?',
      sl: 'Kateri je najboljši Spreading Factor?'
    },
    {
      de: 'Wie wichtig ist die Antennenhöhe?',
      en: 'How important is the antenna height?',
      sl: 'Kako pomembna je višina antene?'
    },
  ],

  hardwareOptions: [],
};
