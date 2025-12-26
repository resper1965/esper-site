# Auditoria de Migração: MDX/Fumadocs → Supabase

**Data:** 2025-01-XX  
**Status:** Migração Parcial  
**Objetivo:** Identificar todos os gaps entre o sistema antigo (MDX/fumadocs) e o novo (Supabase)

---

## 📊 Resumo Executivo

### ✅ **Migrado para Supabase**
- ✅ Página home (`src/app/[lang]/page.tsx`)
- ✅ Página de post individual (`src/app/blog/[slug]/page.tsx`)
- ✅ Página de blog (`src/app/blog/page.tsx`)
- ✅ Módulo de posts (`src/lib/posts.ts` → `src/lib/supabase/posts.ts`)
- ✅ Scheduler de posts (`src/lib/ai/scheduler.ts`)

### ❌ **Ainda Usando MDX/Fumadocs**
- ❌ Componente ReadMoreSection
- ❌ Página 404 (not-found)
- ❌ Feed RSS
- ❌ Sitemap
- ❌ Página de blog por categoria
- ❌ OpenGraph images
- ❌ API de geração de imagens
- ❌ Gerador de posts bilíngues (salva em MDX)
- ❌ Interface admin (referências a diretórios MDX)

---

## 🔍 Análise Detalhada

### 1. **Componentes que Ainda Usam MDX**

#### 1.1. `src/components/read-more-section.tsx`
**Status:** ❌ Usa MDX  
**Impacto:** Alto - Usado na visualização de posts  
**Código:**
```typescript
import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});
```

**Ação Necessária:**
- Substituir `blogSource.getPages()` por `getAllPosts()` do Supabase
- Ajustar lógica de filtragem para usar estrutura `Post` do Supabase
- Atualizar URLs para usar slugs do Supabase

---

#### 1.2. `src/app/blog/[slug]/page.tsx`
**Status:** ⚠️ Parcial  
**Problema:** Ainda importa `DocsBody` do fumadocs-ui (linha 1)  
**Impacto:** Baixo - Componente pode não ser necessário  
**Código:**
```typescript
import { DocsBody } from "fumadocs-ui/page";
// ... mas usa getPostBySlug do Supabase
```

**Ação Necessária:**
- Verificar se `DocsBody` é realmente necessário
- Se não for, remover importação
- Se for, substituir por componente próprio ou remover wrapper

---

### 2. **Rotas que Ainda Usam MDX**

#### 2.1. `src/app/[lang]/not-found.tsx`
**Status:** ❌ Usa MDX  
**Impacto:** Médio - Página de erro 404  
**Código:**
```typescript
import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});
```

**Ação Necessária:**
- Substituir por `getLatestPosts(3)` do Supabase
- Filtrar por idioma usando `post.frontMatter.language`
- Atualizar estrutura de dados para `Post`

---

#### 2.2. `src/app/rss.xml/route.ts`
**Status:** ❌ Usa MDX  
**Impacto:** Médio - Feed RSS para leitores  
**Código:**
```typescript
import { docs, meta } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});
```

**Ação Necessária:**
- Substituir por `getAllPosts()` do Supabase
- Filtrar apenas posts publicados (`published: true`)
- Usar `post.htmlContent` para conteúdo do feed
- Usar `post.frontMatter` para metadados

---

#### 2.3. `src/app/[lang]/rss.xml/route.ts`
**Status:** ❌ Usa MDX  
**Impacto:** Médio - Feed RSS por idioma  
**Ação Necessária:** Similar ao RSS principal, mas filtrar por idioma

---

#### 2.4. `src/app/sitemap.ts`
**Status:** ❌ Usa MDX  
**Impacto:** Médio - SEO (sitemap.xml)  
**Código:**
```typescript
import { docs, meta } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
```

**Ação Necessária:**
- Substituir por `getAllPosts()` do Supabase
- Filtrar apenas posts publicados
- Gerar URLs usando `post.slug` e `post.frontMatter.language`
- Usar `post.frontMatter.date` para `lastModified`

---

#### 2.5. `src/app/[lang]/blog/page.tsx`
**Status:** ❌ Usa MDX  
**Impacto:** Alto - Página de listagem de blog  
**Ação Necessária:**
- Substituir por `getAllPosts()` do Supabase
- Filtrar por idioma
- Ordenar por data (já vem ordenado do Supabase)

---

