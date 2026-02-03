import { X, Mic, MessageSquare, FileText, Radio, Search, Settings, HelpCircle, Wrench } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-800 rounded-xl max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-sky-400" />
            {t('help.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6 text-slate-300">
            <p>{t('help.intro')}</p>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Mic className="w-5 h-5 text-sky-400" />
                {t('help.voiceCQTitle')}
              </h3>
              <p className="mb-2">{t('help.voiceCQDesc')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>{t('help.voiceCQFeature1')}</li>
                <li>{t('help.voiceCQFeature2')}</li>
                <li>{t('help.voiceCQFeature3')}</li>
                <li>{t('help.voiceCQFeature4')}</li>
              </ul>
            </section>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" />
                {t('help.qsoChatTitle')}
              </h3>
              <p className="mb-2">{t('help.qsoChatDesc')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>{t('help.qsoChatFeature1')}</li>
                <li>{t('help.qsoChatFeature2')}</li>
                <li>{t('help.qsoChatFeature3')}</li>
                <li>{t('help.qsoChatFeature4')}</li>
              </ul>
              <div className="mt-3 p-2 bg-amber-900/30 border border-amber-700/50 rounded">
                <h4 className="text-sm font-medium text-amber-200 flex items-center gap-1">
                  <Wrench className="w-4 h-4" />
                  {t('help.hamRadioTools')}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {t('help.hamRadioToolsDesc')}
                </p>
              </div>
              <div className="mt-3 p-2 bg-sky-900/30 border border-sky-700/50 rounded">
                <h4 className="text-sm font-medium text-sky-200 flex items-center gap-1">
                  <Search className="w-4 h-4" />
                  {t('help.webSearch')}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {t('help.webSearchDesc')}
                </p>
              </div>
              <div className="mt-3 p-2 bg-purple-900/30 border border-purple-700/50 rounded">
                <h4 className="text-sm font-medium text-purple-200">
                  {t('help.transparentProcessing')}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {t('help.transparentProcessingDesc')}
                </p>
              </div>
            </section>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                {t('help.logAnalysisTitle')}
              </h3>
              <p className="mb-2">{t('help.logAnalysisDesc')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>{t('help.logAnalysisFeature1')}</li>
                <li>{t('help.logAnalysisFeature2')}</li>
                <li>{t('help.logAnalysisFeature3')}</li>
                <li>{t('help.logAnalysisFeature4')}</li>
              </ul>
            </section>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Radio className="w-5 h-5 text-sky-400" />
                {t('help.propagationTitle')}
              </h3>
              <p className="mb-2">{t('help.propagationDesc')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>{t('help.propagationFeature1')}</li>
                <li>{t('help.propagationFeature2')}</li>
                <li>{t('help.propagationFeature3')}</li>
                <li>{t('help.propagationFeature4')}</li>
              </ul>
            </section>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-400" />
                {t('help.callsignFinderTitle')}
              </h3>
              <p className="mb-2">{t('help.callsignFinderDesc')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>{t('help.callsignFinderFeature1')}</li>
                <li>{t('help.callsignFinderFeature2')}</li>
                <li>{t('help.callsignFinderFeature3')}</li>
                <li>{t('help.callsignFinderFeature4')}</li>
                <li>{t('help.callsignFinderFeature5')}</li>
              </ul>
            </section>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-400" />
                {t('help.settingsTitle')}
              </h3>
              <p className="mb-2">{t('help.settingsDesc')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>{t('help.settingsFeature1')}</li>
                <li>{t('help.settingsFeature2')}</li>
                <li>{t('help.settingsFeature3')}</li>
                <li>{t('help.settingsFeature4')}</li>
                <li>{t('help.settingsFeature5')}</li>
              </ul>
            </section>

            <section className="border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                {t('help.keyboardShortcuts')}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('help.showHelp')}</span>
                  <kbd className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">?</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('help.closeModal')}</span>
                  <kbd className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">Esc</kbd>
                </div>
              </div>
            </section>

            <p className="text-sm text-slate-400 pt-2">
              {t('help.feedbackContact')} <a href="mailto:oe8yml@rednil.at" className="text-sky-400 hover:underline">oe8yml@rednil.at</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
