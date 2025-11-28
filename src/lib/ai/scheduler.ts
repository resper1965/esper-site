import { getAllPosts } from '@/lib/posts';

interface ScheduleConfig {
  maxPostsPerDay: number;
  maxPostsPerWeek: number;
  minHoursBetweenSameCategory: number;
  preferredHours: number[]; // [6, 14] = 6h e 14h
  categoryDistribution: {
    [key: string]: number; // cybersecurity: 0.40 = 40%
  };
}

const DEFAULT_CONFIG: ScheduleConfig = {
  maxPostsPerDay: 1,
  maxPostsPerWeek: 7,
  minHoursBetweenSameCategory: 48,
  preferredHours: [6], // 6h da manhã
  categoryDistribution: {
    cybersecurity: 0.40,
    counterespionage: 0.20,
    homeautomation: 0.15,
    travel: 0.10,
    general: 0.15
  }
};

export async function canPublishToday(): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const posts = await getAllPosts();
  
  const postsToday = posts.filter(post => 
    post.frontMatter.date && post.frontMatter.date.startsWith(today)
  );
  
  return postsToday.length < DEFAULT_CONFIG.maxPostsPerDay;
}

export async function canPublishCategory(category: string): Promise<boolean> {
  const posts = await getAllPosts();
  const now = new Date();
  const cutoff = new Date(now.getTime() - DEFAULT_CONFIG.minHoursBetweenSameCategory * 60 * 60 * 1000);
  
  const recentInCategory = posts.filter(post => 
    post.frontMatter.category === category &&
    post.frontMatter.date &&
    new Date(post.frontMatter.date) > cutoff
  );
  
  return recentInCategory.length === 0;
}

export async function getRecentPostTitles(days: number = 30): Promise<string[]> {
  const posts = await getAllPosts();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return posts
    .filter(post => post.frontMatter.date && new Date(post.frontMatter.date) > cutoff)
    .map(post => post.frontMatter.title);
}

export async function getCategoryStats(): Promise<{ [key: string]: number }> {
  const posts = await getAllPosts();
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentPosts = posts.filter(post => 
    post.frontMatter.date && new Date(post.frontMatter.date) > last30Days
  );
  
  const stats: { [key: string]: number } = {};
  
  recentPosts.forEach(post => {
    stats[post.frontMatter.category] = (stats[post.frontMatter.category] || 0) + 1;
  });
  
  return stats;
}

export async function shouldPrioritizeCategory(category: string): Promise<boolean> {
  const stats = await getCategoryStats();
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  
  if (total === 0) return true; // Primeiro post, qualquer categoria OK
  
  const currentPercentage = (stats[category] || 0) / total;
  const targetPercentage = DEFAULT_CONFIG.categoryDistribution[category] || 0.2;
  
  return currentPercentage < targetPercentage;
}
