'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminLayout from '@/components/layout/AdminLayout';
import { Link2, FileEdit, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface GenerateResult {
  title: string;
  content: string;
  slug: string;
  score: number;
  filepath: string;
  preview: string;
  coverImage?: string;
  thumbnailPrompt?: string;
}

type TabType = 'topic' | 'url';

export default function GenerateDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('topic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [topicForm, setTopicForm] = useState({
    topic: '',
    category: 'cybersecurity',
    keywords: ''
  });

  const [urlForm, setUrlForm] = useState({
    url: '',
    category: 'general',
    keywords: ''
  });

  // Verificar autenticação
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-3" />
            <p className="text-slate-400">Verificando autenticação...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleGenerateTopic = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicForm.topic,
          category: topicForm.category,
          keywords: topicForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
          sources: []
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

  const handleGenerateUrl = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlForm.url,
          category: urlForm.category,
          keywords: urlForm.keywords.split(',').map(k => k.trim()).filter(Boolean)
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

  const resetForm = () => {
    setResult(null);
    setError(null);
    setTopicForm({ topic: '', category: 'cybersecurity', keywords: '' });
    setUrlForm({ url: '', category: 'general', keywords: '' });
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="mb-4">
          <div className="border-b border-slate-800">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => {
                  setActiveTab('topic');
                  resetForm();
                }}
                className={`
                  group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'topic'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }
                `}
              >
                <FileEdit className={`mr-2 h-5 w-5 ${activeTab === 'topic' ? 'text-primary' : 'text-slate-500'}`} />
                Gerar por Tema
              </button>
              <button
                onClick={() => {
                  setActiveTab('url');
                  resetForm();
                }}
                className={`
                  group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'url'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }
                `}
              >
                <Link2 className={`mr-2 h-5 w-5 ${activeTab === 'url' ? 'text-primary' : 'text-slate-500'}`} />
                Gerar de URL
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-sm">
          {activeTab === 'topic' && (
            <div className="p-6">
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-100">
                    Criar Post Original
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    A IA criará um artigo completo sobre o tema escolhido, com base na voz de Ricardo Esper
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Tema do Post *
                  </label>
                  <input
                    type="text"
                    value={topicForm.topic}
                    onChange={(e) => setTopicForm({ ...topicForm, topic: e.target.value })}
                    placeholder="Ex: Zero Trust Architecture em 2025"
                    className="w-full px-4 py-2.5 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-shadow placeholder:text-slate-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={topicForm.category}
                    onChange={(e) => setTopicForm({ ...topicForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    disabled={loading}
                  >
                    <option value="cybersecurity">🛡️ Cibersegurança</option>
                    <option value="counterespionage">👁️ Contraespionagem</option>
                    <option value="homeautomation">🏠 Automação Residencial</option>
                    <option value="travel">✈️ Viagens</option>
                    <option value="vida">💭 Vida</option>
                    <option value="general">📝 Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Keywords (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={topicForm.keywords}
                    onChange={(e) => setTopicForm({ ...topicForm, keywords: e.target.value })}
                    placeholder="zero trust, segurança, cloud"
                    className="w-full px-4 py-2.5 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-slate-500"
                    disabled={loading}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Opcional: adicione palavras-chave para melhorar o SEO
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={handleGenerateTopic}
                    disabled={loading || !topicForm.topic}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Gerando post... (~30s)
                      </>
                    ) : (
                      <>
                        <Sparkles className="-ml-1 mr-3 h-5 w-5" />
                        Gerar Post com IA
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="p-6">
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <Link2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-100">
                    Criar Post de Artigo Externo
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    A IA lerá o artigo e criará um post com a perspectiva de Ricardo Esper
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    URL do Artigo *
                  </label>
                  <input
                    type="url"
                    value={urlForm.url}
                    onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })}
                    placeholder="https://exemplo.com/artigo-sobre-seguranca"
                    className="w-full px-4 py-2.5 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-slate-500"
                    disabled={loading}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Cole a URL de um artigo que você quer usar como base
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={urlForm.category}
                    onChange={(e) => setUrlForm({ ...urlForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    disabled={loading}
                  >
                    <option value="cybersecurity">🛡️ Cibersegurança</option>
                    <option value="counterespionage">👁️ Contraespionagem</option>
                    <option value="homeautomation">🏠 Automação Residencial</option>
                    <option value="travel">✈️ Viagens</option>
                    <option value="vida">💭 Vida</option>
                    <option value="general">📝 Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Keywords (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={urlForm.keywords}
                    onChange={(e) => setUrlForm({ ...urlForm, keywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-4 py-2.5 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-slate-500"
                    disabled={loading}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Opcional: adicione palavras-chave para melhorar o SEO
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={handleGenerateUrl}
                    disabled={loading || !urlForm.url}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Lendo e gerando... (~40s)
                      </>
                    ) : (
                      <>
                        <Link2 className="-ml-1 mr-3 h-5 w-5" />
                        Gerar Post da URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Result */}
        {result && (
          <div className="mt-6 bg-emerald-950/30 border border-emerald-800/50 rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900/20 border-b border-emerald-800/50">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mr-2" />
                <h3 className="text-lg font-medium text-emerald-300">
                  Post Gerado com Sucesso!
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-300">Slug</p>
                  <p className="mt-1 text-sm text-slate-100 font-mono bg-slate-800 px-3 py-2 rounded border border-slate-700">
                    {result.slug}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">Score de Qualidade</p>
                  <p className="mt-1 text-sm text-slate-100">
                    <span className="inline-flex items-center px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
                      <span className="font-bold text-xl text-slate-100">{result.score}</span>
                      <span className="text-slate-400 ml-1">/10</span>
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Arquivo Salvo</p>
                <p className="text-sm text-slate-100 font-mono bg-slate-800 px-3 py-2 rounded border border-slate-700">
                  {result.filepath}
                </p>
              </div>

              {result.coverImage && (
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-2">Imagem de Capa</p>
                  <Image
                    src={result.coverImage}
                    alt="Cover"
                    width={800}
                    height={420}
                    className="w-full max-w-2xl rounded-lg border border-slate-700"
                    unoptimized
                  />
                  {result.thumbnailPrompt && (
                    <div className="mt-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-xs font-semibold text-primary mb-1">Prompt usado:</p>
                      <p className="text-xs text-primary/80 italic">{result.thumbnailPrompt}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Preview do Conteúdo</p>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-slate-200">
                    {result.preview}
                  </pre>
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-800/50">
                <button
                  onClick={resetForm}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-emerald-600 text-base font-medium rounded-lg text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/30 transition-colors"
                >
                  Gerar Novo Post
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-950/30 border border-red-800/50 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">
                  Erro ao Gerar Post
                </h3>
                <p className="mt-2 text-sm text-red-200">
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="mt-3 text-sm font-medium text-red-400 hover:text-red-300"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        {!result && !error && !loading && (
          <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-slate-200 mb-3">
              💡 Como funciona
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0" />
                <span>Escolha entre criar um post original ou adaptar um artigo existente</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0" />
                <span>A IA usa o perfil de voz de Ricardo Esper para cada categoria</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0" />
                <span>Posts são salvos automaticamente como <strong>drafts</strong> no Supabase</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0" />
                <span>Revise o conteúdo no painel admin antes de publicar</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
