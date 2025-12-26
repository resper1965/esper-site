'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/admin/stat-card';
import { QuickActionCard } from '@/components/admin/quick-action-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include', // Importante: incluir cookies na requisição
        });

        if (!response.ok) {
          throw new Error(`Erro ao verificar autenticação: ${response.status}`);
        }

        const data = await response.json();

        if (!data.authenticated) {
          router.push('/admin/login');
          return;
        }

        setCheckingAuth(false);
        // Autenticado - carregar estatísticas
        await loadStats();
      } catch (error) {
        console.error('Error checking auth:', error);
        setError(error instanceof Error ? error.message : 'Erro ao verificar autenticação');
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include', // Importante: incluir cookies na requisição
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ao carregar estatísticas: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar estatísticas');
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
            <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Verificando autenticação...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Mostrar erro se houver
  if (error && !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full bg-slate-900 border border-red-800 rounded-lg p-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-950/50 mb-3">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-slate-100 mb-1.5">Erro ao Carregar</h3>
              <p className="text-sm text-slate-400 mb-3">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Carregando estatísticas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total de Posts"
          value={stats.totalPosts}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Publicados"
          value={stats.publishedPosts}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Rascunhos"
          value={stats.draftPosts}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Score Médio"
          value={`${stats.avgScore.toFixed(1)}/10`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickActionCard
                  title="Gerar Post"
                  description="Crie novo conteúdo usando IA generativa"
                  icon={<Sparkles className="h-5 w-5" />}
                  href="/admin/generate"
                />
                <QuickActionCard
                  title="Analytics"
                  description="Veja estatísticas detalhadas dos posts"
                  icon={<BarChart3 className="h-5 w-5" />}
                  href="/admin/analytics"
                />
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="mt-4 border-slate-800 bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base">Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2.5"></div>
                    <span className="text-xs text-slate-400">Status da IA</span>
                  </div>
                  <span className="text-xs font-medium text-slate-200">Operacional</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Modelo de IA</span>
                  <span className="text-xs font-medium text-slate-200">AI Gateway</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Idiomas</span>
                  <span className="text-xs font-medium text-slate-200">PT-BR, EN</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-400">Categorias Ativas</span>
                  <span className="text-xs font-medium text-slate-200">
                    {Object.keys(stats.categoryCounts).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-1">
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base">Posts por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.categoryCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => {
                    const percentage = (count / stats.totalPosts) * 100;
                    return (
                      <div key={category} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center text-slate-300">
                            <span className="mr-1.5">{getCategoryEmoji(category)}</span>
                            {getCategoryName(category)}
                          </span>
                          <span className="font-medium text-slate-100">{count}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="mt-4 border-slate-700 bg-slate-800">
            <CardContent className="p-4">
              <h3 className="text-xs font-medium text-slate-200 mb-1.5">
                💡 Dica
              </h3>
              <p className="text-xs text-slate-400">
                Posts gerados são salvos automaticamente. Revise antes de publicar para garantir qualidade máxima.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
