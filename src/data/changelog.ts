export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: {
    type: 'feature' | 'improvement' | 'fix';
    text: string;
  }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.10.1',
    date: '2026-01-31',
    title: 'MeshCore Guide',
    changes: [
      { type: 'feature', text: 'MeshCore Getting Started Guide' },
      { type: 'feature', text: 'MeshCore vs Meshtastic Vergleich' },
      { type: 'feature', text: 'Rooms & Repeater-Modus erklärt' },
      { type: 'improvement', text: 'Einheitliche Kostenangaben für Mesh-Hardware' },
    ],
  },
  {
    version: '1.10.0',
    date: '2026-01-31',
    title: 'Mesh/LoRa Guides',
    changes: [
      { type: 'feature', text: 'Neue Kategorie: Mesh / LoRa im Projekte-Tab' },
      { type: 'feature', text: 'Meshtastic Getting Started Guide' },
      { type: 'feature', text: 'MeshCom Getting Started Guide (ÖVSV)' },
      { type: 'feature', text: 'Hardware-Vergleich: T-Beam, Heltec, RAK' },
      { type: 'improvement', text: 'Markdown-Rendering für Dokumentation' },
    ],
  },
  {
    version: '1.9.1',
    date: '2026-01-31',
    title: 'Chat-Bugfix',
    changes: [
      { type: 'fix', text: 'Erste Chat-Nachricht wird jetzt korrekt angezeigt' },
      { type: 'fix', text: 'Race-Condition bei Conversation-Erstellung behoben' },
    ],
  },
  {
    version: '1.9.0',
    date: '2026-01-31',
    title: 'Test-Suite',
    changes: [
      { type: 'feature', text: 'Vitest Test-Framework eingerichtet' },
      { type: 'feature', text: '123 automatisierte Tests für Kernfunktionen' },
      { type: 'feature', text: 'Tests für: Phonetik, Locator, ADIF-Parser, i18n, API' },
      { type: 'improvement', text: 'npm test startet alle Tests' },
    ],
  },
  {
    version: '1.8.1',
    date: '2026-01-31',
    title: 'Vollständige Übersetzung',
    changes: [
      { type: 'improvement', text: 'Voice CQ: Alle Texte übersetzt' },
      { type: 'improvement', text: 'Propagation: Alle Texte übersetzt inkl. Band-Status' },
      { type: 'improvement', text: 'Rufzeichen-Finder: Alle drei Tabs vollständig übersetzt' },
      { type: 'improvement', text: 'Konsistente Übersetzungen in DE, EN, SL' },
    ],
  },
  {
    version: '1.8.0',
    date: '2026-01-31',
    title: 'Mehrsprachigkeit / Multilingual',
    changes: [
      { type: 'feature', text: 'Drei Sprachen: Deutsch, English, Slovenščina' },
      { type: 'feature', text: 'Sprachauswahl im Header und in Einstellungen' },
      { type: 'feature', text: 'Automatische Spracherkennung (Browser-Sprache)' },
      { type: 'improvement', text: 'Alle UI-Texte übersetzt' },
    ],
  },
  {
    version: '1.7.1',
    date: '2026-01-31',
    title: 'Mobile Projekte-Tab',
    changes: [
      { type: 'improvement', text: 'Verdrahtungstabelle: Card-Layout auf Mobile statt Tabelle' },
      { type: 'improvement', text: 'Kategorie-Filter: Horizontales Scrollen' },
      { type: 'improvement', text: 'Code-Viewer: Kompakte Buttons auf Mobile' },
      { type: 'improvement', text: 'Projekt-Header: Besseres Layout auf kleinen Screens' },
    ],
  },
  {
    version: '1.7.0',
    date: '2026-01-31',
    title: 'PWA & Mobile Optimierung',
    changes: [
      { type: 'feature', text: 'Progressive Web App (PWA): App auf Handy/Tablet installierbar' },
      { type: 'feature', text: 'Auto-Update: App aktualisiert sich automatisch im Hintergrund' },
      { type: 'feature', text: 'Offline-Grundfunktionen: Cached Ressourcen verfügbar ohne Internet' },
      { type: 'improvement', text: 'Touch-optimierte Buttons (44x44px Mindestgröße)' },
      { type: 'improvement', text: 'Responsive Chat-Bubbles für kleine Bildschirme' },
      { type: 'improvement', text: 'Fullscreen Code-Viewer auf Mobile optimiert' },
      { type: 'improvement', text: 'Modals besser auf kleinen Screens dargestellt' },
    ],
  },
  {
    version: '1.6.2',
    date: '2026-01-31',
    title: '15 Neue Bastelprojekte',
    changes: [
      { type: 'feature', text: '19 Projekte jetzt verfügbar (15 neu!)' },
      { type: 'feature', text: 'CW/Morse: Morse-Decoder, Morse-Trainer (Koch-Methode), Baken-Keyer' },
      { type: 'feature', text: 'Messtechnik: Frequenzzähler, Dummy Load, Feldstärkemessgerät' },
      { type: 'feature', text: 'Audio/NF: CW-Audiofilter, NF-Verstärker, VOX-Schaltung' },
      { type: 'feature', text: 'Digital: Digimode-Interface, FT8-Sync, Simple TNC' },
      { type: 'feature', text: 'Steuerung: Rotorsteuerung, PTT-Interface, Bandfilter-Umschalter' },
    ],
  },
  {
    version: '1.6.1',
    date: '2026-01-31',
    title: 'Verdrahtungstabelle & Bauanleitung',
    changes: [
      { type: 'feature', text: 'Verdrahtungstabelle mit Pin-Belegung für jedes Projekt' },
      { type: 'feature', text: 'Farbcodierte Kabelempfehlungen' },
      { type: 'feature', text: 'Link zum Wokwi Online-Simulator (wo verfügbar)' },
      { type: 'feature', text: 'KI-generierte Schritt-für-Schritt Bauanleitung' },
    ],
  },
  {
    version: '1.6.0',
    date: '2026-01-31',
    title: 'KI Code-Anpassung',
    changes: [
      { type: 'feature', text: 'KI-Chat zur Code-Anpassung direkt im Projekt' },
      { type: 'feature', text: 'Code-Änderungen per Chat: "Ändere die Geschwindigkeit auf 25 WPM"' },
      { type: 'feature', text: 'Angepasster Code kann direkt übernommen werden' },
      { type: 'feature', text: 'Quick-Prompts für häufige Anfragen' },
    ],
  },
  {
    version: '1.5.1',
    date: '2026-01-31',
    title: 'Code-Viewer Verbesserungen',
    changes: [
      { type: 'improvement', text: 'Erweitertes Syntax-Highlighting: Keywords, Types, Functions, Constants' },
      { type: 'feature', text: 'Vollbild-Modus für Code-Viewer' },
      { type: 'feature', text: 'Stücklisten-Export als CSV und TXT' },
      { type: 'improvement', text: 'Traffic-Light Dekoration im macOS-Style' },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-01-31',
    title: 'HAM Bastelprojekte',
    changes: [
      { type: 'feature', text: 'Neuer Tab "Projekte" mit Arduino & ESP32 Bastelprojekten' },
      { type: 'feature', text: 'Code-Viewer mit Syntax-Highlighting, Copy & Download' },
      { type: 'feature', text: 'Stücklisten und Kostenabschätzung für jedes Projekt' },
      { type: 'feature', text: 'Erste Projekte: CW-Keyer, SWR-Meter, APRS-Tracker, Antennenumschalter' },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-01-31',
    title: 'Transparente Verarbeitung',
    changes: [
      { type: 'feature', text: 'Live-Status während Chat-Verarbeitung: Sieh genau, was passiert!' },
      { type: 'feature', text: 'Status-Icons für Web-Suche, Rufzeichen-Lookup, Verfügbarkeitsprüfung' },
      { type: 'improvement', text: 'Abgeschlossene Aktionen werden mit ✓ angezeigt' },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-01-31',
    title: 'Web-Suche & Externe Links',
    changes: [
      { type: 'feature', text: 'EU-konforme Web-Suche via Tavily für aktuelle Contest- und Propagation-Infos' },
      { type: 'feature', text: 'Klickbare Links im Chat mit DSGVO-konformer Warnung bei externen Seiten' },
      { type: 'improvement', text: 'Tavily und QRZ Status in Einstellungen sichtbar' },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-01-30',
    title: 'Rufzeichen-Finder',
    changes: [
      { type: 'feature', text: 'Neuer Tab "Rufzeichen" mit Suche, Verfügbarkeit und Vorschlägen' },
      { type: 'feature', text: 'Schwarzfunker-Erkennung: Warnung bei nicht-offiziellen OE-Rufzeichen' },
      { type: 'feature', text: 'Suffix-Verfügbarkeit in allen 9 Bundesländern prüfen' },
      { type: 'feature', text: 'Rufzeichen-Vorschläge basierend auf Namen generieren' },
      { type: 'improvement', text: 'Chat-Integration: "Wer ist OE3NSC?", "Ist ABC frei?"' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-01-28',
    title: 'OERadio Tools & Chat-Verlauf',
    changes: [
      { type: 'feature', text: 'OERadio.at Tools im Chat verfügbar (Rechner, Lerntools, Utilities)' },
      { type: 'feature', text: 'Chat-Verlauf mit mehreren Konversationen' },
      { type: 'feature', text: 'Automatische Titel-Generierung für Chats' },
      { type: 'improvement', text: 'Ham Radio Tools (MCP): Bandplan, EIRP, Kabelverlust, etc.' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-01-25',
    title: 'Erste Version',
    changes: [
      { type: 'feature', text: 'Voice CQ Generator mit Edge TTS Neural Voices' },
      { type: 'feature', text: 'QSO-Chat-Assistent für Amateurfunk-Fragen' },
      { type: 'feature', text: 'Contest-Log-Analyse mit ADIF-Import' },
      { type: 'feature', text: 'Propagation-Berater mit Echtzeit Solar-Daten' },
      { type: 'feature', text: 'Dunkel- und Hell-Modus' },
    ],
  },
];

// Get the latest version for "new" badge
export const LATEST_VERSION = CHANGELOG[0]?.version || '1.0.0';

// Check if user has seen the latest changelog
export function hasSeenChangelog(version: string): boolean {
  const seen = localStorage.getItem('funkpilot_changelog_seen');
  return seen === version;
}

export function markChangelogSeen(version: string): void {
  localStorage.setItem('funkpilot_changelog_seen', version);
}
