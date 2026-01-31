import { useState } from 'react';
import { ArrowLeft, Copy, Download, Check, ExternalLink, Cpu, Lightbulb } from 'lucide-react';
import type { HamProject } from '../../types/projects';
import { CATEGORY_INFO, HARDWARE_INFO, DIFFICULTY_LABELS } from '../../types/projects';

interface ProjectDetailProps {
  project: HamProject;
  onBack: () => void;
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [copied, setCopied] = useState(false);
  const category = CATEGORY_INFO[project.category];
  const hardware = HARDWARE_INFO[project.hardware];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(project.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([project.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = project.codeFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold text-slate-100 mb-3">Stückliste</h3>
            <div className="space-y-2">
              {project.components.map((comp, idx) => (
                <div key={idx} className="flex items-start justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-slate-200">{comp.name}</span>
                    {comp.notes && (
                      <span className="text-slate-500 text-xs ml-2">({comp.notes})</span>
                    )}
                  </div>
                  <span className="text-slate-400 ml-2">{comp.quantity}x</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between text-sm">
              <span className="text-slate-400">Geschätzte Kosten:</span>
              <span className="text-green-400 font-medium">{project.estimatedCost}</span>
            </div>
          </div>

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
          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            {/* Code Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-slate-300">{project.codeFileName}</span>
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
                  {project.codeLanguage === 'cpp' ? 'C++' : project.codeLanguage}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Kopieren</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
              <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                <code>
                  {project.code.split('\n').map((line, idx) => (
                    <div key={idx} className="flex">
                      <span className="text-slate-600 select-none w-12 text-right pr-4 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{highlightSyntax(line)}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>

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

// Simple syntax highlighting for C++
function highlightSyntax(line: string): JSX.Element {
  // Comments
  if (line.trim().startsWith('//')) {
    return <span className="text-slate-500">{line}</span>;
  }

  // Preprocessor
  if (line.trim().startsWith('#')) {
    return <span className="text-purple-400">{line}</span>;
  }

  // Keywords
  const keywords = ['const', 'int', 'void', 'bool', 'float', 'char', 'String', 'if', 'else', 'for', 'while', 'return', 'true', 'false', 'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP'];
  let result = line;

  // This is a simplified highlighter - for production use a proper library
  return <span>{result}</span>;
}
