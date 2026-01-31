import { useState } from 'react';
import { Cable, ExternalLink, Copy, Check, X, AlertTriangle } from 'lucide-react';
import type { WiringConnection } from '../../types/projects';

interface WiringTableProps {
  wiring: WiringConnection[];
  wokwiUrl?: string;
  code?: string;
  hardware?: string;
}

// Color mapping for wire colors
const WIRE_COLORS: Record<string, string> = {
  rot: 'bg-red-500',
  red: 'bg-red-500',
  schwarz: 'bg-gray-800',
  black: 'bg-gray-800',
  blau: 'bg-blue-500',
  blue: 'bg-blue-500',
  grün: 'bg-green-500',
  green: 'bg-green-500',
  gelb: 'bg-yellow-400',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  weiß: 'bg-white',
  white: 'bg-white',
  braun: 'bg-amber-700',
  brown: 'bg-amber-700',
  lila: 'bg-purple-500',
  purple: 'bg-purple-500',
  grau: 'bg-gray-400',
  gray: 'bg-gray-400',
};

// Map hardware to Wokwi template URLs
const WOKWI_TEMPLATES: Record<string, string> = {
  'Arduino Nano': 'https://wokwi.com/projects/new/arduino-nano',
  'Arduino Uno': 'https://wokwi.com/projects/new/arduino-uno',
  'ESP32': 'https://wokwi.com/projects/new/esp32',
  'ESP8266': 'https://wokwi.com/projects/new/esp32', // Wokwi uses ESP32 for both
};

export function WiringTable({ wiring, wokwiUrl, code, hardware }: WiringTableProps) {
  const [showWokwiModal, setShowWokwiModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!wiring || wiring.length === 0) {
    return null;
  }

  const handleCopyCode = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWokwiUrl = () => {
    if (wokwiUrl) return wokwiUrl;
    if (hardware && WOKWI_TEMPLATES[hardware]) return WOKWI_TEMPLATES[hardware];
    return 'https://wokwi.com/projects/new/arduino-nano';
  };

  return (
    <>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-b border-slate-700">
          <h3 className="font-semibold text-slate-100 flex items-center gap-2">
            <Cable className="w-4 h-4 text-sky-400" />
            Verdrahtung
          </h3>
          {code && (
            <button
              onClick={() => setShowWokwiModal(true)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-purple-600 hover:bg-purple-500 rounded transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Im Simulator testen
            </button>
          )}
        </div>

        {/* Wiring Table */}
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-2 pr-4">Von</th>
                  <th className="pb-2 pr-4">Nach</th>
                  <th className="pb-2 pr-4">Kabel</th>
                  <th className="pb-2">Hinweis</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {wiring.map((conn, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">
                      {conn.from}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">
                      {conn.to}
                    </td>
                    <td className="py-2 pr-4">
                      {conn.color ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-2 rounded-full ${WIRE_COLORS[conn.color.toLowerCase()] || 'bg-slate-500'}`}
                          />
                          <span className="text-xs text-slate-400">{conn.color}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-2 text-xs text-slate-400">
                      {conn.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              VCC = 5V/3.3V Versorgung | GND = Masse | Die Kabelfarben sind Empfehlungen
            </p>
          </div>
        </div>
      </div>

      {/* Wokwi Modal */}
      {showWokwiModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowWokwiModal(false)}
        >
          <div className="bg-slate-800 rounded-xl max-w-lg w-full shadow-xl border border-slate-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-purple-400" />
                Wokwi Simulator
              </h2>
              <button
                onClick={() => setShowWokwiModal(false)}
                className="p-1 rounded hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Privacy Notice */}
              <div className="flex items-start gap-3 bg-amber-900/30 border border-amber-700/50 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-200 font-medium">Externer Dienst</p>
                  <p className="text-amber-200/80 mt-1">
                    Wokwi.com ist eine externe Website. Mit Klick auf "Simulator öffnen"
                    verlässt du FunkPilot. Mehr Infos in unserer Datenschutzerklärung.
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <p className="text-slate-300 font-medium">So geht's:</p>
                <ol className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span>Klicke auf "Code kopieren" unten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span>Klicke auf "Simulator öffnen" - Wokwi öffnet sich</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span>Lösche den Beispielcode im Editor (Strg+A, Entf)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">4</span>
                    <span>Füge den kopierten Code ein (Strg+V)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">5</span>
                    <span>Klicke auf den grünen "Play" Button zum Starten</span>
                  </li>
                </ol>
                <p className="text-xs text-slate-500 mt-2">
                  Hinweis: Die Verdrahtung muss im Simulator manuell erstellt werden.
                  Nutze die Tabelle oben als Referenz.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-700/30">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Code kopieren</span>
                  </>
                )}
              </button>
              <a
                href={getWokwiUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Simulator öffnen
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
