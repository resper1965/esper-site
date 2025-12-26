-- Script para limpar tabelas desnecessárias e manter apenas o essencial para o blog
-- ATENÇÃO: Este script irá deletar todas as tabelas que não são necessárias para o blog

-- Desabilitar RLS temporariamente para facilitar a limpeza
SET session_replication_role = 'replica';

-- Remover tabelas relacionadas a LGPD/Privacidade (não necessárias para o blog)
DROP TABLE IF EXISTS public.processo_tratamento_sistema CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.dpia CASCADE;
DROP TABLE IF EXISTS public.taxonomia CASCADE;
DROP TABLE IF EXISTS public.plano_acao CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.tenant_users CASCADE;
DROP TABLE IF EXISTS public.processo_tratamento CASCADE;
DROP TABLE IF EXISTS public.ai_suggestions CASCADE;
DROP TABLE IF EXISTS public.areas CASCADE;
DROP TABLE IF EXISTS public.titulares CASCADE;
DROP TABLE IF EXISTS public.dados_pessoais CASCADE;
DROP TABLE IF EXISTS public.terceiros CASCADE;
DROP TABLE IF EXISTS public.sistemas CASCADE;
DROP TABLE IF EXISTS public.ropa_titulares CASCADE;
DROP TABLE IF EXISTS public.ropa_sistemas CASCADE;
DROP TABLE IF EXISTS public.ropa_dados CASCADE;
DROP TABLE IF EXISTS public.ropa_agentes CASCADE;
DROP TABLE IF EXISTS public.importacoes CASCADE;
DROP TABLE IF EXISTS public.area_diretorias CASCADE;
DROP TABLE IF EXISTS public.diretorias CASCADE;
DROP TABLE IF EXISTS public.dsar_requests CASCADE;
DROP TABLE IF EXISTS public.portal_tokens CASCADE;
DROP TABLE IF EXISTS public.policies CASCADE;
DROP TABLE IF EXISTS public.embeddings CASCADE;

-- Remover tipos customizados (enums) que não são mais necessários
DROP TYPE IF EXISTS public.dpia_status CASCADE;
DROP TYPE IF EXISTS public.taxonomia_tipo CASCADE;
DROP TYPE IF EXISTS public.plano_acao_status CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.plan_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.ropa_status CASCADE;
DROP TYPE IF EXISTS public.jurisdicao_type CASCADE;

-- Remover funções customizadas que não são mais necessárias
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Reabilitar RLS
SET session_replication_role = 'origin';

-- Verificar se a tabela posts existe, se não, criar
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
    -- Criar tabela de posts
    CREATE TABLE public.posts (
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
    CREATE INDEX posts_slug_idx ON posts(slug);
    CREATE INDEX posts_published_idx ON posts(published) WHERE published = TRUE;
    CREATE INDEX posts_category_idx ON posts(category);
    CREATE INDEX posts_language_idx ON posts(language);
    CREATE INDEX posts_date_idx ON posts(date DESC);
    CREATE INDEX posts_published_date_idx ON posts(published, date DESC);

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
  END IF;
END $$;

-- Verificar tabelas restantes
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

