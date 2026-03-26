'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/admin/sidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import { Sparkles, BarChart3, Settings, Key, MessageSquare } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/admin/generate', title: 'Gerar Conteúdo', subtitle: 'Crie conteúdo de alta qualidade usando IA generativa', icon: Sparkles },
  { href: '/admin/analytics', title: 'Analytics', subtitle: 'Estatísticas detalhadas dos posts e performance', icon: BarChart3 },
  { href: '/admin/ai-gateway', title: 'AI Gateway', subtitle: 'Configure Workers AI, Cloudflare AI Gateway e credenciais do stack de IA', icon: Key },
  { href: '/admin/chat', title: 'AI Chat', subtitle: 'Converse com modelos Llama executados na Cloudflare', icon: MessageSquare },
  { href: '/admin/settings', title: 'Configurações', subtitle: 'Gerencie variáveis de ambiente e configurações do sistema', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Encontrar o item de navegação atual para obter título e subtítulo
  const currentNavItem = navItems.find(item => {
    return pathname?.startsWith(item.href);
  });

  // Se estiver na rota /admin, redirecionar para /admin/generate
  if (pathname === '/admin') {
    return null; // O redirect será feito pelo page.tsx
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950" suppressHydrationWarning>
      <style jsx global>{`
        html {
          color-scheme: dark;
        }
        body {
          background-color: rgb(2 6 23);
        }
      `}</style>

      <AdminHeader 
        title={currentNavItem?.title}
        subtitle={currentNavItem?.subtitle}
      />

      <div className="flex flex-1">
        <Sidebar />

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 shadow-lg">
          <nav className="flex justify-around safe-area-bottom">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-slate-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-0.5" />
                  <span className="text-[10px]">{item.title.split(' ')[0]}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-slate-950 pb-16 lg:pb-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-5">
            {children}
          </div>
        </main>
      </div>

      <AdminFooter />
    </div>
  );
}
