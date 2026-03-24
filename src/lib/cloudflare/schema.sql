-- Cloudflare D1 Schema for site-esper
-- Run via: wrangler d1 execute esper-db --file=./schema.sql

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  slug          TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  excerpt       TEXT,
  category      TEXT NOT NULL DEFAULT 'geral',
  language      TEXT NOT NULL DEFAULT 'pt-br',
  date          TEXT NOT NULL,
  author        TEXT DEFAULT 'Ricardo Esper',
  cover_image   TEXT,
  keywords      TEXT,  -- JSON array
  tags          TEXT,  -- JSON array
  description   TEXT,
  featured      INTEGER DEFAULT 0,
  read_time     TEXT,
  published     INTEGER DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_language ON posts(language);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);

-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
  title,
  content,
  excerpt,
  category,
  content='posts',
  content_rowid='rowid'
);

-- FTS triggers to keep index in sync
CREATE TRIGGER IF NOT EXISTS posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(rowid, title, content, excerpt, category)
    VALUES (new.rowid, new.title, new.content, new.excerpt, new.category);
END;

CREATE TRIGGER IF NOT EXISTS posts_ad AFTER DELETE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, content, excerpt, category)
    VALUES ('delete', old.rowid, old.title, old.content, old.excerpt, old.category);
END;

CREATE TRIGGER IF NOT EXISTS posts_au AFTER UPDATE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, content, excerpt, category)
    VALUES ('delete', old.rowid, old.title, old.content, old.excerpt, old.category);
  INSERT INTO posts_fts(rowid, title, content, excerpt, category)
    VALUES (new.rowid, new.title, new.content, new.excerpt, new.category);
END;

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id              TEXT PRIMARY KEY,
  post_slug       TEXT NOT NULL,
  author_name     TEXT NOT NULL,
  author_email    TEXT NOT NULL,
  author_website  TEXT,
  content         TEXT NOT NULL,
  approved        INTEGER DEFAULT 0,
  spam_score      REAL DEFAULT 0,
  user_ip         TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  approved_at     TEXT,
  FOREIGN KEY (post_slug) REFERENCES posts(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_slug, approved);
CREATE INDEX IF NOT EXISTS idx_comments_pending ON comments(approved) WHERE approved = 0;

-- Analytics: raw views
CREATE TABLE IF NOT EXISTS post_views (
  id          TEXT PRIMARY KEY,
  post_slug   TEXT NOT NULL,
  user_ip     TEXT,
  user_agent  TEXT,
  referrer    TEXT,
  viewed_at   TEXT NOT NULL,
  FOREIGN KEY (post_slug) REFERENCES posts(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_views_slug ON post_views(post_slug);
CREATE INDEX IF NOT EXISTS idx_views_date ON post_views(viewed_at);

-- Analytics: cached stats
CREATE TABLE IF NOT EXISTS post_stats (
  slug            TEXT PRIMARY KEY,
  views           INTEGER DEFAULT 0,
  likes           INTEGER DEFAULT 0,
  last_viewed_at  TEXT,
  FOREIGN KEY (slug) REFERENCES posts(slug) ON DELETE CASCADE
);

-- Analytics: likes
CREATE TABLE IF NOT EXISTS post_likes (
  id          TEXT PRIMARY KEY,
  post_slug   TEXT NOT NULL,
  user_ip     TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  FOREIGN KEY (post_slug) REFERENCES posts(slug) ON DELETE CASCADE,
  UNIQUE(post_slug, user_ip)
);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id              TEXT PRIMARY KEY,
  email           TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'admin',
  password_hash   TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Site settings (key-value store)
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
