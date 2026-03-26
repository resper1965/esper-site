'use client';

import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Copy, Check } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/hooks/use-conversations';

// ─── Relative time ────────────────────────────────────
function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ─── Code block with copy ─────────────────────────────
function CodeBlock({ language, children }: { language?: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-slate-700/50">
      {/* Language label + copy button */}
      <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 text-xs">
        <span className="text-slate-400">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Copiar código"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'rgb(15 23 42 / 0.6)',
          fontSize: '0.8125rem',
          lineHeight: '1.6',
        }}
        wrapLongLines
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Message component ────────────────────────────────
interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group flex gap-3 px-4 py-4 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-slate-800/30'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <User className="h-3.5 w-3.5 text-white" />
          </div>
        ) : (
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Role label + timestamp */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-slate-400">
            {isUser ? 'Você' : 'Assistente'}
          </span>
          <span className="text-[10px] text-slate-600">
            {relativeTime(message.timestamp)}
          </span>
        </div>

        {/* Message body */}
        {isUser ? (
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {message.text}
          </div>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none text-slate-200 prose-headings:text-slate-100 prose-code:text-emerald-400 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-100 prose-blockquote:border-slate-600 prose-blockquote:text-slate-400 prose-hr:border-slate-700 prose-table:text-slate-300 prose-th:text-slate-200 prose-td:border-slate-700 prose-th:border-slate-700">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  
                  if (match) {
                    return <CodeBlock language={match[1]}>{codeString}</CodeBlock>;
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                pre({ children }) {
                  return <>{children}</>;
                },
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        )}

        {/* Copy button (assistant only) */}
        {!isUser && (
          <button
            onClick={handleCopyMessage}
            className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Copiar resposta"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copiar</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});
