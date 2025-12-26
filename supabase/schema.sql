-- Criar tabela de posts
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
  generated_by TEXT, -- 'ai' | 'manual'
  score INTEGER, -- 0-10
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE INDEX IF NOT EXISTS posts_language_idx ON posts(language);
CREATE INDEX IF NOT EXISTS posts_date_idx ON posts(date DESC);
CREATE INDEX IF NOT EXISTS posts_published_date_idx ON posts(published, date DESC);

-- Trigger para atualizar updated_at automaticamente
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

-- Row Level Security (RLS)
-- Por enquanto, vamos permitir leitura pública de posts publicados
-- E apenas usuários autenticados podem criar/editar

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode ler posts publicados
CREATE POLICY "Posts publicados são públicos"
  ON posts
  FOR SELECT
  USING (published = TRUE);

-- Política: Usuários autenticados podem ler todos os posts (incluindo drafts)
CREATE POLICY "Usuários autenticados podem ler todos os posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Política: Apenas usuários autenticados podem inserir posts
CREATE POLICY "Apenas autenticados podem criar posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Política: Apenas usuários autenticados podem atualizar posts
CREATE POLICY "Apenas autenticados podem atualizar posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Política: Apenas usuários autenticados podem deletar posts
CREATE POLICY "Apenas autenticados podem deletar posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (TRUE);

-- Comentários na tabela
COMMENT ON TABLE posts IS 'Posts do blog - suporta tanto posts manuais quanto gerados por IA';
COMMENT ON COLUMN posts.slug IS 'URL-friendly identifier único';
COMMENT ON COLUMN posts.content IS 'Conteúdo completo em MDX';
COMMENT ON COLUMN posts.generated_by IS 'Origem do post: ai (gerado por IA) ou manual';
COMMENT ON COLUMN posts.score IS 'Score de qualidade de 0 a 10 (apenas para posts gerados por IA)';
COMMENT ON COLUMN posts.sources IS 'Fontes RSS usadas para gerar o post (apenas para posts de IA)';
