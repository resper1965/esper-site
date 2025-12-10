/**
 * Busca imagens gratuitas SEM necessidade de API key
 * Usa Unsplash Source API (pública e gratuita)
 */

/**
 * Busca imagem no Unsplash usando Source API (pública, sem API key)
 * Limitação: retorna imagens aleatórias baseadas em palavras-chave
 */
async function searchUnsplashFree(query: string): Promise<string | null> {
  try {
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

    // Unsplash Source API - pública, sem API key
    // Retorna URL de imagem aleatória baseada na query
    const imageUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(searchQuery)}&sig=${Date.now()}`;
    
    // Verificar se a imagem existe fazendo uma requisição HEAD
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log(`✅ Imagem encontrada no Unsplash (Source API)`);
      return imageUrl;
    }
  } catch (error) {
    console.error('Erro ao buscar no Unsplash:', error);
  }

  return null;
}

/**
 * Busca imagem usando Lorem Picsum com palavras-chave (gratuito, sem API key)
 * Retorna imagens aleatórias em greyscale
 */
async function searchPicsumFree(query: string): Promise<string | null> {
  try {
    // Gerar seed baseado na query para ter consistência
    const seed = query
      .toLowerCase()
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Lorem Picsum com greyscale
    const imageUrl = `https://picsum.photos/seed/${seed}/1200/630?grayscale`;
    
    console.log(`✅ Usando Lorem Picsum (greyscale)`);
    return imageUrl;
  } catch (error) {
    console.error('Erro ao buscar no Picsum:', error);
  }

  return null;
}

/**
 * Busca imagem em bancos gratuitos SEM API key
 * Tenta: Unsplash Source API → Lorem Picsum
 */
export async function searchFreeImage(query: string): Promise<string | null> {
  console.log(`🔍 Buscando imagem gratuita: "${query.substring(0, 50)}..."`);

  // Tentar Unsplash Source API primeiro
  let result = await searchUnsplashFree(query);
  if (result) {
    return result;
  }

  // Fallback para Lorem Picsum (sempre funciona, mas é aleatório)
  result = await searchPicsumFree(query);
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

