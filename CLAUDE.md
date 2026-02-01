# FunkPilot - Claude Code Instructions

## Deployment

**IMPORTANT: Never run local Docker deployments (docker compose up, docker build, etc.).**

Always deploy directly to production using:
```bash
./deploy-production.sh
```

Production environment:
- Host: `straliadmin@station.strali.solutions`
- Container: `funkpilot` on port 3415
- URL: https://funkpilot.oeradio.at/

## Landing Page (docs/index.html)

**IMPORTANT: After every new release, update `docs/index.html` to match.**

The landing page is a static multilingual (DE/EN/SI) page served via GitHub Pages at https://achildrenmile.github.io/funkpilot/

### What to update on each release:

1. **Version number** — update in these locations:
   - Hero version badge: `data-i18n="hero_version"` element and all 3 translation keys (`hero_version` in DE/EN/SI)
   - Stats box: `stat-val` for Release
   - Footer: `FunkPilot vX.X.X - 73 de OE8YML`

2. **Timeline** — add or update the top `tl-item now` entry:
   - Move the `now` class and `Latest` badge to the new version
   - Consolidate older minor versions (e.g. v1.13.0–1.13.3 → v1.13.x) to keep the timeline compact
   - Update the `data-i18n` keys and all 3 translation strings (DE/EN/SI)

3. **Translation keys** — every visible text uses `data-i18n` attributes with translations in the `T` object (de/en/sl). Always update all 3 languages.

### Rules:
- Never hardcode project counts (no "19 Projekte" etc.)
- Version badge shows only the version number (e.g. "v1.13.3"), no description
- Read `src/data/changelog.ts` for the latest version and release notes
- Keep the timeline to ~8 entries max by consolidating older versions

## AI Provider

Primary AI provider is **Groq** (free, fast) with Llama 3.1 8B model.
API key is in `.env.production` on the Synology.

## Legal Compliance

Site must comply with:
- Austrian ECG § 5 and MedienG § 25 (Impressum)
- EU GDPR / DSGVO (Privacy Policy)
- Operator: Michael Linder (OE8YML), Nötsch, Austria
