import { Cable, ExternalLink } from 'lucide-react';
import type { WiringConnection } from '../../types/projects';

interface WiringTableProps {
  wiring: WiringConnection[];
  wokwiUrl?: string;
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

export function WiringTable({ wiring, wokwiUrl }: WiringTableProps) {
  if (!wiring || wiring.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-b border-slate-700">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <Cable className="w-4 h-4 text-sky-400" />
          Verdrahtung
        </h3>
        {wokwiUrl && (
          <a
            href={wokwiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-purple-600 hover:bg-purple-500 rounded transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Im Simulator öffnen
          </a>
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
  );
}
