/**
 * Cloudflare integration barrel export
 *
 * Usage:
 *   import { db, getPosts, searchPosts } from '@/lib/cloudflare';
 *
 * Drop-in replacement for supabase imports — same function signatures.
 */

// Core client
export { db } from './d1-client';

// Posts CRUD
export {
  type Post,
  type PostFrontMatter,
  getAllPosts,
  getPostBySlug,
  getLatestPosts,
  createPost,
  updatePost,
  deletePost,
  getPostsByCategory,
  getPostsByTag,
  publishPost,
  getDraftPosts,
  getAllPostsIncludingDrafts,
  getPostStats as getPostStatsOverview,
} from './posts';

// Full-text & simple search
export {
  type SearchResult,
  searchPosts,
  searchPostsSimple,
  getSearchSuggestions,
  getRelatedPosts,
} from './search';

// Comments
export {
  type Comment,
  type CommentInsert,
  createComment,
  getPostComments,
  getPendingComments,
  getAllPostComments,
  approveComment,
  deleteComment,
  markAsSpam,
  getCommentCount,
  getPendingCount,
  subscribeToNewComments,
} from './comments';

// Analytics
export {
  type PostStats,
  type AnalyticsDashboard,
  trackView,
  toggleLike,
  hasUserLiked,
  getPostStats,
  getTopPosts,
  getAnalyticsDashboard,
  refreshStats,
} from './analytics';

// Auth
export {
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  verifySession,
  isAuthenticated,
  onAuthStateChange,
  resetPassword,
  updatePassword,
} from './auth';

// R2 Storage
export {
  uploadPostImage,
  deletePostImage,
  listPostImages,
  getPostImageUrl,
} from './storage';

// Settings
export {
  type SiteSetting,
  getSetting,
  getSettingOr,
  setSetting,
  getSettings,
  deleteSetting,
} from './settings';

// AI Gateway

// Vectorize (semantic search)
