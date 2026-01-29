import type { ChatMessage, SolarData, LogStats } from '../types';
import * as api from './api';

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
