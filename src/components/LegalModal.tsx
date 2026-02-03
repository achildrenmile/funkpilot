import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LegalModalProps {
  type: 'imprint' | 'privacy';
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
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
          <h2 className="text-xl font-semibold text-slate-100">
            {type === 'imprint' ? t('imprint.title') : t('privacy.title')}
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
          {type === 'imprint' ? <ImprintContent /> : <PrivacyContent />}
        </div>
      </div>
    </div>
  );
}

function ImprintContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-slate-300">
      <p className="text-sm text-slate-400">
        {t('imprint.legalNotice')}
      </p>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('imprint.operator')}
        </h3>
        <div className="space-y-1">
          <p className="font-medium">Michael Linder</p>
          <p>{t('imprint.callsignLabel')}: OE8YML</p>
          <p>Nötsch 219, 9611 Nötsch</p>
          <p>Österreich</p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('imprint.contact')}
        </h3>
        <a
          href="mailto:oe8yml@rednil.at"
          className="text-sky-400 hover:underline"
        >
          oe8yml@rednil.at
        </a>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('imprint.liability')}
        </h3>
        <p>{t('imprint.liabilityText')}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('imprint.copyright')}
        </h3>
        <p>{t('imprint.copyrightText')}</p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-slate-300">
      <p>{t('privacy.intro')}</p>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('privacy.controller')}
        </h3>
        <p className="mb-2">{t('privacy.controllerIntro')}</p>
        <div className="space-y-1 ml-2">
          <p>Michael Linder (OE8YML)</p>
          <p>Nötsch 219, 9611 Nötsch, Österreich</p>
          <p>E-Mail: <a href="mailto:oe8yml@rednil.at" className="text-sky-400 hover:underline">oe8yml@rednil.at</a></p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('privacy.noDataCollection')}
        </h3>
        <p className="mb-2">{t('privacy.noDataCollectionIntro')}</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>{t('privacy.noDataFeature1')}</li>
          <li>{t('privacy.noDataFeature2')}</li>
          <li>{t('privacy.noDataFeature3')}</li>
          <li>{t('privacy.noDataFeature4')}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('privacy.localStorage')}
        </h3>
        <p>{t('privacy.localStorageText')}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('privacy.aiActTitle')}
        </h3>
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 mb-4">
          <p className="font-medium text-amber-200 mb-2">
            {t('privacy.aiTransparency')}
          </p>
          <p className="text-sm mb-3">
            {t('privacy.aiTransparencyText')}
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>{t('privacy.aiLimitation1')}</li>
            <li>{t('privacy.aiLimitation2')}</li>
            <li>{t('privacy.aiLimitation3')}</li>
            <li>{t('privacy.aiLimitation4')}</li>
          </ul>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          {t('privacy.aiClassification')}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('privacy.aiServices')}
        </h3>
        <p className="mb-2">{t('privacy.aiServicesIntro')}</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>{t('privacy.aiServicesFeature1')}</li>
          <li>{t('privacy.aiServicesFeature2')}</li>
          <li>{t('privacy.aiServicesFeature3')}</li>
          <li>{t('privacy.aiServicesFeature4')}</li>
        </ul>

        <div className="mt-4 space-y-3">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="font-medium text-slate-200">{t('privacy.groqProvider')}</p>
            <p className="text-sm text-slate-400 mt-1">
              {t('privacy.groqProviderText')}
              <br />
              <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">groq.com/privacy-policy</a>
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="font-medium text-slate-200">{t('privacy.anthropicProvider')}</p>
            <p className="text-sm text-slate-400 mt-1">
              {t('privacy.anthropicProviderText')}
              <br />
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">anthropic.com/privacy</a>
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="font-medium text-slate-200">{t('privacy.openRouterProvider')}</p>
            <p className="text-sm text-slate-400 mt-1">
              {t('privacy.openRouterProviderText')}
              <br />
              <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">openrouter.ai/privacy</a>
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="font-medium text-slate-200">{t('privacy.tavilyProvider')}</p>
            <p className="text-sm text-slate-400 mt-1">
              {t('privacy.tavilyProviderText')}
              <br />
              <a href="https://tavily.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">tavily.com/privacy</a>
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-400">
          {t('privacy.dataTransfer')}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('privacy.cloudflare')}
        </h3>
        <p>
          {t('privacy.cloudflareText')}{' '}
          <a href="https://www.cloudflare.com/de-de/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">cloudflare.com/privacypolicy</a>
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('privacy.wokwi')}
        </h3>
        <p className="mb-2">{t('privacy.wokwiIntro')}</p>
        <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
          <li>{t('privacy.wokwiFeature1')}</li>
          <li>{t('privacy.wokwiFeature2')}</li>
          <li>{t('privacy.wokwiFeature3')}</li>
          <li>{t('privacy.wokwiFeature4')}</li>
        </ul>
        <p className="mt-2 text-sm">
          {t('privacy.wokwiOperator')}
          <a href="https://wokwi.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline ml-1">wokwi.com/privacy</a>
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('privacy.yourRights')}
        </h3>
        <p className="mb-2">{t('privacy.yourRightsIntro')}</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>{t('privacy.rightAccess')}</li>
          <li>{t('privacy.rightRectification')}</li>
          <li>{t('privacy.rightErasure')}</li>
          <li>{t('privacy.rightRestriction')}</li>
          <li>{t('privacy.rightPortability')}</li>
          <li>{t('privacy.rightObjection')}</li>
        </ul>
        <p className="mt-2">{t('privacy.rightsNote')}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('privacy.complaint')}
        </h3>
        <p>
          {t('privacy.complaintText')}
          <a href="mailto:dsb@dsb.gv.at" className="text-sky-400 hover:underline ml-1">dsb@dsb.gv.at</a>
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {t('privacy.contactTitle')}
        </h3>
        <p className="mb-2">{t('privacy.contactIntro')}</p>
        <a
          href="mailto:oe8yml@rednil.at"
          className="text-sky-400 hover:underline"
        >
          oe8yml@rednil.at
        </a>
      </section>

      <p className="text-sm text-slate-400 pt-4 border-t border-slate-700">
        {t('privacy.lastUpdate')}
      </p>
    </div>
  );
}
