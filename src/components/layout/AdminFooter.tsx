'use client';

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-slate-400">
          © {currentYear} Painel Administrativo - Ricardo Esper Blog
        </p>
      </div>
    </footer>
  );
}

