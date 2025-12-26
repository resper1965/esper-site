import { generatePostImageWithOG } from './image-generator-og.tsx';
import { generateThemedAbstractImage } from './abstract-image-generator';

/**
 * Gera imagem de capa para post conectada ao tema
 * 1. Usa Gemini para criar descrição visual baseada em slug e keywords
 * 2. Gera imagem usando Vercel OG Image com elementos visuais relevantes
 * 3. Fallback para imagem abstrata se OG falhar
 */
export async function generatePostImage(
  thumbnailPrompt: string,
  slug: string,
  title: string,
  content: string,
  excerpt: string,
  category: string,
  keywords: string[] = []
): Promise<string> {
  try {
    console.log('🎨 Gerando imagem relevante conectada ao tema do post...');
    
    // Tentar gerar com Vercel OG primeiro (melhor para SEO)
    try {
      const ogImage = await generatePostImageWithOG(
        slug,
        title,
        keywords.length > 0 ? keywords : extractKeywordsFromContent(content, title),
        category,
        excerpt
      );
      console.log('✅ Imagem OG gerada:', ogImage);
      return ogImage;
    } catch (error) {
      console.warn('⚠️ Erro ao gerar imagem OG, usando fallback abstrato:', error);
      // Fallback para imagem abstrata
      return await generateAbstractFallback(slug, title, content, excerpt, category, thumbnailPrompt);
    }
  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error);
    throw error;
  }
}

/**
 * Extrai keywords do conteúdo se não fornecidas
 */
function extractKeywordsFromContent(content: string, title: string): string[] {
  // Extrair palavras importantes do título e conteúdo
  const text = `${title} ${content.substring(0, 500)}`.toLowerCase();
  const commonWords = new Set(['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'em', 'para', 'com', 'por', 'que', 'é', 'são', 'como', 'mais', 'muito', 'também', 'quando', 'onde', 'qual', 'quais']);
  
  const words = text.match(/\b\w{4,}\b/g) || [];
  const wordCount = new Map<string, number>();
  
  words.forEach(word => {
    if (!commonWords.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  });
  
  // Retornar top 5 palavras mais frequentes
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Fallback: gera imagem abstrata quando OG falha
 */
async function generateAbstractFallback(
  slug: string,
  title: string,
  content: string,
  excerpt: string,
  category: string,
  thumbnailPrompt: string
): Promise<string> {
  console.log('🎨 Usando fallback: imagem abstrata temática...');

  // Usar thumbnailPrompt ou criar descrição básica
  const description = thumbnailPrompt || `${title} ${category}`;

  // Gerar e fazer upload para Supabase
  const imageUrl = await generateThemedAbstractImage(
    slug,
    description,
    title,
    category
  );

  console.log('✅ Imagem abstrata gerada como fallback');

  return imageUrl;
}

