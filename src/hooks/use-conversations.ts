'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// ─── Constants ────────────────────────────────────────
const STORAGE_KEY = 'esper-admin-conversations';
const MAX_TITLE_LENGTH = 60;

function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/\n/g, ' ').trim();
  if (cleaned.length <= MAX_TITLE_LENGTH) return cleaned;
  return cleaned.slice(0, MAX_TITLE_LENGTH - 1) + '…';
}

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations: Conversation[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // localStorage full — silently fail
  }
}

// ─── Hook ─────────────────────────────────────────────
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const initialized = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const loaded = loadConversations();
    setConversations(loaded);
    if (loaded.length > 0) {
      setActiveId(loaded[0].id);
    }
  }, []);

  // Persist on change (debounced via microtask)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!initialized.current) return;
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveConversations(conversations);
    }, 300);
    return () => clearTimeout(saveTimeout.current);
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const createConversation = useCallback((model: string) => {
    const now = Date.now();
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: 'Nova conversa',
      model,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    return conv.id;
  }, []);

  const addMessage = useCallback(
    (conversationId: string, role: 'user' | 'assistant', text: string) => {
      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        role,
        text,
        timestamp: Date.now(),
      };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const updated = {
            ...c,
            messages: [...c.messages, msg],
            updatedAt: Date.now(),
          };
          // Auto-title from first user message
          if (role === 'user' && c.messages.filter((m) => m.role === 'user').length === 0) {
            updated.title = generateTitle(text);
          }
          return updated;
        })
      );
      return msg;
    },
    []
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (activeId === id) {
          setActiveId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });
    },
    [activeId]
  );

  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveId(null);
  }, []);

  const switchConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const updateModel = useCallback((conversationId: string, model: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, model } : c))
    );
  }, []);

  return {
    conversations,
    activeConversation,
    activeId,
    createConversation,
    addMessage,
    deleteConversation,
    clearAll,
    switchConversation,
    updateModel,
  };
}
