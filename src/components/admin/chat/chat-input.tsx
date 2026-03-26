'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, ChevronDown } from 'lucide-react';

// ─── Models ───────────────────────────────────────────
export const MODELS = [
  {
    id: '@cf/meta/llama-3.1-8b-instruct-fast',
    label: 'Llama 3.1 8B',
    badge: 'Fast',
    provider: 'Cloudflare',
  },
  {
    id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    label: 'Llama 3.3 70B',
    badge: 'Pro',
    provider: 'Cloudflare',
  },
] as const;

export type ModelId = (typeof MODELS)[number]['id'];

// ─── Props ────────────────────────────────────────────
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────
export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  selectedModel,
  onModelChange,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) onSubmit();
    }
  };

  const canSubmit = value.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 py-3">
      {/* Input row */}
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte qualquer coisa..."
            rows={1}
            disabled={disabled}
            className="w-full bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 placeholder-slate-500 disabled:opacity-50 transition-all"
            style={{ minHeight: '48px', maxHeight: '160px' }}
          />
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="absolute right-2 bottom-2 h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/15"
            aria-label="Enviar mensagem"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom bar — model selector + hints */}
      <div className="flex items-center justify-between max-w-3xl mx-auto mt-2 px-1">
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value as ModelId)}
            className="appearance-none bg-transparent border border-slate-700/40 text-slate-400 text-[11px] rounded-md pl-2 pr-6 py-1 cursor-pointer hover:text-slate-300 hover:border-slate-600 transition-colors focus:outline-none"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.badge})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
        </div>
        <span className="text-[10px] text-slate-600">
          Enter envia · Shift+Enter nova linha
        </span>
      </div>
    </div>
  );
}
