import { X, Sparkles, Zap, Wrench } from 'lucide-react';
import { useEffect } from 'react';
import { CHANGELOG, markChangelogSeen, LATEST_VERSION } from '../data/changelog';

interface ChangelogModalProps {
  onClose: () => void;
}

export function ChangelogModal({ onClose }: ChangelogModalProps) {
  useEffect(() => {
    // Mark as seen when modal opens
    markChangelogSeen(LATEST_VERSION);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getChangeIcon = (type: 'feature' | 'improvement' | 'fix') => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-3.5 h-3.5 text-green-400" />;
      case 'improvement':
        return <Zap className="w-3.5 h-3.5 text-sky-400" />;
      case 'fix':
        return <Wrench className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getChangeLabel = (type: 'feature' | 'improvement' | 'fix') => {
    switch (type) {
      case 'feature':
        return 'Neu';
      case 'improvement':
        return 'Verbessert';
      case 'fix':
        return 'Behoben';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-800 rounded-xl max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-sky-900/50 to-purple-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Was ist neu?</h2>
              <p className="text-sm text-slate-400">Aktuelle Updates und neue Features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="space-y-6">
            {CHANGELOG.map((entry, idx) => (
              <div
                key={entry.version}
                className={`relative ${idx === 0 ? '' : 'pt-6 border-t border-slate-700'}`}
              >
                {/* Version badge */}
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${
                    idx === 0
                      ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    v{entry.version}
                  </span>
                  <span className="text-sm text-slate-500">{entry.date}</span>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                      Aktuell
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-slate-100 mb-3">
                  {entry.title}
                </h3>

                {/* Changes */}
                <ul className="space-y-2">
                  {entry.changes.map((change, changeIdx) => (
                    <li key={changeIdx} className="flex items-start gap-2">
                      <span className="flex items-center gap-1.5 mt-0.5 min-w-[80px]">
                        {getChangeIcon(change.type)}
                        <span className={`text-xs font-medium ${
                          change.type === 'feature' ? 'text-green-400' :
                          change.type === 'improvement' ? 'text-sky-400' :
                          'text-amber-400'
                        }`}>
                          {getChangeLabel(change.type)}
                        </span>
                      </span>
                      <span className="text-slate-300 text-sm">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-sm text-slate-500 text-center">
            Feedback? <a href="mailto:oe8yml@rednil.at" className="text-sky-400 hover:underline">oe8yml@rednil.at</a> · 73 de OE8YML
          </p>
        </div>
      </div>
    </div>
  );
}
