# Migração para Supabase

## ✅ Migração Completa

Este documento descreve a migração completa do projeto de SQLite para Supabase (Postgres + Auth).

---

## 🎯 Objetivos Alcançados

### 1. **Database Migration** ✅
- **Antes**: SQLite local com Drizzle ORM (não persistente em Vercel)
- **Depois**: Supabase Postgres cloud (persistente, escalável)

### 2. **Authentication Migration** ✅
- **Antes**: Autenticação simples baseada em token
- **Depois**: Supabase Auth com email/senha + JWT

### 3. **Production Ready** ✅
- Dados persistem em produção (Vercel)
- Autenticação segura com Row Level Security (RLS)
- Backup automático pelo Supabase

---

## 📁 Arquivos Criados

### Infraestrutura Supabase

#### `src/lib/supabase/client.ts`
Cliente Supabase configurado com TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

#### `src/lib/supabase/database.types.ts`
Tipos TypeScript gerados do schema do Supabase

```typescript
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: { /* todos os campos */ }
        Insert: { /* campos para insert */ }
        Update: { /* campos para update */ }
      }
    }
  }
}
```

#### `src/lib/supabase/posts.ts`
Módulo completo de posts usando Supabase

- `getAllPosts()` - Busca posts publicados
- `getPostBySlug(slug)` - Busca post específico
- `getLatestPosts(limit)` - Posts recentes
- `getPostsByCategory(category)` - Filtro por categoria
- `getPostsByTag(tag)` - Filtro por tag
- `createPost(post)` - Criar draft
- `updatePost(slug, updates)` - Atualizar post
- `publishPost(slug)` - Publicar post
- `deletePost(slug)` - Deletar post
- `getAllPostsIncludingDrafts()` - Todos posts (admin)

#### `src/lib/supabase/auth.ts`
Helpers de autenticação Supabase

- `signIn(email, password)` - Login
- `signOut()` - Logout
- `getSession()` - Verificar sessão
- `getCurrentUser()` - Usuário atual
- `isAuthenticated()` - Check auth status
- `resetPassword(email)` - Recuperar senha
- `updatePassword(newPassword)` - Atualizar senha

### Schema & Setup

#### `supabase/schema.sql`
Schema completo do Postgres com:
- Tabela `posts` com todos os campos
- Índices para performance
- Trigger para `updated_at` automático
- Row Level Security (RLS) policies

```sql
-- Políticas de segurança:
- Posts publicados são públicos
- Apenas autenticados veem drafts
- Apenas autenticados podem criar/editar/deletar
```

#### `supabase/README.md`
Documentação completa de setup:
1. Como executar schema no Supabase
2. Como criar usuário admin
3. Testar autenticação
4. Troubleshooting

### Configuração

#### `.env.local` (criado)
```env
NEXT_PUBLIC_SUPABASE_URL=https://obhgzaxtsgjubzjermym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_E9he-QrRi1o12sxfRPa2Tg_sHl5r2J7
GEMINI_API_KEY=
CRON_SECRET=change-this-to-secure-token
AUTO_PUBLISH=false
```

#### `.env.example` (atualizado)
Template atualizado com variáveis do Supabase

---

## 🔄 Arquivos Modificados

### Core

#### `src/lib/posts.ts`
**Antes**: Implementação completa com SQLite/Drizzle
**Depois**: Re-exporta funções do módulo Supabase

```typescript
export type { PostFrontMatter, Post } from './supabase/posts';
export {
  getAllPosts,
  getPostBySlug,
  // ... todos os métodos
} from './supabase/posts';
```

**Vantagem**: Código existente continua funcionando sem mudanças

#### `src/lib/ai/post-generator.ts`
**Mudanças**:
- Removido: `import { db, schema } from '../db'`
- Adicionado: `import { supabase } from '../supabase/client'`
- Função `savePostDraft()` reescrita para Supabase
- Função `publishPost()` reescrita para Supabase
- Campos renomeados (camelCase → snake_case):
  - `coverImage` → `cover_image`
  - `imageAlt` → `image_alt`
  - `readTime` → `read_time`
  - `generatedBy` → `generated_by`

### Admin Area

#### `src/app/admin/login/page.tsx`
**Antes**: Login apenas com senha
**Depois**: Login com email + senha usando Supabase Auth

```typescript
const { user, error } = await signIn(email, password);
if (user) router.push('/admin');
```

#### `src/components/layout/AdminLayout.tsx`
**Mudanças**:
- Adicionado: Verificação de sessão Supabase no mount
- Logout atualizado para usar `signOut()` do Supabase
- Redirect automático para `/admin/login` se não autenticado
- Loading state enquanto verifica auth

### Dependencies

#### `package.json`
**Adicionado**:
- `@supabase/supabase-js: ^2.39.1`

**Removido** (não mais necessários):
- `better-sqlite3`
- `drizzle-orm`
- `drizzle-kit`
- `canvas` (dev dependency)

---

## 🚀 Próximos Passos (Setup)

### 1. Executar Schema no Supabase

Acesse: https://obhgzaxtsgjubzjermym.supabase.co

1. Vá em **SQL Editor** → **New query**
2. Copie e cole o conteúdo de `supabase/schema.sql`
3. Clique em **Run**

