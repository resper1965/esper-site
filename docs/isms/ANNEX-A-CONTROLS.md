# Controles do Annex A — Implementação Detalhada

> Última revisão: 2025-03-24 | Versão: 1.0
> ISO 27001:2022 — Annex A (controles implementados)

Este documento detalha a implementação técnica dos controles do Annex A que estão marcados como ✅ ou 🔄 no `SOA.md`.

---

## A.5 — Controles Organizacionais

### A.5.1 — Políticas de Segurança

**Implementação:**
- `docs/isms/ISMS-POLICY.md` — Política principal
- `docs/SSDLC.md` — Segurança no desenvolvimento
- `docs/isms/ACCESS-CONTROL.md` — Controle de acesso
- Revisão: Anual ou após incidente

### A.5.7 — Threat Intelligence

**Implementação:**
- GitHub Dependabot alerts (automático)
- `npm audit` no CI/CD (cada push)
- Scan semanal via `security.yml` cron
- Monitoramento de CVEs em dependências críticas

### A.5.12 — Classificação de Informações

**Níveis:**

| Nível | Rotulagem | Exemplos |
|-------|----------|---------|
| Público | Nenhuma | Blog posts, portfolio |
| Interno | `<!-- INTERNAL -->` em docs | Código-fonte, configs |
| Confidencial | `[CONFIDENTIAL]` | API keys, dados pessoais |

### A.5.15 — Controle de Acesso

**Implementação técnica:**
```
Visitante → Rotas públicas apenas
Admin → JWT middleware → RBAC check → Recurso
```
- JWT emitido após login com credenciais válidas
- Middleware verifica token em toda rota `/admin/*`
- RBAC implementado no admin panel

### A.5.23 — Segurança em Cloud

**Cloudflare Security Stack:**
- WAF (Web Application Firewall) — regras personalizáveis
- DDoS Protection — automático, unlimited, L3/L4/L7
- Bot Management — challenge pages
- SSL/TLS — TLS 1.3, HSTS preload
- DNSSEC — assinatura de DNS
- Rate Limiting — por IP/rota

---

## A.8 — Controles Tecnológicos

### A.8.4 — Acesso a Código-Fonte

**Implementação:**
- GitHub repository: privado
- Branch protection rules em `main`:
  - Require PR review
  - Require status checks to pass
  - No direct push
- Acesso: Owner only

### A.8.5 — Autenticação Segura

**Implementação:**
- Password hashing: bcrypt/argon2 (cost factor ≥ 12)
- JWT com expiração configurável
- Token storage: httpOnly + secure cookie
- MFA obrigatório: GitHub (TOTP), Cloudflare (TOTP)
- Rate limiting em endpoint de login

### A.8.8 — Gestão de Vulnerabilidades

**Implementação CI/CD:**
```yaml
# security.yml — executa em cada push e semanalmente
- npm audit --audit-level=moderate
- Secrets scanning (grep patterns)
- Security headers verification
- ESLint security rules
```

- GitHub Dependabot: alerts + auto-PRs
- npm audit: CI/CD gate
- Patch management: < 24h para vulnerabilidades críticas

### A.8.9 — Gestão de Configuração

**Arquivos de configuração:**
| Arquivo | Propósito | Sensível |
|---------|----------|----------|
| `next.config.ts` | App config, security headers | Não |
| `wrangler.toml` | Cloudflare Workers config | Não |
| `tsconfig.json` | TypeScript config | Não |
| `.dev.vars` | Env vars locais | Sim (gitignored) |
| Cloudflare env vars | Produção secrets | Sim (encrypted) |

### A.8.12 — Prevenção de Vazamento de Dados

**Implementação:**
- `.gitignore`: `.dev.vars`, `.env*`, `node_modules/`
- CI/CD secrets scan: grep para patterns (`sk-`, `key-`, etc.)
- GitHub push protection (se habilitado)
- Code review checklist inclui verificação de secrets

### A.8.13 — Backup

**Estratégia:**
| Dado | Backup | RPO |
|------|--------|-----|
| Código | Git (cada commit) | 0 |
| D1 | Export semanal | 7 dias |
| R2 | Versioning | 30 dias |
| Config | Git (docs/) | 0 |

### A.8.24 — Criptografia

**Em trânsito:**
- HTTPS obrigatório (Cloudflare managed SSL)
- TLS 1.3 (minimum TLS 1.2)
- HSTS: `max-age=63072000; includeSubDomains; preload`

**Em repouso:**
- D1: Cloudflare managed encryption
- R2: Cloudflare managed encryption
- Env vars: Encrypted at rest (Cloudflare)

### A.8.25 — SSDLC

**Implementação:** Ver `docs/SSDLC.md`
- 7 fases com gates de segurança
- OWASP Top 10 mapping
- ISO 27001 control mapping por fase
- Privacy by Design integrado

### A.8.28 — Secure Coding

**Padrões aplicados:**
- TypeScript strict mode (type safety)
- React auto-escaping (XSS prevention)
- D1 prepared statements (SQL injection prevention)
- Zod validation (input validation)
- ESLint rules (code quality + security)
- No `eval()`, no `dangerouslySetInnerHTML` sem sanitização

### A.8.29 — Security Testing

**Pipeline CI/CD:**
1. `tsc --noEmit` — Type safety verification
2. `npm run lint` — Static analysis (ESLint)
3. `npm audit` — Dependency vulnerability scan
4. Secrets scan — Pattern matching para API keys
5. Security headers check — CSP, HSTS verification
6. `npm run build` — Build integrity

### A.8.32 — Gestão de Mudanças

**Implementação:** Ver `docs/isms/CHANGE-MANAGEMENT.md`
- Git-based workflow (branch → PR → review → merge)
- CI/CD gates obrigatórios
- Rollback via Cloudflare Deployments ou Git revert
