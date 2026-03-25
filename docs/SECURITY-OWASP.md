# Segurança OWASP TOP 10 — Implementação (Cloudflare Stack)

> Versão 2.0 · Última atualização: 2025-03-24  
> Stack: Next.js 15 + Cloudflare Workers/D1/R2

## Visão Geral

Este documento detalha as implementações de segurança alinhadas com OWASP TOP 10 2021 para o site ricardoesper.com.br, operando na stack Cloudflare (Workers, D1, R2).

---

## A01:2021 – Broken Access Control

### Implementações

1. **`requireAuth.ts` — guard central**
   - Todas as rotas admin protegidas por autenticação JWT
   - Fail-closed: sem JWT_SECRET = server error (nunca bypass)
   - Cookie `sb-access-token` com flags HttpOnly + Secure + SameSite

2. **Middleware de Roteamento**
   - `src/middleware.ts` redireciona `/admin/*` para `/admin/login` se não autenticado
   - Rotas de API POST/PUT/DELETE verificam token antes de processar

3. **Separação de Privilégios**
   - Anon key (leitura pública) vs Admin JWT (escrita)
   - API de geração AI protegida por `CRON_SECRET`

### Arquivos Relacionados
- `src/lib/requireAuth.ts`
- `src/middleware.ts`
- `src/app/api/posts/route.ts`

---

## A02:2021 – Cryptographic Failures

### Implementações

1. **HTTPS Obrigatório**
   - TLS 1.3 via Cloudflare (edge-terminated)
   - HSTS header (max-age=63072000, includeSubDomains, preload)

2. **Senhas e Tokens**
   - Senha admin: SHA-256 + HMAC (hash + secret combinados)
   - JWT assinado com HMAC-SHA256
   - `JWT_SECRET` e `CRON_SECRET` sem fallback (fail-closed)

3. **Dados Sensíveis**
   - Secrets em Wrangler secrets / `.dev.vars`
   - `.dev.vars` no `.gitignore`
   - Nenhuma credencial no código fonte

### Arquivos Relacionados
- `src/lib/cloudflare/auth.ts`
- `wrangler.toml` (bindings)
- `.gitignore`

---

## A03:2021 – Injection

### Implementações

1. **SQL Injection Prevention**
   - D1 com prepared statements (`db.prepare().bind()`)
   - Nenhuma concatenação de strings SQL
   - TypeScript types para validação de inputs

2. **XSS Prevention**
   - Content-Security-Policy configurado em headers
   - React escapa automaticamente conteúdo renderizado
   - Sanitização de inputs de comentários

3. **Command Injection**
   - Nenhuma execução de comandos shell
   - API Gemini chamada com payloads validados

### Arquivos Relacionados
- `src/lib/cloudflare/posts.ts` (prepared statements)
- `src/middleware.ts` (CSP via headers)
- `src/components/Comments.tsx`

---

## A04:2021 – Insecure Design

### Implementações

1. **Arquitetura Segura**
   - Separação client/server (RSC + API routes)
   - Princípio do menor privilégio (anon vs admin)
   - Defesa em profundidade (edge WAF + middleware + API guard)

2. **Threat Modeling**
   - DPIA realizado: `docs/pims/DPIA.md`
   - Vulnerability Audit: `docs/security/VULNERABILITY-AUDIT-2025.md`
   - ISMS documentado: `docs/isms/`

### Arquivos Relacionados
- `docs/SECURITY-OWASP.md` (este arquivo)
- `docs/isms/ISMS-POLICY.md`
- `docs/security/VULNERABILITY-AUDIT-2025.md`

---

## A05:2021 – Security Misconfiguration

### Implementações

1. **Headers de Segurança**
   - Content-Security-Policy
   - X-Frame-Options: SAMEORIGIN
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy (camera, microphone, geolocation negados)

2. **Configuração Segura**
   - `poweredByHeader: false` no Next.js
   - TypeScript strict mode
   - ESLint com regras de segurança

3. **Cloudflare**
   - WAF habilitado
   - Bot Management ativo
   - D1 encryption at-rest
   - Workers isolados (sem shared memory)

### Arquivos Relacionados
- `next.config.ts` (headers)
- `wrangler.toml`
- `eslint.config.mjs`

---

## A06:2021 – Vulnerable and Outdated Components

### Implementações

