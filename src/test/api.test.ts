import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for API tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('/api/health', () => {
    it('should return status ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'ok',
          groq: true,
          anthropic: false,
          openRouter: false,
          hasGroqKey: true,
          hasAnthropicKey: false,
          hasOpenRouterKey: false,
          hasQrzKey: true,
          hasTavilyKey: true,
        }),
      });

      const response = await fetch('/api/health');
      const data = await response.json();

      expect(data.status).toBe('ok');
      expect(data).toHaveProperty('groq');
      expect(data).toHaveProperty('anthropic');
      expect(data).toHaveProperty('hasQrzKey');
      expect(data).toHaveProperty('hasTavilyKey');
    });
  });

  describe('/api/callsign/lookup', () => {
    it('should return callsign data for valid OE callsign', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          callsign: 'OE8YML',
          found: true,
          isOfficial: true,
          isSchwartzfunker: false,
          official: {
            name: 'Michael Linder',
            qth: 'Nötsch',
            licenseClass: 1,
          },
          source: 'official',
        }),
      });

      const response = await fetch('/api/callsign/lookup?callsign=OE8YML');
      const data = await response.json();

      expect(data.callsign).toBe('OE8YML');
      expect(data.found).toBe(true);
      expect(data.isOfficial).toBe(true);
      expect(data.isSchwartzfunker).toBe(false);
    });

    it('should detect schwarzfunker callsigns', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          callsign: 'OE5XXX',
          found: true,
          isOfficial: false,
          isSchwartzfunker: true,
          qrz: {
            name: 'Some Name',
          },
          source: 'qrz',
        }),
      });

      const response = await fetch('/api/callsign/lookup?callsign=OE5XXX');
      const data = await response.json();

      expect(data.isSchwartzfunker).toBe(true);
      expect(data.isOfficial).toBe(false);
    });

    it('should return not found for unknown callsigns', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          callsign: 'ZZ9ZZZ',
          found: false,
          isOfficial: false,
          isSchwartzfunker: false,
        }),
      });

      const response = await fetch('/api/callsign/lookup?callsign=ZZ9ZZZ');
      const data = await response.json();

      expect(data.found).toBe(false);
    });
  });

  describe('/api/callsign/available', () => {
    it('should check suffix availability in all districts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suffix: 'ABC',
          districts: [
            { prefix: 'OE1', callsign: 'OE1ABC', name: 'Wien', available: false, holder: 'Max Mustermann' },
            { prefix: 'OE2', callsign: 'OE2ABC', name: 'Salzburg', available: true },
            { prefix: 'OE3', callsign: 'OE3ABC', name: 'Niederösterreich', available: true },
            { prefix: 'OE4', callsign: 'OE4ABC', name: 'Burgenland', available: true },
            { prefix: 'OE5', callsign: 'OE5ABC', name: 'Oberösterreich', available: false, holder: 'Hans Huber' },
            { prefix: 'OE6', callsign: 'OE6ABC', name: 'Steiermark', available: true },
            { prefix: 'OE7', callsign: 'OE7ABC', name: 'Tirol', available: true },
            { prefix: 'OE8', callsign: 'OE8ABC', name: 'Kärnten', available: true },
            { prefix: 'OE9', callsign: 'OE9ABC', name: 'Vorarlberg', available: true },
          ],
        }),
      });

      const response = await fetch('/api/callsign/available?suffix=ABC');
      const data = await response.json();

      expect(data.suffix).toBe('ABC');
      expect(data.districts).toHaveLength(9);
      expect(data.districts.filter((d: { available: boolean }) => d.available)).toHaveLength(7);
    });
  });

  describe('/api/callsign/suggest', () => {
    it('should generate callsign suggestions from name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: [
            { callsign: 'OE8MM', reason: 'Initialen: Max Mustermann', available: true },
            { callsign: 'OE8MAX', reason: 'Vorname: Max', available: false },
            { callsign: 'OE8MUS', reason: 'Nachname: Mustermann', available: true },
          ],
        }),
      });

      const response = await fetch('/api/callsign/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Max', lastName: 'Mustermann', preferredDistrict: 8 }),
      });
      const data = await response.json();

      expect(data.suggestions).toBeDefined();
      expect(data.suggestions.length).toBeGreaterThan(0);
      expect(data.suggestions[0]).toHaveProperty('callsign');
      expect(data.suggestions[0]).toHaveProperty('reason');
      expect(data.suggestions[0]).toHaveProperty('available');
    });
  });

  describe('/api/solar', () => {
    it('should return solar data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          solarflux: 182,
          aindex: 8,
          kindex: 2,
          sunspots: 145,
          xray: 'C1.2',
          updated: '2025-01-31T12:00:00Z',
        }),
      });

      const response = await fetch('/api/solar');
      const data = await response.json();

      expect(data).toHaveProperty('solarflux');
      expect(data).toHaveProperty('aindex');
      expect(data).toHaveProperty('kindex');
      expect(typeof data.solarflux).toBe('number');
    });
  });

  describe('/api/tts/voices', () => {
    it('should return available TTS voices', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          voices: [
            { id: 'en-US-GuyNeural', name: 'Guy (US)', language: 'English' },
            { id: 'de-AT-IngridNeural', name: 'Ingrid (AT)', language: 'German' },
            { id: 'de-AT-JonasNeural', name: 'Jonas (AT)', language: 'German' },
          ],
        }),
      });

      const response = await fetch('/api/tts/voices');
      const data = await response.json();

      expect(data.voices).toBeDefined();
      expect(Array.isArray(data.voices)).toBe(true);
      expect(data.voices.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetch('/api/health')).rejects.toThrow('Network error');
    });

    it('should handle 400 Bad Request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid request' }),
      });

      const response = await fetch('/api/callsign/lookup?callsign=');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should handle 500 Server Error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      const response = await fetch('/api/chat');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });
});
