# HAM Bastelprojekte - Feature Skizze

## Übersicht

Neuer Tab "Bastelprojekte" mit:
- **Projektbibliothek**: Fertige Templates für typische HAM-Projekte
- **KI-Assistent**: Code generieren, anpassen, erklären
- **Code-Viewer**: Syntax-Highlighting, Copy, Download

---

## UI-Design

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 Bastelprojekte                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Kategorien ───┐  ┌─── Projekt-Karten ─────────────────┐  │
│  │ ○ Alle           │  │                                     │  │
│  │ ○ CW/Morse       │  │  ┌─────────┐ ┌─────────┐ ┌───────┐ │  │
│  │ ○ Antennen       │  │  │ CW-Keyer│ │SWR-Meter│ │ APRS  │ │  │
│  │ ○ Mess-/Anzeige  │  │  │ ESP32   │ │ Arduino │ │Tracker│ │  │
│  │ ○ Digital/APRS   │  │  │ ⭐ Easy │ │ ⭐⭐ Mid │ │⭐⭐⭐  │ │  │
│  │ ○ Steuerung      │  │  └─────────┘ └─────────┘ └───────┘ │  │
│  │ ○ Audio/NF       │  │                                     │  │
│  └──────────────────┘  │  ┌─────────┐ ┌─────────┐ ┌───────┐ │  │
│                        │  │Rotor-   │ │Antenna  │ │Morse  │ │  │
│  ┌─── KI-Chat ──────┐  │  │Ctrl     │ │Switch   │ │Trainer│ │  │
│  │                  │  │  │ ⭐⭐ Mid │ │ ⭐ Easy │ │⭐ Easy│ │  │
│  │ "Generiere Code  │  │  └─────────┘ └─────────┘ └───────┘ │  │
│  │  für einen CW-   │  │                                     │  │
│  │  Keyer mit..."   │  └─────────────────────────────────────┘  │
│  │                  │                                           │
│  │ [Senden]         │                                           │
│  └──────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                            ↓ Klick auf Projekt

