import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../services/claude';
import { checkHealth } from '../services/api';
import { getChatHistory, saveChatHistory, clearChatHistory } from '../utils/storage';
import { QUICK_QUESTIONS } from '../data/phrases';
import type { UserSettings, SolarData, ChatMessage } from '../types';

interface QSOChatProps {
  settings: UserSettings;
  solarData: SolarData | null;
}

export default function QSOChat({ settings, solarData }: QSOChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check API availability on mount
  useEffect(() => {
    checkHealth()
      .then(health => {
        setApiAvailable(health.hasAnthropicKey || health.hasOpenRouterKey);
      })
      .catch(() => {
        setApiAvailable(false);
      });
  }, []);

  // Load chat history on mount
  useEffect(() => {
    const history = getChatHistory();
    setMessages(history);
  }, []);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(
        text.trim(),
        messages,
        {
          userCall: settings.callsign,
          userLocator: settings.locator,
          solarData: solarData || undefined,
        }
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClearHistory = () => {
    if (confirm('Chat-Verlauf wirklich löschen?')) {
      setMessages([]);
      clearChatHistory();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">QSO-Assistent</h2>
          <p className="text-slate-400 text-sm">
            Frag mich zu Amateurfunk, Propagation, Technik und mehr
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Verlauf löschen"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* API Availability Warning */}
      {apiAvailable === false && (
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-200 font-medium">KI-Backend nicht verfügbar</p>
            <p className="text-amber-300/80 text-sm">
              Bitte starte den Server mit konfigurierten API-Keys (ANTHROPIC_API_KEY oder OPENROUTER_API_KEY).
            </p>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Willkommen beim QSO-Assistenten</h3>
            <p className="text-slate-400 text-sm max-w-md">
              Ich bin dein KI-Assistent für Amateurfunk-Fragen. Frag mich zu Propagation,
              Technik, Betriebsverfahren oder Contest-Tipps.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">AI</span>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                <p className="text-xs opacity-50 mt-2">
                  {message.timestamp.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-mono">
                    {settings.callsign?.slice(0, 2) || 'OM'}
                  </span>
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">AI</span>
            </div>
            <div className="bg-slate-700 rounded-xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => sendMessage(q.text)}
              disabled={isLoading || apiAvailable === false}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              {q.text}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stelle eine Frage..."
            disabled={isLoading || apiAvailable === false}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || apiAvailable === false}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
