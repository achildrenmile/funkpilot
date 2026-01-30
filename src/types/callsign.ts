// ===== Callsign Finder Types =====

// Austrian callsign from official JSON database
export interface AustrianCallsign {
  callsign: string;
  name: string;
  qth?: string;
  licenseClass?: number; // 1 = CEPT, 3 = Bewilligungsklasse
}

// QRZ.com callsign info (matches existing backend type)
export interface QRZCallsignInfo {
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

// HamQTH callsign info
export interface HamQTHCallsignInfo {
  callsign: string;
  nick?: string;
  qth?: string;
  country?: string;
  grid?: string;
  latitude?: string;
  longitude?: string;
  error?: string;
}

// Combined lookup result
export interface CallsignLookupResult {
  callsign: string;
  found: boolean;
  source: 'official' | 'qrz' | 'hamqth' | 'none';
  isOfficial: boolean;
  isSchwartzfunker: boolean;
  official?: AustrianCallsign;
  qrz?: QRZCallsignInfo;
  hamqth?: HamQTHCallsignInfo;
}

// Austrian districts (Bundesländer)
export interface AustrianDistrict {
  prefix: string; // OE1, OE2, etc.
  name: string;   // Wien, Salzburg, etc.
}

export const AUSTRIAN_DISTRICTS: AustrianDistrict[] = [
  { prefix: 'OE1', name: 'Wien' },
  { prefix: 'OE2', name: 'Salzburg' },
  { prefix: 'OE3', name: 'Niederösterreich' },
  { prefix: 'OE4', name: 'Burgenland' },
  { prefix: 'OE5', name: 'Oberösterreich' },
  { prefix: 'OE6', name: 'Steiermark' },
  { prefix: 'OE7', name: 'Tirol' },
  { prefix: 'OE8', name: 'Kärnten' },
  { prefix: 'OE9', name: 'Vorarlberg' },
];

// District availability check result
export interface DistrictAvailability {
  prefix: string;
  name: string;
  callsign: string;
  available: boolean;
  holder?: string; // Name of current holder if not available
}

export interface SuffixAvailabilityResult {
  suffix: string;
  districts: DistrictAvailability[];
}

// Callsign suggestion
export interface CallsignSuggestion {
  callsign: string;
  suffix: string;
  reason: string; // "Initialen", "X + Initialen", "Vorname verkürzt", etc.
  available: boolean;
  district: string;
}

export interface CallsignSuggestRequest {
  firstName: string;
  lastName: string;
  preferredDistrict: number; // 1-9
}

export interface CallsignSuggestResult {
  suggestions: CallsignSuggestion[];
}

// Sub-tab types for CallsignFinder
export type CallsignSubTab = 'lookup' | 'available' | 'suggest';
