import type { HamProject } from '../../types/projects';

export const meshtasticCustomFirmware: HamProject = {
  id: 'meshtastic-custom-firmware',
  name: 'Eigene Firmware kompilieren',
  category: 'mesh-lora',
  difficulty: 3,
  description: 'Meshtastic Firmware selbst kompilieren mit PlatformIO. Für eigene Anpassungen, neue Features oder Debug-Builds.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    { name: 'Computer (Windows/Mac/Linux)', quantity: 1 },
    { name: 'VS Code Editor', quantity: 1, notes: 'Kostenlos' },
    { name: 'PlatformIO Extension', quantity: 1, notes: 'Kostenlos' },
    { name: 'Git', quantity: 1, notes: 'Versionskontrolle' },
    { name: 'LoRa-Board zum Testen', quantity: 1 },
  ],
  estimatedCost: '0 EUR (Software)',

  code: `# Eigene Meshtastic Firmware kompilieren

## Warum selbst kompilieren?

Gründe für eine eigene Firmware:

- **Eigene Anpassungen**: Features hinzufügen/entfernen
- **Neue Features testen**: Nightly/Development Builds
- **Debugging**: Fehlersuche mit Serial Output
- **Lernen**: Firmware-Entwicklung verstehen
- **Beitragen**: Zum Projekt beitragen

---

## Voraussetzungen

### Software installieren

1. **Git** - https://git-scm.com/
2. **VS Code** - https://code.visualstudio.com/
3. **Python 3.x** - https://python.org/
4. **PlatformIO IDE** - VS Code Extension

### Hardware

- USB-Kabel
- Unterstütztes LoRa-Board (T-Beam, Heltec, RAK, etc.)

---

## Schritt 1: Repository klonen

\`\`\`bash
# Meshtastic Firmware Repository klonen
git clone https://github.com/meshtastic/firmware.git
cd firmware

# Submodules initialisieren (wichtig!)
git submodule update --init --recursive
\`\`\`

### Auf bestimmte Version wechseln

\`\`\`bash
# Alle Tags anzeigen
git tag

# Auf stabile Version wechseln
git checkout v2.3.0

# Oder neueste Entwicklung
git checkout master
\`\`\`

---

## Schritt 2: VS Code & PlatformIO einrichten

### PlatformIO installieren

1. VS Code öffnen
2. Extensions (Ctrl+Shift+X)
3. "PlatformIO IDE" suchen
4. Installieren
5. VS Code neu starten

### Projekt öffnen

1. File → Open Folder
2. Den geklonten "firmware" Ordner wählen
3. Warten bis PlatformIO initialisiert

---

## Schritt 3: Board auswählen

### platformio.ini verstehen

Die Datei \`platformio.ini\` enthält alle Board-Definitionen.

### Wichtige Environments

| Environment | Board |
|-------------|-------|
| \`tbeam\` | LILYGO T-Beam v1.0/v1.1 |
| \`tbeam-s3-core\` | T-Beam S3 Core |
| \`tlora-v2-1-1_6\` | LILYGO LoRa32 |
| \`heltec-v3\` | Heltec LoRa V3 |
| \`rak4631\` | RAK WisBlock 4631 |
| \`station-g2\` | B&Q Station G2 |

### Build Environment setzen

In VS Code:
1. Unten in der Statusleiste
2. "env:" klicken
3. Dein Board auswählen (z.B. \`tbeam\`)

---

## Schritt 4: Kompilieren

### Via VS Code

1. PlatformIO Icon in der Seitenleiste
2. Dein Environment aufklappen
3. "Build" klicken

### Via Terminal

\`\`\`bash
# Bestimmtes Board kompilieren
pio run -e tbeam

# Alle Boards kompilieren
pio run
\`\`\`

### Build-Ausgabe

\`\`\`
Building .pio/build/tbeam/firmware.bin
RAM:   [===       ]  32.5% (used 106756 bytes from 327680 bytes)
Flash: [========  ]  78.4% (used 1539248 bytes from 1966080 bytes)
======================== [SUCCESS] =======================
\`\`\`

---

## Schritt 5: Flashen

### Via VS Code

1. Board per USB anschließen
2. PlatformIO → "Upload"
3. Warten bis fertig

### Via Terminal

\`\`\`bash
# Kompilieren und flashen
pio run -e tbeam -t upload

# Nur flashen (wenn schon kompiliert)
pio run -e tbeam -t upload --upload-port /dev/ttyUSB0
\`\`\`

### Serial Monitor

\`\`\`bash
# Debug-Ausgabe ansehen
pio device monitor -e tbeam
\`\`\`

---

## Eigene Anpassungen

### Konfiguration ändern

Datei: \`src/configuration.h\`

\`\`\`cpp
// Beispiel: Standard-Name ändern
#define DEVICE_NAME "MeinNode"

// Debug-Level erhöhen
#define LOG_LEVEL LOG_LEVEL_DEBUG
\`\`\`

### Feature-Flags

Datei: \`platformio.ini\` (im Environment)

\`\`\`ini
[env:tbeam]
build_flags =
  -D MESHTASTIC_EXCLUDE_GPS=1      ; GPS deaktivieren
  -D MESHTASTIC_EXCLUDE_WIFI=1     ; WiFi deaktivieren
  -D MESHTASTIC_EXCLUDE_SCREEN=1   ; Display deaktivieren
\`\`\`

### Eigenes Modul hinzufügen

1. Neue Datei in \`src/modules/\`
2. Von \`MeshModule\` erben
3. In \`src/modules/Modules.cpp\` registrieren

---

## Häufige Probleme

### "ModuleNotFoundError: No module named 'platformio'"

\`\`\`bash
# PlatformIO CLI installieren
pip install platformio
\`\`\`

### "fatal: not a git repository"

\`\`\`bash
# Im richtigen Ordner?
cd firmware
git status
\`\`\`

### Submodules fehlen

\`\`\`bash
git submodule update --init --recursive
\`\`\`

### Upload fehlgeschlagen

1. Richtiger Port? (\`/dev/ttyUSB0\` oder \`COM3\`)
2. Board im Boot-Modus? (BOOT-Taste drücken)
3. USB-Kabel Daten-fähig? (nicht nur Laden)
4. Treiber installiert? (CP2102/CH340)

### Nicht genug Speicher

\`\`\`
Error: section '.text' will not fit in region 'irom0_0_seg'
\`\`\`

Lösung: Features deaktivieren mit \`MESHTASTIC_EXCLUDE_*\`

---

## Nützliche Befehle

\`\`\`bash
# Alles aufräumen
pio run -e tbeam -t clean

# Nur kompilieren, nicht flashen
pio run -e tbeam

# Filesystem flashen (SPIFFS)
pio run -e tbeam -t uploadfs

# Alle Dependencies aktualisieren
pio pkg update

# Board-Info anzeigen
pio device list
\`\`\`

---

## Zum Projekt beitragen

### Fork erstellen

1. GitHub Account
2. https://github.com/meshtastic/firmware
3. "Fork" klicken

### Änderungen committen

\`\`\`bash
# Neuen Branch erstellen
git checkout -b mein-feature

# Änderungen hinzufügen
git add .
git commit -m "Add: Mein neues Feature"

# Zu deinem Fork pushen
git push origin mein-feature
\`\`\`

### Pull Request

1. Auf GitHub zu deinem Fork gehen
2. "Compare & pull request"
3. Änderungen beschreiben
4. Warten auf Review

---

## Projekt-Struktur

\`\`\`
firmware/
├── src/
│   ├── main.cpp              # Hauptprogramm
│   ├── configuration.h       # Konfiguration
│   ├── mesh/                 # Mesh-Protokoll
│   ├── modules/              # Module (Telemetrie, etc.)
│   ├── graphics/             # Display-Grafiken
│   └── platform/             # Plattform-spezifisch
├── lib/                      # Libraries
├── variants/                 # Board-Definitionen
├── platformio.ini            # Build-Konfiguration
└── proto/                    # Protobuf-Definitionen
\`\`\`

---

## Weiterführende Ressourcen

- **Discord**: discord.gg/meshtastic (#firmware-dev)
- **GitHub Issues**: Bugs & Feature Requests
- **Docs**: meshtastic.org/docs/development/

---

## Checkliste

- [ ] Git installiert
- [ ] VS Code installiert
- [ ] PlatformIO Extension installiert
- [ ] Python 3.x installiert
- [ ] Repository geklont
- [ ] Submodules initialisiert
- [ ] Board-Environment ausgewählt
- [ ] Build erfolgreich
- [ ] Upload auf Board erfolgreich
- [ ] Firmware läuft
`,
  codeLanguage: 'markdown',
  codeFileName: 'CUSTOM_FIRMWARE_GUIDE.md',

  externalLinks: [
    { title: 'Meshtastic Firmware GitHub', url: 'https://github.com/meshtastic/firmware' },
    { title: 'PlatformIO Docs', url: 'https://docs.platformio.org/' },
    { title: 'Meshtastic Development Docs', url: 'https://meshtastic.org/docs/development/' },
    { title: 'VS Code Download', url: 'https://code.visualstudio.com/' },
  ],

  customizationSuggestions: [
    'Wie deaktiviere ich GPS in der Firmware?',
    'Wie füge ich ein eigenes Modul hinzu?',
    'Welche Build-Flags gibt es?',
    'Wie debugge ich die Firmware?',
    'Wie erstelle ich einen Pull Request?',
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2',
      price: '~35€',
      features: ['Gut dokumentiert', 'Viele Beispiele'],
      recommended: true,
    },
    {
      name: 'Heltec LoRa V3',
      price: '~25€',
      features: ['Günstig', 'Schnelles Flashen'],
    },
    {
      name: 'RAK WisBlock 4631',
      price: '~30€',
      features: ['nRF52', 'Andere Toolchain'],
    },
  ],
};
