# Domain Configuration & Repository Cleanup Plan

> **Domain**: esper.ws (primary)
> **Agents**: `explorer-agent` (auditoria), `devops-engineer` (config), `security-auditor` (headers/deps)

---

## 🔴 CRITICAL: Build Quebrado

O build `npm run build:cf` falha porque falta o arquivo `open-next.config.ts`. Este é o **bloqueio #1**.

---

## Achados da Auditoria (12 problemas)

### 🔴 Críticos (impedem deploy)

| # | Problema | Arquivo(s) | Ação |
|---|---------|-----------|------|
| 1 | `open-next.config.ts` ausente | raiz | Criar arquivo de configuração |
| 2 | Rotas duplicadas `app/blog/` + `app/[lang]/blog/` | `src/app/blog/`, `src/app/[lang]/blog/` | Consolidar: manter apenas `[lang]/` |
| 3 | Rotas duplicadas `app/admin/` + `app/[lang]/admin/` | `src/app/admin/`, `src/app/[lang]/admin/` | `admin/` sem `[lang]` fica — é painel interno |

### 🟡 Importantes (segurança/limpeza)

| # | Problema | Detalhe | Ação |
|---|---------|--------|------|
| 4 | `@vercel/analytics` no layout | `app/[lang]/layout.tsx:11` | Remover import + `<Analytics />` componente |
| 5 | CSP referencia `vercel.live` | `next.config.ts:69` — script-src | Remover `vercel.live` do CSP |
| 6 | Dep duplicada: `framer-motion` + `motion` | `package.json` linhas 42+46 | Manter apenas `motion` (v12 é o rebrand) |
| 7 | `replicate` dep — uso mínimo | `image-generator-common.ts` | Avaliar se necessário ou remover |
| 8 | `drizzle-kit` instalado mas zero uso | `package.json:72`, 0 imports | Remover dev dep |
| 9 | `@types/nodemailer` em deps (não devDeps) | `package.json:35` | Mover para devDependencies |

### 🟢 Melhorias (docs e contexto)

| # | Problema | Detalhe | Ação |
|---|---------|--------|------|
| 10 | ARCHITECTURE.md desatualizado | Menciona D1/R2/KV como ativos, mas estão comentados em `wrangler.toml` | Atualizar para refletir estado real |
| 11 | `package.json` name = `ricardo-esper-blog` | Genérico | Renomear para `esper-site` (alinha com wrangler) |
| 12 | `@vercel/og` usado em 4 files para OG images | Funciona no CF? | Verificar compatibilidade ou substituir |

---

## Plano de Execução (4 Fases)

### Fase 1: Fix Build (Bloqueio)
- [ ] Criar `open-next.config.ts` na raiz
- [ ] Consolidar rotas duplicadas `app/blog/` → manter `[lang]/blog/`
- [ ] Validar build: `npm run build:cf`

### Fase 2: Cleanup de Dependências
- [ ] Remover `@vercel/analytics` do `package.json` e layout
- [ ] Remover `framer-motion` (manter `motion`)
- [ ] Remover `drizzle-kit` (zero imports)
- [ ] Mover `@types/nodemailer` para devDeps
- [ ] Avaliar e remover `replicate` se desnecessário
- [ ] `npm install` para validar lockfile

### Fase 3: Segurança & Config
- [ ] Remover `vercel.live` do CSP em `next.config.ts`
- [ ] Verificar compatibilidade `@vercel/og` com Cloudflare Workers
- [ ] Atualizar `wrangler.toml` vars se necessário
- [ ] Renomear package name para `esper-site`

### Fase 4: Atualizar Docs Contextuais
- [ ] Atualizar `docs/ARCHITECTURE.md` — refletir estado real (sem D1/R2/KV ativos YET)
- [ ] Atualizar `docs/CODEBASE.md` se existir
- [ ] Review do `README.md`

---

## Verificação Final

```bash
npx tsc --noEmit          # Zero erros TS
npm run build:cf          # Build Cloudflare passa
npm run lint              # ESLint limpo
npm run test              # Testes passam
```

---

## Decisões Pendentes (para o usuário)

> [!IMPORTANT]
> 1. **Rotas `app/admin/`**: Manter SEM `[lang]` (painel interno) ou consolidar em `[lang]/admin/`?
> 2. **`replicate` dep**: Está usando geração de imagens via Replicate? Manter ou remover?
> 3. **`@vercel/og`**: Substituir por solução nativa CF ou manter (funciona em Edge Runtime)?
