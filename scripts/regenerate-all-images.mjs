import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Replicate from 'replicate';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

const postsDir = path.join(__dirname, '..', 'src/content/posts');
const imagesDir = path.join(__dirname, '..', 'public/images');

// Garantir que o diretório de imagens existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function generateImage(prompt, retries = 3) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN não está configurado');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🎨 Gerando imagem (tentativa ${attempt}/${retries})...`);

      const output = await replicate.run(
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        {
          input: {
            prompt: prompt,
            num_outputs: 1,
            aspect_ratio: '16:9',
            output_format: 'png',
            output_quality: 90,
            num_inference_steps: 30,
            guidance_scale: 7.5,
          },
        }
      );

      const imageUrl = Array.isArray(output) ? output[0] : output;
      
      if (!imageUrl) {
        throw new Error('Nenhuma imagem foi gerada');
      }

      console.log('✅ Imagem gerada:', imageUrl);
      return imageUrl;
    } catch (error) {
      // Se for erro de rate limit ou crédito, aguardar mais tempo
      if (error.status === 429 || error.status === 402) {
        const waitTime = error.retry_after ? (error.retry_after * 1000) : (60 * 1000);
        console.log(`   ⚠️ Rate limit ou crédito insuficiente. Aguardando ${waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (attempt === retries) {
        throw error;
      }
      
      console.log(`   ⚠️ Erro na tentativa ${attempt}, tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
    }
  }
}

async function downloadAndSaveImage(imageUrl, filePath) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Erro ao baixar imagem: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, buffer);
  console.log('✅ Imagem salva em:', filePath);
}

async function regenerateAllImages() {
  console.log('🔄 Iniciando regeneração de todas as imagens...\n');

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
        prompt = `Professional illustration for blog post about ${title}, ${category} theme`;
      }

      // Adicionar instruções para greyscale
      const greyscalePrompt = `${prompt}, greyscale, black and white, monochrome, high quality, clean design, modern style, suitable for blog cover image`;

      console.log(`   🎨 Gerando imagem em greyscale...`);
      console.log(`   📝 Prompt: ${greyscalePrompt.substring(0, 100)}...`);

      // Gerar imagem
      const imageUrl = await generateImage(greyscalePrompt);

      // Salvar imagem
      const imageFilename = `${slug}.png`;
      const imagePath = path.join(imagesDir, imageFilename);

      await downloadAndSaveImage(imageUrl, imagePath);

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

      // Aguardar 12 segundos entre requisições para respeitar rate limit (6/min = 1 a cada 10s + margem)
      console.log(`   ⏳ Aguardando 12 segundos antes do próximo...`);
      await new Promise(resolve => setTimeout(resolve, 12000));

    } catch (error) {
      console.error(`   ❌ Erro ao processar ${slug}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n\n📊 Resumo:`);
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   📝 Total: ${files.length}`);
}

// Executar
regenerateAllImages().catch(console.error);

