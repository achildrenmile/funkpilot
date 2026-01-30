// API client for Callsign Finder endpoints

import type {
  CallsignLookupResult,
  SuffixAvailabilityResult,
  CallsignSuggestResult,
} from '../types/callsign';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

// Lookup a callsign
export async function lookupCallsign(callsign: string): Promise<CallsignLookupResult> {
  const response = await fetch(
    `${API_BASE}/api/callsign/lookup?callsign=${encodeURIComponent(callsign.toUpperCase())}`
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Check suffix availability in all districts
export async function checkSuffixAvailability(suffix: string): Promise<SuffixAvailabilityResult> {
  const response = await fetch(
    `${API_BASE}/api/callsign/available?suffix=${encodeURIComponent(suffix.toUpperCase())}`
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Get callsign suggestions based on name
export async function suggestCallsigns(
  firstName: string,
  lastName: string,
  preferredDistrict: number
): Promise<CallsignSuggestResult> {
  const response = await fetch(`${API_BASE}/api/callsign/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, preferredDistrict }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return response.json();
}
