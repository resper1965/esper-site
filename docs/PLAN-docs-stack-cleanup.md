# Plan: Documentação — Stack Realignment

## Overview

**O quê:** Limpar toda a documentação do projeto, removendo referências a stacks anteriores (Vercel, Supabase, NextAuth) e reposicionando para o stack atual.

**Por quê:** Após a migração para Cloudflare (D1/R2/KV/Workers/Pages), ~30 docs ainda mencionam Vercel e ~18 mencionam Supabase. Existem arquivos puramente históricos que devem ser eliminados.

## Stack Atual (Fonte de Verdade)

| Camada | Tecnologia | Substitui |
|--------|-----------|-----------|
| Frontend | Next.js + Turbopack | — |
| Deploy | Cloudflare Pages | ~~Vercel~~ |
| Database | Cloudflare D1 (SQLite) | ~~Supabase PostgreSQL~~ |
| Storage | Cloudflare R2 | ~~Supabase Storage~~ |
| Cache | Cloudflare KV | ~~Vercel KV~~ |
| Auth | JWT + Cloudflare Workers | ~~NextAuth / Supabase Auth~~ |
| AI | AI SDK (Anthropic/Google/OpenAI) | ~~Vercel AI Gateway~~ |
| CDN | Cloudflare CDN | ~~Vercel Edge~~ |

---

## Success Criteria

- [ ] Zero menções a "Supabase" em docs ativos (exceto contexto histórico explícito)
- [ ] Zero menções a "Vercel" em docs ativos (exceto Vercel AI SDK que é o nome real do pacote)
- [ ] Zero menções a "NextAuth"
- [ ] Todos os docs de migração eliminados
- [ ] Todos os PLANs antigos eliminados
- [ ] `docs/README.md` atualizado com índice correto
- [ ] `README.md` raiz limpo
- [ ] `ARCHITECTURE.md` reflete stack atual

---

## Fase 1: DELETAR — Docs Obsoletos (13 arquivos)

### Migração/Histórico (eliminar)
- [ ] `docs/MIGRACAO-SUPABASE.md`
- [ ] `docs/AUDITORIA-MIGRACAO-SUPABASE.md`
- [ ] `docs/SUPABASE-MELHORIAS.md`
- [ ] `docs/VERCEL-ENV-SETUP.md`
- [ ] `docs/CONFIGURAR-AI-GATEWAY-VERCEL.md`
- [ ] `docs/MIGRACAO-AI-GATEWAY.md`
- [ ] `scripts/MIGRATION-GUIDE.md`

### Planos Antigos (eliminar)
- [ ] `docs/PLAN-ssdlc-iso27001-27701.md`
- [ ] `docs/PLAN-ssdlc-remaining.md`
- [ ] `docs/PLAN-ai-agents-redator.md`

### AI Gateway Vercel (provavelmente obsoleto)
- [ ] `docs/AVALIACAO-AI-GATEWAY.md`
- [ ] `docs/ANALISE-AI-GATEWAY-DOCS.md`
- [ ] `docs/AI-GATEWAY-SELETOR-MODELOS.md`

### Diretório Supabase (eliminar)
- [ ] `supabase/` (inteiro — schema.sql, migrations, functions, README)

---

## Fase 2: REESCREVER — Docs com Referências Stale (15+ arquivos)

Para cada arquivo, remover refs a Vercel/Supabase/NextAuth e substituir pelo equivalente Cloudflare.

### Críticos (reescrever profundamente)
- [ ] `docs/ARCHITECTURE.md` — Redescrever stack completo
- [ ] `docs/AUTH-SETUP.md` — Remover NextAuth/Supabase Auth, manter JWT/Cloudflare
- [ ] `docs/GEMINI-SETUP.md` — Remover refs Vercel, focar em Cloudflare env vars
- [ ] `docs/automation.md` — Remover refs Vercel deploy
- [ ] `docs/manual-generation.md` — Remover refs Vercel/Supabase

### Limpeza Pontual (search-replace)
- [ ] `docs/GERACAO-AUTOMATICA.md` — Substituir refs
- [ ] `docs/IMPLEMENTACAO-COMPLETA.md` — Substituir refs
- [ ] `docs/CORRECOES-SEGURANCA.md` — Substituir refs
- [ ] `docs/AVALIACAO-PROCESSOS-GERACAO.md` — Substituir refs
- [ ] `docs/RELATORIO-SEGURANCA-COMPLETO.md` — Substituir refs
- [ ] `docs/AVALIACAO-SISTEMA-IA.md` — Substituir refs
- [ ] `docs/PAINEL-CONFIGURACOES.md` — Substituir refs
- [ ] `docs/AVALIACAO-SITE.md` — Substituir refs
- [ ] `docs/ATUALIZACOES-DEPENDENCIAS.md` — Substituir refs
- [ ] `docs/MANUAL-TASKS.md` — Substituir refs
- [ ] `docs/AUDITORIA-CODE-SMELLS.md` — Substituir refs
- [ ] `docs/AUDITORIA-PAINEL-ADMIN.md` — Substituir refs
- [ ] `docs/PR-DESCRIPTION.md` — Substituir refs

### ISMS (limpeza residual)
- [ ] `docs/isms/BUSINESS-CONTINUITY.md` — Remover menção Vercel

### Raiz
- [ ] `README.md` — Limpar refs Vercel/Supabase
- [ ] `CHANGELOG.md` — Manter histórico mas marcar como "pre-migration"

---

## Fase 3: VERIFICAR — Docs que Já Estão OK

Estes foram criados/reescritos nesta sessão e já estão alinhados com Cloudflare:

- ✅ `docs/SECURITY-OWASP.md` — Já reescrito
- ✅ `docs/SSDLC.md` — Criado novo
- ✅ `docs/security/VULNERABILITY-AUDIT-2025.md` — Criado novo
- ✅ `docs/isms/*` (9 outros docs) — Criados novos
- ✅ `docs/pims/*` (5 docs) — Criados novos
- ✅ `SECURITY.md` — Já atualizado
- ✅ `docs/SDLC.md` — Sem refs stale
- ✅ `docs/SEO_SETUP.md` / `SEO-ANALYSIS.md` — Sem refs stale
- ✅ `docs/bio.md` — Sem refs stale
- ✅ `docs/design-system.md` — Sem refs stale
- ✅ `docs/i18n-implementation.md` / `multilingual-content.md` — Sem refs stale
- ✅ `docs/IMAGENS-BLOG.md` — Sem refs stale
- ✅ `docs/ANALISE-CRITICA-DESIGN.md` — Sem refs stale

---

## Fase 4: ATUALIZAR INDEX

- [ ] `docs/README.md` — Remover links para docs deletados, confirmar índice final

---

## Phase X: Verificação Final

```bash
# Confirmar zero refs stale em docs ativos
grep -ri "supabase" docs/ --include="*.md" | grep -v CHANGELOG
grep -ri "vercel" docs/ --include="*.md" | grep -v CHANGELOG | grep -v "ai-sdk"
grep -ri "nextauth" docs/ --include="*.md"

# Confirmar arquivos deletados
ls docs/MIGRACAO-SUPABASE.md 2>/dev/null && echo "FAIL" || echo "OK"
ls docs/VERCEL-ENV-SETUP.md 2>/dev/null && echo "FAIL" || echo "OK"
ls supabase/ 2>/dev/null && echo "FAIL" || echo "OK"
```

- [ ] Zero matches nos greps acima
- [ ] Todos os docs deletados confirmados ausentes
- [ ] `docs/README.md` sem links quebrados
- [ ] `README.md` raiz sem refs stale
