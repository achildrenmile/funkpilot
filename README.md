# FunkPilot - KI-Assistent für Funkamateure

<p align="center">
  <img src="public/favicon.svg" alt="FunkPilot Logo" width="100" height="100">
</p>

FunkPilot ist ein moderner Web-Assistent für Funkamateure, der KI-Funktionen mit praktischen Tools für den Amateurfunk-Betrieb kombiniert.

## Features

### 🎙️ Voice CQ Generator
- Generiere natürlich klingende CQ-Rufe und Contest-Phrasen
- NATO-Phonetik Unterstützung für Rufzeichen
- Verschiedene TTS-Stimmen (Browser-basiert)
- Vorlagen für alle gängigen Contests (CQWW, WPX, SOTA, POTA)

### 🤖 QSO-Chat-Assistent
- KI-gestützter Chat speziell für Amateurfunk-Fragen
- Technik, Betriebsverfahren, Vorschriften
- Propagation-Beratung mit aktuellen Solar-Daten

### 📊 Contest-Log-Analyse
- ADIF-Import für Contest-Logs
- Detaillierte Statistiken
- KI-generierte Analyse mit Verbesserungsvorschlägen

### 🌍 Propagation-Berater
- Echtzeit Solar-Daten (SFI, K-Index, A-Index)
- KI-Empfehlungen für DX-Verbindungen
- Band-Öffnungs-Prognosen

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

### Option 1: Groq (Empfohlen - Kostenlos)
- **Llama 3.1 8B ist komplett kostenlos** mit großzügigen Rate Limits
- Sehr schnelle Antwortzeiten
- Gute Qualität für deutschsprachige Antworten
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
1. **Groq** (kostenlos, schnell)
2. **Anthropic** (beste Qualität)
3. **OpenRouter** (Fallback)

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
┌─────────────────────────────────────────────────────────────┐
│                     FUNKPILOT                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              FRONTEND (React + Vite)                 │   │
│  │                                                      │   │
│  │  Voice CQ │ Chat │ Log-Analyse │ Propagation        │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              BACKEND (Express.js)                    │   │
│  │                                                      │   │
│  │  /api/chat     - KI Chat                            │   │
│  │  /api/analyze  - Log Analyse                        │   │
│  │  /api/propagation - DX Empfehlungen                 │   │
│  │  /api/solar    - Solar Daten Proxy                  │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                               │
│      ┌─────────────────────┼─────────────────────┐        │
│      ▼           ▼         ▼         ▼           ▼        │
│  ┌───────┐  ┌─────────┐  ┌──────────┐  ┌─────────────┐   │
│  │ Groq  │  │Anthropic│  │OpenRouter│  │   HamQSL    │   │
│  │ (rec) │  │ Claude  │  │(fallback)│  │ Solar Data  │   │
│  └───────┘  └─────────┘  └──────────┘  └─────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
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
