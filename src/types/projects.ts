// HAM Bastelprojekte Types

// Supported languages
export type SupportedLanguage = 'de' | 'en' | 'sl';

// Localized string type - all languages required
export interface LocalizedString {
  de: string;
  en: string;
  sl: string;
}

// Flexible text type - allows either localized or plain string (backwards compatible)
export type FlexText = LocalizedString | string;

// Helper to create localized strings
export function localized(de: string, en: string, sl: string): LocalizedString {
  return { de, en, sl };
}

// Get string for current language with fallback to German
export function getLocalized(str: FlexText, lang: SupportedLanguage): string {
  if (typeof str === 'string') return str; // Backwards compatibility
  return str[lang] || str.de;
}

export interface HamProject {
  id: string;
  name: FlexText;
  category: ProjectCategory;
  difficulty: 1 | 2 | 3;
  description: FlexText;
  hardware: HardwarePlatform;

  // Project type: 'build' for code projects, 'guide' for documentation
  projectType?: 'build' | 'guide';

  // Stückliste
  components: FlexComponent[];
  estimatedCost: string;

  // Code/Content (for build projects = code, for guides = markdown content)
  code: FlexText;
  codeLanguage: 'cpp' | 'python' | 'micropython' | 'markdown';
  codeFileName: string;

  // Verdrahtung
  wiring?: FlexWiringConnection[];

  // Optional
  schematicUrl?: string;
  wokwiUrl?: string;  // Wokwi Simulator Link
  externalLinks?: { title: FlexText; url: string }[];

  // Compatibility markers (hidden easter eggs)
  morsefleet?: boolean;  // Works with MorseFleet CW trainer

  // KI-Anpassungs-Vorschläge
  customizationSuggestions: FlexText[];

  // Guide-specific fields
  guideSections?: FlexGuideSection[];
  hardwareOptions?: FlexHardwareOption[];
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

// Flexible component type (backwards compatible)
export interface FlexComponent {
  name: FlexText;
  quantity: number;
  notes?: FlexText;
}

// Flexible wiring type (backwards compatible)
export interface FlexWiringConnection {
  from: FlexText;
  to: FlexText;
  color?: string;
  notes?: FlexText;
}

// Guide-specific types (flexible)
export interface FlexGuideSection {
  id: string;
  title: FlexText;
  icon?: string;
  content: FlexText;
}

export interface FlexHardwareOption {
  name: FlexText;
  image?: string;
  price: string;
  features: FlexText[];
  recommended?: boolean;
  buyLinks?: { store: string; url: string }[];
}

// Legacy type aliases for backwards compatibility
export type LocalizedComponent = FlexComponent;
export type LocalizedWiringConnection = FlexWiringConnection;
export type LocalizedGuideSection = FlexGuideSection;
export type LocalizedHardwareOption = FlexHardwareOption;

export const CATEGORY_INFO: Record<ProjectCategory, { name: LocalizedString; icon: string }> = {
  'cw-morse': { name: { de: 'CW / Morse', en: 'CW / Morse', sl: 'CW / Morse' }, icon: '📡' },
  'measurement': { name: { de: 'Mess- & Anzeige', en: 'Measurement', sl: 'Merilne naprave' }, icon: '📊' },
  'antenna': { name: { de: 'Antennen', en: 'Antennas', sl: 'Antene' }, icon: '📶' },
  'digital-aprs': { name: { de: 'Digital / APRS', en: 'Digital / APRS', sl: 'Digitalno / APRS' }, icon: '💻' },
  'audio': { name: { de: 'Audio / NF', en: 'Audio / AF', sl: 'Avdio / NF' }, icon: '🔊' },
  'control': { name: { de: 'Steuerung', en: 'Control', sl: 'Krmiljenje' }, icon: '🎛️' },
  'mesh-lora': { name: { de: 'Mesh / LoRa', en: 'Mesh / LoRa', sl: 'Mesh / LoRa' }, icon: '🌐' },
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

export const DIFFICULTY_LABELS: Record<1 | 2 | 3, LocalizedString> = {
  1: { de: 'Einfach', en: 'Easy', sl: 'Enostavno' },
  2: { de: 'Mittel', en: 'Medium', sl: 'Srednje' },
  3: { de: 'Fortgeschritten', en: 'Advanced', sl: 'Napredno' },
};
