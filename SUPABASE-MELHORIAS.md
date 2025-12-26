# Melhorias com Supabase 🚀

Este documento lista recursos do Supabase que podem agregar funcionalidades atualmente não existentes no site.

---

## 📊 Status Atual

### ✅ Já Implementado
- Postgres Database com posts
- Supabase Auth (email + senha)
- Row Level Security (RLS)

### 🎯 Oportunidades de Melhoria

---

## 1. 📁 Supabase Storage - Upload de Imagens

### Problema Atual
- Imagens geradas pelo Gemini são salvas no filesystem local (`/public/images/posts/`)
- Em Vercel, o filesystem é efêmero (não persiste entre deploys)
- Imagens podem ser perdidas

### Solução com Supabase Storage

**Criar bucket para imagens:**

```sql
-- No SQL Editor do Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- Política de acesso público para leitura
CREATE POLICY "Public can view post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Apenas autenticados podem fazer upload
CREATE POLICY "Authenticated can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');
```

**Implementação:**

```typescript
// src/lib/supabase/storage.ts
import { supabase } from './client';

export async function uploadPostImage(
  file: Buffer,
  filename: string,
  contentType: string = 'image/png'
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(filename, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  // Retornar URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(data.path);

  return publicUrl;
}
```

**Atualizar `image-generator-gemini.ts`:**

```typescript
// Em vez de fs.writeFileSync:
const imageBuffer = Buffer.from(imageBase64, 'base64');
const filename = `${slug}-${Date.now()}.png`;
const imageUrl = await uploadPostImage(imageBuffer, filename);

// Salvar imageUrl no banco
```

**Benefícios:**
- ✅ Imagens persistem indefinidamente
- ✅ CDN global automático (rápido em qualquer lugar)
- ✅ Backup automático
- ✅ Redimensionamento on-the-fly (transformation API)

**Custo:**
- Grátis até 1GB (suficiente para ~500-1000 imagens de posts)

---

## 2. 🔍 Full-Text Search - Busca Avançada

### Problema Atual
- Não existe busca de posts no site
- Usuários não conseguem encontrar conteúdo

### Solução com Postgres Full-Text Search

**Criar índice de busca:**

```sql
-- Adicionar coluna de busca
ALTER TABLE posts
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(content, '')), 'C')
) STORED;

-- Criar índice GIN (rápido para full-text search)
CREATE INDEX posts_search_idx ON posts USING GIN(search_vector);
```

**API de busca:**

```typescript
// src/lib/supabase/search.ts
export async function searchPosts(query: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .textSearch('search_vector', query, {
      type: 'websearch',
      config: 'portuguese'
    })
    .order('date', { ascending: false })
    .limit(20);

  if (error || !data) return [];

  // Processar e retornar posts...
}
```

**Interface de busca:**

```typescript
// src/app/[lang]/busca/page.tsx
'use client';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);

  const handleSearch = async () => {
    const posts = await searchPosts(query);
    setResults(posts);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar posts..."
      />
      <button onClick={handleSearch}>Buscar</button>

      {results.map(post => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
```

**Benefícios:**
- ✅ Busca rápida (índice GIN)
- ✅ Suporta português (stemming, stopwords)
- ✅ Ranking por relevância
- ✅ Busca em título, excerpt e conteúdo

---

## 3. 💬 Sistema de Comentários

### Problema Atual
- Posts não têm comentários
- Sem engajamento com leitores

### Solução com Supabase

**Schema:**

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT comments_content_min_length CHECK (length(content) >= 10)
);

CREATE INDEX comments_post_idx ON comments(post_slug, approved);
CREATE INDEX comments_created_idx ON comments(created_at DESC);

-- RLS: Apenas comentários aprovados são públicos
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved comments"
ON comments FOR SELECT
USING (approved = TRUE);

CREATE POLICY "Anyone can create comments"
ON comments FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Authenticated can approve comments"
ON comments FOR UPDATE
TO authenticated
USING (TRUE);
```

**API:**

```typescript
// src/lib/supabase/comments.ts
export async function createComment(
  postSlug: string,
  authorName: string,
  authorEmail: string,
  content: string
) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      post_slug: postSlug,
      author_name: authorName,
      author_email: authorEmail,
      content,
      approved: false, // Requer moderação
    }])
    .select()
    .single();

  return { data, error };
}

export async function getPostComments(postSlug: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_slug', postSlug)
    .eq('approved', true)
    .order('created_at', { ascending: true });

  return { data, error };
}
```

**Componente:**

```typescript
// src/components/Comments.tsx
export function Comments({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [postSlug]);

  const loadComments = async () => {
    const { data } = await getPostComments(postSlug);
    setComments(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createComment(postSlug, name, email, content);
    alert('Comentário enviado! Aguardando aprovação.');
    setContent('');
  };

  // Renderizar formulário + lista de comentários
}
```

**Moderação no Admin:**

```typescript
// src/app/admin/comments/page.tsx
export default function CommentsPage() {
  // Listar comentários pendentes
  // Botão aprovar/rejeitar
}
```

**Benefícios:**
- ✅ Engajamento com leitores
- ✅ Moderação antes de publicar
- ✅ RLS protege dados
- ✅ Notificação de novos comentários (via webhook)

---

## 4. 📈 Analytics Nativo - Views e Likes

### Problema Atual
- Não há tracking de visualizações
- Não sabemos quais posts são mais populares

### Solução com Supabase

**Schema:**

```sql
CREATE TABLE post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_ip TEXT,
  user_agent TEXT
);

