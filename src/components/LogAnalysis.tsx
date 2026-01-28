import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, BarChart3, Loader2, AlertCircle, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { parseADIF, calculateStats } from '../utils/adifParser';
import { analyzeContestLog } from '../services/claude';
import { checkHealth } from '../services/api';
import { CONTESTS } from '../types';
import type { UserSettings, LogStats } from '../types';

interface LogAnalysisProps {
  settings: UserSettings;
}

export default function LogAnalysis({ settings: _settings }: LogAnalysisProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [contestName, setContestName] = useState('CQWW DX');
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

  const processFile = async (file: File) => {
    setError(null);
    setAnalysis(null);

    try {
      const content = await file.text();
      const parsedQsos = parseADIF(content);

      if (parsedQsos.length === 0) {
        setError('Keine QSOs in der Datei gefunden. Ist das eine gültige ADIF-Datei?');
        return;
      }

      setStats(calculateStats(parsedQsos));
      setFileName(file.name);
    } catch (err) {
      console.error('Parse error:', err);
      setError('Fehler beim Lesen der Datei. Bitte stelle sicher, dass es eine gültige ADIF-Datei ist.');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.adi') || file.name.endsWith('.adif'))) {
      processFile(file);
    } else {
      setError('Bitte eine ADIF-Datei (.adi oder .adif) hochladen.');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const runAnalysis = async () => {
    if (!stats) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeContestLog(stats, contestName);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analyse fehlgeschlagen.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = () => {
    if (!analysis || !stats) return;

    const report = `# FunkPilot Log-Analyse Report

## Log: ${fileName}
## Contest: ${contestName}
## Erstellt: ${new Date().toLocaleString('de-AT')}

---

## Statistiken

- **Gesamt QSOs:** ${stats.totalQsos}
- **Unique Callsigns:** ${stats.uniqueCallsigns}
- **Duplikate:** ${stats.dupes}
- **Operating Time:** ${(stats.operatingTime / 60).toFixed(1)} Stunden
- **Durchschnittliche Rate:** ${stats.operatingTime > 0 ? (stats.totalQsos / (stats.operatingTime / 60)).toFixed(1) : 0} QSO/h
- **Länder:** ${stats.countries.length}
- **CQ-Zonen:** ${stats.cqZones.join(', ')}

### QSOs nach Band
${Object.entries(stats.qsosByBand).map(([band, count]) => `- ${band}: ${count}`).join('\n')}

### QSOs nach Mode
${Object.entries(stats.qsosByMode).map(([mode, count]) => `- ${mode}: ${count}`).join('\n')}

---

## KI-Analyse

${analysis}

---

*Generiert von FunkPilot - KI-Assistent für Funkamateure*
`;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log-analyse-${fileName?.replace(/\.(adi|adif)$/i, '')}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAnalysis = () => {
    setStats(null);
    setAnalysis(null);
    setFileName(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sky-400" />
          Log-Analyse
        </h2>
        <p className="text-slate-400 mt-1">
          Lade ein ADIF-Log hoch und erhalte KI-generierte Analyse und Verbesserungsvorschläge
        </p>
      </div>

      {/* File Upload Area */}
      {!stats && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-colors
            ${isDragging
              ? 'border-sky-500 bg-sky-500/10'
              : 'border-slate-600 hover:border-slate-500'
            }
          `}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-sky-400' : 'text-slate-500'}`} />
          <p className="text-lg font-medium mb-2">ADIF-Datei hochladen</p>
          <p className="text-slate-400 text-sm mb-4">
            Ziehe eine .adi oder .adif Datei hierher oder klicke zum Auswählen
          </p>
          <label className="inline-block">
            <input
              type="file"
              accept=".adi,.adif"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors">
              Datei auswählen
            </span>
          </label>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Display */}
      {stats && (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-sky-400" />
              <div>
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-slate-400">
                  {stats.totalQsos} QSOs | {stats.uniqueCallsigns} unique | {stats.countries.length} Länder
                </p>
              </div>
            </div>
            <button
              onClick={resetAnalysis}
              className="text-slate-400 hover:text-white text-sm"
            >
              Andere Datei laden
            </button>
          </div>

          {/* Contest Selection */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <label className="block text-sm text-slate-400 mb-2">Contest (für Analyse-Kontext)</label>
            <select
              value={contestName}
              onChange={(e) => setContestName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
            >
              {CONTESTS.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              <option value="General QSOs">Allgemeine QSOs</option>
            </select>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Gesamt QSOs</p>
              <p className="text-2xl font-bold text-sky-400">{stats.totalQsos}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Unique Calls</p>
              <p className="text-2xl font-bold text-green-400">{stats.uniqueCallsigns}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Operating Time</p>
              <p className="text-2xl font-bold text-amber-400">{(stats.operatingTime / 60).toFixed(1)}h</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Ø Rate</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.operatingTime > 0 ? (stats.totalQsos / (stats.operatingTime / 60)).toFixed(1) : 0}/h
              </p>
            </div>
          </div>

          {/* Band Distribution */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Band-Verteilung</h3>
            <div className="space-y-3">
              {Object.entries(stats.qsosByBand)
                .sort(([a], [b]) => {
                  const order = ['160m', '80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '2m'];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([band, count]) => {
                  const percentage = (count / stats.totalQsos) * 100;
                  return (
                    <div key={band}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{band}</span>
                        <span className="text-slate-400">{count} QSOs ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Rate Chart */}
          {stats.ratePerHour.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">QSO-Rate über Zeit</h3>
              <div className="h-40 flex items-end gap-1">
                {stats.ratePerHour.map((rate, i) => {
                  const maxRate = Math.max(...stats.ratePerHour);
                  const height = maxRate > 0 ? (rate / maxRate) * 100 : 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-sky-500/80 hover:bg-sky-400 rounded-t transition-colors cursor-pointer group relative"
                      style={{ height: `${height}%`, minHeight: rate > 0 ? '4px' : '0' }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Stunde {i + 1}: {rate} QSO
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Start</span>
                <span>Ende ({stats.ratePerHour.length}h)</span>
              </div>
            </div>
          )}

          {/* Zones & Countries */}
          <div className="grid md:grid-cols-2 gap-4">
            {stats.cqZones.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-3">CQ-Zonen ({stats.cqZones.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.cqZones.map(zone => (
                    <span key={zone} className="bg-slate-700 px-2 py-1 rounded text-sm">
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {stats.countries.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-3">Länder ({stats.countries.length})</h3>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {stats.countries.slice(0, 20).map(country => (
                    <span key={country} className="bg-slate-700 px-2 py-1 rounded text-sm">
                      {country}
                    </span>
                  ))}
                  {stats.countries.length > 20 && (
                    <span className="text-slate-400 text-sm">+{stats.countries.length - 20} weitere</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Analysis Section */}
          {!analysis ? (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
              {apiAvailable === false ? (
                <div className="space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-amber-200">KI-Backend nicht verfügbar</p>
                  <p className="text-slate-400 text-sm">
                    Starte den Server mit API-Keys für die KI-Analyse.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-400">
                    Klicke auf "Analysieren" für eine detaillierte KI-Auswertung mit Verbesserungsvorschlägen.
                  </p>
                  <button
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analysiere...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-5 h-5" />
                        Mit KI analysieren
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">KI-Analyse</h3>
                <div className="flex gap-2">
                  <button
                    onClick={downloadReport}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Report speichern
                  </button>
                  <button
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    Neu analysieren
                  </button>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
