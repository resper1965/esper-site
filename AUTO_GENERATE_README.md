# 🤖 Sistema de Auto-Geração de Posts

## Fase 1: MVP ✅

Sistema de geração automática de posts usando Claude Sonnet 4, com perfil tonal autêntico do Ricardo Esper.

## 🎯 Funcionalidades

- ✅ Geração de posts com tom de voz do Ricardo (60 anos, 34 anos NESS, CISO, etc)
- ✅ 2000-2500 palavras por post
- ✅ Casos práticos anonimizados
- ✅ Score de qualidade (0-10)
- ✅ Salva drafts em `src/content/posts/drafts/`
- ✅ Dashboard web para geração manual

## 🛠️ Setup

### 1. Criar conta Anthropic

1. Vá em https://console.anthropic.com/
2. Crie conta ou faça login
3. Vá em "API Keys"
4. Crie nova key
5. Copie a key

### 2. Configurar variável de ambiente

```bash
# Criar arquivo .env.local
echo "ANTHROPIC_API_KEY=sua_key_aqui" > .env.local
```

### 3. Rodar projeto

```bash
npm run dev
```

### 4. Acessar dashboard

Abra: http://localhost:3000/admin/generate

## 📝 Como Usar

### Geração Manual (Dashboard Web)

1. Acesse `/admin/generate`
2. Digite tema: "Ransomware como Serviço em 2025"
3. Escolha categoria: Cibersegurança
4. Keywords: "ransomware, raas, cibersegurança"
5. Clique "Gerar Post"
6. Aguarde ~30 segundos
7. Post salvo em `src/content/posts/drafts/`

### Geração via API

```bash
curl -X POST http://localhost:3000/api/generate-post \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Zero Trust em Cloud Native",
    "category": "cybersecurity",
    "keywords": ["zero trust", "cloud", "kubernetes"]
  }'
```

## 📊 Score de Qualidade

O sistema avalia cada post com score 0-10 baseado em:

- ✅ Comprimento adequado (2000-2500 palavras)
- ✅ Frontmatter completo
- ✅ Frases características do Ricardo
- ✅ Experiência pessoal mencionada
- ✅ Caso prático incluído
- ✅ Recomendações acionáveis
- ✅ Call to action presente

**Score > 8.5**: Excelente, pode publicar  
**Score 7-8.5**: Bom, revisar antes de publicar  
**Score < 7**: Precisa melhorias

## 📁 Estrutura de Arquivos

```
src/
├── lib/
│   └── ai/
│       ├── ricardo-profile.json      ← Perfil tonal
│       ├── post-generator.ts         ← Gerador principal
│       └── sources.ts                ← Fontes confiáveis
├── app/
│   ├── api/
│   │   └── generate-post/
│   │       └── route.ts              ← API endpoint
│   └── admin/
│       └── generate/
│           └── page.tsx              ← Dashboard web
└── content/
    └── posts/
        ├── drafts/                   ← Posts gerados (draft)
        └── *.mdx                     ← Posts publicados
```

## 🔄 Workflow

1. **Geração** → Post criado em `drafts/`
2. **Revisão** → Abrir arquivo, revisar conteúdo
3. **Edição** → Fazer ajustes se necessário
4. **Publicação** → Mover de `drafts/` para `posts/`
5. **Deploy** → Commit + push → Vercel auto-deploy

## 🚀 Próximas Fases

### Fase 2: Automação (Próxima Semana)
- [ ] Cron job (diário às 6h)
- [ ] Coleta automática de fontes (CISA, OWASP, etc)
- [ ] Email de notificação
- [ ] Sistema de aprovação

### Fase 3: Auto-Publish (Quando confiante)
- [ ] Auto-publish se score > 9.0
- [ ] A/B testing de horários
- [ ] Analytics integration
- [ ] Dashboard de métricas

## 💰 Custos

- Claude Sonnet 4: ~$0.02 por post
- 30 posts/mês = ~$0.60/mês
- **Quase de graça!** 🎉

## 🛡️ Segurança

- ✅ Apenas fontes whitelisted
- ✅ Score de qualidade obrigatório
- ✅ Drafts sempre revisáveis
- ✅ Metadata de geração incluída
- ✅ Paráfrase (nunca cópia)

## 📞 Suporte

Dúvidas? Problemas? Entre em contato!
