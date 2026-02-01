import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Cpu, Lightbulb, RotateCcw } from 'lucide-react';
import type { HamProject } from '../../types/projects';
import { CATEGORY_INFO, HARDWARE_INFO, DIFFICULTY_LABELS, getLocalized } from '../../types/projects';
import { CodeViewer } from './CodeViewer';
import { ComponentList } from './ComponentList';
import { WiringTable } from './WiringTable';
import { ProjectChat } from './ProjectChat';
import { LoRaHardwareCompare } from './LoRaHardwareCompare';
import { LoRaRangeCalculator } from './LoRaRangeCalculator';
import { useCurrentLanguage } from '../../hooks/useLocalizedProject';

interface ProjectDetailProps {
  project: HamProject;
  onBack: () => void;
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const lang = useCurrentLanguage();
  const code = getLocalized(project.code, lang);
  const [currentCode, setCurrentCode] = useState(code);
  const [isModified, setIsModified] = useState(false);
  const category = CATEGORY_INFO[project.category];

  // Update code when language changes (important for guides)
  useEffect(() => {
    if (!isModified) {
      setCurrentCode(code);
    }
  }, [code, isModified]);
  const hardware = HARDWARE_INFO[project.hardware];

  const handleCodeUpdate = (newCode: string) => {
    setCurrentCode(newCode);
    setIsModified(true);
  };

  const handleResetCode = () => {
    setCurrentCode(code);
    setIsModified(false);
  };

  // Localize components
  const localizedComponents = project.components.map(c => ({
    name: getLocalized(c.name, lang),
    quantity: c.quantity,
    notes: c.notes ? getLocalized(c.notes, lang) : undefined,
  }));

  // Localize wiring
  const localizedWiring = project.wiring?.map(w => ({
    from: getLocalized(w.from, lang),
    to: getLocalized(w.to, lang),
    color: w.color,
    notes: w.notes ? getLocalized(w.notes, lang) : undefined,
  }));

  // Localize customization suggestions
  const localizedSuggestions = project.customizationSuggestions.map(s => getLocalized(s, lang));

  // Localize external links
  const localizedLinks = project.externalLinks?.map(l => ({
    title: getLocalized(l.title, lang),
    url: l.url,
  }));

  // UI text translations
  const texts = {
    description: { de: 'Beschreibung', en: 'Description', sl: 'Opis' },
    extensions: { de: 'Erweiterungsideen', en: 'Extension ideas', sl: 'Ideje za razširitev' },
    links: { de: 'Links', en: 'Links', sl: 'Povezave' },
    codeModified: { de: 'Code wurde von der KI angepasst', en: 'Code was modified by AI', sl: 'Kodo je spremenila UI' },
    restoreOriginal: { de: 'Original wiederherstellen', en: 'Restore original', sl: 'Obnovi izvirnik' },
    tip: { de: 'Tipp', en: 'Tip', sl: 'Namig' },
    tipText: { de: 'Öffne die heruntergeladene Datei in der Arduino IDE oder PlatformIO. Installiere ggf. benötigte Libraries über den Library Manager.', en: 'Open the downloaded file in Arduino IDE or PlatformIO. Install required libraries via Library Manager if needed.', sl: 'Odpri preneseno datoteko v Arduino IDE ali PlatformIO. Po potrebi namesti zahtevane knjižnice preko Library Managerja.' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <button
          onClick={onBack}
          className="p-2.5 sm:p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">{category.icon}</span>
            <h2 className="text-lg sm:text-2xl font-bold truncate">{getLocalized(project.name, lang)}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`${hardware.color} text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1`}>
              <Cpu className="w-3 h-3" />
              {hardware.name}
            </span>
            <span className="text-xs sm:text-sm text-slate-400">
              {'⭐'.repeat(project.difficulty)} {getLocalized(DIFFICULTY_LABELS[project.difficulty], lang)}
            </span>
            <span className="text-xs sm:text-sm text-green-400">{project.estimatedCost}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Info + Components */}
        <div className="space-y-4">
          {/* Description */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold text-slate-100 mb-2">{getLocalized(texts.description, lang)}</h3>
            <p className="text-sm text-slate-300">{getLocalized(project.description, lang)}</p>
          </div>

          {/* Components */}
          <ComponentList
            components={localizedComponents}
            estimatedCost={project.estimatedCost}
            projectName={getLocalized(project.name, lang)}
          />

          {/* Wiring Table */}
          {localizedWiring && localizedWiring.length > 0 && (
            <WiringTable
              wiring={localizedWiring}
              wokwiUrl={project.wokwiUrl}
              code={currentCode}
              hardware={hardware.name}
            />
          )}

          {/* Customization Suggestions */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              {getLocalized(texts.extensions, lang)}
            </h3>
            <ul className="space-y-2">
              {localizedSuggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                  <span className="text-sky-400">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* External Links */}
          {localizedLinks && localizedLinks.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold text-slate-100 mb-3">{getLocalized(texts.links, lang)}</h3>
              <div className="space-y-2">
                {localizedLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Code or Special Tools */}
        <div className="lg:col-span-2 space-y-4">
          {/* Special case: LoRa Tools */}
          {project.id === 'lora-tools' ? (
            <>
              <LoRaHardwareCompare />
              <LoRaRangeCalculator />
            </>
          ) : (
            <>
              {/* Modified indicator */}
              {isModified && (
                <div className="flex items-center justify-between bg-green-900/30 border border-green-700/50 rounded-lg px-4 py-2">
                  <span className="text-sm text-green-300">
                    {getLocalized(texts.codeModified, lang)}
                  </span>
                  <button
                    onClick={handleResetCode}
                    className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {getLocalized(texts.restoreOriginal, lang)}
                  </button>
                </div>
              )}

              <CodeViewer
                code={currentCode}
                fileName={project.codeFileName}
                language={project.codeLanguage}
              />

              {/* AI Chat for code customization (not for guides) */}
              {project.codeLanguage !== 'markdown' && (
                <>
                  <ProjectChat
                    code={currentCode}
                    projectName={getLocalized(project.name, lang)}
                    hardware={hardware.name}
                    language={project.codeLanguage}
                    onCodeUpdate={handleCodeUpdate}
                  />

                  {/* Tip */}
                  <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                    <p className="text-sm text-amber-200">
                      <strong>{getLocalized(texts.tip, lang)}:</strong> {getLocalized(texts.tipText, lang)}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
