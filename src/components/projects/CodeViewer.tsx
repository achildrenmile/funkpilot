import { useState } from 'react';
import { Copy, Download, Check, Maximize2, Minimize2, BookOpen, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface CodeViewerProps {
  code: string;
  fileName: string;
  language: 'cpp' | 'python' | 'micropython' | 'markdown';
}

export function CodeViewer({ code, fileName, language }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = code.split('\n');
  const langLabel = language === 'cpp' ? 'C++ / Arduino' : language === 'python' ? 'Python' : language === 'markdown' ? 'Dokumentation' : 'MicroPython';
  const isMarkdown = language === 'markdown';

  return (
    <div className={`bg-slate-900 rounded-xl border border-slate-700 overflow-hidden ${expanded ? 'fixed inset-0 sm:inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-800 border-b border-slate-700 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Traffic lights decoration - hide on mobile */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs sm:text-sm font-mono text-slate-300 truncate">{fileName}</span>
          <span className="hidden sm:inline text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded flex-shrink-0">
            {langLabel}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {isMarkdown && (
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="p-2 sm:p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors flex items-center gap-1"
              title={showRaw ? 'Formatiert anzeigen' : 'Quelltext anzeigen'}
            >
              {showRaw ? <BookOpen className="w-4 h-4" /> : <Code className="w-4 h-4" />}
              <span className="hidden sm:inline text-xs">{showRaw ? 'Formatiert' : 'Quelltext'}</span>
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 sm:p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
            title={expanded ? 'Verkleinern' : 'Vollbild'}
          >
            {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Kopieren"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{copied ? 'Kopiert!' : 'Kopieren'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-sm bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className={`p-2 sm:p-4 overflow-auto ${expanded ? 'h-[calc(100%-60px)]' : 'max-h-[400px] sm:max-h-[600px]'}`}>
        {isMarkdown && !showRaw ? (
          // Rendered Markdown
          <div className="prose prose-invert prose-sm max-w-none
            prose-headings:text-slate-100 prose-headings:font-semibold prose-headings:border-b prose-headings:border-slate-700 prose-headings:pb-2
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-100
            prose-code:text-amber-400 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
            prose-ul:text-slate-300 prose-ol:text-slate-300
            prose-li:marker:text-slate-500
            prose-table:text-sm
            prose-th:bg-slate-800 prose-th:text-slate-200 prose-th:font-medium prose-th:px-3 prose-th:py-2
            prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-slate-700
            prose-hr:border-slate-700
          ">
            <ReactMarkdown>{code}</ReactMarkdown>
          </div>
        ) : (
          // Raw Code/Markdown
          <pre className="text-xs sm:text-sm font-mono leading-relaxed">
            <code>
              {lines.map((line, idx) => (
                <div key={idx} className="flex hover:bg-slate-800/50 -mx-2 sm:-mx-4 px-2 sm:px-4">
                  <span className="text-slate-600 select-none w-8 sm:w-12 text-right pr-2 sm:pr-4 flex-shrink-0 border-r border-slate-800 mr-2 sm:mr-4">
                    {idx + 1}
                  </span>
                  <span className="flex-1 whitespace-pre overflow-x-auto">
                    {highlightLine(line, language)}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        )}
      </div>

      {/* Expanded overlay backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/50 -z-10"
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  );
}

// Syntax highlighting for C++/Arduino
function highlightLine(line: string, language: string): JSX.Element {
  if (language !== 'cpp') {
    return <span className="text-slate-300">{line}</span>;
  }

  // Empty line
  if (!line.trim()) {
    return <span>{line}</span>;
  }

  // Full line comment
  if (line.trim().startsWith('//')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  // Preprocessor directives
  if (line.trim().startsWith('#')) {
    return <span className="text-purple-400">{line}</span>;
  }

  // Tokenize and highlight
  const tokens: JSX.Element[] = [];
  let key = 0;

  // Keywords
  const keywords = /\b(const|int|void|bool|float|double|char|long|unsigned|signed|static|volatile|extern|String|byte|word|if|else|for|while|do|switch|case|break|continue|return|goto|default|sizeof|typedef|struct|enum|class|public|private|protected|virtual|inline|template|typename|namespace|using|new|delete|try|catch|throw)\b/g;

  // Types/Classes (capitalized)
  const types = /\b(Serial|Wire|SPI|EEPROM|WiFi|Adafruit_SSD1306|Adafruit_GFX|TinyGPSPlus|HardwareSerial)\b/g;

  // Functions
  const functions = /\b(setup|loop|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|delayMicroseconds|millis|micros|tone|noTone|map|constrain|min|max|abs|sqrt|pow|sin|cos|tan|print|println|begin|end|available|read|write|flush|find|parseInt|parseFloat|readString|readStringUntil|setTimeout|clearDisplay|display|setCursor|setTextSize|setTextColor|drawRect|fillRect|encode|location|satellites|speed|course|lat|lng|isValid)\b/g;

  // Constants
  const constants = /\b(HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|LED_BUILTIN|true|false|NULL|nullptr|PI|HALF_PI|TWO_PI|DEG_TO_RAD|RAD_TO_DEG|SERIAL_8N1|SSD1306_WHITE|SSD1306_BLACK|SSD1306_SWITCHCAPVCC)\b/g;

  // Numbers
  const numbers = /\b(\d+\.?\d*[fFuUlL]?|0x[0-9A-Fa-f]+)\b/g;

  // Strings
  const strings = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|F\("([^"\\]|\\.)*"\)/g;

  // Build highlighted line
  let lastIndex = 0;
  const matches: { index: number; length: number; text: string; className: string }[] = [];

  // Find all matches
  const findMatches = (regex: RegExp, className: string) => {
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(line)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[0],
        className,
      });
    }
  };

  findMatches(strings, 'text-green-400');
  findMatches(keywords, 'text-pink-400 font-medium');
  findMatches(types, 'text-yellow-400');
  findMatches(functions, 'text-sky-400');
  findMatches(constants, 'text-orange-400');
  findMatches(numbers, 'text-amber-300');

  // Sort by index and remove overlapping
  matches.sort((a, b) => a.index - b.index);
  const filtered: typeof matches = [];
  for (const m of matches) {
    const last = filtered[filtered.length - 1];
    if (!last || m.index >= last.index + last.length) {
      filtered.push(m);
    }
  }

  // Build result
  for (const m of filtered) {
    if (m.index > lastIndex) {
      tokens.push(
        <span key={key++} className="text-slate-300">
          {line.slice(lastIndex, m.index)}
        </span>
      );
    }
    tokens.push(
      <span key={key++} className={m.className}>
        {m.text}
      </span>
    );
    lastIndex = m.index + m.length;
  }

  if (lastIndex < line.length) {
    tokens.push(
      <span key={key++} className="text-slate-300">
        {line.slice(lastIndex)}
      </span>
    );
  }

  return <>{tokens}</>;
}
