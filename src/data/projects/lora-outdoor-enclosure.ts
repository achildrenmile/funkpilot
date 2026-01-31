import type { HamProject } from '../../types/projects';

export const loraOutdoorEnclosure: HamProject = {
  id: 'lora-outdoor-enclosure',
  name: 'Wetterfestes LoRa-Gehäuse',
  category: 'mesh-lora',
  difficulty: 1,
  description: 'IP67 Outdoor-Gehäuse für T-Beam, Heltec oder RAK Boards. Wetterfest für permanente Außenmontage.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    { name: 'IP67 Kunststoffgehäuse', quantity: 1, notes: '100x68x50mm oder 150x110x70mm' },
    { name: 'Kabelverschraubung PG7', quantity: 2, notes: 'Für USB-Kabel und Antennenkabel' },
    { name: 'Kabelverschraubung PG9', quantity: 1, notes: 'Optional für dickere Kabel' },
    { name: 'SMA Einbaubuchse', quantity: 1, notes: 'Wasserdichte Version empfohlen' },
    { name: 'Entlüftungsventil M12', quantity: 1, notes: 'Gore-Tex Membran gegen Kondenswasser' },
    { name: 'Silikondichtmasse', quantity: 1, notes: 'Transparent, witterungsbeständig' },
    { name: 'Kabelbinder', quantity: 1, notes: 'Für interne Befestigung' },
    { name: 'Schaumstoff-Klebepad', quantity: 1, notes: 'Zur Board-Befestigung' },
    { name: 'Schrumpfschlauch', quantity: 1, notes: 'Für Kabelenden' },
  ],
  estimatedCost: '15-25 EUR',

  code: `# Wetterfestes LoRa-Gehäuse bauen

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
  codeLanguage: 'markdown',
  codeFileName: 'OUTDOOR_ENCLOSURE.md',

  externalLinks: [
    { title: 'IP Schutzklassen erklärt', url: 'https://de.wikipedia.org/wiki/IP-Code' },
    { title: 'Meshtastic Outdoor Guide', url: 'https://meshtastic.org/docs/hardware/enclosures/' },
  ],

  customizationSuggestions: [
    'Welche Gehäusegröße brauche ich?',
    'Wie verhindere ich Kondenswasser?',
    'Welche Antenne passt durch das Gehäuse?',
    'Kann ich das Gehäuse 3D-drucken?',
    'Wie befestige ich es am Mast?',
  ],

  hardwareOptions: [
    {
      name: 'IP67 Gehäuse 100x68x50mm',
      price: '~5€',
      features: ['Kompakt', 'Für Heltec/RAK', 'Günstig'],
      recommended: true,
    },
    {
      name: 'IP67 Gehäuse 150x110x70mm',
      price: '~8€',
      features: ['Für T-Beam + Akku', 'Mehr Platz'],
    },
    {
      name: 'Kabelverschraubung Set PG7-PG11',
      price: '~6€',
      features: ['10 Stück gemischt', 'Mit Dichtungen'],
    },
    {
      name: 'SMA Einbaubuchse wasserdicht',
      price: '~4€',
      features: ['IP67', 'Mit O-Ring'],
    },
    {
      name: 'Gore-Tex Entlüftungsventil M12',
      price: '~5€',
      features: ['Verhindert Kondenswasser', 'Essential!'],
    },
  ],
};
