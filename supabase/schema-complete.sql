-- ============================================================================
-- SCHEMA COMPLETO DO BLOG RICARDO ESPER
-- Inclui: Posts, Storage, Search, Analytics, Comentários, Functions
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE POSTS (já existente, mas com melhorias)
-- ============================================================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  category TEXT NOT NULL,
  language TEXT DEFAULT 'pt-br' NOT NULL,
  author TEXT,
  cover_image TEXT,
  image_alt TEXT,
  keywords TEXT[],
  tags TEXT[],
  date TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  read_time TEXT,
  generated_by TEXT,
  score INTEGER,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,

  -- Coluna de busca (Full-Text Search)
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(content, '')), 'C')
  ) STORED
);

-- Índices para posts
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE INDEX IF NOT EXISTS posts_language_idx ON posts(language);
CREATE INDEX IF NOT EXISTS posts_date_idx ON posts(date DESC);
CREATE INDEX IF NOT EXISTS posts_published_date_idx ON posts(published, date DESC);
CREATE INDEX IF NOT EXISTS posts_search_idx ON posts USING GIN(search_vector);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. SUPABASE STORAGE - BUCKET PARA IMAGENS
-- ============================================================================

-- Criar bucket para imagens de posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Public can view post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Authenticated can update post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated can delete post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images');

-- ============================================================================
-- 3. ANALYTICS - VIEWS E LIKES
-- ============================================================================

-- Tabela de visualizações
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_ip TEXT,
  user_agent TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS post_views_slug_idx ON post_views(post_slug);
CREATE INDEX IF NOT EXISTS post_views_date_idx ON post_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS post_views_slug_date_idx ON post_views(post_slug, viewed_at DESC);

-- Tabela de likes
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  liked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(post_slug, user_ip)
);

CREATE INDEX IF NOT EXISTS post_likes_slug_idx ON post_likes(post_slug);
CREATE INDEX IF NOT EXISTS post_likes_date_idx ON post_likes(liked_at DESC);

-- View materializada para estatísticas (performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS post_stats AS
SELECT
  p.slug,
  p.title,
  p.category,
  p.published,
  p.date,
  COUNT(DISTINCT pv.id) AS views,
  COUNT(DISTINCT pl.id) AS likes,
  COALESCE(MAX(pv.viewed_at), p.published_at) AS last_viewed_at
FROM posts p
LEFT JOIN post_views pv ON p.slug = pv.post_slug
LEFT JOIN post_likes pl ON p.slug = pl.post_slug
GROUP BY p.slug, p.title, p.category, p.published, p.date, p.published_at;

CREATE UNIQUE INDEX ON post_stats(slug);
CREATE INDEX ON post_stats(views DESC);
CREATE INDEX ON post_stats(likes DESC);

-- Atualizar view materializada automaticamente (refresh incremental)
CREATE OR REPLACE FUNCTION refresh_post_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY post_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. SISTEMA DE COMENTÁRIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_website TEXT,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE NOT NULL,
  spam_score FLOAT DEFAULT 0,
  user_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  approved_at TIMESTAMPTZ,

  CONSTRAINT comments_content_min_length CHECK (length(content) >= 10),
  CONSTRAINT comments_content_max_length CHECK (length(content) <= 2000),
  CONSTRAINT comments_author_name_min_length CHECK (length(author_name) >= 2)
);

CREATE INDEX IF NOT EXISTS comments_post_idx ON comments(post_slug, approved);
CREATE INDEX IF NOT EXISTS comments_created_idx ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS comments_approved_idx ON comments(approved) WHERE approved = FALSE;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Posts RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts publicados são públicos"
  ON posts FOR SELECT
  USING (published = TRUE);

CREATE POLICY "Usuários autenticados veem todos os posts"
  ON posts FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Apenas autenticados podem criar posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Apenas autenticados podem atualizar posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Apenas autenticados podem deletar posts"
  ON posts FOR DELETE
  TO authenticated
  USING (TRUE);

-- Views e Likes RLS (público pode inserir, ler stats agregados)
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track views"
  ON post_views FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can add likes"
  ON post_likes FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can view their likes"
  ON post_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated can see all views"
  ON post_views FOR SELECT
  TO authenticated
  USING (TRUE);

-- Comments RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved comments"
  ON comments FOR SELECT
  USING (approved = TRUE);

CREATE POLICY "Anyone can create comments"
  ON comments FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated can view all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated can approve comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated can delete comments"
  ON comments FOR DELETE
  TO authenticated
  USING (TRUE);

-- ============================================================================
-- 6. DATABASE FUNCTIONS
-- ============================================================================

