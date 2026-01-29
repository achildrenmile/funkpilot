// API client for backend communication
// In development, uses Vite proxy. In production, uses relative URLs.

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

interface ApiResponse<T> {
  content?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data.content as T;
}

export async function checkHealth(): Promise<{
  status: string;
  hasGroqKey: boolean;
  hasAnthropicKey: boolean;
  hasOpenRouterKey: boolean;
}> {
  const response = await fetch(`${API_BASE}/api/health`);
  return response.json();
}

export async function sendChat(
  messages: Array<{ role: string; content: string }>,
  system: string
): Promise<string> {
  return apiRequest<string>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, system }),
  });
}

export interface GroqMCPResponse {
  content: string;
  toolsUsed: string[];
  provider: 'groq-mcp' | 'groq';
  fallback?: boolean;
}

export async function sendChatGroqMCP(
  message: string,
  system: string,
  context?: {
    userCall?: string;
    userLocator?: string;
    solarData?: Record<string, unknown>;
  }
): Promise<GroqMCPResponse> {
  const response = await fetch(`${API_BASE}/api/chat-groq-mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, system, context }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data as GroqMCPResponse;
}

export async function analyzeLog(
  stats: Record<string, unknown>,
  contestName: string
): Promise<string> {
  return apiRequest<string>('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ stats, contestName }),
  });
}

export async function getPropagation(
  target: string,
  locator: string,
  solarData: Record<string, unknown>
): Promise<string> {
  return apiRequest<string>('/api/propagation', {
    method: 'POST',
    body: JSON.stringify({ target, locator, solarData }),
  });
}

export async function getSolarData(): Promise<{
  sfi: number;
  kIndex: number;
  aIndex: number;
  sunspots: number;
  xrayFlux: string;
  updatedAt: string;
}> {
  const response = await fetch(`${API_BASE}/api/solar`);
  return response.json();
}

// Streaming chat API using Server-Sent Events
export async function* sendChatStream(
  messages: Array<{ role: string; content: string }>,
  system: string
): AsyncGenerator<{ content: string; done: boolean; error?: string }> {
  const response = await fetch(`${API_BASE}/api/chat-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (!data) continue;
        try {
          const parsed = JSON.parse(data);
          yield parsed;
          if (parsed.done) return;
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
}
