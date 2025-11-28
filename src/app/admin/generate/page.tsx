'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';

interface GenerateResult {
  title: string;
  content: string;
  slug: string;
  score: number;
  filepath: string;
  preview: string;
}

export default function GenerateDashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    topic: '',
    category: 'cybersecurity',
    keywords: ''
  });

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

  return (
    <Layout>
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-grey-900 mb-8">
            Gerador de Posts com IA
          </h1>

          <div className="bg-white border border-grey-200 rounded-lg p-8">
            {/* Form */}
            <div className="space-y-6">
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
                </div>
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
    </Layout>
  );
}
