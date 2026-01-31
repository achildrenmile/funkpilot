// HAM Bastelprojekte Types

export interface HamProject {
  id: string;
  name: string;
  category: ProjectCategory;
  difficulty: 1 | 2 | 3;
  description: string;
  hardware: HardwarePlatform;

  // Project type: 'build' for code projects, 'guide' for documentation
  projectType?: 'build' | 'guide';

  // Stückliste
  components: Component[];
  estimatedCost: string;

  // Code (for build projects)
  code: string;
  codeLanguage: 'cpp' | 'python' | 'micropython' | 'markdown';
  codeFileName: string;

  // Verdrahtung
  wiring?: WiringConnection[];

  // Optional
  schematicUrl?: string;
  wokwiUrl?: string;  // Wokwi Simulator Link
  externalLinks?: { title: string; url: string }[];

  // KI-Anpassungs-Vorschläge
  customizationSuggestions: string[];

  // Guide-specific fields
  guideSections?: GuideSection[];
  hardwareOptions?: HardwareOption[];
}

export type ProjectCategory =
  | 'cw-morse'
  | 'measurement'
  | 'antenna'
  | 'digital-aprs'
  | 'audio'
  | 'control'
  | 'mesh-lora';

export type HardwarePlatform =
  | 'arduino-nano'
  | 'arduino-uno'
  | 'esp32'
  | 'esp8266'
  | 'raspberry-pi'
  | 'raspberry-pico'
  | 'esp32-lora'
  | 't-beam'
  | 'heltec-lora'
  | 'rak-wisblock';

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

// Guide-specific types
export interface GuideSection {
  id: string;
  title: string;
  icon?: string;
  content: string;     // Markdown content
}

export interface HardwareOption {
  name: string;
  image?: string;
  price: string;
  features: string[];
  recommended?: boolean;
  buyLinks?: { store: string; url: string }[];
}

export const CATEGORY_INFO: Record<ProjectCategory, { name: string; icon: string }> = {
  'cw-morse': { name: 'CW / Morse', icon: '📡' },
  'measurement': { name: 'Mess- & Anzeige', icon: '📊' },
  'antenna': { name: 'Antennen', icon: '📶' },
  'digital-aprs': { name: 'Digital / APRS', icon: '💻' },
  'audio': { name: 'Audio / NF', icon: '🔊' },
  'control': { name: 'Steuerung', icon: '🎛️' },
  'mesh-lora': { name: 'Mesh / LoRa', icon: '🌐' },
};

export const HARDWARE_INFO: Record<HardwarePlatform, { name: string; color: string }> = {
  'arduino-nano': { name: 'Arduino Nano', color: 'bg-teal-500' },
  'arduino-uno': { name: 'Arduino Uno', color: 'bg-teal-600' },
  'esp32': { name: 'ESP32', color: 'bg-blue-500' },
  'esp8266': { name: 'ESP8266', color: 'bg-blue-400' },
  'raspberry-pi': { name: 'Raspberry Pi', color: 'bg-pink-500' },
  'raspberry-pico': { name: 'Raspberry Pico', color: 'bg-pink-400' },
  'esp32-lora': { name: 'ESP32 + LoRa', color: 'bg-purple-500' },
  't-beam': { name: 'LILYGO T-Beam', color: 'bg-purple-600' },
  'heltec-lora': { name: 'Heltec LoRa', color: 'bg-purple-400' },
  'rak-wisblock': { name: 'RAK WisBlock', color: 'bg-indigo-500' },
};

export const DIFFICULTY_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Einfach',
  2: 'Mittel',
  3: 'Fortgeschritten',
};
