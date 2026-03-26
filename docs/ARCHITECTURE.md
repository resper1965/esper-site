# Arquitetura do Sistema

## Visão Geral

Blog profissional com geração automática de posts usando IA, construído com Next.js 15 e deploy na Cloudflare.

## Stack Tecnológica

### Frontend
- **Next.js 15** (App Router + Turbopack)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**

### Backend / Infra
- **Cloudflare Pages** (Deploy + CDN)
- **Cloudflare D1** (SQLite — banco de dados)
- **Cloudflare R2** (Storage de imagens)
- **Cloudflare KV** (Cache de sessões e dados)
- **Cloudflare Workers** (Serverless functions)

### IA & Automação
- **AI SDK** (Vercel AI SDK — biblioteca, não infra)
  - Anthropic Claude (Geração de conteúdo)
  - Google Gemini (Análise e imagens)
  - OpenAI (Fallback)
- **Cloudflare Cron Triggers** (Agendamento)

---

## Arquitetura de Dados

### Cloudflare D1 (SQLite)

**Tabela: posts**
- Armazena todos os posts do blog
- Suporta drafts e posts publicados
- Índices otimizados para queries frequentes

**Cloudflare R2: post-images**
- Imagens de capa dos posts
- Upload via R2 API
- URLs públicas via CDN Cloudflare

**Auth: JWT + KV Sessions**
- Autenticação admin com JWT
- Sessions armazenadas no KV
- Cookies httpOnly + secure

---

## Estrutura de Diretórios

```
esper-site/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── [lang]/       # Rotas internacionalizadas
│   │   ├── admin/        # Painel administrativo
│   │   └── api/          # API routes
│   ├── components/       # React Components
│   ├── lib/              # Utilities & Logic
│   │   ├── db/           # D1 database clients & helpers
│   │   ├── ai/           # IA generation logic
│   │   └── posts.ts      # Posts module
│   └── content/          # MDX content
├── docs/                 # Documentação
├── public/               # Static assets
├── wrangler.toml         # Cloudflare config
└── .github/              # GitHub configs
```

---

## Fluxo de Dados

### Geração de Posts

```
Cron Trigger (6h) → /api/auto-generate
  ↓
Coleta fontes RSS
  ↓
IA analisa tendências
  ↓
Gera post (Claude/Gemini)
  ↓
Gera imagem (Gemini/OG)
  ↓
Salva no D1 + R2
  ↓
Notificação (opcional)
```

### Publicação

```
Admin → Revisa draft
  ↓
Edita se necessário
  ↓
Publica (published = true)
  ↓
Post visível publicamente
```

---

## Segurança

### Camadas

1. **Network Layer**
   - HTTPS obrigatório
   - HSTS
   - Security headers (Cloudflare)
   - DDoS protection (Cloudflare)

2. **Application Layer**
   - JWT Authentication
   - Role-based Authorization
   - Input validation (Zod)
   - Output encoding
   - CSP headers

3. **Data Layer**
   - D1 parameterized queries (anti-SQLi)
   - Encrypted connections
   - KV secure storage

---

## Performance

### Otimizações

- Static generation quando possível
- Image optimization (Next.js + R2)
- Code splitting
- CDN global (Cloudflare Edge Network — 300+ PoPs)

### Caching

- Static pages cached (Cloudflare CDN)
- Images cached (KV + R2, 7 days)
- API responses cached (KV)

---

## Monitoramento

- Cloudflare Analytics
- Workers Logs
- Error tracking
- Performance monitoring (Web Analytics)

---

## Deploy

### Processo

1. Push para `main`
2. GitHub Actions CI
3. Build verificado
4. Deploy automático Cloudflare Pages
5. D1 migrations aplicadas via Wrangler

### Ambientes

- **Production**: Cloudflare Pages + D1 Production
- **Preview**: Cloudflare Pages Preview (cada PR)

---

## Escalabilidade

### Atual
- Cloudflare Free tier
- D1 Free tier (5M reads/day, 100K writes/day)
- R2 Free tier (10GB storage)
- ~$0/mês operacional

### Futuro
- Cloudflare Pro (se necessário)
- D1 scaling automático
- Workers Paid plan (se necessário)
