import type { HamProject } from '../../types/projects';

export const loraTools: HamProject = {
  id: 'lora-tools',
  name: 'LoRa Tools & Rechner',
  category: 'mesh-lora',
  difficulty: 1,
  description: 'Interaktive Tools: Hardware-Vergleich und Reichweiten-Rechner für LoRa Mesh-Netzwerke.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [],
  estimatedCost: '0 EUR',

  code: `# LoRa Tools & Rechner

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
  codeLanguage: 'markdown',
  codeFileName: 'LORA_TOOLS.md',

  externalLinks: [
    { title: 'Meshtastic Hardware', url: 'https://meshtastic.org/docs/hardware/' },
    { title: 'LoRa Calculator (Online)', url: 'https://www.semtech.com/design-support/lora-calculator' },
  ],

  customizationSuggestions: [
    'Welches Board für meinen Einsatzzweck?',
    'Wie berechne ich die Reichweite?',
    'Was ist der beste Spreading Factor?',
    'Wie wichtig ist die Antennenhöhe?',
  ],

  hardwareOptions: [],
};
