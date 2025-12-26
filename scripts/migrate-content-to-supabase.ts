#!/usr/bin/env tsx
/**
 * Script de migração de conteúdo MDX para Supabase
 * 
 * Este script:
 * 1. Lê todos os arquivos MDX de src/content/posts e blog/content
 * 2. Extrai frontmatter e conteúdo
 * 3. Insere no Supabase
 * 4. Publica posts que já estavam publicados
 */

import { readFile, readdir } from 'fs/promises';
import { join, extname } from 'path';
import matter from 'gray-matter';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/database.types';

// Carregar variáveis de ambiente
config({ path: join(process.cwd(), '.env.local') });
config({ path: join(process.cwd(), '.env') });

type PostInsert = Database['public']['Tables']['posts']['Insert'];

interface FrontMatter {
  title: string;
  slug: string;
  date: string;
  category?: string;
  language?: string;
  excerpt?: string;
  description?: string;
  author?: string;
  coverImage?: string;
  imageAlt?: string;
  keywords?: string[] | string;
  tags?: string[] | string;
  featured?: boolean;
  readTime?: string;
  published?: boolean;
  [key: string]: unknown;
}

/**
 * Parse frontmatter de um arquivo MDX usando gray-matter
 */
function parseFrontMatter(content: string): { frontmatter: FrontMatter; body: string } {
  try {
    const parsed = matter(content);
    return {
      frontmatter: parsed.data as FrontMatter,
      body: parsed.content,
    };
  } catch (error) {
    throw new Error(`Invalid MDX file: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Normaliza dados do frontmatter para o formato do Supabase
 */
function normalizePostData(
  frontmatter: FrontMatter,
  content: string,
  filePath: string
): PostInsert {
  // Extrair slug do frontmatter ou do nome do arquivo
  const slug = frontmatter.slug || filePath.replace(/\.mdx?$/, '').split('/').pop() || '';

  // Normalizar arrays
  const keywords = Array.isArray(frontmatter.keywords)
    ? frontmatter.keywords
    : typeof frontmatter.keywords === 'string'
    ? [frontmatter.keywords]
    : undefined;

  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags
    : typeof frontmatter.tags === 'string'
    ? [frontmatter.tags]
    : undefined;

  // Determinar se está publicado (default: true se não especificado)
  const published = frontmatter.published !== undefined ? frontmatter.published : true;

  // Normalizar categoria (default: 'general')
  const category = frontmatter.category || 'general';

  // Normalizar idioma (default: 'pt-br')
  const language = (frontmatter.language || 'pt-br').toLowerCase();

  return {
    slug,
    title: frontmatter.title,
    content,
    excerpt: frontmatter.excerpt || frontmatter.description || '',
    description: frontmatter.description,
    category,
    language,
    author: frontmatter.author || 'Ricardo Esper',
    cover_image: frontmatter.coverImage,
    image_alt: frontmatter.imageAlt,
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
    tags: tags && tags.length > 0 ? tags : undefined,
    date: frontmatter.date,
    published,
    featured: frontmatter.featured || false,
    read_time: frontmatter.readTime,
    generated_by: 'manual',
  };
}

/**
 * Lê todos os arquivos MDX de um diretório
 */
async function readMdxFiles(dir: string): Promise<Array<{ path: string; content: string }>> {
  const files: Array<{ path: string; content: string }> = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Ignorar diretórios drafts
        if (entry.name === 'drafts') continue;
        // Recursão para subdiretórios
        const subFiles = await readMdxFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && (extname(entry.name) === '.mdx' || extname(entry.name) === '.md')) {
        try {
          const content = await readFile(fullPath, 'utf-8');
          files.push({ path: fullPath, content });
        } catch (error) {
          console.error(`❌ Erro ao ler arquivo ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao ler diretório ${dir}:`, error);
  }
  
  return files;
}

/**
 * Cria cliente Supabase para o script
 */
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Migra um arquivo MDX para o Supabase
 */
async function migrateMdxFile(
  file: { path: string; content: string },
  supabase: ReturnType<typeof createSupabaseClient>
): Promise<boolean> {
  try {
    const { frontmatter, body } = parseFrontMatter(file.content);
    const postData = normalizePostData(frontmatter, body, file.path);

    // Verificar se o post já existe
    const { data: existing } = await supabase
      .from('posts')
      .select('slug')
      .eq('slug', postData.slug)
      .single();

    if (existing) {
      console.log(`⏭️  Post já existe: ${postData.slug}`);
      return false;
    }

    // Inserir post
    const { error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error(`❌ Erro ao inserir post ${postData.slug}:`, error);
      return false;
    }

    console.log(`✅ Post migrado: ${postData.slug} (${postData.published ? 'publicado' : 'draft'})`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao processar arquivo ${file.path}:`, error);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando migração de conteúdo para Supabase...\n');

  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Variáveis de ambiente do Supabase não encontradas:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\n💡 Opções:');
    console.error('   1. Crie um arquivo .env.local com essas variáveis');
    console.error('   2. Exporte as variáveis no shell antes de executar');
    console.error('   3. Execute: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run migrate:content');
    console.error('\n📖 Veja scripts/MIGRATION-GUIDE.md para mais detalhes.');
    process.exit(1);
  }

  console.log(`✅ Conectando ao Supabase: ${supabaseUrl.substring(0, 30)}...\n`);

  const supabase = createSupabaseClient();

  // Diretórios para migrar
  const directories = [
    join(process.cwd(), 'src', 'content', 'posts'),
    join(process.cwd(), 'blog', 'content'),
  ];

  let totalFiles = 0;
  let migratedFiles = 0;
  let skippedFiles = 0;
  let errorFiles = 0;

  for (const dir of directories) {
    console.log(`📂 Lendo arquivos de: ${dir}`);
    const files = await readMdxFiles(dir);
    totalFiles += files.length;

    for (const file of files) {
      const success = await migrateMdxFile(file, supabase);
      if (success) {
        migratedFiles++;
      } else {
        // Verificar se foi erro ou se já existia
        const { frontmatter } = parseFrontMatter(file.content);
        const postData = normalizePostData(frontmatter, '', file.path);
        const { data: existing } = await supabase
          .from('posts')
          .select('slug')
          .eq('slug', postData.slug)
          .single();
        
        if (existing) {
          skippedFiles++;
        } else {
          errorFiles++;
        }
      }

      // Pequeno delay para não sobrecarregar o banco
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log('\n📊 Resumo da migração:');
  console.log(`   Total de arquivos: ${totalFiles}`);
  console.log(`   ✅ Migrados: ${migratedFiles}`);
  console.log(`   ⏭️  Já existiam: ${skippedFiles}`);
  console.log(`   ❌ Erros: ${errorFiles}`);
  console.log('\n✨ Migração concluída!');
}

// Executar
main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

