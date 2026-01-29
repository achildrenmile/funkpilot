// ===== Voice CQ Types =====

export interface PhraseTemplate {
  id: string;
  name: string;
  nameDE: string;
  template: string;
  contest?: string[];
  phonetik: boolean;
  variables: string[];
}

export interface TTSSettings {
  voice: string;
  speed: number;
  pitch: number;
  language: 'de' | 'en';
}

export interface VoiceCQSettings {
  callsign: string;
  contest: string;
  zone: string;
  serialNr: number;
  tts: TTSSettings;
  outputMode: 'browser' | 'download' | 'webaudio';
  phonetikMode: 'auto' | 'callonly' | 'none';
}

// ===== Chat Types =====

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: string;
  toolsUsed?: string[];
}

export interface ChatContext {
  userCall?: string;
  userLocator?: string;
  solarData?: SolarData;
  currentContest?: string;
}

// ===== Solar & Propagation Types =====

export interface SolarData {
  sfi: number;
  kIndex: number;
  aIndex: number;
  sunspots: number;
  xrayFlux: string;
  updatedAt: Date;
}

export interface PropagationTarget {
  id: string;
  name: string;
  nameDE: string;
  prefix: string;
  locator?: string;
}

export interface BandRecommendation {
  band: string;
  frequency: string;
  path: 'short' | 'long';
  bearing: number;
  openingTime: string;
  closingTime: string;
  signalStrength: string;
  confidence: 'high' | 'medium' | 'low';
  tips: string[];
}

// ===== Log Analysis Types =====

export interface QSO {
  call: string;
  band: string;
  freq?: number;
  mode: string;
  datetime: Date;
  rstSent: string;
  rstRcvd: string;
  exchange?: string;
  country?: string;
  cqZone?: number;
  ituZone?: number;
  gridsquare?: string;
  comment?: string;
}

export interface LogStats {
  totalQsos: number;
  uniqueCallsigns: number;
  qsosByBand: Record<string, number>;
  qsosByMode: Record<string, number>;
  qsosByHour: Record<number, number>;
  countries: string[];
  cqZones: number[];
  ituZones: number[];
  ratePerHour: number[];
  dupes: number;
  operatingTime: number;
  startTime: Date | null;
  endTime: Date | null;
}

export interface LogAnalysis {
  stats: LogStats;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

// ===== User Settings Types =====

export interface UserSettings {
  callsign: string;
  locator: string;
  name: string;
  contestZone: string;
  language: 'de' | 'en';
  theme: 'dark' | 'light';
  voiceSettings: TTSSettings;
}

// ===== Tab Navigation =====

export type TabId = 'voice' | 'chat' | 'log' | 'propagation' | 'settings';

export interface Tab {
  id: TabId;
  name: string;
  icon: string;
}

// ===== Contest Templates =====

export interface Contest {
  id: string;
  name: string;
  exchange: string;
  variables: string[];
}

export const CONTESTS: Contest[] = [
  { id: 'cqww', name: 'CQWW DX', exchange: 'RST + Zone', variables: ['RST', 'ZONE'] },
  { id: 'cqwpx', name: 'CQ WPX', exchange: 'RST + Serial', variables: ['RST', 'SERIAL'] },
  { id: 'arrldx', name: 'ARRL DX', exchange: 'RST + State/Power', variables: ['RST', 'STATE'] },
  { id: 'iaru', name: 'IARU HF', exchange: 'RST + Zone/HQ', variables: ['RST', 'ZONE'] },
  { id: 'wag', name: 'WAG', exchange: 'RST + DOK', variables: ['RST', 'DOK'] },
  { id: 'sota', name: 'SOTA', exchange: 'RST + Reference', variables: ['RST', 'REF'] },
  { id: 'pota', name: 'POTA', exchange: 'RST + Reference', variables: ['RST', 'REF'] },
  { id: 'custom', name: 'Benutzerdefiniert', exchange: 'Custom', variables: [] },
];
