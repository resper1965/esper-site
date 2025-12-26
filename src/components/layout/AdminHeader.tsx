'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-100">
              {title || 'Painel Administrativo'}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="flex items-center space-x-2 text-sm font-medium text-slate-300 transition-colors hover:text-slate-100 ml-4"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar para o Site</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

