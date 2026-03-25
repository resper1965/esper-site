# 🤖 Automação — Geração Automática de Posts

## Recursos

### 1. Source Fetcher (Coleta Automática)
- RSS feeds: CISA, OWASP, Krebs, Dark Reading
- Web scraping: ANPD (Brasil)
- Filtra notícias últimas 24h
- Ordena por relevância

### 2. Topic Analyzer (IA)
- IA analisa fontes coletadas
- Sugere 3-5 tópicos relevantes
- Score de relevância
- Evita duplicatas

### 3. Auto-scheduler
- Máximo 1 post/dia
- 48h entre mesma categoria
- Distribuição balanceada
- Prioriza categorias defasadas

### 4. Email Notifications
- Notifica quando gera post
- Envia score e localização
- Alerta em caso de erro
- Suporte SMTP (Gmail, SendGrid, etc)

### 5. Cron Job (Cloudflare)
- Roda diariamente às 6h via Cloudflare Cron Triggers
- Endpoint: `/api/auto-generate`
- Protegido com token
- Logs via Cloudflare Workers Logs

### 6. Analytics Dashboard
- Total posts, drafts, publicados
- Score médio
- Distribuição por categoria
- Histórico de gerações

## Fluxo Automático (Diário às 6h)

```
1. Cloudflare Cron Trigger
   ↓
2. Buscar fontes (CISA, OWASP, ANPD, etc)
   ↓
3. IA analisa e sugere tópicos
   ↓
4. Seleciona melhor tópico (não duplicado)
   ↓
5. Verifica se pode publicar (limites)
   ↓
6. Gera post (Claude/Gemini)
   ↓
7. Salva draft no D1
   ↓
8. Envia email notificação
   ↓
9. (Opcional) Auto-publish se score >= 9.0
```

## Configuração

### 1. Variáveis de Ambiente

Configure no `.env.local` e no Cloudflare Pages:

```bash
ANTHROPIC_API_KEY=sk-ant-...        # IA
GEMINI_API_KEY=...                  # IA (análise)
CRON_SECRET=random-token-123        # Segurança
EMAIL_NOTIFICATIONS=true            # Ativar emails
NOTIFICATION_EMAIL=seu@email.com    # Seu email
SMTP_HOST=smtp.gmail.com            # SMTP server
SMTP_USER=seu@gmail.com             # Email para enviar
SMTP_PASS=senha-app-gmail           # Senha de app
AUTO_PUBLISH=false                  # Auto-publish (cuidado!)
```

### 2. Cron (Cloudflare)

Configurado via `wrangler.toml`:

```toml
[triggers]
crons = ["0 6 * * *"]  # 6h todo dia
```

Após deploy no Cloudflare Pages:
1. Cron Trigger ativado automaticamente
2. Veja logs em Cloudflare Dashboard → Workers & Pages → Logs

### 3. Teste Local

```bash
# Testar geração automática
curl -X POST http://localhost:3000/api/auto-generate \
  -H "Authorization: Bearer seu-cron-secret"

# Ver analytics
# http://localhost:3000/admin/analytics
```

## Scheduler Rules

### Limites Diários
- Máximo 1 post/dia
- Hora fixa: 6h (configurável)

### Limites por Categoria
- 48h entre posts da mesma categoria
- Distribuição alvo:
  * Cibersegurança: 40%
  * Contraespionagem: 20%
  * Automação: 15%
  * Viagens: 10%
  * Geral: 15%

### Detecção de Duplicatas
- Compara com últimos 30 dias
- Se > 2 palavras em comum → skip
- Prioriza tópicos únicos

## Segurança

### Proteção do Endpoint

```
Authorization: Bearer {CRON_SECRET}
# Sem token = 401 Unauthorized
```

### Fontes Confiáveis (Whitelist)
- cisa.gov, nist.gov, owasp.org
- krebsonsecurity.com, darkreading.com
- anpd.gov.br, iapp.org

### Rate Limiting
- Máximo 1 geração/dia
- Timeout 60s por geração
- Retry automático em erro

## Custos Estimados

| Operação | Custo |
|----------|-------|
| Source analysis | ~$0.005 |
| Topic analysis | ~$0.01 |
| Post generation | ~$0.02 |
| **Total/dia** | **~$0.035** |
| **Total/mês** | **~$1.05** |

## Troubleshooting

### Cron não executa
- Verificar `wrangler.toml` (crons trigger)
- Deploy via Cloudflare Pages (cron só funciona em prod)
- Ver logs: Cloudflare Dashboard → Workers & Pages → Logs

### Email não chega
- Verificar SMTP_* variables
- Gmail: usar "App Password", não senha normal
- Verificar spam

### Post não gera
- Ver logs do cron job
- Verificar se atingiu limite diário
- Ver se há fontes novas (últimas 24h)
