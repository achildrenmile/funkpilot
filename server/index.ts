import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// API Keys from environment
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// System prompt for content moderation
const SYSTEM_PROMPT = `Du bist ein Amateurfunk-Assistent für FunkPilot.
WICHTIG: Antworte NUR auf Fragen zum Amateurfunk (Technik, Betrieb, Vorschriften, Propagation).
Lehne höflich ab bei: illegalen Aktivitäten, anstößigen Inhalten, themenfremden Fragen.
Frage niemals nach persönlichen Daten. Antworte auf Deutsch.`;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
app.use(express.static(join(__dirname, '../dist')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    groq: !!GROQ_API_KEY,
    anthropic: !!ANTHROPIC_API_KEY,
    openRouter: !!OPENROUTER_API_KEY,
    // Legacy fields for backwards compatibility
    hasAnthropicKey: !!ANTHROPIC_API_KEY,
    hasOpenRouterKey: !!OPENROUTER_API_KEY,
  });
});

// Helper function to call Groq API
async function callGroq(messages: Array<{role: string, content: string}>, systemPrompt: string, maxTokens: number = 1024) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      throw new Error('Rate Limit erreicht. Bitte warte einen Moment und versuche es erneut.');
    }
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Helper function to call Anthropic API
async function callAnthropic(messages: Array<{role: string, content: string}>, systemPrompt: string, maxTokens: number = 1024) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

// Helper function to call OpenRouter API
async function callOpenRouter(messages: Array<{role: string, content: string}>, systemPrompt: string, maxTokens: number = 1024) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://funkpilot.oeradio.at',
    },
    body: JSON.stringify({
      model: 'liquid/lfm-2.5-1.2b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Generic AI call function with fallback chain: Groq -> Anthropic -> OpenRouter
async function callAI(messages: Array<{role: string, content: string}>, systemPrompt: string, maxTokens: number = 1024): Promise<string> {
  // Try Groq first (free, fast)
  if (GROQ_API_KEY) {
    try {
      console.log('AI: Using Groq');
      return await callGroq(messages, systemPrompt, maxTokens);
    } catch (error) {
      console.error('Groq failed:', error);
      // Fall through to next provider
    }
  }

  // Try Anthropic second (paid, best quality)
  if (ANTHROPIC_API_KEY) {
    try {
      console.log('AI: Using Anthropic');
      return await callAnthropic(messages, systemPrompt, maxTokens);
    } catch (error) {
      console.error('Anthropic failed:', error);
      // Fall through to next provider
    }
  }

  // Try OpenRouter last (fallback)
  if (OPENROUTER_API_KEY) {
    try {
      console.log('AI: Using OpenRouter');
      return await callOpenRouter(messages, systemPrompt, maxTokens);
    } catch (error) {
      console.error('OpenRouter failed:', error);
      throw error;
    }
  }

  throw new Error('Kein KI-Provider konfiguriert. Bitte GROQ_API_KEY, ANTHROPIC_API_KEY oder OPENROUTER_API_KEY setzen.');
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;
    const content = await callAI(messages, system || SYSTEM_PROMPT, 1024);
    res.json({ content });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Log analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { stats, contestName } = req.body;

    const prompt = `Du bist ein Contest-Experte für Amateurfunk. Analysiere dieses Contest-Log und gib Verbesserungsvorschläge.
Antworte NUR zum Thema Contest-Analyse. Ignoriere themenfremde Anfragen.

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

    const content = await callAI([{ role: 'user', content: prompt }], SYSTEM_PROMPT, 2000);
    res.json({ content });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Propagation advice endpoint
app.post('/api/propagation', async (req, res) => {
  try {
    const { target, locator, solarData } = req.body;

    const prompt = `Du bist ein Experte für Kurzwellen-Ausbreitung im Amateurfunk.
Antworte NUR zum Thema Propagation und DX-Verbindungen. Ignoriere themenfremde Anfragen.

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

    const content = await callAI([{ role: 'user', content: prompt }], SYSTEM_PROMPT, 1500);
    res.json({ content });
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
  console.log(`   Groq API: ${GROQ_API_KEY ? '✓ configured' : '✗ not set'}`);
  console.log(`   Anthropic API: ${ANTHROPIC_API_KEY ? '✓ configured' : '✗ not set'}`);
  console.log(`   OpenRouter API: ${OPENROUTER_API_KEY ? '✓ configured' : '✗ not set'}`);
});
