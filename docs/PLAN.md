# 🎼 Plano de Implementação — Site Esper Melhorias

## Visão Geral

Implementação de melhorias em 3 fases para o site [esper.ws](https://esper.ws), um site pessoal/profissional
de Ricardo Esper (CISO) construído com Next.js 15 App Router.

**Domínios envolvidos:** Frontend, SEO, Performance, Segurança

---

## ✅ Itens Já Implementados (Descobertos na Auditoria)

| Item | Status | Arquivo |
|------|--------|---------|
| `sitemap.xml` | ✅ Já existe | `src/app/sitemap.ts` |
| `robots.txt` | ✅ Já existe | `src/app/robots.ts` |
| RSS feed | ✅ Já existe | `src/app/rss.xml/route.ts` |
| Blog search | ✅ Já existe | `src/app/[lang]/busca/page.tsx` |
| `not-found.tsx` | ✅ Já existe | 2 arquivos |
| `<img>` → `next/image` | ✅ Já usando | Nenhum `<img>` encontrado |

---

## FASE 1 — Correções Críticas

### 1.1 Remover `force-dynamic` de páginas estáticas

**Agente:** `performance-optimizer`

Páginas que NÃO precisam de `force-dynamic` (conteúdo estático):
- `src/app/[lang]/sobre/page.tsx` (linha 42) — já tem `generateStaticParams()`
- `src/app/[lang]/servicos/page.tsx` (linha 45) — conteúdo estático do dicionário

Páginas que DEVEM manter `force-dynamic` (dados dinâmicos):
- `src/app/[lang]/busca/page.tsx` — busca com query params
- `src/app/blog/page.tsx` — lista posts do Supabase
- `src/app/blog/[slug]/page.tsx` — post individual do Supabase
- `src/app/[lang]/admin/*` — todas as páginas admin

**Ação:** Remover `export const dynamic = "force-dynamic"` das páginas sobre e servicos.
Em blog pages, trocar para `revalidate = 3600` (ISR 1h) em vez de `force-dynamic`.

**Arquivos modificados:**
- `src/app/[lang]/sobre/page.tsx` — remover linha 42
- `src/app/[lang]/servicos/page.tsx` — remover linha 45
- `src/app/blog/page.tsx` — trocar `force-dynamic` por `revalidate = 3600`
- `src/app/blog/[slug]/page.tsx` — trocar `force-dynamic` por `revalidate = 3600`

---

### 1.2 Corrigir WhatsApp placeholder

**Agente:** `frontend-specialist`

Número `5511999999999` é placeholder. Precisa do número real de Ricardo Esper.

**Arquivos:**
- `src/app/[lang]/servicos/page.tsx` (linha 356)
- `src/app/servicos/page.tsx` (linha 214)

> [!IMPORTANT]
> Preciso confirmar o número correto de WhatsApp com o usuário antes de implementar.

---

### 1.3 Adicionar OG Images

**Agente:** `seo-specialist` + `frontend-specialist`

O `metadata.ts` já tem `openGraph` configurado, mas sem `images`.

**Ação:**
- Criar `src/app/opengraph-image.tsx` usando `next/og` (ImageResponse)
- Design: fundo escuro com gradiente cyber, nome "Ricardo Esper", título "CISO | Cybersecurity"
- Adicionar referência de imagem OG no `metadata.ts`

**Arquivo novo:** `src/app/opengraph-image.tsx`
**Arquivo modificado:** `src/app/metadata.ts` — adicionar `images` ao openGraph

---

## FASE 2 — SEO & Conteúdo

### 2.1 Structured Data (Service Schema) na página de serviços

**Agente:** `seo-specialist`

Adicionar JSON-LD `Service` schema para cada serviço listado.

**Arquivo modificado:** `src/app/[lang]/servicos/page.tsx`

---

### 2.2 Related Posts no blog

**Agente:** `frontend-specialist`

Adicionar seção "Posts Relacionados" no final de cada post, baseado em categorias.

**Arquivos:**
- Novo: `src/components/blog/related-posts.tsx`
- Modificado: `src/app/blog/[slug]/page.tsx` e/ou `src/app/[lang]/blog/[slug]/page.tsx`

---

### 2.3 Breadcrumb com schema markup

**Agente:** `seo-specialist` + `frontend-specialist`

Componente reutilizável de breadcrumb com JSON-LD `BreadcrumbList`.

**Arquivo novo:** `src/components/ui/breadcrumb.tsx`
**Modificados:** Todas as páginas internas (sobre, servicos, blog)

---

## FASE 3 — UX & Qualidade

### 3.1 Error Boundaries

**Agente:** `frontend-specialist`

Não existe nenhum `error.tsx` no projeto.

**Arquivos novos:**
- `src/app/[lang]/error.tsx` — error boundary global com design consistente
- `src/app/[lang]/blog/error.tsx` — error boundary específico do blog

---

### 3.2 Loading States

**Agente:** `frontend-specialist`

Não existe nenhum `loading.tsx` no projeto.

**Arquivos novos:**
- `src/app/[lang]/loading.tsx` — skeleton loader global
- `src/app/[lang]/blog/loading.tsx` — skeleton para lista de posts
- `src/app/[lang]/blog/[slug]/loading.tsx` — skeleton para post individual

---

### 3.3 Analytics (Plausible ou Umami)

**Agente:** `frontend-specialist`

Adicionar analytics privacy-friendly.

> [!IMPORTANT]
> Preciso confirmar com o usuário qual serviço de analytics prefere (Plausible, Umami, ou outro).

---

## Agentes Utilizados

| # | Agente | Foco | Fase |
|---|--------|------|------|
| 1 | `performance-optimizer` | force-dynamic, ISR, caching | Fase 1 |
| 2 | `frontend-specialist` | Components, UX, error/loading | Fases 1-3 |
| 3 | `seo-specialist` | OG images, structured data, breadcrumbs | Fases 1-2 |

---

## Plano de Verificação

### Testes automatizados existentes

```bash
npm test
# Roda: vitest run
# Testes em: src/__tests__/utils.test.ts, categories.test.ts, reading-time.test.ts
```

### Verificação visual (browser)

Após cada fase, verificar no dev server (`http://localhost:3333`):

**Fase 1:**
1. Acessar `/pt-BR/sobre` e `/pt-BR/servicos` — devem carregar normalmente sem `force-dynamic`
2. Verificar que o link WhatsApp tem o número correto (ou confirmar placeholder corrigido)
3. Inspecionar source do HTML para confirmar OG tags com imagem

**Fase 2:**
4. Acessar `/pt-BR/servicos` — inspecionar JSON-LD para schema `Service`
5. Acessar qualquer post do blog — verificar seção "Posts Relacionados"
6. Verificar breadcrumbs em páginas internas

**Fase 3:**
7. Acessar uma rota inexistente (`/pt-BR/pagina-inexistente`) — deve mostrar not-found
8. Verificar loading states navegando entre páginas

### Verificação de build

```bash
npm run build
# Confirmar que sobre e servicos são geradas como static
# Confirmar que blog pages usam ISR (revalidate)
```

---

## Estimativa

| Fase | Tempo estimado | Complexidade |
|------|---------------|--------------|
| Fase 1 | ~30 min | Baixa |
| Fase 2 | ~1-2h | Média |
| Fase 3 | ~1-2h | Média |
| **Total** | **~3-4h** | |

---

## Perguntas Pendentes

1. **Qual é o número correto de WhatsApp?** (atualmente placeholder `5511999999999`)
2. **Qual serviço de analytics prefere?** (Plausible, Umami, Google Analytics, ou nenhum por agora?)
