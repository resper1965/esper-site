'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  BarChart3, 
  Settings, 
  Key,
  MessageSquare,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from '@/lib/cloudflare';
import { useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}

const navItems: NavItem[] = [
  { 
    href: '/admin/generate', 
    label: 'Gerar Conteúdo', 
    icon: Sparkles, 
    title: 'Gerador de Posts com IA', 
    subtitle: 'Crie conteúdo de alta qualidade usando IA generativa' 
  },
  { 
    href: '/admin/analytics', 
    label: 'Analytics', 
    icon: BarChart3, 
    title: 'Analytics', 
    subtitle: 'Estatísticas detalhadas dos posts e performance' 
  },
  { 
    href: '/admin/ai-gateway', 
    label: 'AI Gateway', 
    icon: Key, 
    title: 'AI Gateway', 
    subtitle: 'Configure e gerencie o acesso aos modelos de IA via Vercel AI Gateway' 
  },
  { 
    href: '/admin/chat', 
    label: 'AI Chat', 
    icon: MessageSquare, 
    title: 'AI Chat', 
    subtitle: 'Converse com modelos de IA via AI Gateway' 
  },
  { 
    href: '/admin/settings', 
    label: 'Configurações', 
    icon: Settings, 
    title: 'Configurações', 
    subtitle: 'Gerencie variáveis de ambiente e configurações do sistema' 
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:flex-col lg:border-r lg:border-slate-800 lg:bg-slate-900 transition-all duration-300',
        collapsed ? 'lg:w-16' : 'lg:w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-slate-200">Painel Admin</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    collapsed ? 'mx-auto' : 'mr-3',
                    isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3 space-y-1">
        <Link
          href="/"
          className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title={collapsed ? 'Voltar para o Site' : undefined}
        >
          <Home
            className={cn(
              'h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-slate-200 transition-colors',
              collapsed ? 'mx-auto' : 'mr-3'
            )}
          />
          {!collapsed && <span>Voltar para o Site</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors"
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut
            className={cn(
              'h-5 w-5 flex-shrink-0 text-red-400',
              collapsed ? 'mx-auto' : 'mr-3'
            )}
          />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}

