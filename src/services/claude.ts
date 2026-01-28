import type { ChatMessage, SolarData, LogStats } from '../types';
import * as api from './api';

const CHAT_SYSTEM_PROMPT = `Du bist ein erfahrener Amateurfunk-Assistent und hilfst Funkamateuren bei Fragen zu:

- **Technik**: Antennen, Sender, Empfänger, SDR, Messungen
- **Betrieb**: Q-Codes, Abkürzungen, Betriebstechnik, Contest-Operating
- **Ausbreitung**: Propagation, Sonnenaktivität, Bandöffnungen
- **Vorschriften**: Internationale und österreichische Regelungen (AFG, AFV)
- **Digital**: FT8, FT4, RTTY, PSK31, SSTV
- **Satelliten**: QO-100, ISS, LEO-Sats
- **Notfunk**: EmComm, Frequenzen, Prozeduren

Wichtige Regeln:
1. Antworte präzise und fachlich korrekt
2. Verwende Amateurfunk-Terminologie
3. Gib praktische Tipps aus Erfahrung
4. Bei Unsicherheit sage es ehrlich
5. Verweise auf offizielle Quellen wenn relevant (ÖVSV, IARU, ITU)
6. Beachte IARU Region 1 Bandpläne
7. Der Benutzer ist aus Österreich (OE-Präfix), beachte lokale Vorschriften

Formatiere deine Antworten mit Markdown für bessere Lesbarkeit.`;

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  context: {
    userCall?: string;
    userLocator?: string;
    solarData?: SolarData;
  }
): Promise<string> {
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

  // Convert history to API format
  const messages = history.slice(-10).map(m => ({
    role: m.role,
    content: m.content,
  }));

  // Add current message
  messages.push({ role: 'user', content: message });

  return api.sendChat(messages, systemPrompt);
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
