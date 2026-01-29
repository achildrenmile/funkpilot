import { Plus, X } from 'lucide-react';
import type { ChatConversation } from '../types';
import ChatListItem from './ChatListItem';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    onClose(); // Close sidebar on mobile after selection
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3 md:hidden">
          <h3 className="font-medium text-slate-200">Chat-Verlauf</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Neuer Chat</span>
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-slate-500 text-sm">
              Noch keine Chats vorhanden.
            </p>
            <p className="text-slate-600 text-xs mt-1">
              Starte einen neuen Chat!
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ChatListItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onSelect={() => handleSelectConversation(conv.id)}
              onDelete={() => onDeleteConversation(conv.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700 text-xs text-slate-500 text-center">
        {conversations.length} / 50 Chats
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - always visible */}
      <div className="hidden md:flex w-64 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex-col">
        {sidebarContent}
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-slate-800 z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
