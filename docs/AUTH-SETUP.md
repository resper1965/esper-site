# Configuração de Autenticação - Gerador de Posts

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no seu `.env.local` e na Vercel:

```bash
# Autenticação Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=afa7720f11282278890c8966dce4c9e6d44bbc2ace60910e81ae2d98f14b3d6f
SESSION_SECRET=seu-secret-aleatorio-aqui-mude-em-producao

# API Key Anthropic (já existe)
ANTHROPIC_API_KEY=sk-ant-...
```

## Gerar Hash da Senha

Para gerar o hash de uma nova senha, execute:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('sua-senha-aqui').digest('hex'))"
```

**Senha configurada:** `Gordinh@29`

**Hash SHA256:** `afa7720f11282278890c8966dce4c9e6d44bbc2ace60910e81ae2d98f14b3d6f`

⚠️ **IMPORTANTE:** Configure essas variáveis na Vercel antes de fazer deploy!

## Configurar na Vercel

1. Acesse o dashboard da Vercel
2. Vá em Settings → Environment Variables
3. Adicione as seguintes variáveis:
   - `ADMIN_USERNAME` = `admin`
   - `ADMIN_PASSWORD_HASH` = `afa7720f11282278890c8966dce4c9e6d44bbc2ace60910e81ae2d98f14b3d6f`
   - `SESSION_SECRET` = (gere um valor aleatório seguro)

## Como Usar

1. Acesse `/admin/login`
2. Faça login com:
   - Usuário: `admin`
   - Senha: `Gordinh@29`
3. Após login, você será redirecionado para `/admin/generate`

## Rotas Protegidas

- `/admin/*` - Todas as páginas admin (exceto `/admin/login`)
- `/api/generate-post` - API de geração manual
- `/api/auto-generate` - API de geração automática (cron)

## Rotas Públicas

- `/admin/login` - Página de login
- `/api/auth/*` - APIs de autenticação

## Segurança

- Sessões duram 7 dias
- Cookies são httpOnly e secure em produção
- Senhas são armazenadas como hash SHA256
- Tokens de sessão são verificados com hash

## Mudar Senha

1. Gere o hash da nova senha:
   ```bash
   node -e "console.log(require('crypto').createHash('sha256').update('nova-senha').digest('hex'))"
   ```

2. Atualize `ADMIN_PASSWORD_HASH` no `.env.local` e na Vercel

3. Reinicie o servidor

