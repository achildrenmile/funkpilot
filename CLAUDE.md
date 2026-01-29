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

## AI Provider

Primary AI provider is **Groq** (free, fast) with Llama 3.1 8B model.
API key is in `.env.production` on the Synology.

## Legal Compliance

Site must comply with:
- Austrian ECG § 5 and MedienG § 25 (Impressum)
- EU GDPR / DSGVO (Privacy Policy)
- Operator: Michael Linder (OE8YML), Nötsch, Austria
