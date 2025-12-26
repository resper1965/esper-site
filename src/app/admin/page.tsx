'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Sparkles, FileText, BarChart3, TrendingUp, Clock, CheckCircle, Loader2 } from 'lucide-react';

interface Stats {
  totalPosts: number;
  draftPosts: number;
  publishedPosts: number;
  avgScore: number;
  categoryCounts: { [key: string]: number };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setCheckingAuth(false);
          // Carregar estatísticas
          await loadStats();
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback para dados vazios em caso de erro
      setStats({
        totalPosts: 0,
        draftPosts: 0,
        publishedPosts: 0,
        avgScore: 0,
        categoryCounts: {}
      });
    }
  };

  if (checkingAuth) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-grey-600 mx-auto mb-3" />
            <p className="text-grey-600">Verificando autenticação...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      cybersecurity: '🛡️',
      counterespionage: '👁️',
      homeautomation: '🏠',
      travel: '✈️',
      vida: '💭',
      general: '📝',
      forensics: '🔍',
      compliance: '📋'
    };
    return emojis[category] || '📄';
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      cybersecurity: 'Cibersegurança',
      counterespionage: 'Contraespionagem',
      homeautomation: 'Automação Residencial',
      travel: 'Viagens',
      vida: 'Vida',
      general: 'Geral',
      forensics: 'Forense Digital',
      compliance: 'Compliance'
    };
    return names[category] || category;
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-grey-900 mb-2">
          Dashboard
        </h1>
        <p className="text-grey-600">
          Visão geral do sistema de geração de conteúdo
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-grey-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-grey-100">
                  <FileText className="h-6 w-6 text-grey-600" />
                </div>
              </div>
              <div className="ml-5 flex-1 min-w-0">
                <p className="text-sm font-medium text-grey-500 truncate">
                  Total de Posts
                </p>
                <p className="text-2xl font-semibold text-grey-900 mt-1">
                  {stats.totalPosts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-grey-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-grey-100">
                  <CheckCircle className="h-6 w-6 text-grey-600" />
                </div>
              </div>
              <div className="ml-5 flex-1 min-w-0">
                <p className="text-sm font-medium text-grey-500 truncate">
                  Publicados
                </p>
                <p className="text-2xl font-semibold text-grey-900 mt-1">
                  {stats.publishedPosts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-grey-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-grey-100">
                  <Clock className="h-6 w-6 text-grey-600" />
                </div>
              </div>
              <div className="ml-5 flex-1 min-w-0">
                <p className="text-sm font-medium text-grey-500 truncate">
                  Rascunhos
                </p>
                <p className="text-2xl font-semibold text-grey-900 mt-1">
                  {stats.draftPosts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-grey-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-grey-100">
                  <TrendingUp className="h-6 w-6 text-grey-600" />
                </div>
              </div>
              <div className="ml-5 flex-1 min-w-0">
                <p className="text-sm font-medium text-grey-500 truncate">
                  Score Médio
                </p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-semibold text-grey-900">
                    {stats.avgScore.toFixed(1)}
                  </p>
                  <span className="ml-2 text-sm text-grey-500">/10</span>
                </div>
              </div>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-grey-200 p-6">
            <h2 className="text-lg font-semibold text-grey-900 mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/admin/generate"
                className="group relative bg-grey-50 hover:bg-grey-100 border border-grey-200 hover:border-grey-300 rounded-lg p-6 transition-all"
              >
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-grey-900 group-hover:bg-grey-800 transition-colors">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="ml-3 text-base font-medium text-grey-900">
                    Gerar Post
                  </h3>
                </div>
                <p className="text-sm text-grey-600">
                  Crie novo conteúdo usando IA generativa
                </p>
              </Link>

              <Link
                href="/admin/analytics"
                className="group relative bg-grey-50 hover:bg-grey-100 border border-grey-200 hover:border-grey-300 rounded-lg p-6 transition-all"
              >
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-grey-900 group-hover:bg-grey-800 transition-colors">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="ml-3 text-base font-medium text-grey-900">
                    Analytics
                  </h3>
                </div>
                <p className="text-sm text-grey-600">
                  Veja estatísticas detalhadas dos posts
                </p>
              </Link>
            </div>
          </div>

          {/* System Info */}
          <div className="mt-6 bg-white shadow-sm rounded-lg border border-grey-200 p-6">
            <h2 className="text-lg font-semibold text-grey-900 mb-4">
              Informações do Sistema
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 border-b border-grey-100">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-sm text-grey-600">Status da IA</span>
                </div>
                <span className="text-sm font-medium text-grey-900">Operacional</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-grey-100">
                <span className="text-sm text-grey-600">Modelo de IA</span>
                <span className="text-sm font-medium text-grey-900">AI Gateway</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-grey-100">
                <span className="text-sm text-grey-600">Idiomas</span>
                <span className="text-sm font-medium text-grey-900">PT-BR, EN</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-grey-600">Categorias Ativas</span>
                <span className="text-sm font-medium text-grey-900">
                  {Object.keys(stats.categoryCounts).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg border border-grey-200 p-6">
            <h2 className="text-lg font-semibold text-grey-900 mb-4">
              Posts por Categoria
            </h2>
              <div className="space-y-3">
                {Object.entries(stats.categoryCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => {
                    const percentage = (count / stats.totalPosts) * 100;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-grey-700">
                            <span className="mr-2">{getCategoryEmoji(category)}</span>
                            {getCategoryName(category)}
                          </span>
                          <span className="font-medium text-grey-900">{count}</span>
                        </div>
                        <div className="w-full bg-grey-200 rounded-full h-2">
                          <div
                            className="bg-grey-900 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

          {/* Tips */}
          <div className="mt-6 bg-grey-50 border border-grey-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-grey-900 mb-2">
              💡 Dica
            </h3>
            <p className="text-sm text-grey-700">
              Posts gerados são salvos automaticamente. Revise antes de publicar para garantir qualidade máxima.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