CREATE INDEX post_views_slug_idx ON post_views(post_slug);
CREATE INDEX post_views_date_idx ON post_views(viewed_at DESC);

CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  liked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(post_slug, user_ip) -- 1 like por IP
);

CREATE INDEX post_likes_slug_idx ON post_likes(post_slug);

-- View para estatísticas
CREATE VIEW post_stats AS
SELECT
  p.slug,
  p.title,
  COUNT(DISTINCT pv.id) AS views,
  COUNT(DISTINCT pl.id) AS likes,
  p.date
FROM posts p
LEFT JOIN post_views pv ON p.slug = pv.post_slug
LEFT JOIN post_likes pl ON p.slug = pl.post_slug
GROUP BY p.slug, p.title, p.date;
```

**API:**

```typescript
// src/lib/supabase/analytics.ts
export async function trackView(postSlug: string, ip?: string, userAgent?: string) {
  await supabase.from('post_views').insert([{
    post_slug: postSlug,
    user_ip: ip,
    user_agent: userAgent,
  }]);
}

export async function toggleLike(postSlug: string, userIp: string) {
  // Verificar se já existe
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_slug', postSlug)
    .eq('user_ip', userIp)
    .single();

  if (existing) {
    // Remove like
    await supabase.from('post_likes').delete().eq('id', existing.id);
    return { liked: false };
  } else {
    // Adiciona like
    await supabase.from('post_likes').insert([{
      post_slug: postSlug,
      user_ip: userIp,
    }]);
    return { liked: true };
  }
}

export async function getPostStats(postSlug: string) {
  const { data } = await supabase
    .from('post_stats')
    .select('*')
    .eq('slug', postSlug)
    .single();

  return data;
}
```

**Implementação na página do post:**

```typescript
// src/app/[lang]/blog/[slug]/page.tsx
useEffect(() => {
  // Rastrear visualização
  trackView(params.slug);
}, [params.slug]);