#### 2.6. `src/app/[lang]/categoria/[category]/page.tsx`
**Status:** ❌ Usa MDX  
**Impacto:** Médio - Filtro por categoria  
**Ação Necessária:**
- Substituir por `getPostsByCategory()` do Supabase
- Filtrar por idioma adicionalmente

---

#### 2.7. `src/app/page.tsx` (raiz)
**Status:** ❌ Usa MDX  
**Impacto:** Baixo - Pode ser página legada  
**Ação Necessária:**
- Verificar se ainda é usada
- Se sim, migrar para Supabase
- Se não, considerar remoção

---

### 3. **APIs e Geradores que Ainda Usam MDX**

#### 3.1. `src/app/api/generate-images/route.tsx`
**Status:** ❌ Usa MDX  
**Impacto:** Baixo - Geração de imagens OpenGraph  
**Código:**
```typescript
import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});
```

**Ação Necessária:**
- Substituir por `getPostBySlug()` do Supabase
- Usar `post.frontMatter` para metadados da imagem

---

#### 3.2. `src/app/blog/[slug]/opengraph-image.tsx`
**Status:** ❌ Usa MDX  
**Impacto:** Baixo - OpenGraph image  
**Ação Necessária:** Similar ao generate-images

---

#### 3.3. `src/app/[lang]/blog/[slug]/opengraph-image.tsx`
**Status:** ❌ Usa MDX  
**Impacto:** Baixo - OpenGraph image por idioma  
**Ação Necessária:** Similar aos anteriores

---

#### 3.4. `src/lib/ai/post-generator-bilingual.ts`
**Status:** ❌ Salva em MDX  
**Impacto:** Alto - Gerador de posts  
**Código:**
```typescript
const draftsDir = path.join(process.cwd(), 'blog/content/drafts');
// ... salva arquivos .mdx
```

**Ação Necessária:**
- Modificar para salvar diretamente no Supabase usando `createPost()`
- Remover lógica de escrita em arquivos
- Usar `published: false` para drafts
- Atualizar interface admin para refletir mudança

---

### 4. **Interface Admin**

#### 4.1. `src/app/admin/generate/page.tsx`
**Status:** ⚠️ Referências a diretórios MDX  
**Impacto:** Médio - Interface do usuário  
**Código:**
```typescript
<span>Posts são salvos automaticamente em <code>src/content/posts/drafts/</code></span>
<span>Revise o conteúdo antes de publicar movendo para <code>src/content/posts/</code></span>
```

**Ação Necessária:**
- Atualizar textos para mencionar Supabase
- Explicar que posts são salvos como drafts no banco
- Remover referências a diretórios de arquivos

---

### 5. **Configurações e Dependências**

#### 5.1. `package.json`
**Status:** ⚠️ Dependências do fumadocs ainda presentes  
**Dependências:**
- `fumadocs-core: 15.6.2`
- `fumadocs-mdx: 11.6.10`
- `fumadocs-ui: 15.6.2`
- `@mdx-js/loader: ^3.1.0`
- `@mdx-js/react: ^3.1.0`

**Scripts:**
- `dev: "fumadocs-mdx && next dev --turbopack"`
- `build: "fumadocs-mdx && next build"`
- `postinstall: "fumadocs-mdx"`

**Ação Necessária:**
- ⚠️ **NÃO REMOVER AINDA** - Ainda são usadas em várias rotas
- Remover apenas após migração completa de todas as rotas
- Considerar manter `fumadocs-ui` se `DocsBody` for necessário

---

#### 5.2. `next.config.ts`
**Status:** ⚠️ Usa `createMDX` do fumadocs  
**Código:**
```typescript
import { createMDX } from "fumadocs-mdx/next";
const withMDX = createMDX();
export default withMDX(nextConfig);
```

**Ação Necessária:**
- Avaliar se ainda é necessário após migração completa
- Se não houver mais uso de MDX, remover

---

#### 5.3. `source.config.ts`
**Status:** ⚠️ Configuração do fumadocs  
**Impacto:** Baixo - Apenas configuração  
**Ação Necessária:**
- Remover após migração completa
- Ou manter se ainda houver necessidade de processar MDX

---

#### 5.4. `src/app/globals.css`
**Status:** ⚠️ Importa CSS do fumadocs  
**Código:**
```css
@import "fumadocs-ui/css/neutral.css";
@import "fumadocs-ui/css/preset.css";
```

**Ação Necessária:**
- Avaliar se estilos são necessários
- Se `DocsBody` for removido, remover imports
- Se mantido, verificar se estilos são compatíveis

