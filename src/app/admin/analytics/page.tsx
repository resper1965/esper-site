'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { FileText, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';

interface Stats {
  totalPosts: number;
  draftPosts: number;
  publishedPosts: number;
  avgScore: number;
  categoryCounts: { [key: string]: number };
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
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

  if (!stats) return null;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">
          Analytics
        </h1>
        <p className="text-slate-400 text-sm">
          Estatísticas detalhadas dos posts e performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
        <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-sm p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-800">
                <FileText className="h-5 w-5 text-slate-300" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-400 truncate">
                Total de Posts
              </p>
              <p className="text-xl font-semibold text-slate-100 mt-0.5">
                {stats.totalPosts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-sm p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-800">
                <CheckCircle className="h-5 w-5 text-slate-300" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-400 truncate">
                Publicados
              </p>
              <p className="text-xl font-semibold text-slate-100 mt-0.5">
                {stats.publishedPosts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-sm p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-800">
                <Clock className="h-5 w-5 text-slate-300" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-400 truncate">
                Rascunhos
              </p>
              <p className="text-xl font-semibold text-slate-100 mt-0.5">
                {stats.draftPosts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-sm p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-800">
                <TrendingUp className="h-5 w-5 text-slate-300" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-400 truncate">
                Score Médio
              </p>
              <div className="flex items-baseline mt-0.5">
                <p className="text-xl font-semibold text-slate-100">
                  {stats.avgScore.toFixed(1)}
                </p>
                <span className="ml-1.5 text-xs text-slate-400">/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-sm p-4">
        <h2 className="text-base font-semibold text-slate-100 mb-3">
          Posts por Categoria
        </h2>
        <div className="space-y-2.5">
          {Object.entries(stats.categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([category, count]) => {
              const percentage = (count / stats.totalPosts) * 100;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 capitalize">{category}</span>
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
      </div>
    </AdminLayout>
  );
}
