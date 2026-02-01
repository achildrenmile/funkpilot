import type { HamProject } from '../../types/projects';

export const meshtasticCustomFirmware: HamProject = {
  id: 'meshtastic-custom-firmware',
  name: {
    de: 'Eigene Firmware kompilieren',
    en: 'Compile Custom Firmware',
    sl: 'Prevajanje lastne strojne programske opreme',
  },
  category: 'mesh-lora',
  difficulty: 3,
  description: {
    de: 'Meshtastic Firmware selbst kompilieren mit PlatformIO. Für eigene Anpassungen, neue Features oder Debug-Builds.',
    en: 'Compile Meshtastic firmware yourself with PlatformIO. For custom modifications, new features, or debug builds.',
    sl: 'Sami prevedite Meshtastic strojno programsko opremo s PlatformIO. Za lastne prilagoditve, nove funkcije ali razhroščevalne različice.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: {
        de: 'Computer (Windows/Mac/Linux)',
        en: 'Computer (Windows/Mac/Linux)',
        sl: 'Računalnik (Windows/Mac/Linux)',
      },
      quantity: 1,
    },
    {
      name: {
        de: 'VS Code Editor',
        en: 'VS Code Editor',
        sl: 'VS Code urejevalnik',
      },
      quantity: 1,
      notes: {
        de: 'Kostenlos',
        en: 'Free',
        sl: 'Brezplačno',
      },
    },
    {
      name: {
        de: 'PlatformIO Extension',
        en: 'PlatformIO Extension',
        sl: 'PlatformIO razširitev',
      },
      quantity: 1,
      notes: {
        de: 'Kostenlos',
        en: 'Free',
        sl: 'Brezplačno',
      },
    },
    {
      name: {
        de: 'Git',
        en: 'Git',
        sl: 'Git',
      },
      quantity: 1,
      notes: {
        de: 'Versionskontrolle',
        en: 'Version control',
        sl: 'Nadzor različic',
      },
    },
    {
      name: {
        de: 'LoRa-Board zum Testen',
        en: 'LoRa board for testing',
        sl: 'LoRa plošča za testiranje',
      },
      quantity: 1,
    },
  ],
  estimatedCost: '0 EUR (Software)',

  code: {
    de: `# Eigene Meshtastic Firmware kompilieren

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
    en: `# Compile Custom Meshtastic Firmware

## Why Compile Yourself?

Reasons for custom firmware:

- **Custom modifications**: Add/remove features
- **Test new features**: Nightly/Development builds
- **Debugging**: Troubleshooting with serial output
- **Learning**: Understand firmware development
- **Contributing**: Contribute to the project

---

## Prerequisites

### Install Software

1. **Git** - https://git-scm.com/
2. **VS Code** - https://code.visualstudio.com/
3. **Python 3.x** - https://python.org/
4. **PlatformIO IDE** - VS Code Extension

### Hardware

- USB cable
- Supported LoRa board (T-Beam, Heltec, RAK, etc.)

---

## Step 1: Clone Repository

\`\`\`bash
# Clone Meshtastic firmware repository
git clone https://github.com/meshtastic/firmware.git
cd firmware

# Initialize submodules (important!)
git submodule update --init --recursive
\`\`\`

### Switch to Specific Version

\`\`\`bash
# Show all tags
git tag

# Switch to stable version
git checkout v2.3.0

# Or latest development
git checkout master
\`\`\`

---

## Step 2: Set Up VS Code & PlatformIO

### Install PlatformIO

1. Open VS Code
2. Extensions (Ctrl+Shift+X)
3. Search for "PlatformIO IDE"
4. Install
5. Restart VS Code

### Open Project

1. File → Open Folder
2. Select the cloned "firmware" folder
3. Wait for PlatformIO to initialize

---

## Step 3: Select Board

### Understanding platformio.ini

The file \`platformio.ini\` contains all board definitions.

### Important Environments

| Environment | Board |
|-------------|-------|
| \`tbeam\` | LILYGO T-Beam v1.0/v1.1 |
| \`tbeam-s3-core\` | T-Beam S3 Core |
| \`tlora-v2-1-1_6\` | LILYGO LoRa32 |
| \`heltec-v3\` | Heltec LoRa V3 |
| \`rak4631\` | RAK WisBlock 4631 |
| \`station-g2\` | B&Q Station G2 |

### Set Build Environment

In VS Code:
1. At the bottom in the status bar
2. Click "env:"
3. Select your board (e.g., \`tbeam\`)

---

## Step 4: Compile

### Via VS Code

1. PlatformIO icon in the sidebar
2. Expand your environment
3. Click "Build"

### Via Terminal

\`\`\`bash
# Compile specific board
pio run -e tbeam

# Compile all boards
pio run
\`\`\`

### Build Output

\`\`\`
Building .pio/build/tbeam/firmware.bin
RAM:   [===       ]  32.5% (used 106756 bytes from 327680 bytes)
Flash: [========  ]  78.4% (used 1539248 bytes from 1966080 bytes)
======================== [SUCCESS] =======================
\`\`\`

---

## Step 5: Flash

### Via VS Code

1. Connect board via USB
2. PlatformIO → "Upload"
3. Wait until complete

### Via Terminal

\`\`\`bash
# Compile and flash
pio run -e tbeam -t upload

# Flash only (if already compiled)
pio run -e tbeam -t upload --upload-port /dev/ttyUSB0
\`\`\`

### Serial Monitor

\`\`\`bash
# View debug output
pio device monitor -e tbeam
\`\`\`

---

## Custom Modifications

### Change Configuration

File: \`src/configuration.h\`

\`\`\`cpp
// Example: Change default name
#define DEVICE_NAME "MyNode"

// Increase debug level
#define LOG_LEVEL LOG_LEVEL_DEBUG
\`\`\`

### Feature Flags

File: \`platformio.ini\` (in environment)

\`\`\`ini
[env:tbeam]
build_flags =
  -D MESHTASTIC_EXCLUDE_GPS=1      ; Disable GPS
  -D MESHTASTIC_EXCLUDE_WIFI=1     ; Disable WiFi
  -D MESHTASTIC_EXCLUDE_SCREEN=1   ; Disable display
\`\`\`

### Add Custom Module

1. New file in \`src/modules/\`
2. Inherit from \`MeshModule\`
3. Register in \`src/modules/Modules.cpp\`

---

## Common Problems

### "ModuleNotFoundError: No module named 'platformio'"

\`\`\`bash
# Install PlatformIO CLI
pip install platformio
\`\`\`

### "fatal: not a git repository"

\`\`\`bash
# In the right folder?
cd firmware
git status
\`\`\`

### Submodules Missing

\`\`\`bash
git submodule update --init --recursive
\`\`\`

### Upload Failed

1. Correct port? (\`/dev/ttyUSB0\` or \`COM3\`)
2. Board in boot mode? (Press BOOT button)
3. USB cable data-capable? (not just charging)
4. Drivers installed? (CP2102/CH340)

### Not Enough Memory

\`\`\`
Error: section '.text' will not fit in region 'irom0_0_seg'
\`\`\`

Solution: Disable features with \`MESHTASTIC_EXCLUDE_*\`

---

## Useful Commands

\`\`\`bash
# Clean everything
pio run -e tbeam -t clean

# Compile only, don't flash
pio run -e tbeam

# Flash filesystem (SPIFFS)
pio run -e tbeam -t uploadfs

# Update all dependencies
pio pkg update

# Show board info
pio device list
\`\`\`

---

## Contributing to the Project

### Create Fork

1. GitHub Account
2. https://github.com/meshtastic/firmware
3. Click "Fork"

### Commit Changes

\`\`\`bash
# Create new branch
git checkout -b my-feature

# Add changes
git add .
git commit -m "Add: My new feature"

# Push to your fork
git push origin my-feature
\`\`\`

### Pull Request

1. Go to your fork on GitHub
2. "Compare & pull request"
3. Describe changes
4. Wait for review

---

## Project Structure

\`\`\`
firmware/
├── src/
│   ├── main.cpp              # Main program
│   ├── configuration.h       # Configuration
│   ├── mesh/                 # Mesh protocol
│   ├── modules/              # Modules (telemetry, etc.)
│   ├── graphics/             # Display graphics
│   └── platform/             # Platform-specific
├── lib/                      # Libraries
├── variants/                 # Board definitions
├── platformio.ini            # Build configuration
└── proto/                    # Protobuf definitions
\`\`\`

---

## Further Resources

- **Discord**: discord.gg/meshtastic (#firmware-dev)
- **GitHub Issues**: Bugs & Feature Requests
- **Docs**: meshtastic.org/docs/development/

---

## Checklist

- [ ] Git installed
- [ ] VS Code installed
- [ ] PlatformIO Extension installed
- [ ] Python 3.x installed
- [ ] Repository cloned
- [ ] Submodules initialized
- [ ] Board environment selected
- [ ] Build successful
- [ ] Upload to board successful
- [ ] Firmware running
`,
    sl: `# Prevajanje lastne Meshtastic strojne programske opreme

## Zakaj prevajati sami?

Razlogi za lastno strojno programsko opremo:

- **Lastne prilagoditve**: Dodajanje/odstranjevanje funkcij
- **Testiranje novih funkcij**: Nightly/Development različice
- **Razhroščevanje**: Iskanje napak s serijskim izhodom
- **Učenje**: Razumevanje razvoja strojne programske opreme
- **Prispevanje**: Prispevanje k projektu

---

## Predpogoji

### Namestitev programske opreme

1. **Git** - https://git-scm.com/
2. **VS Code** - https://code.visualstudio.com/
3. **Python 3.x** - https://python.org/
4. **PlatformIO IDE** - VS Code razširitev

### Strojna oprema

- USB kabel
- Podprta LoRa plošča (T-Beam, Heltec, RAK, itd.)

---

## Korak 1: Kloniranje repozitorija

\`\`\`bash
# Kloniranje Meshtastic firmware repozitorija
git clone https://github.com/meshtastic/firmware.git
cd firmware

# Inicializacija podmodulov (pomembno!)
git submodule update --init --recursive
\`\`\`

### Preklop na določeno različico

\`\`\`bash
# Prikaz vseh oznak
git tag

# Preklop na stabilno različico
git checkout v2.3.0

# Ali najnovejši razvoj
git checkout master
\`\`\`

---

## Korak 2: Nastavitev VS Code & PlatformIO

### Namestitev PlatformIO

1. Odprite VS Code
2. Razširitve (Ctrl+Shift+X)
3. Poiščite "PlatformIO IDE"
4. Namestite
5. Ponovno zaženite VS Code

### Odpiranje projekta

1. File → Open Folder
2. Izberite klonirano mapo "firmware"
3. Počakajte, da se PlatformIO inicializira

---

## Korak 3: Izbira plošče

### Razumevanje platformio.ini

Datoteka \`platformio.ini\` vsebuje vse definicije plošč.

### Pomembna okolja

| Okolje | Plošča |
|--------|--------|
| \`tbeam\` | LILYGO T-Beam v1.0/v1.1 |
| \`tbeam-s3-core\` | T-Beam S3 Core |
| \`tlora-v2-1-1_6\` | LILYGO LoRa32 |
| \`heltec-v3\` | Heltec LoRa V3 |
| \`rak4631\` | RAK WisBlock 4631 |
| \`station-g2\` | B&Q Station G2 |

### Nastavitev okolja za gradnjo

V VS Code:
1. Spodaj v statusni vrstici
2. Kliknite "env:"
3. Izberite svojo ploščo (npr. \`tbeam\`)

---

## Korak 4: Prevajanje

### Preko VS Code

1. PlatformIO ikona v stranski vrstici
2. Razširite svoje okolje
3. Kliknite "Build"

### Preko terminala

\`\`\`bash
# Prevajanje določene plošče
pio run -e tbeam

# Prevajanje vseh plošč
pio run
\`\`\`

### Izhod gradnje

\`\`\`
Building .pio/build/tbeam/firmware.bin
RAM:   [===       ]  32.5% (used 106756 bytes from 327680 bytes)
Flash: [========  ]  78.4% (used 1539248 bytes from 1966080 bytes)
======================== [SUCCESS] =======================
\`\`\`

---

## Korak 5: Nalaganje

### Preko VS Code

1. Povežite ploščo preko USB
2. PlatformIO → "Upload"
3. Počakajte do konca

### Preko terminala

\`\`\`bash
# Prevajanje in nalaganje
pio run -e tbeam -t upload

# Samo nalaganje (če je že prevedeno)
pio run -e tbeam -t upload --upload-port /dev/ttyUSB0
\`\`\`

### Serijski monitor

\`\`\`bash
# Ogled razhroščevalnega izhoda
pio device monitor -e tbeam
\`\`\`

---

## Lastne prilagoditve

### Spreminjanje konfiguracije

Datoteka: \`src/configuration.h\`

\`\`\`cpp
// Primer: Spremeni privzeto ime
#define DEVICE_NAME "MojNode"

// Povečaj nivo razhroščevanja
#define LOG_LEVEL LOG_LEVEL_DEBUG
\`\`\`

### Zastavice funkcij

Datoteka: \`platformio.ini\` (v okolju)

\`\`\`ini
[env:tbeam]
build_flags =
  -D MESHTASTIC_EXCLUDE_GPS=1      ; Onemogoči GPS
  -D MESHTASTIC_EXCLUDE_WIFI=1     ; Onemogoči WiFi
  -D MESHTASTIC_EXCLUDE_SCREEN=1   ; Onemogoči zaslon
\`\`\`

### Dodajanje lastnega modula

1. Nova datoteka v \`src/modules/\`
2. Dedovanje iz \`MeshModule\`
3. Registracija v \`src/modules/Modules.cpp\`

---

## Pogoste težave

### "ModuleNotFoundError: No module named 'platformio'"

\`\`\`bash
# Namestitev PlatformIO CLI
pip install platformio
\`\`\`

### "fatal: not a git repository"

\`\`\`bash
# V pravi mapi?
cd firmware
git status
\`\`\`

### Manjkajoči podmoduli

\`\`\`bash
git submodule update --init --recursive
\`\`\`

### Nalaganje ni uspelo

1. Pravilna vrata? (\`/dev/ttyUSB0\` ali \`COM3\`)
2. Plošča v zagonskem načinu? (Pritisnite tipko BOOT)
3. USB kabel podpira prenos podatkov? (ne samo polnjenje)
4. Gonilniki nameščeni? (CP2102/CH340)

### Premalo pomnilnika

\`\`\`
Error: section '.text' will not fit in region 'irom0_0_seg'
\`\`\`

Rešitev: Onemogočite funkcije z \`MESHTASTIC_EXCLUDE_*\`

---

## Uporabni ukazi

\`\`\`bash
# Počisti vse
pio run -e tbeam -t clean

# Samo prevedi, ne naloži
pio run -e tbeam

# Naloži datotečni sistem (SPIFFS)
pio run -e tbeam -t uploadfs

# Posodobi vse odvisnosti
pio pkg update

# Prikaži informacije o plošči
pio device list
\`\`\`

---

## Prispevanje k projektu

### Ustvarjanje fork-a

1. GitHub račun
2. https://github.com/meshtastic/firmware
3. Kliknite "Fork"

### Objava sprememb

\`\`\`bash
# Ustvari novo vejo
git checkout -b moja-funkcija

# Dodaj spremembe
git add .
git commit -m "Add: Moja nova funkcija"

# Potisni na svoj fork
git push origin moja-funkcija
\`\`\`

### Pull Request

1. Pojdite na svoj fork na GitHub
2. "Compare & pull request"
3. Opišite spremembe
4. Počakajte na pregled

---

## Struktura projekta

\`\`\`
firmware/
├── src/
│   ├── main.cpp              # Glavni program
│   ├── configuration.h       # Konfiguracija
│   ├── mesh/                 # Mesh protokol
│   ├── modules/              # Moduli (telemetrija, itd.)
│   ├── graphics/             # Grafika zaslona
│   └── platform/             # Platformno specifično
├── lib/                      # Knjižnice
├── variants/                 # Definicije plošč
├── platformio.ini            # Konfiguracija gradnje
└── proto/                    # Protobuf definicije
\`\`\`

---

## Dodatni viri

- **Discord**: discord.gg/meshtastic (#firmware-dev)
- **GitHub Issues**: Napake & Zahteve za funkcije
- **Dokumentacija**: meshtastic.org/docs/development/

---

## Kontrolni seznam

- [ ] Git nameščen
- [ ] VS Code nameščen
- [ ] PlatformIO razširitev nameščena
- [ ] Python 3.x nameščen
- [ ] Repozitorij kloniran
- [ ] Podmoduli inicializirani
- [ ] Okolje plošče izbrano
- [ ] Gradnja uspešna
- [ ] Nalaganje na ploščo uspešno
- [ ] Strojna programska oprema deluje
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'CUSTOM_FIRMWARE_GUIDE.md',

  externalLinks: [
    {
      title: {
        de: 'Meshtastic Firmware GitHub',
        en: 'Meshtastic Firmware GitHub',
        sl: 'Meshtastic Firmware GitHub',
      },
      url: 'https://github.com/meshtastic/firmware',
    },
    {
      title: {
        de: 'PlatformIO Docs',
        en: 'PlatformIO Docs',
        sl: 'PlatformIO dokumentacija',
      },
      url: 'https://docs.platformio.org/',
    },
    {
      title: {
        de: 'Meshtastic Development Docs',
        en: 'Meshtastic Development Docs',
        sl: 'Meshtastic razvojna dokumentacija',
      },
      url: 'https://meshtastic.org/docs/development/',
    },
    {
      title: {
        de: 'VS Code Download',
        en: 'VS Code Download',
        sl: 'VS Code prenos',
      },
      url: 'https://code.visualstudio.com/',
    },
  ],

  customizationSuggestions: [
    {
      de: 'Wie deaktiviere ich GPS in der Firmware?',
      en: 'How do I disable GPS in the firmware?',
      sl: 'Kako onemogočim GPS v strojni programski opremi?',
    },
    {
      de: 'Wie füge ich ein eigenes Modul hinzu?',
      en: 'How do I add a custom module?',
      sl: 'Kako dodam lasten modul?',
    },
    {
      de: 'Welche Build-Flags gibt es?',
      en: 'What build flags are available?',
      sl: 'Katere zastavice za gradnjo so na voljo?',
    },
    {
      de: 'Wie debugge ich die Firmware?',
      en: 'How do I debug the firmware?',
      sl: 'Kako razhroščujem strojno programsko opremo?',
    },
    {
      de: 'Wie erstelle ich einen Pull Request?',
      en: 'How do I create a pull request?',
      sl: 'Kako ustvarim pull request?',
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
          de: 'Gut dokumentiert',
          en: 'Well documented',
          sl: 'Dobro dokumentiran',
        },
        {
          de: 'Viele Beispiele',
          en: 'Many examples',
          sl: 'Veliko primerov',
        },
      ],
      recommended: true,
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
          sl: 'Ugoden',
        },
        {
          de: 'Schnelles Flashen',
          en: 'Fast flashing',
          sl: 'Hitro nalaganje',
        },
      ],
    },
    {
      name: {
        de: 'RAK WisBlock 4631',
        en: 'RAK WisBlock 4631',
        sl: 'RAK WisBlock 4631',
      },
      price: '~30€',
      features: [
        {
          de: 'nRF52',
          en: 'nRF52',
          sl: 'nRF52',
        },
        {
          de: 'Andere Toolchain',
          en: 'Different toolchain',
          sl: 'Drugačna orodna veriga',
        },
      ],
    },
  ],
};
