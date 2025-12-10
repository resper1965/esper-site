# Sistema de Geração de Imagens

## Visão Geral

Sistema automatizado para gerar imagens em **escala de cinza**, **discretas** e **elegantes** para todos os posts do blog. As imagens são otimizadas para redes sociais (1200x630px) e seguem um design minimalista.

## Características das Imagens

### Design
- **Estilo**: Minimalista e discreto
- **Cores**: Escala de cinza (sem cores vibrantes)
- **Fundo**: Tons escuros de cinza com padrão sutil
- **Tipografia**: Clean e moderna
- **Elementos**: Categoria, título, autor e site

### Especificações Técnicas
- **Dimensões**: 1200x630px
- **Formato**: PNG
- **DPI**: Adequado para web
- **Localização**: `public/images/[slug].png`

## Como Usar

### Opção 1: Interface Admin (Recomendado)

1. Acesse: `http://localhost:3000/admin/generate`
2. Role até a seção "🎨 Gerador de Imagens"
3. Clique em "🎨 Gerar Todas as Imagens"
4. Aguarde a conclusão (pode levar alguns minutos)
5. Veja o relatório de sucesso/erros

### Opção 2: API Direta

```bash
# Gerar todas as imagens de uma vez
curl http://localhost:3000/api/generate-images/all

# Gerar imagem de um post específico
curl "http://localhost:3000/api/generate-images?slug=seu-post-slug&download=true"
```

### Opção 3: Script Node.js

```bash
# Certifique-se que o servidor Next.js está rodando
npm run dev

# Em outro terminal, execute:
node scripts/generate-all-images.js http://localhost:3000
```

## Estrutura de Cores por Categoria

Cada categoria tem tons de cinza ligeiramente diferentes para sutileza:

| Categoria | Background | Accent |
|-----------|-----------|--------|
| Cibersegurança | `#1a1a1a` | `#888888` |
| Contraespionagem | `#0f0f0f` | `#999999` |
| Forense Digital | `#1c1c1c` | `#8a8a8a` |
| Compliance | `#171717` | `#909090` |
| Automação Residencial | `#1e1e1e` | `#858585` |
| Viagens | `#181818` | `#8c8c8c` |
| Vida | `#151515` | `#878787` |
| Geral | `#191919` | `#898989` |

## Exemplo de Layout

```
┌─────────────────────────────────────────────┐
│ [padrão de fundo sutil]                     │
│                                             │
│ CATEGORIA                                   │
│                                             │
│ Título do Post em                          │
│ Tamanho Grande                             │
│                                             │
│ ─────                                       │
│                                             │
│                                             │
│ Ricardo Esper              esper.ws         │
└─────────────────────────────────────────────┘
```

## API Endpoints

### GET /api/generate-images

Gera imagem para um post específico.

**Parâmetros:**
- `slug` (obrigatório): Slug do post
- `download` (opcional): `true` para salvar no servidor

**Exemplo:**
```
GET /api/generate-images?slug=phishing-what-is-how-to-avoid
GET /api/generate-images?slug=phishing-what-is-how-to-avoid&download=true
```

### GET /api/generate-images/all

Gera imagens para todos os posts de uma vez.

**Resposta:**
```json
{
  "success": true,
  "total": 25,
  "successCount": 24,
  "errorCount": 1,
  "results": [
    {
      "slug": "phishing-what-is-how-to-avoid",
      "title": "Phishing: What It Is and How to Avoid It",
      "category": "cybersecurity",
      "status": "success",
      "path": "/images/phishing-what-is-how-to-avoid.png"
    }
  ]
}
```

## Integração com Posts

As imagens são automaticamente referenciadas no frontmatter dos posts:

```yaml
---
title: "Título do Post"
slug: "titulo-do-post"
coverImage: "/images/titulo-do-post.png"
---
```

## Atualização de Imagens

Para atualizar todas as imagens (por exemplo, após mudança no design):

1. Modifique o design em `/src/app/api/generate-images/route.tsx`
2. Execute a geração novamente via admin ou API
3. As imagens antigas serão sobrescritas

## Personalização

### Modificar Design

Edite o arquivo: `/src/app/api/generate-images/route.tsx`

```typescript
// Ajustar cores
const categoryColors: Record<string, { bg: string; accent: string }> = {
  cybersecurity: { bg: '#1a1a1a', accent: '#888888' },
  // ...
};

// Ajustar layout no componente ImageResponse
```

### Adicionar Nova Categoria

1. Adicione em `categoryColors`:
```typescript
newcategory: { bg: '#1a1a1a', accent: '#888888' }
```

2. Adicione em `categoryLabels`:
```typescript
newcategory: 'Nova Categoria'
```

## Solução de Problemas

### Imagens não são geradas

**Problema**: Erro ao acessar a API
**Solução**: Verifique se o servidor Next.js está rodando

### Imagens com design errado

**Problema**: Imagens não seguem o padrão esperado
**Solução**: Limpe o cache e regenere:
```bash
rm -rf public/images/*.png
# Regere via admin
```

### Erro "Post not found"

**Problema**: Post não tem slug correto no frontmatter
**Solução**: Verifique o campo `slug` no arquivo MDX

## Monitoramento

O sistema gera logs detalhados:
- ✅ Posts processados com sucesso
- ❌ Posts com erro
- 📊 Estatísticas finais

Exemplo de output:
```
🎨 Geração de imagens concluída
✅ Sucesso: 24
❌ Erros: 1
📁 Imagens em: public/images/
```

## Boas Práticas

1. **Backup**: Faça backup das imagens antes de regerá-las
2. **Review**: Verifique algumas imagens manualmente após geração
3. **Performance**: Gere em horários de baixo tráfego
4. **Versionamento**: Não commite as imagens no Git (use `.gitignore`)

## Próximos Passos

- [ ] Adicionar variações de design
- [ ] Suporte a múltiplos idiomas na imagem
- [ ] Otimização automática de imagens
- [ ] Cache inteligente de imagens
