import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, RefreshCw, Loader2, AlertCircle, Minus, MapPin, Radio, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getSolarData, getConditionQuality } from '../services/solar';
import { getPropagationAdvice } from '../services/claude';
import { checkHealth, getEsAlerts } from '../services/api';
import type { EsAlert, VhfSpot } from '../services/api';
import { PROPAGATION_TARGETS } from '../data/phrases';
import { locatorToLatLng, getSolarPosition } from '../utils/locator';
import type { UserSettings, SolarData } from '../types';

interface PropagationProps {
  settings: UserSettings;
  solarData: SolarData | null;
  isLoading: boolean;
}

export default function Propagation({ settings, solarData, isLoading }: PropagationProps) {
  const { t } = useTranslation();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [customLocator, setCustomLocator] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  // ES Alert state
  const [esAlerts, setEsAlerts] = useState<EsAlert[]>([]);
  const [esLoading, setEsLoading] = useState(false);
  const [esError, setEsError] = useState<string | null>(null);
  const [lastEsUpdate, setLastEsUpdate] = useState<Date | null>(null);

  // Check API availability on mount
  useEffect(() => {
    checkHealth()
      .then(health => {
        setApiAvailable(health.hasGroqKey || health.hasAnthropicKey || health.hasOpenRouterKey);
      })
      .catch(() => {
        setApiAvailable(false);
      });
  }, []);

  // Fetch ES alerts
  const fetchEsAlerts = async () => {
    setEsLoading(true);
    setEsError(null);
    try {
      const data = await getEsAlerts();
      setEsAlerts(data.alerts);
      setLastEsUpdate(new Date(data.timestamp));
    } catch (err) {
      console.error('ES Alert fetch error:', err);
      setEsError(err instanceof Error ? err.message : 'Failed to fetch ES alerts');
    } finally {
      setEsLoading(false);
    }
  };

  // Fetch ES alerts on mount and every 2 minutes
  useEffect(() => {
    fetchEsAlerts();
    const interval = setInterval(fetchEsAlerts, 2 * 60 * 1000);
    return () => clearInterval(interval);
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
      setError(err instanceof Error ? err.message : t('propagation.errorRecommendation'));
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
      setError(err instanceof Error ? err.message : t('propagation.errorRecommendation'));
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
      case 'excellent': return t('propagation.excellent');
      case 'good': return t('propagation.good');
      case 'moderate': return t('propagation.moderate');
      case 'poor': return t('propagation.poor');
      default: return t('propagation.closed');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 flex-shrink-0" />
            <span className="truncate">{t('propagation.title')}</span>
          </h2>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            {t('propagation.subtitle')}
          </p>
        </div>
        <button
          onClick={refreshSolarData}
          disabled={isRefreshing}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Solar Conditions */}
      <div className={`rounded-xl p-4 sm:p-6 border ${quality ? getQualityBg(quality.hf) : 'bg-slate-800 border-slate-700'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <h3 className="text-base sm:text-lg font-semibold">{t('propagation.currentConditions')}</h3>
          {solarData && (
            <span className="text-xs sm:text-sm text-slate-400">
              {t('propagation.asOf')}: {solarData.updatedAt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })} UTC
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          </div>
        ) : solarData ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
            <div className="text-center">
              <p className="text-slate-400 text-xs sm:text-sm mb-0.5 sm:mb-1">SFI</p>
              <p className={`text-xl sm:text-2xl font-bold ${solarData.sfi > 120 ? 'text-green-400' : solarData.sfi > 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                {solarData.sfi}
              </p>
              <p className="text-xs text-slate-500 hidden sm:block">
                {solarData.sfi > 150 ? t('propagation.veryGood') : solarData.sfi > 120 ? t('propagation.good') : solarData.sfi > 80 ? t('propagation.moderate') : t('propagation.low')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs sm:text-sm mb-0.5 sm:mb-1">K</p>
              <p className={`text-xl sm:text-2xl font-bold ${solarData.kIndex <= 2 ? 'text-green-400' : solarData.kIndex <= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                {solarData.kIndex}
              </p>
              <p className="text-xs text-slate-500 hidden sm:block">
                {solarData.kIndex <= 2 ? t('propagation.quiet') : solarData.kIndex <= 4 ? t('propagation.unsettled') : t('propagation.disturbed')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs sm:text-sm mb-0.5 sm:mb-1">A</p>
              <p className={`text-xl sm:text-2xl font-bold ${solarData.aIndex <= 10 ? 'text-green-400' : solarData.aIndex <= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                {solarData.aIndex}
              </p>
              <p className="text-xs text-slate-500 hidden sm:block">
                {solarData.aIndex <= 10 ? t('propagation.normal') : solarData.aIndex <= 20 ? t('propagation.elevated') : t('propagation.high')}
              </p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-slate-400 text-xs sm:text-sm mb-0.5 sm:mb-1">SSN</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-200">{solarData.sunspots}</p>
              <p className="text-xs text-slate-500">{t('propagation.spots')}</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-slate-400 text-xs sm:text-sm mb-0.5 sm:mb-1">X-Ray</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-200">{solarData.xrayFlux}</p>
              <p className="text-xs text-slate-500">
                {solarData.xrayFlux.startsWith('A') || solarData.xrayFlux.startsWith('B') ? t('propagation.low') : t('propagation.elevated')}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">{t('propagation.noSolarData')}</p>
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
                <span>{t('propagation.trend')}:</span>
                <Minus className="w-4 h-4" />
                <span>{t('propagation.stable')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Selection */}
      <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('propagation.selectTarget')}</h3>

        {/* Popular Targets */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-4">
          {PROPAGATION_TARGETS.slice(0, 8).map(target => (
            <button
              key={target.id}
              onClick={() => getAdvice(target.id)}
              disabled={isLoadingAdvice || !solarData || apiAvailable === false}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 ${
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
            placeholder={t('propagation.locatorPlaceholder')}
            maxLength={6}
            className="flex-1 min-w-0 bg-slate-700 border border-slate-600 rounded-lg px-3 sm:px-4 py-2 font-mono uppercase text-sm sm:text-base"
          />
          <button
            onClick={getCustomAdvice}
            disabled={!customLocator || customLocator.length < 4 || isLoadingAdvice || !solarData || apiAvailable === false}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <span className="hidden sm:inline">{t('propagation.analyze')}</span>
            <span className="sm:hidden">{t('propagation.go')}</span>
          </button>
        </div>

        {/* API Availability Warning */}
        {apiAvailable === false && (
          <div className="mt-4 bg-amber-900/30 border border-amber-700 rounded-lg p-3 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-amber-200">
              {t('propagation.backendNotAvailable')}
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
          <p className="text-slate-400">{t('propagation.analyzing')}</p>
        </div>
      )}

      {/* AI Advice */}
      {advice && !isLoadingAdvice && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>{t('propagation.aiRecommendation')}</span>
              {selectedTarget && selectedTarget !== 'custom' && (
                <span className="text-sky-400">
                  {t('propagation.for')} {PROPAGATION_TARGETS.find(tgt => tgt.id === selectedTarget)?.name}
                </span>
              )}
              {selectedTarget === 'custom' && (
                <span className="text-sky-400">{t('propagation.for')} {customLocator}</span>
              )}
            </h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{advice}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Band Status Summary */}
      {solarData && (() => {
        // Use configured locator or default to JN77 (Austria)
        const userLocator = settings.locator || 'JN77';
        const coords = locatorToLatLng(userLocator);

        // Calculate day/night based on user's QTH
        const now = new Date();
        const utcHour = now.getUTCHours();
        const utcMin = now.getUTCMinutes();

        let isDay: boolean;
        let isNight: boolean;
        let isTwilight: boolean;
        let localTimeStr: string;
        let solarStatus: string;

        if (coords) {
          const solar = getSolarPosition(coords.lat, coords.lng, now);
          isDay = solar.isDay && !solar.isTwilight;
          isNight = solar.isNight;
          isTwilight = solar.isTwilight;

          // Calculate local time
          const localHour = Math.floor(solar.localSolarTime);
          const localMin = Math.round((solar.localSolarTime - localHour) * 60);
          localTimeStr = `${localHour.toString().padStart(2, '0')}:${localMin.toString().padStart(2, '0')} LOC`;

          // Solar status based on elevation
          if (solar.solarElevation > 6) solarStatus = t('propagation.statusDay');
          else if (solar.solarElevation > 0) solarStatus = t('propagation.statusGreyline');
          else if (solar.solarElevation > -6) solarStatus = t('propagation.statusTwilight');
          else solarStatus = t('propagation.statusNight');
        } else {
          // Fallback to UTC-based estimation
          isDay = utcHour >= 6 && utcHour <= 18;
          isNight = !isDay;
          isTwilight = (utcHour >= 5 && utcHour <= 7) || (utcHour >= 17 && utcHour <= 19);
          localTimeStr = `${utcHour.toString().padStart(2, '0')}:${utcMin.toString().padStart(2, '0')} UTC`;
          solarStatus = isDay ? t('propagation.statusDay') : isTwilight ? t('propagation.statusGreyline') : t('propagation.statusNight');
        }

        // Band definitions with real propagation characteristics
        const allBands = [
          // VHF Bands (2m, 4m, 6m) - European focus
          { band: '2m', freq: 144, label: '144 MHz', category: 'vhf',
            getStatus: () => {
              // 2m: Primarily Tropo, Meteor Scatter, rare Sporadic-E (mainly summer, EU range)
              // ES on 2m is rare and mainly June/July, requires very strong ES clouds
              const summerMonth = now.getMonth() >= 4 && now.getMonth() <= 7; // May-August
              const esRare = solarData.sfi > 150 && solarData.kIndex <= 2 && summerMonth;
              const tropoGood = solarData.kIndex <= 2; // Stable conditions favor tropo
              const msActive = true; // Meteor scatter always possible with right equipment

              if (esRare && isTwilight) return { status: t('propagation.statusEsRare'), color: 'green', open: true };
              if (esRare) return { status: t('propagation.statusEsPossible'), color: 'yellow', open: false };
              if (tropoGood && !isDay) return { status: t('propagation.statusTropoEu'), color: 'green', open: true };
              if (tropoGood) return { status: t('propagation.statusTropo'), color: 'yellow', open: false };
              if (msActive) return { status: t('propagation.statusMs'), color: 'slate', open: false };
              return { status: t('propagation.statusLocal'), color: 'slate', open: false };
            }
          },
          { band: '4m', freq: 70, label: '70 MHz', category: 'vhf',
            getStatus: () => {
              // 4m: Good ES band for EU, between 6m and 2m behavior
              // ES more common than 2m, less than 6m. Summer season best.
              const summerMonth = now.getMonth() >= 4 && now.getMonth() <= 7; // May-August
              const esLikely = solarData.sfi > 100 && solarData.kIndex <= 3 && summerMonth;
              const esPossible = solarData.sfi > 80 && summerMonth;
              const tropoGood = solarData.kIndex <= 2;

              if (esLikely) return { status: t('propagation.statusEsLikely'), color: 'green', open: true };
              if (esPossible) return { status: t('propagation.statusEsPossible'), color: 'yellow', open: false };
              if (tropoGood && isTwilight) return { status: t('propagation.statusTropoEu'), color: 'green', open: true };
              if (tropoGood) return { status: t('propagation.statusTropo'), color: 'yellow', open: false };
              return { status: t('propagation.statusLocal'), color: 'slate', open: false };
            }
          },
          { band: '6m', freq: 50, label: '50 MHz', category: 'vhf',
            getStatus: () => {
              const esLikely = solarData.sfi > 120 && solarData.kIndex <= 3;
              const esPossible = solarData.sfi > 90;
              const fOpen = solarData.sfi > 150;
              if (fOpen) return { status: t('propagation.statusF2Open'), color: 'green', open: true };
              if (esLikely) return { status: t('propagation.statusEsLikely'), color: 'green', open: true };
              if (esPossible) return { status: t('propagation.statusEsPossible'), color: 'yellow', open: false };
              return { status: t('propagation.statusLocal'), color: 'slate', open: false };
            }
          },
          // Upper HF - Day bands, SFI dependent
          { band: '10m', freq: 28, label: '28 MHz', category: 'upper',
            getStatus: () => {
              const mufOk = solarData.sfi >= 150;
              const marginal = solarData.sfi >= 120 && solarData.sfi < 150;
              const kOk = solarData.kIndex <= 4;
              if (mufOk && kOk && isDay) return { status: 'Offen', color: 'green', open: true };
              if (marginal && kOk && isDay) return { status: 'Marginal', color: 'yellow', open: false };
              if (!isDay) return { status: 'Nacht', color: 'slate', open: false };
              return { status: 'Zu', color: 'slate', open: false };
            }
          },
          { band: '12m', freq: 24, label: '24 MHz', category: 'upper',
            getStatus: () => {
              const mufOk = solarData.sfi >= 130;
              const marginal = solarData.sfi >= 100 && solarData.sfi < 130;
              const kOk = solarData.kIndex <= 4;
              if (mufOk && kOk && isDay) return { status: 'Offen', color: 'green', open: true };
              if (marginal && kOk && isDay) return { status: 'Marginal', color: 'yellow', open: false };
              if (!isDay) return { status: 'Nacht', color: 'slate', open: false };
              return { status: 'Zu', color: 'slate', open: false };
            }
          },
          { band: '15m', freq: 21, label: '21 MHz', category: 'upper',
            getStatus: () => {
              const mufOk = solarData.sfi >= 100;
              const marginal = solarData.sfi >= 80 && solarData.sfi < 100;
              const kOk = solarData.kIndex <= 4;
              if (mufOk && kOk) return { status: 'Offen', color: 'green', open: true };
              if (marginal && kOk) return { status: 'Marginal', color: 'yellow', open: false };
              if (solarData.kIndex > 4) return { status: 'K!', color: 'yellow', open: false };
              return { status: 'Zu', color: 'slate', open: false };
            }
          },
          { band: '17m', freq: 18, label: '18 MHz', category: 'upper',
            getStatus: () => {
              const mufOk = solarData.sfi >= 85;
              const marginal = solarData.sfi >= 70 && solarData.sfi < 85;
              const kOk = solarData.kIndex <= 4;
              if (mufOk && kOk) return { status: 'Offen', color: 'green', open: true };
              if (marginal && kOk) return { status: 'Marginal', color: 'yellow', open: false };
              if (solarData.kIndex > 4) return { status: 'K!', color: 'yellow', open: false };
              return { status: 'Zu', color: 'slate', open: false };
            }
          },
          { band: '20m', freq: 14, label: '14 MHz', category: 'middle',
            getStatus: () => {
              const kOk = solarData.kIndex <= 4;
              const goodConditions = solarData.sfi >= 70 && kOk;
              // 20m is almost always open during day
              if (goodConditions && isDay) return { status: 'Offen', color: 'green', open: true };
              if (isDay && kOk) return { status: 'Offen', color: 'green', open: true };
              if (isTwilight) return { status: 'Greyline', color: 'green', open: true };
              if (isNight && solarData.sfi > 100) return { status: 'LP mögl.', color: 'yellow', open: false };
              if (solarData.kIndex > 4) return { status: 'K!', color: 'yellow', open: false };
              return { status: 'Nacht', color: 'slate', open: false };
            }
          },
          { band: '30m', freq: 10, label: '10 MHz', category: 'middle',
            getStatus: () => {
              const kOk = solarData.kIndex <= 3;
              // 30m works day and night, very K-sensitive
              if (kOk) return { status: 'Offen', color: 'green', open: true };
              if (solarData.kIndex <= 5) return { status: 'K!', color: 'yellow', open: false };
              return { status: 'Gestört', color: 'red', open: false };
            }
          },
          { band: '40m', freq: 7, label: '7 MHz', category: 'lower',
            getStatus: () => {
              const kOk = solarData.kIndex <= 3;
              // 40m: Day = EU, Night = DX
              if (isNight && kOk) return { status: 'DX offen', color: 'green', open: true };
              if (isDay && kOk) return { status: 'EU offen', color: 'green', open: true };
              if (isTwilight && kOk) return { status: 'Greyline', color: 'green', open: true };
              if (solarData.kIndex > 3) return { status: 'K!', color: 'yellow', open: false };
              return { status: 'Marginal', color: 'yellow', open: false };
            }
          },
          { band: '60m', freq: 5, label: '5 MHz', category: 'lower',
            getStatus: () => {
              const kOk = solarData.kIndex <= 3;
              if (isNight && kOk) return { status: 'Offen', color: 'green', open: true };
              if (isTwilight && kOk) return { status: 'Greyline', color: 'green', open: true };
              if (isDay) return { status: 'Tag', color: 'slate', open: false };
              if (solarData.kIndex > 3) return { status: 'K!', color: 'yellow', open: false };
              return { status: 'Marginal', color: 'yellow', open: false };
            }
          },
          { band: '80m', freq: 3.5, label: '3.5 MHz', category: 'lower',
            getStatus: () => {
              const kOk = solarData.kIndex <= 2;
              const kMarginal = solarData.kIndex <= 4;
              // 80m: Night band, very noise and K sensitive
              if (isNight && kOk) return { status: 'DX offen', color: 'green', open: true };
              if (isNight && kMarginal) return { status: 'EU offen', color: 'green', open: true };
              if (isTwilight && kMarginal) return { status: 'Greyline', color: 'green', open: true };
              if (isDay) return { status: 'Tag/QRN', color: 'slate', open: false };
              if (solarData.kIndex > 4) return { status: 'K!', color: 'red', open: false };
              return { status: 'Marginal', color: 'yellow', open: false };
            }
          },
          { band: '160m', freq: 1.8, label: '1.8 MHz', category: 'lower',
            getStatus: () => {
              const kOk = solarData.kIndex <= 2;
              const aOk = solarData.aIndex <= 10;
              // 160m: Night only, extremely K and A sensitive
              if (isNight && kOk && aOk) return { status: 'Offen', color: 'green', open: true };
              if (isNight && solarData.kIndex <= 3) return { status: 'Marginal', color: 'yellow', open: false };
              if (isDay) return { status: 'Tag/D-Abs', color: 'slate', open: false };
              if (solarData.kIndex > 3 || solarData.aIndex > 15) return { status: 'Gestört', color: 'red', open: false };
              return { status: 'Schwierig', color: 'yellow', open: false };
            }
          },
        ];

        const getColorClasses = (color: string, _open: boolean) => {
          if (color === 'green') return 'bg-green-500/20 border-green-500/50';
          if (color === 'yellow') return 'bg-yellow-500/20 border-yellow-500/50';
          if (color === 'red') return 'bg-red-500/20 border-red-500/50';
          if (color === 'purple') return 'bg-purple-500/20 border-purple-500/50';
          return 'bg-slate-700/50 border-slate-600';
        };

        const getTextColor = (color: string) => {
          if (color === 'green') return 'text-green-400';
          if (color === 'yellow') return 'text-yellow-400';
          if (color === 'red') return 'text-red-400';
          if (color === 'purple') return 'text-purple-400';
          return 'text-slate-500';
        };

        return (
          <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold">
                  <span className="hidden sm:inline">{t('propagation.bandStatusTitle')} (Live: SFI={solarData.sfi}, K={solarData.kIndex}, A={solarData.aIndex})</span>
                  <span className="sm:hidden">{t('propagation.bandStatusTitle')}</span>
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{t('propagation.qth')}: {userLocator}</span>
                  {coords && <span className="text-slate-500 hidden md:inline">({coords.lat.toFixed(1)}°N, {coords.lng.toFixed(1)}°E)</span>}
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 flex-shrink-0">
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-700 rounded">
                  {utcHour.toString().padStart(2, '0')}:{utcMin.toString().padStart(2, '0')} <span className="hidden sm:inline">UTC</span>
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-700 rounded hidden sm:inline">
                  {localTimeStr}
                </span>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${isDay ? 'bg-yellow-500/20 text-yellow-400' : isTwilight ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {solarStatus}
                </span>
              </div>
            </div>

            {/* VHF ES Alert Banner */}
            {esAlerts.some(a => a.active) && (
              <div className="mb-4 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-green-400 animate-pulse" />
                  <h4 className="font-bold text-green-400">{t('propagation.esAlertTitle')}</h4>
                  <span className="text-xs text-slate-400 ml-auto">
                    {lastEsUpdate && `${t('propagation.updated')}: ${lastEsUpdate.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {esAlerts.filter(a => a.active).map(alert => (
                    <div key={alert.band} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg text-green-400">{alert.band}</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          {alert.spotCount} {t('propagation.spots')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p>{t('propagation.maxDistance')}: <span className="text-white">{alert.maxDistance} km</span></p>
                        <p>{t('propagation.avgDistance')}: <span className="text-white">{alert.avgDistance} km</span></p>
                        <p>{t('propagation.regions')}: <span className="text-white">{alert.regions.slice(0, 3).join(', ')}</span></p>
                      </div>
                      {alert.recentSpots.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <p className="text-xs text-slate-500 mb-1">{t('propagation.recentSpots')}:</p>
                          {alert.recentSpots.slice(0, 2).map((spot: VhfSpot, idx: number) => (
                            <p key={idx} className="text-xs text-slate-400 truncate">
                              {spot.senderCallsign} → {spot.receiverCallsign} ({spot.distance} km)
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ES Alert Loading/Error */}
            {esLoading && !esAlerts.length && (
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('propagation.loadingEsAlerts')}
              </div>
            )}

            {/* VHF Bands (2m, 4m, 6m) */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">{t('propagation.vhfBands')} ({t('propagation.vhfEuropeNote')})</p>
              <button
                onClick={fetchEsAlerts}
                disabled={esLoading}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
                title={t('propagation.refreshEsAlerts')}
              >
                <Radio className={`w-3 h-3 ${esLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t('propagation.liveEs')}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              {allBands.filter(b => b.category === 'vhf').map((bandInfo) => {
                const result = bandInfo.getStatus();
                // Check if there's an active ES alert for this band
                const esAlert = esAlerts.find(a => a.band === bandInfo.band && a.active);
                const hasLiveEs = !!esAlert;

                return (
                  <div
                    key={bandInfo.band}
                    className={`rounded-lg p-3 border flex items-center justify-between ${hasLiveEs ? 'bg-green-500/20 border-green-500/50' : getColorClasses(result.color, result.open)}`}
                  >
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-lg">{bandInfo.band}</p>
                      <p className="text-sm text-slate-400">{bandInfo.label}</p>
                      {hasLiveEs && <Zap className="w-4 h-4 text-green-400" />}
                    </div>
                    <p className={`text-sm font-medium ${hasLiveEs ? 'text-green-400' : getTextColor(result.color)}`}>
                      {hasLiveEs ? `ES! ${esAlert.spotCount} QSOs` : result.status}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Upper HF Bands (10m - 17m) */}
            <p className="text-sm text-slate-400 mb-2">{t('propagation.upperHF')} ({t('propagation.sfiDependentDayBands')})</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {allBands.filter(b => b.category === 'upper').map((bandInfo) => {
                const result = bandInfo.getStatus();
                return (
                  <div
                    key={bandInfo.band}
                    className={`rounded-lg p-2 sm:p-3 text-center border ${getColorClasses(result.color, result.open)}`}
                  >
                    <p className="font-bold text-sm sm:text-base">{bandInfo.band}</p>
                    <p className="text-xs text-slate-400 hidden sm:block">{bandInfo.label}</p>
                    <p className={`text-xs sm:text-sm mt-1 ${getTextColor(result.color)}`}>
                      {result.status}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Middle HF Bands (20m - 30m) */}
            <p className="text-sm text-slate-400 mb-2">{t('propagation.middleHF')} ({t('propagation.allrounder')})</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {allBands.filter(b => b.category === 'middle').map((bandInfo) => {
                const result = bandInfo.getStatus();
                return (
                  <div
                    key={bandInfo.band}
                    className={`rounded-lg p-2 sm:p-3 text-center border ${getColorClasses(result.color, result.open)}`}
                  >
                    <p className="font-bold text-sm sm:text-base">{bandInfo.band}</p>
                    <p className="text-xs text-slate-400 hidden sm:block">{bandInfo.label}</p>
                    <p className={`text-xs sm:text-sm mt-1 ${getTextColor(result.color)}`}>
                      {result.status}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Lower HF Bands (40m - 160m) */}
            <p className="text-sm text-slate-400 mb-2">{t('propagation.lowerHF')} ({t('propagation.kSensitiveNightGreyline')})</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {allBands.filter(b => b.category === 'lower').map((bandInfo) => {
                const result = bandInfo.getStatus();
                return (
                  <div
                    key={bandInfo.band}
                    className={`rounded-lg p-2 sm:p-3 text-center border ${getColorClasses(result.color, result.open)}`}
                  >
                    <p className="font-bold text-sm sm:text-base">{bandInfo.band}</p>
                    <p className="text-xs text-slate-400 hidden sm:block">{bandInfo.label}</p>
                    <p className={`text-xs sm:text-sm mt-1 ${getTextColor(result.color)}`}>
                      {result.status}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="border-t border-slate-700 pt-3 mt-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span><span className="text-green-400">●</span> {t('propagation.legendOpenGood')}</span>
                <span><span className="text-yellow-400">●</span> {t('propagation.legendMarginalK')}</span>
                <span><span className="text-red-400">●</span> {t('propagation.legendDisturbed')}</span>
                <span><span className="text-slate-400">●</span> {t('propagation.legendClosed')}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {t('propagation.legendNote')}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t('propagation.legendNoteVhf')}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
