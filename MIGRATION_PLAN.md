# 📋 Planejamento Detalhado: Migração para Template MagicUI Blog

## 🎯 Objetivo
Migrar o blog atual para o template MagicUI Blog mantendo a funcionalidade de criação automática de posts com IA.

---

## 📊 Visão Geral

### Estrutura Atual vs Nova

| Aspecto | Atual | Novo Template |
|---------|-------|---------------|
| **Framework MDX** | @next/mdx + gray-matter | Fumadocs MDX |
| **Estrutura Posts** | `src/content/posts/` | `blog/content/` |
| **Frontmatter Schema** | Custom (gray-matter) | Zod schema (Fumadocs) |
| **Next.js** | 16.0.5 | 15.3.5 |
| **UI Components** | Custom | Radix UI + MagicUI |
| **Dark Mode** | ❌ Não | ✅ Sim |
| **Tags System** | ❌ Não | ✅ Sim |

---

## 🗂️ FASE 1: Preparação e Setup (2-3 horas)

### 1.1 Backup e Branch
- [ ] Criar branch `feature/migrate-to-magicui-template`
- [ ] Backup do código atual (git commit)
- [ ] Documentar estrutura atual de posts

### 1.2 Atualização de Dependências
- [ ] Atualizar `package.json` com dependências do template:
  ```json
  {
    "dependencies": {
      "fumadocs-core": "^15.6.2",
      "fumadocs-mdx": "^11.6.10",
      "fumadocs-ui": "^15.6.2",
      "@radix-ui/react-accordion": "^1.2.3",
      "@radix-ui/react-dialog": "^1.1.14",
      "@radix-ui/react-slot": "^1.2.3",
      "class-variance-authority": "^0.7.1",
      "clsx": "^2.1.1",
      "lucide-react": "^0.525.0",
      "motion": "^12.23.11",
      "next-themes": "^0.4.6",
      "tailwind-merge": "^3.3.1",
      "vaul": "^1.1.2",
      "zod": "^3.25.76"
    }
  }
  ```
- [ ] Decidir: manter Next.js 16 ou downgrade para 15.3.5
  - **Recomendação**: Manter Next.js 16 (testar compatibilidade)
- [ ] Executar `npm install`

### 1.3 Estrutura de Diretórios
- [ ] Criar `blog/content/` (nova estrutura)
- [ ] Criar `blog/content/drafts/` (para posts em rascunho)
- [ ] Manter `src/lib/ai/` (sistema de geração)

---

## 🏗️ FASE 2: Configuração Base (3-4 horas)

### 2.1 Configuração Fumadocs
- [ ] Copiar `source.config.ts` do template
- [ ] Adaptar schema Zod para incluir campos atuais:
  ```typescript
  // source.config.ts
  export const { docs, meta } = defineDocs({
    dir: "blog/content",
    docs: {
      schema: frontmatterSchema.extend({
        date: z.string(),
        tags: z.array(z.string()).optional(),
        featured: z.boolean().optional().default(false),
        readTime: z.string().optional(),
        author: z.string().optional(),
        thumbnail: z.string().optional(),
        // Campos atuais
        category: z.string(), // cybersecurity, counterespionage, etc.
        language: z.string().default("pt-br"),
        excerpt: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        slug: z.string().optional(), // auto-gerado se não fornecido
        generatedBy: z.string().optional(), // "ai"
        sources: z.array(z.string()).optional(), // URLs das fontes
      }),
    },
  });
  ```

### 2.2 Next.js Config
- [ ] Atualizar `next.config.ts`:
  ```typescript
  import createMDX from 'fumadocs-mdx/next';
  
  const withMDX = createMDX();
  
  export default withMDX({
    // config existente
  });
  ```

