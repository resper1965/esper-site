# SSDLC — Secure Software Development Life Cycle

> Última revisão: 2025-03-24 | Versão: 2.0 | ISO 27001:2022 + ISO 27701:2019

## Visão Geral

O SSDLC integra segurança e privacidade em todas as fases do ciclo de vida de desenvolvimento, alinhado com:

- **ISO 27001:2022** — Annex A.8.25 (Secure Development Life Cycle)
- **ISO 27701:2019** — Privacy by Design
- **OWASP SAMM** — Software Assurance Maturity Model
- **NIST SP 800-218** — Secure Software Development Framework (SSDF)

---

## Fases do SSDLC

### 1. Planejamento Seguro (Secure Planning)

| Atividade | ISO 27001 | ISO 27701 |
|-----------|----------|----------|
| Threat modeling inicial | A.5.8 | — |
| Requisitos de segurança | A.8.25 | — |
| Requisitos de privacidade | A.5.34 | A.7.2.1 |
| Classificação de dados | A.5.12 | A.7.2.8 |
| Compliance (LGPD/GDPR) | A.5.31 | A.7.2.2 |

**Artefatos produzidos:**
- Requisitos de segurança documentados
- Threat model (STRIDE)
- Classificação de dados pessoais
- Avaliação de necessidade de DPIA

---

### 2. Análise de Segurança (Security Analysis)

| Atividade | ISO 27001 | ISO 27701 |
|-----------|----------|----------|
| Análise de vulnerabilidades | A.8.8 | — |
| Revisão de dependências | A.5.19 | — |
| Análise de arquitetura segura | A.8.27 | — |
| Mapeamento de dados pessoais | A.5.34 | A.7.2.8 |
| Avaliação de terceiros | A.5.21 | A.7.2.6 |

**Artefatos produzidos:**
- Relatório de análise de risco
- Inventário de dependências
- Registro de ativos críticos
- ROPA (se dados pessoais)

---

### 3. Design Seguro (Secure Design)

| Atividade | ISO 27001 | ISO 27701 |
|-----------|----------|----------|
| Design de autenticação | A.8.5 | — |
| Design de autorização | A.5.15 | — |
| Design de criptografia | A.8.24 | — |
| Privacy by Design | A.5.34 | A.7.4.1-A.7.4.5 |
| Minimização de dados | — | A.7.4.1 |

**Princípios de design:**
- **Defense in Depth** — Múltiplas camadas de segurança
- **Least Privilege** — Acesso mínimo necessário
- **Fail Secure** — Falhas devem negar acesso
- **Separation of Duties** — Segregação de funções
- **Privacy by Default** — Máxima privacidade por padrão

**Implementação no projeto:**
- JWT + middleware para autenticação
- RBAC no admin panel
- HTTPS via Cloudflare (TLS 1.3)
- Dados pessoais mínimos coletados

---

### 4. Implementação Segura (Secure Implementation)

| Atividade | ISO 27001 | ISO 27701 |
|-----------|----------|----------|
| Secure coding (OWASP) | A.8.28 | — |
| Input validation | A.8.28 | — |
| Output encoding | A.8.28 | — |
| Error handling seguro | A.8.28 | — |
| Source code access control | A.8.4 | — |
| Consentimento implementado | — | A.7.2.3 |

**Padrões obrigatórios:**

```
✅ TypeScript strict mode (type safety)
✅ Zod/runtime validation em inputs
✅ Parameterized queries (D1 prepared statements)
✅ React auto-escaping (XSS prevention)
✅ Environment variables para secrets
✅ .gitignore para .env.local / .dev.vars
```

**Checklist por PR:**
- [ ] Input validation presente
- [ ] Output encoding correto
- [ ] Error handling não expõe dados internos
- [ ] Autenticação verificada em rotas sensíveis
- [ ] Nenhum secret no código
- [ ] Dados pessoais com base legal

---

### 5. Testes de Segurança (Security Testing)

| Tipo | Ferramenta | ISO 27001 |
|------|-----------|----------|
| SAST | ESLint + TypeScript | A.8.29 |
| Dependency scan | `npm audit` | A.8.8 |
| Security headers | Manual / Automated | A.8.29 |
| Auth testing | Manual / Vitest | A.8.29 |
| DAST | Manual penetration | A.8.29 |

**Gates de aprovação:**
- ✅ `tsc --noEmit` — 0 errors
- ✅ `npm audit` — 0 critical/high (upstream excluídos)
- ✅ `npm run build` — sucesso
- ✅ Security headers verificados
- ✅ Sem credenciais no código

---

### 6. Deploy Seguro (Secure Deployment)

| Atividade | ISO 27001 |
|-----------|----------|
| Secrets management | A.8.9 |
| Environment hardening | A.8.9 |
| HTTPS obrigatório | A.8.24 |
| Security headers | A.8.9 |
| Separation of environments | A.8.31 |
| Change management | A.8.32 |

