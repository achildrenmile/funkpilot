import { Trash2, MessageSquare } from 'lucide-react';
import type { ChatConversation } from '../types';

interface ChatListItemProps {
  conversation: ChatConversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;

  return date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' });
}

export default function ChatListItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ChatListItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Diese Konversation wirklich löschen?')) {
      onDelete();
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group relative ${
        isActive
          ? 'bg-sky-600/20 border border-sky-500/50'
          : 'hover:bg-slate-700/50 border border-transparent'
      }`}
    >
      <div className="flex items-start gap-2 pr-8">
        <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium truncate ${isActive ? 'text-sky-100' : 'text-slate-200'}`}>
            {conversation.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatRelativeTime(conversation.updatedAt)}
            {conversation.messages.length > 0 && (
              <span className="ml-2">{conversation.messages.length} Nachrichten</span>
            )}
          </p>
        </div>
      </div>

      {/* Delete button - always visible */}
      <button
        onClick={handleDelete}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 active:bg-red-500/30 transition-colors"
        title="Löschen"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </button>
  );
}
