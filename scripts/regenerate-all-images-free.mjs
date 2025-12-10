import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local') });

const postsDir = path.join(dirname(fileURLToPath(import.meta.url)), '..', 'src/content/posts');
const imagesDir = path.join(dirname(fileURLToPath(import.meta.url)), '..', 'public/images');

// Garantir que o diretório de imagens existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Busca imagem em bancos gratuitos SEM API key
 * Usa Unsplash Source API (pública) e Lorem Picsum (fallback)
 */
async function searchFreeImage(query) {
  // Criar query otimizada
  const searchQuery = query
    .toLowerCase()
    .replace(/professional illustration for blog post about/gi, '')
    .replace(/greyscale|black and white|monochrome/gi, '')
    .replace(/high quality|clean design|modern style/gi, '')
    .trim()
    .split(' ')
    .slice(0, 3) // Pegar primeiras 3 palavras
    .join('-');

  console.log(`🔍 Buscando: "${searchQuery}"`);

  // Tentar Unsplash Source API (pública, sem API key)
  try {
    const imageUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(searchQuery)}&sig=${Date.now()}`;
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log(`✅ Imagem do Unsplash Source API`);
      return imageUrl;
    }
  } catch (error) {
    console.log(`   ⚠️ Erro no Unsplash: ${error.message}`);
  }

  // Fallback: Lorem Picsum (sempre funciona, greyscale)
  try {
    const seed = query.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageUrl = `https://picsum.photos/seed/${seed}/1200/630?grayscale`;
    console.log(`✅ Usando Lorem Picsum (greyscale)`);
    return imageUrl;
  } catch (error) {
    console.log(`   ⚠️ Erro no Picsum: ${error.message}`);
  }

  return null;
}

async function downloadAndSaveImage(imageUrl, filePath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, buffer);
      console.log('✅ Imagem salva');
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`   ⚠️ Tentativa ${attempt} falhou, tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}

async function regenerateAllImages() {
  console.log('🔄 Buscando imagens em bancos gratuitos (SEM API KEY)...\n');
  console.log('ℹ️  Usando: Unsplash Source API (público) → Lorem Picsum (fallback)\n');

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
  console.log(`📝 Encontrados ${files.length} posts\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(content);

    const slug = frontmatter.slug || file.replace(/\.mdx$/, '');
    const title = frontmatter.title || 'Post';
    const category = frontmatter.category || 'general';
    
    console.log(`\n📄 ${title}`);
    console.log(`   Slug: ${slug}`);

    try {
      let prompt = frontmatter.thumbnailPrompt;
      if (!prompt) {
        prompt = `${title}, ${category}`;
      }

      const imageUrl = await searchFreeImage(prompt);
      
      if (!imageUrl) {
        console.log(`   ⚠️ Pulando (nenhuma imagem encontrada)`);
        errorCount++;
        continue;
      }

      const imageFilename = `${slug}.png`;
      const imagePath = path.join(imagesDir, imageFilename);
      
      try {
        await downloadAndSaveImage(imageUrl, imagePath);
      } catch (downloadError) {
        console.log(`   ⚠️ Erro ao baixar, tentando novamente...`);
        // Tentar novamente após 3 segundos
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
          await downloadAndSaveImage(imageUrl, imagePath);
        } catch (retryError) {
          console.log(`   ❌ Erro persistente, pulando este post`);
          errorCount++;
          continue;
        }
      }

      const coverImagePath = `/images/${imageFilename}`;
      console.log(`   ✅ Imagem salva: ${coverImagePath}`);

      // Atualizar frontmatter
      let updatedContent = content;
      
      if (frontmatter.coverImage) {
        updatedContent = updatedContent.replace(
          /coverImage:\s*["'][^"']*["']/,
          `coverImage: "${coverImagePath}"`
        );
      } else {
        const frontmatterEnd = updatedContent.indexOf('---', 3);
        if (frontmatterEnd > 0) {
          const beforeFrontmatter = updatedContent.substring(0, frontmatterEnd);
          const afterFrontmatter = updatedContent.substring(frontmatterEnd);
          const coverImageLine = `coverImage: "${coverImagePath}"\n`;
          updatedContent = beforeFrontmatter + coverImageLine + afterFrontmatter;
        }
      }

      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      successCount++;

      // Aguardar 1 segundo entre requisições
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`   ❌ Erro: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n\n📊 Resumo:`);
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   📝 Total: ${files.length}`);
}

regenerateAllImages().catch(console.error);
