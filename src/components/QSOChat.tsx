import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, Loader2, AlertCircle, Wrench, ChevronDown, Menu, ExternalLink, X, Search, Radio, Sparkles, Globe, User } from 'lucide-react';
import ReactMarkdown, { Components } from 'react-markdown';
import { sendChatMessageStream, sendChatMessageWithStatus, ChatProvider } from '../services/claude';
import { checkHealth } from '../services/api';
import { useChatHistory } from '../hooks/useChatHistory';
import ChatSidebar from './ChatSidebar';
import { QUICK_QUESTIONS } from '../data/phrases';
import type { UserSettings, SolarData, ChatMessage } from '../types';

interface ExtendedChatMessage extends ChatMessage {
  provider?: string;
  toolsUsed?: string[];
}

interface QSOChatProps {
  settings: UserSettings;
  solarData: SolarData | null;
}

const PROVIDER_OPTIONS: { id: ChatProvider; name: string; description: string }[] = [
  { id: 'auto', name: 'Auto (Empfohlen)', description: 'Groq + Ham Radio Tools mit Fallback' },
  { id: 'groq-mcp', name: 'Groq + Ham Radio Tools', description: 'Mit Berechnungs-Tools' },
  { id: 'standard', name: 'Standard Chat', description: 'Ohne spezielle Tools' },
];

