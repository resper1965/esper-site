# SEO & Analytics Setup Guide

Este guia explica como configurar todas as ferramentas de SEO e analytics implementadas no site.

## 📊 Google Analytics 4 (GA4)

### Setup Inicial

1. **Criar Propriedade GA4**
   - Acesse [Google Analytics](https://analytics.google.com)
   - Clique em "Admin" (ícone de engrenagem)
   - Em "Property", clique em "Create Property"
   - Escolha nome: "Ricardo Esper Blog"
   - Configure fuso horário e moeda
   - Selecione categoria: "Professional Services"

2. **Obter ID de Medição**
   - Após criar a propriedade, vá em "Data Streams"
   - Clique em "Add stream" > "Web"
   - Digite a URL: `https://esper.ws`
   - Copie o **Measurement ID** (formato: `G-XXXXXXXXXX`)

3. **Configurar no Projeto**
   - Crie/edite o arquivo `.env.local`:
   ```bash
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
   - Substitua `G-XXXXXXXXXX` pelo seu Measurement ID real
   - Reinicie o servidor de desenvolvimento

4. **Verificar Instalação**
   - Acesse seu site em modo de desenvolvimento
   - Abra DevTools > Console
   - Digite: `dataLayer`
   - Deve retornar um array com eventos

### Recursos Implementados

✅ **Tracking Automático:**
- Page views em todas as páginas
- Navegação entre idiomas (PT-BR/EN)
- Anonymização de IP (GDPR compliant)
- Cookie SameSite=None;Secure

✅ **Event Tracking:**
```typescript
import { trackEvent } from '@/components/analytics';

trackEvent({
  action: 'click',
  category: 'engagement',
  label: 'read_more_button',
  value: 1
});
```

✅ **Page View Tracking (SPA):**
```typescript
import { trackPageView } from '@/components/analytics';

useEffect(() => {
  trackPageView(pathname);
}, [pathname]);
```

---

## 🔍 Google Search Console

### Setup

1. **Adicionar Propriedade**
   - Acesse [Search Console](https://search.google.com/search-console)
   - Clique em "Add property"
   - Escolha "URL prefix"
   - Digite: `https://esper.ws`

2. **Verificação de Propriedade**

   **Método 1: HTML Tag (Recomendado)**
   - Search Console fornecerá uma meta tag
   - Adicione ao `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123xyz
   ```
   - O código já está configurado em `src/lib/metadata.ts`

   **Método 2: Arquivo HTML**
   - Baixe o arquivo fornecido
   - Coloque em `public/googleXXXXXXXX.html`

3. **Enviar Sitemaps**
   - Após verificação, vá em "Sitemaps"
   - Adicione:
     - `https://esper.ws/sitemap.xml`
   - Aguarde indexação (pode levar alguns dias)

4. **Configurar Versões Internacionais**
   - Em "Settings" > "International Targeting"
   - O sistema já usa hreflang tags automaticamente
   - Não é necessário configurar manualmente

---

## 📰 RSS Feed

### URLs Disponíveis

- Português: `https://esper.ws/pt-BR/rss.xml`
- English: `https://esper.ws/en/rss.xml`

### Validação

Teste seus feeds:
1. [W3C Feed Validator](https://validator.w3.org/feed/)
2. Insira as URLs acima
3. Corrija eventuais erros

### Divulgação

Adicione badges ao site (opcional):
```html
<link rel="alternate" type="application/rss+xml" title="Ricardo Esper Blog (PT-BR)" href="/pt-BR/rss.xml" />
<link rel="alternate" type="application/rss+xml" title="Ricardo Esper Blog (EN)" href="/en/rss.xml" />
```

---

## 🗺️ Sitemap

### Geração Automática

O sitemap é gerado automaticamente em:
- `https://esper.ws/sitemap.xml`

Inclui:
- Homepage
- Página "Sobre"
- Todos os posts do blog (ambos idiomas)
- Atualização automática baseada nas datas dos posts

### Verificação

1. Acesse: `https://esper.ws/sitemap.xml`
2. Valide em: [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

---

## 🤖 robots.txt

### Configuração Atual

Arquivo gerado automaticamente em `/robots.txt`:

```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://esper.ws/sitemap.xml
```

### Customização

Edite `src/app/robots.ts` para modificar regras.

---

## 📱 Open Graph & Twitter Cards

### Preview das Imagens

Teste como seus posts aparecem nas redes sociais:

1. **Facebook/LinkedIn:**
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Cole URL do post
   - Clique "Scrape Again" para atualizar cache

2. **Twitter:**
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - Cole URL do post
   - Visualize preview

### Imagens Recomendadas

- **OG Image**: 1200x630px (ratio 1.91:1)
- **Formato**: PNG ou JPG
- **Tamanho**: < 8MB (idealmente < 300KB)
- **Localização**: `/public/og-image.png`

Para posts individuais, use thumbnails customizadas.

---

## 🏷️ Structured Data (Schema.org)

### Schemas Implementados

✅ **Person** (Ricardo Esper)
- Nome, cargo, descrição
- Links sociais (LinkedIn, Twitter)
- Empresas relacionadas

✅ **WebSite**
- Informações do site
- Search action configurada
- Suporte multilíngue

✅ **BlogPosting** (cada post)
- Título, descrição, autor
- Datas de publicação/modificação
- Keywords e categoria
- Imagem destacada

✅ **BreadcrumbList** (navegação)
- Caminho de navegação completo
- URLs estruturadas

### Validação

1. [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Cole URL do post
3. Verifique se todos os schemas são detectados
4. Corrija warnings (se houver)

---

## 📈 Monitoramento e Métricas

### Principais Métricas no GA4

Acompanhe:
1. **Engagement** > Overview
   - Total users
   - Sessions
   - Engagement rate

2. **Engagement** > Pages and screens
   - Páginas mais visitadas
   - Tempo médio na página

3. **Acquisition** > Traffic acquisition
   - Fontes de tráfego
   - Canais (Organic, Direct, Referral)

4. **Demographics**
   - Países/idiomas dos visitantes
   - Ajuste estratégia de conteúdo

### Search Console - Principais Relatórios

1. **Performance**
   - Total clicks
   - Total impressions
   - Average CTR
   - Average position

2. **Coverage**
   - Páginas indexadas
   - Erros de indexação

3. **Enhancements**
   - Mobile usability
   - Core Web Vitals

---

## 🎯 Checklist Pós-Deploy

Após fazer deploy em produção:

- [ ] Google Analytics instalado e tracking
- [ ] Search Console verificado e sitemap enviado
- [ ] RSS feeds acessíveis e validados
- [ ] robots.txt acessível
- [ ] Sitemap.xml acessível
- [ ] Open Graph images testadas (Facebook Debugger)
- [ ] Twitter Cards testadas (Twitter Validator)
- [ ] Structured Data validada (Rich Results Test)
- [ ] Core Web Vitals > 90 (PageSpeed Insights)
- [ ] Todos os links internos funcionando
- [ ] Hreflang tags para ambos idiomas
- [ ] Canonical URLs corretas

---

## 🔗 Links Úteis

- [Google Analytics](https://analytics.google.com)
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Documentation](https://schema.org)

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Search Console Verification (opcional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123xyz

# Anthropic API (já existente)
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Importante:** Nunca commite `.env.local` no git!

---

## 🚀 Performance e SEO Score

Ferramentas para medir:

1. **Lighthouse** (Chrome DevTools)
   - Performance: > 90
   - SEO: > 95
   - Accessibility: > 90
   - Best Practices: > 90

2. **PageSpeed Insights**
   - Core Web Vitals
   - Mobile + Desktop

3. **SEO Analyzers**
   - [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools)
   - [SEMrush Site Audit](https://www.semrush.com)
   - [Moz Pro](https://moz.com/products/pro)

---

**Dúvidas?** Consulte a documentação oficial de cada ferramenta ou revise o código em:
- `src/lib/metadata.ts` - Helpers de metadata
- `src/components/analytics.tsx` - Google Analytics
- `src/app/sitemap.ts` - Sitemap generator
- `src/app/robots.ts` - Robots.txt
- `src/app/[lang]/rss.xml/route.ts` - RSS feed
