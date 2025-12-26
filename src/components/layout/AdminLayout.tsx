'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BarChart3, LogOut, Sparkles } from 'lucide-react';
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
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

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
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${
                      item.current
                        ? 'bg-grey-900 text-white'
                        : 'text-grey-700 hover:bg-grey-100 hover:text-grey-900'
                    }
                  `}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      item.current ? 'text-white' : 'text-grey-400 group-hover:text-grey-600'
                    }`}
                  />
                  {item.name}
                </a>
              );
            })}
          </nav>

          <div className="border-t border-grey-200 p-4">
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-grey-200 z-50">
          <nav className="flex justify-around">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center py-3 text-xs font-medium ${
                    item.current
                      ? 'text-grey-900 bg-grey-50'
                      : 'text-grey-500 hover:text-grey-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  {item.name}
                </a>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center py-3 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mb-1" />
              Sair
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-grey-50 pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