const handleLike = async () => {
  const userIp = await fetch('/api/ip').then(r => r.json());
  await toggleLike(params.slug, userIp.ip);
};
```

**Dashboard de Analytics:**

```typescript
// src/app/admin/analytics/page.tsx
export default function AnalyticsPage() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data } = await supabase
      .from('post_stats')
      .select('*')
      .order('views', { ascending: false })
      .limit(20);

    setStats(data || []);
  };

  return (
    <div>
      <h1>Top Posts</h1>
      {stats.map(stat => (
        <div key={stat.slug}>
          <h3>{stat.title}</h3>
          <p>Views: {stat.views} | Likes: {stat.likes}</p>
        </div>
      ))}
    </div>
  );
}
```

**Benefícios:**
- ✅ Dados de engajamento
- ✅ Identificar posts populares
- ✅ Insights para conteúdo futuro
- ✅ Views materializadas (rápidas)

---

## 5. 🔔 Real-time Subscriptions - Admin em Tempo Real

### Problema Atual
- Admin precisa recarregar página para ver novos posts/comentários
- Sem notificação de novos eventos

### Solução com Supabase Realtime

**Habilitar Realtime:**

```sql
-- No Supabase Dashboard: Database > Replication
-- Habilitar realtime para tabelas: posts, comments
```

**Implementação:**

```typescript
// src/app/admin/page.tsx
useEffect(() => {
  // Subscribe para novos posts
  const subscription = supabase
    .channel('posts-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      },
      (payload) => {
        console.log('Novo post criado!', payload.new);
        // Mostrar notificação toast
        toast.success(`Novo post: ${payload.new.title}`);
        // Atualizar lista
        refreshPosts();
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

**Benefícios:**
- ✅ Admin vê mudanças instantaneamente
- ✅ Múltiplos admins sincronizados
- ✅ Notificações em tempo real
- ✅ Reduz polling/recarregamento

---

## 6. 📧 Edge Functions - Notificações por Email

### Problema Atual
- Sistema de notificação via SMTP configurado no código
- Depende de servidor Next.js rodando

### Solução com Supabase Edge Functions

**Criar Edge Function:**

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { type, data } = await req.json();

  // Enviar email via SendGrid, Mailgun, etc
  if (type === 'new_post') {
    await sendEmail({
      to: 'ricardo@esper.com',
      subject: `Novo post gerado: ${data.title}`,
      html: `
        <h1>${data.title}</h1>
        <p>Score: ${data.score}/10</p>
        <a href="https://esper-site.vercel.app/admin/posts/${data.slug}">
          Revisar post
        </a>
      `
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

**Trigger automático via Database Webhook:**

```sql
-- No Supabase: Database > Webhooks
-- Criar webhook que chama Edge Function quando:
-- - Novo post é criado
-- - Novo comentário é criado
```

**Benefícios:**
- ✅ Serverless (não depende de servidor rodando)
- ✅ Escalável automaticamente
- ✅ Logs centralizados
- ✅ Sem cold start (Deno rápido)

---

## 7. 🌐 Database Functions - Lógica Complexa no Banco

### Solução com Postgres Functions

**Exemplo: Auto-incrementar views:**

```sql
CREATE OR REPLACE FUNCTION increment_post_views(p_slug TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO post_views (post_slug, viewed_at)
  VALUES (p_slug, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Chamar direto do cliente
-- await supabase.rpc('increment_post_views', { p_slug: slug })
```

**Exemplo: Buscar posts relacionados:**

```sql
CREATE OR REPLACE FUNCTION get_related_posts(p_slug TEXT, p_limit INT DEFAULT 3)
RETURNS TABLE (
  slug TEXT,
  title TEXT,
  excerpt TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p2.slug,
    p2.title,
    p2.excerpt,
    -- Calcular similaridade baseado em tags/categoria
    (
      CASE WHEN p1.category = p2.category THEN 0.5 ELSE 0 END +
      -- Contar tags em comum
      (SELECT COUNT(*) FROM unnest(p1.tags) t1
       INTERSECT
       SELECT * FROM unnest(p2.tags)) * 0.1
    ) AS similarity
  FROM posts p1
  CROSS JOIN posts p2
  WHERE p1.slug = p_slug
    AND p2.slug != p_slug
    AND p2.published = TRUE
  ORDER BY similarity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

**Benefícios:**
- ✅ Performance (lógica no banco)
- ✅ Menos round-trips
- ✅ Código reutilizável

---

## 8. 📊 Scheduled Functions - Cron Jobs Nativos

### Problema Atual
- Cron job rodando via Vercel Cron (limitado no free tier)

### Solução com Supabase pg_cron

**Instalar extensão:**

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar limpeza de views antigas (performance)
SELECT cron.schedule(
  'cleanup-old-views',
  '0 2 * * *', -- 2h da manhã todos os dias
  $$
  DELETE FROM post_views
  WHERE viewed_at < NOW() - INTERVAL '90 days'
  $$
);

-- Agendar relatório semanal
SELECT cron.schedule(
  'weekly-stats',
  '0 9 * * 1', -- Segunda-feira 9h
  $$
  SELECT send_weekly_report() -- Chama Edge Function
  $$
);
```

**Benefícios:**
- ✅ Grátis (sem limite de invocações)
- ✅ Mais confiável que Vercel Cron
- ✅ Logs nativos

---

## 📋 Resumo de Prioridades

### 🔥 Alta Prioridade (Impacto Imediato)

1. **Supabase Storage** (elimina problema de persistência de imagens)
2. **Full-Text Search** (engajamento + UX)
3. **Analytics Nativo** (insights de conteúdo)

### 🚀 Média Prioridade (Melhoria de UX)

4. **Sistema de Comentários** (engajamento)
5. **Real-time Subscriptions** (admin mais eficiente)

### 💡 Baixa Prioridade (Nice to Have)

6. **Edge Functions** (otimização)
7. **Database Functions** (performance)
8. **pg_cron** (confiabilidade)

---

## 💰 Custo Estimado

**Plano Free do Supabase:**
- ✅ 500MB Database
- ✅ 1GB Storage
- ✅ 2GB Bandwidth
- ✅ 500K Edge Function invocations
- ✅ Unlimited API requests

**Estimativa para o blog:**
- Database: ~100MB (suficiente para 1000+ posts)
- Storage: ~500MB (500-1000 imagens)
- Bandwidth: ~1GB/mês (depende de tráfego)

**Conclusão:** Todas as melhorias cabem no **plano Free** 🎉

---

## 🎯 Roadmap Sugerido

### Fase 1 (Semana 1-2): Persistência
- [ ] Implementar Supabase Storage
- [ ] Migrar geração de imagens para Storage
- [ ] Testar em produção

### Fase 2 (Semana 3-4): Engajamento
- [ ] Implementar Full-Text Search
- [ ] Adicionar página de busca
- [ ] Implementar Analytics (views/likes)

### Fase 3 (Semana 5-6): Comunidade
- [ ] Criar sistema de comentários
- [ ] Painel de moderação no admin
- [ ] Email de notificação (Edge Function)

### Fase 4 (Ongoing): Otimização
- [ ] Real-time para admin
- [ ] Database Functions para queries complexas
- [ ] Migrar cron jobs para pg_cron

---

## 📚 Recursos

- **Supabase Storage**: https://supabase.com/docs/guides/storage
- **Full-Text Search**: https://supabase.com/docs/guides/database/full-text-search
- **Realtime**: https://supabase.com/docs/guides/realtime
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **Database Functions**: https://supabase.com/docs/guides/database/functions

---

**Próximo passo recomendado:** Implementar **Supabase Storage** para resolver o problema de persistência de imagens em produção.