┌─────────────────────────────────────────────────────────────────┐
│  ← Zurück    CW-Keyer mit ESP32                      [Download] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Info ─────────────────┐  ┌─── Code ─────────────────────┐│
│  │                          │  │ // CW Keyer - ESP32          ││
│  │ 📋 Beschreibung          │  │ // FunkPilot Template v1.0   ││
│  │ Einfacher Iambic-Keyer   │  │                              ││
│  │ mit Geschwindigkeits-    │  │ #include <Arduino.h>         ││
│  │ regelung über Poti.      │  │                              ││
│  │                          │  │ const int DIT_PIN = 12;      ││
│  │ 🎯 Schwierigkeit: ⭐     │  │ const int DAH_PIN = 14;      ││
│  │                          │  │ const int KEY_OUT = 26;      ││
│  │ 🔧 Hardware:             │  │ const int SPEED_POT = 34;    ││
│  │ • ESP32 DevKit           │  │                              ││
│  │ • Paddle (2x Taster)     │  │ int wpm = 15;                ││
│  │ • Piezo Buzzer           │  │ int ditLength;               ││
│  │ • 10k Poti               │  │                              ││
│  │                          │  │ void setup() {               ││
│  │ 💰 Kosten: ~15€          │  │   pinMode(DIT_PIN, INPUT);   ││
│  │                          │  │   ...                        ││
│  └──────────────────────────┘  │                              ││
│                                │ [Copy]  [Download .ino]      ││
│  ┌─── KI-Anpassung ─────────┐  └──────────────────────────────┘│
│  │                          │                                  │
│  │ 💬 "Passe den Code für   │  ┌─── Stückliste ─────────────┐ │
│  │     20 WPM Minimum an"   │  │ Komponente      | Anzahl    │ │
│  │                          │  │ ESP32 DevKit    | 1         │ │
│  │ [Anpassen]               │  │ Taster          | 2         │ │
│  │                          │  │ Piezo Buzzer    | 1         │ │
│  │ Vorschläge:              │  │ Poti 10k        | 1         │ │
│  │ • Display hinzufügen     │  │ Widerstände     | div.      │ │
│  │ • Memory-Funktion        │  │                             │ │
│  │ • OLED-Anzeige           │  │ [Export CSV] [Export PDF]   │ │
│  └──────────────────────────┘  └─────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Projekt-Templates (Initial)

### Kategorie: CW/Morse
| Projekt | Hardware | Schwierigkeit | Beschreibung |
|---------|----------|---------------|--------------|
| CW-Keyer Basic | Arduino Nano | ⭐ | Einfacher Iambic-Keyer mit Poti |
| CW-Keyer Pro | ESP32 | ⭐⭐ | Mit OLED-Display, Memory, USB |
| CW-Decoder | Arduino + LCD | ⭐⭐ | Morsezeichen dekodieren und anzeigen |
| Morsetrainer | ESP32 | ⭐ | Zufällige Zeichen zum Üben |

### Kategorie: Mess-/Anzeigegeräte
| Projekt | Hardware | Schwierigkeit | Beschreibung |
|---------|----------|---------------|--------------|
| SWR-Meter | Arduino + OLED | ⭐⭐ | Stehwellenverhältnis messen |
| Power-Meter | Arduino | ⭐⭐ | HF-Leistung messen (bis 100W) |
| Frequenzzähler | Arduino | ⭐⭐ | Frequenz bis 50 MHz messen |
| S-Meter Digital | Arduino + LCD | ⭐ | S-Wert von Transceiver anzeigen |

### Kategorie: Antennen
| Projekt | Hardware | Schwierigkeit | Beschreibung |
|---------|----------|---------------|--------------|
| Antennenumschalter | Arduino + Relais | ⭐ | 4-fach Umschalter mit Memory |
| Rotor-Controller | ESP32 | ⭐⭐⭐ | Antennenrotor steuern |
| Auto-Tuner Steuerung | Arduino | ⭐⭐⭐ | ATU fernsteuern |
| MagLoop Controller | ESP32 + Stepper | ⭐⭐ | Magnetische Loop abstimmen |

### Kategorie: Digital/APRS
| Projekt | Hardware | Schwierigkeit | Beschreibung |
|---------|----------|---------------|--------------|
| APRS-Tracker | ESP32 + GPS | ⭐⭐ | Position über APRS senden |
| APRS-iGate | ESP32 + WiFi | ⭐⭐ | APRS-Internet Gateway |
| Packet-TNC | Arduino | ⭐⭐⭐ | Terminal Node Controller |
| FT8 Beacon | Raspberry Pi | ⭐⭐⭐ | Automatischer FT8 Sender |

### Kategorie: Audio/NF
| Projekt | Hardware | Schwierigkeit | Beschreibung |
|---------|----------|---------------|--------------|
| VOX-Schaltung | Arduino | ⭐ | Sprachgesteuerte PTT |
| CW-Filter | Arduino + DAC | ⭐⭐ | Digitaler NF-Filter |
| Audio-Splitter | Arduino | ⭐ | NF auf mehrere Geräte verteilen |
| Noise Blanker | ESP32 | ⭐⭐⭐ | Störimpulse unterdrücken |

### Kategorie: Steuerung
| Projekt | Hardware | Schwierigkeit | Beschreibung |
|---------|----------|---------------|--------------|
| PTT-Sequencer | Arduino | ⭐ | PA/Vorverstärker sequenzieren |
| Band-Decoder | Arduino | ⭐⭐ | CAT → Bandfilter umschalten |
| Shack-Controller | ESP32 + Relais | ⭐⭐ | Geräte im Shack steuern |
| Contest-Logger | ESP32 + Display | ⭐⭐⭐ | Standalone QSO-Logger |

---

## Datenstruktur

```typescript
// src/types/projects.ts

export interface HamProject {
  id: string;
  name: string;
  nameEN?: string;
  category: ProjectCategory;
  difficulty: 1 | 2 | 3; // Sterne
  description: string;
  descriptionEN?: string;
  hardware: HardwarePlatform;

  // Stückliste
  components: Component[];
  estimatedCost: string; // "~15€"

  // Code
  code: string;
  codeLanguage: 'cpp' | 'python' | 'micropython';
  codeFileName: string; // "cw_keyer.ino"

  // Optional
  schematicUrl?: string;
  youtubeUrl?: string;
  externalLinks?: { title: string; url: string }[];

  // Anpassungs-Vorschläge für KI
  customizationSuggestions: string[];
}

export type ProjectCategory =
  | 'cw-morse'
  | 'measurement'
  | 'antenna'
  | 'digital-aprs'
  | 'audio'
  | 'control';

export type HardwarePlatform =
  | 'arduino-nano'
  | 'arduino-uno'
  | 'esp32'
  | 'esp8266'
  | 'raspberry-pi'
  | 'raspberry-pico';

export interface Component {
  name: string;
  quantity: number;
  notes?: string;
  shopUrl?: string; // Optional: Link zu Reichelt/Conrad
}
```

---

## Komponenten-Struktur

```
src/
├── components/
│   └── projects/
│       ├── ProjectsTab.tsx        # Hauptkomponente
│       ├── ProjectCard.tsx        # Projekt-Karte in Übersicht
│       ├── ProjectDetail.tsx      # Detail-Ansicht
│       ├── CodeViewer.tsx         # Syntax-Highlighting + Copy
│       ├── ComponentList.tsx      # Stückliste
│       ├── ProjectChat.tsx        # KI-Anpassung
│       └── CategoryFilter.tsx     # Kategorie-Auswahl
├── data/
│   └── projects/
│       ├── index.ts               # Alle Projekte exportieren
│       ├── cw-keyer-basic.ts      # Einzelnes Projekt
│       ├── cw-keyer-pro.ts
│       ├── swr-meter.ts
│       └── ...
└── types/
    └── projects.ts                # TypeScript Types
```

---

## Code-Viewer Features

```typescript
// Verwendung von react-syntax-highlighter oder prism-react-renderer

<CodeViewer
  code={project.code}
  language="cpp"
  fileName="cw_keyer.ino"
  onCopy={() => copyToClipboard(code)}
  onDownload={() => downloadFile(code, fileName)}
/>
```

**Features:**
- Syntax-Highlighting (C++, Python)
- Zeilennummern
- Copy-to-Clipboard Button
- Download als .ino/.cpp/.py
- Dunkles Theme passend zu FunkPilot

---

## KI-Integration

### System-Prompt Erweiterung

```typescript
const PROJECT_SYSTEM_PROMPT = `
Du bist ein Experte für Amateurfunk-Elektronikprojekte.

Wenn der Benutzer Code anpassen möchte:
1. Verstehe die gewünschte Änderung
2. Generiere den angepassten Code
3. Erkläre die Änderungen kurz
4. Weise auf mögliche Hardware-Änderungen hin

Wichtig:
- Verwende bewährte Arduino/ESP32 Libraries
- Kommentiere den Code auf Deutsch
- Füge Sicherheitshinweise bei HF-Projekten hinzu
- Erkläre Pin-Belegungen

Bei neuen Projekten:
- Frage nach: Hardware-Plattform, gewünschte Features
- Schlage passende Komponenten vor
- Generiere vollständigen, kompilierbaren Code
`;
```

### Anpassungs-Chat

```
User: "Füge ein OLED-Display hinzu"

KI: "Ich habe den Code für ein 0.96" OLED Display (SSD1306) erweitert:

**Neue Komponenten:**
- OLED Display 0.96" I2C (SSD1306)
- 4x Dupont-Kabel

**Code-Änderungen:**
- Adafruit_SSD1306 Library hinzugefügt
- Display zeigt: WPM, Modus, letztes Zeichen

[Code anzeigen]"
```

---

## Beispiel-Projekt: CW-Keyer Basic

```typescript
// src/data/projects/cw-keyer-basic.ts

export const cwKeyerBasic: HamProject = {
  id: 'cw-keyer-basic',
  name: 'CW-Keyer Basic',
  category: 'cw-morse',
  difficulty: 1,
  description: `
    Einfacher Iambic-A/B Keyer für CW-Betrieb.
    Geschwindigkeit einstellbar über Potentiometer (10-30 WPM).
    Seitenton über Piezo-Summer.
  `,
  hardware: 'arduino-nano',

  components: [
    { name: 'Arduino Nano', quantity: 1 },
    { name: 'Paddle/2x Taster', quantity: 1, notes: 'oder Eigenbau' },
    { name: 'Piezo Buzzer', quantity: 1 },
    { name: 'Potentiometer 10k', quantity: 1 },
    { name: 'Widerstand 1k', quantity: 2 },
    { name: 'LED rot', quantity: 1, notes: 'optional, TX-Anzeige' },
    { name: 'Buchse 3.5mm', quantity: 1, notes: 'für Paddle' },
    { name: 'Buchse 3.5mm', quantity: 1, notes: 'für KEY-Out' },
  ],
  estimatedCost: '~12€',

  code: `// CW-Keyer Basic - FunkPilot Template
// Hardware: Arduino Nano
// 73 de OE8YML

const int DIT_PIN = 2;      // Paddle DIT
const int DAH_PIN = 3;      // Paddle DAH
const int KEY_OUT = 4;      // Ausgang zum TRX
const int BUZZER = 5;       // Seitenton
const int LED_TX = 6;       // TX-LED
const int SPEED_POT = A0;   // Geschwindigkeits-Poti

int wpm = 15;
int ditLength;              // in ms
bool iambicB = true;        // true = Iambic-B, false = Iambic-A

void setup() {
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);
  pinMode(KEY_OUT, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_TX, OUTPUT);

  updateSpeed();
}

