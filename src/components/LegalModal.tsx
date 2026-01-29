import { X } from 'lucide-react';
import { useEffect } from 'react';

interface LegalModalProps {
  type: 'imprint' | 'privacy';
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
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
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">
            {type === 'imprint' ? 'Impressum' : 'Datenschutzerklärung'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            aria-label="Schließen"
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
  return (
    <div className="space-y-6 text-slate-300">
      <p className="text-sm text-slate-400">
        Angaben gemäß § 5 TMG und § 25 MedienG (Österreich)
      </p>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Betreiber
        </h3>
        <div className="space-y-1">
          <p className="font-medium">Michael Ernemann</p>
          <p>Amateurfunkrufzeichen: OE8YML</p>
          <p>Spittal an der Drau</p>
          <p>Österreich</p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Kontakt
        </h3>
        <a
          href="mailto:oe8yml@oevsv.at"
          className="text-sky-400 hover:underline"
        >
          oe8yml@oevsv.at
        </a>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Haftungsausschluss
        </h3>
        <p>
          Diese Webseite wird als Hobby-Projekt betrieben und dient ausschließlich
          Informationszwecken für Funkamateure. Die bereitgestellten Informationen
          wurden sorgfältig zusammengestellt, dennoch kann keine Gewähr für
          Richtigkeit, Vollständigkeit und Aktualität übernommen werden.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Urheberrecht
        </h3>
        <p>
          Die Inhalte dieser Webseite unterliegen dem Urheberrecht. Die Anwendung
          ist als Open-Source-Projekt unter der MIT-Lizenz veröffentlicht.
          Der Quellcode ist auf GitHub verfügbar.
        </p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-slate-300">
      <p>
        FunkPilot nimmt den Schutz Ihrer persönlichen Daten sehr ernst.
        Diese Datenschutzerklärung informiert Sie über die Art, den Umfang
        und Zweck der Verarbeitung personenbezogener Daten.
      </p>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Keine Datenerfassung
        </h3>
        <p className="mb-2">
          Diese Anwendung wurde so konzipiert, dass sie minimal in Ihre
          Privatsphäre eingreift:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Keine Registrierung oder Anmeldung erforderlich</li>
          <li>Keine Tracking-Cookies oder Analyse-Tools</li>
          <li>Keine Weitergabe von Daten an Dritte</li>
          <li>Keine serverseitige Speicherung Ihrer Eingaben</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Lokale Speicherung
        </h3>
        <p>
          Ihre Einstellungen (Rufzeichen, Locator, Präferenzen) werden
          ausschließlich lokal in Ihrem Browser gespeichert (LocalStorage).
          Diese Daten verlassen Ihr Gerät nicht und können jederzeit durch
          Löschen der Browser-Daten entfernt werden.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          KI-API-Kommunikation
        </h3>
        <p className="mb-2">
          Bei Nutzung der KI-Features werden Ihre Anfragen an den konfigurierten
          KI-Dienst (Anthropic oder OpenRouter) gesendet. Die Verarbeitung
          erfolgt gemäß den Datenschutzrichtlinien des jeweiligen Anbieters.
          Es werden keine persönlichen Daten über die Anfrage hinaus übermittelt.
        </p>
        <p>
          Der KI-Assistent ist ausschließlich auf Amateurfunk-Themen beschränkt
          und verweigert Antworten auf themenfremde, illegale oder unangemessene
          Anfragen.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Hosting
        </h3>
        <p>
          Bei selbst-gehosteten Installationen gelten die Datenschutzrichtlinien
          des jeweiligen Hosting-Anbieters. Bei Docker-Installationen auf
          eigenem Server verlassen Ihre Daten nicht Ihre Infrastruktur.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Ihre Rechte
        </h3>
        <p>
          Da keine personenbezogenen Daten serverseitig gespeichert werden,
          entfallen die üblichen Betroffenenrechte (Auskunft, Berichtigung,
          Löschung). Lokal gespeicherte Daten können Sie jederzeit selbst
          in den Browser-Einstellungen löschen.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Kontakt
        </h3>
        <p className="mb-2">
          Bei Fragen zum Datenschutz können Sie mich kontaktieren:
        </p>
        <a
          href="mailto:oe8yml@oevsv.at"
          className="text-sky-400 hover:underline"
        >
          oe8yml@oevsv.at
        </a>
      </section>
    </div>
  );
}
