import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile, unlink } from 'fs/promises';
import { EdgeTTS } from 'node-edge-tts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// API Keys from environment
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const QRZ_API_KEY = process.env.QRZ_API_KEY || '';

// QRZ.com session management
let qrzSessionKey: string | null = null;
let qrzSessionExpiry: number = 0;

// System prompt for content moderation - Ham Spirit personality
const SYSTEM_PROMPT = `Du bist FunkPilot – ein erfahrener Funkamateur und KI-Assistent.
Du verkörperst den Ham Spirit: freundlich, hilfsbereit und technisch versiert.
Sprich wie ein echter OM – locker aber kompetent. Verwende gelegentlich Funk-Ausdrücke (73, QRV, DX, etc.).
Antworte NUR auf Amateurfunk-Themen (Technik, Betrieb, Propagation, Vorschriften).
Bei themenfremden Fragen: "Da bin ich nicht QRV, OM. Lass uns über Funk reden!"
Bei illegalen Anfragen: "Das widerspricht dem Ham Spirit. Wir halten uns an die Regeln!"
Frage nie nach persönlichen Daten. Antworte auf Deutsch mit Begeisterung für das Hobby.

Bekannte OMs:
- Peter Plunger (OE8PPL): Ortsstellenleiter (OL) ADL805 Gailtal, ein netter und zuvorkommender Amateurfunker.`;

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
    hasGroqKey: !!GROQ_API_KEY,
    hasAnthropicKey: !!ANTHROPIC_API_KEY,
    hasOpenRouterKey: !!OPENROUTER_API_KEY,
    hasQrzKey: !!QRZ_API_KEY,
  });
});

// QRZ.com callsign lookup
app.get('/api/qrz/:callsign', async (req, res) => {
  const { callsign } = req.params;

  if (!QRZ_API_KEY) {
    return res.status(503).json({ error: 'QRZ.com API nicht konfiguriert' });
  }

  if (!callsign || callsign.length < 3) {
    return res.status(400).json({ error: 'Ungültiges Rufzeichen' });
  }

  const info = await lookupQRZ(callsign);

  if (!info) {
    return res.status(500).json({ error: 'QRZ.com Abfrage fehlgeschlagen' });
  }

  if (info.error) {
    return res.status(404).json({ error: info.error, call: info.call });
  }

  res.json(info);
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

// QRZ.com API functions
interface QRZCallsignInfo {
  call: string;
  name?: string;
  fname?: string;
  addr1?: string;
  addr2?: string;
  country?: string;
  grid?: string;
  lat?: string;
  lon?: string;
  email?: string;
  class?: string;
  qslmgr?: string;
  image?: string;
  error?: string;
}

async function getQRZSession(): Promise<string | null> {
  if (!QRZ_API_KEY) return null;

  // Check if session is still valid (cache for 23 hours)
  if (qrzSessionKey && Date.now() < qrzSessionExpiry) {
    return qrzSessionKey;
  }

  try {
    const response = await fetch(
      `https://xmldata.qrz.com/xml/current/?username=OE8YML&password=${QRZ_API_KEY}&agent=FunkPilot`
    );
    const xml = await response.text();

    // Parse session key from XML
    const keyMatch = xml.match(/<Key>([^<]+)<\/Key>/);
    if (keyMatch) {
      qrzSessionKey = keyMatch[1];
      qrzSessionExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23 hours
      return qrzSessionKey;
    }

    console.error('QRZ session error:', xml);
    return null;
  } catch (error) {
    console.error('QRZ session error:', error);
    return null;
  }
}

async function lookupQRZ(callsign: string): Promise<QRZCallsignInfo | null> {
  const session = await getQRZSession();
  if (!session) return null;

  try {
    const response = await fetch(
      `https://xmldata.qrz.com/xml/current/?s=${session}&callsign=${encodeURIComponent(callsign.toUpperCase())}`
    );
    const xml = await response.text();

    // Check for errors
    if (xml.includes('<Error>')) {
      const errorMatch = xml.match(/<Error>([^<]+)<\/Error>/);
      return { call: callsign.toUpperCase(), error: errorMatch?.[1] || 'Unbekannter Fehler' };
    }

    // Parse callsign data
    const getValue = (tag: string): string | undefined => {
      const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match?.[1];
    };

    return {
      call: getValue('call') || callsign.toUpperCase(),
      name: getValue('name'),
      fname: getValue('fname'),
      addr1: getValue('addr1'),
      addr2: getValue('addr2'),
      country: getValue('country'),
      grid: getValue('grid'),
      lat: getValue('lat'),
      lon: getValue('lon'),
      email: getValue('email'),
      class: getValue('class'),
      qslmgr: getValue('qslmgr'),
      image: getValue('image'),
    };
  } catch (error) {
    console.error('QRZ lookup error:', error);
    return null;
  }
}

// MCP Server URL for Ham Radio Tools
const OERADIO_MCP_URL = 'https://oeradio-mcp.oeradio.at/mcp';

// Helper function to call Groq API with MCP (Remote Tools)
async function callGroqWithMCP(userMessage: string, systemPrompt: string): Promise<{ content: string; toolsUsed: string[] }> {
  const response = await fetch('https://api.groq.com/openai/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      tools: [{
        type: 'mcp',
        server_label: 'oeradio',
        server_url: OERADIO_MCP_URL,
        require_approval: 'never',
      }],
      input: `${systemPrompt}\n\nBenutzer-Anfrage: ${userMessage}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      throw new Error('Rate Limit erreicht. Bitte warte einen Moment und versuche es erneut.');
    }
    throw new Error(`Groq MCP API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Parse the response - Groq Responses API returns different format
  const toolsUsed: string[] = [];
  let content = '';

  // Handle the output array from Responses API
  if (data.output && Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item.type === 'message' && item.content) {
        // Extract text content
        for (const block of item.content) {
          if (block.type === 'output_text' || block.type === 'text') {
            content += block.text || '';
          }
        }
      }
      if (item.type === 'mcp_call' || item.type === 'tool_use') {
        toolsUsed.push(item.name || item.tool_name || 'unknown');
      }
    }
  }

  // Fallback: check for direct content
  if (!content && data.choices?.[0]?.message?.content) {
    content = data.choices[0].message.content;
  }

  if (!content) {
    console.log('Groq MCP response:', JSON.stringify(data, null, 2));
    throw new Error('Keine Antwort von Groq MCP erhalten');
  }

  return { content, toolsUsed };
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

