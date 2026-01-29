# FunkPilot - KI-Assistent für Funkamateure

<p align="center">
  <img src="public/favicon.svg" alt="FunkPilot Logo" width="100" height="100">
</p>

FunkPilot ist ein moderner Web-Assistent für Funkamateure, der KI-Funktionen mit praktischen Tools für den Amateurfunk-Betrieb kombiniert.

## Features

### 🎙️ Voice CQ Generator
- Generiere natürlich klingende CQ-Rufe und Contest-Phrasen
- **Edge TTS Neural Voices** (kostenlos, hochwertig)
  - Englisch: Guy, Christopher, Jenny (US), Ryan, Sonia (UK)
  - Deutsch: Ingrid, Jonas (AT), Conrad, Katja (DE)
- NATO-Phonetik Unterstützung für Rufzeichen
- Vorlagen für alle gängigen Contests (CQWW, WPX, SOTA, POTA)
- Browser TTS als Fallback

### 🤖 QSO-Chat-Assistent
- KI-gestützter Chat speziell für Amateurfunk-Fragen
- Technik, Betriebsverfahren, Vorschriften
- Propagation-Beratung mit aktuellen Solar-Daten
- **Ham Radio Tools** (mit Groq MCP):
  - Bandplan-Abfragen
  - Wellenlängen-Berechnung
  - EIRP-Berechnung
  - Kabelverlust-Berechnung
  - SWR-Verlust-Berechnung
  - Akkulaufzeit-Berechnung
  - Leistungs-Umrechnung (W ↔ dBm)

### 📊 Contest-Log-Analyse
- ADIF-Import für Contest-Logs
- Detaillierte Statistiken
- KI-generierte Analyse mit Verbesserungsvorschlägen

### 🌍 Propagation-Berater
- Echtzeit Solar-Daten (SFI, K-Index, A-Index)
- **QTH-basierte Berechnungen** (Tag/Nacht/Greyline basierend auf deinem Standort)
- Band-Status für alle Bänder (6m - 160m)
- KI-Empfehlungen für DX-Verbindungen

### 🎨 Themes
- **Dunkel-Modus** (Standard) - Augenfreundlich für lange Betriebssessions
- **Hell-Modus** - Bessere Lesbarkeit bei Tageslicht
- Einstellung wird lokal gespeichert

### ❓ Hilfe
- Integrierte Hilfe-Seite mit Feature-Dokumentation
- Tastenkürzel: `?` öffnet Hilfe-Modal
- `Esc` schließt Dialoge

## Quick Start mit Docker

```bash
# Repository klonen
git clone https://github.com/oe8yml/funkpilot.git
cd funkpilot

# .env Datei erstellen
cp .env.docker .env

# API-Key eintragen (mindestens einen)
nano .env

# Docker Container starten
docker compose up -d
```

Die App läuft unter http://localhost:3001

## API-Keys

FunkPilot unterstützt drei KI-Provider. Mindestens einer muss konfiguriert werden:

### Option 1: Groq (Empfohlen - Kostenlos + Ham Radio Tools)
- **Llama 3.3 70B ist komplett kostenlos** mit großzügigen Rate Limits
- Sehr schnelle Antwortzeiten
- **MCP Integration**: Zugang zu Ham Radio Berechnungs-Tools
  - Bandplan, Wellenlänge, EIRP, Kabelverlust, SWR, Akkulaufzeit