void loop() {
  updateSpeed();

  bool dit = !digitalRead(DIT_PIN);
  bool dah = !digitalRead(DAH_PIN);

  if (dit) sendDit();
  if (dah) sendDah();

  // Iambic-B: Squeeze-Erkennung
  if (iambicB && dit && dah) {
    sendDit();
    sendDah();
  }
}

void updateSpeed() {
  int potValue = analogRead(SPEED_POT);
  wpm = map(potValue, 0, 1023, 10, 35);
  ditLength = 1200 / wpm;
}

void sendDit() {
  keyDown();
  delay(ditLength);
  keyUp();
  delay(ditLength); // Element-Pause
}

void sendDah() {
  keyDown();
  delay(ditLength * 3);
  keyUp();
  delay(ditLength); // Element-Pause
}

void keyDown() {
  digitalWrite(KEY_OUT, HIGH);
  digitalWrite(LED_TX, HIGH);
  tone(BUZZER, 700);
}

void keyUp() {
  digitalWrite(KEY_OUT, LOW);
  digitalWrite(LED_TX, LOW);
  noTone(BUZZER);
}
`,
  codeLanguage: 'cpp',
  codeFileName: 'cw_keyer_basic.ino',

  customizationSuggestions: [
    'OLED-Display für WPM-Anzeige hinzufügen',
    'Memory-Funktion für CQ-Ruf',
    'Geschwindigkeit über Encoder statt Poti',
    'USB-Anschluss für PC-Steuerung',
    'Batteriebetrieb mit Tiefentladeschutz',
  ],
};
```

