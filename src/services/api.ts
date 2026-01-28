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
