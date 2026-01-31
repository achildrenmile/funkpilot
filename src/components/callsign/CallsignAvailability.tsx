import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Check, X, Loader2, User } from 'lucide-react';
import { checkSuffixAvailability } from '../../services/callsignService';
import type { SuffixAvailabilityResult } from '../../types/callsign';

export default function CallsignAvailability() {
  const { t } = useTranslation();
  const [suffix, setSuffix] = useState('');
  const [result, setResult] = useState<SuffixAvailabilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSuffix = suffix.trim().toUpperCase();
    if (!cleanSuffix) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await checkSuffixAvailability(cleanSuffix);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('callsignFinder.searchError'));
    } finally {
      setIsLoading(false);
    }
  };

  const availableCount = result?.districts.filter(d => d.available).length || 0;

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg">OE_</span>
          <input
            type="text"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            placeholder={t('callsignFinder.availabilityPlaceholder')}
            className="w-full pl-14 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none font-mono text-lg"
            maxLength={4}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !suffix.trim()}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          {t('callsignFinder.availabilityButton')}
        </button>
      </form>

      {/* Info */}
      <p className="text-slate-400 text-sm">
        {t('callsignFinder.suffixInfo')}
      </p>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 flex items-center gap-3">
          <X className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div>
              <p className="text-slate-400 text-sm">{t('callsignFinder.suffix')}</p>
              <p className="text-2xl font-mono font-bold text-white">{result.suffix}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">{t('callsignFinder.availabilityStatus')}</p>
              <p className={`text-2xl font-bold ${availableCount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {availableCount} / 9 {t('callsignFinder.free')}
              </p>
            </div>
          </div>

          {/* District Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.districts.map((district) => (
              <div
                key={district.prefix}
                className={`p-4 rounded-lg border transition-colors ${
                  district.available
                    ? 'bg-green-900/20 border-green-700 hover:bg-green-900/30'
                    : 'bg-slate-800 border-slate-600'
                }`}
              >
                {/* Callsign */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-lg text-white">
                    {district.callsign}
                  </span>
                  {district.available ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <Check className="w-5 h-5" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400">
                      <X className="w-5 h-5" />
                    </span>
                  )}
                </div>

                {/* District Name */}
                <p className="text-slate-400 text-sm">{district.name}</p>

                {/* Holder or Available */}
                {district.available ? (
                  <p className="text-green-400 text-sm mt-2 font-medium">{t('callsignFinder.availabilityAvailable')}</p>
                ) : (
                  <div className="flex items-center gap-2 mt-2 text-slate-300 text-sm">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="truncate" title={district.holder}>
                      {district.holder || t('callsignFinder.availabilityTaken')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm text-slate-400 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>{t('callsignFinder.availabilityAvailable')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span>{t('callsignFinder.availabilityTaken')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
