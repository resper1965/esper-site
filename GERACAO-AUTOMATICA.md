# Sistema de Geração Automática de Posts

Este documento descreve o mecanismo completo de geração automática de posts usando IA (Claude Sonnet 4 da Anthropic).

## Visão Geral

O sistema gera posts automaticamente através de um cron job que:
1. Busca notícias recentes de fontes confiáveis
2. Analisa e sugere tópicos relevantes
3. Gera conteúdo usando o perfil de voz do Ricardo Esper
4. Salva como draft ou publica automaticamente (se score alto)
5. Envia notificações por email

## Componentes Principais

### 1. Source Fetcher (`src/lib/ai/source-fetcher.ts`)

**Função:** Busca notícias recentes de fontes RSS confiáveis.

**Fontes Configuradas:**
- CISA Alerts (prioridade 10)
- Krebs on Security (prioridade 9)
- OWASP Blog (prioridade 9)
- Dark Reading (prioridade 8)

**Processo:**
- Busca feeds RSS das últimas 24 horas
- Extrai título, URL, resumo e data de publicação
- Calcula score de relevância baseado na fonte
- Retorna lista de fontes ordenadas por relevância

**Funções:**
- `getAllSources(hoursBack)`: Busca todas as fontes das últimas N horas
- `fetchRecentNews(hoursBack)`: Busca notícias recentes de todas as fontes

### 2. Topic Analyzer (`src/lib/ai/topic-analyzer.ts`)

**Função:** Analisa fontes e sugere tópicos relevantes para posts.

**Processo:**
1. Recebe lista de fontes recentes
2. Usa Claude AI para analisar e sugerir 3-5 tópicos
3. Cada tópico inclui:
   - Título do post
   - Categoria apropriada
   - Keywords SEO
   - Score de relevância
   - Fontes relacionadas
   - Raciocínio da escolha

**Categorias Disponíveis:**
- `cybersecurity`: Técnico, ameaças, vulnerabilidades
- `counterespionage`: OSINT, proteção executiva
- `homeautomation`: IoT, smart home security
- `travel`: Tecnologia em viagens, mercados globais
- `general`: LGPD, compliance, tendências
- `vida`: Reflexões pessoais, autoconhecimento, maturidade emocional

**Funções:**
- `analyzeTopics(sources)`: Analisa fontes e retorna sugestões de tópicos
- `selectBestTopic(suggestions, recentPosts)`: Seleciona melhor tópico evitando duplicatas

### 3. Post Generator (`src/lib/ai/post-generator.ts`)

**Função:** Gera o conteúdo completo do post usando o perfil de voz do Ricardo.

**Perfil de Voz:**
- Carregado de `src/lib/ai/ricardo-profile.json`
- Diferentes vozes por categoria:
  - **vida**: Mais positiva, charmosa, ligeiramente irônica (formalidade 4.0/10)
  - **cybersecurity**: Executivo experiente (formalidade 6.5/10)
  - **counterespionage**: Discreto e estratégico (formalidade 7.0/10)
  - **homeautomation**: Entusiasta prático (formalidade 5.5/10)
  - **travel**: Viajante experiente (formalidade 5.0/10)
  - **general**: Voz padrão executiva (formalidade 6.5/10)

**Processo:**
1. Seleciona voz apropriada para a categoria
2. Constrói prompt detalhado com:
   - Identidade do Ricardo Esper
   - Tom de voz específico da categoria
   - Frases características
   - Aberturas típicas
   - Tópico e fontes
   - Estrutura obrigatória do post
3. Gera conteúdo completo (1800-2200 palavras)
4. Avalia qualidade e retorna score (0-10)

**Estrutura do Post Gerado:**
1. Gancho Atual (150-200 palavras)
2. Contexto e Magnitude (300-400 palavras)
3. Análise Técnica Acessível (500-700 palavras)
4. Caso Real ou Cenário (400-500 palavras)
5. Estratégias e Recomendações (400-500 palavras)
6. Visão de Futuro (200-300 palavras)
7. Call to Action

**Funções:**
- `generatePost(params)`: Gera post completo
- `savePostDraft(post)`: Salva como draft em `src/content/posts/drafts/`
- `publishPost(filepath)`: Move draft para `src/content/posts/` (publicação)

### 4. Scheduler (`src/lib/ai/scheduler.ts`)

**Função:** Controla quando e o que pode ser publicado.

**Configurações:**
- Máximo 1 post por dia
- Máximo 7 posts por semana
- Mínimo 48 horas entre posts da mesma categoria
- Horário preferido: 6h da manhã
- Distribuição de categorias:
  - cybersecurity: 35%
  - counterespionage: 20%
  - homeautomation: 15%
  - travel: 10%
  - general: 15%
  - vida: 5%

**Funções:**
- `canPublishToday()`: Verifica se pode publicar hoje
- `canPublishCategory(category)`: Verifica se categoria pode ser publicada
- `getRecentPostTitles(days)`: Retorna títulos recentes (para evitar duplicatas)
- `getCategoryStats()`: Estatísticas de categorias nos últimos 30 dias
- `shouldPrioritizeCategory(category)`: Verifica se categoria precisa de mais posts

### 5. Email Notifier (`src/lib/ai/email-notifier.ts`)

**Função:** Envia notificações por email sobre posts gerados.

