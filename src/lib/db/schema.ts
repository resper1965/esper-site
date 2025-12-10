import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Schema do banco de dados SQLite para posts
 */
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Conteúdo MDX
  excerpt: text('excerpt'),
  description: text('description'),
  category: text('category').notNull(),
  language: text('language').notNull().default('pt-br'),
  author: text('author'),
  coverImage: text('cover_image'),
  imageAlt: text('image_alt'),
  keywords: text('keywords'), // JSON array como string
  tags: text('tags'), // JSON array como string
  date: text('date').notNull(), // ISO date string
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  readTime: text('read_time'),
  // Metadata de geração
  generatedBy: text('generated_by'), // 'ai' | 'manual'
  score: integer('score'), // Score de qualidade (0-10)
  sources: text('sources'), // JSON array de URLs
  // Timestamps
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  publishedAt: text('published_at'), // Quando foi publicado
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
