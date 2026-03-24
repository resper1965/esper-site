# Controle de Acesso

> Última revisão: 2025-03-24 | Versão: 1.0
> ISO 27001:2022 — A.5.15 a A.5.18, A.8.2 a A.8.5

---

## Política de Acesso

**Princípio:** Least Privilege — acesso mínimo necessário para realizar a função.

---

## Matriz de Acesso

### Aplicação (esper.ws)

| Recurso | Visitante | Admin |
|---------|-----------|-------|
| Blog (leitura) | ✅ | ✅ |
| Portfolio (leitura) | ✅ | ✅ |
| Contato (formulário) | ✅ | ✅ |
| Admin Dashboard | ❌ | ✅ |
| CRUD Posts | ❌ | ✅ |
| CRUD Projetos | ❌ | ✅ |
| AI Features (admin) | ❌ | ✅ |
| Configurações | ❌ | ✅ |

### Infraestrutura

| Recurso | Acesso | Autenticação |
|---------|--------|-------------|
| GitHub Repository | Owner only | GitHub SSO + 2FA |
| Cloudflare Dashboard | Owner only | Cloudflare SSO + 2FA |
| Cloudflare D1 | Via Workers only | API Token / Wrangler |
| Cloudflare R2 | Via Workers / Dashboard | API Token |
| Cloudflare KV | Via Workers only | API Token |
| CI/CD (GitHub Actions) | Automático (push-triggered) | GitHub OIDC |

---

## Autenticação

### Admin Panel

| Aspecto | Implementação |
|---------|---------------|
| **Método** | JWT (JSON Web Token) |
| **Expiração** | Configurável (default: 24h) |
| **Refresh** | Token rotation |
| **Password** | Hashed (bcrypt/argon2) |
| **Brute-force** | Rate limiting (Cloudflare) |
| **Transport** | HTTPS only (TLS 1.3) |
| **Storage** | httpOnly cookie / secure |

### Infraestrutura

| Serviço | MFA | Método |
|---------|-----|--------|
| GitHub | ✅ Obrigatório | TOTP / Security Key |
| Cloudflare | ✅ Obrigatório | TOTP |
| APIs de IA | N/A | API Key (env var) |

---

## Autorização (RBAC)

| Role | Permissões |
|------|-----------|
| `visitor` | Leitura pública |
| `admin` | CRUD completo, configurações, AI |

---

## Gestão de Credenciais

### Armazenamento

| Tipo | Localização | Proteção |
|------|-----------|----------|
| Admin password | D1 (hashed) | bcrypt/argon2 |
| API keys (IA) | Cloudflare env vars | Encrypted at rest |
| JWT secret | Cloudflare env vars | Encrypted at rest |
| GitHub tokens | GitHub Secrets | Encrypted |

### Rotação

| Credencial | Frequência | Trigger |
|-----------|-----------|---------|
| JWT secret | Semestral | Calendário |
| API keys | Anual | Calendário |
| Admin password | Anual ou após incidente | Calendário / Incident |
| GitHub tokens | Automático (OIDC) | Por workflow run |

---

## Revisão de Acessos

- **Frequência:** Semestral
- **Escopo:** Todos os acessos listados acima
- **Ação:** Revogar acessos desnecessários, rotar credenciais
- **Registro:** GitHub Issue (label: `access-review`)

---

## Logging de Acesso

| Evento | Logado | Onde |
|--------|--------|------|
| Login admin (sucesso) | ✅ | Application log |
| Login admin (falha) | ✅ | Application log |
| CRUD operations (admin) | ✅ | Application log |
| API calls (IA) | ✅ | Cloudflare Workers log |
| Cloudflare Dashboard access | ✅ | Cloudflare audit log |
| GitHub repo access | ✅ | GitHub audit log |
