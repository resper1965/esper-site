# Guia de Migração de Conteúdo para Supabase

## Pré-requisitos

O script de migração precisa das seguintes variáveis de ambiente:

- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de service role (privilegiada)

## Opção 1: Usar arquivo .env.local (Recomendado)

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://obhgzaxtsgjubzjermym.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

⚠️ **IMPORTANTE**: O arquivo `.env.local` está no `.gitignore` e não será commitado.

## Opção 2: Usar variáveis de ambiente do sistema

Exporte as variáveis antes de executar:

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://obhgzaxtsgjubzjermym.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
npm run migrate:content
```

## Executar a migração

```bash
npm run migrate:content
```

## O que o script faz

1. Lê todos os arquivos `.mdx` de:
   - `src/content/posts/`
   - `blog/content/`
   - Ignora o diretório `drafts/`

2. Para cada arquivo:
   - Extrai o frontmatter (metadados)
   - Extrai o conteúdo markdown
   - Normaliza os dados para o formato do Supabase
   - Verifica se o post já existe (pelo slug)
   - Insere no banco de dados se não existir

3. Respeita o campo `published` do frontmatter:
   - Se `published: true` ou não especificado → post é publicado
   - Se `published: false` → post fica como draft

## Estrutura esperada do frontmatter

```yaml
---
title: "Título do Post"
slug: "slug-do-post"
date: "2025-01-15"
category: "cibersegurança"
language: "pt-br"
excerpt: "Resumo do post"
description: "Descrição mais detalhada"
author: "Ricardo Esper"
coverImage: "/images/post-image.png"
keywords: ["palavra1", "palavra2"]
tags: ["tag1", "tag2"]
featured: true
readTime: "5 min read"
published: true
---
```

## Campos obrigatórios

- `title` - Título do post
- `slug` - Identificador único (URL-friendly)
- `date` - Data de publicação (formato: YYYY-MM-DD)

## Campos opcionais

- `category` - Categoria (default: "general")
- `language` - Idioma (default: "pt-br")
- `excerpt` - Resumo curto
- `description` - Descrição longa
- `author` - Autor (default: "Ricardo Esper")
- `coverImage` - URL da imagem de capa
- `keywords` - Array de palavras-chave
- `tags` - Array de tags
- `featured` - Post em destaque (default: false)
- `readTime` - Tempo de leitura estimado
- `published` - Se está publicado (default: true)

## Resolução de problemas

### Erro: "Missing Supabase environment variables"

Certifique-se de que as variáveis estão definidas no `.env.local` ou exportadas no shell.

### Erro: "Post já existe"

O script verifica se o post já existe pelo `slug`. Se já existir, ele será ignorado. Para forçar a atualização, você precisará deletar o post do Supabase primeiro ou atualizar manualmente.

### Erro ao processar frontmatter

Verifique se o frontmatter está no formato YAML válido e entre `---`.

## Após a migração

1. Verifique os posts no Supabase Dashboard
2. Teste a visualização dos posts no site
3. Verifique se as imagens estão acessíveis
4. Valide os metadados (tags, categorias, etc.)

