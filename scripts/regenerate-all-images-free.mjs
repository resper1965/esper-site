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
 * Extrai palavras-chave relevantes do conteúdo do post
 */
function extractKeywordsFromContent(content, excerpt, keywords) {
  const extracted = [];
  
  // 1. Usar keywords do frontmatter (mais relevantes)
  if (keywords && Array.isArray(keywords)) {
    extracted.push(...keywords.filter(k => k && k.length > 2));
  }
  
  // 2. Extrair do excerpt (resumo do post)
  if (excerpt) {
    const excerptWords = excerpt
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 4 && 
        !['para', 'com', 'que', 'uma', 'the', 'and', 'for', 'are', 'you', 'need', 'know', 'this', 'that', 'from', 'with', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word)
      )
      .slice(0, 5);
    extracted.push(...excerptWords);
  }
  
  // 3. Extrair do conteúdo (primeiras 2000 caracteres)
  if (content) {
    const contentText = content
      .replace(/[#*`\[\]()]/g, ' ') // Remover markdown
      .replace(/\n+/g, ' ')
      .substring(0, 2000) // Primeiras 2000 caracteres
      .toLowerCase();
    
    const contentWords = contentText
      .split(/\s+/)
      .filter(word => 
        word.length > 4 && 
        !['para', 'com', 'que', 'uma', 'the', 'and', 'for', 'are', 'you', 'need', 'know', 'this', 'that', 'from', 'with', 'have', 'been', 'will', 'would', 'could', 'should', 'como', 'mais', 'muito', 'sobre', 'quando', 'onde', 'porque'].includes(word)
      )
      .slice(0, 5);
    extracted.push(...contentWords);
  }
  
  // Remover duplicatas e retornar até 5 palavras mais relevantes
  return Array.from(new Set(extracted)).slice(0, 5);
}

/**
 * Busca imagem em bancos gratuitos SEM API key
 * Usa conteúdo do post para melhor contextualização
 */
async function searchFreeImage(query, slug, title, content, excerpt, keywords) {
  // Extrair palavras-chave do conteúdo
  const contentKeywords = extractKeywordsFromContent(content, excerpt, keywords);
  
  if (contentKeywords.length > 0) {
    console.log(`   📝 Keywords extraídas: ${contentKeywords.join(', ')}`);
  }
  // Prioridade: 1) Keywords do conteúdo, 2) Slug, 3) Título, 4) Query
  let searchKeywords = [];
  
  // 1. Usar palavras-chave extraídas do conteúdo (mais relevantes)
  if (contentKeywords && contentKeywords.length > 0) {
    searchKeywords = contentKeywords.slice(0, 4);
  }
  
  // 2. Se não tiver palavras suficientes, usar do slug
  if (searchKeywords.length < 2 && slug) {
    const slugWords = slug
      .split('-')
      .filter(word => word && word.length > 3 && !/^\d+$/.test(word))
      .slice(0, 3);
    searchKeywords = [...searchKeywords, ...slugWords].slice(0, 4);
  }
  
  // 3. Se ainda não tiver palavras suficientes, usar do título
  if (searchKeywords.length < 2 && title) {
    const titleWords = title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word && word.length > 3 && !['para', 'com', 'que', 'uma', 'the', 'and', 'for', 'are', 'you'].includes(word))
      .slice(0, 3);
    searchKeywords = [...searchKeywords, ...titleWords].slice(0, 4);
  }
  
  // 4. Fallback: usar query original
  if (searchKeywords.length === 0) {
    searchKeywords = query
      .toLowerCase()
      .replace(/professional illustration for blog post about/gi, '')
      .replace(/greyscale|black and white|monochrome/gi, '')
      .replace(/high quality|clean design|modern style/gi, '')
      .trim()
      .split(' ')
      .filter(word => word && word.length > 3)
      .slice(0, 3);
  }

  const searchQuery = searchKeywords.join(',');
  console.log(`🔍 Buscando: "${searchQuery}" (do conteúdo: ${contentKeywords.length > 0 ? 'sim' : 'não'})`);

  // Tentar Unsplash Source API (pública, sem API key)
  try {
    const imageUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(searchQuery)}&sig=${Date.now()}`;
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log(`✅ Imagem do Unsplash`);
      return imageUrl;
    }
  } catch (error) {
    console.log(`   ⚠️ Erro no Unsplash: ${error.message}`);
  }

  // Fallback: Lorem Picsum (usa slug para seed consistente)
  try {
    const seedSource = slug || query;
    const seed = seedSource.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageUrl = `https://picsum.photos/seed/${seed}/1200/630?grayscale`;
    console.log(`✅ Usando Lorem Picsum (greyscale, seed baseado no slug)`);
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
  console.log('📝 Agora usando conteúdo do post para melhor contextualização!\n');

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
  console.log(`📝 Encontrados ${files.length} posts\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: postContent } = matter(fileContent);

    const slug = frontmatter.slug || file.replace(/\.mdx$/, '');
    const title = frontmatter.title || 'Post';
    const category = frontmatter.category || 'general';
    const excerpt = frontmatter.excerpt || '';
    const keywords = frontmatter.keywords || [];
    
    console.log(`\n📄 ${title}`);
    console.log(`   Slug: ${slug}`);
    if (keywords.length > 0) {
      console.log(`   Keywords: ${keywords.join(', ')}`);
    }

    try {
      let prompt = frontmatter.thumbnailPrompt;
      if (!prompt) {
        prompt = `${title}, ${category}`;
      }

      // Passar conteúdo, excerpt e keywords para melhor contextualização
      const imageUrl = await searchFreeImage(
        prompt, 
        slug, 
        title,
        postContent, // Conteúdo completo do post
        excerpt, // Excerpt do post
        keywords // Keywords do frontmatter
      );
      
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
      let updatedContent = fileContent;
      
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
