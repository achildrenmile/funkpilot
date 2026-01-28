import type { UserSettings, ChatMessage, VoiceCQSettings } from '../types';

const STORAGE_KEYS = {
  USER_SETTINGS: 'funkpilot_user_settings',
  CHAT_HISTORY: 'funkpilot_chat_history',
  VOICE_SETTINGS: 'funkpilot_voice_settings',
} as const;

const DEFAULT_USER_SETTINGS: UserSettings = {
  callsign: '',
  locator: '',
  name: '',
  contestZone: '15',
  language: 'de',
  theme: 'dark',
  voiceSettings: {
    voice: '',
    speed: 1.0,
    pitch: 1.0,
    language: 'en',
  },
};

const DEFAULT_VOICE_SETTINGS: VoiceCQSettings = {
  callsign: '',
  contest: 'cqww',
  zone: '15',
  serialNr: 1,
  tts: {
    voice: '',
    speed: 1.0,
    pitch: 1.0,
    language: 'en',
  },
  outputMode: 'browser',
  phonetikMode: 'auto',
};

export function getUserSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (stored) {
      return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error loading user settings:', e);
  }
  return DEFAULT_USER_SETTINGS;
}

export function saveUserSettings(settings: Partial<UserSettings>): void {
  try {
    const current = getUserSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving user settings:', e);
  }
}

export function getVoiceSettings(): VoiceCQSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS);
    if (stored) {
      return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error loading voice settings:', e);
  }
  return DEFAULT_VOICE_SETTINGS;
}

export function saveVoiceSettings(settings: Partial<VoiceCQSettings>): void {
  try {
    const current = getVoiceSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.VOICE_SETTINGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving voice settings:', e);
  }
}

export function getChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (stored) {
      const messages = JSON.parse(stored);
      return messages.map((m: ChatMessage) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
  } catch (e) {
    console.error('Error loading chat history:', e);
  }
  return [];
}

export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    // Keep only last 50 messages to avoid storage limits
    const toSave = messages.slice(-50);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
}

export function clearChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  } catch (e) {
    console.error('Error clearing chat history:', e);
  }
}
