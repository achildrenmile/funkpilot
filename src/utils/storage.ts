import type { UserSettings, ChatMessage, ChatConversation, VoiceCQSettings } from '../types';

const STORAGE_KEYS = {
  USER_SETTINGS: 'funkpilot_user_settings',
  CHAT_HISTORY: 'funkpilot_chat_history',
  VOICE_SETTINGS: 'funkpilot_voice_settings',
  CONVERSATIONS: 'funkpilot_conversations',
  ACTIVE_CONVERSATION: 'funkpilot_active_conversation',
} as const;

const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES_PER_CONVERSATION = 50;

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

// ===== Conversation Storage =====

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function parseConversationDates(conv: ChatConversation): ChatConversation {
  return {
    ...conv,
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt),
    messages: conv.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp),
    })),
  };
}

export function getConversations(): ChatConversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (stored) {
      const conversations: ChatConversation[] = JSON.parse(stored);
      return conversations.map(parseConversationDates);
    }
  } catch (e) {
    console.error('Error loading conversations:', e);
  }
  return [];
}

export function saveConversations(conversations: ChatConversation[]): void {
  try {
    // Enforce max conversations limit (keep newest)
    const toSave = conversations
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, MAX_CONVERSATIONS)
      .map(conv => ({
        ...conv,
        // Enforce max messages per conversation
        messages: conv.messages.slice(-MAX_MESSAGES_PER_CONVERSATION),
      }));
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving conversations:', e);
  }
}

export function getActiveConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  } catch (e) {
    console.error('Error loading active conversation ID:', e);
    return null;
  }
}

export function setActiveConversationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    }
  } catch (e) {
    console.error('Error saving active conversation ID:', e);
  }
}

export function createNewConversation(title?: string): ChatConversation {
  const now = new Date();
  return {
    id: generateUUID(),
    title: title || 'Neuer Chat',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function migrateV1ChatHistory(): ChatConversation | null {
  try {
    const oldHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (!oldHistory) return null;

    const messages: ChatMessage[] = JSON.parse(oldHistory).map((m: ChatMessage) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));

    if (messages.length === 0) return null;

    // Generate title from first user message
    const firstUserMessage = messages.find(m => m.role === 'user');
    const title = firstUserMessage
      ? firstUserMessage.content.slice(0, 40) + (firstUserMessage.content.length > 40 ? '...' : '')
      : 'Migrierter Chat';

    const conversation: ChatConversation = {
      id: generateUUID(),
      title,
      messages,
      createdAt: messages[0]?.timestamp || new Date(),
      updatedAt: messages[messages.length - 1]?.timestamp || new Date(),
    };

    // Clear old storage after migration
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);

    return conversation;
  } catch (e) {
    console.error('Error migrating v1 chat history:', e);
    return null;
  }
}
