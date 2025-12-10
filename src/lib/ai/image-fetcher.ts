/**
 * Busca imagens gratuitas SEM necessidade de API key
 * Usa Unsplash Source API (pública e gratuita)
 */

/**
 * Busca imagem no Unsplash usando Source API (pública, sem API key)
 * Usa palavras-chave extraídas do slug e título para melhor correlação
 */
async function searchUnsplashFree(query: string, slug?: string, title?: string): Promise<string | null> {
  try {
    // Extrair palavras-chave do slug (mais específicas)
    let keywords: string[] = [];
    
    if (slug) {
      // Slug geralmente tem palavras separadas por hífen
      keywords = slug
        .split('-')
        .filter(word => word && word.length > 3 && !/^\d+$/.test(word)) // Filtrar palavras muito curtas e números
        .slice(0, 3); // Pegar até 3 palavras do slug
    }
    
    // Se não tiver palavras suficientes do slug, usar do título
    if (keywords.length < 2 && title) {
      const titleWords = title
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remover pontuação
        .split(/\s+/)
        .filter(word => word && word.length > 3 && !['para', 'com', 'que', 'uma', 'the', 'and', 'for', 'are', 'you', 'need', 'know'].includes(word))
        .slice(0, 3);
      keywords = [...keywords, ...titleWords].slice(0, 3);
    }
    
    // Fallback: usar query original
    if (keywords.length === 0 && query) {
      keywords = query
        .toLowerCase()
        .replace(/professional illustration for blog post about/gi, '')
        .replace(/greyscale|black and white|monochrome/gi, '')
        .replace(/high quality|clean design|modern style/gi, '')
        .trim()
        .split(' ')
        .filter(word => word && word.length > 3)
        .slice(0, 3);
    }

    if (keywords.length === 0) {
      return null;
    }

    const searchQuery = keywords.join(',');
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      return null;
    }

    // Unsplash Source API - pública, sem API key
    // Usa palavras-chave separadas por vírgula para melhor busca
    const imageUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(searchQuery)}&sig=${Date.now()}`;
    
    // Verificar se a imagem existe fazendo uma requisição HEAD com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    try {
      const response = await fetch(imageUrl, { 
        method: 'HEAD',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return imageUrl;
      }
    } catch {
      clearTimeout(timeoutId);
      // Timeout ou erro de rede - continuar para fallback
    }
  } catch (error) {
    console.error('Erro ao buscar no Unsplash:', error);
  }

  return null;
}

/**
 * Busca imagem usando Lorem Picsum com seed baseado no slug (gratuito, sem API key)
 * Retorna imagens consistentes em greyscale baseadas no slug
 */
async function searchPicsumFree(query: string, slug?: string): Promise<string | null> {
  try {
    // Usar slug para gerar seed mais consistente e relacionado ao conteúdo
    const seedSource = slug || query || 'default';
    const seed = seedSource
      .toLowerCase()
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Garantir que seed seja positivo
    const finalSeed = Math.abs(seed) || 1;

    // Lorem Picsum com greyscale - mesma seed = mesma imagem
    const imageUrl = `https://picsum.photos/seed/${finalSeed}/1200/630?grayscale`;
    
    return imageUrl;
  } catch (error) {
    console.error('Erro ao buscar no Picsum:', error);
  }

  return null;
}

/**
 * Busca imagem em bancos gratuitos SEM API key
 * Tenta: Unsplash Source API → Lorem Picsum
 * @param query - Prompt ou descrição da imagem
 * @param slug - Slug do post (para melhor correlação)
 * @param title - Título do post (para melhor correlação)
 */
export async function searchFreeImage(
  query: string, 
  slug?: string, 
  title?: string
): Promise<string | null> {
  console.log(`🔍 Buscando imagem: slug="${slug}", title="${title?.substring(0, 30)}..."`);

  // Tentar Unsplash Source API primeiro (usa slug e título para melhor busca)
  let result = await searchUnsplashFree(query, slug, title);
  if (result) {
    return result;
  }

  // Fallback para Lorem Picsum (usa slug para seed consistente)
  result = await searchPicsumFree(query, slug);
  if (result) {
    return result;
  }

  return null;
}

/**
 * Baixa uma imagem de uma URL e salva localmente
 */
export async function downloadAndSaveImage(
  imageUrl: string,
  filePath: string
): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');

  try {
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
  } catch (error) {
    console.error('❌ Erro ao salvar imagem:', error);
    throw error;
  }
}