- Key erstellen: [console.groq.com/keys](https://console.groq.com/keys)

```bash
GROQ_API_KEY=gsk_...
```

### Option 2: Anthropic Claude (Beste Qualität)
- Höchste Qualität für deutschsprachige Antworten
- Kosten: ~$3/Million Tokens
- Key erstellen: [console.anthropic.com](https://console.anthropic.com)

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### Option 3: OpenRouter (Fallback)
- Zugang zu vielen Modellen
- Backup-Option falls andere Provider nicht verfügbar
- Key erstellen: [openrouter.ai/keys](https://openrouter.ai/keys)

```bash
OPENROUTER_API_KEY=sk-or-...
```

### Provider-Priorität

FunkPilot versucht die Provider in dieser Reihenfolge:
1. **Groq + MCP** (kostenlos, schnell, mit Ham Radio Tools)
2. **Groq** (Fallback ohne MCP)
3. **Anthropic** (beste Qualität)
4. **OpenRouter** (Fallback)

### Ham Radio Tools (MCP)

Mit GROQ_API_KEY hat der Chat-Assistent Zugang zu speziellen Amateurfunk-Tools:

| Tool | Beschreibung |
|------|-------------|
| `get_band_plan` | IARU Region 1 Bandplan abrufen |
| `calculate_wavelength` | Wellenlänge aus Frequenz |
| `calculate_eirp` | EIRP aus TX-Leistung + Antennengewinn |
| `calculate_cable_loss` | Kabeldämpfung berechnen |
| `compare_cables` | Kabeltypen vergleichen |
| `calculate_battery_runtime` | Akkulaufzeit berechnen |
| `check_frequency` | Frequenz im Bandplan prüfen |
| `convert_power` | Watt ↔ dBm umrechnen |
| `calculate_swr_loss` | Verlust durch SWR |
| `get_antenna_gain` | Antennengewinn nachschlagen |

## Entwicklung

### Voraussetzungen
- Node.js 20+
- npm

### Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Frontend + Backend starten
npm run dev:full

# Nur Frontend
npm run dev

# Nur Backend
npm run dev:server
```

### Umgebungsvariablen

Erstelle eine `.env` Datei im Root-Verzeichnis:

```bash
# Mindestens einen API-Key setzen (Groq empfohlen)
GROQ_API_KEY=gsk_...
# oder
ANTHROPIC_API_KEY=sk-ant-...
# oder
OPENROUTER_API_KEY=sk-or-...
```

### Build

```bash
# Production Build
npm run build:all

# Server starten
npm start
```

## Docker

### Mit Docker Compose (Empfohlen)

```bash
# Starten
docker compose up -d

# Logs anzeigen
docker compose logs -f

# Stoppen
docker compose down
```

### Manueller Docker Build

```bash
# Image bauen
docker build -t funkpilot .

# Container starten (mit Groq - empfohlen)
docker run -d \
  -p 3001:3001 \
  -e GROQ_API_KEY=gsk_... \
  --name funkpilot \
  funkpilot
```

## Projektstruktur

```
funkpilot/
├── src/                    # Frontend (React)
│   ├── components/         # UI Komponenten
│   ├── services/          # API Client
│   ├── utils/             # Hilfsfunktionen
│   └── types/             # TypeScript Types
├── server/                 # Backend (Express)
│   └── index.ts           # API Server
├── Dockerfile             # Docker Build
├── docker-compose.yml     # Docker Compose
└── package.json
```

## Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        FUNKPILOT                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               FRONTEND (React + Vite)                    │   │
│  │                                                          │   │
│  │  Voice CQ │ Chat │ Log-Analyse │ Propagation            │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                   │
│                            ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               BACKEND (Express.js)                       │   │
│  │                                                          │   │
│  │  /api/chat          - KI Chat (Standard)                │   │
│  │  /api/chat-groq-mcp - KI Chat + Ham Radio Tools         │   │
│  │  /api/analyze       - Log Analyse                       │   │
│  │  /api/propagation   - DX Empfehlungen                   │   │
│  │  /api/solar         - Solar Daten Proxy                 │   │
│  │  /api/tts/*         - Edge TTS Neural Voices            │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                   │
│      ┌─────────────────────┼─────────────────────────┐        │
│      ▼           ▼         ▼         ▼               ▼        │
│  ┌────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────┐  │
│  │ Groq   │ │Anthropic│ │OpenRouter│ │  HamQSL   │ │ Edge │  │
│  │ + MCP  │ │ Claude  │ │(fallback)│ │Solar Data │ │ TTS  │  │
│  └───┬────┘ └─────────┘ └──────────┘ └───────────┘ └──────┘  │
│      │                                                        │
│      ▼                                                        │
│  ┌──────────────────────┐                                    │
│  │   oeradio-mcp        │                                    │
│  │   Ham Radio Tools    │                                    │
│  │   (Remote MCP)       │                                    │
│  └──────────────────────┘                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Parent-Site Branding

FunkPilot kann als Teil einer größeren Website mit eigenem Branding eingebettet werden.

### Über Docker Umgebungsvariablen

```bash
docker run -d \
  -p 3001:3001 \
  -e PARENT_SITE_URL=https://example.com \
  -e PARENT_SITE_LOGO=https://example.com/logo.png \
  -e PARENT_SITE_NAME="Example Site" \
  funkpilot
```

### Über config.json

Alternativ kann `public/config.json` direkt editiert werden:

```json
{
  "parentSiteUrl": "https://example.com",
  "parentSiteLogo": "https://example.com/logo.png",
  "parentSiteName": "Example Site"
}
```

| Variable | Beschreibung |
|----------|-------------|
| `PARENT_SITE_URL` | URL der übergeordneten Website |
| `PARENT_SITE_LOGO` | Logo-URL der übergeordneten Website |
| `PARENT_SITE_NAME` | Name der übergeordneten Website |

## Sicherheit

- API-Keys werden nur serverseitig gespeichert
- Keine API-Keys im Frontend oder LocalStorage
- CORS konfiguriert für sichere Kommunikation
- Health-Check Endpoint zeigt nur ob Keys vorhanden sind, nicht die Keys selbst

## Amateurfunk-Ressourcen

- [IARU Region 1 Bandplan](https://www.iaru-r1.org/reference/band-plans/)
- [ÖVSV Bandplan](https://www.oevsv.at/technik/bandplaene/)
- [WA7BNM Contest Calendar](https://www.contestcalendar.com/)
- [PSK Reporter](https://pskreporter.info/)

## Contributing

Beiträge sind willkommen! Bitte erstelle einen Pull Request oder Issue auf GitHub.

## Lizenz

MIT License - siehe [LICENSE](LICENSE)

---

**73 de OE8YML**

*FunkPilot - Dein KI-Assistent für den Amateurfunk*
