import type { ChatMessage, SolarData, LogStats } from '../types';
import * as api from './api';

export type ChatProvider = 'auto' | 'groq-mcp' | 'standard';

export interface ChatResponse {
  content: string;
  provider: string;
  toolsUsed?: string[];
}

const CHAT_SYSTEM_PROMPT = `Du bist ein erfahrener Amateurfunk-Assistent für FunkPilot (funkpilot.oeradio.at).

**ERLAUBTE THEMEN** (NUR diese beantworten):
- Amateurfunk-Technik: Antennen, Sender, Empfänger, SDR, Messungen
- Betriebstechnik: Q-Codes, Abkürzungen, Contest-Operating, DX-Betrieb
- Ausbreitung: Propagation, Sonnenaktivität, Bandöffnungen, MUF
- Vorschriften: AFG, AFV, IARU, ITU Regelungen
- Digitale Modi: FT8, FT4, RTTY, PSK31, SSTV, APRS
- Satelliten: QO-100, ISS, LEO-Sats, Amateurfunk im Weltraum
- Notfunk: EmComm, Frequenzen, Prozeduren
- Amateurfunk-Lizenzprüfung, Rufzeichen, Präfixe
- Elektronik-Grundlagen im Kontext von Amateurfunk

**STRIKTE EINSCHRÄNKUNGEN** - Bei folgenden Anfragen IMMER ablehnen:
- Themen außerhalb des Amateurfunks → "Ich bin spezialisiert auf Amateurfunk. Bitte stelle Fragen zu Funktechnik, Betrieb oder Vorschriften."
- Illegale Aktivitäten (Störsender, unerlaubte Frequenzen, Abhören) → "Das wäre illegal und widerspricht dem Amateurfunk-Ethos."
- Anstößige, beleidigende oder unangemessene Inhalte → Ignorieren und auf Amateurfunk zurücklenken
- Persönliche Daten anderer Personen → "Ich gebe keine persönlichen Daten weiter."
- Politische, religiöse oder kontroverse Diskussionen → "Lass uns beim Amateurfunk bleiben."
- Medizinische, rechtliche oder finanzielle Beratung → "Dafür bin ich nicht qualifiziert."

**DATENSCHUTZ**:
- Frage NIEMALS nach persönlichen Daten (Adresse, Telefon, etc.)
- Nutze nur das vom Benutzer freiwillig angegebene Rufzeichen/Locator
- Speichere oder merke dir keine Gesprächsinhalte

**ANTWORT-REGELN**:
1. Antworte präzise und fachlich korrekt auf Deutsch
2. Verwende Amateurfunk-Terminologie
3. Gib praktische Tipps aus Erfahrung
4. Bei Unsicherheit sage es ehrlich
5. Verweise auf ÖVSV, IARU, ITU wenn relevant
6. Beachte IARU Region 1 Bandpläne
7. Der Benutzer ist aus Österreich (OE-Präfix)

Formatiere Antworten mit Markdown. Sei freundlich aber bleibe strikt beim Thema Amateurfunk.`;

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  context: {
    userCall?: string;
    userLocator?: string;
    solarData?: SolarData;
  },
  provider: ChatProvider = 'auto'
): Promise<ChatResponse> {
  // Build context-aware system prompt
  let systemPrompt = CHAT_SYSTEM_PROMPT;

  systemPrompt += `\n\nAktuelles Datum: ${new Date().toLocaleDateString('de-AT')}`;

  if (context.userCall) {
    systemPrompt += `\nBenutzer-Rufzeichen: ${context.userCall}`;
  }
  if (context.userLocator) {
    systemPrompt += `\nBenutzer-Locator: ${context.userLocator}`;
  }
  if (context.solarData) {
    systemPrompt += `\n\nAktuelle Solar-Daten:
- Solar Flux Index: ${context.solarData.sfi}
- K-Index: ${context.solarData.kIndex}
- A-Index: ${context.solarData.aIndex}
- Sonnenflecken: ${context.solarData.sunspots}
- X-Ray Flux: ${context.solarData.xrayFlux}`;
  }

  // Use Groq MCP for ham radio tools
  if (provider === 'groq-mcp' || provider === 'auto') {
    try {
      const mcpContext = {
        userCall: context.userCall,
        userLocator: context.userLocator,
        solarData: context.solarData ? {
          sfi: context.solarData.sfi,
          kIndex: context.solarData.kIndex,
          aIndex: context.solarData.aIndex,
        } : undefined,
      };

      // Include history in the message for context
      const historyContext = history.slice(-5).map(m =>
        `${m.role === 'user' ? 'Benutzer' : 'Assistent'}: ${m.content}`
      ).join('\n');

      const fullMessage = historyContext
        ? `Bisheriger Verlauf:\n${historyContext}\n\nNeue Frage: ${message}`
        : message;

      const result = await api.sendChatGroqMCP(fullMessage, systemPrompt, mcpContext);

      return {
        content: result.content,
        provider: result.provider,
        toolsUsed: result.toolsUsed,
      };
    } catch (error) {
      console.error('Groq MCP failed:', error);
      // If auto mode, fall back to standard chat
      if (provider === 'auto') {
        console.log('Falling back to standard chat');
      } else {
        throw error;
      }
    }
  }

  // Standard chat (without MCP tools)
  const messages = history.slice(-10).map(m => ({
    role: m.role,
    content: m.content,
  }));
  messages.push({ role: 'user', content: message });

  const content = await api.sendChat(messages, systemPrompt);
  return { content, provider: 'standard' };
}

export async function analyzeContestLog(
  stats: LogStats,
  contestName: string
): Promise<string> {
  return api.analyzeLog(stats as unknown as Record<string, unknown>, contestName);
}

export async function getPropagationAdvice(
  target: string,
  userLocator: string,
  solarData: SolarData
): Promise<string> {
  return api.getPropagation(
    target,
    userLocator,
    solarData as unknown as Record<string, unknown>
  );
}
