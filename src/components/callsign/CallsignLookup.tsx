import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, AlertTriangle, CheckCircle, XCircle, User, MapPin, Grid3X3, Loader2 } from 'lucide-react';
import { lookupCallsign } from '../../services/callsignService';
import type { CallsignLookupResult } from '../../types/callsign';

export default function CallsignLookup() {
  const { t } = useTranslation();
  const [callsign, setCallsign] = useState('');
  const [result, setResult] = useState<CallsignLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await lookupCallsign(callsign.trim());
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('callsignFinder.searchError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={callsign}
            onChange={(e) => setCallsign(e.target.value.toUpperCase())}
            placeholder={t('callsignFinder.lookupPlaceholderFull')}
            className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none font-mono text-lg"
            maxLength={10}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !callsign.trim()}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          {t('callsignFinder.lookupButton')}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 flex items-center gap-3">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Schwarzfunker Warning */}
          {result.isSchwartzfunker && (
            <div className="p-4 bg-amber-900/30 border border-amber-600 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-300 text-lg">{t('callsignFinder.possibleBlackOperator')}</h3>
                  <p className="text-amber-200/80 mt-1">
                    <span className="font-mono font-bold">{result.callsign}</span> {t('callsignFinder.blackOperatorDetailText', { source: result.source === 'qrz' ? 'QRZ.com' : 'HamQTH' })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Result Card */}
          <div className={`p-6 rounded-lg border ${
            result.found
              ? result.isOfficial
                ? 'bg-green-900/20 border-green-700'
                : 'bg-slate-800 border-slate-600'
              : 'bg-slate-800 border-slate-600'
          }`}>
            {/* Callsign Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-mono font-bold text-white">{result.callsign}</h2>
              <div className="flex items-center gap-2">
                {result.isOfficial ? (
                  <span className="px-3 py-1 bg-green-600/30 text-green-400 rounded-full text-sm flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    {t('callsignFinder.officiallyRegistered')}
                  </span>
                ) : result.found ? (
                  <span className="px-3 py-1 bg-slate-600/50 text-slate-300 rounded-full text-sm">
                    {t('callsignFinder.onlyIn')} {result.source === 'qrz' ? 'QRZ.com' : 'HamQTH'}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-slate-600/50 text-slate-400 rounded-full text-sm flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    {t('callsignFinder.notFoundAny')}
                  </span>
                )}
              </div>
            </div>

            {/* Not Found Message */}
            {!result.found && (
              <p className="text-slate-400">
                {t('callsignFinder.notFoundText')}
              </p>
            )}

            {/* Official Info */}
            {result.official && (
              <div className="space-y-3 mb-4">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">{t('callsignFinder.officialData')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-white font-medium">{result.official.name}</p>
                      <p className="text-slate-400 text-sm">{t('callsignFinder.name')}</p>
                    </div>
                  </div>
                  {result.official.qth && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white">{result.official.qth}</p>
                        <p className="text-slate-400 text-sm">{t('callsignFinder.qth')}</p>
                      </div>
                    </div>
                  )}
                  {result.official.licenseClass && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white">
                          {result.official.licenseClass === 1 ? t('callsignFinder.cept') : `Klasse ${result.official.licenseClass}`}
                        </p>
                        <p className="text-slate-400 text-sm">{t('callsignFinder.licenseClass')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QRZ Info */}
            {result.qrz && !result.isOfficial && (
              <div className="space-y-3 mb-4 pt-4 border-t border-slate-700">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">{t('callsignFinder.qrzData')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(result.qrz.fname || result.qrz.name) && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white">{[result.qrz.fname, result.qrz.name].filter(Boolean).join(' ')}</p>
                        <p className="text-slate-400 text-sm">{t('callsignFinder.name')}</p>
                      </div>
                    </div>
                  )}
                  {result.qrz.addr2 && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white">{result.qrz.addr2}</p>
                        <p className="text-slate-400 text-sm">{t('callsignFinder.qth')}</p>
                      </div>
                    </div>
                  )}
                  {result.qrz.grid && (
                    <div className="flex items-center gap-3">
                      <Grid3X3 className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white font-mono">{result.qrz.grid}</p>
                        <p className="text-slate-400 text-sm">{t('callsignFinder.locator')}</p>
                      </div>
                    </div>
                  )}
                  {result.qrz.country && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white">{result.qrz.country}</p>
                        <p className="text-slate-400 text-sm">{t('callsignFinder.country')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HamQTH Info */}
            {result.hamqth && !result.isOfficial && !result.qrz && (
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">{t('callsignFinder.hamqthData')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.hamqth.nick && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white">{result.hamqth.nick}</p>
                        <p className="text-slate-400 text-sm">{t('callsignFinder.name')}</p>
                      </div>
                    </div>
                  )}
                  {result.hamqth.qth && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white">{result.hamqth.qth}</p>
                        <p className="text-slate-400 text-sm">{t('callsignFinder.qth')}</p>
                      </div>
                    </div>
                  )}
                  {result.hamqth.grid && (
                    <div className="flex items-center gap-3">
                      <Grid3X3 className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white font-mono">{result.hamqth.grid}</p>
                        <p className="text-slate-400 text-sm">{t('callsignFinder.locator')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
