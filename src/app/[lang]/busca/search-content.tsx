'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchPosts, type SearchResult } from '@/lib/supabase/search';
import { PageBackground } from '@/components/ui/page-background';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SearchContentProps {
  lang: string;
}

export default function SearchContent({ lang }: SearchContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const currentLang = (lang || 'pt-br') as 'pt-br' | 'en';

  // Buscar ao carregar se houver query na URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim()) {
      setQuery(q);
      performSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const searchResults = await searchPosts(searchQuery, currentLang);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
      router.push(`/${currentLang}/busca?q=${encodeURIComponent(query)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentLang, router]);

  return (
    <PageBackground>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 sm:mb-8">
            {currentLang === 'pt-br' ? 'Buscar Posts' : 'Search Posts'}
          </h1>

          {/* Formulário de busca */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={currentLang === 'pt-br' ? 'Digite sua busca...' : 'Enter your search...'}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-foreground"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  currentLang === 'pt-br' ? 'Buscar' : 'Search'
                )}
              </button>
            </div>
          </form>

          {/* Resultados */}
          {searched && (
            <div className="mt-8">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {currentLang === 'pt-br' ? 'Buscando...' : 'Searching...'}
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground mb-4">
                    {currentLang === 'pt-br' 
                      ? `Encontrados ${results.length} resultado(s)` 
                      : `Found ${results.length} result(s)`}
                  </p>
                  {results.map((result) => (
                    <Link
                      key={result.slug}
                      href={`/${currentLang}/blog/${result.slug}`}
                      className="block p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {result.title}
                      </h3>
                      {result.excerpt && (
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {result.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{result.category}</span>
                        <span>•</span>
                        <span>{result.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                    {currentLang === 'pt-br' 
                      ? 'Nenhum resultado encontrado' 
                      : 'No results found'}
                  </p>
                  <p className="text-muted-foreground/70 mt-2">
                    {currentLang === 'pt-br' 
                      ? 'Tente usar palavras-chave diferentes' 
                      : 'Try using different keywords'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Estado inicial */}
          {!searched && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-lg">
                {currentLang === 'pt-br' 
                  ? 'Digite sua busca acima' 
                  : 'Enter your search above'}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}

