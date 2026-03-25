# Configuração de Autenticação - Painel Admin

## Variáveis de Ambiente Necessárias

Configure no Cloudflare Pages (Settings → Environment Variables) e no `.env.local`:

```bash
# Autenticação Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<sha256-hash-da-senha>
SESSION_SECRET=<gere-um-valor-aleatorio-seguro>
```

> ⚠️ **NUNCA** commite senhas ou hashes reais em documentação ou código.

## Gerar Hash da Senha

```bash
node -e "console.log(require('crypto').createHash('sha256').update('sua-senha-aqui').digest('hex'))"
```

## Configurar no Cloudflare

1. Acesse Cloudflare Dashboard → Pages → seu projeto
2. Settings → Environment Variables
3. Adicione para **Production** e **Preview**:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH`
   - `SESSION_SECRET` (valor aleatório, mínimo 32 chars)

## Como Usar

1. Acesse `/admin/login`
2. Faça login com as credenciais configuradas
3. Após login, redirecionamento para `/admin/generate`

## Rotas Protegidas

- `/admin/*` — Todas as páginas admin (exceto `/admin/login`)
- `/api/generate-post` — API de geração manual
- `/api/auto-generate` — API de geração automática (cron)

## Rotas Públicas

- `/admin/login` — Página de login
- `/api/auth/*` — APIs de autenticação

## Segurança

- Sessões armazenadas no Cloudflare KV (TTL: 7 dias)
- Cookies `httpOnly`, `secure`, `sameSite: strict`
- Senhas armazenadas como hash SHA256
- Tokens de sessão verificados com hash
- Rate limiting via Cloudflare

## Mudar Senha

1. Gere o hash da nova senha:
   ```bash
   node -e "console.log(require('crypto').createHash('sha256').update('nova-senha').digest('hex'))"
   ```

2. Atualize `ADMIN_PASSWORD_HASH` no `.env.local` e no Cloudflare Pages

3. Reinicie o servidor (dev) ou redeploy (prod)
