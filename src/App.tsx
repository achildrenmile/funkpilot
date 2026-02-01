import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MessageCircle, BarChart3, Globe, Radio, Settings, HelpCircle, Github, Wrench } from 'lucide-react';
import VoiceCQ from './components/VoiceCQ';
import QSOChat from './components/QSOChat';
import LogAnalysis from './components/LogAnalysis';
import Propagation from './components/Propagation';
import CallsignFinder from './components/CallsignFinder';
import ProjectsTab from './components/projects/ProjectsTab';
import SettingsPanel from './components/Settings';
import { LegalModal } from './components/LegalModal';
import { HelpModal } from './components/HelpModal';
import { ChangelogModal } from './components/ChangelogModal';
import { ParentSiteLogo } from './components/ParentSiteLogo';
import { LanguageSelector } from './components/LanguageSelector';
import { hasSeenChangelog, LATEST_VERSION } from './data/changelog';
import { useConfig } from './hooks/useConfig';
import { useVersionCheck } from './hooks/useVersionCheck';
import { getUserSettings, saveUserSettings } from './utils/storage';
import { getSolarData } from './services/solar';
import type { TabId, UserSettings, SolarData } from './types';

// Map tab IDs to URL-friendly names
const TAB_ROUTES: Record<TabId, string> = {
  voice: 'voice',
  chat: 'chat',
  log: 'log',
  propagation: 'propagation',
  rufzeichen: 'callsign',
  projects: 'projects',
  settings: 'settings',
};

const ROUTE_TO_TAB: Record<string, TabId> = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([k, v]) => [v, k as TabId])
) as Record<string, TabId>;

// Parse hash route: #/tab or #/projects/project-id
function parseHash(): { tab: TabId; projectId?: string } {
  const hash = window.location.hash.slice(1); // Remove #
  if (!hash || hash === '/') return { tab: 'voice' };

  const parts = hash.split('/').filter(Boolean);
  const tabRoute = parts[0];
  const tab = ROUTE_TO_TAB[tabRoute] || 'voice';

  // Check for project deep link
  if (tab === 'projects' && parts[1]) {
    return { tab, projectId: parts[1] };
  }

  return { tab };
}

