/**
 * Posts module - Now using Supabase instead of SQLite
 *
 * This file re-exports all functions from the Supabase posts module
 * to maintain compatibility with existing code.
 */

export type {
  PostFrontMatter,
  Post,
} from './supabase/posts';

export {
  getAllPosts,
  getPostBySlug,
  getLatestPosts,
  getPostsByCategory,
  getPostsByTag,
  createPost,
  updatePost,
  publishPost,
  deletePost,
  getAllPostsIncludingDrafts,
} from './supabase/posts';
