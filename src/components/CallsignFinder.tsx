import { useState } from 'react';
import { Search, Grid3X3, Sparkles } from 'lucide-react';
import CallsignLookup from './callsign/CallsignLookup';
import CallsignAvailability from './callsign/CallsignAvailability';
import CallsignSuggest from './callsign/CallsignSuggest';
import type { CallsignSubTab } from '../types/callsign';

const SUB_TABS: Array<{ id: CallsignSubTab; name: string; icon: typeof Search; description: string }> = [
  { id: 'lookup', name: 'Suche', icon: Search, description: 'Rufzeichen nachschlagen' },
  { id: 'available', name: 'Verfügbarkeit', icon: Grid3X3, description: 'Suffix in allen Bundesländern prüfen' },
  { id: 'suggest', name: 'Vorschläge', icon: Sparkles, description: 'Rufzeichen basierend auf Namen generieren' },
];

export default function CallsignFinder() {
  const [activeSubTab, setActiveSubTab] = useState<CallsignSubTab>('lookup');

  const renderContent = () => {
    switch (activeSubTab) {
      case 'lookup':
        return <CallsignLookup />;
      case 'available':
        return <CallsignAvailability />;
      case 'suggest':
        return <CallsignSuggest />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Rufzeichen-Finder</h2>
        <p className="text-slate-400 mt-1">
          Österreichische Rufzeichen suchen, Verfügbarkeit prüfen und Vorschläge generieren
        </p>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors
                ${isActive
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                }
              `}
              title={tab.description}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
        {renderContent()}
      </div>

      {/* Info Footer */}
      <div className="text-sm text-slate-500 flex items-center gap-2">
        <span>Datenquelle:</span>
        <a
          href="https://github.com/achildrenmile/oeradio-mcp"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:underline"
        >
          OE Radio MCP
        </a>
        <span className="text-slate-600">|</span>
        <span>QRZ.com</span>
        <span className="text-slate-600">|</span>
        <span>HamQTH</span>
      </div>
    </div>
  );
}
