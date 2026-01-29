import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, MapPin, Save, Check, Server, Sun, Moon } from 'lucide-react';
import { checkHealth } from '../services/api';
import type { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<UserSettings>) => void;
}

export default function SettingsPanel({ settings, onUpdate }: SettingsProps) {
  const [saved, setSaved] = useState(false);
  const [serverStatus, setServerStatus] = useState<{
    connected: boolean;
    hasGroqKey: boolean;
    hasAnthropicKey: boolean;
    hasOpenRouterKey: boolean;
  } | null>(null);

  useEffect(() => {
    checkHealth()
      .then(health => {
        setServerStatus({
          connected: true,
          hasGroqKey: health.hasGroqKey,
          hasAnthropicKey: health.hasAnthropicKey,
          hasOpenRouterKey: health.hasOpenRouterKey,
        });
      })
      .catch(() => {
        setServerStatus({ connected: false, hasGroqKey: false, hasAnthropicKey: false, hasOpenRouterKey: false });
      });
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = <K extends keyof UserSettings>(field: K, value: UserSettings[K]) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-sky-400" />
          Einstellungen
        </h2>
        <p className="text-slate-400 mt-1">
          Konfiguriere FunkPilot für dein Rufzeichen und deine Präferenzen
        </p>
      </div>

      {/* Server Status */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-sky-400" />
          Server-Status
        </h3>

        {serverStatus === null ? (
          <p className="text-slate-400">Prüfe Verbindung...</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${serverStatus.connected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>Backend-Server: {serverStatus.connected ? 'Verbunden' : 'Nicht erreichbar'}</span>
            </div>

            {serverStatus.connected && (
              <>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${serverStatus.hasGroqKey ? 'bg-green-400' : 'bg-slate-500'}`} />
                  <span>Groq API: {serverStatus.hasGroqKey ? 'Konfiguriert (Empfohlen)' : 'Nicht konfiguriert'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${serverStatus.hasAnthropicKey ? 'bg-green-400' : 'bg-slate-500'}`} />
                  <span>Anthropic API: {serverStatus.hasAnthropicKey ? 'Konfiguriert' : 'Nicht konfiguriert'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${serverStatus.hasOpenRouterKey ? 'bg-green-400' : 'bg-slate-500'}`} />
                  <span>OpenRouter API: {serverStatus.hasOpenRouterKey ? 'Konfiguriert' : 'Nicht konfiguriert'}</span>
                </div>
              </>
            )}

            {!serverStatus.connected && (
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 text-sm text-amber-200">
                <p className="font-medium">Server nicht erreichbar</p>
                <p className="mt-1">Starte den Server mit: <code className="bg-slate-700 px-1 rounded">npm run dev:full</code></p>
              </div>
            )}

            {serverStatus.connected && !serverStatus.hasGroqKey && !serverStatus.hasAnthropicKey && !serverStatus.hasOpenRouterKey && (
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 text-sm text-amber-200">
                <p className="font-medium">Kein KI-API-Key konfiguriert</p>
                <p className="mt-1">Setze GROQ_API_KEY (empfohlen, kostenlos) als Umgebungsvariable.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Station Info */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-sky-400" />
          Station
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Rufzeichen</label>
            <input
              type="text"
              value={settings.callsign}
              onChange={(e) => updateField('callsign', e.target.value.toUpperCase())}
              placeholder="OE8YML"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Max"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Locator (Maidenhead)
              </span>
            </label>
            <input
              type="text"
              value={settings.locator}
              onChange={(e) => updateField('locator', e.target.value.toUpperCase())}
              placeholder="JN66TO"
              maxLength={6}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Contest-Zone (CQ)</label>
            <input
              type="text"
              value={settings.contestZone}
              onChange={(e) => updateField('contestZone', e.target.value)}
              placeholder="15"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
          </div>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Sprach-Einstellungen</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Standard-Sprache für TTS</label>
            <select
              value={settings.voiceSettings.language}
              onChange={(e) => updateField('voiceSettings', {
                ...settings.voiceSettings,
                language: e.target.value as 'de' | 'en',
              })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            >
              <option value="en">Englisch (für Contest)</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Geschwindigkeit: {settings.voiceSettings.speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voiceSettings.speed}
              onChange={(e) => updateField('voiceSettings', {
                ...settings.voiceSettings,
                speed: parseFloat(e.target.value),
              })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">App-Einstellungen</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">UI-Sprache</label>
            <select
              value={settings.language}
              onChange={(e) => updateField('language', e.target.value as 'de' | 'en')}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateField('theme', 'dark')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-sky-600 border-sky-500 text-white'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dunkel
              </button>
              <button
                onClick={() => updateField('theme', 'light')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-sky-600 border-sky-500 text-white'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <Sun className="w-4 h-4" />
                Hell
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-sky-600 hover:bg-sky-700 text-white'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Gespeichert
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Einstellungen speichern
            </>
          )}
        </button>
      </div>

      {/* About */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-2">Über FunkPilot</h3>
        <p className="text-slate-400 text-sm mb-4">
          FunkPilot ist ein Open-Source KI-Assistent für Funkamateure. Entwickelt mit Leidenschaft
          für die Amateurfunk-Community.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href="https://github.com/oe8yml/funkpilot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline"
          >
            GitHub Repository
          </a>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Version 1.0.0</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">73 de OE8YML</span>
        </div>
      </div>
    </div>
  );
}
