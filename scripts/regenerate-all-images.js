const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { generateImage, downloadAndSaveImage } = require('../src/lib/ai/image-generator');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const imagesDir = path.join(process.cwd(), 'public/images');

// Garantir que o diretório de imagens existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
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
      // Se já existe thumbnailPrompt, usar ele; senão criar baseado no título e categoria
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

      // Aguardar um pouco para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 2000));

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

