# Configuração de Variáveis de Ambiente na Vercel

## ⚠️ IMPORTANTE: Configure estas variáveis ANTES do deploy

Acesse: https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

## Variáveis Obrigatórias

### 1. ANTHROPIC_API_KEY
- **Descrição**: Chave da API da Anthropic (Claude) para geração automática de posts
- **Onde obter**: https://console.anthropic.com/
- **Formato**: `sk-ant-...`
- **Ambientes**: Production, Preview, Development

### 2. CRON_SECRET
- **Descrição**: Token secreto para proteger o endpoint `/api/auto-generate`
- **Como gerar**: 
  ```bash
  openssl rand -hex 32
  ```
- **Formato**: String aleatória (ex: `a1b2c3d4e5f6...`)
- **Ambientes**: Production, Preview, Development

## Variáveis Opcionais (Recomendadas)

### 3. NEXT_PUBLIC_GA_ID
- **Descrição**: ID do Google Analytics 4
- **Onde obter**: Google Analytics → Admin → Data Streams
- **Formato**: `G-XXXXXXXXXX`
- **Ambientes**: Production, Preview

### 4. NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
- **Descrição**: Código de verificação do Google Search Console
- **Onde obter**: Google Search Console → Configurações → Propriedade → Verificação
- **Formato**: String alfanumérica
- **Ambientes**: Production

### 5. EMAIL_NOTIFICATIONS
- **Descrição**: Ativar/desativar notificações por email
- **Valor**: `true` ou `false`
- **Ambientes**: Production

### 6. NOTIFICATION_EMAIL
- **Descrição**: Email para receber notificações de posts gerados
- **Formato**: `seu@email.com`
- **Ambientes**: Production

### 7. EMAIL_FROM
- **Descrição**: Email remetente (padrão: `blog@ricardoesper.com.br`)
- **Formato**: `seu@email.com`
- **Ambientes**: Production

### 8. SMTP_HOST
- **Descrição**: Servidor SMTP (ex: `smtp.gmail.com`)
- **Ambientes**: Production

### 9. SMTP_PORT
- **Descrição**: Porta SMTP (padrão: `587`)
- **Valor**: `587` ou `465`
- **Ambientes**: Production

### 10. SMTP_USER
- **Descrição**: Usuário SMTP
- **Formato**: `seu@email.com`
- **Ambientes**: Production

### 11. SMTP_PASS
- **Descrição**: Senha SMTP (use App Password do Gmail)
- **Ambientes**: Production

### 12. AUTO_PUBLISH
- **Descrição**: Auto-publicar posts com score >= 9.0
- **Valor**: `true` ou `false`
- **Ambientes**: Production

## Passo a Passo

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto `esper-site`
3. Vá em **Settings** → **Environment Variables**
4. Clique em **Add New**
5. Adicione cada variável:
   - **Key**: Nome da variável (ex: `ANTHROPIC_API_KEY`)
   - **Value**: Valor da variável
   - **Environments**: Selecione Production, Preview, Development conforme necessário
6. Clique em **Save**
7. Repita para todas as variáveis
8. **Importante**: Após adicionar variáveis, faça um novo deploy ou aguarde o próximo deploy automático

## Verificação

Após configurar, você pode verificar se as variáveis estão sendo usadas:
- Acesse o dashboard do Vercel
- Vá em **Deployments** → Selecione um deployment
- Verifique os logs do build
- As variáveis estarão disponíveis durante o build e runtime

## Nota sobre Segurança

⚠️ **NUNCA** commite variáveis de ambiente no Git. Sempre use o dashboard da Vercel para configurá-las.

