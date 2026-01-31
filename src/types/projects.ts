// HAM Bastelprojekte Types

export interface HamProject {
  id: string;
  name: string;
  category: ProjectCategory;
  difficulty: 1 | 2 | 3;
  description: string;
  hardware: HardwarePlatform;

  // Stückliste
  components: Component[];
  estimatedCost: string;

  // Code
  code: string;
  codeLanguage: 'cpp' | 'python' | 'micropython';
  codeFileName: string;

  // Verdrahtung
  wiring?: WiringConnection[];

  // Optional
  schematicUrl?: string;
  wokwiUrl?: string;  // Wokwi Simulator Link
  externalLinks?: { title: string; url: string }[];

  // KI-Anpassungs-Vorschläge
  customizationSuggestions: string[];
}

export type ProjectCategory =
  | 'cw-morse'
  | 'measurement'
  | 'antenna'
  | 'digital-aprs'
  | 'audio'
  | 'control';

export type HardwarePlatform =
  | 'arduino-nano'
  | 'arduino-uno'
  | 'esp32'
  | 'esp8266'
  | 'raspberry-pi'
  | 'raspberry-pico';

export interface Component {
  name: string;
  quantity: number;
  notes?: string;
}

export interface WiringConnection {
  from: string;        // z.B. "Arduino Pin 9"
  to: string;          // z.B. "Taster Pin 1"
  color?: string;      // Kabelfarbe (optional)
  notes?: string;      // z.B. "über 10k Widerstand"
}

export const CATEGORY_INFO: Record<ProjectCategory, { name: string; icon: string }> = {
  'cw-morse': { name: 'CW / Morse', icon: '📡' },
  'measurement': { name: 'Mess- & Anzeige', icon: '📊' },
  'antenna': { name: 'Antennen', icon: '📶' },
  'digital-aprs': { name: 'Digital / APRS', icon: '💻' },
  'audio': { name: 'Audio / NF', icon: '🔊' },
  'control': { name: 'Steuerung', icon: '🎛️' },
};

export const HARDWARE_INFO: Record<HardwarePlatform, { name: string; color: string }> = {
  'arduino-nano': { name: 'Arduino Nano', color: 'bg-teal-500' },
  'arduino-uno': { name: 'Arduino Uno', color: 'bg-teal-600' },
  'esp32': { name: 'ESP32', color: 'bg-blue-500' },
  'esp8266': { name: 'ESP8266', color: 'bg-blue-400' },
  'raspberry-pi': { name: 'Raspberry Pi', color: 'bg-pink-500' },
  'raspberry-pico': { name: 'Raspberry Pico', color: 'bg-pink-400' },
};

export const DIFFICULTY_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Einfach',
  2: 'Mittel',
  3: 'Fortgeschritten',
};
