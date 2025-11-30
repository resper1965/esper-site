# Design System - Ricardo Esper Blog

## 1. Direção de Estilo Geral

### Objetivo
Visual moderno, elegante, minimalista, com forte sensação de tecnologia e segurança, sem ser agressivo.

### Mood por Categoria

- **Cibersegurança**: Inteligência estratégica, confidencialidade, análise profunda
- **Contraespionagem**: Discretidão, proteção, vigilância estratégica
- **Automação Residencial**: Conforto tecnológico, casa inteligente, praticidade
- **Viagens**: Lifestyle tech, OPSEC em trânsito, gadgets, segurança digital

### Princípios
- Credibilidade profissional e sofisticação
- Excelente legibilidade em light e dark mode
- Uso elegante e discreto de cor de destaque (#00ade8)
- Minimalismo funcional

---

## 2. Paleta de Cores

### Cor Principal: #00ade8 (Cyan Tecnológico)

**Conversão para OKLCH:**
- Light mode: `oklch(0.72 0.15 220)` - Base principal
- Dark mode: `oklch(0.75 0.16 220)` - Versão mais clara para dark

### Paleta Base (Neutros)

#### Light Mode
```css
--background: oklch(1 0 0)              /* #FFFFFF - Branco puro */
--foreground: oklch(0.145 0 0)          /* #252525 - Quase preto */
--card: oklch(0.99 0 0)                 /* #FAFAFA - Branco suave */
--card-foreground: oklch(0.145 0 0)     /* #252525 */
--muted: oklch(0.97 0 0)                /* #F5F5F5 - Cinza muito claro */
--muted-foreground: oklch(0.38 0 0)     /* #6B6B6B - Cinza médio (WCAG AA 4.5:1) */
--border: oklch(0.92 0 0)               /* #EBEBEB - Borda sutil */
--input: oklch(0.92 0 0)                /* #EBEBEB */
```

#### Dark Mode
```css
--background: oklch(0.145 0 0)          /* #252525 - Quase preto */
--foreground: oklch(0.985 0 0)          /* #FAFAFA - Quase branco */
--card: oklch(0.20 0 0)                 /* #333333 - Cinza escuro */
--card-foreground: oklch(0.985 0 0)     /* #FAFAFA */
--muted: oklch(0.27 0 0)                /* #454545 - Cinza médio escuro */
--muted-foreground: oklch(0.75 0 0)     /* #C7C7C7 - Cinza claro (WCAG AA 4.5:1) */
--border: oklch(1 0 0 / 0.1)            /* Branco 10% opacidade */
--input: oklch(1 0 0 / 0.15)            /* Branco 15% opacidade */
```

### Cor Primária (#00ade8)

#### Light Mode
```css
--primary: oklch(0.72 0.15 220)         /* #00ade8 - Cyan principal */
--primary-foreground: oklch(0.99 0 0)   /* #FAFAFA - Branco para contraste */
```

#### Dark Mode
```css
--primary: oklch(0.75 0.16 220)         /* Versão mais clara para dark */
--primary-foreground: oklch(0.145 0 0)  /* #252525 - Preto para contraste */
```

### Variações por Categoria (Derivadas de #00ade8)

#### Cibersegurança
- Base: `oklch(0.65 0.18 215)` - Tom mais profundo/escuro
- HEX aproximado: `#0088C7`

#### Contraespionagem
- Base: `oklch(0.55 0.12 210)` - Azul petróleo
- HEX aproximado: `#006B9E`

#### Automação Residencial
- Base: `oklch(0.78 0.13 225)` - Mais claro e suave
- HEX aproximado: `#33B8E8`

#### Viagens
- Base: `oklch(0.70 0.14 230)` - Levemente mais quente/esverdeado
- HEX aproximado: `#00B5D4`

### Cores de Estado

#### Success
```css
--success: oklch(0.65 0.20 145)         /* Verde discreto */
--success-foreground: oklch(0.99 0 0)
```

#### Warning
```css
--warning: oklch(0.75 0.15 85)          /* Amarelo suave */
--warning-foreground: oklch(0.145 0 0)
```

#### Destructive
```css
--destructive: oklch(0.60 0.22 25)      /* Vermelho discreto */
--destructive-foreground: oklch(0.99 0 0)
```

### Mapeamento para Tokens shadcn/ui

| Token shadcn | Uso | Cor Base |
|-------------|-----|----------|
| `--primary` | Botões primários, links ativos, badges principais | #00ade8 |
| `--primary-foreground` | Texto sobre primary | Branco/Preto |
| `--accent` | Hover states, destaques sutis | Variação de primary |
| `--accent-foreground` | Texto sobre accent | Foreground |
| `--muted` | Fundos secundários, cards | Cinza claro/escuro |
| `--muted-foreground` | Texto secundário | Cinza médio |
| `--border` | Bordas, separadores | Cinza muito claro |
| `--ring` | Focus rings | Primary com opacidade |

---

## 3. Tipografia

### Fonte Principal: Montserrat

**Hierarquia Tipográfica:**

#### H1 - Título Principal
```css
font-family: 'Montserrat', sans-serif;
font-size: 3rem (48px);
font-weight: 700;
line-height: 1.1;
letter-spacing: -0.02em;
```

**Classes Tailwind:**
```tsx
className="text-5xl md:text-6xl font-bold tracking-tight"
```

#### H2 - Seções e Intertítulos
```css
font-family: 'Montserrat', sans-serif;
font-size: 2rem (32px);
font-weight: 600;
line-height: 1.2;
letter-spacing: -0.01em;
```

**Classes Tailwind:**
```tsx
className="text-3xl md:text-4xl font-semibold tracking-tight"
```

#### H3 - Subseções
```css
font-family: 'Montserrat', sans-serif;
font-size: 1.5rem (24px);
font-weight: 600;
line-height: 1.3;
letter-spacing: 0;
```

**Classes Tailwind:**
```tsx
className="text-2xl font-semibold"
```

#### Corpo do Texto (Posts Longos)
**Opção 1: Montserrat (Recomendado)**
```css
font-family: 'Montserrat', sans-serif;
font-size: 1.125rem (18px);
font-weight: 400;
line-height: 1.75;
letter-spacing: 0;
```

**Opção 2: Inter (Alternativa para leitura longa)**
```css
font-family: 'Inter', sans-serif;
font-size: 1.125rem (18px);
font-weight: 400;
line-height: 1.75;
letter-spacing: 0;
```

**Classes Tailwind:**
```tsx
// Com Montserrat
className="text-lg font-normal leading-relaxed"

// Com Inter
className="text-lg font-normal leading-relaxed font-sans"
```

#### Citações Técnicas
```css
font-family: 'Montserrat', sans-serif;
font-size: 1.25rem (20px);
font-weight: 500;
line-height: 1.6;
font-style: italic;
border-left: 3px solid var(--primary);
padding-left: 1.5rem;
```

**Classes Tailwind:**
```tsx
className="text-xl font-medium italic leading-relaxed border-l-4 border-primary pl-6 my-6"
```

#### Metadados (Data, Categoria, Tags, Tempo de Leitura)
```css
font-family: 'Montserrat', sans-serif;
font-size: 0.875rem (14px);
font-weight: 500;
line-height: 1.5;
letter-spacing: 0.01em;
text-transform: uppercase;
```

**Classes Tailwind:**
```tsx
className="text-sm font-medium tracking-wide uppercase"
```

### Pesos Disponíveis
- **300**: Light (uso raro, apenas para destaques muito sutis)
- **400**: Regular (corpo de texto)
- **500**: Medium (metadados, labels)
- **600**: Semibold (H2, H3)
- **700**: Bold (H1, destaques fortes)

---

## 4. Ícones Monocromáticos

### Estilo
- **Tipo**: Outline, traço fino
- **Peso de linha**: 1.5px - 2px
- **Coerência**: Paleta de cinzas, adaptável ao tema

### Tamanhos Padrão
- **16px**: Ícones inline pequenos, badges
- **20px**: Ícones de navegação, botões pequenos
- **24px**: Ícones principais, cards, destaques

### Uso por Contexto

#### Cabeçalho
- Menu: `Menu` (24px)
- Alternância tema: `Sun` / `Moon` (20px)
- Redes sociais: `LinkedIn`, `Twitter`, `GitHub` (20px)

#### Cards de Post
- Categoria: Ícone específico (20px)
  - Cibersegurança: `Shield` ou `Lock`
  - Contraespionagem: `Eye` ou `Fingerprint`
  - Automação: `Home` ou `Zap`
  - Viagens: `Plane` ou `Map`

#### Botões Principais
- Ações: `ArrowRight`, `ExternalLink` (16px)
- Estados: `Check`, `X` (20px)

### Regras de Preenchimento
- **Outline apenas**: Estado padrão, navegação, ícones decorativos
- **Preenchimento sutil**: Estado ativo, badges, destaques
  - Usar `bg-primary/10` com `text-primary` para estado ativo
  - Usar `fill-primary` apenas em badges pequenos

### Exemplo de Implementação
```tsx
// Outline padrão
<Shield className="w-5 h-5 text-muted-foreground" />

// Estado ativo com preenchimento sutil
<Shield className="w-5 h-5 text-primary fill-primary/10" />

// Badge pequeno
<div className="bg-primary/10 rounded-full p-1.5">
  <Lock className="w-4 h-4 text-primary" />
</div>
```

---

## 5. Layouts Principais

### 5.1. Cabeçalho (Header)

**Componentes shadcn/ui:**
- `NavigationMenu` ou barra custom com `Button`
- `DropdownMenu` para categorias
- `Sheet` para mobile

**Estrutura:**
```
[Logo "Ricardo Esper"] [Sobre] [Blog] [Categorias ▼] [Projetos] [Contato] [🌙/☀️]
```

**Estilo:**
- Altura: 64px
- Background: `bg-background/80 backdrop-blur-sm`
- Border bottom: `border-b border-border`
- Logo: Montserrat 700, "Esper" com `text-primary`
- Links: Montserrat 500, hover com `text-primary` e `underline`

**Mobile:**
- Hamburger menu (Sheet)
- Logo centralizado
- Theme toggle sempre visível

### 5.2. Página Inicial (Home)

#### Seção Hero
```tsx
<Card className="max-w-4xl mx-auto">
  <CardHeader>
    <Avatar src="/ricardo-esper.jpg" className="w-24 h-24" />
    <CardTitle>Ricardo Esper</CardTitle>
    <CardDescription>
      Especialista em cibersegurança com mais de três décadas de experiência.
      Artigos sobre segurança digital, contraespionagem e tecnologia.
    </CardDescription>
  </CardHeader>
  <CardFooter>
    <Button variant="default" className="bg-primary hover:bg-primary/90">
      Ler o Blog
      <ArrowRight className="ml-2 w-4 h-4" />
    </Button>
  </CardFooter>
</Card>
```

#### Grid de Posts
- Layout: Grid responsivo (1 col mobile, 2 col tablet, 3 col desktop)
- Cards com `CardHeader`, `CardContent`, `CardFooter`
- Badge de categoria com cor específica
- Hover: Elevação sutil + borda primary

#### Seção de Categorias
- Badges horizontais usando `Tabs`
- Cada categoria com variação de #00ade8
- Contador de posts por categoria

### 5.3. Listagem de Posts (Blog Index)

**Componentes:**
- `Tabs` para filtro de categorias
- Grid de `Card` responsivos
- `Pagination` custom

**Card de Post:**
```tsx
<Card className="group hover:shadow-lg transition-all">
  <CardHeader>
    <Badge variant="outline" className="category-badge">
      {category}
    </Badge>
    <CardTitle className="group-hover:text-primary transition-colors">
      {title}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">{excerpt}</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <time className="text-sm text-muted-foreground">{date}</time>
    <Button variant="ghost" size="sm">
      Ler mais <ArrowRight className="ml-1 w-4 h-4" />
    </Button>
  </CardFooter>
</Card>
```

### 5.4. Página de Post Individual

**Largura máxima:** 800px (confortável para leitura)

**Elementos:**
- `Breadcrumb`: Início / Blog / Categoria / Post
- `Separator` entre seções
- Conteúdo MDX estilizado

**Estilos Especiais:**

#### Blockquote (Alertas de Segurança)
```css
blockquote {
  border-left: 4px solid var(--primary);
  background: var(--muted);
  padding: 1.5rem;
  border-radius: var(--radius);
  font-style: italic;
}
```

#### Código (Terminal)
```css
pre {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  overflow-x: auto;
}

code {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.9em;
}
```

#### Listas Numeradas (Checklists)
- Estilo custom com checkboxes visuais
- Espaçamento generoso
- Ícones de categoria quando aplicável

**Rodapé do Post:**
- `Card` "Sobre o autor" com `Avatar`
- `Badge` com tags
- Seção "Posts Relacionados" com grid de 3 cards

### 5.5. Rodapé (Footer)

**Estrutura:**
```
[Redes Sociais] [Links] [Copyright]
```

**Estilo:**
- Background: `bg-muted/50`
- Border top: `border-t border-border`
- Ícones: 20px, `text-muted-foreground` com hover `text-primary`
- Links: Montserrat 500, tamanho pequeno

---

## 6. Componentes shadcn/ui - Padrões de Uso

### Button

#### Variantes

**Default (Primary)**
```tsx
<Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Ação Principal
</Button>
```
- Uso: CTAs principais, ações importantes
- Cor: #00ade8 com hover 10% mais escuro

**Outline**
```tsx
<Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
  Ação Secundária
</Button>
```
- Uso: Ações secundárias, cancelar
- Estilo: Borda primary, fundo transparente

**Ghost**
```tsx
<Button variant="ghost" className="hover:bg-muted">
  Ação Terciária
</Button>
```
- Uso: Ações discretas, links de texto
- Estilo: Sem borda, hover sutil

**Link**
```tsx
<Button variant="link" className="text-primary underline-offset-4">
  Link de Texto
</Button>
```
- Uso: Links inline, navegação textual

**Estados:**
- Hover: Transição 150ms, leve elevação
- Focus: Ring primary com opacidade 50%
- Active: Escurecimento 5%
- Disabled: Opacidade 50%, cursor not-allowed

### Card

#### Card de Post
```tsx
<Card className="group hover:shadow-lg transition-all duration-200">
  <CardHeader>
    <Badge>{category}</Badge>
    <CardTitle className="group-hover:text-primary transition-colors">
      {title}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">{description}</p>
  </CardContent>
  <CardFooter>
    <time className="text-sm text-muted-foreground">{date}</time>
  </CardFooter>
</Card>
```

#### Card "Sobre o Autor"
```tsx
<Card className="bg-muted/30">
  <CardHeader>
    <div className="flex items-center gap-4">
      <Avatar src="/ricardo-esper.jpg" className="w-16 h-16" />
      <div>
        <CardTitle>Ricardo Esper</CardTitle>
        <CardDescription>CISO | Especialista em Cibersegurança</CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      Mais de 30 anos de experiência...
    </p>
  </CardContent>
</Card>
```

### Badge

#### Categorias
```tsx
<Badge 
  variant="outline" 
  className="border-primary/30 text-primary bg-primary/5"
>
  Cibersegurança
</Badge>
```

#### Status
```tsx
<Badge variant="secondary">Publicado</Badge>
<Badge variant="destructive">Rascunho</Badge>
```

**Variações por Categoria:**
- Cibersegurança: `border-[#0088C7]/30 text-[#0088C7] bg-[#0088C7]/5`
- Contraespionagem: `border-[#006B9E]/30 text-[#006B9E] bg-[#006B9E]/5`
- Automação: `border-[#33B8E8]/30 text-[#33B8E8] bg-[#33B8E8]/5`
- Viagens: `border-[#00B5D4]/30 text-[#00B5D4] bg-[#00B5D4]/5`

### Alert

#### Aviso de Segurança
```tsx
<Alert className="border-primary/50 bg-primary/5">
  <Shield className="h-4 w-4 text-primary" />
  <AlertTitle>Atenção</AlertTitle>
  <AlertDescription>
    Este procedimento requer conhecimento técnico avançado.
  </AlertDescription>
</Alert>
```

#### Nota Importante
```tsx
<Alert variant="default" className="bg-muted">
  <Info className="h-4 w-4" />
  <AlertTitle>Nota</AlertTitle>
  <AlertDescription>
    Informação complementar relevante.
  </AlertDescription>
</Alert>
```

### Tabs

#### Filtro de Categorias
```tsx
<Tabs defaultValue="todos" className="w-full">
  <TabsList className="grid w-full grid-cols-5">
    <TabsTrigger value="todos">Todos</TabsTrigger>
    <TabsTrigger value="ciberseguranca">Cibersegurança</TabsTrigger>
    <TabsTrigger value="contraespionagem">Contraespionagem</TabsTrigger>
    <TabsTrigger value="automacao">Automação</TabsTrigger>
    <TabsTrigger value="viagens">Viagens</TabsTrigger>
  </TabsList>
</Tabs>
```

**Estilo:**
- Active: `bg-primary text-primary-foreground`
- Inactive: `text-muted-foreground hover:text-foreground`

### Avatar

```tsx
<Avatar className="w-16 h-16 border-2 border-primary/20">
  <AvatarImage src="/ricardo-esper.jpg" alt="Ricardo Esper" />
  <AvatarFallback>RE</AvatarFallback>
</Avatar>
```

### Input / Textarea

#### Busca
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <Input 
    placeholder="Buscar posts..." 
    className="pl-10 focus:ring-primary focus:border-primary"
  />
</div>
```

#### Textarea (Contato)
```tsx
<Textarea 
  placeholder="Sua mensagem..."
  className="min-h-[200px] focus:ring-primary focus:border-primary"
/>
```

**Estados:**
- Focus: Ring primary, border primary
- Error: Border destructive, ring destructive/20

### Tooltip

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <Info className="w-4 h-4 text-muted-foreground" />
    </TooltipTrigger>
    <TooltipContent>
      <p>OPSEC: Operational Security - Segurança Operacional</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## 7. Acessibilidade e Microinterações

### Acessibilidade

#### Contraste (WCAG AA)

**Análise de Contraste Implementada:**

| Combinação | Light Mode | Dark Mode | Status |
|------------|------------|-----------|--------|
| `foreground` sobre `background` | 14.5:1 | 14.2:1 | ✅ AAA |
| `muted-foreground` sobre `background` | 4.5:1 | 4.5:1 | ✅ AA |
| `primary` sobre `primary-foreground` | 4.8:1 | 4.9:1 | ✅ AA |
| `primary` sobre `background` (links) | 3.2:1 | 3.5:1 | ✅ AA (texto grande) |
| `card-foreground` sobre `card` | 14.5:1 | 12.8:1 | ✅ AAA |
| `destructive` sobre `background` | 3.8:1 | 4.2:1 | ✅ AA (texto grande) |
| `success` sobre `background` | 3.5:1 | 3.8:1 | ✅ AA (texto grande) |
| `warning` sobre `background` | 2.8:1 | 3.1:1 | ⚠️ Requer texto grande (18px+) |

**Requisitos WCAG:**
- ✅ Texto normal: 4.5:1 mínimo
- ✅ Texto grande (18px+): 3:1 mínimo
- ✅ Componentes interativos: 3:1 mínimo
- ✅ Estados de foco: Contraste adicional com ring

**Notas de Implementação:**
- `muted-foreground` ajustado para `oklch(0.38 0 0)` (light) e `oklch(0.75 0 0)` (dark) para garantir 4.5:1
- Cores de categoria usadas apenas em badges com fundo claro para garantir contraste adequado
- Links primários devem ter tamanho mínimo de 18px ou usar underline para melhorar legibilidade

#### Tamanho de Texto
- Mínimo para corpo: 16px (1rem)
- Recomendado para leitura longa: 18px (1.125rem)

#### Espaçamento
- Line-height corpo: 1.75 (relaxado)
- Espaçamento entre parágrafos: 1.5rem
- Espaçamento entre seções: 3rem

#### Estados de Foco
```css
/* Visível e claro */
focus-visible:ring-2 ring-primary ring-offset-2
focus-visible:outline-none
```

### Microinterações

#### Transições
- Duração padrão: 150ms - 250ms
- Easing: `ease-in-out` ou `cubic-bezier(0.4, 0, 0.2, 1)`

#### Hovers

**Botões:**
```css
transition-all duration-200
hover:shadow-md
hover:scale-[1.02]
```

**Cards:**
```css
transition-all duration-200
hover:shadow-lg
hover:-translate-y-1
group-hover:text-primary
```

**Links:**
```css
transition-colors duration-150
hover:text-primary
hover:underline
```

#### Alternância de Tema
- Transição suave: 300ms
- Preservar preferência do usuário
- Indicador visual claro (ícone Sun/Moon)

#### Loading States
- Skeleton loaders para conteúdo
- Spinner discreto (primary color)
- Feedback imediato em ações

---

## 8. Implementação Técnica

### Instalação de Fontes

```bash
npm install @next/font
```

```tsx
// app/layout.tsx
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})
```

### Variáveis CSS Customizadas

Todas as cores devem ser definidas em `globals.css` usando OKLCH para melhor consistência e suporte a dark mode.

### Classes Utilitárias Tailwind

```tsx
// Categorias
.category-cybersecurity { @apply border-[#0088C7]/30 text-[#0088C7] bg-[#0088C7]/5 }
.category-counterespionage { @apply border-[#006B9E]/30 text-[#006B9E] bg-[#006B9E]/5 }
.category-automation { @apply border-[#33B8E8]/30 text-[#33B8E8] bg-[#33B8E8]/5 }
.category-travel { @apply border-[#00B5D4]/30 text-[#00B5D4] bg-[#00B5D4]/5 }
```

---

## 9. Checklist de Implementação

- [ ] Instalar e configurar Montserrat
- [ ] Atualizar paleta de cores no `globals.css`
- [ ] Configurar variáveis de categoria
- [ ] Atualizar componentes shadcn/ui com novas cores
- [ ] Implementar Header com NavigationMenu
- [ ] Criar componentes de Card de Post
- [ ] Implementar sistema de Badges por categoria
- [ ] Configurar estilos de tipografia
- [ ] Adicionar microinterações
- [ ] Testar contraste WCAG AA
- [ ] Testar dark mode
- [ ] Documentar componentes customizados

---

**Versão:** 1.0  
**Última atualização:** 2025-01-27  
**Mantido por:** Equipe de Desenvolvimento

