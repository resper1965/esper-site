# SDLC — Software Development Life Cycle

> Última revisão: 2025-03-24 | Versão: 2.0 (Cloudflare)

## Visão Geral

Ciclo de vida de desenvolvimento do **esper-site**, com gates de segurança integrados em cada fase, alinhado com ISO 27001:2022 (A.8.25 — Secure Development Life Cycle).

---

## Stack Atual

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | Next.js 15 + React 19 + TypeScript 5 |
| **Hosting** | Cloudflare Pages (auto-deploy via Git) |
| **Database** | Cloudflare D1 (SQLite edge) |
| **Storage** | Cloudflare R2 (S3-compatible) |
| **Cache** | Cloudflare KV |
| **DNS/CDN** | Cloudflare (global edge network) |
| **CI/CD** | GitHub Actions → Cloudflare Pages |
| **Styling** | Tailwind CSS 4 |

---

## Fases do SDLC

### 1. Planejamento (Planning)

**Objetivos:**
- Definir requisitos funcionais e não-funcionais
- Estimar recursos e prazos
- Definir métricas de sucesso
- Identificar requisitos de segurança e privacidade

**Artefatos:**
- User stories / Issues (GitHub Issues)
- Roadmap (GitHub Projects)
- Documentação de requisitos (`docs/PLAN-*.md`)

**🔒 Security Gate:**
- Classificação de dados (público, interno, confidencial)
- Requisitos de compliance (LGPD/GDPR)
- Threat modeling inicial

> ISO 27001: A.5.8 (Segurança em gestão de projetos)

---

### 2. Análise (Analysis)

**Objetivos:**
- Análise de requisitos técnicos
- Identificação de riscos (segurança, performance, privacidade)
- Análise de viabilidade e dependências
- Revisão de arquitetura proposta

**Artefatos:**
- Análise de riscos (`docs/isms/RISK-MANAGEMENT.md`)
- Diagramas de arquitetura
- Análise de impacto (DPIA se dados pessoais)

**🔒 Security Gate:**
- Avaliação de risco de segurança
- Análise de dependências de terceiros
- Revisão de modelos de ameaças

> ISO 27001: A.5.8, A.8.25

---

### 3. Design (Design)

**Objetivos:**
- Design de sistema e APIs
- Design de UI/UX
- Design de schema D1 (SQLite)
- Design de armazenamento R2/KV

**Artefatos:**
- Diagramas de arquitetura
- Schema D1 (migrations em `cloudflare/migrations/`)
- Especificações de API
- Design system (`docs/design-system.md`)

**🔒 Security Gate:**
- Design de autenticação/autorização
- Princípios: Defense in Depth, Least Privilege, Fail Secure
- Separação de dados pessoais

> ISO 27001: A.8.25, A.8.27 (Secure system architecture)

---

### 4. Implementação (Implementation)

**Objetivos:**
- Desenvolvimento seguindo padrões de código
- Implementação de testes
- Code review obrigatório em PRs

**Padrões:**
- Conventional Commits (`feat:`, `fix:`, `docs:`, `security:`)
- ESLint + TypeScript strict mode
- Component-based architecture (React Server Components)
- Input validation (Zod/TypeScript)

**🔒 Security Gate:**
- Secure coding practices (OWASP)
- SAST via ESLint
- Dependency scanning (`npm audit`)
- Nenhuma credencial no código

> ISO 27001: A.8.28 (Secure coding), A.8.4 (Access to source code)

---

### 5. Testes (Testing)

**Objetivos:**
- Testes unitários (Vitest)
- Testes de integração
- Type checking (`tsc --noEmit`)
- Security testing

**Estratégia:**
- Build verification (`npm run build`)
- TypeScript strict checking
- ESLint security rules
- Dependency audit
- Manual QA

**🔒 Security Gate:**
- SAST (ESLint + TypeScript)
- Dependency vulnerability scan
- Security headers verification
- Authentication/Authorization testing

> ISO 27001: A.8.29 (Security testing), A.8.8 (Vulnerability management)

---

### 6. Deploy (Deployment)

**Processo:**
1. Push para branch → PR
2. CI/CD executa testes + build
3. Code review + aprovação
4. Merge para `main`
5. Cloudflare Pages auto-deploy
6. Verificação pós-deploy

**🔒 Security Gate:**
- Secrets em environment variables (Cloudflare Dashboard)
- HTTPS obrigatório (Cloudflare managed)
- Security headers configurados
- Rollback plan documentado
- Zero secrets no Git

> ISO 27001: A.8.31 (Separation of environments), A.8.32 (Change management)

---

### 7. Manutenção (Maintenance)

**Atividades:**
- Monitoramento via Cloudflare Analytics
- Atualizações de dependências
- Patches de segurança
- Performance optimization (Core Web Vitals)

**🔒 Security Gate:**
- Patch management contínuo
- Monitoramento de anomalias
- Revisão periódica de acessos
- Incident response readiness

> ISO 27001: A.8.8 (Vulnerability management), A.5.24 (Incident response)

---

## Workflow de Desenvolvimento

### Branch Strategy

| Branch | Propósito |
|--------|----------|
| `main` | Produção (auto-deploy) |
| `feature/*` | Novas funcionalidades |
| `fix/*` | Correções de bugs |
| `security/*` | Patches de segurança (prioridade) |
| `docs/*` | Documentação |

### Commit Convention

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `security`

### Code Review Checklist

1. ✅ Sem credenciais hardcoded
2. ✅ Input validation presente
3. ✅ Error handling adequado
4. ✅ Tipos TypeScript corretos
5. ✅ Testes incluídos
6. ✅ Build passa
7. ✅ Sem vulnerabilidades novas

---

## Métricas e KPIs

### Qualidade
- TypeScript coverage: 100% strict
- Build success rate
- Tempo médio de code review

### Performance
- Lighthouse scores ≥ 90
- Core Web Vitals (LCP, FID, CLS)
- Cloudflare cache hit ratio

### Segurança
- Vulnerabilidades críticas: 0
- Tempo de patch (critical): < 24h
- Security headers score: A+

---

## Referências

- [ISO 27001:2022 — Annex A.8.25](https://www.iso.org/standard/27001) — Secure Development Life Cycle
- [OWASP SAMM](https://owaspsamm.org/) — Software Assurance Maturity Model
- [NIST SSDF](https://csrc.nist.gov/publications/detail/sp/800-218/final) — Secure Software Development Framework
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
