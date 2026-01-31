import { ArrowLeft, ExternalLink, Cpu, Lightbulb } from 'lucide-react';
import type { HamProject } from '../../types/projects';
import { CATEGORY_INFO, HARDWARE_INFO, DIFFICULTY_LABELS } from '../../types/projects';
import { CodeViewer } from './CodeViewer';
import { ComponentList } from './ComponentList';

interface ProjectDetailProps {
  project: HamProject;
  onBack: () => void;
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const category = CATEGORY_INFO[project.category];
  const hardware = HARDWARE_INFO[project.hardware];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category.icon}</span>
            <h2 className="text-2xl font-bold">{project.name}</h2>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`${hardware.color} text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1`}>
              <Cpu className="w-3 h-3" />
              {hardware.name}
            </span>
            <span className="text-sm text-slate-400">
              {'⭐'.repeat(project.difficulty)} {DIFFICULTY_LABELS[project.difficulty]}
            </span>
            <span className="text-sm text-green-400">{project.estimatedCost}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Info + Components */}
        <div className="space-y-4">
          {/* Description */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold text-slate-100 mb-2">Beschreibung</h3>
            <p className="text-sm text-slate-300">{project.description}</p>
          </div>

          {/* Components */}
          <ComponentList
            components={project.components}
            estimatedCost={project.estimatedCost}
            projectName={project.name}
          />

          {/* Customization Suggestions */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Erweiterungsideen
            </h3>
            <ul className="space-y-2">
              {project.customizationSuggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                  <span className="text-sky-400">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* External Links */}
          {project.externalLinks && project.externalLinks.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold text-slate-100 mb-3">Links</h3>
              <div className="space-y-2">
                {project.externalLinks.map((link, idx) => (
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

        {/* Right Column: Code */}
        <div className="lg:col-span-2">
          <CodeViewer
            code={project.code}
            fileName={project.codeFileName}
            language={project.codeLanguage}
          />

          {/* Tip */}
          <div className="mt-4 bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
            <p className="text-sm text-amber-200">
              <strong>Tipp:</strong> Öffne die heruntergeladene Datei in der Arduino IDE oder PlatformIO.
              Installiere ggf. benötigte Libraries über den Library Manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
