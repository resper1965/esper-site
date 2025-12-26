'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, BarChart3, LogOut, Sparkles, Settings, Brain } from 'lucide-react';
import { signOut } from '@/lib/supabase/auth';
import Header from './Header';
import Footer from './Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: pathname === '/admin',
    },
    {
      name: 'Gerar Posts',
      href: '/admin/generate',
      icon: Sparkles,
      current: pathname === '/admin/generate',
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname === '/admin/analytics',
    },
    {
      name: 'AI Gateway',
      href: '/admin/ai-gateway',
      icon: Brain,
      current: pathname === '/admin/ai-gateway',
    },
    {
      name: 'Configurações',
      href: '/admin/settings',
      icon: Settings,
      current: pathname === '/admin/settings',
    },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 dark" suppressHydrationWarning>
      <style jsx global>{`
        html {
          color-scheme: dark;
        }
        body {
          background-color: rgb(2 6 23);
        }
      `}</style>

      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-slate-800 lg:bg-slate-900">
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Menu
              </h2>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group flex items-center px-2.5 py-2 text-sm font-medium rounded-lg transition-all
                        ${
                          item.current
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                        }
                      `}
                    >
                      <Icon
                        className={`mr-2.5 h-4 w-4 flex-shrink-0 transition-colors ${
                          item.current ? 'text-primary-foreground' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="border-t border-slate-800 p-3 bg-slate-900">
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
            {navigation.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                    item.current
                      ? 'text-primary bg-slate-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-0.5" />
                  <span className="text-[10px]">{item.name}</span>
                </Link>
              );
            })}
            <Link
              href="/admin/settings"
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                pathname === '/admin/settings' || pathname === '/admin/ai-gateway'
                  ? 'text-primary bg-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Settings className="h-4 w-4 mb-0.5" />
              <span className="text-[10px]">Mais</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-slate-950 pb-16 lg:pb-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-5">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
