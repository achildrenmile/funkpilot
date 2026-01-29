import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage, ChatConversation } from '../types';
import {
  getConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
  createNewConversation,
  migrateV1ChatHistory,
} from '../utils/storage';

export interface UseChatHistoryReturn {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  createConversation: () => ChatConversation;
  switchConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  updateConversationTitle: (id: string, title: string) => void;
  clearActiveConversation: () => void;
}

export function useChatHistory(): UseChatHistoryReturn {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Initialize: load conversations and handle migration
  useEffect(() => {
    let loadedConversations = getConversations();
    const savedActiveId = getActiveConversationId();

    // Check for v1 migration
    if (loadedConversations.length === 0) {
      const migratedConversation = migrateV1ChatHistory();
      if (migratedConversation) {
        loadedConversations = [migratedConversation];
        saveConversations(loadedConversations);
        setActiveConversationId(migratedConversation.id);
        setConversations(loadedConversations);
        setActiveId(migratedConversation.id);
        return;
      }
    }

    // Sort by updatedAt (newest first)
    loadedConversations.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    setConversations(loadedConversations);

    // Restore active conversation or default to first
    if (savedActiveId && loadedConversations.some(c => c.id === savedActiveId)) {
      setActiveId(savedActiveId);
    } else if (loadedConversations.length > 0) {
      setActiveId(loadedConversations[0].id);
      setActiveConversationId(loadedConversations[0].id);
    }
  }, []);

  // Get active conversation object
  const activeConversation = conversations.find(c => c.id === activeId) || null;

  // Create a new conversation
  const createConversation = useCallback(() => {
    const newConv = createNewConversation();
    const updated = [newConv, ...conversations];
    setConversations(updated);
    saveConversations(updated);
    setActiveId(newConv.id);
    setActiveConversationId(newConv.id);
    return newConv;
  }, [conversations]);

  // Switch to a different conversation
  const switchConversation = useCallback((id: string) => {
    if (conversations.some(c => c.id === id)) {
      setActiveId(id);
      setActiveConversationId(id);
    }
  }, [conversations]);

  // Delete a conversation
  const deleteConversation = useCallback((id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    saveConversations(updated);

    // If deleted active conversation, switch to another
    if (activeId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id);
        setActiveConversationId(updated[0].id);
      } else {
        setActiveId(null);
        setActiveConversationId(null);
      }
    }
  }, [conversations, activeId]);

  // Add a message to the active conversation
  const addMessage = useCallback((message: ChatMessage) => {
    if (!activeId) return;

    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id !== activeId) return conv;

        const updatedMessages = [...conv.messages, message];

        // Auto-generate title from first user message
        let title = conv.title;
        if (conv.title === 'Neuer Chat' && message.role === 'user') {
          title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
        }

        return {
          ...conv,
          messages: updatedMessages,
          title,
          updatedAt: new Date(),
        };
      });

      // Re-sort by updatedAt
      updated.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      saveConversations(updated);
      return updated;
    });
  }, [activeId]);

  // Update conversation title
  const updateConversationTitle = useCallback((id: string, title: string) => {
    setConversations(prev => {
      const updated = prev.map(conv =>
        conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv
      );
      saveConversations(updated);
      return updated;
    });
  }, []);

  // Clear messages from active conversation
  const clearActiveConversation = useCallback(() => {
    if (!activeId) return;

    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id !== activeId) return conv;
        return {
          ...conv,
          messages: [],
          title: 'Neuer Chat',
          updatedAt: new Date(),
        };
      });
      saveConversations(updated);
      return updated;
    });
  }, [activeId]);

  return {
    conversations,
    activeConversation,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    updateConversationTitle,
    clearActiveConversation,
  };
}
