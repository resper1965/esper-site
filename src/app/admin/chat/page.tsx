'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Sparkles, PanelLeftOpen, Code, Lightbulb, Shield } from 'lucide-react';
import { useConversations } from '@/hooks/use-conversations';
import { ChatSidebar } from '@/components/admin/chat/chat-sidebar';
import { ChatMessage } from '@/components/admin/chat/chat-message';
import { ChatInput, MODELS, type ModelId } from '@/components/admin/chat/chat-input';

// ─── Suggested prompts ────────────────────────────────
const SUGGESTIONS = [
  { icon: Lightbulb, text: 'Sugira 5 temas de blog sobre segurança em cloud', color: 'text-amber-400' },
  { icon: Code, text: 'Explique JWT vs Session-based auth com exemplos', color: 'text-cyan-400' },
  { icon: Shield, text: 'Dê um checklist de hardening para servidores Linux', color: 'text-emerald-400' },
  { icon: Sparkles, text: 'Crie uma meta description SEO para um post sobre OWASP', color: 'text-violet-400' },
] as const;

// ─── Page ─────────────────────────────────────────────
export default function AdminChatPage() {
  const {
    conversations,
    activeConversation,
    activeId,
    createConversation,
    addMessage,
    deleteConversation,
    switchConversation,
    updateModel,
  } = useConversations();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>(MODELS[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync model selector to active conversation
  useEffect(() => {
    if (activeConversation?.model) {
      setSelectedModel(activeConversation.model as ModelId);
    }
  }, [activeConversation?.model]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Keyboard shortcut — Ctrl+N for new chat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel]);

  const handleNewChat = useCallback(() => {
    createConversation(selectedModel);
    setInput('');
    setError(null);
  }, [createConversation, selectedModel]);

  const handleModelChange = useCallback(
    (model: ModelId) => {
      setSelectedModel(model);
      if (activeId) {
        updateModel(activeId, model);
      }
    },
    [activeId, updateModel]
  );

  // ─── Submit message ─────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    let convId = activeId;

    // Create conversation if none active
    if (!convId) {
      convId = createConversation(selectedModel);
    }

    // Add user message
    addMessage(convId, 'user', trimmed);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      // Build message history for API
      const currentConv = conversations.find((c) => c.id === convId);
      const existingMessages = currentConv?.messages ?? [];
      const allMessages = [
        ...existingMessages.map((m) => ({ role: m.role, content: m.text })),
        { role: 'user' as const, content: trimmed },
      ];

      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: allMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao consultar o modelo');
      }

      addMessage(convId, 'assistant', data.message || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, activeId, selectedModel, conversations, createConversation, addMessage]);

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  const messages = activeConversation?.messages ?? [];

  return (
    <div className="flex h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        collapsed={sidebarCollapsed}
        onSelect={switchConversation}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile sidebar toggle */}
        {sidebarCollapsed && (
          <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-slate-800">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-500 truncate">
              {activeConversation?.title || 'AI Chat'}
            </span>
          </div>
        )}

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
        >
          {messages.length === 0 ? (
            /* ─── Empty state ─────────────────────── */
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div className="relative mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/10">
                  <Bot className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>

              <h2 className="text-lg font-semibold text-slate-200 mb-1">
                AI Chat
              </h2>
              <p className="text-sm text-slate-500 mb-8 text-center max-w-md">
                Converse com modelos Llama via Cloudflare Workers AI.
                <br />
                Respostas com markdown, código e formatação rica.
              </p>

              {/* Suggestion cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s.text)}
                    className="group flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/70 hover:border-slate-600/50 transition-all text-left"
                  >
                    <s.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${s.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                      {s.text}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-slate-600 mt-6">
                Ctrl+N nova conversa · Modelo: {MODELS.find((m) => m.id === selectedModel)?.label}
              </p>
            </div>
          ) : (
            /* ─── Message list ───────────────────── */
            <div className="max-w-3xl mx-auto w-full">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3 px-4 py-4 bg-slate-800/30">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mx-4 my-3 bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />
      </div>
    </div>
  );
}
