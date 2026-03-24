-- ============================================================
-- D1 Schema: esper-site-db
-- Migrated from Supabase PostgreSQL → Cloudflare D1 (SQLite)
-- ============================================================

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Geral',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  author TEXT,
  cover_image TEXT,
  image_alt TEXT,
  keywords TEXT, -- JSON array: '["keyword1","keyword2"]'
  tags TEXT,     -- JSON array: '["tag1","tag2"]'
  date TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 0, -- SQLite boolean
  featured INTEGER DEFAULT 0,
  read_time TEXT,
  generated_by TEXT,
  score REAL,
  sources TEXT, -- JSON object/array
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_language ON posts(language);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);

-- Full-text search virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
  slug,
  title,
  content,
  excerpt,
  category,
  tags,
  content='posts',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(rowid, slug, title, content, excerpt, category, tags)
  VALUES (new.rowid, new.slug, new.title, new.content, new.excerpt, new.category, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS posts_ad AFTER DELETE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, slug, title, content, excerpt, category, tags)
  VALUES ('delete', old.rowid, old.slug, old.title, old.content, old.excerpt, old.category, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS posts_au AFTER UPDATE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, slug, title, content, excerpt, category, tags)
  VALUES ('delete', old.rowid, old.slug, old.title, old.content, old.excerpt, old.category, old.tags);
  INSERT INTO posts_fts(rowid, slug, title, content, excerpt, category, tags)
  VALUES (new.rowid, new.slug, new.title, new.content, new.excerpt, new.category, new.tags);
END;

-- Post views (analytics)
CREATE TABLE IF NOT EXISTS post_views (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  post_slug TEXT NOT NULL,
  viewed_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_ip TEXT,
  user_agent TEXT,
  FOREIGN KEY (post_slug) REFERENCES posts(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_views_slug ON post_views(post_slug);
CREATE INDEX IF NOT EXISTS idx_post_views_date ON post_views(viewed_at);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  post_slug TEXT NOT NULL,
  user_ip TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(post_slug, user_ip),
  FOREIGN KEY (post_slug) REFERENCES posts(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_likes_slug ON post_likes(post_slug);

-- Post stats (materialized view, updated periodically)
CREATE TABLE IF NOT EXISTS post_stats (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TEXT,
  FOREIGN KEY (slug) REFERENCES posts(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_stats_views ON post_stats(views DESC);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_website TEXT,
  content TEXT NOT NULL,
  approved INTEGER NOT NULL DEFAULT 0,
  spam_score REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at TEXT,
  user_ip TEXT,
  FOREIGN KEY (post_slug) REFERENCES posts(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- Site settings (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Admin sessions (stored in KV, but fallback table)
CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
