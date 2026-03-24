# Gestão de Riscos de Segurança da Informação

> Última revisão: 2025-03-24 | Versão: 1.0
> ISO 27001:2022 — §6.1.2, §8.2, §8.3

---

## Metodologia

### Classificação de Probabilidade

| Nível | Descrição | Frequência |
|-------|-----------|-----------|
| 1 — Raro | Altamente improvável | < 1x/5 anos |
| 2 — Improvável | Pode ocorrer | 1x/2 anos |
| 3 — Possível | Razoável | 1x/ano |
| 4 — Provável | Esperado | Várias/ano |
| 5 — Quase certo | Inevitável | Contínuo |

### Classificação de Impacto

| Nível | Descrição | Efeito |
|-------|-----------|--------|
| 1 — Insignificante | Sem impact externo | Correção trivial |
| 2 — Menor | Inconveniência minor | < 1h indisponibilidade |
| 3 — Moderado | Perda parcial de serviço | < 24h indisponibilidade |
| 4 — Maior | Perda significativa | Breach de dados |
| 5 — Catastrófico | Dano irreversível | Breach + regulatory action |

### Matriz de Risco (Probabilidade × Impacto)

| | Insignificante (1) | Menor (2) | Moderado (3) | Maior (4) | Catastrófico (5) |
|---|---|---|---|---|---|
| **Quase certo (5)** | 5 Médio | 10 Alto | 15 Crítico | 20 Crítico | 25 Crítico |
| **Provável (4)** | 4 Baixo | 8 Médio | 12 Alto | 16 Crítico | 20 Crítico |
| **Possível (3)** | 3 Baixo | 6 Médio | 9 Alto | 12 Alto | 15 Crítico |
| **Improvável (2)** | 2 Baixo | 4 Baixo | 6 Médio | 8 Médio | 10 Alto |
| **Raro (1)** | 1 Baixo | 2 Baixo | 3 Baixo | 4 Baixo | 5 Médio |

### Tratamento

| Classificação | Ação | Prazo |
|--------------|------|-------|
| **Crítico** (15-25) | Mitigação imediata obrigatória | < 24h |
| **Alto** (9-14) | Plano de tratamento prioritário | < 7 dias |
| **Médio** (5-8) | Plano de tratamento | < 30 dias |
| **Baixo** (1-4) | Aceitar ou monitorar | Próxima revisão |

---

## Registro de Riscos

### R-001: Exposição de API Keys/Secrets

| Campo | Valor |
|-------|-------|
| **Probabilidade** | 2 — Improvável |
| **Impacto** | 5 — Catastrófico |
| **Score** | 10 — **Alto** |
| **Tratamento** | Mitigar |
| **Controles** | A.8.9, A.8.12, A.8.4 |

**Mitigações implementadas:**
- Environment variables via Cloudflare Dashboard (encrypted)
- `.gitignore` + `.dev.vars` para secrets locais
- CI/CD secrets scanning (`security.yml`)
- Nenhum secret hardcoded no código

---

### R-002: Acesso não autorizado ao admin

| Campo | Valor |
|-------|-------|
| **Probabilidade** | 3 — Possível |
| **Impacto** | 4 — Maior |
| **Score** | 12 — **Alto** |
| **Tratamento** | Mitigar |
| **Controles** | A.5.15, A.5.17, A.8.5 |

**Mitigações implementadas:**
- JWT com expiração
- Middleware de autenticação em rotas admin
- RBAC (role-based access control)
- Rate limiting (Cloudflare)
- Brute-force protection

---

### R-003: Injeção SQL (D1)

| Campo | Valor |
|-------|-------|
| **Probabilidade** | 2 — Improvável |
| **Impacto** | 4 — Maior |
| **Score** | 8 — **Médio** |
| **Tratamento** | Mitigar |
| **Controles** | A.8.28 |

**Mitigações implementadas:**
- D1 prepared statements (parameterized queries)
- TypeScript type safety
- Input validation (Zod)
- SAST no CI/CD

---

### R-004: Data breach de dados pessoais

| Campo | Valor |
|-------|-------|
| **Probabilidade** | 2 — Improvável |
| **Impacto** | 5 — Catastrófico |
| **Score** | 10 — **Alto** |
| **Tratamento** | Mitigar |
| **Controles** | A.5.34, A.8.24 |

**Mitigações implementadas:**
- Minimização de dados coletados
- HTTPS obrigatório (TLS 1.3)
- Dados pessoais identificados no ROPA
- DPIA documentado
- Processo de notificação (ANPD/GDPR)

---

### R-005: Indisponibilidade do serviço

| Campo | Valor |
|-------|-------|
| **Probabilidade** | 1 — Raro |
| **Impacto** | 3 — Moderado |
| **Score** | 3 — **Baixo** |
| **Tratamento** | Aceitar |
| **Controles** | A.5.29, A.5.30 |

**Justificativa:**
- Cloudflare SLA: 99.99% uptime
- Edge deployment global (300+ PoPs)
- Serverless = sem servidor para falhar
- Fallback automático via Cloudflare

---

### R-006: Dependência vulnerável (supply chain)

| Campo | Valor |
|-------|-------|
| **Probabilidade** | 4 — Provável |
| **Impacto** | 3 — Moderado |
| **Score** | 12 — **Alto** |
| **Tratamento** | Mitigar |
| **Controles** | A.8.8, A.5.19 |

**Mitigações implementadas:**
- `npm audit` no CI/CD
- GitHub Dependabot alerts
- `package-lock.json` para reproducibilidade
- Security scan semanal (`security.yml` cron)
- Review manual de atualizações

---

### R-007: XSS (Cross-Site Scripting)

| Campo | Valor |
|-------|-------|
| **Probabilidade** | 2 — Improvável |
| **Impacto** | 3 — Moderado |
| **Score** | 6 — **Médio** |
| **Tratamento** | Mitigar |
| **Controles** | A.8.28 |

**Mitigações implementadas:**
- React auto-escaping
- CSP (Content Security Policy) header
- TypeScript type safety
- ESLint security rules

---

### R-008: Abuso de API/IA (costs, prompt injection)

| Campo | Valor |
|-------|-------|
| **Probabilidade** | 3 — Possível |
| **Impacto** | 3 — Moderado |
| **Score** | 9 — **Alto** |
| **Tratamento** | Mitigar |
| **Controles** | A.8.28, A.5.15 |

**Mitigações implementadas:**
- Rate limiting (Cloudflare + aplicação)
- Autenticação obrigatória para APIs de IA
- Token budgets/limits
- Input sanitization

---

## Resumo de Riscos

| ID | Risco | Score | Classificação | Tratamento |
|----|-------|-------|--------------|------------|
| R-001 | Exposição de secrets | 10 | Alto | Mitigar |
| R-002 | Acesso admin não autorizado | 12 | Alto | Mitigar |
| R-003 | SQL injection (D1) | 8 | Médio | Mitigar |
| R-004 | Data breach | 10 | Alto | Mitigar |
| R-005 | Indisponibilidade | 3 | Baixo | Aceitar |
| R-006 | Supply chain (deps) | 12 | Alto | Mitigar |
| R-007 | XSS | 6 | Médio | Mitigar |
| R-008 | Abuso de API/IA | 9 | Alto | Mitigar |

---

## Revisão

- **Frequência:** Trimestral ou após incidente
- **Responsável:** Ricardo Esper
- **Próxima revisão:** 2025-06-24