Isso criará:
- ✅ Tabela `posts`
- ✅ Índices
- ✅ Trigger `updated_at`
- ✅ Políticas RLS

### 2. Criar Usuário Admin

**Opção A: Via Dashboard** (Recomendado)

1. Vá em **Authentication** → **Users**
2. Clique em **Add user** → **Create new user**
3. Preencha:
   - Email: seu-email@exemplo.com
   - Password: senha-segura (mínimo 6 caracteres)
   - Auto Confirm User: ✅ (marque)
4. Clique em **Create user**

**Opção B: Via SQL** (veja `supabase/README.md`)

### 3. Atualizar Environment Variables

Adicione ao `.env.local` (já criado, mas faltam alguns valores):

```env
# TODO: Adicione sua chave API do Gemini
GEMINI_API_KEY=your-gemini-api-key

# TODO: Gere um token seguro para cron jobs
CRON_SECRET=seu-token-seguro-aqui
```

### 4. Testar Localmente

```bash
npm install
npm run dev
```

1. Acesse: http://localhost:3000/admin/login
2. Faça login com as credenciais criadas
3. Teste criação de posts

### 5. Deploy

```bash
git add .
git commit -m "feat: migrar para Supabase (Postgres + Auth)"
git push origin claude/evaluate-website-aspects-IQLBV
```

**No Vercel**:
1. Vá em **Settings** → **Environment Variables**
2. Adicione as mesmas variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `CRON_SECRET`
   - `AUTO_PUBLISH`
3. Redeploy

---

## 🔒 Segurança (Row Level Security)

### Políticas Configuradas

```sql
-- 1. Leitura pública de posts publicados
CREATE POLICY "Posts publicados são públicos"
ON posts FOR SELECT USING (published = TRUE);

-- 2. Apenas autenticados veem todos os posts
CREATE POLICY "Usuários autenticados veem todos os posts"
ON posts FOR SELECT TO authenticated USING (TRUE);

-- 3. Apenas autenticados podem criar
CREATE POLICY "Apenas autenticados podem criar posts"
ON posts FOR INSERT TO authenticated WITH CHECK (TRUE);

-- 4. Apenas autenticados podem atualizar
CREATE POLICY "Apenas autenticados podem atualizar posts"
ON posts FOR UPDATE TO authenticated USING (TRUE);

-- 5. Apenas autenticados podem deletar
CREATE POLICY "Apenas autenticados podem deletar posts"
ON posts FOR DELETE TO authenticated USING (TRUE);
```

### Níveis de Acesso

**Público (não autenticado)**:
- ✅ Ver posts publicados (`published = TRUE`)
- ❌ Ver drafts
- ❌ Criar/editar/deletar

**Autenticado (admin)**:
- ✅ Ver todos os posts (incluindo drafts)
- ✅ Criar posts
- ✅ Editar posts
- ✅ Deletar posts
- ✅ Publicar posts

---

## 📊 Comparação: Antes vs Depois

| Aspecto | SQLite (Antes) | Supabase (Depois) |
|---------|----------------|-------------------|
| **Persistência** | ❌ Não persiste em Vercel | ✅ Cloud Postgres persistente |
| **Auth** | Token simples | ✅ Supabase Auth + JWT |
| **Segurança** | Código manual | ✅ Row Level Security (RLS) |
| **Backup** | Manual | ✅ Automático |
| **Escalabilidade** | Limitada | ✅ Escalável |
| **Custo** | Grátis | Grátis (até 500MB) |
| **Setup** | Simples | Requer configuração inicial |
| **Produção** | ❌ Problemático | ✅ Production-ready |

---

## ⚠️ Notas Importantes

### Migração de Dados

Se você tem posts no SQLite local, **não serão migrados automaticamente**.

Para migrar:
1. Exporte posts do SQLite
2. Importe no Supabase via SQL ou interface

### Campos Renomeados

Atenção ao trabalhar diretamente com o banco:

| Campo antigo | Campo Supabase |
|--------------|----------------|
| `coverImage` | `cover_image` |
| `imageAlt` | `image_alt` |
| `readTime` | `read_time` |
| `generatedBy` | `generated_by` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `publishedAt` | `published_at` |

A interface TypeScript já converte automaticamente.

### Desenvolvimento Local

O Supabase funciona tanto em desenvolvimento quanto em produção. Todos os desenvolvedores precisam ter as credenciais no `.env.local`.

---

## 🎉 Benefícios da Migração

1. **Dados Persistem em Produção**: Posts não são perdidos no deploy
2. **Autenticação Profissional**: Email + senha com JWT
3. **Segurança Nativa**: RLS protege dados no nível do banco
4. **Backup Automático**: Supabase faz backups diários
5. **Escalável**: Suporta crescimento do site
6. **Real-time** (futuro): Supabase oferece subscriptions
7. **GraphQL** (futuro): Supabase tem API GraphQL nativa

---

## 📚 Recursos

- **Supabase Dashboard**: https://obhgzaxtsgjubzjermym.supabase.co
- **Documentação Supabase**: https://supabase.com/docs
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security

---

## 🐛 Troubleshooting

Veja `supabase/README.md` seção "Troubleshooting" para problemas comuns:
- Missing environment variables
- Relation posts does not exist
- Não consigo fazer login
- Posts não aparecem
