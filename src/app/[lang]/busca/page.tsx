import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SearchContent from './search-content';

// Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-grey-400" />
      </div>
    }>
      <SearchContent lang={lang || 'pt-br'} />
    </Suspense>
  );
}
