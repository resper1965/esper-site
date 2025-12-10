# Guia de Imagens no Blog

## 🎨 Sistema Automático de Geração de Imagens

O blog possui um sistema automático que gera imagens em **escala de cinza**, **discretas** e **elegantes** para todos os posts.

### Geração Automática (Recomendado)

#### Via Interface Admin

1. Acesse: http://localhost:3000/admin/generate
2. Role até "🎨 Gerador de Imagens"
3. Clique em "Gerar Todas as Imagens"
4. Aguarde a conclusão (alguns minutos)

#### Via API

```bash
# Gerar todas as imagens
curl http://localhost:3000/api/generate-images/all

# Gerar imagem específica
curl "http://localhost:3000/api/generate-images?slug=seu-post&download=true"
```

### Características das Imagens Geradas

- **Estilo**: Minimalista em escala de cinza
- **Dimensões**: 1200x630px (otimizado para redes sociais)
- **Formato**: PNG
- **Localização**: `public/images/[slug].png`
- **Design**: Categoria, título, autor e site em tons discretos

## Estrutura de Pastas

- `public/images/` - Imagens de capa geradas automaticamente
- `public/thumbnails/` - Miniaturas dos posts (se necessário)

## Como Usar Imagens nos Posts

### 1. Imagem de Capa (Cover Image)

No frontmatter do post MDX, adicione:

```yaml
---
coverImage: "/images/nome-do-post.png"
---
```

**Nota**: Se você usar o slug do post como nome da imagem, ela será gerada automaticamente pelo sistema.

### 2. Imagens Dentro do Conteúdo

Você pode adicionar imagens diretamente no conteúdo MDX de duas formas:

#### Opção 1: Usando Markdown padrão

```markdown
![Texto alternativo](/images/nome-da-imagem.jpg)
```

#### Opção 2: Usando o componente Image

```jsx
<Image 
  src="/images/nome-da-imagem.jpg" 
  alt="Texto alternativo"
  width={1200}
  height={630}
/>
```

## Especificações Recomendadas

- **Imagem de capa (gerada)**: 1200x630px (formato Open Graph)
- **Imagens no conteúdo**: Largura máxima 1200px
- **Formato**: PNG para capas, JPG/PNG para conteúdo
- **Tamanho**: Otimizar para web (máximo 500KB por imagem)

## Exemplo Completo

### Post com Imagem Gerada Automaticamente

```markdown
---
title: "Zero Trust Architecture em 2025"
slug: "zero-trust-2025"
category: "cybersecurity"
coverImage: "/images/zero-trust-2025.png"
---

# Zero Trust Architecture em 2025

Conteúdo do post aqui.

![Diagrama Zero Trust](/images/zero-trust-diagram.jpg)

Mais conteúdo...
```

Neste caso, a imagem `/images/zero-trust-2025.png` será gerada automaticamente com:
- Fundo em escala de cinza
- Categoria "Cibersegurança"
- Título do post
- Branding discreto

## Personalização do Design

Para personalizar o design das imagens geradas, edite:

```
src/app/api/generate-images/route.tsx
```

Você pode ajustar:
- Cores por categoria (tons de cinza)
- Layout e espaçamento
- Tipografia
- Elementos decorativos

## Workflow Completo

1. **Criar o post**: Escreva o conteúdo MDX
2. **Adicionar frontmatter**: Inclua `coverImage: "/images/[slug].png"`
3. **Gerar imagens**: Use o admin ou API
4. **Verificar**: As imagens estarão em `public/images/`
5. **Publicar**: Commit e push

## APIs Disponíveis

### Gerar Todas as Imagens

```bash
GET /api/generate-images/all
```

Resposta:
```json
{
  "success": true,
  "total": 25,
  "successCount": 24,
  "errorCount": 1,
  "results": [...]
}
```

### Gerar Imagem Única

```bash
GET /api/generate-images?slug=nome-do-post&download=true
```

## Documentação Detalhada

Para mais informações, consulte:
- **[docs/image-generation.md](docs/image-generation.md)** - Documentação completa do sistema

## Notas

- Imagens em `public/` são servidas estaticamente
- Use caminhos absolutos começando com `/`
- Sempre inclua texto alternativo (alt) para acessibilidade
- Imagens são otimizadas automaticamente pelo Next.js Image
- O sistema de geração usa `@vercel/og` para renderização eficiente

