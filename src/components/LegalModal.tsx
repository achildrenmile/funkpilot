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
      <div className="bg-slate-800 rounded-xl max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-slate-700">
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
        Angaben gemäß § 5 ECG und § 25 MedienG (Österreich)
      </p>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Betreiber
        </h3>
        <div className="space-y-1">
          <p className="font-medium">Michael Linder</p>
          <p>Amateurfunkrufzeichen: OE8YML</p>
          <p>Nötsch 219, 9611 Nötsch</p>
          <p>Österreich</p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Kontakt
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
          Haftung für Inhalte
        </h3>
        <p>
          Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die
          Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir
          jedoch keine Gewähr. Diese Website dient als KI-gestützter Assistent
          für den Amateurfunk. KI-generierte Inhalte sollten stets kritisch
          geprüft werden.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Urheberrecht
        </h3>
        <p>
          Die durch den Betreiber erstellten Inhalte und Werke auf dieser Website
          unterliegen dem österreichischen Urheberrecht. Der Quellcode ist unter
          der MIT-Lizenz auf GitHub verfügbar.
        </p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-slate-300">
      <p>
        Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung
        informiert Sie gemäß Art. 13 DSGVO (EU 2016/679) und dem österreichischen
        Datenschutzgesetz (DSG) über die Datenverarbeitung auf dieser Website.
      </p>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Verantwortlicher
        </h3>
        <p className="mb-2">
          Verantwortlich für die Datenverarbeitung gemäß Art. 4 Nr. 7 DSGVO:
        </p>
        <div className="space-y-1 ml-2">
          <p>Michael Linder (OE8YML)</p>
          <p>Nötsch 219, 9611 Nötsch, Österreich</p>
          <p>E-Mail: <a href="mailto:oe8yml@rednil.at" className="text-sky-400 hover:underline">oe8yml@rednil.at</a></p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Keine Erhebung personenbezogener Daten
        </h3>
        <p className="mb-2">
          Diese Anwendung wurde datenschutzfreundlich konzipiert:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Keine Registrierung oder Anmeldung erforderlich</li>
          <li>Keine Cookies (außer technisch notwendige lokale Speicherung)</li>
          <li>Kein Tracking oder Analytics</li>
          <li>Keine serverseitige Speicherung Ihrer Eingaben</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Lokale Speicherung (LocalStorage)
        </h3>
        <p>
          Ihre Einstellungen (Rufzeichen, Locator, Präferenzen) werden ausschließlich
          lokal in Ihrem Browser gespeichert. Diese Daten werden nicht an Server
          übertragen und können jederzeit durch Löschen der Browser-Daten entfernt werden.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Hinweis gemäß EU AI Act (Verordnung 2024/1689)
        </h3>
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 mb-4">
          <p className="font-medium text-amber-200 mb-2">
            KI-Transparenzhinweis nach Art. 50 EU AI Act
          </p>
          <p className="text-sm mb-3">
            FunkPilot verwendet <strong>Künstliche Intelligenz</strong> zur Beantwortung
            Ihrer Fragen. Sie interagieren mit einem KI-System, nicht mit einem Menschen.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li><strong>KI-Einschränkungen:</strong> KI-Antworten können Fehler enthalten,
            unvollständig sein oder veraltete Informationen wiedergeben</li>
            <li><strong>Keine Rechts- oder Sicherheitsberatung:</strong> KI-generierte
            Inhalte ersetzen keine fachkundige Beratung</li>
            <li><strong>Menschliche Überprüfung empfohlen:</strong> Kritische Informationen
            sollten stets aus offiziellen Quellen verifiziert werden</li>
            <li><strong>Synthetische Sprache:</strong> Der Voice CQ Generator erzeugt
            KI-generierte Audioinhalte (Microsoft Edge TTS)</li>
          </ul>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          FunkPilot wird gemäß EU AI Act als KI-System mit begrenztem Risiko (Chatbot)
          eingestuft. Die Nutzung unterliegt den Transparenzpflichten nach Art. 50 der
          Verordnung (EU) 2024/1689.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          KI-Dienste und Datenverarbeitung
        </h3>
        <p className="mb-2">
          Bei Nutzung der KI-Features werden Ihre Anfragen an externe KI-Anbieter übermittelt.
          Dies erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
          an der Bereitstellung der KI-Funktionalität).
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Es werden nur die für die Anfrage notwendigen Daten übermittelt</li>
          <li>Keine Übermittlung personenbezogener Daten wie Name oder Adresse</li>
          <li>Der KI-Assistent ist auf Amateurfunk-Themen beschränkt</li>
          <li>Anfragen werden nicht dauerhaft gespeichert</li>
        </ul>

        <div className="mt-4 space-y-3">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="font-medium text-slate-200">Groq Inc. (USA) - Primär</p>
            <p className="text-sm text-slate-400 mt-1">
              Modell: Llama 3.1 8B. Zertifiziert unter dem EU-U.S. Data Privacy Framework.
              <br />
              <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">groq.com/privacy-policy</a>
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="font-medium text-slate-200">Anthropic PBC (USA) - Fallback</p>
            <p className="text-sm text-slate-400 mt-1">
              Modell: Claude. Zertifiziert unter dem EU-U.S. Data Privacy Framework.
              <br />
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">anthropic.com/privacy</a>
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="font-medium text-slate-200">OpenRouter Inc. (USA) - Fallback</p>
            <p className="text-sm text-slate-400 mt-1">
              Vermittelt Zugang zu verschiedenen KI-Modellen.
              <br />
              <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">openrouter.ai/privacy</a>
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="font-medium text-slate-200">Tavily Inc. (USA) - Web-Suche</p>
            <p className="text-sm text-slate-400 mt-1">
              Für aktuelle Informationen (z.B. Contests, Propagation) kann eine Web-Suche
              durchgeführt werden. Dabei werden nur die Suchbegriffe übermittelt, keine
              personenbezogenen Daten. Tavily ist GDPR-konform und speichert keine Suchanfragen.
              <br />
              <a href="https://tavily.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">tavily.com/privacy</a>
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-400">
          Die Datenübermittlung in die USA erfolgt auf Basis von Art. 49 Abs. 1 lit. a DSGVO
          (ausdrückliche Einwilligung durch Nutzung) sowie Standardvertragsklauseln (SCCs).
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Cloudflare
        </h3>
        <p>
          Diese Website wird über Cloudflare Inc. (USA) bereitgestellt. Cloudflare kann
          technisch notwendige Verbindungsdaten (IP-Adresse, Browser-Typ) verarbeiten.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
          Datenschutzerklärung: <a href="https://www.cloudflare.com/de-de/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">cloudflare.com/privacypolicy</a>
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Wokwi Simulator (extern)
        </h3>
        <p className="mb-2">
          Bei den Bastelprojekten können Sie optional den externen Arduino/ESP32-Simulator
          <strong> Wokwi.com</strong> nutzen. Wenn Sie auf "Im Simulator öffnen" klicken,
          werden Sie auf die externe Website wokwi.com weitergeleitet.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
          <li>FunkPilot überträgt dabei <strong>keine Daten</strong> an Wokwi</li>
          <li>Sie kopieren den Code manuell in den Simulator</li>
          <li>Wokwi unterliegt eigenen Datenschutzbestimmungen</li>
          <li>Die Nutzung von Wokwi ist freiwillig und nicht erforderlich</li>
        </ul>
        <p className="mt-2 text-sm">
          Betreiber: Wokwi Ltd. (Israel). Datenschutzerklärung:
          <a href="https://wokwi.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline ml-1">wokwi.com/privacy</a>
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Ihre Rechte nach DSGVO
        </h3>
        <p className="mb-2">
          Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
        </ul>
        <p className="mt-2">
          Da wir keine personenbezogenen Daten serverseitig speichern, sind diese Rechte
          praktisch bereits erfüllt. Lokal gespeicherte Daten können Sie selbst löschen.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Beschwerderecht
        </h3>
        <p>
          Sie haben das Recht, sich bei der zuständigen Aufsichtsbehörde zu beschweren:
          Österreichische Datenschutzbehörde, Barichgasse 40-42, 1030 Wien,
          <a href="mailto:dsb@dsb.gv.at" className="text-sky-400 hover:underline ml-1">dsb@dsb.gv.at</a>
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Kontakt
        </h3>
        <p className="mb-2">
          Bei Fragen zur Datenverarbeitung wenden Sie sich an:
        </p>
        <a
          href="mailto:oe8yml@rednil.at"
          className="text-sky-400 hover:underline"
        >
          oe8yml@rednil.at
        </a>
      </section>

      <p className="text-sm text-slate-400 pt-4 border-t border-slate-700">
        Stand: Januar 2026
      </p>
    </div>
  );
}
