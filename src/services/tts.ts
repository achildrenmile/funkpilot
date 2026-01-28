import type { TTSSettings } from '../types';

export interface VoiceInfo {
  id: string;
  name: string;
  lang: string;
}

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
        id: v.voiceURI,
        name: `${v.name} (${v.lang})`,
        lang: v.lang,
      }));
  }

  private getVoice(voiceId: string): SpeechSynthesisVoice | null {
    return this.voices.find(v => v.voiceURI === voiceId) || null;
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

  isPaused(): boolean {
    return this.synth.paused;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }
}

// Singleton instance
let ttsInstance: WebSpeechTTS | null = null;

export function getTTS(): WebSpeechTTS {
  if (!ttsInstance) {
    ttsInstance = new WebSpeechTTS();
  }
  return ttsInstance;
}

export async function speak(text: string, settings: TTSSettings): Promise<void> {
  const tts = getTTS();
  return tts.speak(text, settings);
}

export function stopSpeaking(): void {
  const tts = getTTS();
  tts.stop();
}

export async function getAvailableVoices(): Promise<VoiceInfo[]> {
  const tts = getTTS();
  await tts.waitForVoices();
  return tts.getVoices();
}

/**
 * Generate audio blob from text (for download)
 * Note: This uses the MediaRecorder API to capture the audio output
 * In practice, you might want to use a server-side TTS service for this
 */
export async function generateAudioBlob(
  _text: string,
  _settings: TTSSettings
): Promise<Blob | null> {
  // Web Speech API doesn't directly support audio export
  // This would require either:
  // 1. A server-side TTS service like ElevenLabs
  // 2. Recording the system audio (not generally possible in browsers)
  // For now, return null and show a message to use browser playback
  console.warn('Audio download not supported with Web Speech API. Use browser playback instead.');
  return null;
}

/**
 * Check if TTS is supported in the current browser
 */
export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window;
}
