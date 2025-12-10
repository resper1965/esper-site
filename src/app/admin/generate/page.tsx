'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';

interface GenerateResult {
  title: string;
  content: string;
  slug: string;
  score: number;
  filepath: string;
  preview: string;
}

export default function GenerateDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    topic: '',
    category: 'cybersecurity',
    keywords: ''
  });

  const [urlFormData, setUrlFormData] = useState({
    url: '',
    category: 'general',
    keywords: ''
  });

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setCheckingAuth(false);
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <AdminLayout>
        <div className="py-16 text-center">
          <p className="text-grey-600">Verificando autenticação...</p>
        </div>
      </AdminLayout>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formData.topic,
          category: formData.category,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
          sources: [] // Por enquanto vazio
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar post');
      }

      setResult(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromUrl = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlFormData.url,
          category: urlFormData.category,
          keywords: urlFormData.keywords.split(',').map(k => k.trim()).filter(Boolean)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar post da URL');
      }

      setResult(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-grey-900">
              Gerador de Posts com IA
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/admin/regenerate-image')}
                className="px-4 py-2 text-sm text-grey-700 hover:text-grey-900 border border-grey-300 rounded-lg"
              >
                🔄 Regenerar Imagem
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/admin/login');
                }}
                className="px-4 py-2 text-sm text-grey-700 hover:text-grey-900 border border-grey-300 rounded-lg"
              >
                Sair
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-grey-200">
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 font-medium text-grey-700 border-b-2 border-grey-900"
              >
                Gerar por Tema
              </button>
              <button
                className="px-4 py-2 font-medium text-grey-500 hover:text-grey-700"
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
              >
                Gerar de URL
              </button>
            </div>
          </div>

          <div className="bg-white border border-grey-200 rounded-lg p-8">
            {/* Form - Gerar de URL */}
            <div className="space-y-6 mb-8 pb-8 border-b border-grey-200">
              <h2 className="text-2xl font-bold text-grey-900 mb-4">
                📰 Gerar Post a partir de URL
              </h2>
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  URL do Artigo
                </label>
                <input
                  type="url"
                  value={urlFormData.url}
                  onChange={(e) => setUrlFormData({ ...urlFormData, url: e.target.value })}
                  placeholder="https://exemplo.com/artigo"
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-grey-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Categoria
                </label>
                <select
                  value={urlFormData.category}
                  onChange={(e) => setUrlFormData({ ...urlFormData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-grey-500"
                >
                  <option value="cybersecurity">Cibersegurança</option>
                  <option value="counterespionage">Contraespionagem</option>
                  <option value="homeautomation">Automação Residencial</option>
                  <option value="travel">Viagens</option>
                  <option value="general">Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Keywords (separadas por vírgula, opcional)
                </label>
                <input
                  type="text"
                  value={urlFormData.keywords}
                  onChange={(e) => setUrlFormData({ ...urlFormData, keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-grey-500"
                />
              </div>

              <button
                onClick={handleGenerateFromUrl}
                disabled={loading || !urlFormData.url}
                className="w-full bg-grey-900 text-white py-3 rounded-lg font-medium hover:bg-grey-800 disabled:bg-grey-400 disabled:cursor-not-allowed transition"
              >
                {loading ? '⏳ Lendo URL e gerando post...' : '🚀 Gerar Post da URL'}
              </button>
            </div>

            {/* Form - Gerar por Tema */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-grey-900 mb-4">
                ✍️ Gerar Post por Tema
              </h2>
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Tema do Post
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Ex: Zero Trust Architecture em 2025"
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-grey-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-grey-500"
                >
                  <option value="cybersecurity">Cibersegurança</option>
                  <option value="counterespionage">Contraespionagem</option>
                  <option value="homeautomation">Automação Residencial</option>
                  <option value="travel">Viagens</option>
                  <option value="general">Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Keywords (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="zero trust, segurança, cloud"
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-grey-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !formData.topic}
                className="w-full bg-grey-900 text-white py-3 rounded-lg font-medium hover:bg-grey-800 disabled:bg-grey-400 disabled:cursor-not-allowed transition"
              >
                {loading ? '⏳ Gerando post...' : '🚀 Gerar Post'}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="mt-8 p-6 bg-grey-50 rounded-lg border border-grey-200">
                <h3 className="text-lg font-bold text-grey-900 mb-4">
                  ✅ Post Gerado com Sucesso!
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Slug:</strong> {result.slug}</p>
                  <p><strong>Score:</strong> {result.score}/10</p>
                  <p><strong>Arquivo:</strong> <code className="bg-white px-2 py-1 rounded">{result.filepath}</code></p>
                  {result.coverImage && (
                    <p><strong>Imagem:</strong> <code className="bg-white px-2 py-1 rounded">{result.coverImage}</code></p>
                  )}
                  {result.thumbnailPrompt && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs font-semibold text-blue-900 mb-1">📝 Prompt da Imagem:</p>
                      <p className="text-xs text-blue-800 italic">&quot;{result.thumbnailPrompt}&quot;</p>
                    </div>
                  )}
                </div>
                {result.coverImage && (
                  <div className="mt-4">
                    <img 
                      src={result.coverImage} 
                      alt="Cover" 
                      className="w-full max-w-md rounded-lg border border-grey-300"
                    />
                    <RegenerateImageButton 
                      slug={result.slug}
                      currentPrompt={result.thumbnailPrompt}
                      onSuccess={(newImage) => setResult({ ...result, coverImage: newImage })}
                      loading={loading}
                      setLoading={setLoading}
                      setError={setError}
                    />
                  </div>
                )}
                <div className="mt-4 p-4 bg-white rounded border border-grey-300">
                  <p className="text-xs text-grey-600 mb-2"><strong>Preview:</strong></p>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{result.preview}</pre>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">❌ Erro: {error}</p>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="mt-8 p-6 bg-grey-50 rounded-lg border border-grey-200">
            <h3 className="font-bold text-grey-900 mb-3">📝 Como usar:</h3>
            <ol className="text-sm text-grey-700 space-y-2 list-decimal list-inside">
              <li>Digite o tema do post que deseja gerar</li>
              <li>Escolha a categoria apropriada</li>
              <li>Adicione keywords relevantes (opcional)</li>
              <li>Clique em &quot;Gerar Post&quot;</li>
              <li>Aguarde ~30 segundos (IA está escrevendo)</li>
              <li>Post salvo em <code>src/content/posts/drafts/</code></li>
              <li>Revise e mova para <code>src/content/posts/</code> se aprovar</li>
            </ol>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