function App() {
  const { t } = useTranslation();

  // Initialize from URL hash
  const initialRoute = parseHash();
  const [activeTab, setActiveTab] = useState<TabId>(initialRoute.tab);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(initialRoute.projectId);

  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [isLoadingSolar, setIsLoadingSolar] = useState(true);
  const [legalModal, setLegalModal] = useState<'imprint' | 'privacy' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [hasNewChanges, setHasNewChanges] = useState(!hasSeenChangelog(LATEST_VERSION));
  const { config } = useConfig();

  // Update URL hash when navigation changes
  const updateHash = useCallback((tab: TabId, projectId?: string) => {
    const route = TAB_ROUTES[tab];
    const hash = projectId ? `#/${route}/${projectId}` : `#/${route}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
    }
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setSelectedProjectId(undefined);
    updateHash(tab);
  }, [updateHash]);

  // Handle project selection (called from ProjectsTab)
  const handleProjectChange = useCallback((projectId: string | undefined) => {
    setSelectedProjectId(projectId);
    updateHash('projects', projectId);
  }, [updateHash]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const route = parseHash();
      setActiveTab(route.tab);
      setSelectedProjectId(route.projectId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Set initial hash if none
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', `#/${TAB_ROUTES[activeTab]}`);
    }
  }, []);

  const TABS = [
    { id: 'voice' as TabId, nameKey: 'nav.voiceCQ', icon: Mic },
    { id: 'chat' as TabId, nameKey: 'nav.qsoChat', icon: MessageCircle },
    { id: 'log' as TabId, nameKey: 'nav.logAnalysis', icon: BarChart3 },
    { id: 'propagation' as TabId, nameKey: 'nav.propagation', icon: Globe },
    { id: 'rufzeichen' as TabId, nameKey: 'nav.callsign', icon: Radio },
    { id: 'projects' as TabId, nameKey: 'nav.projects', icon: Wrench },
    { id: 'settings' as TabId, nameKey: 'nav.settings', icon: Settings },
  ];

  // Auto-reload on new version deployment
  useVersionCheck();

  // Keyboard shortcut for help
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowHelp(true);
        }
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Load settings on mount
  useEffect(() => {
    const stored = getUserSettings();
    setSettings(stored);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('theme-light');
    if (settings.theme === 'light') {
      document.documentElement.classList.add('theme-light');
    }
  }, [settings.theme]);

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
      case 'rufzeichen':
        return <CallsignFinder />;
      case 'projects':
        return (
          <ProjectsTab
            initialProjectId={selectedProjectId}
            onProjectChange={handleProjectChange}
          />
        );
      case 'settings':
        return <SettingsPanel settings={settings} onUpdate={updateSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* Parent Site Logo */}
              <ParentSiteLogo />

              {/* App Branding */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-500 to-sky-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 18.5V22M8 22h8M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round"/>
                    <path d="M4 10c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" opacity="0.6"/>
                    <rect x="9" y="10" width="6" height="8" rx="1"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-white truncate">{t('common.appName')}</h1>
                  <p className="text-xs text-slate-400 hidden sm:block">{t('common.appTagline')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {/* Language Selector */}
              <LanguageSelector />

              {/* AI Badge - EU AI Act Art. 50 compliance */}
              <div
                className="hidden md:flex items-center gap-1.5 bg-amber-600/20 text-amber-400 px-2.5 py-1 rounded-md text-xs cursor-pointer hover:bg-amber-600/30 transition-colors"
                onClick={() => setLegalModal('privacy')}
                title={t('common.aiSystemTitle')}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{t('common.aiSystem')}</span>
              </div>

              {/* Solar Conditions Badge - Compact on mobile */}
              {solarData && (
                <div className="flex items-center gap-1 sm:gap-2 bg-slate-700/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                  <span className="text-slate-400 hidden sm:inline">SFI:</span>
                  <span className={solarData.sfi > 120 ? 'text-green-400' : solarData.sfi > 80 ? 'text-yellow-400' : 'text-red-400'}>
                    {solarData.sfi}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400 hidden sm:inline">K:</span>
                  <span className={solarData.kIndex <= 2 ? 'text-green-400' : solarData.kIndex <= 4 ? 'text-yellow-400' : 'text-red-400'}>
                    {solarData.kIndex}
                  </span>
                </div>
              )}

              {/* User Callsign */}
              {settings.callsign && (
                <div className="bg-sky-600/20 text-sky-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-mono text-xs sm:text-sm">
                  {settings.callsign}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="flex-shrink-0 bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex justify-between sm:justify-start sm:gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium
                    transition-colors whitespace-nowrap flex-1 sm:flex-none
                    ${isActive
                      ? 'text-sky-400 border-b-2 border-sky-400 bg-slate-700/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'
                    }
                  `}
                  title={t(tab.nameKey)}
                >
                  <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t(tab.nameKey)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 w-full">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 py-2 sm:py-4 border-t border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-500">
            <span className="hidden sm:inline">FunkPilot v{LATEST_VERSION} - 73 de OE8YML</span>
            <span className="sm:hidden">73 de OE8YML</span>
            {config.parentSiteUrl && config.parentSiteName && (
              <>
                <span className="hidden sm:inline">|</span>
                <a
                  href={config.parentSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  {config.parentSiteName}
                </a>
              </>
            )}
            <span>|</span>
            <button
              onClick={() => setLegalModal('imprint')}
              className="text-sky-400 hover:underline"
            >
              {t('footer.imprint')}
            </button>
            <span>|</span>
            <button
              onClick={() => setLegalModal('privacy')}
              className="text-sky-400 hover:underline"
            >
              <span className="hidden sm:inline">{t('footer.privacyAI')}</span>
              <span className="sm:hidden">{t('footer.privacy')}</span>
            </button>
            <span>|</span>
            <button
              onClick={() => {
                setShowChangelog(true);
                setHasNewChanges(false);
              }}
              className="text-sky-400 hover:underline flex items-center gap-1 relative"
            >
              <span className="hidden sm:inline">{t('footer.whatsNew')}</span>
              <span className="sm:hidden">{t('footer.new')}</span>
              {hasNewChanges && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>
            <span>|</span>
            <button
              onClick={() => setShowHelp(true)}
              className="text-sky-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('footer.help')}</span>
            </button>
            <span>|</span>
            <a
              href="https://github.com/achildrenmile/funkpilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1"
              title="GitHub Repository"
            >
              <Github className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      {legalModal && (
        <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
      )}

      {/* Help Modal */}
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}

      {/* Changelog Modal */}
      {showChangelog && (
        <ChangelogModal onClose={() => setShowChangelog(false)} />
      )}
    </div>
  );
}

export default App;
