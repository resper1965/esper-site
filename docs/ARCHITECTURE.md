# Arquitetura do Sistema

## Visão Geral

Blog profissional com geração automática de posts usando IA, construído com Next.js 15 e Supabase.

## Stack Tecnológica

### Frontend
- **Next.js 15.5.9** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**

### Backend
- **Supabase** (Postgres + Auth + Storage)
- **Vercel Functions** (Serverless)

### IA & Automação
- **Anthropic Claude Sonnet 4** (Geração de conteúdo)
- **Google Gemini** (Geração de imagens)
- **Vercel Cron** (Agendamento)

---

## Arquitetura de Dados

### Supabase Postgres

**Tabela: posts**
- Armazena todos os posts do blog
- RLS habilitado para segurança
- Suporta drafts e posts publicados

**Storage: post-images**
- Imagens de capa dos posts
- Upload via Supabase Storage
- URLs públicas CDN

**Auth: Supabase Auth**
- Autenticação email/senha
- JWT tokens
- Session management

---

## Estrutura de Diretórios

```
ricardo-esper-blog/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── [lang]/       # Rotas internacionalizadas
│   │   ├── admin/        # Painel administrativo
│   │   └── api/          # API routes
│   ├── components/       # React Components
│   ├── lib/              # Utilities & Logic
│   │   ├── supabase/     # Supabase clients & helpers
│   │   ├── ai/           # IA generation logic
│   │   └── posts.ts      # Posts module
│   └── content/          # MDX content
├── docs/                 # Documentação
├── supabase/             # Supabase configs
│   ├── schema.sql        # Database schema
│   └── functions/        # Edge Functions
├── public/               # Static assets
└── .github/              # GitHub configs
```

---

## Fluxo de Dados

### Geração de Posts

```
Cron (6h) → /api/auto-generate
  ↓
Coleta fontes RSS
  ↓
IA analisa tendências
  ↓
Gera post (Claude)
  ↓
Gera imagem (Gemini/OG)
  ↓
Salva no Supabase
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
   - Security headers

2. **Application Layer**
   - Authentication (Supabase)
   - Authorization (RLS)
   - Input validation
   - Output encoding

3. **Data Layer**
   - RLS policies
   - Encrypted connections
   - Secure storage

---

## Performance

### Otimizações

- Static generation quando possível
- Image optimization (Next.js)
- Code splitting
- CDN (Vercel Edge Network)

### Caching

- Static pages cached
- Images cached (7 days)
- API responses cached

---

## Monitoramento

- Vercel Analytics
- Supabase Logs
- Error tracking
- Performance monitoring

---

## Deploy

### Processo

1. Push para `main`
2. GitHub Actions CI
3. Build verificado
4. Deploy automático Vercel
5. Supabase migrations aplicadas

### Ambientes

- **Production**: Vercel + Supabase Production
- **Preview**: Vercel Preview (cada PR)

---

## Escalabilidade

### Atual
- Vercel Hobby (gratuito)
- Supabase Free tier
- ~$1/mês operacional

### Futuro
- Vercel Pro (se necessário)
- Supabase Pro (se necessário)
- CDN adicional (se necessário)