---

## Implementierungsreihenfolge

### Phase 1: Grundstruktur (MVP)
1. Types definieren (`src/types/projects.ts`)
2. Tab "Bastelprojekte" in App.tsx hinzufügen
3. ProjectsTab mit Kategorie-Filter
4. ProjectCard für Übersicht
5. 3-4 Beispiel-Projekte anlegen

### Phase 2: Detail-Ansicht
1. ProjectDetail Komponente
2. CodeViewer mit Syntax-Highlighting
3. Copy & Download Funktionen
4. ComponentList (Stückliste)

### Phase 3: KI-Integration
1. ProjectChat Komponente
2. System-Prompt Erweiterung
3. Code-Anpassung über Chat
4. Neues Projekt generieren

### Phase 4: Erweiterungen
1. Mehr Projekte (10-15)
2. PDF-Export für Stückliste
3. Schaltplan-Viewer (optional)
4. Community-Beiträge (später)

---

## Offene Fragen

1. **Schaltpläne**: SVG einbetten oder nur externe Links?
2. **Kompilierung**: Soll es einen "In Arduino IDE öffnen" Button geben?
3. **Community**: Sollen User eigene Projekte einreichen können?
4. **Sprache**: Nur Deutsch oder auch Englisch?

---

## Aufwand-Schätzung

| Phase | Komponenten | Geschätzt |
|-------|-------------|-----------|
| Phase 1 | Grundstruktur | 2-3h |
| Phase 2 | Detail + Code | 2-3h |
| Phase 3 | KI-Integration | 2h |
| Phase 4 | Mehr Projekte | fortlaufend |

**Gesamt MVP**: ~6-8 Stunden

---

## Fazit

Das Feature ist **realistisch umsetzbar** und bietet echten Mehrwert:
- Keine neue Infrastruktur nötig (nutzt bestehende KI)
- Code-Generierung funktioniert gut mit Groq/Llama
- Klarer Scope (kein vollwertiger Editor)
- Typische HAM-Projekte als Templates
- KI für Anpassungen und Erklärungen

**Empfehlung**: Mit Phase 1+2 starten, KI-Integration in Phase 3 hinzufügen.
