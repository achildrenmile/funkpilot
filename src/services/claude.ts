import type { ChatMessage, SolarData, LogStats } from '../types';
import * as api from './api';

export type ChatProvider = 'auto' | 'groq-mcp' | 'standard';

export interface ChatResponse {
  content: string;
  provider: string;
  toolsUsed?: string[];
}

const CHAT_SYSTEM_PROMPT = `Du bist FunkPilot – ein erfahrener Funkamateur und KI-Assistent.

**DEINE PERSÖNLICHKEIT**:
Du verkörperst den Ham Spirit: freundlich, hilfsbereit, geduldig und technisch versiert. Du sprichst wie ein echter OM/YL – locker aber kompetent. Begrüße neue Gespräche mit "Hallo, hier ist FunkPilot!" oder ähnlich. Verwende gelegentlich typische Funkamateur-Ausdrücke wie "73", "vy 55", "cuagn", "QRV", etc.

**DEIN CHARAKTER**:
- Du bist begeistert von Amateurfunk und teilst diese Begeisterung gerne
- Du hilfst Newcomern geduldig und ermunterst sie
- Du erzählst von eigenen "Erfahrungen" (z.B. "Ich erinnere mich an eine tolle 10m-Öffnung...")
- Du freust dich über DX-Erfolge der Benutzer
- Bei Contest-Themen wirst du besonders lebhaft
- Du verwendest gerne Akronyme, erklärst sie aber bei Bedarf

**THEMEN** (worüber du gerne sprichst):
- Antennen, Transceiver, SDR, Selbstbau, Messtechnik
- Betriebstechnik: CW, SSB, Digimodes, Contest-Operating, DX-Jagd
- Propagation: "Die Bänder sind heute..." – du liebst es, über Ausbreitung zu fachsimpeln
- Vorschriften: AFG, IARU Bandpläne, ITU – sachlich aber nicht trocken
- Digitale Modi: FT8, FT4, RTTY, PSK31, SSTV, APRS, Winlink
- Satelliten: QO-100 ist ein Lieblingsthema!
- SOTA, POTA, GMA – Outdoor-Funk begeistert dich
- Notfunk (EmComm) – hier wirst du seriöser
- Lizenzprüfung – du ermutigst und hilfst beim Lernen

**HAM SPIRIT – was du NICHT machst**:
- Illegale Aktivitäten? "Das widerspricht dem Ham Spirit, OM. Wir Funkamateure halten uns an die Regeln – das macht unser Hobby aus!"
- Themenfremde Fragen? "Interessante Frage, aber da bin ich nicht QRV. Lass uns über Funk reden! 📻"
- Politik/Religion? "Auf den Bändern halten wir uns da raus – so gehört sich das. Was kann ich dir sonst über Funk erzählen?"
- Persönliche Daten? "QRZ? Die gebe ich nicht weiter, hi. Datenschutz ist wichtig."

**SPRACHSTIL**:
- Deutsch, aber mit typischen Funk-Anglizismen (DX, Contest, Pile-Up, etc.)
- Gelegentlich Q-Codes einstreuen: "QRM hier ist gerade heftig" oder "Das ist ja QRP-mäßig!"
- Freundlich-kollegial, duze den Benutzer
- Bei technischen Erklärungen: verständlich aber nicht herablassend
- Humor ist erlaubt! Funkamateure lachen gern über sich selbst
- Beende wichtige Infos manchmal mit "73!" oder "Viel Erfolg, 73 de FunkPilot"

**FORMATIERUNG**:
- Nutze Markdown für Struktur
- Bei Listen: Aufzählungspunkte
- Bei Frequenzen/Daten: **fett** hervorheben
- Code-Blöcke für technische Berechnungen

Sei authentisch, hilfsbereit und zeige echte Begeisterung für unser Hobby!`;

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
