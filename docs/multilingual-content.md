# Conteúdo Multilíngue - Guia Completo

## 📝 Como Funciona

O sistema filtra automaticamente posts baseado no idioma da rota:
- **`/pt-BR/`** → Mostra posts com `language: "pt-BR"`
- **`/en/`** → Mostra posts com `language: "en"`

## 🌍 Estrutura de Posts

### Português (PT-BR)
```yaml
---
title: "Título em Português"
slug: "slug-em-portugues"
date: "2024-11-30"
language: "pt-BR"  # ← Campo de idioma
tags: ["Cibersegurança"]
thumbnail: "/thumbnails/ciberseguranca.png"
---

Conteúdo em português...
```

### English (EN)
```yaml
---
title: "Title in English"
slug: "slug-in-english"  # ← Slug diferente
date: "2024-11-30"
language: "en"  # ← Campo de idioma
tags: ["Cybersecurity"]
thumbnail: "/thumbnails/ciberseguranca.png"
---

Content in English...
```

## 📁 Organização de Arquivos

### Opção 1: Mesma pasta (Atual)
```
blog/content/
├── ciberseguranca-fundamentos.mdx     (pt-BR)
├── cybersecurity-fundamentals.mdx     (en)
├── viagens-seguranca.mdx              (pt-BR)
└── travel-security.mdx                (en)
```

### Opção 2: Sufixo de idioma (Alternativa)
```
blog/content/
├── ciberseguranca-fundamentos.pt-BR.mdx
├── ciberseguranca-fundamentos.en.mdx
├── viagens-seguranca.pt-BR.mdx
└── viagens-seguranca.en.mdx
```

## 🚀 Criando Posts Multilíngues

### Passo 1: Criar versão PT-BR
```bash
# blog/content/meu-post.mdx
---
title: "Meu Post sobre Segurança"
slug: "meu-post-seguranca"
language: "pt-BR"
date: "2024-11-30"
tags: ["Cibersegurança"]
---

Conteúdo em português...
```

### Passo 2: Criar versão EN
```bash
# blog/content/my-security-post.mdx
---
title: "My Security Post"
slug: "my-security-post"
language: "en"
date: "2024-11-30"
tags: ["Cybersecurity"]
---

Content in English...
```

## 🔍 Filtro Automático

O sistema já está configurado para:

1. **Homepage** (`src/app/[lang]/page.tsx`):
   ```tsx
   const filteredByLanguage = allPages.filter((page) => {
     const postLang = page.data.language || 'pt-BR';
     return postLang === lang;
   });
   ```

2. **Blog Posts** individuais:
   - URL: `/pt-BR/blog/slug-em-portugues`
   - URL: `/en/blog/slug-in-english`

## ✅ Checklist para Novo Post

- [ ] Escrever versão PT-BR
- [ ] Adicionar `language: "pt-BR"` no frontmatter
- [ ] Escrever versão EN (mesmo conteúdo, traduzido)
- [ ] Adicionar `language: "en"` no frontmatter EN
- [ ] Usar slug diferente para cada idioma
- [ ] Mesma data em ambas versões
- [ ] Tags traduzidas (Cibersegurança → Cybersecurity)

## 🎯 Status Atual

### Posts Existentes (PT-BR apenas):
- ✅ automacao-residencial-segura.mdx
- ✅ ciberseguranca-fundamentos.mdx
- ✅ contraespionagem-digital.mdx
- ✅ ia-generativa-seguranca.mdx
- ✅ ot-security-ambientes-industriais.mdx
- ✅ ransomware-as-a-service.mdx
- ✅ secops-operacoes-seguranca.mdx
- ✅ tscm-contramedidas-tecnicas.mdx
- ✅ vazamento-informacoes-dlp.mdx
- ✅ viagens-seguranca-digital.mdx
- ✅ vibe-coding-ia-desenvolvimento.mdx

### Para Criar (EN):
- [ ] Versões em inglês de todos os posts acima

## 🤖 Geração Automática de Posts

O sistema de geração automática (`src/lib/ai/post-generator.ts`) já está configurado para suportar idiomas:

```typescript
// Adicionar ao prompt de geração:
language: "${lang}"  // pt-BR ou en
```

## 🌐 URLs Geradas

### Português:
- `/pt-BR/` → Lista posts PT-BR
- `/pt-BR/blog/meu-post` → Post em português

### English:
- `/en/` → Lista posts EN
- `/en/blog/my-post` → Post em inglês

## 📊 Fallback Behavior

Se um post não tem campo `language`:
```typescript
const postLang = page.data.language || 'pt-BR';
```

**Padrão:** Assume PT-BR

## 🔧 Manutenção

### Adicionar campo language em posts existentes:

```bash
# Adicionar em TODOS os posts existentes:
language: "pt-BR"
```

### Criar versão EN de um post:

1. Copiar arquivo PT-BR
2. Traduzir conteúdo
3. Mudar slug para inglês
4. Alterar `language: "en"`
5. Traduzir tags

## 📝 Exemplo Completo

### PT-BR: `ransomware-defesa.mdx`
```yaml
---
title: "Ransomware: Estratégias de Defesa"
slug: "ransomware-estrategias-defesa"
date: "2024-12-01"
language: "pt-BR"
tags: ["Cibersegurança", "Ransomware"]
author: "Ricardo Esper"
thumbnail: "/thumbnails/ciberseguranca.png"
excerpt: "Como defender sua empresa contra ransomware"
---

Nos últimos anos, ataques de ransomware cresceram 300%...
```

### EN: `ransomware-defense.mdx`
```yaml
---
title: "Ransomware: Defense Strategies"
slug: "ransomware-defense-strategies"
date: "2024-12-01"
language: "en"
tags: ["Cybersecurity", "Ransomware"]
author: "Ricardo Esper"
thumbnail: "/thumbnails/ciberseguranca.png"
excerpt: "How to defend your company against ransomware"
---

In recent years, ransomware attacks have grown by 300%...
```

## 🚨 Importante

- **Slugs devem ser únicos** por idioma
- **Mesma data** para versões relacionadas
- **Campo language é obrigatório** para novos posts
- **Fallback** assume PT-BR se omitido

---

**Sistema ativo:** ✅
**Filtragem por idioma:** ✅
**Pronto para conteúdo multilíngue:** ✅
