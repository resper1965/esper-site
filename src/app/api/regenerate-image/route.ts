import { NextResponse } from 'next/server';
import { generateImage, downloadAndSaveImage } from '@/lib/ai/image-generator';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN não está configurado' },
        { status: 500 }
      );
    }

    // Encontrar o arquivo do post
    const postsDir = path.join(process.cwd(), 'src/content/posts');
    const draftsDir = path.join(process.cwd(), 'src/content/posts/drafts');
    
    let postPath: string | null = null;
    let isDraft = false;

    // Procurar em posts publicados
    const postsFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
    for (const file of postsFiles) {
      const filePath = path.join(postsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(content);
      if (data.slug === slug) {
        postPath = filePath;
        break;
      }
    }

    // Se não encontrou, procurar em drafts
    if (!postPath && fs.existsSync(draftsDir)) {
      const draftFiles = fs.readdirSync(draftsDir).filter(f => f.endsWith('.mdx'));
      for (const file of draftFiles) {
        const filePath = path.join(draftsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(content);
        if (data.slug === slug) {
          postPath = filePath;
          isDraft = true;
          break;
        }
      }
    }

    if (!postPath) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    // Ler o post
    const postContent = fs.readFileSync(postPath, 'utf-8');
    const { data: frontmatter } = matter(postContent);

    // Obter ou gerar prompt para imagem
    let prompt = frontmatter.thumbnailPrompt;
    
    if (!prompt) {
      // Se não tem prompt, criar um baseado no título e categoria
      const category = frontmatter.category || 'general';
      const title = frontmatter.title || 'Post';
      
      prompt = `Professional illustration for blog post about ${title}, ${category} theme, high quality, clean design, modern style`;
    }

    console.log('🎨 Regenerando imagem para:', slug);
    console.log('📝 Prompt:', prompt);

    // Melhorar o prompt para ilustração
    const enhancedPrompt = `Professional illustration, ${prompt}, high quality, clean design, modern style, suitable for blog cover image`;

    // Gerar imagem
    const imageUrl = await generateImage(enhancedPrompt);

    // Salvar imagem
    const imagesDir = path.join(process.cwd(), 'public/images');
    const imageFilename = `${slug}.png`;
    const imagePath = path.join(imagesDir, imageFilename);

    await downloadAndSaveImage(imageUrl, imagePath);

    const coverImagePath = `/images/${imageFilename}`;
    console.log('✅ Imagem regenerada:', coverImagePath);

    // Atualizar frontmatter
    let updatedContent = postContent;
    
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

    // Salvar arquivo atualizado
    fs.writeFileSync(postPath, updatedContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Imagem regenerada com sucesso',
      coverImage: coverImagePath,
      slug,
      isDraft
    });
  } catch (error) {
    console.error('❌ Erro ao regenerar imagem:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

