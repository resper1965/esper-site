#!/usr/bin/env tsx

/**
 * Script para regenerar imagens de todos os posts usando Gemini + Vercel OG
 * Usa o novo sistema de geração de imagens relevante baseado em slug e keywords
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { config } from 'dotenv';
import { generatePostImageWithOG } from '../src/lib/ai/image-generator-og';

// Carregar variáveis de ambiente
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  config({ path: envPath, override: true });
}

const postsDirectory = path.join(process.cwd(), 'src/content/posts');
const imagesDir = path.join(process.cwd(), 'public/images');

// Garantir que o diretório de imagens existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function regenerateAllImages() {
  console.log('🔄 Iniciando regeneração de imagens com Gemini + Vercel OG...\n');

  // Verificar se GEMINI_API_KEY está configurada
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Erro: GEMINI_API_KEY não configurada!');
    console.error('   Configure no arquivo .env.local ou variáveis de ambiente\n');
    process.exit(1);
  }

  // Ler todos os arquivos MDX
  const files = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.mdx'));
  
  console.log(`📝 Encontrados ${files.length} posts\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(postsDirectory, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content } = matter(fileContents);

      const slug = frontmatter.slug || file.replace(/\.mdx$/, '');
      const title = frontmatter.title || 'Post';
      const category = frontmatter.category || 'general';
      const excerpt = frontmatter.excerpt || '';
      const keywords = frontmatter.keywords || [];

      console.log(`🎨 Gerando imagem para: ${title}`);
      console.log(`   Slug: ${slug}`);
      console.log(`   Categoria: ${category}`);
      console.log(`   Keywords: ${keywords.join(', ') || 'nenhuma'}`);

      // Gerar imagem usando o novo sistema
      const imagePath = await generatePostImageWithOG(
        slug,
        title,
        keywords,
        category,
        excerpt
      );

      console.log(`   ✅ Imagem gerada: ${imagePath}\n`);
      successCount++;

      // Delay maior para respeitar rate limit (5 req/min no free tier)
      // Aguardar 15 segundos entre requisições para evitar 429
      console.log('   ⏳ Aguardando 15s para respeitar rate limit...\n');
      await new Promise(resolve => setTimeout(resolve, 15000));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Se for rate limit (429), aguardar mais tempo
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        console.error(`   ⚠️ Rate limit atingido. Aguardando 60s...`);
        await new Promise(resolve => setTimeout(resolve, 60000));
        // Tentar novamente
        try {
          const imagePath = await generatePostImageWithOG(
            slug,
            title,
            keywords,
            category,
            excerpt
          );
          console.log(`   ✅ Imagem gerada (retry): ${imagePath}\n`);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 15000));
          continue;
        } catch (retryError) {
          console.error(`   ❌ Erro no retry:`, retryError instanceof Error ? retryError.message : String(retryError));
          errorCount++;
          console.log('');
          continue;
        }
      }
      
      console.error(`   ❌ Erro ao gerar imagem para ${file}:`, errorMessage);
      errorCount++;
      console.log('');
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   📝 Total: ${files.length}`);
  console.log('\n✨ Regeneração concluída!');
}

// Executar
regenerateAllImages().catch(console.error);

