# Auditoria de Code Smells, Pacotes Não Usados e Código Deprecated

**Data:** 2025-01-XX  
**Status:** Análise Completa

---

## 📊 Resumo Executivo

### Problemas Encontrados
- **Pacotes não usados:** 5
- **Pacotes deprecated/legados:** 5
- **Código legado:** 1 diretório completo + vários arquivos
- **Bad smells:** Console.logs excessivos, uso de `any`, código duplicado
- **Componentes não usados:** 1

---

## 🔍 Análise Detalhada

### 1. **Pacotes Não Usados** ❌

#### 1.1. `@radix-ui/react-dialog`
**Status:** Não usado  
**Evidência:** Nenhuma importação encontrada  
**Ação:** Remover

#### 1.2. `@radix-ui/react-visually-hidden`
**Status:** Não usado  
**Evidência:** Nenhuma importação encontrada  
**Ação:** Remover

#### 1.3. `rehype-raw`
**Status:** Não usado  
**Evidência:** Nenhuma importação encontrada  
**Ação:** Remover

#### 1.4. `zod`
**Status:** Não usado  
**Evidência:** Nenhuma importação encontrada (apenas em source.config.ts que foi removido)  
**Ação:** Remover

#### 1.5. `vaul`
**Status:** Não usado  
**Evidência:** Drawer usa `motion/react`, não `vaul`  
**Ação:** Remover

---

### 2. **Pacotes Deprecated/Legados** ⚠️

#### 2.1. `better-sqlite3` + `@types/better-sqlite3`
**Status:** Legado (não mais usado)  
**Evidência:** 
- Código em `src/lib/db/` não é mais importado
- Migração completa para Supabase
**Ação:** Remover pacotes e código legado

#### 2.2. `drizzle-orm` + `drizzle-kit`
**Status:** Legado (não mais usado)  
**Evidência:**
- Código em `src/lib/db/` não é mais importado
- Scripts `db:*` não são mais necessários
**Ação:** Remover pacotes, código e scripts

#### 2.3. `@types/mdx`
**Status:** Não necessário  
**Evidência:** Não usamos mais MDX  
**Ação:** Remover

---

### 3. **Código Legado** 🗑️

#### 3.1. `src/lib/db/` (Diretório Completo)
**Status:** Não usado  
**Arquivos:**
- `index.ts` - Conexão SQLite/Drizzle
- `schema.ts` - Schema SQLite
- `migrate.ts` - Migrations SQLite

**Evidência:** Nenhuma importação encontrada  
**Ação:** Remover diretório completo

#### 3.2. Scripts de Migração MDX
**Status:** Executados, não mais necessários  
**Arquivos:**
- `scripts/migrate-posts-to-db.ts` - Migração SQLite (legado)
- Scripts que referenciam MDX files

**Ação:** Manter apenas scripts úteis, remover legados

#### 3.3. `src/components/MDXContent.tsx`
**Status:** Não usado  
**Evidência:** Nenhuma importação encontrada  
**Ação:** Remover

---

### 4. **Bad Smells** 🐛

#### 4.1. Console.logs Excessivos
**Arquivos afetados:** 20 arquivos  
**Problema:** Console.logs em produção  
**Impacto:** Performance e poluição de logs  
**Ação:** 
- Substituir por logger apropriado
- Remover logs de debug
- Manter apenas logs de erro críticos

#### 4.2. Uso de `any` e `eslint-disable`
**Ocorrências:** 43  
**Problema:** Perda de type safety  
**Impacto:** Bugs potenciais, dificuldade de manutenção  
**Ação:**
- Tipar corretamente
- Reduzir uso de `eslint-disable`
- Usar tipos específicos

#### 4.3. Código Duplicado
**Problemas identificados:**
- `formatDate` duplicado em vários arquivos
- Lógica de filtragem por idioma repetida
- Validação de posts repetida

**Ação:** Extrair para funções utilitárias

#### 4.4. Comentários Legados
**Problema:** Comentários referenciando SQLite/MDX  
**Exemplo:** `// Force dynamic rendering to avoid SQLite access during build`  
**Ação:** Atualizar ou remover comentários

---

### 5. **Componentes e Funções Não Usados** 🔍

#### 5.1. `MDXContent.tsx`
**Status:** Não usado  
**Ação:** Remover

#### 5.2. `PostCard.tsx` vs `BlogCard.tsx`
**Status:** `PostCard` usado apenas em `blog/page.tsx`  
**Problema:** Duplicação com `BlogCard`  
**Ação:** Unificar ou verificar necessidade

---

### 6. **Dependências Duplicadas** 🔄

#### 6.1. `motion` vs `framer-motion`
**Status:** Ambos presentes  
**Uso:**
- `framer-motion`: usado em `hero.tsx`
- `motion`: usado em `drawer.tsx`

**Problema:** `motion` é fork mais novo do `framer-motion`  
**Ação:** Avaliar unificação (preferir `motion` se for mais novo)

---

### 7. **Scripts Não Necessários** 📜

#### 7.1. Scripts de Regeneração de Imagens (MDX)
**Status:** Não mais necessários  
**Arquivos:**
- `regenerate-all-images.js`
- `regenerate-all-images.mjs`
- `regenerate-all-images-free.mjs`
- `regenerate-images-gemini.ts` (referencia MDX)
- `generate-post-images.js`
- `generate-greyscale-images.js`

**Ação:** Avaliar remoção ou atualização para Supabase

---

## 📋 Plano de Ação

### **Prioridade ALTA** (Remover Agora)
1. ✅ Remover pacotes não usados
2. ✅ Remover código legado (src/lib/db/)
3. ✅ Remover componentes não usados
4. ✅ Limpar scripts legados

### **Prioridade MÉDIA** (Melhorar Código)
5. 🔄 Reduzir console.logs
6. 🔄 Tipar código (reduzir `any`)
7. 🔄 Extrair código duplicado

### **Prioridade BAIXA** (Otimizações)
8. 🔄 Unificar motion/framer-motion
9. 🔄 Atualizar comentários legados
10. 🔄 Limpar scripts de imagem (se não usados)

---

## 🎯 Métricas de Sucesso

### **Critérios de Limpeza:**
- [ ] 0 pacotes não usados
- [ ] 0 código legado (SQLite/Drizzle)
- [ ] 0 componentes não usados
- [ ] Console.logs reduzidos em 80%
- [ ] Uso de `any` reduzido em 50%
- [ ] Código duplicado extraído

---

## ⚠️ Riscos e Considerações

### **Riscos:**
1. **Remover código legado:** Verificar se não há dependências ocultas
2. **Remover pacotes:** Verificar se não quebram builds
3. **Limpar scripts:** Verificar se ainda são necessários

### **Considerações:**
1. **Backup:** Manter backup de código removido
2. **Testes:** Testar após cada remoção
3. **Incremental:** Fazer uma limpeza por vez

---

**Última Atualização:** 2025-01-XX

