# Guia de Imagens no Blog

## Estrutura de Pastas

As imagens do blog devem ser colocadas em:
- `public/images/` - Para imagens de capa (coverImage)
- `public/thumbnails/` - Para miniaturas dos posts

## Como Adicionar Imagens

### 1. Imagem de Capa (Cover Image)

No frontmatter do post MDX, adicione:

```yaml
---
coverImage: "/images/nome-da-imagem.jpg"
---
```

A imagem será exibida automaticamente no topo do post.

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

- **Imagem de capa**: 1200x630px (formato Open Graph)
- **Imagens no conteúdo**: Largura máxima 1200px
- **Formato**: JPG ou PNG
- **Tamanho**: Otimizar para web (máximo 500KB por imagem)

## Exemplo Completo

```markdown
---
title: "Meu Post"
slug: "meu-post"
coverImage: "/images/capa-do-post.jpg"
---

# Meu Post

Conteúdo do post aqui.

![Descrição da imagem](/images/imagem-no-conteudo.jpg)

Mais conteúdo...
```

## Notas

- Imagens em `public/` são servidas estaticamente
- Use caminhos absolutos começando com `/`
- Sempre inclua texto alternativo (alt) para acessibilidade
- Imagens são otimizadas automaticamente pelo Next.js Image

