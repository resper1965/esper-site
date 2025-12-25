# Tarefas Manuais - Checklist de Implementação

## 🔴 URGENTE - Configurações Essenciais

### 1. Variáveis de Ambiente no Vercel

Acesse o dashboard do Vercel e configure as seguintes variáveis de ambiente:

**Obrigatórias:**
- `GEMINI_API_KEY` - Chave da API do Google Gemini para geração de posts e descrições visuais (obter em: https://aistudio.google.com/app/apikey)
- `CRON_SECRET` - Token secreto para proteger o endpoint de cron (`/api/auto-generate`)

**Opcionais (mas recomendadas):**
- `NEXT_PUBLIC_GA_ID` - ID do Google Analytics 4 (formato: `G-XXXXXXXXXX`)
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` - Código de verificação do Google Search Console
- `EMAIL_NOTIFICATIONS` - `true` ou `false` para ativar notificações por email
- `NOTIFICATION_EMAIL` - Email para receber notificações de posts gerados
- `EMAIL_FROM` - Email remetente (padrão: `blog@ricardoesper.com.br`)
- `SMTP_HOST` - Servidor SMTP (se usar email)
- `SMTP_PORT` - Porta SMTP (padrão: 587)
- `SMTP_USER` - Usuário SMTP
- `SMTP_PASS` - Senha SMTP
- `AUTO_PUBLISH` - `true` ou `false` para auto-publicar posts com score >= 9.0

**Como configurar:**
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em Settings > Environment Variables
4. Adicione cada variável (separe por ambiente: Production, Preview, Development)

---

### 2. Google Search Console

**Passo 1: Criar propriedade**
1. Acesse: https://search.google.com/search-console
2. Adicione propriedade: `https://ricardoesper.com` (ou seu domínio)
3. Escolha método de verificação (recomendado: HTML tag)

**Passo 2: Obter código de verificação**
1. Copie o código de verificação fornecido
2. Adicione como variável de ambiente no Vercel: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
3. O código já está configurado no código (será inserido automaticamente)

**Passo 3: Submeter sitemap**
1. Após verificação, vá em Sitemaps
2. Submeta: `https://ricardoesper.com/sitemap.xml`
3. Aguarde indexação (pode levar alguns dias)

**Passo 4: Monitorar**
- Verifique erros de rastreamento
- Monitore indexação de páginas
- Acompanhe performance de busca

---

### 3. Google Analytics 4

**Passo 1: Criar propriedade GA4**
1. Acesse: https://analytics.google.com
2. Crie uma nova propriedade GA4
3. Configure dados básicos (nome, fuso horário, moeda)

**Passo 2: Obter Measurement ID**
1. Vá em Admin > Data Streams
2. Selecione seu stream web
3. Copie o Measurement ID (formato: `G-XXXXXXXXXX`)

**Passo 3: Configurar no Vercel**
1. Adicione variável: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
2. O Analytics já está implementado e funcionará automaticamente

**Passo 4: Verificar funcionamento**
1. Acesse seu site
2. Vá em GA4 > Realtime
3. Deve aparecer sua visita em tempo real

---

## 🟡 IMPORTANTE - Otimizações e Conteúdo

### 4. Adicionar Alt Text nas Imagens dos Posts

Alguns posts podem não ter `imageAlt` no front matter. Adicione descrições descritivas:

**Exemplo:**
```yaml
---
title: "Título do Post"
slug: "slug-do-post"
coverImage: "/images/post-image.jpg"
imageAlt: "Descrição detalhada da imagem para acessibilidade e SEO"
---
```

**Posts que podem precisar:**
- Verifique todos os posts em `src/content/posts/`
- Adicione `imageAlt` quando a imagem for relevante

---

### 5. Criar/Verificar Imagens Open Graph

**Verificar se existe:**
- `/public/og-image.png` (imagem padrão OG)
- `/public/logo.png` (logo para schema.org)

**Se não existir:**
1. Crie uma imagem OG de 1200x630px
2. Inclua logo, título do site, e design profissional
3. Salve como `public/og-image.png`

**Para posts específicos:**
- Imagens OG dinâmicas já estão configuradas
- Use `coverImage` ou `thumbnail` no front matter dos posts

---

### 6. Testar Páginas de Categoria

**Verificar se funcionam:**
- `/pt-BR/categoria/cybersecurity`
- `/pt-BR/categoria/counterespionage`
- `/pt-BR/categoria/forensics`
- `/en/category/cybersecurity`
- etc.

**Se não funcionar:**
- Verifique se os posts têm `category` no front matter
- Verifique se a categoria está no `categoryMap` em `src/app/[lang]/categoria/[category]/page.tsx`

---

### 7. Testar Página 404

**Verificar:**
1. Acesse uma URL inexistente: `https://ricardoesper.com/nao-existe`
2. Deve mostrar página 404 com sugestões de posts
3. Links devem funcionar corretamente

---

## 🟢 RECOMENDADO - Melhorias Futuras

### 8. Configurar Notificações por Email

**Se quiser receber emails quando posts forem gerados:**

1. Configure variáveis SMTP no Vercel:
   - `EMAIL_NOTIFICATIONS=true`
   - `NOTIFICATION_EMAIL=seu@email.com`
   - `SMTP_HOST=smtp.gmail.com` (ou seu servidor)
   - `SMTP_PORT=587`
   - `SMTP_USER=seu@email.com`
   - `SMTP_PASS=sua-senha-app` (use App Password do Gmail)

2. Teste o endpoint:
   - Acesse: `https://ricardoesper.com/api/auto-generate?token=SEU_CRON_SECRET`
   - Deve gerar post e enviar email (se configurado)

---

### 9. Monitorar Performance

**Ferramentas para usar:**

1. **PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Teste seu site
   - Monitore Core Web Vitals
   - Almeje: LCP < 2.5s, FID < 100ms, CLS < 0.1

2. **Google Search Console**
   - Monitore Core Web Vitals report
   - Verifique problemas de indexação
   - Acompanhe queries de busca

3. **Vercel Analytics** (opcional)
   - Ative no dashboard do Vercel
   - Monitore performance em tempo real

---

### 10. Adicionar Conteúdo Adicional

**Schema.org que pode ser adicionado:**

1. **FAQ Schema** - Para posts com perguntas frequentes
   - Use a função `generateFAQSchema()` já criada
   - Adicione no front matter ou no código do post

2. **HowTo Schema** - Para tutoriais
   - Use a função `generateHowToSchema()` já criada
   - Ideal para posts tipo "Como fazer..."

3. **Review Schema** - Se tiver reviews/avaliações
   - Adicione quando aplicável

---

### 11. Verificar Links Internos

**Revisar posts e adicionar links contextuais:**

1. Em cada post, adicione 3-5 links para posts relacionados
2. Use palavras-chave relevantes como anchor text
3. Exemplo: "Como expliquei no post sobre [TSCM](/pt-BR/blog/tscm-contramedidas-tecnicas)..."

---

### 12. Configurar Cron Job no Vercel

**O cron já está configurado em `vercel.json`**, mas verifique:

1. Acesse Vercel Dashboard > Settings > Cron Jobs
2. Deve aparecer: `0 6 * * *` → `/api/auto-generate`
3. Verifique se está ativo

**Para testar manualmente:**
```bash
curl "https://ricardoesper.com/api/auto-generate?token=SEU_CRON_SECRET"
```

---

## 📋 Checklist Rápido

### Configurações Essenciais
- [ ] Configurar `GEMINI_API_KEY` no Vercel (obter em: https://aistudio.google.com/app/apikey)
- [ ] Configurar `CRON_SECRET` no Vercel
- [ ] Configurar Google Search Console
- [ ] Adicionar `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- [ ] Configurar Google Analytics 4
- [ ] Adicionar `NEXT_PUBLIC_GA_ID`

### Verificações
- [ ] Testar páginas de categoria
- [ ] Testar página 404
- [ ] Verificar sitemap.xml está acessível
- [ ] Verificar robots.txt está acessível
- [ ] Verificar RSS feeds (`/pt-BR/rss.xml`, `/en/rss.xml`)

### Conteúdo
- [ ] Adicionar `imageAlt` em posts sem descrição
- [ ] Criar/verificar `og-image.png`
- [ ] Criar/verificar `logo.png`
- [ ] Revisar links internos nos posts

### Monitoramento
- [ ] Testar PageSpeed Insights
- [ ] Verificar Core Web Vitals
- [ ] Monitorar Google Search Console
- [ ] Verificar Google Analytics funcionando

### Opcional
- [ ] Configurar notificações por email
- [ ] Ativar Vercel Analytics
- [ ] Adicionar FAQ/HowTo schemas quando aplicável
- [ ] Configurar auto-publish (se desejar)

---

## 🔗 Links Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Search Console**: https://search.google.com/search-console
- **Google Analytics**: https://analytics.google.com
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Schema.org Validator**: https://validator.schema.org/

---

## ⚠️ Notas Importantes

1. **Variáveis de Ambiente**: Nunca commite variáveis de ambiente no Git. Use apenas o dashboard do Vercel.

2. **Cron Secret**: Use um token forte e aleatório. Exemplo:
   ```bash
   openssl rand -hex 32
   ```

3. **Google Site Verification**: O código será inserido automaticamente via metadata. Não precisa adicionar manualmente no HTML.

4. **Deploy**: Após configurar variáveis de ambiente, faça um novo deploy ou aguarde o próximo deploy automático.

5. **Testes**: Sempre teste em produção após configurar novas variáveis.

---

**Última atualização**: Todas as implementações de código estão completas. Restam apenas configurações manuais acima.