### 2.3 TypeScript Config
- [ ] Adicionar path alias para `@/.source`:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/*": ["./src/*"],
        "@/.source": ["./source.config.ts"]
      }
    }
  }
  ```

### 2.4 Scripts package.json
- [ ] Atualizar scripts:
  ```json
  {
    "scripts": {
      "dev": "fumadocs-mdx && next dev --turbopack",
      "build": "fumadocs-mdx && next build",
      "postinstall": "fumadocs-mdx"
    }
  }
  ```

---

## 🎨 FASE 3: Migração de Componentes e Layout (4-5 horas)

### 3.1 Copiar Componentes Base do Template
- [ ] Copiar `components/ui/` (Radix UI components)
- [ ] Copiar `components/blog-card.tsx`
- [ ] Copiar `components/tag-filter.tsx`
- [ ] Copiar `components/table-of-contents.tsx`
- [ ] Copiar `components/theme-provider.tsx`
- [ ] Copiar `components/theme-toggle.tsx`
- [ ] Copiar `components/site-nav.tsx`
- [ ] Copiar `components/footer.tsx`
- [ ] Copiar `mdx-components.tsx`

### 3.2 Adaptar Layout Principal
- [ ] Copiar `app/layout.tsx` do template
- [ ] Integrar ThemeProvider
- [ ] Manter fontes atuais (Geist) se necessário
- [ ] Adaptar metadata

### 3.3 Migrar Página Home
- [ ] Copiar `app/page.tsx` do template
- [ ] Adaptar para usar Fumadocs loader
- [ ] Manter hero section personalizado (Ricardo Esper)
- [ ] Integrar tag filter

### 3.4 Migrar Página de Blog
- [ ] Copiar `app/blog/[slug]/page.tsx` do template
- [ ] Adaptar para schema novo
- [ ] Manter componente MDXContent customizado se necessário

### 3.5 CSS e Estilos
- [ ] Copiar `app/globals.css` do template
- [ ] Integrar variáveis CSS atuais
- [ ] Adaptar cores para paleta atual
- [ ] Testar dark mode

---

## 🤖 FASE 4: Adaptação do Sistema de Geração de Posts (6-8 horas)

### 4.1 Adaptar Frontmatter Generator
**Arquivo**: `src/lib/ai/post-generator.ts`

- [ ] Atualizar função `generatePost()` para gerar frontmatter compatível:
  ```typescript
  // Novo formato frontmatter
  const frontmatter = `---
title: "${title}"
description: "${excerpt}" // 150-160 caracteres
date: "${new Date().toISOString().split('T')[0]}"
category: "${category}"
tags: ${JSON.stringify(keywords || [])}
featured: false
readTime: "${calculateReadTime(content)}"
author: "Ricardo Esper"
language: "pt-br"
excerpt: "${excerpt}"
keywords: ${JSON.stringify(keywords || [])}
generatedBy: "ai"
sources: ${JSON.stringify(sources.map(s => s.url))}
thumbnail: "" // opcional, pode gerar depois
---`;
  ```

### 4.2 Adaptar Função savePostDraft
**Arquivo**: `src/lib/ai/post-generator.ts`

- [ ] Mudar diretório de destino:
  ```typescript
  const postsDir = path.join(process.cwd(), 'blog/content/drafts');
  ```
- [ ] Garantir que frontmatter está no formato correto
- [ ] Validar schema Zod antes de salvar (opcional)

### 4.3 Adaptar API Routes

#### 4.3.1 `/api/generate-post/route.ts`
- [ ] Manter lógica atual
- [ ] Garantir que retorna frontmatter no formato Fumadocs
- [ ] Testar geração de post

#### 4.3.2 `/api/auto-generate/route.ts`
- [ ] Adaptar `getRecentPostTitles()` para usar Fumadocs
- [ ] Adaptar `canPublishToday()` para usar Fumadocs
- [ ] Adaptar `canPublishCategory()` para usar Fumadocs
- [ ] Testar cron job

### 4.4 Criar Helper Functions para Fumadocs
**Novo arquivo**: `src/lib/fumadocs-helpers.ts`

```typescript
import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";

const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});

export function getAllPostsFromFumadocs() {
  return blogSource.getPages();
}

export function getPostBySlugFromFumadocs(slug: string) {
  return blogSource.getPage([slug]);
}

export function getRecentPostTitles(days: number = 30): string[] {
  const posts = getAllPostsFromFumadocs();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return posts
    .filter(post => {
      const date = new Date(post.data.date);
      return date > cutoff;
    })
    .map(post => post.data.title);
}
```

### 4.5 Adaptar Scheduler
**Arquivo**: `src/lib/ai/scheduler.ts`

- [ ] Substituir `getAllPosts()` por `getAllPostsFromFumadocs()`
- [ ] Adaptar acesso a propriedades (usar `post.data.title` ao invés de `post.frontMatter.title`)
- [ ] Testar todas as funções

---

## 🔄 FASE 5: Migração de Funcionalidades Existentes (3-4 horas)

### 5.1 Página Sobre
- [ ] Adaptar `app/sobre/page.tsx` para novo layout
- [ ] Manter conteúdo atual
- [ ] Aplicar estilos do template

### 5.2 Admin/Analytics
- [ ] Adaptar `app/admin/analytics/page.tsx`
- [ ] Usar Fumadocs para contar posts
- [ ] Manter funcionalidades de estatísticas

### 5.3 Email Notifications
- [ ] Manter `src/lib/ai/email-notifier.ts` como está
- [ ] Testar envio de emails após migração

---

## 🧪 FASE 6: Testes e Ajustes (4-5 horas)

### 6.1 Testes de Geração
- [ ] Testar geração manual de post via API
- [ ] Verificar frontmatter gerado
- [ ] Validar que post aparece no blog
- [ ] Testar dark mode

### 6.2 Testes de Auto-Geração
- [ ] Testar cron job `/api/auto-generate`
- [ ] Verificar seleção de tópicos
- [ ] Verificar salvamento em drafts
- [ ] Verificar notificações por email

### 6.3 Testes de UI
- [ ] Testar navegação
- [ ] Testar filtros de tags
- [ ] Testar responsividade
- [ ] Testar dark mode toggle
- [ ] Testar TOC em posts

### 6.4 Testes de Build
- [ ] `npm run build` sem erros
- [ ] Verificar que todos os posts são gerados
- [ ] Testar deploy na Vercel

---

## 📝 FASE 7: Documentação e Finalização (2 horas)

### 7.1 Documentação
- [ ] Atualizar README.md
- [ ] Documentar novo formato de frontmatter
- [ ] Documentar estrutura de diretórios
- [ ] Criar guia de migração de posts antigos (se necessário)

### 7.2 Limpeza
- [ ] Remover código não utilizado
- [ ] Remover dependências antigas não usadas
- [ ] Limpar imports não utilizados
- [ ] Atualizar .gitignore se necessário

---

## 🔧 Detalhamento Técnico

### Estrutura de Diretórios Final

```
ricardo-esper-blog/
├── app/
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx (template)
│   ├── api/
│   │   ├── generate-post/
│   │   └── auto-generate/
│   ├── admin/
│   ├── sobre/
│   ├── layout.tsx (template)
│   ├── page.tsx (template adaptado)
│   └── globals.css (template)
├── blog/
│   └── content/
│       ├── drafts/ (posts gerados pela IA)
│       └── *.mdx (posts publicados)
├── components/
│   ├── ui/ (Radix UI)
│   ├── blog-card.tsx
│   ├── tag-filter.tsx
│   ├── theme-provider.tsx
│   └── ... (outros do template)
├── lib/
│   ├── ai/
│   │   ├── post-generator.ts (adaptado)
│   │   ├── topic-analyzer.ts
│   │   ├── scheduler.ts (adaptado)
│   │   └── ...
│   └── fumadocs-helpers.ts (novo)
├── source.config.ts (novo)
├── mdx-components.tsx (template)
└── package.json (atualizado)
```

### Mapeamento de Campos Frontmatter

| Campo Atual | Campo Novo | Notas |
|-------------|------------|-------|
| `title` | `title` | ✅ Mesmo |
| `slug` | `slug` | ✅ Auto-gerado se não fornecido |
| `date` | `date` | ✅ Mesmo formato |
| `category` | `category` | ✅ Mantido |
| `language` | `language` | ✅ Mantido |
| `excerpt` | `description` | ⚠️ Renomeado |
| `keywords` | `tags` | ⚠️ Renomeado (array) |
| `author` | `author` | ✅ Mantido |
| - | `featured` | ➕ Novo (boolean) |
| - | `readTime` | ➕ Novo (calculado) |
| - | `thumbnail` | ➕ Novo (opcional) |
| `generatedBy` | `generatedBy` | ✅ Mantido |
| `sources` | `sources` | ✅ Mantido |

### Funções a Adaptar

1. **`src/lib/ai/post-generator.ts`**
   - `generatePost()` - Adaptar frontmatter
   - `savePostDraft()` - Mudar diretório e formato

2. **`src/lib/ai/scheduler.ts`**
   - `canPublishToday()` - Usar Fumadocs
   - `canPublishCategory()` - Usar Fumadocs
   - `getRecentPostTitles()` - Usar Fumadocs
   - `getCategoryStats()` - Usar Fumadocs

3. **`src/lib/posts.ts`** (Pode ser removido ou adaptado)
   - Substituir por `src/lib/fumadocs-helpers.ts`

---

## ⚠️ Pontos de Atenção

### 1. Compatibilidade Next.js
- Template usa Next.js 15.3.5
- Projeto atual usa Next.js 16.0.5
- **Ação**: Testar se Fumadocs funciona com Next.js 16
- **Fallback**: Se não funcionar, fazer downgrade para 15.3.5

### 2. Schema Zod
- Fumadocs usa Zod para validação
- Frontmatter deve seguir schema exato
- **Ação**: Validar todos os campos antes de salvar

### 3. Diretório de Posts
- Mudança de `src/content/posts/` para `blog/content/`
- **Ação**: Atualizar todos os caminhos no código

### 4. Estrutura de Dados
- Fumadocs retorna estrutura diferente
- `post.data.title` ao invés de `post.frontMatter.title`
- **Ação**: Adaptar todos os acessos a propriedades

### 5. Build Process
- Fumadocs precisa rodar `fumadocs-mdx` antes do build
- **Ação**: Adicionar script `postinstall`

---

## 📅 Estimativa de Tempo Total

| Fase | Tempo Estimado |
|------|----------------|
| Fase 1: Preparação | 2-3 horas |
| Fase 2: Configuração Base | 3-4 horas |
| Fase 3: Componentes/Layout | 4-5 horas |
| Fase 4: Sistema de Geração | 6-8 horas |
| Fase 5: Funcionalidades | 3-4 horas |
| Fase 6: Testes | 4-5 horas |
| Fase 7: Documentação | 2 horas |
| **TOTAL** | **24-31 horas** |

---

## ✅ Checklist Final

Antes de considerar migração completa:

- [ ] Todos os posts gerados aparecem no blog
- [ ] Auto-geração funciona corretamente
- [ ] Dark mode funciona
- [ ] Tags e filtros funcionam
- [ ] TOC aparece em posts
- [ ] Build passa sem erros
- [ ] Deploy na Vercel funciona
- [ ] Notificações por email funcionam
- [ ] Analytics admin funciona
- [ ] Responsividade OK
- [ ] Performance OK

---

## 🚀 Próximos Passos Após Migração

1. Migrar posts antigos (se houver)
2. Configurar domínios customizados
3. Adicionar thumbnails automáticos (opcional)
4. Melhorar SEO com meta tags
5. Adicionar analytics (opcional)
6. Configurar RSS feed (se necessário)

---

## 📚 Referências

- [Fumadocs Documentation](https://fumadocs.vercel.app/)
- [MagicUI Blog Template](https://magicui.design/)
- [Next.js 15 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)