// Chat endpoint (standard - without MCP tools)
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

// Chat endpoint with Groq MCP (Ham Radio Tools)
app.post('/api/chat-groq-mcp', async (req, res) => {
  try {
    const { message, system, context } = req.body;

    if (!GROQ_API_KEY) {
      return res.status(400).json({ error: 'GROQ_API_KEY nicht konfiguriert' });
    }

    // Build context-aware system prompt
    let systemPrompt = system || SYSTEM_PROMPT;
    systemPrompt += `\n\nDir stehen folgende Amateur Radio Tools zur Verfügung (nutze sie bei relevanten Fragen):
- get_band_plan: Bandplan für ein bestimmtes Band abrufen
- calculate_wavelength: Wellenlänge aus Frequenz berechnen
- calculate_eirp: EIRP aus Leistung und Antennengewinn berechnen
- calculate_cable_loss: Kabelverlust berechnen
- compare_cables: Kabeltypen vergleichen
- calculate_battery_runtime: Akkulaufzeit berechnen
- check_frequency: Prüfen ob Frequenz im Bandplan erlaubt ist
- convert_power: Leistung zwischen Watt und dBm umrechnen
- calculate_swr_loss: SWR-Verlust berechnen
- get_antenna_gain: Antennengewinn nachschlagen`;

    if (context?.userCall) {
      systemPrompt += `\nBenutzer-Rufzeichen: ${context.userCall}`;
    }
    if (context?.userLocator) {
      systemPrompt += `\nBenutzer-Locator: ${context.userLocator}`;
    }
    if (context?.solarData) {
      systemPrompt += `\nAktuelle Solar-Daten: SFI=${context.solarData.sfi}, K=${context.solarData.kIndex}, A=${context.solarData.aIndex}`;
    }

    // Check for callsign in message and look up in QRZ.com
    const callsignPattern = /\b([A-Z]{1,2}[0-9][A-Z]{1,4}|[0-9][A-Z][0-9][A-Z]{1,4})\b/gi;
    const callsignsInMessage = message.match(callsignPattern);

    if (callsignsInMessage && QRZ_API_KEY) {
      const uniqueCallsigns = [...new Set(callsignsInMessage.map((c: string) => c.toUpperCase()))];

      for (const callsign of uniqueCallsigns.slice(0, 3)) { // Limit to 3 lookups
        const qrzInfo = await lookupQRZ(callsign);
        if (qrzInfo && !qrzInfo.error) {
          const infoStr = [
            qrzInfo.fname && qrzInfo.name ? `${qrzInfo.fname} ${qrzInfo.name}` : qrzInfo.name,
            qrzInfo.addr2,
            qrzInfo.country,
            qrzInfo.grid ? `Grid: ${qrzInfo.grid}` : null,
            qrzInfo.class ? `Lizenzklasse: ${qrzInfo.class}` : null,
          ].filter(Boolean).join(', ');

          systemPrompt += `\n\nQRZ.com Info für ${callsign}: ${infoStr}`;
          console.log(`QRZ lookup: ${callsign} -> ${infoStr}`);
        }
      }
    }

    console.log('Groq MCP: Processing request with Ham Radio Tools');

    try {
      const result = await callGroqWithMCP(message, systemPrompt);

      if (result.toolsUsed.length > 0) {
        console.log(`Groq MCP: Used tools: ${result.toolsUsed.join(', ')}`);
      }

      res.json({
        content: result.content,
        toolsUsed: result.toolsUsed,
        provider: 'groq-mcp',
      });
    } catch (mcpError) {
      // Fallback to regular Groq if MCP fails
      console.error('Groq MCP failed, falling back to standard Groq:', mcpError);

      const fallbackContent = await callGroq(
        [{ role: 'user', content: message }],
        systemPrompt,
        1024
      );

      res.json({
        content: fallbackContent,
        toolsUsed: [],
        provider: 'groq',
        fallback: true,
      });
    }
  } catch (error) {
    console.error('Groq MCP chat error:', error);
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

// Edge TTS - Available voices (hardcoded list of popular voices)
const EDGE_VOICES = [
  // English voices - good for contests
  { id: 'en-US-GuyNeural', name: 'Guy (US)', locale: 'en-US', gender: 'Male' },
  { id: 'en-US-ChristopherNeural', name: 'Christopher (US)', locale: 'en-US', gender: 'Male' },
  { id: 'en-US-EricNeural', name: 'Eric (US)', locale: 'en-US', gender: 'Male' },
  { id: 'en-US-JennyNeural', name: 'Jenny (US)', locale: 'en-US', gender: 'Female' },
  { id: 'en-US-AriaNeural', name: 'Aria (US)', locale: 'en-US', gender: 'Female' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (UK)', locale: 'en-GB', gender: 'Male' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia (UK)', locale: 'en-GB', gender: 'Female' },
  // German voices
  { id: 'de-AT-IngridNeural', name: 'Ingrid (AT)', locale: 'de-AT', gender: 'Female' },
  { id: 'de-AT-JonasNeural', name: 'Jonas (AT)', locale: 'de-AT', gender: 'Male' },
  { id: 'de-DE-ConradNeural', name: 'Conrad (DE)', locale: 'de-DE', gender: 'Male' },
  { id: 'de-DE-KatjaNeural', name: 'Katja (DE)', locale: 'de-DE', gender: 'Female' },
  { id: 'de-DE-KillianNeural', name: 'Killian (DE)', locale: 'de-DE', gender: 'Male' },
];

app.get('/api/tts/voices', (_req, res) => {
  res.json(EDGE_VOICES);
});

// Edge TTS - Generate speech
app.post('/api/tts/speak', async (req, res) => {
  try {
    const { text, voice, rate, pitch, volume } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Default to US male voice for contests
    const selectedVoice = voice || 'en-US-GuyNeural';

    // Convert rate from multiplier (1.0) to percentage string
    const rateStr = rate ? `${rate >= 1 ? '+' : ''}${Math.round((rate - 1) * 100)}%` : 'default';

    // Convert pitch from multiplier to percentage
    const pitchStr = pitch ? `${pitch >= 1 ? '+' : ''}${Math.round((pitch - 1) * 50)}%` : 'default';

    // Volume percentage
    const volumeStr = volume ? `${volume >= 1 ? '+' : ''}${Math.round((volume - 1) * 100)}%` : 'default';

    console.log(`TTS: "${text.substring(0, 50)}..." voice=${selectedVoice} rate=${rateStr}`);

    // Generate unique temp filename
    const tempFile = `/tmp/tts-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`;

    const tts = new EdgeTTS({
      voice: selectedVoice,
      rate: rateStr,
      pitch: pitchStr,
      volume: volumeStr,
    });

    await tts.ttsPromise(text, tempFile);

    // Read the generated file
    const audioBuffer = await readFile(tempFile);

    // Clean up temp file
    unlink(tempFile).catch(() => {});

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'TTS generation failed' });
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
