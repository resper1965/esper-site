'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchPosts, type SearchResult } from '@/lib/supabase/search';
import { PageBackground } from '@/components/ui/page-background';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage({ params }: { params: { lang: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const lang = params.lang as 'pt-br' | 'en';

  // Buscar ao carregar se houver query na URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim()) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const searchResults = await searchPosts(searchQuery, lang);
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
      // Atualizar URL
      router.push(`/${lang}/busca?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  }, [query, lang, router]);

  const texts = {
    'pt-br': {
      title: 'Buscar Posts',
      placeholder: 'Digite sua busca...',
      button: 'Buscar',
      noResults: 'Nenhum resultado encontrado',
      resultsCount: (count: number) => `${count} resultado${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`,
      readMore: 'Ler mais',
    },
    'en': {
      title: 'Search Posts',
      placeholder: 'Type your search...',
      button: 'Search',
      noResults: 'No results found',
      resultsCount: (count: number) => `${count} result${count !== 1 ? 's' : ''} found`,
      readMore: 'Read more',
    },
  };

  const t = texts[lang];

  return (
    <PageBackground>
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-grey-50 mb-4">{t.title}</h1>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-12">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.placeholder}
                className="w-full px-6 py-4 pr-32 text-grey-50 bg-grey-900/50 border border-grey-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent backdrop-blur-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-cyan text-grey-950 font-medium rounded-md hover:bg-cyan/90 disabled:bg-grey-700 disabled:text-grey-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                {t.button}
              </button>
            </div>
          </form>

          {/* Results */}
          {searched && (
            <div>
              {/* Results Count */}
              {!loading && (
                <div className="mb-6 text-grey-400">
                  {t.resultsCount(results.length)}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-cyan animate-spin" />
                </div>
              )}

              {/* No Results */}
              {!loading && results.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-grey-600 mx-auto mb-4" />
                  <p className="text-xl text-grey-400">{t.noResults}</p>
                </div>
              )}

              {/* Results List */}
              {!loading && results.length > 0 && (
                <div className="space-y-6">
                  {results.map((result) => (
                    <Link
                      key={result.slug}
                      href={`/${lang}/blog/${result.slug}`}
                      className="block group"
                    >
                      <article className="bg-grey-900/30 border border-grey-800 rounded-lg p-6 hover:border-cyan/50 transition-all">
                        <div className="flex items-start gap-4">
                          {result.coverImage && (
                            <img
                              src={result.coverImage}
                              alt={result.title}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-grey-50 mb-2 group-hover:text-cyan transition-colors">
                              {result.title}
                            </h2>
                            <p className="text-grey-400 mb-3 line-clamp-2">
                              {result.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-grey-500">
                              <span className="px-2 py-1 bg-grey-800 rounded">
                                {result.category}
                              </span>
                              <span>{result.date}</span>
                              <span className="text-cyan group-hover:underline">
                                {t.readMore} →
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}
