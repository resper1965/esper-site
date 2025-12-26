'use client';

import { useEffect, useState, useCallback } from 'react';
import { Eye, Heart } from 'lucide-react';
import { getPostStats, toggleLike, hasUserLiked, type PostStats } from '@/lib/supabase/analytics';

interface PostStatsProps {
  postSlug: string;
}

export function PostStats({ postSlug }: PostStatsProps) {
  const [stats, setStats] = useState<PostStats | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userIp, setUserIp] = useState<string>('');

  const loadStats = useCallback(async () => {
    const data = await getPostStats(postSlug);
    setStats(data);
  }, [postSlug]);

  const getUserIp = useCallback(async () => {
    try {
      const response = await fetch('/api/ip');
      const data = await response.json();
      setUserIp(data.ip || 'unknown');

      // Verificar se já deu like
      const hasLiked = await hasUserLiked(postSlug, data.ip || 'unknown');
      setLiked(hasLiked);
    } catch (err) {
      console.error('Error getting IP:', err);
      setUserIp('unknown');
    }
  }, [postSlug]);

  useEffect(() => {
    loadStats();
    getUserIp();
  }, [loadStats, getUserIp]);

  const handleLike = async () => {
    if (loading || !userIp) return;

    setLoading(true);
    try {
      const result = await toggleLike(postSlug, userIp);
      if (result) {
        setLiked(result.liked);
        // Atualizar stats
        await loadStats();
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) return null;

  return (
    <div className="flex items-center gap-6 text-grey-400">
      {/* Views */}
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5" />
        <span>{stats.views}</span>
      </div>

      {/* Likes */}
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-2 transition-colors hover:text-cyan ${
          liked ? 'text-cyan' : ''
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={liked ? 'Remover curtida' : 'Curtir post'}
      >
        <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
        <span>{stats.likes}</span>
      </button>
    </div>
  );
}