1. **Gerenciamento de Dependências**
   - `package-lock.json` versionado
   - Dependências auditadas regularmente
   - `npm audit` como parte do workflow

2. **Monitoramento**
   - Dependências mínimas (sem excesso de libs)
   - Remoção de dependências não utilizadas
   - Atualizações de segurança aplicadas

### Arquivos Relacionados
- `package.json`
- `package-lock.json`

---

## A07:2021 – Identification and Authentication Failures

### Implementações

1. **Autenticação JWT Custom**
   - Login via email + senha → JWT emitido
   - Token em cookie HttpOnly + Secure + SameSite=Lax
   - Expiração: 24 horas

2. **Rate Limiting**
   - 5 tentativas de login por IP a cada 15 minutos
   - Implementado em `src/lib/rate-limit.ts`
   - Resposta 429 com mensagem clara

3. **Fail-Closed Design**
   - Sem `JWT_SECRET` → erro 500 (nunca aceita token sem secret)
   - Sem `CRON_SECRET` → CRON jobs recusados

### Arquivos Relacionados
- `src/lib/cloudflare/auth.ts`
- `src/lib/rate-limit.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/admin/login/page.tsx`

---

## A08:2021 – Software and Data Integrity Failures

### Implementações

1. **Integridade de Dados**
   - Validação de inputs em todas as API routes
   - TypeScript para type safety
   - Prepared statements (sem SQL dinâmico)

2. **Deploy Seguro**
   - Wrangler deploy com secrets injection
   - Builds verificados localmente antes de deploy
   - Nenhum script de terceiros não auditado

### Arquivos Relacionados
- `wrangler.toml`
- `src/app/api/posts/route.ts`

---

## A09:2021 – Security Logging and Monitoring Failures

### Implementações

1. **Logging**
   - Erros capturados com console.error estruturado
   - Logs de autenticação (login success/failure)
   - Rate limiting logged com IP + timestamp

2. **Monitoramento**
   - Cloudflare Analytics (real-time)
   - Cloudflare WAF logs
   - Workers error tracking

3. **Auditoria**
   - Vulnerability Audit documentado
   - Revisão semestral prevista no ISMS

### Arquivos Relacionados
- `src/lib/rate-limit.ts` (log de bloqueios)
- Cloudflare Dashboard (analytics + WAF)

---

## A10:2021 – Server-Side Request Forgery (SSRF)

### Implementações

1. **Validação de URLs**
   - Apenas Gemini API como serviço externo
   - URL hardcoded (não aceita input de usuário)
   - Timeout em requisições

2. **APIs Externas**
   - Gemini API chamada apenas por CRON (não por input do user)
   - CRON_SECRET validado antes de execução
   - Sem proxy ou fetch dinâmico de URLs

### Arquivos Relacionados
- `src/lib/ai/post-generator.ts`
- `src/app/api/generate/route.ts`

---

## Checklist de Segurança

### Headers de Segurança ✅
- [x] Content-Security-Policy
- [x] X-Frame-Options
- [x] X-Content-Type-Options
- [x] Strict-Transport-Security
- [x] Referrer-Policy
- [x] Permissions-Policy

### Autenticação ✅
- [x] JWT HMAC-SHA256 implementado
- [x] Cookie HttpOnly + Secure + SameSite
- [x] Rate limiting (5/15min)
- [x] Fail-closed (sem fallback de secrets)

### Dados Sensíveis ✅
- [x] Wrangler secrets para produção
- [x] Nenhuma credencial no código
- [x] `.dev.vars` no `.gitignore`

### Dependências ✅
- [x] Dependências atualizadas
- [x] `npm audit` executado
- [x] Dependências mínimas

---

## Próximos Passos

1. [x] Rate limiting implementado
2. [x] WAF via Cloudflare
3. [ ] Implementar 2FA para admin
4. [ ] Adicionar `security.txt` (RFC 9116)
5. [ ] Implementar CORS mais restritivo
6. [ ] Adicionar logging estruturado (JSON)

---

## Referências

- [OWASP TOP 10 2021](https://owasp.org/Top10/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [Cloudflare Security](https://www.cloudflare.com/security/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [`docs/security/VULNERABILITY-AUDIT-2025.md`](security/VULNERABILITY-AUDIT-2025.md)
- [`docs/isms/ISMS-POLICY.md`](isms/ISMS-POLICY.md)
