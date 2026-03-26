'use client';

import { useState, memo } from 'react';
import { Plus, MessageSquare, Trash2, Search, X } from 'lucide-react';
import type { Conversation } from '@/hooks/use-conversations';

// ─── Helpers ──────────────────────────────────────────
function formatDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  
  if (mins < 1) return 'Agora';
  if (mins < 60) return `${mins}m`;
  
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ─── Props ────────────────────────────────────────────
interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  collapsed: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onToggle: () => void;
}

// ─── Component ────────────────────────────────────────
export const ChatSidebar = memo(function ChatSidebar({
  conversations,
  activeId,
  collapsed,
  onSelect,
  onNew,
  onDelete,
  onToggle,
}: ChatSidebarProps) {
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = search
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3 gap-2 border-r border-slate-800 bg-slate-900/50 w-12">
        <button
          onClick={onNew}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Nova conversa"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Expandir conversas"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-slate-800">
        <button
          onClick={onNew}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors border border-primary/20"
        >
          <Plus className="h-4 w-4" />
          Nova conversa
        </button>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Recolher"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      {conversations.length > 3 && (
        <div className="px-3 pt-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-slate-500"
            />
          </div>
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            {search ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
          </div>
        )}

        {filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`group w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${
              activeId === conv.id
                ? 'bg-primary/10 border border-primary/20'
                : 'hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <MessageSquare
              className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                activeId === conv.id ? 'text-primary' : 'text-slate-500'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium truncate ${
                  activeId === conv.id ? 'text-slate-100' : 'text-slate-300'
                }`}
              >
                {conv.title}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {conv.messages.length} msg · {formatDate(conv.updatedAt)}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(conv.id, e)}
              className={`flex-shrink-0 p-1 rounded transition-all ${
                confirmDelete === conv.id
                  ? 'text-red-400 bg-red-950/30'
                  : 'text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100'
              }`}
              title={confirmDelete === conv.id ? 'Clique de novo para confirmar' : 'Excluir'}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </button>
        ))}
      </div>

      {/* Footer */}
      {conversations.length > 0 && (
        <div className="border-t border-slate-800 px-3 py-2">
          <p className="text-[10px] text-slate-600 text-center">
            {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
});
