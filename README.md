# 🌐 Ricardo Esper - Blog Profissional

> Sistema completo de blog com geração automática de posts usando IA

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204-orange)](https://www.anthropic.com/)

---

## 📋 Sobre o Projeto

Blog pessoal de **Ricardo Esper**, especialista em cibersegurança com 34 anos de experiência. CEO da NESS, CISO da IONIC Health, membro ativo de HackerOne, OWASP e ERII.

### ✨ Destaques

- 🤖 **Geração automática de posts** com IA (Claude Sonnet 4)
- 📊 **Sistema inteligente** que coleta fontes confiáveis e sugere tópicos
- 🎯 **Tom autêntico** do Ricardo (60 anos, 34 anos NESS, pai de 2 filhas)
- ⏰ **Cron job diário** (6h) para publicação automática
- 📈 **Dashboard analytics** completo
- 🎨 **Design greyscale** profissional e responsivo
- 📝 **5 posts iniciais** completos em MDX

---

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 15.3.5** (App Router)
- **TypeScript** 5
- **Tailwind CSS** 3 (tema greyscale customizado)
- **MDX** para posts
- **React** 19

### IA & Automação
- **Anthropic Claude Sonnet 4** para geração de conteúdo
- **RSS Parser** para coleta de fontes
- **Cheerio** para web scraping
- **Vercel Cron** para execução automática

### Fontes de Dados
- CISA (Cybersecurity Advisories)
- OWASP Blog
- Krebs on Security
- Dark Reading
- ANPD (Brasil - LGPD)

---

## 📂 Estrutura do Projeto

```
ricardo-esper-blog/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React Components
│   ├── lib/                    # Utilities & AI Logic
│   └── content/                # Blog Content (MDX)
│
├── docs/                       # Documentação do Projeto
│   ├── design-system.md        # Design System Completo
│   ├── automation.md           # Detalhes da Automação (Fase 2)
│   ├── manual-generation.md    # Guia de Geração Manual
│   └── bio.md                  # Bio do Ricardo Esper
│
├── public/                     # Assets estáticos
├── vercel.json                 # Config cron Vercel
├── tailwind.config.ts          # Tema greyscale
└── .env.local.template         # Template env vars
```

---

## ⚙️ Instalação e Setup

### 1. Clone o Repositório

```bash
git clone https://github.com/resper1965/esper-site.git
cd esper-site
```

### 2. Instale Dependências

```bash
npm install
```

### 3. Configure Variáveis de Ambiente

Crie arquivo `.env.local` na raiz:

```bash
# Obrigatória
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx

# Recomendadas
CRON_SECRET=seu-token-aleatorio
EMAIL_NOTIFICATIONS=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
AUTO_PUBLISH=false
```

**Obter API Key:** https://console.anthropic.com/settings/keys

### 4. Rode em Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🎯 Funcionalidades

### 🌐 Website Público

- **Home:** Hero section + grid com últimos posts
- **Sobre:** Bio completa do Ricardo Esper
- **Blog:** Lista todos os posts com filtros
- **Posts:** Leitura completa com design limpo
- **Responsivo:** Mobile-first design

### 🤖 Sistema de Geração IA (Fase 1)

- **Dashboard Manual:** `/admin/generate`
  - Interface web para gerar posts
  - Define: tema, categoria, keywords
  - Preview e score de qualidade
  - Salva em drafts/

- **API REST:** `/api/generate-post`
  - POST com tema e categoria
  - Retorna post completo
  - Score 0-10 de qualidade

- **Perfil Tonal Autêntico:**
  - 60 anos de idade (sabedoria)
  - 34 anos NESS (longevidade)
  - Pai de 2 filhas (valores)
  - Frases características
  - Casos práticos sempre

### 🎨 Sistema de Geração de Imagens

- **Imagens Automáticas:** `/admin/generate` → Gerador de Imagens
  - Design discreto em escala de cinza
  - Minimalista e elegante
  - 1200x630px (otimizado para redes sociais)
  - Geração em lote para todos os posts

- **API REST:** 
  - `/api/generate-images?slug=...` - Imagem individual
  - `/api/generate-images/all` - Todas as imagens

- **Características:**
  - Tons de cinza elegantes
  - Layout minimalista
  - Categoria destacada
  - Título proeminente
  - Branding discreto

### 🔄 Automação Completa (Fase 2)

- **Coleta Automática de Fontes:**
  - RSS: CISA, OWASP, Krebs, Dark Reading
  - Scraping: ANPD (Brasil)
  - Filtra últimas 24h
  - Prioriza por relevância

- **Topic Analyzer:**
  - IA analisa tendências
  - Sugere 3-5 tópicos
  - Score de relevância
  - Evita duplicatas

- **Scheduler Inteligente:**
  - Máx 1 post/dia
  - 48h entre mesma categoria
  - Distribuição balanceada:
    - 40% Cibersegurança
    - 20% Contraespionagem
    - 15% Automação Residencial
    - 10% Viagens
    - 15% Geral (LGPD, compliance)

- **Cron Job Diário:**
  - Executa 6h todo dia
  - Busca fontes → Analisa → Gera → Salva
  - Logs completos
  - Protegido com token

- **Analytics Dashboard:** `/admin/analytics`
  - Total posts / Drafts / Publicados
  - Score médio
  - Distribuição por categoria
  - Histórico de gerações

---

## 💰 Custos

### Desenvolvimento
- **Total:** $0 (código aberto)

### Operacional
- **Claude Sonnet 4:** ~$0.02/post
- **30 posts/mês:** ~$0.60/mês
- **Com automação:** ~$1.05/mês
- **Anthropic:** $5 grátis inicialmente

### Infraestrutura
- **Vercel Hobby:** Gratuito
  - Hosting ilimitado
  - Cron jobs incluídos
  - SSL automático
  - Deploy automático

**CUSTO TOTAL: ~$1/mês** 🎉

---

## 📊 Score de Qualidade

Cada post gerado recebe score automático 0-10 baseado em:

- ✅ Comprimento adequado (2000-2500 palavras)
- ✅ Frontmatter completo
- ✅ Frases características do Ricardo
- ✅ Experiência pessoal mencionada
- ✅ Caso prático incluído
- ✅ Recomendações acionáveis
- ✅ Call to action presente

**Score > 8.5:** Excelente, pode publicar  
**Score 7-8.5:** Bom, revisar antes  
**Score < 7:** Precisa melhorias

---

## 🚀 Deploy

### Vercel (Recomendado)

1. **Push para GitHub**
   ```bash
   git push origin main
   ```

2. **Import no Vercel**
   - https://vercel.com/new
   - Conectar repositório
   - Framework: Next.js (detecta automático)

3. **Configurar Environment Variables**
   - ANTHROPIC_API_KEY
   - CRON_SECRET
   - Outras opcionais

4. **Deploy**
   - Cron ativa automaticamente
   - SSL automático
   - Deploy a cada push

### Domínio Customizado

Settings → Domains → Add `ricardoesper.com.br`

---

## 📝 Workflow de Publicação

### Automático (Cron)

```
06:00 → Vercel Cron trigger
  ↓
📡 Busca fontes (CISA, OWASP, ANPD)
  ↓
🧠 IA analisa tendências
  ↓
🎯 Seleciona melhor tópico
  ↓
✅ Verifica limites
  ↓
✍️ Gera post 2000+ palavras
  ↓
💾 Salva em drafts/
  ↓
📧 (Opcional) Notifica email
```

### Manual

```
Dashboard → Tema → Categoria → Gerar → 30s → Draft salvo
```

### Publicação

```
1. Revisar draft em src/content/posts/drafts/
2. Editar se necessário
3. Mover para src/content/posts/
4. Commit + Push
5. Vercel redeploy
6. Post publicado!
```

---

## 🧪 Testes

### Build

```bash
npm run build
```

### Desenvolvimento

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Gerar Post Teste

```bash
curl -X POST http://localhost:3000/api/generate-post \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Zero Trust Architecture em 2025",
    "category": "cybersecurity",
    "keywords": ["zero trust", "cloud", "segurança"]
  }'
```

---

## 📚 Documentação Detalhada

- **[Design System](docs/design-system.md)** - Guia de estilos, cores e componentes
- **[Automação (Fase 2)](docs/automation.md)** - Detalhes técnicos do sistema de cron e IA
- **[Geração Manual](docs/manual-generation.md)** - Guia para uso do dashboard e API manual
- **[Geração de Imagens](docs/image-generation.md)** - Sistema de imagens em escala de cinza
- **[Bio Ricardo Esper](docs/bio.md)** - Textos biográficos oficiais

---

## 🛡️ Segurança

### Fontes Confiáveis
- ✅ Whitelist de domínios
- ✅ Apenas RSS feeds verificados
- ✅ Validação de conteúdo

### API Protection
- ✅ Cron endpoint protegido (CRON_SECRET)
- ✅ Rate limiting
- ✅ Logs completos

### Copyright
- ✅ Paráfrase sempre (nunca cópia)
- ✅ Citações < 15 palavras
- ✅ Máximo 1 citação por fonte
- ✅ Conteúdo 100% original

---

## 🎨 Design System

### Cores (Greyscale)
- `grey-50` → `grey-950` (10 tons)
- Sem cores adicionais
- Alto contraste
- Profissional e atemporal

### Typography
- **Sans:** Inter
- **Mono:** IBM Plex Mono
- Tamanhos: 14px → 48px
- Line heights otimizados

### Components
- Header responsivo (mobile menu)
- Footer com links
- PostCard hover effects
- Layout wrapper consistente

---

## 📈 Roadmap

### ✅ Fase 1: MVP (Completo)
- Geração manual de posts
- Dashboard web
- API REST
- Score de qualidade

### ✅ Fase 2: Automação (Completo)
- Coleta automática fontes
- IA análise tendências
- Scheduler inteligente
- Cron job diário
- Analytics dashboard

### ✅ Fase 3: Imagens (Completo)
- Geração automática de imagens
- Design em escala de cinza
- Layout minimalista e discreto
- API para geração em lote

### 🔜 Fase 4: Melhorias (Futuro)
- [ ] Auto-publish inteligente (score > 9.5)
- [ ] A/B testing de horários
- [ ] Google Analytics integration
- [ ] SEO metrics dashboard
- [ ] Multi-language (EN-US completo)
- [ ] Webhook notifications
- [ ] RSS feed próprio

---

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

© 2025 Ricardo Esper. Todos os direitos reservados.

O código fonte está disponível para referência e aprendizado.  
O conteúdo dos posts é protegido por copyright.

---

## 👤 Autor

**Ricardo Esper**
- 60 anos, 34 anos de experiência em cibersegurança
- CEO & Founder - NESS Processos e Tecnologia (desde 1991)
- CISO & Co-Founder - IONIC Health
- CEO - forense.io, Trustness, Infinity Safe
- Certificações: CCISO, CEHIv8, GDPR
- Afiliações: HackerOne, OWASP, ERII, IAPP, OAB SP

**Links:**
- Website: https://ricardoesper.com.br
- LinkedIn: https://br.linkedin.com/in/ricardoesper
- GitHub: https://github.com/resper1965

---

## 📞 Suporte

Para dúvidas ou sugestões:
- Abra uma [Issue](https://github.com/resper1965/esper-site/issues)
- Conecte no [LinkedIn](https://br.linkedin.com/in/ricardoesper)

---

<div align="center">

**Desenvolvido com ❤️ usando Next.js e Claude AI**

⭐ Se este projeto te ajudou, considere dar uma estrela!

</div>