**Configuração Cloudflare:**
```
✅ HTTPS forçado (Cloudflare managed)
✅ TLS 1.3 minimum
✅ HSTS enabled (max-age=63072000, includeSubDomains, preload)
✅ WAF (Cloudflare built-in)
✅ DDoS protection (automatic)
✅ Bot management
✅ Env vars via Cloudflare Dashboard (encrypted at rest)
```

**Processo de deploy:**
1. PR com code review → merge para `main`
2. Cloudflare Pages auto-build
3. Cloudflare edge deployment (global)
4. Health check (pós-deploy)
5. Rollback disponível via Cloudflare Dashboard

---

### 7. Operações Seguras (Secure Operations)

| Atividade | ISO 27001 |
|-----------|----------|
| Monitoramento contínuo | A.8.16 |
| Incident response | A.5.24-A.5.28 |
| Patch management | A.8.8 |
| Audit logging | A.8.15 |
| Backup e recovery | A.8.13 |

**Monitoramento:**
- Cloudflare Analytics (tráfego, erros, threats)
- Cloudflare Security Events (WAF, DDoS, bots)
- GitHub Dependabot alerts
- `npm audit` periódico

---

## Controles OWASP Top 10 — Implementação

| OWASP | Controle | Implementação |
|-------|---------|---------------|
| **A01** Broken Access Control | JWT + middleware + RBAC | `src/middleware.ts` |
| **A02** Cryptographic Failures | HTTPS (Cloudflare TLS 1.3), HSTS | `next.config.ts` |
| **A03** Injection | D1 prepared statements, TypeScript | `src/lib/cloudflare/d1.ts` |
| **A04** Insecure Design | SSDLC, threat modeling | Este documento |
| **A05** Security Misconfiguration | Security headers, hardening | `next.config.ts` |
| **A06** Vulnerable Components | `npm audit`, dependency management | `package.json` |
| **A07** Auth Failures | JWT validation, session management | `src/lib/cloudflare/auth.ts` |
| **A08** Software Integrity | CI/CD, build verification | GitHub Actions |
| **A09** Logging Failures | Structured logging, audit trail | Cloudflare Analytics |
| **A10** SSRF | URL whitelist, timeout | `src/lib/ai/` |

---

## Compliance

### LGPD (Lei Geral de Proteção de Dados — Brasil)

| Requisito | Status | Documento |
|-----------|--------|-----------|
| Política de privacidade | ✅ | `docs/pims/PRIVACY-POLICY.md` |
| Base legal documentada | ✅ | `docs/pims/DATA-INVENTORY.md` |
| Direitos do titular | ✅ | `docs/pims/DATA-SUBJECT-RIGHTS.md` |
| DPIA | ✅ | `docs/pims/DPIA.md` |
| Transferência internacional | ✅ | `docs/pims/INTERNATIONAL-TRANSFER.md` |

### GDPR (General Data Protection Regulation — Europa)

| Requisito | Status | Artigo |
|-----------|--------|--------|
| Lawful basis | ✅ | Art. 6 |
| Data minimization | ✅ | Art. 5(1)(c) |
| Right to erasure | ✅ | Art. 17 |
| Data portability | ✅ | Art. 20 |
| Privacy by design | ✅ | Art. 25 |
| Data processing records | ✅ | Art. 30 |

---

## Mapeamento ISO 27001:2022 — Controles-chave

| Controle | Título | Fase SSDLC |
|----------|--------|-----------|
| A.5.1 | Políticas de segurança | Planejamento |
| A.5.8 | Segurança em projetos | Planejamento |
| A.5.12 | Classificação de informação | Análise |
| A.5.15 | Controle de acesso | Design |
| A.5.19 | Segurança com fornecedores | Análise |
| A.5.24 | Gestão de incidentes | Operações |
| A.5.29 | Continuidade de negócios | Operações |
| A.5.34 | Privacidade e PII | Todas |
| A.8.4 | Acesso a código fonte | Implementação |
| A.8.5 | Autenticação segura | Design |
| A.8.8 | Gestão de vulnerabilidades | Testes |
| A.8.9 | Gestão de configuração | Deploy |
| A.8.15 | Logging | Operações |
| A.8.24 | Uso de criptografia | Deploy |
| A.8.25 | **SSDLC** | **Todas** |
| A.8.27 | Arquitetura segura | Design |
| A.8.28 | Secure coding | Implementação |
| A.8.29 | Security testing | Testes |
| A.8.31 | Separação de ambientes | Deploy |
| A.8.32 | Gestão de mudanças | Deploy |

---

## Referências

- [ISO/IEC 27001:2022](https://www.iso.org/standard/27001) — Information Security Management
- [ISO/IEC 27701:2019](https://www.iso.org/standard/71670.html) — Privacy Information Management
- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP SAMM](https://owaspsamm.org/)
- [NIST SP 800-218 (SSDF)](https://csrc.nist.gov/publications/detail/sp/800-218/final)
- [LGPD (Lei 13.709/2018)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [GDPR](https://gdpr.eu/)
