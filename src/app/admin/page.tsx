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
          loadStats();
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadStats = () => {
    // Por enquanto dados mockados - depois pode buscar de uma API
    setStats({
      totalPosts: 36,
      draftPosts: 0,
      publishedPosts: 36,
      avgScore: 9.2,
      categoryCounts: {
        cybersecurity: 11,
        counterespionage: 4,
        homeautomation: 3,
        vida: 3,
        travel: 1,
        general: 1,
        forensics: 1,
        compliance: 1
      }
    });
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-grey-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-grey-500 truncate">
                      Total de Posts
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-grey-900">
                        {stats.totalPosts}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-grey-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-grey-500 truncate">
                      Publicados
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-grey-900">
                        {stats.publishedPosts}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-grey-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-grey-500 truncate">
                      Rascunhos
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-grey-900">
                        {stats.draftPosts}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-grey-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-grey-500 truncate">
                      Score Médio
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-grey-900">
                        {stats.avgScore.toFixed(1)}
                      </div>
                      <div className="ml-2 text-sm text-grey-500">/10</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg border border-grey-200 p-6">
              <h2 className="text-lg font-medium text-grey-900 mb-4">
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/admin/generate"
                  className="relative group bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-2 border-purple-200 rounded-lg p-6 transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-600">
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
                  className="relative group bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-200 rounded-lg p-6 transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600">
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
            <div className="mt-8 bg-white shadow-sm rounded-lg border border-grey-200 p-6">
              <h2 className="text-lg font-medium text-grey-900 mb-4">
                Informações do Sistema
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-grey-100">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-grey-600">Status da IA</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Operacional</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-grey-100">
                  <span className="text-sm text-grey-600">Modelo de IA</span>
                  <span className="text-sm font-medium text-grey-900">Gemini 2.5 Pro</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-grey-100">
                  <span className="text-sm text-grey-600">Idiomas</span>
                  <span className="text-sm font-medium text-grey-900">Português, English</span>
                </div>
                <div className="flex items-center justify-between py-3">
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
              <h2 className="text-lg font-medium text-grey-900 mb-4">
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
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                💡 Dica
              </h3>
              <p className="text-sm text-blue-800">
                Posts gerados são salvos em <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">drafts/</code>.
                Revise antes de publicar para garantir qualidade máxima.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
