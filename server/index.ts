import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// API Keys from environment
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
app.use(express.static(join(__dirname, '../dist')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasAnthropicKey: !!ANTHROPIC_API_KEY,
    hasOpenRouterKey: !!OPENROUTER_API_KEY,
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;

    // Try Anthropic first, fall back to OpenRouter
    if (ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      res.json({ content: data.content[0]?.text || '' });
      return;
    }

    if (OPENROUTER_API_KEY) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://funkpilot.local',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: system },
            ...messages,
          ],
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      res.json({ content: data.choices[0]?.message?.content || '' });
      return;
    }

    res.status(503).json({ error: 'No AI API key configured' });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Log analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { stats, contestName } = req.body;

    const prompt = `Analysiere dieses Contest-Log und gib detaillierte Verbesserungsvorschläge.

Contest: ${contestName}

Log-Statistiken:
- Gesamt QSOs: ${stats.totalQsos}
- Unique Callsigns: ${stats.uniqueCallsigns}
- Duplikate: ${stats.dupes}
- Operating Time: ${stats.operatingTime} Minuten
- Durchschnittliche Rate: ${stats.operatingTime > 0 ? (stats.totalQsos / (stats.operatingTime / 60)).toFixed(1) : 0} QSO/h

QSOs nach Band:
${Object.entries(stats.qsosByBand).map(([band, count]) => `  ${band}: ${count} QSOs`).join('\n')}

Länder: ${stats.countries?.length || 0}
CQ-Zonen: ${stats.cqZones?.join(', ') || 'keine'}

Gib eine strukturierte Analyse auf Deutsch mit:
1. **Zusammenfassung**
2. **Stärken** (3-5 Punkte)
3. **Verbesserungspotential** (3-5 Punkte)
4. **Empfehlungen** (3-5 Punkte)`;

    // Use the same logic as chat
    if (ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      res.json({ content: data.content[0]?.text || '' });
      return;
    }

    if (OPENROUTER_API_KEY) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      res.json({ content: data.choices[0]?.message?.content || '' });
      return;
    }

    res.status(503).json({ error: 'No AI API key configured' });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Propagation advice endpoint
app.post('/api/propagation', async (req, res) => {
  try {
    const { target, locator, solarData } = req.body;

    const prompt = `Du bist ein Experte für Kurzwellen-Ausbreitung. Gib Empfehlungen für DX-Verbindungen.

Von: Österreich (${locator || 'JN77'})
Ziel: ${target}

Aktuelle Solar-Bedingungen:
- Solar Flux Index: ${solarData.sfi}
- K-Index: ${solarData.kIndex}
- A-Index: ${solarData.aIndex}
- Sonnenflecken: ${solarData.sunspots}

Aktuelle UTC-Zeit: ${new Date().toUTCString()}

Gib detaillierte Empfehlungen auf Deutsch:
1. **Aktuelle Situation**
2. **Beste Optionen jetzt** (2-3 Band/Pfad-Empfehlungen)
3. **Nicht empfohlen**
4. **Alternative Zeiten**`;

    if (ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      res.json({ content: data.content[0]?.text || '' });
      return;
    }

    if (OPENROUTER_API_KEY) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      res.json({ content: data.choices[0]?.message?.content || '' });
      return;
    }

    res.status(503).json({ error: 'No AI API key configured' });
  } catch (error) {
    console.error('Propagation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Solar data proxy (to avoid CORS issues)
app.get('/api/solar', async (_req, res) => {
  try {
    const response = await fetch('https://www.hamqsl.com/solarxml.php');

    if (!response.ok) {
      throw new Error('Failed to fetch solar data');
    }

    const text = await response.text();

    // Parse XML
    const getXmlValue = (tag: string): string | null => {
      const match = text.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match ? match[1] : null;
    };

    res.json({
      sfi: parseInt(getXmlValue('solarflux') || '100', 10),
      kIndex: parseInt(getXmlValue('kindex') || '2', 10),
      aIndex: parseInt(getXmlValue('aindex') || '8', 10),
      sunspots: parseInt(getXmlValue('sunspots') || '50', 10),
      xrayFlux: getXmlValue('xray') || 'B2.0',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Solar data error:', error);
    // Return simulated data as fallback
    res.json({
      sfi: 130 + Math.round(Math.random() * 40),
      kIndex: Math.round(Math.random() * 3),
      aIndex: 5 + Math.round(Math.random() * 10),
      sunspots: 80 + Math.round(Math.random() * 50),
      xrayFlux: 'B2.0',
      updatedAt: new Date().toISOString(),
    });
  }
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 FunkPilot server running on port ${PORT}`);
  console.log(`   Anthropic API: ${ANTHROPIC_API_KEY ? '✓ configured' : '✗ not set'}`);
  console.log(`   OpenRouter API: ${OPENROUTER_API_KEY ? '✓ configured' : '✗ not set'}`);
});
