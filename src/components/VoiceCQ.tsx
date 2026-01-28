import { useState, useEffect } from 'react';
import { Play, Square, Volume2, Settings2 } from 'lucide-react';
import { PHRASE_TEMPLATES } from '../data/phrases';
import { processTemplate } from '../utils/phonetic';
import { speak, stopSpeaking, getAvailableVoices, type VoiceInfo } from '../services/tts';
import { getVoiceSettings, saveVoiceSettings } from '../utils/storage';
import { CONTESTS } from '../types';
import type { UserSettings, VoiceCQSettings } from '../types';

interface VoiceCQProps {
  settings: UserSettings;
}

export default function VoiceCQ({ settings: userSettings }: VoiceCQProps) {
  const [voiceSettings, setVoiceSettings] = useState<VoiceCQSettings>(getVoiceSettings());
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState<string | null>(null);
  const [customPhrase, setCustomPhrase] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Load voices on mount
  useEffect(() => {
    const loadVoices = async () => {
      const availableVoices = await getAvailableVoices();
      setVoices(availableVoices);

      // Set default voice if not set
      if (!voiceSettings.tts.voice && availableVoices.length > 0) {
        const englishVoice = availableVoices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          updateVoiceSettings({ tts: { ...voiceSettings.tts, voice: englishVoice.id } });
        }
      }
    };
    loadVoices();
  }, []);

  // Sync callsign from user settings
  useEffect(() => {
    if (userSettings.callsign && userSettings.callsign !== voiceSettings.callsign) {
      updateVoiceSettings({ callsign: userSettings.callsign });
    }
  }, [userSettings.callsign]);

  const updateVoiceSettings = (updates: Partial<VoiceCQSettings>) => {
    const updated = { ...voiceSettings, ...updates };
    setVoiceSettings(updated);
    saveVoiceSettings(updated);
  };

  const getVariables = (): Record<string, string> => {
    return {
      CALL: voiceSettings.callsign || 'YOUR_CALL',
      RST: '59',
      ZONE: voiceSettings.zone || '15',
      SERIAL: voiceSettings.serialNr.toString().padStart(3, '0'),
    };
  };

  const playPhrase = async (template: string, usePhonetic: boolean) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      setCurrentPhrase(null);
      return;
    }

    const variables = getVariables();
    const text = processTemplate(template, variables, usePhonetic);
    setCurrentPhrase(text);
    setIsSpeaking(true);

    try {
      await speak(text, voiceSettings.tts);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
      setCurrentPhrase(null);
    }
  };

  const playCustomPhrase = async () => {
    if (!customPhrase.trim()) return;

    const variables = getVariables();
    const usePhonetic = voiceSettings.phonetikMode !== 'none';
    const text = processTemplate(customPhrase, variables, usePhonetic);

    setCurrentPhrase(text);
    setIsSpeaking(true);

    try {
      await speak(text, voiceSettings.tts);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
      setCurrentPhrase(null);
    }
  };

  const filteredPhrases = PHRASE_TEMPLATES.filter(
    p => !p.contest || p.contest.includes(voiceSettings.contest)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-sky-400" />
            Voice CQ Generator
          </h2>
          <p className="text-slate-400 mt-1">
            Generiere natürlich klingende CQ-Rufe und Contest-Phrasen
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${
            showSettings ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Einstellungen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Callsign */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mein Rufzeichen</label>
              <input
                type="text"
                value={voiceSettings.callsign}
                onChange={(e) => updateVoiceSettings({ callsign: e.target.value.toUpperCase() })}
                placeholder="OE8YML"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 font-mono uppercase"
              />
            </div>

            {/* Contest */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Contest</label>
              <select
                value={voiceSettings.contest}
                onChange={(e) => updateVoiceSettings({ contest: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
              >
                {CONTESTS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Contest-Zone</label>
              <input
                type="text"
                value={voiceSettings.zone}
                onChange={(e) => updateVoiceSettings({ zone: e.target.value })}
                placeholder="15"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Seriennummer</label>
              <input
                type="number"
                value={voiceSettings.serialNr}
                onChange={(e) => updateVoiceSettings({ serialNr: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
              />
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Stimme</label>
              <select
                value={voiceSettings.tts.voice}
                onChange={(e) => updateVoiceSettings({ tts: { ...voiceSettings.tts, voice: e.target.value } })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
              >
                <option value="">Standard</option>
                {voices.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Speed */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Geschwindigkeit: {voiceSettings.tts.speed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.tts.speed}
                onChange={(e) => updateVoiceSettings({ tts: { ...voiceSettings.tts, speed: parseFloat(e.target.value) } })}
                className="w-full"
              />
            </div>

            {/* Pitch */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Tonhöhe: {voiceSettings.tts.pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.tts.pitch}
                onChange={(e) => updateVoiceSettings({ tts: { ...voiceSettings.tts, pitch: parseFloat(e.target.value) } })}
                className="w-full"
              />
            </div>

            {/* Phonetic Mode */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Phonetik</label>
              <select
                value={voiceSettings.phonetikMode}
                onChange={(e) => updateVoiceSettings({ phonetikMode: e.target.value as 'auto' | 'callonly' | 'none' })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
              >
                <option value="auto">Automatisch</option>
                <option value="callonly">Nur Rufzeichen</option>
                <option value="none">Keine</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Quick Info */}
      {voiceSettings.callsign && (
        <div className="bg-slate-800/50 rounded-lg px-4 py-2 flex items-center gap-4 text-sm">
          <span className="text-slate-400">Aktiv:</span>
          <span className="font-mono text-sky-400">{voiceSettings.callsign}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Contest:</span>
          <span>{CONTESTS.find(c => c.id === voiceSettings.contest)?.name}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Zone:</span>
          <span>{voiceSettings.zone}</span>
        </div>
      )}

      {/* Standard Phrases */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Standard-Phrasen</h3>
        <div className="grid gap-3">
          {filteredPhrases.map((phrase) => {
            const variables = getVariables();
            const previewText = processTemplate(phrase.template, variables, phrase.phonetik);
            const isPlaying = isSpeaking && currentPhrase === previewText;

            return (
              <div
                key={phrase.id}
                className={`bg-slate-700/50 rounded-lg p-4 border transition-colors ${
                  isPlaying ? 'border-sky-500 bg-sky-900/20' : 'border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Volume2 className="w-4 h-4 text-sky-400" />
                      <span className="font-medium">{phrase.nameDE}</span>
                      <span className="text-xs text-slate-500">({phrase.name})</span>
                    </div>
                    <p className="text-sm text-slate-400 font-mono truncate">
                      "{previewText}"
                    </p>
                  </div>
                  <button
                    onClick={() => playPhrase(phrase.template, phrase.phonetik)}
                    disabled={isSpeaking && currentPhrase !== previewText}
                    className={`p-3 rounded-lg transition-colors flex-shrink-0 ${
                      isPlaying
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50'
                    }`}
                  >
                    {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Phrase */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Eigene Phrase</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Verwende {'{CALL}'} für dein Rufzeichen, {'{CALL_PHONETIC}'} für Phonetik
            </label>
            <input
              type="text"
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder="CQ SOTA from {CALL_PHONETIC} portable"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
            />
          </div>

          {customPhrase && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <span className="text-xs text-slate-400">Vorschau: </span>
              <span className="text-sm font-mono text-slate-300">
                {processTemplate(customPhrase, getVariables(), voiceSettings.phonetikMode !== 'none')}
              </span>
            </div>
          )}

          <button
            onClick={playCustomPhrase}
            disabled={!customPhrase.trim() || isSpeaking}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            Generieren & Abspielen
          </button>
        </div>
      </div>

      {/* Now Playing Indicator */}
      {isSpeaking && currentPhrase && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-800 border border-sky-500 rounded-xl p-4 shadow-xl animate-pulse-glow">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-1 h-4 bg-sky-400 rounded-full animate-wave"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-sky-400 font-medium">Wird gesprochen...</p>
              <p className="text-xs text-slate-400 truncate font-mono">{currentPhrase}</p>
            </div>
            <button
              onClick={() => {
                stopSpeaking();
                setIsSpeaking(false);
                setCurrentPhrase(null);
              }}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