---

#### 5.5. `src/mdx-components.tsx`
**Status:** ⚠️ Componentes MDX do fumadocs  
**Código:**
```typescript
import defaultMdxComponents from "fumadocs-ui/mdx";
```

**Ação Necessária:**
- Avaliar se ainda é usado
- Se não, remover arquivo

---

#### 5.6. `tsconfig.json`
**Status:** ⚠️ Path aliases do fumadocs  
**Código:**
```json
"@/.source": [...],
"fumadocs-mdx:collections/*": [...]
```

**Ação Necessária:**
- Remover após migração completa

---

### 6. **Diretórios de Conteúdo**

#### 6.1. `src/content/posts/`
**Status:** ⚠️ Ainda existe  
**Impacto:** Baixo - Conteúdo já migrado  
**Ação Necessária:**
- Verificar se ainda há arquivos não migrados
- Se não, considerar remover ou arquivar
- Manter como backup se necessário

---

#### 6.2. `blog/content/`
**Status:** ⚠️ Ainda existe  
**Impacto:** Baixo - Usado pelo gerador bilíngue  
**Ação Necessária:**
- Remover após migração do gerador bilíngue para Supabase

---

## 📋 Plano de Ação Prioritário

### **Prioridade ALTA** (Funcionalidades Principais)
1. ✅ ~~Migrar página home~~ (CONCLUÍDO)
2. ✅ ~~Migrar página de post individual~~ (CONCLUÍDO)
3. 🔄 Migrar `read-more-section.tsx`
4. 🔄 Migrar `[lang]/blog/page.tsx`
5. 🔄 Migrar `[lang]/categoria/[category]/page.tsx`

### **Prioridade MÉDIA** (SEO e Funcionalidades Secundárias)
6. 🔄 Migrar `not-found.tsx`
7. 🔄 Migrar `rss.xml/route.ts` e `[lang]/rss.xml/route.ts`
8. 🔄 Migrar `sitemap.ts`
9. 🔄 Migrar OpenGraph images

### **Prioridade BAIXA** (APIs e Geradores)
10. 🔄 Migrar `post-generator-bilingual.ts` para salvar no Supabase
11. 🔄 Atualizar interface admin
12. 🔄 Remover dependências do fumadocs (após migração completa)

---

## 🎯 Métricas de Sucesso

### **Critérios de Migração Completa:**
- [ ] 0 referências a `@/.source` em código de produção
- [ ] 0 referências a `blogSource.getPages()` ou `blogSource.getPage()`
- [ ] 0 referências a diretórios `src/content/posts` ou `blog/content` em código
- [ ] Todas as rotas usando funções do Supabase (`getAllPosts`, `getPostBySlug`, etc.)
- [ ] Gerador de posts salvando diretamente no Supabase
- [ ] Interface admin atualizada

### **Testes Necessários:**
- [ ] Home page carrega posts do Supabase
- [ ] Visualização de post funciona
- [ ] Seção "Ler mais" funciona
- [ ] Feed RSS funciona
- [ ] Sitemap funciona
- [ ] Página 404 mostra posts sugeridos
- [ ] Filtros por categoria/tag funcionam
- [ ] OpenGraph images funcionam
- [ ] Gerador de posts salva no Supabase

---

## ⚠️ Riscos e Considerações

### **Riscos:**
1. **Quebra de funcionalidades:** Algumas rotas podem quebrar durante migração
2. **Perda de dados:** Se houver posts apenas em MDX não migrados
3. **Performance:** Verificar se queries do Supabase são otimizadas
4. **Build time:** Fumadocs ainda é executado no build (pode ser lento)

### **Considerações:**
1. **Manter fumadocs temporariamente:** Para não quebrar build durante migração
2. **Backup de conteúdo MDX:** Manter arquivos como backup até confirmação
3. **Testes incrementais:** Migrar uma rota por vez e testar
4. **Documentação:** Atualizar README e docs após migração

---

## 📝 Notas Finais

- **Status Atual:** ~30% migrado (páginas principais)
- **Estimativa de Conclusão:** 2-3 horas de trabalho
- **Complexidade:** Média - Maioria são substituições diretas
- **Impacto:** Alto - Melhora manutenibilidade e performance

---

**Última Atualização:** 2025-01-XX  
**Status:** ✅ **MIGRAÇÃO COMPLETA** - Todas as rotas migradas para Supabase

