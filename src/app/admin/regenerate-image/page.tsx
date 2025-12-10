'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';

export default function RegenerateImagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/regenerate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slug,
          customPrompt: useCustomPrompt ? customPrompt : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao regenerar imagem');
      }

      setSuccess(`✅ Imagem regenerada com sucesso! Nova imagem: ${data.coverImage}`);
      if (data.prompt) {
        setCurrentPrompt(data.prompt);
      }
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
              🔄 Regenerar Imagem de Post
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/admin/generate')}
                className="px-4 py-2 text-sm text-grey-700 hover:text-grey-900 border border-grey-300 rounded-lg"
              >
                ← Voltar
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

          <div className="bg-white border border-grey-200 rounded-lg p-8">
            <form onSubmit={handleRegenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Slug do Post
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ex: ransomware-2025-ameaca-evolucao"
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-grey-500"
                  required
                />
                <p className="mt-2 text-sm text-grey-500">
                  Digite o slug do post (encontrado no frontmatter do arquivo .mdx)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useCustomPrompt"
                  checked={useCustomPrompt}
                  onChange={(e) => setUseCustomPrompt(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="useCustomPrompt" className="text-sm font-medium text-grey-700">
                  Usar prompt customizado
                </label>
              </div>

              {useCustomPrompt && (
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-2">
                    Prompt Customizado para a Imagem
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ex: Abstract geometric lock icon in cyan on dark gray-950 background, minimal composition, modern tech aesthetic"
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-grey-500"
                    rows={4}
                  />
                  <p className="mt-2 text-sm text-grey-500">
                    Descreva a imagem que deseja gerar. Se deixar vazio, será usado o prompt do frontmatter.
                  </p>
                </div>
              )}

              {currentPrompt && !useCustomPrompt && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs font-semibold text-blue-900 mb-1">📝 Prompt Atual:</p>
                  <p className="text-xs text-blue-800 italic">&quot;{currentPrompt}&quot;</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !slug}
                className="w-full bg-grey-900 text-white py-3 rounded-lg font-medium hover:bg-grey-800 disabled:bg-grey-400 disabled:cursor-not-allowed transition"
              >
                {loading ? '⏳ Regenerando imagem...' : '🔄 Regenerar Imagem'}
              </button>
            </form>

            {success && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">❌ Erro: {error}</p>
              </div>
            )}

            <div className="mt-8 p-6 bg-grey-50 rounded-lg border border-grey-200">
              <h3 className="font-bold text-grey-900 mb-3">📝 Como usar:</h3>
              <ol className="text-sm text-grey-700 space-y-2 list-decimal list-inside">
                <li>Encontre o slug do post no frontmatter do arquivo .mdx</li>
                <li>Digite o slug no campo acima</li>
                <li>Clique em &quot;Regenerar Imagem&quot;</li>
                <li>A nova imagem será gerada e salva em <code className="bg-white px-2 py-1 rounded">public/images/</code></li>
                <li>O frontmatter do post será atualizado automaticamente</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

