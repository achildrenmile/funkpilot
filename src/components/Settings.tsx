import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, User, MapPin, Save, Check, Server, Sun, Moon } from 'lucide-react';
import { checkHealth } from '../services/api';
import { LATEST_VERSION } from '../data/changelog';
import { SUPPORTED_LANGUAGES, changeLanguage, getCurrentLanguage, type SupportedLanguage } from '../i18n';
import type { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<UserSettings>) => void;
}

export default function SettingsPanel({ settings, onUpdate }: SettingsProps) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(getCurrentLanguage());
  const [serverStatus, setServerStatus] = useState<{
    connected: boolean;
    hasGroqKey: boolean;
    hasAnthropicKey: boolean;
    hasOpenRouterKey: boolean;
    hasQrzKey: boolean;
    hasTavilyKey: boolean;
  } | null>(null);

  useEffect(() => {
    checkHealth()
      .then(health => {
        setServerStatus({
          connected: true,
          hasGroqKey: health.hasGroqKey,
          hasAnthropicKey: health.hasAnthropicKey,
          hasOpenRouterKey: health.hasOpenRouterKey,
          hasQrzKey: health.hasQrzKey,
          hasTavilyKey: health.hasTavilyKey,
        });
      })
      .catch(() => {
        setServerStatus({ connected: false, hasGroqKey: false, hasAnthropicKey: false, hasOpenRouterKey: false, hasQrzKey: false, hasTavilyKey: false });
      });
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = <K extends keyof UserSettings>(field: K, value: UserSettings[K]) => {
    onUpdate({ [field]: value });
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    changeLanguage(lang);
    setCurrentLang(lang);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-sky-400" />
          {t('settings.title')}
        </h2>
        <p className="text-slate-400 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Server Status */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-sky-400" />
          {t('settings.serverStatus')}
        </h3>

        {serverStatus === null ? (
          <p className="text-slate-400">{t('settings.checkingConnection')}</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${serverStatus.connected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>{t('settings.backendServer')}: {serverStatus.connected ? t('settings.connected') : t('settings.notReachable')}</span>
            </div>

            {serverStatus.connected && (
              <>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${serverStatus.hasGroqKey ? 'bg-green-400' : 'bg-slate-500'}`} />
                  <span>{t('settings.groqApi')}: {serverStatus.hasGroqKey ? `${t('settings.configured')} (${t('settings.recommended')})` : t('settings.notConfigured')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${serverStatus.hasAnthropicKey ? 'bg-green-400' : 'bg-slate-500'}`} />
                  <span>{t('settings.anthropicApi')}: {serverStatus.hasAnthropicKey ? t('settings.configured') : t('settings.notConfigured')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${serverStatus.hasOpenRouterKey ? 'bg-green-400' : 'bg-slate-500'}`} />
                  <span>{t('settings.openRouterApi')}: {serverStatus.hasOpenRouterKey ? t('settings.configured') : t('settings.notConfigured')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${serverStatus.hasTavilyKey ? 'bg-green-400' : 'bg-slate-500'}`} />
                  <span>{t('settings.tavilySearch')}: {serverStatus.hasTavilyKey ? t('settings.activated') : t('settings.notConfigured')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${serverStatus.hasQrzKey ? 'bg-green-400' : 'bg-slate-500'}`} />
                  <span>{t('settings.qrzLookup')}: {serverStatus.hasQrzKey ? t('settings.configured') : t('settings.notConfigured')}</span>
                </div>
              </>
            )}

            {!serverStatus.connected && (
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 text-sm text-amber-200">
                <p className="font-medium">{t('settings.serverNotReachable')}</p>
                <p className="mt-1">{t('settings.serverNotReachableHint')} <code className="bg-slate-700 px-1 rounded">npm run dev:full</code></p>
              </div>
            )}

            {serverStatus.connected && !serverStatus.hasGroqKey && !serverStatus.hasAnthropicKey && !serverStatus.hasOpenRouterKey && (
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 text-sm text-amber-200">
                <p className="font-medium">{t('settings.noApiKeyConfigured')}</p>
                <p className="mt-1">{t('settings.noApiKeyHint')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Station Info */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-sky-400" />
          {t('settings.station')}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('settings.callsign')}</label>
            <input
              type="text"
              value={settings.callsign}
              onChange={(e) => updateField('callsign', e.target.value.toUpperCase())}
              placeholder={t('settings.callsignPlaceholder')}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('settings.name')}</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={t('settings.namePlaceholder')}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {t('settings.locator')}
              </span>
            </label>
            <input
              type="text"
              value={settings.locator}
              onChange={(e) => updateField('locator', e.target.value.toUpperCase())}
              placeholder={t('settings.locatorPlaceholder')}
              maxLength={6}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('settings.contestZone')}</label>
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
        <h3 className="text-lg font-semibold mb-4">{t('settings.voiceSettings')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('settings.defaultLanguageTTS')}</label>
            <select
              value={settings.voiceSettings.language}
              onChange={(e) => updateField('voiceSettings', {
                ...settings.voiceSettings,
                language: e.target.value as 'de' | 'en',
              })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            >
              <option value="en">{t('settings.englishForContest')}</option>
              <option value="de">{t('languages.de')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              {t('settings.speedLabel')}: {settings.voiceSettings.speed.toFixed(1)}x
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
        <h3 className="text-lg font-semibold mb-4">{t('settings.appSettings')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('settings.uiLanguage')}</label>
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('settings.theme')}</label>
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
                {t('settings.themeDark')}
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
                {t('settings.themeLight')}
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
              {t('settings.saved')}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {t('settings.saveSettings')}
            </>
          )}
        </button>
      </div>

      {/* About */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-2">{t('settings.aboutTitle')}</h3>
        <p className="text-slate-400 text-sm mb-4">
          {t('settings.aboutText')}
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
          <span className="text-slate-400">{t('settings.version')} {LATEST_VERSION}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">73 de OE8YML</span>
        </div>
      </div>
    </div>
  );
}
