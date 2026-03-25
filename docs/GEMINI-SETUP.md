# Configuração Google Gemini

## Visão Geral

O projeto usa **AI SDK** com múltiplos providers (Anthropic, Google Gemini, OpenAI). O Gemini é usado para análises rápidas e geração de descrições visuais.

## Configuração

### 1. Obter API Key do Gemini

1. Acesse: https://aistudio.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave gerada

### 2. Configurar no Cloudflare Pages

1. Cloudflare Dashboard → Pages → seu projeto
2. Settings → Environment Variables
3. Adicione para Production, Preview e Development:

```
GEMINI_API_KEY=sua-chave-aqui
```

### 3. Configurar localmente

Crie/atualize `.env.local`:

```bash
GEMINI_API_KEY=sua-chave-aqui
```

## Modelos Disponíveis

| Modelo | Uso | Custo (Input/Output por 1K tokens) |
|--------|-----|-----|
| `gemini-1.5-pro` | Melhor qualidade | $0.00125 / $0.005 |
| `gemini-1.5-flash` | Rápido e barato | $0.000075 / $0.0003 |

## Geração de Imagens

O sistema gera imagens relevantes conectadas ao tema do post:

1. **Gemini** analisa slug, título, keywords e categoria para criar descrição visual
2. **OG Image** gera imagem dinâmica com elementos visuais relevantes
3. **Fallback**: Gerador de imagens abstratas temáticas

### Ícones Automáticos por Tema
- **Segurança**: 🔒 🛡️
- **Rede/Tech**: 🌐 ☁️
- **Código**: 💻 ⚡
- **Dados**: 📊 💾
- **IA**: 🤖 🧠

### Especificações
- Tamanho: 1200x630px (Open Graph)
- Estilo: greyscale com acento cyan (#00ade8)
- Alt text automático para SEO/acessibilidade

## Variáveis de Ambiente

### Obrigatórias (AI)
- `GEMINI_API_KEY` — Google Gemini
- `ANTHROPIC_API_KEY` — Anthropic Claude
- `OPENAI_API_KEY` — OpenAI (fallback)

## Testar

```bash
curl -X POST http://localhost:3000/api/generate-post \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Zero Trust Architecture em 2025",
    "category": "cybersecurity",
    "keywords": ["zero trust", "cloud", "segurança"]
  }'
```

## Documentação

- **Gemini API**: https://ai.google.dev/docs
- **AI SDK**: https://sdk.vercel.ai/docs
- **Pricing**: https://ai.google.dev/pricing

## Rate Limits

- Free tier: 15 RPM (requests per minute)
- Paid: 360 RPM
- Context Window: até 2M tokens (Pro), 1M tokens (Flash)
