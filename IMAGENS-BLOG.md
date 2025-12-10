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

## Geração Automática de Miniaturas (Grey Scale)

Para acelerar a criação de thumbnails discretas e monocromáticas baseadas no tema de cada post, use o script `scripts/generate-post-images.js`:

```bash
# Gera thumbnails para todos os posts em blog/content
node scripts/generate-post-images.js

# Regenerar apenas um post
node scripts/generate-post-images.js --slug=viagens-seguranca-digital

# Personalizar diretório de origem/saída
node scripts/generate-post-images.js --dir=blog/content --out=public/thumbnails
```

Características do layout gerado:

- Fundo em gradiente preto e cinza, sem cores vibrantes
- Padrões sutis diferentes para cada categoria (linhas, circuitos, grid, etc.)
- Tipografia minimalista com o título e o slug discretizados
- Referência final a `esper.ws` para manter branding consistente

O script detecta automaticamente o slug (ou usa o nome do arquivo) e salva um PNG em `public/thumbnails/<slug>.png`. Após a geração, certifique-se de que o frontmatter do post aponta para esse arquivo:

```yaml
thumbnail: "/thumbnails/<slug>.png"
```

Quando necessário, ajuste os temas no script (`TAG_THEME` e `SLUG_HINTS`) para mapear novos tópicos a um padrão monocromático específico.

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

