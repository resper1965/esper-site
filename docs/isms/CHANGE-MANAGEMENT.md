# Gestão de Mudanças

> Última revisão: 2025-03-24 | Versão: 1.0
> ISO 27001:2022 — A.8.32

---

## Escopo

Toda mudança no ambiente de produção (`esper.ws`) deve seguir este processo:
- Código-fonte (features, fixes, refactors)
- Infraestrutura Cloudflare (Workers, D1, R2, KV, DNS)
- Dependências (`package.json`)
- Configuração (`next.config.ts`, `wrangler.toml`)
- Documentação de segurança

---

## Classificação de Mudanças

| Tipo | Descrição | Aprovação | Exemplo |
|------|-----------|-----------|---------|
| **Standard** | Baixo risco, procedimento documentado | Auto (CI/CD) | Typo fix, dependency patch |
| **Normal** | Risco moderado, requer review | PR review | Feature, refactor, config change |
| **Emergencial** | Correção urgente de segurança | Post-facto | Security patch, hotfix |

---

## Processo — Mudanças Normais

### 1. Solicitação
- Criar GitHub Issue ou Branch
- Descrever a mudança e justificativa
- Classificar risco (baixo/médio/alto)

### 2. Desenvolvimento
- Branch: `feature/*`, `fix/*`, `security/*`
- Seguir SSDLC (`docs/SSDLC.md`)
- Testes incluídos

### 3. Review
- Pull Request para `main`
- Code review obrigatório
- CI/CD gates aprovados:
  - ✅ TypeScript check
  - ✅ ESLint
  - ✅ npm audit
  - ✅ Build success
  - ✅ Secrets scan

### 4. Aprovação
- Reviewer aprova PR
- CI/CD passa todos os gates

### 5. Deploy
- Merge para `main`
- Cloudflare Pages auto-deploy
- Preview build disponível antes do merge

### 6. Verificação
- Health check pós-deploy
- Monitorar Cloudflare Analytics (1h)
- Rollback se necessário

---

## Processo — Mudanças Emergenciais

1. Fix implementado diretamente
2. Push para `main` (bypass PR se P1)
3. Verificação imediata
4. PR retroativo com documentação
5. Post-mortem se incidente relacionado

---

## Rollback

| Método | Quando | Como |
|--------|--------|------|
| Cloudflare rollback | Deploy ruim | Dashboard → Deployments → Rollback |
| Git revert | Código problemático | `git revert <commit>` → push |
| D1 restore | Dados corrompidos | D1 export → reimport |

---

## Registro de Mudanças

Toda mudança é automaticamente registrada via:
- **Git log** — Histórico completo de commits
- **GitHub PRs** — Review trail
- **GitHub Issues** — Justificativa e tracking
- **CI/CD logs** — Resultados de verificação

---

## Auditoria

- Todo merge para `main` é rastreável (commit SHA + autor)
- Branch protection rules: require PR, require status checks
- CI/CD verifica integridade a cada push
