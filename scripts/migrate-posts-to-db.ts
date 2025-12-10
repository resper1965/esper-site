#!/usr/bin/env tsx

/**
 * Script para migrar posts existentes do filesystem para o banco de dados SQLite
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { db, schema } from '../src/lib/db';
import { runMigrations } from '../src/lib/db/migrate';
import { eq } from 'drizzle-orm';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

async function migratePosts() {
  console.log('🔄 Iniciando migração de posts para banco de dados...\n');

  // Executar migrations
  await runMigrations();

  // Ler todos os arquivos MDX
  const files = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.mdx'));
  
  console.log(`📝 Encontrados ${files.length} posts para migrar\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const filePath = path.join(postsDirectory, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content } = matter(fileContents);

      const slug = frontmatter.slug || file.replace(/\.mdx$/, '');

      // Verificar se já existe
      const existing = await db.select().from(schema.posts).where(eq(schema.posts.slug, slug)).limit(1);
      
      if (existing.length > 0) {
        console.log(`⏭️  Já existe: ${slug}`);
        skipped++;
        continue;
      }

      // Preparar dados
      const postData = {
        slug,
        title: frontmatter.title || 'Sem título',
        content,
        excerpt: frontmatter.excerpt || '',
        description: frontmatter.description || frontmatter.excerpt || '',
        category: frontmatter.category || 'general',
        language: frontmatter.language || 'pt-br',
        author: frontmatter.author || 'Ricardo Esper',
        coverImage: frontmatter.coverImage || frontmatter.thumbnail || null,
        imageAlt: frontmatter.imageAlt || null,
        keywords: frontmatter.keywords ? JSON.stringify(frontmatter.keywords) : null,
        tags: frontmatter.tags ? JSON.stringify(frontmatter.tags) : null,
        date: frontmatter.date || new Date().toISOString().split('T')[0],
        published: true, // Posts existentes são considerados publicados
        featured: frontmatter.featured || false,
        readTime: frontmatter.readTime || null,
        generatedBy: frontmatter.generatedBy || null,
        score: null,
        sources: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: frontmatter.date || new Date().toISOString(),
      };

      // Inserir no banco
      await db.insert(schema.posts).values(postData);

      console.log(`✅ Migrado: ${slug}`);
      migrated++;

    } catch (error) {
      console.error(`❌ Erro ao migrar ${file}:`, error instanceof Error ? error.message : String(error));
      errors++;
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`   ✅ Migrados: ${migrated}`);
  console.log(`   ⏭️  Ignorados: ${skipped}`);
  console.log(`   ❌ Erros: ${errors}`);
  console.log(`   📝 Total: ${files.length}`);
  console.log('\n✨ Migração concluída!');
}

migratePosts().catch(console.error);

