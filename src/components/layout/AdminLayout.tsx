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
    <div className="flex min-h-screen flex-col bg-grey-50" suppressHydrationWarning>
      <style jsx global>{`
        html {
          color-scheme: light;
        }
        body {
          background-color: #fafafa;
        }
      `}</style>

      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-grey-200 lg:bg-white">
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-6">
              <h2 className="text-xs font-semibold text-grey-400 uppercase tracking-wider mb-3">
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
                        group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all
                        ${
                          item.current
                            ? 'bg-grey-900 text-white shadow-sm'
                            : 'text-grey-700 hover:bg-grey-50 hover:text-grey-900'
                        }
                      `}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                          item.current ? 'text-white' : 'text-grey-400 group-hover:text-grey-600'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="border-t border-grey-200 p-4 bg-grey-50">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500" />
              Sair
            </button>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-grey-200 z-50 shadow-lg">
          <nav className="flex justify-around safe-area-bottom">
            {navigation.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                    item.current
                      ? 'text-grey-900 bg-grey-50'
                      : 'text-grey-500 hover:text-grey-900 hover:bg-grey-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-[10px]">{item.name}</span>
                </Link>
              );
            })}
            <Link
              href="/admin/settings"
              className={`flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                pathname === '/admin/settings' || pathname === '/admin/ai-gateway'
                  ? 'text-grey-900 bg-grey-50'
                  : 'text-grey-500 hover:text-grey-900 hover:bg-grey-50'
              }`}
            >
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-[10px]">Mais</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-grey-50 pb-20 lg:pb-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
