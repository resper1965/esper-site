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
            <Loader2 className="h-8 w-8 animate-spin text-grey-600 mx-auto mb-3" />
            <p className="text-grey-600">Carregando estatísticas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-grey-900 mb-2">
          Analytics
        </h1>
        <p className="text-grey-600">
          Estatísticas detalhadas dos posts e performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-lg border border-grey-200 shadow-sm p-6">
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

        <div className="bg-white rounded-lg border border-grey-200 shadow-sm p-6">
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

        <div className="bg-white rounded-lg border border-grey-200 shadow-sm p-6">
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

        <div className="bg-white rounded-lg border border-grey-200 shadow-sm p-6">
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

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg border border-grey-200 shadow-sm p-6">
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
                    <span className="text-grey-700 capitalize">{category}</span>
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
    </AdminLayout>
  );
}