**Configuração:**
- Variável de ambiente: `EMAIL_NOTIFICATIONS=true`
- Destinatário: `EMAIL_TO` (configurado no `.env`)
- Usa Resend API para envio

**Notificações:**
- Post gerado com sucesso (inclui título, slug, score, caminho)
- Erros durante geração (inclui stack trace e contexto)

**Funções:**
- `sendPostGeneratedNotification(data)`: Notifica post gerado
- `sendErrorNotification(error, context)`: Notifica erros

### 6. API Endpoint (`src/app/api/auto-generate/route.ts`)

**Função:** Endpoint chamado pelo cron job para gerar posts.

**Autenticação:**
- Header `Authorization: Bearer {CRON_SECRET}`
- Variável de ambiente: `CRON_SECRET`

**Fluxo Completo:**
1. Verifica autenticação
2. Verifica se pode publicar hoje
3. Busca fontes recentes (últimas 24h)
4. Analisa tópicos
5. Seleciona melhor tópico (evitando duplicatas)
6. Verifica se categoria pode ser publicada
7. Gera post completo
8. Salva como draft
9. Envia notificação por email
10. Auto-publica se score >= 9.0 e `AUTO_PUBLISH=true`

**Respostas:**
- `200 OK`: Post gerado com sucesso
- `200 OK (skipped)`: Pulado (limite atingido, sem fontes, etc.)
- `401 Unauthorized`: Token inválido
- `500 Error`: Erro durante geração

## Configuração

### Variáveis de Ambiente Necessárias

```bash
# API Key Anthropic (obrigatório)
ANTHROPIC_API_KEY=sk-ant-...

# Autenticação do cron job (obrigatório)
CRON_SECRET=seu-secret-aleatorio-aqui

# Auto-publicação (opcional, default: false)
AUTO_PUBLISH=true

# Notificações por email (opcional)
EMAIL_NOTIFICATIONS=true
EMAIL_TO=seu-email@exemplo.com
RESEND_API_KEY=re_...
```

### Configuração do Cron Job (Vercel)

No dashboard da Vercel, configure um cron job:

**Path:** `/api/auto-generate`
**Schedule:** `0 6 * * *` (6h da manhã, diariamente)
**Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

## Fluxo de Execução

```
┌─────────────────┐
│  Cron Job (6h)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verifica Auth   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Pode Publicar?  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Busca Fontes    │
│ (últimas 24h)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Analisa Tópicos │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Seleciona Melhor│
│ (sem duplicatas)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Categoria OK?   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gera Post       │
│ (Claude AI)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Salva Draft     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notifica Email  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Score >= 9.0?   │
│ Auto-publica?   │
└─────────────────┘
```

## Geração Manual

### Via Dashboard Admin

Acesse `/admin/generate` (requer autenticação):
- Interface web para gerar posts manualmente
- Permite escolher tópico, categoria e keywords
- Gera e salva draft imediatamente

### Via API

**POST `/api/generate-post`**
```json
{
  "topic": "Tópico do post",
  "category": "cybersecurity",
  "keywords": ["palavra1", "palavra2"],
  "sources": [
    {
      "title": "Título da fonte",
      "url": "https://exemplo.com",
      "summary": "Resumo da fonte"
    }
  ]
}
```

## Monitoramento

### Logs

O sistema gera logs detalhados em cada etapa:
- `🤖 Iniciando geração automática...`
- `📡 Buscando fontes...`
- `✅ X fontes encontradas`
- `🧠 Analisando tópicos...`
- `✍️ Gerando post...`
- `✅ Post gerado! Score: X/10`
- `✅ Draft salvo: caminho/arquivo.mdx`

### Notificações

- Email quando post é gerado
- Email quando ocorre erro
- Status no response da API

## Personalização

### Adicionar Nova Fonte RSS

Edite `src/lib/ai/source-fetcher.ts`:
```typescript
const RSS_SOURCES = [
  // ... fontes existentes
  {
    name: 'Nova Fonte',
    url: 'https://exemplo.com/feed.xml',
    priority: 8,
    category: 'cybersecurity'
  }
];
```

### Ajustar Distribuição de Categorias

Edite `src/lib/ai/scheduler.ts`:
```typescript
categoryDistribution: {
  cybersecurity: 0.35,
  // ... outras categorias
  novaCategoria: 0.10
}
```

### Modificar Perfil de Voz

Edite `src/lib/ai/ricardo-profile.json`:
- Adicione nova voz para categoria
- Ajuste formalidade, tom, frases características
- Modifique aberturas típicas

## Troubleshooting

### Post não está sendo gerado

1. Verifique logs do cron job na Vercel
2. Confirme que `ANTHROPIC_API_KEY` está configurada
3. Verifique se `CRON_SECRET` está correto
4. Confirme que há fontes recentes disponíveis

### Score sempre baixo

1. Verifique qualidade das fontes
2. Ajuste prompt em `post-generator.ts`
3. Revise perfil de voz do Ricardo

### Auto-publicação não funciona

1. Confirme `AUTO_PUBLISH=true` no `.env`
2. Verifique se score >= 9.0
3. Confirme permissões de escrita em `src/content/posts/`

## Próximos Passos

- [ ] Adicionar mais fontes RSS
- [ ] Implementar análise de sentimento
- [ ] Adicionar geração de imagens (DALL-E/Midjourney)
- [ ] Implementar A/B testing de títulos
- [ ] Adicionar métricas de performance dos posts

