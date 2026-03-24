'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Trash2, Bot, User, Loader2, ChevronDown } from 'lucide-react';

const MODELS = [
  { id: 'google/gemini-2.5-flash', label: 'Gemini Flash', provider: 'Google' },
  { id: 'google/gemini-2.5-pro', label: 'Gemini Pro', provider: 'Google' },
  { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet', provider: 'Anthropic' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
] as const;

type ModelId = (typeof MODELS)[number]['id'];

/** Extract the text content from a UIMessage's parts array */
function getMessageText(msg: { parts: Array<{ type: string; text?: string }> }): string {
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export default function AdminChatPage() {
  const [selectedModel, setSelectedModel] = useState<ModelId>(MODELS[0].id);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/admin/chat',
        body: { model: selectedModel },
      }),
    [selectedModel],
  );

  const {
    messages,
    sendMessage,
    status,
    setMessages,
    error,
  } = useChat({ transport });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const currentModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelId)}
            className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-primary focus:border-primary cursor-pointer hover:bg-slate-700 transition-colors"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.provider} — {m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpar
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <Bot className="h-10 w-10 text-slate-600" />
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Converse com a IA
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Usando{' '}
                <span className="text-primary/80">
                  {currentModel.provider} {currentModel.label}
                </span>{' '}
                via AI Gateway
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary/15 text-slate-100'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              {getMessageText(msg)}
            </div>

            {msg.role === 'user' && (
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="h-4 w-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-slate-800 rounded-xl px-4 py-2.5">
              <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3 text-sm text-red-400">
            Erro: {error.message}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 pt-3"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          rows={1}
          className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 resize-none focus:ring-primary focus:border-primary focus:outline-none placeholder-slate-500 max-h-32"
          style={{ minHeight: '44px' }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
