import { useState, useEffect } from 'react';
import { Mic, MessageCircle, BarChart3, Globe, Settings } from 'lucide-react';
import VoiceCQ from './components/VoiceCQ';
import QSOChat from './components/QSOChat';
import LogAnalysis from './components/LogAnalysis';
import Propagation from './components/Propagation';
import SettingsPanel from './components/Settings';
import { getUserSettings, saveUserSettings } from './utils/storage';
import { getSolarData } from './services/solar';
import type { TabId, UserSettings, SolarData } from './types';

const TABS = [
  { id: 'voice' as TabId, name: 'Voice CQ', icon: Mic },
  { id: 'chat' as TabId, name: 'QSO-Chat', icon: MessageCircle },
  { id: 'log' as TabId, name: 'Log-Analyse', icon: BarChart3 },
  { id: 'propagation' as TabId, name: 'Propagation', icon: Globe },
  { id: 'settings' as TabId, name: 'Einstellungen', icon: Settings },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('voice');
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [isLoadingSolar, setIsLoadingSolar] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const stored = getUserSettings();
    setSettings(stored);
  }, []);

  // Fetch solar data on mount and periodically
  useEffect(() => {
    const fetchSolar = async () => {
      setIsLoadingSolar(true);
      try {
        const data = await getSolarData();
        setSolarData(data);
      } catch (error) {
        console.error('Failed to fetch solar data:', error);
      } finally {
        setIsLoadingSolar(false);
      }
    };

    fetchSolar();
    const interval = setInterval(fetchSolar, 15 * 60 * 1000); // Every 15 minutes
    return () => clearInterval(interval);
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveUserSettings(updated);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'voice':
        return <VoiceCQ settings={settings} />;
      case 'chat':
        return <QSOChat settings={settings} solarData={solarData} />;
      case 'log':
        return <LogAnalysis settings={settings} />;
      case 'propagation':
        return (
          <Propagation
            settings={settings}
            solarData={solarData}
            isLoading={isLoadingSolar}
          />
        );
      case 'settings':
        return <SettingsPanel settings={settings} onUpdate={updateSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 18.5V22M8 22h8M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round"/>
                  <path d="M4 10c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" opacity="0.6"/>
                  <rect x="9" y="10" width="6" height="8" rx="1"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FunkPilot</h1>
                <p className="text-xs text-slate-400">KI-Assistent für Funkamateure</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Solar Conditions Badge */}
              {solarData && (
                <div className="hidden sm:flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg text-sm">
                  <span className="text-slate-400">SFI:</span>
                  <span className={solarData.sfi > 120 ? 'text-green-400' : solarData.sfi > 80 ? 'text-yellow-400' : 'text-red-400'}>
                    {solarData.sfi}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">K:</span>
                  <span className={solarData.kIndex <= 2 ? 'text-green-400' : solarData.kIndex <= 4 ? 'text-yellow-400' : 'text-red-400'}>
                    {solarData.kIndex}
                  </span>
                </div>
              )}

              {/* User Callsign */}
              {settings.callsign && (
                <div className="bg-sky-600/20 text-sky-400 px-3 py-1.5 rounded-lg font-mono text-sm">
                  {settings.callsign}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium
                    transition-colors whitespace-nowrap
                    ${isActive
                      ? 'text-sky-400 border-b-2 border-sky-400 bg-slate-700/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/30 border-t border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>FunkPilot v1.0 - Open Source</span>
            <span>73 de OE8YML</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
