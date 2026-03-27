# 🌐 esper.ws — Ricardo Esper

> Site profissional de Ricardo Esper — CISO, especialista em cibersegurança com 34+ anos de experiência

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-F38020)](https://workers.cloudflare.com/)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204-orange)](https://www.anthropic.com/)

---

## 📋 Sobre o Projeto

Site pessoal e blog profissional de **Ricardo Esper** — CISO com 34+ anos de experiência em cibersegurança. Fundador da NESS (1991), CISO da IONIC Health, fundador da forense.io. Especialista em LGPD, GDPR, HIPAA, forense digital e proteção executiva.

---

## 🚀 Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| **Deploy** | Cloudflare Workers (via Wrangler) |
| **i18n** | Bilíngue pt-BR / en com rotas `[lang]/*` |
| **Conteúdo** | MDX para posts, geração automática com Claude AI |
| **SEO/GEO** | 10+ JSON-LD schemas, hreflang, OpenGraph, speakable |
| **Fontes** | Montserrat (display:swap, preload, fallback) |
| **Fontes de Dados** | CISA, OWASP, Krebs on Security, Dark Reading, ANPD |

---

## 📂 Estrutura de Páginas

```
src/app/
├── [lang]/                     # Rotas i18n (pt-BR, en)
│   ├── page.tsx                # Homepage com hero + particle network
│   ├── blog/
│   │   ├── page.tsx            # Lista de artigos
│   │   └── [slug]/page.tsx     # Post individual (Article schema, breadcrumbs)
│   ├── sobre/page.tsx          # Página "Sobre" (Person schema)
│   ├── servicos/page.tsx       # Serviços (ProfessionalService schema)
│   ├── categoria/[category]/   # Posts filtrados por categoria
│   └── busca/page.tsx          # Busca interna
│
├── admin/                      # Painel administrativo
│   ├── page.tsx                # Dashboard principal
│   ├── analytics/              # Analytics dashboard
│   ├── generate/               # Geração de posts com IA
│   ├── chat/                   # Chat AI interno
│   ├── settings/               # Configurações
│   └── login/                  # Autenticação admin
│
├── api/                        # API Routes
│   ├── comments/route.ts       # API de comentários (sanitização)
│   ├── search/route.ts         # API de busca
│   ├── generate-post/route.ts  # Geração de posts IA
│   ├── chat/route.ts           # Chat AI
│   └── auth/login/route.ts     # Autenticação
│
├── error.tsx                   # Página de erro customizada
├── not-found.tsx               # 404 customizada
├── layout.tsx                  # Layout root (analytics, fonts, JSON-LD)
├── sitemap.ts                  # Sitemap dinâmico
└── robots.ts                   # Robots.txt
```

---

## ✨ Features

### 🌐 Website Público
- **Homepage** com hero section e animação particle network
- **Blog** com artigos em MDX, categorias e busca
- **Serviços** — consultoria em cibersegurança, LGPD, forense digital, TSCM
- **Design greyscale** profissional e responsivo
- **Command Palette** (Ctrl+K) para navegação rápida
- **Comentários** com sanitização HTML

### 🤖 Sistema de IA
- Geração automática de posts com Claude Sonnet 4
- Coleta de fontes confiáveis (CISA, OWASP, ANPD)
- Score de qualidade 0-10 por post
- Chat AI integrado no admin

### 📊 SEO & Structured Data
- **Person** — disambiguation, knowsAbout, hasCredential, speakable
- **Organization** — areaServed, contactPoint, sameAs
- **WebSite** — SearchAction, speakable
- **BlogPosting** — author, wordCount, speakable
- **ProfessionalService** — OfferCatalog com 5 serviços
- **BreadcrumbList** — Posts do blog
- **CollectionPage** — Páginas de categoria
- **ProfilePage** — disambiguatingDescription
- **OpenGraph / Twitter Cards** — alternateLocale, article meta
- **hreflang** — pt-BR / en alternates
- **Canonical URLs** em todas as páginas

### 🛡️ Segurança
- Rate limiting com testes automatizados
- Sanitização HTML (DOMPurify)
- Cron endpoint protegido (CRON_SECRET)
- Whitelist de domínios para fontes
- Analytics com consent management

---

## ⚙️ Setup Local

```bash
# Clone
git clone https://github.com/resper1965/esper-site.git
cd esper-site

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# Rode em desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```bash
ANTHROPIC_API_KEY=sk-ant-...    # Obrigatória para IA
CRON_SECRET=seu-token            # Proteção do cron
NEXT_PUBLIC_SITE_URL=https://esper.ws
```

---

## 🚀 Deploy

Deploy em **Cloudflare Workers** via Wrangler:

```bash
npx wrangler deploy
```

---

## 💰 Custos

| Item | Custo |
|------|-------|
| Claude Sonnet 4 (~30 posts/mês) | ~$1/mês |
| Cloudflare Workers (Free tier) | $0 |
| **Total** | **~$1/mês** |

---

## 👤 Autor

**Ricardo Esper**
- CISO & Founder — NESS Processos e Tecnologia (desde 1991)
- CISO & Co-Founder — IONIC Health
- Founder — forense.io, Trustness, Infinity Safe
- Certificações: CCISO, CEHIv8, GDPR
- Afiliações: HackerOne, OWASP, ERII, IAPP, OAB SP

**Links:**
- 🌐 [esper.ws](https://esper.ws)
- 💼 [LinkedIn](https://br.linkedin.com/in/ricardoesper)
- 🐙 [GitHub](https://github.com/resper1965)

---

© 2025 Ricardo Esper. Todos os direitos reservados.
