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
 * Busca imagem em bancos gratuitos
 */
async function searchFreeImage(query) {
  // Criar query otimizada
  const searchQuery = query
    .toLowerCase()
    .replace(/professional illustration for blog post about/gi, '')
    .replace(/greyscale|black and white|monochrome/gi, '')
    .replace(/high quality|clean design|modern style/gi, '')
    .trim()
    .substring(0, 100);

  console.log(`🔍 Buscando imagem: "${searchQuery}"`);

  // Tentar Unsplash
  const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
  if (UNSPLASH_KEY) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape&color=black_and_white`,
        {
          headers: { 'Authorization': `Client-ID ${UNSPLASH_KEY}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          console.log(`✅ Imagem encontrada no Unsplash`);
          return data.results[0].urls.regular;
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Erro no Unsplash: ${error.message}`);
    }
  }

  // Tentar Pexels
  const PEXELS_KEY = process.env.PEXELS_API_KEY;
  if (PEXELS_KEY) {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
        {
          headers: { 'Authorization': PEXELS_KEY }
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          console.log(`✅ Imagem encontrada no Pexels`);
          return data.photos[0].src.large;
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Erro no Pexels: ${error.message}`);
    }
  }

  // Tentar Pixabay
  const PIXABAY_KEY = process.env.PIXABAY_API_KEY;
  if (PIXABAY_KEY) {
    try {
      const response = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&per_page=1&safesearch=true`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
          console.log(`✅ Imagem encontrada no Pixabay`);
          return data.hits[0].largeImageURL || data.hits[0].webformatURL;
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Erro no Pixabay: ${error.message}`);
    }
  }

  console.log(`❌ Nenhuma imagem encontrada`);
  return null;
}

async function downloadAndSaveImage(imageUrl, filePath) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Erro ao baixar: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, buffer);
  console.log('✅ Imagem salva');
}

async function regenerateAllImages() {
  console.log('🔄 Buscando imagens em bancos gratuitos...\n');
  console.log('ℹ️  Usando: Unsplash, Pexels, Pixabay\n');

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
      await downloadAndSaveImage(imageUrl, imagePath);

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
