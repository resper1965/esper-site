# 🔄 Migração para Google Gemini

O projeto foi migrado de Anthropic Claude para **Google Gemini** para reduzir custos e simplificar a API.

## ✅ O que mudou

- **Texto**: Agora usa `gemini-1.5-pro` (ou `gemini-1.5-flash` para análises rápidas)
- **Imagens**: Mantém sistema de imagens abstratas (canvas-based) - mais simples e sem custos
- **Custo**: ~70% mais barato que Claude Sonnet 4

## 🔑 Configuração

### 1. Obter API Key do Gemini

1. Acesse: https://aistudio.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave gerada

### 2. Configurar no Vercel

Adicione a variável de ambiente:

```
GEMINI_API_KEY=sua-chave-aqui
```

**Onde configurar:**
- Vercel Dashboard → Settings → Environment Variables
- Adicione para Production, Preview e Development

### 3. Configurar localmente

Crie/atualize `.env.local`:

```bash
GEMINI_API_KEY=sua-chave-aqui
```

## 💰 Custos

### Gemini 1.5 Pro (texto)
- Input: $0.00125 / 1K tokens
- Output: $0.005 / 1K tokens
- **Post típico (~2000 palavras)**: ~$0.01-0.02

### Gemini 1.5 Flash (análise rápida)
- Input: $0.000075 / 1K tokens  
- Output: $0.0003 / 1K tokens
- **Análise de tópicos**: ~$0.001

### Comparação com Claude
- **Claude Sonnet 4**: ~$0.02-0.03 por post
- **Gemini Pro**: ~$0.01-0.02 por post
- **Economia**: ~50-70%

## 📝 Variáveis de Ambiente

### Obrigatória
- `GEMINI_API_KEY` - Chave da API do Google Gemini (para texto e descrições visuais)

### Removidas
- ~~`ANTHROPIC_API_KEY`~~ - Não é mais necessária
- ~~`REPLICATE_API_TOKEN`~~ - Não é mais necessária

## 🎨 Geração de Imagens

O sistema gera **imagens relevantes conectadas ao tema do post** usando Gemini + Vercel OG Image:

1. **Gemini** analisa slug, título, keywords e categoria para criar descrição visual detalhada
2. **Vercel OG Image** gera imagem dinâmica com elementos visuais relevantes (ícones, texto)
3. **Fallback**: Se OG falhar, usa gerador de imagens abstratas temáticas

### Como funciona

- Gemini identifica elementos visuais baseados em:
  - **Slug do post**: palavras-chave do URL
  - **Keywords**: palavras-chave do frontmatter
  - **Categoria**: tema do post
  - **Título e excerpt**: contexto do conteúdo

- Sistema identifica ícones relevantes automaticamente:
  - **Segurança**: 🔒 🛡️
  - **Rede/Tech**: 🌐 ☁️
  - **Código**: 💻 ⚡
  - **Dados**: 📊 💾
  - **IA**: 🤖 🧠
  - **Viagens**: ✈️ 🌍
  - **Casa**: 🏠 🔌

- Imagem gerada inclui:
  - Título do post
  - Ícones relevantes baseados em keywords
  - Badge de categoria
  - Estilo greyscale com acento cyan (#00ade8)
  - Fundo escuro profissional (gray-950)

### Otimização SEO

- **Alt text automático**: Gerado baseado em título, categoria e excerpt
- **Tamanho otimizado**: 1200x630px (Open Graph standard)
- **Keywords visuais**: Ícones e elementos baseados em palavras-chave
- **Relevância**: Imagem conectada ao conteúdo do post

### Custos
- **Gemini (descrição visual)**: ~$0.001 por post
- **Vercel OG Image**: Grátis (incluído no plano)
- **Total por imagem**: ~$0.001

### Características
- Imagens relevantes conectadas ao tema (não abstratas)
- Baseadas em slug e keywords para SEO
- Estilo minimalista, greyscale com acento cyan
- Tamanho: 1200x630px (otimizado para blog covers e Open Graph)
- Alt text automático para acessibilidade e SEO

## 🧪 Testar

```bash
# Gerar post de teste
curl -X POST http://localhost:3000/api/generate-post \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Zero Trust Architecture em 2025",
    "category": "cybersecurity",
    "keywords": ["zero trust", "cloud", "segurança"]
  }'
```

## 📚 Documentação

- **Gemini API**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **Models**: https://ai.google.dev/models/gemini

## ⚠️ Notas

1. **Modelos disponíveis**:
   - `gemini-1.5-pro`: Melhor qualidade, mais caro
   - `gemini-1.5-flash`: Mais rápido e barato, boa qualidade

2. **Rate Limits**: 
   - Free tier: 15 RPM (requests per minute)
   - Paid: 360 RPM

3. **Context Window**: 
   - Gemini 1.5 Pro: 2M tokens
   - Gemini 1.5 Flash: 1M tokens

## 🔄 Rollback (se necessário)

Se precisar voltar para Claude:

1. Reinstalar: `npm install @anthropic-ai/sdk`
2. Restaurar código dos arquivos:
   - `src/lib/ai/post-generator.ts`
   - `src/lib/ai/topic-analyzer.ts`
   - `src/lib/ai/post-generator-bilingual.ts`
3. Configurar `ANTHROPIC_API_KEY` novamente