-- Função: Incrementar views de um post
CREATE OR REPLACE FUNCTION increment_post_views(
  p_slug TEXT,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO post_views (post_slug, user_ip, user_agent, referrer)
  VALUES (p_slug, p_ip, p_user_agent, p_referrer);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Toggle like (adiciona ou remove)
CREATE OR REPLACE FUNCTION toggle_post_like(
  p_slug TEXT,
  p_user_ip TEXT
)
RETURNS JSONB AS $$
DECLARE
  existing_id UUID;
  result JSONB;
BEGIN
  -- Verificar se já existe
  SELECT id INTO existing_id
  FROM post_likes
  WHERE post_slug = p_slug AND user_ip = p_user_ip;

  IF existing_id IS NOT NULL THEN
    -- Remove like
    DELETE FROM post_likes WHERE id = existing_id;
    result := jsonb_build_object('liked', false, 'action', 'removed');
  ELSE
    -- Adiciona like
    INSERT INTO post_likes (post_slug, user_ip)
    VALUES (p_slug, p_user_ip);
    result := jsonb_build_object('liked', true, 'action', 'added');
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Buscar posts (Full-Text Search)
CREATE OR REPLACE FUNCTION search_posts(
  search_query TEXT,
  search_language TEXT DEFAULT 'pt-br',
  max_results INT DEFAULT 20
)
RETURNS TABLE (
  slug TEXT,
  title TEXT,
  excerpt TEXT,
  category TEXT,
  date TEXT,
  cover_image TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.slug,
    p.title,
    p.excerpt,
    p.category,
    p.date,
    p.cover_image,
    ts_rank(p.search_vector, websearch_to_tsquery('portuguese', search_query)) AS rank
  FROM posts p
  WHERE
    p.published = TRUE
    AND p.language = search_language
    AND p.search_vector @@ websearch_to_tsquery('portuguese', search_query)
  ORDER BY rank DESC, p.date DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Obter posts relacionados
CREATE OR REPLACE FUNCTION get_related_posts(
  p_slug TEXT,
  p_limit INT DEFAULT 3
)
RETURNS TABLE (
  slug TEXT,
  title TEXT,
  excerpt TEXT,
  cover_image TEXT,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH current_post AS (
    SELECT category, tags, keywords
    FROM posts
    WHERE posts.slug = p_slug
  )
  SELECT
    p.slug,
    p.title,
    p.excerpt,
    p.cover_image,
    (
      -- Mesma categoria: +0.5
      CASE WHEN p.category = (SELECT category FROM current_post) THEN 0.5 ELSE 0 END +
      -- Tags em comum: +0.1 por tag
      (
        SELECT COUNT(*) * 0.1
        FROM unnest(p.tags) t1
        WHERE t1 = ANY((SELECT tags FROM current_post))
      ) +
      -- Keywords em comum: +0.05 por keyword
      (
        SELECT COUNT(*) * 0.05
        FROM unnest(p.keywords) k1
        WHERE k1 = ANY((SELECT keywords FROM current_post))
      )
    ) AS similarity_score
  FROM posts p
  WHERE
    p.slug != p_slug
    AND p.published = TRUE
  ORDER BY similarity_score DESC, p.date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Obter estatísticas de um post
CREATE OR REPLACE FUNCTION get_post_stats(p_slug TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'slug', slug,
    'title', title,
    'views', views,
    'likes', likes,
    'last_viewed_at', last_viewed_at
  ) INTO result
  FROM post_stats
  WHERE slug = p_slug;

  RETURN COALESCE(result, jsonb_build_object(
    'slug', p_slug,
    'views', 0,
    'likes', 0
  ));
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Aprovar comentário
CREATE OR REPLACE FUNCTION approve_comment(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE comments
  SET approved = TRUE, approved_at = NOW()
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. SCHEDULED JOBS (pg_cron) - Opcional
-- ============================================================================

-- Nota: pg_cron requer extensão instalada pelo admin do Supabase
-- Para habilitar, vá em Database > Extensions e ative "pg_cron"

-- Exemplo: Atualizar post_stats a cada hora
-- SELECT cron.schedule(
--   'refresh-post-stats',
--   '0 * * * *', -- A cada hora
--   $$SELECT refresh_post_stats()$$
-- );

-- Exemplo: Limpeza de views antigas (>90 dias) - uma vez por semana
-- SELECT cron.schedule(
--   'cleanup-old-views',
--   '0 2 * * 0', -- Domingo às 2h
--   $$DELETE FROM post_views WHERE viewed_at < NOW() - INTERVAL '90 days'$$
-- );

-- ============================================================================
-- 8. TRIGGERS PARA REAL-TIME
-- ============================================================================

-- Habilitar Realtime para as tabelas (fazer no Dashboard: Database > Replication)
-- Tabelas para habilitar:
-- - posts (para admin ver novos posts)
-- - comments (para admin ver novos comentários)
-- - post_likes (para atualizar contador em tempo real)

-- ============================================================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE posts IS 'Posts do blog - suporta posts manuais e gerados por IA';
COMMENT ON TABLE post_views IS 'Rastreamento de visualizações de posts';
COMMENT ON TABLE post_likes IS 'Sistema de likes (1 por IP)';
COMMENT ON TABLE comments IS 'Comentários dos leitores (requer aprovação)';
COMMENT ON MATERIALIZED VIEW post_stats IS 'Estatísticas agregadas de posts (atualizar periodicamente)';

COMMENT ON FUNCTION increment_post_views IS 'Registra uma nova visualização de post';
COMMENT ON FUNCTION toggle_post_like IS 'Adiciona ou remove like de um post';
COMMENT ON FUNCTION search_posts IS 'Busca full-text em posts com ranking de relevância';
COMMENT ON FUNCTION get_related_posts IS 'Retorna posts similares baseado em categoria, tags e keywords';
COMMENT ON FUNCTION get_post_stats IS 'Retorna estatísticas de um post específico';
COMMENT ON FUNCTION approve_comment IS 'Aprova um comentário para exibição pública';

-- ============================================================================
-- 10. SETUP INICIAL
-- ============================================================================

-- Após executar este schema:
-- 1. Habilitar Realtime no Dashboard:
--    Database > Replication > Enable para: posts, comments, post_likes
-- 2. (Opcional) Habilitar pg_cron:
--    Database > Extensions > Ativar "pg_cron"
-- 3. Criar usuário admin:
--    Authentication > Users > Add user
-- 4. Executar refresh inicial das stats:
--    SELECT refresh_post_stats();
