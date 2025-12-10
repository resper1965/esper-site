import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const postsDir = path.join(__dirname, '..', 'src/content/posts');
const imagesDir = path.join(__dirname, '..', 'public/images');

// Garantir que o diretório de imagens existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Gera imagem usando Hugging Face Inference API (GRATUITA)
 * Modelo: stabilityai/stable-diffusion-xl-base-1.0
 */
async function generateImageWithHuggingFace(prompt) {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
  
  // Se não tiver API key, usar endpoint público (mais lento, mas funciona)
  const apiUrl = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (HF_API_KEY) {
    headers['Authorization'] = `Bearer ${HF_API_KEY}`;
  }

  // Adicionar instruções de greyscale ao prompt
  const greyscalePrompt = `${prompt}, greyscale, black and white, monochrome`;

  console.log('🎨 Gerando imagem via Hugging Face (GRATUITO)...');
  console.log(`   📝 Prompt: ${greyscalePrompt.substring(0, 80)}...`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        inputs: greyscalePrompt,
        parameters: {
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 1024,
          height: 576, // 16:9 aspect ratio
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Se o modelo estiver carregando, aguardar
      if (response.status === 503) {
        const retryAfter = response.headers.get('retry-after') || 20;
        console.log(`   ⏳ Modelo carregando, aguardando ${retryAfter}s...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return generateImageWithHuggingFace(prompt); // Retry
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    return Buffer.from(imageBuffer);
  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error.message);
    throw error;
  }
}

async function saveImage(imageBuffer, filePath) {
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, imageBuffer);
  console.log('✅ Imagem salva em:', filePath);
}

async function regenerateAllImages() {
  console.log('🔄 Iniciando regeneração de todas as imagens (GRATUITO via Hugging Face)...\n');
  console.log('ℹ️  Nota: Sem API key, o modelo pode demorar para carregar na primeira vez\n');

  // Ler todos os arquivos .mdx
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
  
  console.log(`📝 Encontrados ${files.length} posts\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: markdownContent } = matter(content);

    const slug = frontmatter.slug || file.replace(/\.mdx$/, '');
    const title = frontmatter.title || 'Post';
    const category = frontmatter.category || 'general';
    
    console.log(`\n📄 Processando: ${title}`);
    console.log(`   Slug: ${slug}`);

    try {
      // Criar prompt baseado no conteúdo
      let prompt = frontmatter.thumbnailPrompt;
      
      if (!prompt) {
        // Criar prompt baseado no título e categoria
        prompt = `Professional illustration for blog post about ${title}, ${category} theme, high quality, clean design, modern style`;
      }

      // Gerar imagem
      const imageBuffer = await generateImageWithHuggingFace(prompt);

      // Salvar imagem
      const imageFilename = `${slug}.png`;
      const imagePath = path.join(imagesDir, imageFilename);

      await saveImage(imageBuffer, imagePath);

      const coverImagePath = `/images/${imageFilename}`;
      console.log(`   ✅ Imagem salva: ${coverImagePath}`);

      // Atualizar frontmatter
      let updatedContent = content;
      
      // Atualizar ou adicionar coverImage
      if (frontmatter.coverImage) {
        updatedContent = updatedContent.replace(
          /coverImage:\s*["'][^"']*["']/,
          `coverImage: "${coverImagePath}"`
        );
      } else {
        // Adicionar coverImage antes do fechamento do frontmatter
        const frontmatterEnd = updatedContent.indexOf('---', 3);
        if (frontmatterEnd > 0) {
          const beforeFrontmatter = updatedContent.substring(0, frontmatterEnd);
          const afterFrontmatter = updatedContent.substring(frontmatterEnd);
          const coverImageLine = `coverImage: "${coverImagePath}"\n`;
          updatedContent = beforeFrontmatter + coverImageLine + afterFrontmatter;
        }
      }

      // Atualizar thumbnailPrompt se não existir
      if (!frontmatter.thumbnailPrompt) {
        const frontmatterEnd = updatedContent.indexOf('---', 3);
        if (frontmatterEnd > 0) {
          const beforeFrontmatter = updatedContent.substring(0, frontmatterEnd);
          const afterFrontmatter = updatedContent.substring(frontmatterEnd);
          const thumbnailPromptLine = `thumbnailPrompt: "${prompt}"\n`;
          updatedContent = beforeFrontmatter + thumbnailPromptLine + afterFrontmatter;
        }
      }

      // Salvar arquivo atualizado
      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      console.log(`   ✅ Post atualizado`);

      successCount++;

      // Aguardar 5 segundos entre requisições (Hugging Face tem rate limits)
      console.log(`   ⏳ Aguardando 5 segundos antes do próximo...`);
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
      console.error(`   ❌ Erro ao processar ${slug}:`, error.message);
      errorCount++;
      
      // Aguardar mais tempo em caso de erro
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  console.log(`\n\n📊 Resumo:`);
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   📝 Total: ${files.length}`);
}

// Executar
regenerateAllImages().catch(console.error);

