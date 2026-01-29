import type { TTSSettings } from '../types';

export interface VoiceInfo {
  id: string;
  name: string;
  lang: string;
  provider: 'browser' | 'edge';
}

export interface EdgeVoice {
  id: string;
  name: string;
  locale: string;
  gender: string;
}

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

// Currently playing audio element
let currentAudio: HTMLAudioElement | null = null;

// ==================== Edge TTS ====================

async function getEdgeVoices(): Promise<VoiceInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/api/tts/voices`);
    if (!response.ok) throw new Error('Failed to fetch Edge voices');

    const voices: EdgeVoice[] = await response.json();
    return voices.map(v => ({
      id: `edge:${v.id}`,
      name: `${v.name} (Edge)`,
      lang: v.locale,
      provider: 'edge' as const,
    }));
  } catch (error) {
    console.error('Failed to fetch Edge voices:', error);
    return [];
  }
}

async function speakWithEdge(text: string, settings: TTSSettings): Promise<void> {
  // Stop any current playback
  stopSpeaking();

  // Extract voice ID (remove 'edge:' prefix)
  const voiceId = settings.voice?.startsWith('edge:')
    ? settings.voice.slice(5)
    : 'en-US-GuyNeural';

  const response = await fetch(`${API_BASE}/api/tts/speak`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voice: voiceId,
      rate: settings.speed,
      pitch: settings.pitch,
      volume: 1.0,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'TTS failed');
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  return new Promise((resolve, reject) => {
    currentAudio = new Audio(audioUrl);
    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      resolve();
    };
    currentAudio.onerror = (e) => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      reject(e);
    };
    currentAudio.play();
  });
}

// ==================== Browser TTS ====================

class WebSpeechTTS {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices(): void {
    const loadVoiceList = () => {
      this.voices = this.synth.getVoices();
      this.voicesLoaded = true;
    };

    loadVoiceList();

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoiceList;
    }
  }

  async waitForVoices(): Promise<void> {
    if (this.voicesLoaded && this.voices.length > 0) return;

    return new Promise((resolve) => {
      const check = () => {
        this.voices = this.synth.getVoices();
        if (this.voices.length > 0) {
          this.voicesLoaded = true;
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  getVoices(): VoiceInfo[] {
    return this.voices
      .filter(v => v.lang.startsWith('de') || v.lang.startsWith('en'))
      .map(v => ({
        id: `browser:${v.voiceURI}`,
        name: `${v.name} (Browser)`,
        lang: v.lang,
        provider: 'browser' as const,
      }));
  }

  private getVoice(voiceId: string): SpeechSynthesisVoice | null {
    // Remove 'browser:' prefix
    const id = voiceId.startsWith('browser:') ? voiceId.slice(8) : voiceId;
    return this.voices.find(v => v.voiceURI === id) || null;
  }

  async speak(text: string, settings: TTSSettings): Promise<void> {
    await this.waitForVoices();

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice
      if (settings.voice) {
        const voice = this.getVoice(settings.voice);
        if (voice) {
          utterance.voice = voice;
        }
      } else {
        // Default to English voice for ham radio
        const defaultVoice = this.voices.find(v =>
          v.lang.startsWith(settings.language === 'de' ? 'de' : 'en')
        );
        if (defaultVoice) {
          utterance.voice = defaultVoice;
        }
      }

      utterance.rate = settings.speed;
      utterance.pitch = settings.pitch;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      this.synth.speak(utterance);
    });
  }

  stop(): void {
    this.synth.cancel();
  }
}

// Singleton instance
let ttsInstance: WebSpeechTTS | null = null;

function getBrowserTTS(): WebSpeechTTS {
  if (!ttsInstance) {
    ttsInstance = new WebSpeechTTS();
  }
  return ttsInstance;
}

// ==================== Public API ====================

export async function speak(text: string, settings: TTSSettings): Promise<void> {
  const isEdgeVoice = settings.voice?.startsWith('edge:');

  if (isEdgeVoice) {
    return speakWithEdge(text, settings);
  } else {
    const tts = getBrowserTTS();
    return tts.speak(text, settings);
  }
}

export function stopSpeaking(): void {
  // Stop Edge TTS audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // Stop browser TTS
  const tts = getBrowserTTS();
  tts.stop();
}

export async function getAvailableVoices(): Promise<VoiceInfo[]> {
  // Get both Edge and Browser voices
  const [edgeVoices, browserVoices] = await Promise.all([
    getEdgeVoices(),
    (async () => {
      const tts = getBrowserTTS();
      await tts.waitForVoices();
      return tts.getVoices();
    })(),
  ]);

  // Edge voices first (better quality), then browser voices
  return [...edgeVoices, ...browserVoices];
}

export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window;
}
