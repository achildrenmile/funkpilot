import { useState, useEffect } from 'react';
import { Globe, RefreshCw, Loader2, AlertCircle, Minus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getSolarData, getConditionQuality } from '../services/solar';
import { getPropagationAdvice } from '../services/claude';
import { checkHealth } from '../services/api';
import { PROPAGATION_TARGETS } from '../data/phrases';
import type { UserSettings, SolarData } from '../types';

interface PropagationProps {
  settings: UserSettings;
  solarData: SolarData | null;
  isLoading: boolean;
}

export default function Propagation({ settings, solarData, isLoading }: PropagationProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [customLocator, setCustomLocator] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  // Check API availability on mount
  useEffect(() => {
    checkHealth()
      .then(health => {
        setApiAvailable(health.hasAnthropicKey || health.hasOpenRouterKey);
      })
      .catch(() => {
        setApiAvailable(false);
      });
  }, []);

  const quality = solarData ? getConditionQuality(solarData) : null;

  const refreshSolarData = async () => {
    setIsRefreshing(true);
    try {
      await getSolarData();
      window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAdvice = async (targetId: string) => {
    if (!solarData) return;

    const target = PROPAGATION_TARGETS.find(t => t.id === targetId);
    if (!target) return;

    setSelectedTarget(targetId);
    setIsLoadingAdvice(true);
    setError(null);
    setAdvice(null);

    try {
      const result = await getPropagationAdvice(
        `${target.name} (${target.prefix})`,
        settings.locator || 'JN77',
        solarData
      );
      setAdvice(result);
    } catch (err) {
      console.error('Advice error:', err);
      setError(err instanceof Error ? err.message : 'Fehler bei der Empfehlung.');
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const getCustomAdvice = async () => {
    if (!customLocator || !solarData) return;

    setSelectedTarget('custom');
    setIsLoadingAdvice(true);
    setError(null);
    setAdvice(null);

    try {
      const result = await getPropagationAdvice(
        `Locator ${customLocator.toUpperCase()}`,
        settings.locator || 'JN77',
        solarData
      );
      setAdvice(result);
    } catch (err) {
      console.error('Advice error:', err);
      setError(err instanceof Error ? err.message : 'Fehler bei der Empfehlung.');
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const getQualityColor = (q: string) => {
    switch (q) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-green-300';
      case 'moderate': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getQualityBg = (q: string) => {
    switch (q) {
      case 'excellent': return 'bg-green-500/20 border-green-500/50';
      case 'good': return 'bg-green-500/10 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'poor': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-slate-700 border-slate-600';
    }
  };

  const getQualityLabel = (q: string) => {
    switch (q) {
      case 'excellent': return 'Ausgezeichnet';
      case 'good': return 'Gut';
      case 'moderate': return 'Moderat';
      case 'poor': return 'Schlecht';
      default: return 'Unbekannt';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-sky-400" />
            Propagation-Berater
          </h2>
          <p className="text-slate-400 mt-1">
            Echtzeit Sonnen-Daten und KI-Empfehlungen für DX-Verbindungen
          </p>
        </div>
        <button
          onClick={refreshSolarData}
          disabled={isRefreshing}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Solar Conditions */}
      <div className={`rounded-xl p-6 border ${quality ? getQualityBg(quality.hf) : 'bg-slate-800 border-slate-700'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Aktuelle Bedingungen</h3>
          {solarData && (
            <span className="text-sm text-slate-400">
              Stand: {solarData.updatedAt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })} UTC
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          </div>
        ) : solarData ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Solar Flux</p>
              <p className={`text-2xl font-bold ${solarData.sfi > 120 ? 'text-green-400' : solarData.sfi > 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                {solarData.sfi}
              </p>
              <p className="text-xs text-slate-500">
                {solarData.sfi > 150 ? 'Sehr gut' : solarData.sfi > 120 ? 'Gut' : solarData.sfi > 80 ? 'Moderat' : 'Niedrig'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">K-Index</p>
              <p className={`text-2xl font-bold ${solarData.kIndex <= 2 ? 'text-green-400' : solarData.kIndex <= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                {solarData.kIndex}
              </p>
              <p className="text-xs text-slate-500">
                {solarData.kIndex <= 2 ? 'Ruhig' : solarData.kIndex <= 4 ? 'Unruhig' : 'Gestört'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">A-Index</p>
              <p className={`text-2xl font-bold ${solarData.aIndex <= 10 ? 'text-green-400' : solarData.aIndex <= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                {solarData.aIndex}
              </p>
              <p className="text-xs text-slate-500">
                {solarData.aIndex <= 10 ? 'Normal' : solarData.aIndex <= 20 ? 'Erhöht' : 'Hoch'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Sonnenflecken</p>
              <p className="text-2xl font-bold text-slate-200">{solarData.sunspots}</p>
              <p className="text-xs text-slate-500">SSN</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">X-Ray</p>
              <p className="text-2xl font-bold text-slate-200">{solarData.xrayFlux}</p>
              <p className="text-xs text-slate-500">
                {solarData.xrayFlux.startsWith('A') || solarData.xrayFlux.startsWith('B') ? 'Niedrig' : 'Erhöht'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">Keine Solar-Daten verfügbar</p>
        )}

        {/* Quality Summary */}
        {quality && (
          <div className="mt-4 pt-4 border-t border-slate-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">HF:</span>
                  <span className={`font-medium ${getQualityColor(quality.hf)}`}>
                    {getQualityLabel(quality.hf)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">VHF:</span>
                  <span className={`font-medium ${getQualityColor(quality.vhf)}`}>
                    {getQualityLabel(quality.vhf)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Trend:</span>
                <Minus className="w-4 h-4" />
                <span>Stabil</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Selection */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Ziel auswählen</h3>

        {/* Popular Targets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PROPAGATION_TARGETS.slice(0, 8).map(target => (
            <button
              key={target.id}
              onClick={() => getAdvice(target.id)}
              disabled={isLoadingAdvice || !solarData || apiAvailable === false}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                selectedTarget === target.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              {target.name}
            </button>
          ))}
        </div>

        {/* Custom Locator Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customLocator}
            onChange={(e) => setCustomLocator(e.target.value.toUpperCase())}
            placeholder="Locator eingeben (z.B. PM95)"
            maxLength={6}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 font-mono uppercase"
          />
          <button
            onClick={getCustomAdvice}
            disabled={!customLocator || customLocator.length < 4 || isLoadingAdvice || !solarData || apiAvailable === false}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Analysieren
          </button>
        </div>

        {/* API Availability Warning */}
        {apiAvailable === false && (
          <div className="mt-4 bg-amber-900/30 border border-amber-700 rounded-lg p-3 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-amber-200">
              Starte den Server mit API-Keys für KI-Empfehlungen.
            </span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Loading Advice */}
      {isLoadingAdvice && (
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto mb-4" />
          <p className="text-slate-400">Analysiere Propagation-Bedingungen...</p>
        </div>
      )}

      {/* AI Advice */}
      {advice && !isLoadingAdvice && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>KI-Empfehlung</span>
              {selectedTarget && selectedTarget !== 'custom' && (
                <span className="text-sky-400">
                  für {PROPAGATION_TARGETS.find(t => t.id === selectedTarget)?.name}
                </span>
              )}
              {selectedTarget === 'custom' && (
                <span className="text-sky-400">für {customLocator}</span>
              )}
            </h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{advice}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Band Status Summary */}
      {solarData && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Band-Einschätzung (basierend auf SFI {solarData.sfi}, K={solarData.kIndex})</h3>

          {/* HF High Bands */}
          <p className="text-sm text-slate-400 mb-2">Obere Kurzwelle</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {[
              { band: '10m', muf: 180, label: '28 MHz' },
              { band: '12m', muf: 160, label: '24 MHz' },
              { band: '15m', muf: 130, label: '21 MHz' },
              { band: '17m', muf: 110, label: '18 MHz' },
              { band: '20m', muf: 80, label: '14 MHz' },
            ].map(({ band, muf, label }) => {
              const isOpen = solarData.sfi >= muf && solarData.kIndex <= 4;
              const isMarginal = solarData.sfi >= muf * 0.8 && solarData.sfi < muf;
              return (
                <div
                  key={band}
                  className={`rounded-lg p-2 sm:p-3 text-center border ${
                    isOpen
                      ? 'bg-green-500/20 border-green-500/50'
                      : isMarginal
                      ? 'bg-yellow-500/20 border-yellow-500/50'
                      : 'bg-slate-700/50 border-slate-600'
                  }`}
                >
                  <p className="font-bold text-sm sm:text-base">{band}</p>
                  <p className="text-xs text-slate-400 hidden sm:block">{label}</p>
                  <p className={`text-xs sm:text-sm mt-1 ${isOpen ? 'text-green-400' : isMarginal ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {isOpen ? 'Offen' : isMarginal ? 'Marginal' : 'Zu'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* HF Low Bands */}
          <p className="text-sm text-slate-400 mb-2">Untere Kurzwelle (Nachtbänder)</p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
            {[
              { band: '30m', label: '10 MHz', night: false, kSensitive: true },
              { band: '40m', label: '7 MHz', night: true, kSensitive: true },
              { band: '60m', label: '5 MHz', night: true, kSensitive: true },
              { band: '80m', label: '3.5 MHz', night: true, kSensitive: true },
              { band: '160m', label: '1.8 MHz', night: true, kSensitive: true },
            ].map(({ band, label, night, kSensitive }) => {
              const hour = new Date().getUTCHours();
              const isNightTime = hour >= 17 || hour <= 7;
              const isOpen = night ? isNightTime && solarData.kIndex <= 3 : solarData.kIndex <= 4;
              const isMarginal = night ? (isNightTime && solarData.kIndex > 3 && solarData.kIndex <= 5) : false;
              const kWarning = kSensitive && solarData.kIndex > 3;
              return (
                <div
                  key={band}
                  className={`rounded-lg p-2 sm:p-3 text-center border ${
                    isOpen && !kWarning
                      ? 'bg-green-500/20 border-green-500/50'
                      : isMarginal || kWarning
                      ? 'bg-yellow-500/20 border-yellow-500/50'
                      : 'bg-slate-700/50 border-slate-600'
                  }`}
                >
                  <p className="font-bold text-sm sm:text-base">{band}</p>
                  <p className="text-xs text-slate-400 hidden sm:block">{label}</p>
                  <p className={`text-xs sm:text-sm mt-1 ${
                    isOpen && !kWarning ? 'text-green-400' : isMarginal || kWarning ? 'text-yellow-400' : 'text-slate-500'
                  }`}>
                    {night && !isNightTime ? 'Tag' : kWarning ? 'K!' : isOpen ? 'Offen' : 'Zu'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* VHF/UHF */}
          <p className="text-sm text-slate-400 mb-2">VHF/UHF (Sporadic-E, Tropo)</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { band: '6m', label: '50 MHz', esProb: solarData.sfi > 100 },
              { band: '4m', label: '70 MHz', esProb: solarData.sfi > 120 },
              { band: '2m', label: '144 MHz', tropo: true },
              { band: '70cm', label: '432 MHz', tropo: true },
            ].map(({ band, label, esProb, tropo }) => {
              const status = esProb ? 'ES möglich' : tropo ? 'Tropo' : 'Lokal';
              const isActive = esProb;
              return (
                <div
                  key={band}
                  className={`rounded-lg p-2 sm:p-3 text-center border ${
                    isActive
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-slate-700/50 border-slate-600'
                  }`}
                >
                  <p className="font-bold text-sm sm:text-base">{band}</p>
                  <p className="text-xs text-slate-400 hidden sm:block">{label}</p>
                  <p className={`text-xs sm:text-sm mt-1 ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                    {status}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 mt-4">
            * Vereinfachte Einschätzung. Nachtbänder (40-160m) optimal nach Sonnenuntergang. K! = hoher K-Index beeinträchtigt Ausbreitung.
          </p>
        </div>
      )}
    </div>
  );
}
