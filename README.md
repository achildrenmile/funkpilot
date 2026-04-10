# FunkPilot - AI Assistant for Radio Enthusiasts

[![Featured on oeradio.at](https://img.shields.io/badge/Featured_on-oeradio.at-2563eb?style=flat-square)](https://oeradio.at/werkzeuge/) [![Live Demo](https://img.shields.io/badge/Live_Demo-funkpilot.oeradio.at-16a34a?style=flat-square)](https://funkpilot.oeradio.at) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> 🎙️ **Part of the [oeradio.at](https://oeradio.at/werkzeuge/) open source ham radio tool collection.**
> Browse all tools → [**oeradio.at/werkzeuge**](https://oeradio.at/werkzeuge/)

<p align="center">
  <img src="public/favicon.svg" alt="FunkPilot Logo" width="100" height="100">
</p>

<p align="center">
  <strong>🇦🇹 Deutsch</strong> | <strong>🇬🇧 English</strong> | <strong>🇸🇮 Slovenščina</strong>
</p>

FunkPilot is a modern web assistant for radio enthusiasts — **amateur radio operators, CB radio users, PMR, SWL listeners, SDR hobbyists** and anyone interested in radio communication. Combining AI capabilities with practical tools for radio operation.

## Features

### 🎙️ Voice CQ Generator
- Generate natural-sounding CQ calls and contest phrases
- **Edge TTS Neural Voices** (free, high quality)
  - English: Guy, Christopher, Jenny (US), Ryan, Sonia (UK)
  - German: Ingrid, Jonas (AT), Conrad, Katja (DE)
- NATO phonetic alphabet support for callsigns
- Templates for common contests (CQWW, WPX, SOTA, POTA)
- Browser TTS as fallback

### 🤖 QSO Chat Assistant
- AI-powered chat specifically for amateur radio questions
- **Transparent Processing**: Live status during processing
  - 🌐 Web search (Tavily) for current information
  - 📻 Callsign lookup (OE list, QRZ, HamQTH)
  - 🔍 Suffix availability check
  - 👤 Callsign suggestion generator
  - ✨ AI processing
- **Callsign Query**: Automatic search in official OE list, QRZ.com & HamQTH
- **Web Search**: Current info on contests, propagation & news (via Tavily)
- Technical questions, operating procedures, regulations
- Propagation advice with current solar data
- **Chat History** with multiple conversations:
  - Sidebar with all chats (Desktop: permanent, Mobile: drawer)
  - Automatic title generation from first message
  - Switch between conversations
  - Delete chats
  - Local storage (max 50 chats, 50 messages/chat)
- **QRZ.com Integration**:
  - Automatic callsign query when mentioned in chat
  - Name, QTH, grid locator, license class
  - Requires QRZ XML Subscription
- **Ham Radio Tools** (with Groq MCP):
  - Band plan queries
  - Wavelength calculation
  - EIRP calculation
  - Cable loss calculation
  - SWR loss calculation
  - Battery runtime calculation
  - Power conversion (W ↔ dBm)

### 📊 Contest Log Analysis
- ADIF import for contest logs
- Detailed statistics
- AI-generated analysis with improvement suggestions

### 📻 Callsign Finder
- **Callsign Search**: Look up OE callsigns with official data from the telecommunications office
- **Pirate Detection**: Warning if callsign exists in QRZ but is not officially registered
- **Availability Check**: Check suffix in all 9 states (OE1-OE9)
- **Suggestion Generator**: Generate matching callsigns based on names
- **Chat Integration**: All features also available directly in chat
  - "Who is OE3NSC?" → Callsign lookup
  - "Is suffix ABC still available?" → Check availability
  - "Callsign for Max Mustermann" → Generate suggestions
- Data source: Official telecommunications office list (7400+ OE callsigns)

### 🌍 Propagation Advisor
- Real-time solar data (SFI, K-Index, A-Index)
- **QTH-based calculations** (day/night/greyline based on your location)
- Band status for all bands (6m - 160m)
- AI recommendations for DX connections

### 🔧 DIY Projects
- **35 Ham Radio Projects** with full documentation
- Build guides, code, wiring diagrams
- Categories: CW/Morse, Measurement, Antenna, Digital/APRS, Audio, Control, Mesh/LoRa
- **Available in 3 languages**: German, English, Slovenian
- **Deep linking**: Share projects directly via URL

### 🌍 Multilingual
- **Three Languages**: German (default), English, Slovenščina
- **Automatic Detection**: Browser language is detected
- **Language Selection**: In header and settings
- **Fully Translated**: All UI text in all languages
- **Shareable URLs**: Language in URL (e.g., `#/projects/meshtastic-getting-started/sl`)

### 🎨 Themes & Design
- **Dark Mode** (default) - Easy on the eyes for long operating sessions
- **Light Mode** - Better readability in daylight
- **Responsive Design** - Optimized for desktop, tablet and mobile
- **PWA Support** - Installable on phone/tablet
- Settings saved locally

### ❓ Help
- Integrated help page with feature documentation
- Keyboard shortcut: `?` opens help modal
- `Esc` closes dialogs

## Quick Start with Docker

```bash
# Clone repository
git clone https://github.com/oe8yml/funkpilot.git
cd funkpilot

# Create .env file
cp .env.docker .env

# Add API key (at least one required)
nano .env

# Start Docker container
docker compose up -d
```

The app runs at http://localhost:3001

## API Keys

FunkPilot supports three AI providers. At least one must be configured:

### Option 1: Groq (Recommended - Free + Ham Radio Tools)
- **Llama 3.3 70B is completely free** with generous rate limits
- Very fast response times
- **MCP Integration**: Access to Ham Radio calculation tools
  - Band plan, wavelength, EIRP, cable loss, SWR, battery runtime
- Create key: [console.groq.com/keys](https://console.groq.com/keys)

```bash
GROQ_API_KEY=gsk_...
```

### Option 2: Anthropic Claude (Best Quality)
- Highest quality for German language responses
- Cost: ~$3/Million Tokens
- Create key: [console.anthropic.com](https://console.anthropic.com)

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### Option 3: OpenRouter (Fallback)
- Access to many models
- Backup option if other providers unavailable
- Create key: [openrouter.ai/keys](https://openrouter.ai/keys)

```bash
OPENROUTER_API_KEY=sk-or-...
```

### Optional: QRZ.com (Callsign Lookup)
- Automatic callsign information query
- Shows name, QTH, grid, license class
- Requires QRZ XML Subscription (~$35/year): [qrz.com/page/xml_data.html](https://www.qrz.com/page/xml_data.html)

```bash
QRZ_USERNAME=YOUR_CALLSIGN
QRZ_PASSWORD=YOUR_QRZ_PASSWORD
```

### Optional: Tavily (Web Search)
- Current information on contests, propagation and amateur radio news
- EU GDPR compliant, no storage of search queries
- Free API key: [tavily.com](https://tavily.com)

```bash
TAVILY_API_KEY=tvly-...
```

### Provider Priority

FunkPilot tries providers in this order:
1. **Groq + MCP** (free, fast, with Ham Radio Tools)
2. **Groq** (fallback without MCP)
3. **Anthropic** (best quality)
4. **OpenRouter** (fallback)

### Ham Radio Tools (MCP)

With GROQ_API_KEY, the chat assistant has access to special amateur radio tools:

| Tool | Description |
|------|-------------|
| `get_band_plan` | Get IARU Region 1 band plan |
| `calculate_wavelength` | Wavelength from frequency |
| `calculate_eirp` | EIRP from TX power + antenna gain |
| `calculate_cable_loss` | Calculate cable attenuation |
| `compare_cables` | Compare cable types |
| `calculate_battery_runtime` | Calculate battery runtime |
| `check_frequency` | Check frequency in band plan |
| `convert_power` | Watt ↔ dBm conversion |
| `calculate_swr_loss` | Loss due to SWR |
| `get_antenna_gain` | Look up antenna gain |

## Development

### Prerequisites
- Node.js 20+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start frontend + backend
npm run dev:full

# Frontend only
npm run dev

# Backend only
npm run dev:server
```

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Set at least one API key (Groq recommended)
GROQ_API_KEY=gsk_...
# or
ANTHROPIC_API_KEY=sk-ant-...
# or
OPENROUTER_API_KEY=sk-or-...
```

### Build

```bash
# Production build
npm run build:all

# Start server
npm start
```

### Testing

FunkPilot uses Vitest for automated tests.

```bash
# Run all tests
npm test

# Tests in watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

**Tested Areas:**
- `phonetic.ts` - NATO alphabet conversion
- `locator.ts` - Maidenhead locator calculations
- `adifParser.ts` - ADIF import/export
- `i18n` - Translation completeness (DE, EN, SL)
- `API` - Endpoint integration

## Docker

### With Docker Compose (Recommended)

```bash
# Start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t funkpilot .

# Start container (with Groq - recommended)
docker run -d \
  -p 3001:3001 \
  -e GROQ_API_KEY=gsk_... \
  --name funkpilot \
  funkpilot
```

## Project Structure

```
funkpilot/
├── src/                    # Frontend (React)
│   ├── components/         # UI Components
│   ├── services/          # API Client
│   ├── utils/             # Helper functions
│   └── types/             # TypeScript Types
├── server/                 # Backend (Express)
│   └── index.ts           # API Server
├── Dockerfile             # Docker Build
├── docker-compose.yml     # Docker Compose
└── package.json
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FUNKPILOT                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               FRONTEND (React + Vite)                    │   │
│  │                                                          │   │
│  │  Voice CQ │ Chat │ Log Analysis │ Propagation │ Callsign │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                   │
│                            ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               BACKEND (Express.js)                       │   │
│  │                                                          │   │
│  │  /api/chat           - AI Chat (Standard)               │   │
│  │  /api/chat-groq-mcp  - AI Chat + Ham Radio Tools        │   │
│  │  /api/callsign/*     - Callsign Search/Suggestions      │   │
│  │  /api/analyze        - Log Analysis                     │   │
│  │  /api/propagation    - DX Recommendations               │   │
│  │  /api/solar          - Solar Data Proxy                 │   │
│  │  /api/tts/*          - Edge TTS Neural Voices           │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                   │
│      ┌─────────────────────┼─────────────────────────┐        │
│      ▼           ▼         ▼         ▼               ▼        │
│  ┌────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────┐ ┌────────┐│
│  │ Groq   │ │Anthropic│ │OpenRouter│ │  HamQSL   │ │ Edge │ │  OE    ││
│  │ + MCP  │ │ Claude  │ │(fallback)│ │Solar Data │ │ TTS  │ │Callsign││
│  └───┬────┘ └─────────┘ └──────────┘ └───────────┘ └──────┘ └────────┘│
│      │                                                        │
│      │  ┌──────────┐                                         │
│      │  │ Tavily   │  Web search for current info            │
│      │  │ Search   │  (Contests, Propagation, News)          │
│      │  └──────────┘                                         │
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

## Parent Site Branding

FunkPilot can be embedded as part of a larger website with custom branding.

### Via Docker Environment Variables

```bash
docker run -d \
  -p 3001:3001 \
  -e PARENT_SITE_URL=https://example.com \
  -e PARENT_SITE_LOGO=https://example.com/logo.png \
  -e PARENT_SITE_NAME="Example Site" \
  funkpilot
```

### Via config.json

Alternatively, edit `public/config.json` directly:

```json
{
  "parentSiteUrl": "https://example.com",
  "parentSiteLogo": "https://example.com/logo.png",
  "parentSiteName": "Example Site"
}
```

| Variable | Description |
|----------|-------------|
| `PARENT_SITE_URL` | URL of the parent website |
| `PARENT_SITE_LOGO` | Logo URL of the parent website |
| `PARENT_SITE_NAME` | Name of the parent website |

## Security

- API keys are stored server-side only
- No API keys in frontend or localStorage
- CORS configured for secure communication
- Health check endpoint only shows if keys exist, not the keys themselves

## Amateur Radio Resources

- [IARU Region 1 Band Plan](https://www.iaru-r1.org/reference/band-plans/)
- [OEVSV Band Plan](https://www.oevsv.at/technik/bandplaene/)
- [WA7BNM Contest Calendar](https://www.contestcalendar.com/)
- [PSK Reporter](https://pskreporter.info/)

## Contributing

Contributions are welcome! Please create a pull request or issue on GitHub.

## License

MIT License - see [LICENSE](LICENSE)

---

**73 de OE8YML**

*FunkPilot - Your AI Assistant for Amateur Radio*
