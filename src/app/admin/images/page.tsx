'use client';

import { useState, useEffect } from 'react';

interface PostInfo {
  slug: string;
  title: string;
  category: string;
}

interface GenerationResult {
  slug: string;
  success: boolean;
  path?: string;
  error?: string;
}

export default function AdminImagesPage() {
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/generate-images-greyscale?list=true')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar posts:', err);
        setLoading(false);
      });
  }, []);

  const togglePost = (slug: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(slug)) {
      newSelected.delete(slug);
    } else {
      newSelected.add(slug);
    }
    setSelectedPosts(newSelected);
  };

  const selectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map(p => p.slug)));
    }
  };

  const generateImages = async () => {
    const toGenerate = selectedPosts.size > 0 
      ? posts.filter(p => selectedPosts.has(p.slug))
      : posts;
    
    setGenerating(true);
    setResults([]);
    
    for (const post of toGenerate) {
      try {
        const res = await fetch(`/api/generate-images-greyscale?slug=${post.slug}&download=true`);
        if (res.ok) {
          const data = await res.json();
          setResults(prev => [...prev, { slug: post.slug, success: true, path: data.path }]);
        } else {
          const error = await res.text();
          setResults(prev => [...prev, { slug: post.slug, success: false, error }]);
        }
      } catch (error) {
        setResults(prev => [...prev, { slug: post.slug, success: false, error: String(error) }]);
      }
    }
    
    setGenerating(false);
  };

  const categoryColors: Record<string, string> = {
    cybersecurity: 'bg-gray-700',
    counterespionage: 'bg-gray-600',
    forensics: 'bg-gray-800',
    compliance: 'bg-gray-500',
    homeautomation: 'bg-gray-600',
    travel: 'bg-gray-700',
    vida: 'bg-gray-500',
    general: 'bg-gray-600',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-xl">Carregando posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Gerador de Imagens</h1>
        <p className="text-gray-400 mb-8">
          Gere imagens em escala de cinza para os posts do blog
        </p>

        {/* Controles */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={selectAll}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            {selectedPosts.size === posts.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </button>
          <button
            onClick={generateImages}
            disabled={generating}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition font-medium"
          >
            {generating 
              ? `Gerando... (${results.length}/${selectedPosts.size || posts.length})`
              : `Gerar ${selectedPosts.size > 0 ? selectedPosts.size : 'Todas'} Imagens`
            }
          </button>
        </div>

        {/* Resultados da geração */}
        {results.length > 0 && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg">
            <h3 className="font-medium mb-2">Resultados:</h3>
            <div className="text-sm space-y-1">
              <div className="text-green-400">
                ✓ Sucesso: {results.filter(r => r.success).length}
              </div>
              {results.filter(r => !r.success).length > 0 && (
                <div className="text-red-400">
                  ✗ Falhas: {results.filter(r => !r.success).length}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de posts */}
        <div className="grid gap-4">
          {posts.map(post => {
            const result = results.find(r => r.slug === post.slug);
            return (
              <div
                key={post.slug}
                className={`p-4 rounded-lg border transition cursor-pointer ${
                  selectedPosts.has(post.slug)
                    ? 'bg-gray-800 border-gray-600'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => togglePost(post.slug)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                    selectedPosts.has(post.slug) 
                      ? 'bg-gray-500 border-gray-500' 
                      : 'border-gray-600'
                  }`}>
                    {selectedPosts.has(post.slug) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded ${categoryColors[post.category] || 'bg-gray-600'}`}>
                        {post.category}
                      </span>
                      {result && (
                        <span className={`text-xs ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                          {result.success ? '✓ Gerado' : '✗ Erro'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-200">{post.title}</h3>
                    <p className="text-sm text-gray-500">{post.slug}</p>
                  </div>

                  {/* Preview button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewSlug(previewSlug === post.slug ? null : post.slug);
                    }}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition"
                  >
                    {previewSlug === post.slug ? 'Fechar' : 'Preview'}
                  </button>
                </div>

                {/* Preview da imagem */}
                {previewSlug === post.slug && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-700">
                    <img
                      src={`/api/generate-images-greyscale?slug=${post.slug}`}
                      alt={`Preview: ${post.title}`}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-6 text-center text-gray-500">
          Total: {posts.length} posts
        </div>
      </div>
    </div>
  );
}
