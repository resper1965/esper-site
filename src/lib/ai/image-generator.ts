import { generateAbstractImage } from './abstract-image-generator';
import path from 'path';

/**
 * Gera uma imagem abstrata em greyscale baseada no slug
 * @param prompt - Descrição da imagem (não usado, mantido para compatibilidade)
 * @param slug - Slug do post (obrigatório para gerar imagem consistente)
 * @param title - Título do post (não usado, mantido para compatibilidade)
 * @param content - Conteúdo do post (não usado, mantido para compatibilidade)
 * @param excerpt - Excerpt do post (não usado, mantido para compatibilidade)
 * @param keywords - Keywords do frontmatter (não usado, mantido para compatibilidade)
 * @returns Caminho relativo da imagem gerada
 */
export async function generateImage(
  prompt: string, 
  slug?: string, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  content?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  excerpt?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  keywords?: string[]
): Promise<string> {
  if (!slug) {
    throw new Error('Slug é obrigatório para gerar imagem abstrata');
  }
  
  // Gerar imagem abstrata baseada no slug
  const imagesDir = path.join(process.cwd(), 'public/images');
  const imageFilename = `${slug}.png`;
  const imagePath = path.join(imagesDir, imageFilename);
  
  await generateAbstractImage(slug, imagePath);
  
  // Retornar caminho relativo
  return `/images/${imageFilename}`;
}


/**
 * Baixa uma imagem de uma URL ou data URL e salva localmente
 */
export async function downloadAndSaveImage(
  imageUrl: string,
  filePath: string
): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');

  try {
    let buffer: Buffer;
    
    // Se for data URL, converter diretamente
    if (imageUrl.startsWith('data:image/')) {
      const base64 = imageUrl.split(',')[1];
      buffer = Buffer.from(base64, 'base64');
    } else {
      // Se for URL, baixar
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Erro ao baixar imagem: ${response.statusText}`);
      }
      buffer = Buffer.from(await response.arrayBuffer());
    }

    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
    console.log('✅ Imagem salva em:', filePath);
  } catch (error) {
    console.error('❌ Erro ao salvar imagem:', error);
    throw error;
  }
}

// Re-exportar função de busca
export { searchFreeImage } from './image-fetcher';

