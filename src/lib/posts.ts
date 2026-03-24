/**
 * Posts module - Now using Cloudflare D1 instead of Supabase
 *
 * This file re-exports all functions from the Cloudflare posts module
 * to maintain compatibility with existing code.
 */

export type {
  PostFrontMatter,
  Post,
  PostInsert,
  PostUpdate,
} from './cloudflare/posts';

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
} from './cloudflare/posts';