export default function QSOChat({ settings, solarData }: QSOChatProps) {
  const {
    conversations,
    activeConversation,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    clearActiveConversation,
  } = useChatHistory();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [hasGroqKey, setHasGroqKey] = useState(false);
  const [provider, setProvider] = useState<ChatProvider>('auto');
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingExternalLink, setPendingExternalLink] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if URL is external (not our domain)
  const isExternalLink = useCallback((url: string): boolean => {
    try {
      const linkUrl = new URL(url, window.location.origin);
      return linkUrl.origin !== window.location.origin;
    } catch {
      return false;
    }
  }, []);

  // Custom link renderer for ReactMarkdown
  const markdownComponents: Components = {
    a: ({ href, children }) => {
      const url = href || '';
      const external = isExternalLink(url);

      if (external) {
        return (
          <button
            onClick={() => setPendingExternalLink(url)}
            className="text-sky-400 hover:text-sky-300 underline inline-flex items-center gap-1"
          >
            {children}
            <ExternalLink className="w-3 h-3" />
          </button>
        );
      }

      return (
        <a href={url} className="text-sky-400 hover:text-sky-300 underline">
          {children}
        </a>
      );
    },
  };

  // Get messages from active conversation
  const messages: ExtendedChatMessage[] = activeConversation?.messages || [];

  // Check API availability on mount
  useEffect(() => {
    checkHealth()
      .then(health => {
        setApiAvailable(health.hasGroqKey || health.hasAnthropicKey || health.hasOpenRouterKey);
        setHasGroqKey(health.hasGroqKey);
        // Default to standard if no Groq key
        if (!health.hasGroqKey && provider === 'auto') {
          setProvider('standard');
        }
      })
      .catch(() => {
        setApiAvailable(false);
      });
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Streaming message state
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Status tracking for transparent processing
  const [currentStatus, setCurrentStatus] = useState<{ status: string; detail?: string } | null>(null);
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const sendMessageToChat = async (text: string) => {
    if (!text.trim()) return;

    // Create conversation if none exists
    if (!activeConversation) {
      createConversation();
    }

    const userMessage: ExtendedChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    setError(null);
    setStreamingContent('');
    setCurrentStatus(null);
    setCompletedActions([]);

    try {
      // Use streaming with status updates for MCP (tools need status feedback)
      if (provider === 'groq-mcp' || provider === 'auto') {
        const stream = sendChatMessageWithStatus(
          text.trim(),
          messages,
          {
            userCall: settings.callsign,
            userLocator: settings.locator,
            solarData: solarData || undefined,
          },
          provider
        );

        for await (const update of stream) {
          if (update.type === 'status') {
            setCurrentStatus({ status: update.status || '', detail: update.detail });
            // Track completed actions
            if (update.status && !['thinking', 'ai_processing', 'fallback'].includes(update.status)) {
              setCompletedActions(prev => [...prev, update.detail || update.status || '']);
            }
          } else if (update.type === 'complete') {
            setCurrentStatus(null);
            const assistantMessage: ExtendedChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: update.content || '',
              timestamp: new Date(),
              provider: update.provider,
              toolsUsed: update.toolsUsed,
            };
            addMessage(assistantMessage);
          } else if (update.type === 'error') {
            throw new Error(update.error || 'Unbekannter Fehler');
          }
        }
      } else {
        // Streaming for standard provider
        setIsStreaming(true);
        let fullContent = '';

        const stream = sendChatMessageStream(
          text.trim(),
          messages,
          {
            userCall: settings.callsign,
            userLocator: settings.locator,
            solarData: solarData || undefined,
          }
        );

        for await (const chunk of stream) {
          if (chunk.error) {
            throw new Error(chunk.error);
          }
          if (chunk.content) {
            fullContent += chunk.content;
            setStreamingContent(fullContent);
          }
          if (chunk.done) break;
        }

        setIsStreaming(false);
        setStreamingContent('');

        const assistantMessage: ExtendedChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date(),
          provider: 'groq-stream',
        };

        addMessage(assistantMessage);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
      setIsStreaming(false);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageToChat(input);
  };

  const handleClearHistory = () => {
    if (confirm('Aktuellen Chat-Verlauf wirklich löschen?')) {
      clearActiveConversation();
    }
  };

  const handleNewChat = () => {
    createConversation();
  };

  return (
    <div className="flex h-[calc(100vh-200px)] sm:h-[calc(100vh-220px)] min-h-[400px] sm:min-h-[500px]">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversation?.id || null}
        onNewChat={handleNewChat}
        onSelectConversation={switchConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-4">
        {/* Header */}
        <div className="mb-4 sm:mb-5 px-1">
          {/* Top row: Menu, Title, Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2.5 sm:p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Chat-Verlauf"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                {activeConversation?.title || 'QSO-Assistent'}
              </h2>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Provider Selector */}
            <div className="relative">
              <button
                onClick={() => setShowProviderMenu(!showProviderMenu)}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm transition-colors"
                title="KI-Provider wählen"
              >
                {provider === 'groq-mcp' || (provider === 'auto' && hasGroqKey) ? (
                  <Wrench className="w-4 h-4 text-amber-400" />
                ) : null}
                <span className="hidden sm:inline">
                  {PROVIDER_OPTIONS.find(p => p.id === provider)?.name || 'Auto'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showProviderMenu && (
                <div className="absolute right-0 top-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 min-w-[220px]">
                  {PROVIDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setProvider(opt.id);
                        setShowProviderMenu(false);
                      }}
                      disabled={opt.id !== 'standard' && !hasGroqKey}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                        provider === opt.id ? 'bg-slate-600' : ''
                      } ${opt.id !== 'standard' && !hasGroqKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {opt.id === 'groq-mcp' && <Wrench className="w-4 h-4 text-amber-400" />}
                        <span className="font-medium">{opt.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                      {opt.id !== 'standard' && !hasGroqKey && (
                        <p className="text-xs text-red-400 mt-0.5">GROQ_API_KEY erforderlich</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-2.5 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Verlauf löschen"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            </div>
          </div>
          {/* Subtitle - separate row */}
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Frag mich zu Amateurfunk, Rufzeichen in OE, Propagation und mehr
          </p>
        </div>

        {/* API Availability Warning */}
        {apiAvailable === false && (
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mb-4 flex items-start gap-3 mx-1">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200 font-medium">KI-Backend nicht verfügbar</p>
              <p className="text-amber-300/80 text-sm">
                Bitte GROQ_API_KEY konfigurieren.
              </p>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-4 mx-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Hallo, hier ist FunkPilot!</h3>
              <p className="text-slate-400 text-sm max-w-md">
                Ich bin dein OM für alle Amateurfunk-Fragen. Propagation, Antennen, Contests,
                Digimodes – frag mich einfach! 73 de FunkPilot
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
                  className={`max-w-[95%] sm:max-w-[85%] md:max-w-[75%] rounded-xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-50">
                    <span>
                      {message.timestamp.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.toolsUsed && message.toolsUsed.length > 0 && (
                      <span className="flex items-center gap-1 text-amber-400/70">
                        <Wrench className="w-3 h-3" />
                        {message.toolsUsed.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-mono">
                      {settings.callsign?.toUpperCase() === 'OE8PPL' ? 'OL' : (settings.callsign?.slice(0, 2) || 'OM')}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Streaming content display */}
          {isStreaming && streamingContent && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">AI</span>
              </div>
              <div className="max-w-[95%] sm:max-w-[85%] md:max-w-[75%] rounded-xl px-4 py-3 bg-slate-700 text-slate-100">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown components={markdownComponents}>{streamingContent}</ReactMarkdown>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs opacity-50">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Schreibt...</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator with status updates */}
          {isLoading && !isStreaming && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">AI</span>
              </div>
              <div className="bg-slate-700 rounded-xl px-4 py-3 min-w-[200px]">
                {/* Show completed actions */}
                {completedActions.length > 0 && (
                  <div className="space-y-1.5 mb-3 pb-3 border-b border-slate-600">
                    {completedActions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-green-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Current status */}
                <div className="flex items-center gap-2">
                  {currentStatus?.status === 'web_search' && (
                    <Globe className="w-4 h-4 text-sky-400 animate-pulse" />
                  )}
                  {currentStatus?.status === 'callsign_lookup' && (
                    <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                  )}
                  {currentStatus?.status === 'checking_availability' && (
                    <Search className="w-4 h-4 text-purple-400 animate-pulse" />
                  )}
                  {currentStatus?.status === 'generating_suggestions' && (
                    <User className="w-4 h-4 text-green-400 animate-pulse" />
                  )}
                  {currentStatus?.status === 'ai_processing' && (
                    <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
                  )}
                  {(!currentStatus || currentStatus?.status === 'thinking' || currentStatus?.status === 'fallback') && (
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  )}
                  <span className="text-sm text-slate-300">
                    {currentStatus?.detail || currentStatus?.status || 'Verarbeite...'}
                  </span>
                </div>
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
          <div className="mt-4 flex flex-wrap gap-2 mx-1">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => sendMessageToChat(q.text)}
                disabled={isLoading || apiAvailable === false}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                {q.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 mx-1">
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

      {/* External Link Warning Modal */}
      {pendingExternalLink && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setPendingExternalLink(null)}
        >
          <div
            className="bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Externe Webseite</h3>
              </div>
              <button
                onClick={() => setPendingExternalLink(null)}
                className="p-1 rounded hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-300 mb-3">
              Du verlässt jetzt FunkPilot und wirst zu einer externen Webseite weitergeleitet:
            </p>

            <div className="bg-slate-900 rounded-lg px-3 py-2 mb-4 break-all">
              <code className="text-sky-400 text-sm">{pendingExternalLink}</code>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              Gemäß DSGVO/ECG weisen wir darauf hin, dass für externe Webseiten deren eigene
              Datenschutzbestimmungen gelten. FunkPilot übernimmt keine Haftung für externe Inhalte.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPendingExternalLink(null)}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  window.open(pendingExternalLink, '_blank', 'noopener,noreferrer');
                  setPendingExternalLink(null);
                }}
                className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Öffnen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
