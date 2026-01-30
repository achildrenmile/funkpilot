import { useState } from 'react';
import { Sparkles, Check, X, Loader2, ChevronDown } from 'lucide-react';
import { suggestCallsigns } from '../../services/callsignService';
import type { CallsignSuggestion } from '../../types/callsign';
import { AUSTRIAN_DISTRICTS } from '../../types/callsign';

export default function CallsignSuggest() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [district, setDistrict] = useState(8); // Default to Kärnten
  const [suggestions, setSuggestions] = useState<CallsignSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const data = await suggestCallsigns(firstName.trim(), lastName.trim(), district);
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Generierung');
    } finally {
      setIsLoading(false);
    }
  };

  const availableCount = suggestions.filter(s => s.available).length;

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Vorname
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="z.B. Max"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Nachname
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="z.B. Mustermann"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        {/* District Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Bundesland (Präfix)
          </label>
          <div className="relative">
            <select
              value={district}
              onChange={(e) => setDistrict(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none appearance-none cursor-pointer"
            >
              {AUSTRIAN_DISTRICTS.map((d, i) => (
                <option key={d.prefix} value={i + 1}>
                  {d.prefix} - {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !firstName.trim() || !lastName.trim()}
          className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          Vorschläge generieren
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 flex items-center gap-3">
          <X className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              Vorschläge für {firstName} {lastName}
            </h3>
            <span className={`text-sm ${availableCount > 0 ? 'text-green-400' : 'text-slate-400'}`}>
              {availableCount} von {suggestions.length} verfügbar
            </span>
          </div>

          {/* Suggestions List */}
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.callsign}
                className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${
                  suggestion.available
                    ? 'bg-green-900/20 border-green-700 hover:bg-green-900/30'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-sm text-slate-400">
                    {index + 1}
                  </span>

                  {/* Callsign */}
                  <div>
                    <span className="font-mono font-bold text-lg text-white">
                      {suggestion.callsign}
                    </span>
                    <p className="text-slate-400 text-sm">{suggestion.reason}</p>
                  </div>
                </div>

                {/* Availability Badge */}
                {suggestion.available ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/30 text-green-400 rounded-full text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Verfügbar
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-400 rounded-full text-sm">
                    <X className="w-4 h-4" />
                    Vergeben
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-400">
            <p className="font-medium text-slate-300 mb-2">Tipps zur Rufzeichenwahl:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Kurze Suffixe (2 Buchstaben) sind im Contest-Betrieb vorteilhaft</li>
              <li>Suffix mit X am Anfang sind traditionell für Klubstationen reserviert</li>
              <li>Ein gut merkbares Suffix basierend auf deinen Initialen ist empfehlenswert</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
