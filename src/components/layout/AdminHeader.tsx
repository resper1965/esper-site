'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 border-b border-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-slate-100">
            Painel Administrativo
          </h1>
        </div>
        <Link
          href="/"
          className="flex items-center space-x-2 text-sm font-medium text-slate-300 transition-colors hover:text-slate-100"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Voltar para o Site</span>
        </Link>
      </div>
    </header>
  );
}

