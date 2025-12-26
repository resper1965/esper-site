'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, LayoutDashboard, Sparkles, BarChart3, Settings, Key } from 'lucide-react';
import { signOut } from '@/lib/supabase/auth';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, title: 'Dashboard', subtitle: 'Visão geral do sistema de geração de conteúdo' },
    { href: '/admin/generate', label: 'Gerar Conteúdo', icon: Sparkles, title: 'Gerador de Posts com IA', subtitle: 'Crie conteúdo de alta qualidade usando IA generativa' },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, title: 'Analytics', subtitle: 'Estatísticas detalhadas dos posts e performance' },
    { href: '/admin/ai-gateway', label: 'AI Gateway', icon: Key, title: 'AI Gateway', subtitle: 'Gerencie e monitore o acesso aos modelos de IA através do Vercel AI Gateway' },
    { href: '/admin/settings', label: 'Configurações', icon: Settings, title: 'Configurações', subtitle: 'Gerencie variáveis de ambiente e configurações do sistema' },
  ];

  // Encontrar o item de navegação atual para obter título e subtítulo
  const currentNavItem = navItems.find(item => {
    if (item.href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(item.href);
  });

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
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-slate-800 lg:bg-slate-900">
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Navegação
              </h2>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        group flex items-center px-2.5 py-2 text-sm font-medium rounded-lg transition-all
                        ${
                          isActive
                            ? 'bg-primary/10 text-primary border-l-2 border-primary'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                        }
                      `}
                    >
                      <Icon
                        className={`mr-2.5 h-4 w-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="border-t border-slate-800 p-3 bg-slate-900">
            <Link
              href="/"
              className="group flex items-center px-2.5 py-2 text-sm font-medium rounded-lg transition-all text-slate-300 hover:bg-slate-800 hover:text-slate-100 mb-2"
            >
              <Home className="mr-2.5 h-4 w-4 flex-shrink-0 transition-colors text-slate-400 group-hover:text-slate-200" />
              Voltar para o Site
            </Link>
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-2.5 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="mr-2.5 h-4 w-4 flex-shrink-0 text-red-400" />
              Sair
            </button>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 shadow-lg">
          <nav className="flex justify-around safe-area-bottom">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
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
                  <span className="text-[10px]">{item.label.split(' ')[0]}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors text-red-400 hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4 mb-0.5" />
              <span className="text-[10px]">Sair</span>
            </button>
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
