import { X, Mic, MessageSquare, FileText, Radio, Search, Settings, HelpCircle, Wrench } from 'lucide-react';
import { useEffect } from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
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
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-sky-400" />
            Hilfe
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
          <div className="space-y-6 text-slate-300">
            <p>
              FunkPilot ist dein KI-Assistent für den Amateurfunk. Hier findest du
              eine Übersicht aller Funktionen.
            </p>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Mic className="w-5 h-5 text-sky-400" />
                Voice CQ
              </h3>
              <p className="mb-2">
                Generiere natürlich klingende CQ-Rufe und Contest-Phrasen mit Text-to-Speech.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>Wähle eine Contest-Vorlage oder schreibe eigenen Text</li>
                <li>Dein Rufzeichen wird automatisch in NATO-Phonetik umgewandelt</li>
                <li>Klicke auf Play um die Ausgabe zu hören</li>
                <li>Geschwindigkeit kann in Einstellungen angepasst werden</li>
              </ul>
            </section>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" />
                QSO Chat
              </h3>
              <p className="mb-2">
                Stelle Fragen zu allen Amateurfunk-Themen an den KI-Assistenten.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>Technik: Antennen, Transceiver, SDR</li>
                <li>Betriebsverfahren: CW, SSB, Digimodes</li>
                <li>Vorschriften: Lizenzklassen, Bandpläne</li>
                <li>Propagation: Ausbreitungsbedingungen</li>
              </ul>
              <div className="mt-3 p-2 bg-amber-900/30 border border-amber-700/50 rounded">
                <h4 className="text-sm font-medium text-amber-200 flex items-center gap-1">
                  <Wrench className="w-4 h-4" />
                  Ham Radio Tools (Groq MCP)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mit GROQ_API_KEY aktiviert: Bandplan-Abfragen, Wellenlängen-, EIRP-,
                  Kabelverlust-, SWR- und Akkulaufzeit-Berechnungen direkt im Chat.
                </p>
              </div>
              <div className="mt-3 p-2 bg-sky-900/30 border border-sky-700/50 rounded">
                <h4 className="text-sm font-medium text-sky-200 flex items-center gap-1">
                  <Search className="w-4 h-4" />
                  Web-Suche (Tavily)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Aktuelle Informationen zu Contests, Propagation und Amateurfunk-News.
                  Frage z.B. "Welcher Contest ist aktuell?" oder "Was ist heute auf den Bändern los?"
                </p>
              </div>
            </section>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                Log-Analyse
              </h3>
              <p className="mb-2">
                Importiere dein Contest-Log (ADIF-Format) für detaillierte Statistiken.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>ADIF-Datei per Drag & Drop importieren</li>
                <li>QSO-Statistiken nach Band, Mode, Zeit</li>
                <li>KI-Analyse mit Verbesserungsvorschlägen</li>
                <li>Erkennung von Aktivitätslücken</li>
              </ul>
            </section>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Radio className="w-5 h-5 text-sky-400" />
                Propagation
              </h3>
              <p className="mb-2">
                Echtzeit Solar-Daten und KI-Empfehlungen für DX-Verbindungen.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>Aktuelle Solardaten: SFI, K-Index, A-Index</li>
                <li>Band-Öffnungen für alle Bänder (160m - 70cm)</li>
                <li>Wähle ein Ziel für personalisierte Empfehlungen</li>
                <li>Berücksichtigt deinen Standort (Locator)</li>
              </ul>
            </section>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-400" />
                Rufzeichen-Finder
              </h3>
              <p className="mb-2">
                Österreichische Rufzeichen suchen, Verfügbarkeit prüfen und Vorschläge generieren.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li><strong>Suche:</strong> Rufzeichen in offizieller OE-Liste und QRZ.com nachschlagen</li>
                <li><strong>Schwarzfunker-Warnung:</strong> Erkennt Rufzeichen die nur in QRZ, aber nicht offiziell registriert sind</li>
                <li><strong>Verfügbarkeit:</strong> Prüft Suffix in allen 9 Bundesländern (OE1-OE9)</li>
                <li><strong>Vorschläge:</strong> Generiert passende Rufzeichen basierend auf deinem Namen</li>
                <li><strong>Chat-Integration:</strong> Alle Features auch im Chat nutzbar ("Wer ist OE3NSC?", "Ist ABC frei?")</li>
              </ul>
            </section>

            <section className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-400" />
                Einstellungen
              </h3>
              <p className="mb-2">
                Konfiguriere FunkPilot für deine Station.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-slate-400">
                <li>Rufzeichen und Name für personalisierte Ausgabe</li>
                <li>Locator (Maidenhead) für Propagation-Berechnung</li>
                <li>TTS-Sprache und Geschwindigkeit</li>
                <li>Theme: Dunkel oder Hell-Modus</li>
                <li>Server-Status und API-Verbindung</li>
              </ul>
            </section>

            <section className="border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Tastenkürzel
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hilfe anzeigen</span>
                  <kbd className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">?</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Modal schließen</span>
                  <kbd className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">Esc</kbd>
                </div>
              </div>
            </section>

            <p className="text-sm text-slate-400 pt-2">
              Bei Fragen oder Feedback: <a href="mailto:oe8yml@rednil.at" className="text-sky-400 hover:underline">oe8yml@rednil.at</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
