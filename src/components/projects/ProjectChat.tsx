import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Code, MessageCircle, RotateCcw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  modifiedCode?: string | null;
}

interface ProjectChatProps {
  code: string;
  projectName: string;
  hardware: string;
  language: 'cpp' | 'python' | 'micropython' | 'markdown';
  onCodeUpdate: (newCode: string) => void;
}

export function ProjectChat({ code, projectName, hardware, language, onCodeUpdate }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setIsExpanded(true);

    try {
      const response = await fetch('/api/project/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          projectName,
          hardware,
          language,
          userRequest: userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Anfrage fehlgeschlagen');
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'Keine Antwort erhalten.',
        modifiedCode: data.modifiedCode,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Fehler bei der Verarbeitung. Bitte versuche es erneut.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCode = (newCode: string) => {
    onCodeUpdate(newCode);
  };

  const handleReset = () => {
    setMessages([]);
    setIsExpanded(false);
  };

  const quickPrompts = [
    'Schritt-für-Schritt Bauanleitung',
    'Erkläre den Code für Anfänger',
    'Füge Kommentare hinzu',
  ];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-b border-slate-700">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Code anpassen mit KI
        </h3>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="text-xs px-2 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Messages */}
      {isExpanded && messages.length > 0 && (
        <div className="max-h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[95%] sm:max-w-[85%] rounded-lg px-3 sm:px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Sparkles className="w-3 h-3" />
                    FunkPilot KI
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                {/* Show "Apply Code" button if modified code is available */}
                {msg.modifiedCode && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <button
                      onClick={() => handleApplyCode(msg.modifiedCode!)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Code className="w-4 h-4" />
                      Code übernehmen
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  KI denkt nach...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Quick prompts - only show when no messages */}
      {messages.length === 0 && (
        <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt)}
                className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300 transition-colors whitespace-nowrap flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="z.B. 'Ändere die Geschwindigkeit auf 25 WPM'"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Frag die KI nach Code-Änderungen oder Erklärungen. Der angepasste Code kann direkt übernommen werden.
        </p>
      </form>
    </div>
  );
}
