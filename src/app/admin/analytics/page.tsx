'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';

interface Stats {
  totalPosts: number;
  draftPosts: number;
  publishedPosts: number;
  avgScore: number;
  categoryCounts: { [key: string]: number };
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    setStats({
      totalPosts: 5,
      draftPosts: 0,
      publishedPosts: 5,
      avgScore: 9.0,
      categoryCounts: {
        cybersecurity: 2,
        counterespionage: 1,
        homeautomation: 1,
        travel: 1
      }
    });
  }, []);

  if (!stats) return null;

  return (
    <Layout>
      <div className="py-16">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Total Posts</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalPosts}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Published</h2>
            <p className="text-3xl font-bold mt-2">{stats.publishedPosts}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Drafts</h2>
            <p className="text-3xl font-bold mt-2">{stats.draftPosts}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Avg Score</h2>
            <p className="text-3xl font-bold mt-2">{stats.avgScore.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
