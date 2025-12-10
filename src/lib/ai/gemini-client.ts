import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente do .env.local se existir
const envPath = path.join(process.cwd(), '.env.local');
try {
  config({ path: envPath, override: false });
} catch (error) {
  // Ignorar erro se arquivo não existir
}

// Carregar chave do ambiente
const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY não encontrada nas variáveis de ambiente');
  }
  return apiKey;
};

// Criar instância de forma lazy para garantir que env vars estejam carregadas
let genAIInstance: GoogleGenerativeAI | null = null;
const getGenAI = () => {
  if (!genAIInstance) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada. Configure no arquivo .env.local ou variáveis de ambiente.');
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
};

/**
 * Cliente Gemini para geração de texto
 * Modelo: gemini-1.5-pro (ou gemini-1.5-flash para mais velocidade)
 * Custo: ~$0.00125/1K tokens input, ~$0.005/1K tokens output
 */
export async function generateTextWithGemini(
  prompt: string,
  systemInstruction?: string,
  model: 'gemini-1.5-pro' | 'gemini-1.5-flash' = 'gemini-1.5-pro'
): Promise<{ text: string; tokensUsed?: { input: number; output: number } }> {
  try {
    // Usar modelos disponíveis na API: gemini-2.5-pro ou gemini-2.5-flash
    const modelId = model === 'gemini-1.5-flash' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    
    const genAI = getGenAI();
    const modelInstance = genAI.getGenerativeModel({ 
      model: modelId,
      systemInstruction: systemInstruction || 'You are a helpful assistant.',
    });

    const result = await modelInstance.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Obter uso de tokens se disponível
    const usageMetadata = response.usageMetadata;
    const tokensUsed = usageMetadata ? {
      input: usageMetadata.promptTokenCount || 0,
      output: usageMetadata.candidatesTokenCount || 0,
    } : undefined;

    return {
      text,
      tokensUsed,
    };
  } catch (error) {
    console.error('Erro ao gerar texto com Gemini:', error);
    throw error;
  }
}

/**
 * Usa Gemini para melhorar/criar prompt de imagem baseado no conteúdo do post
 * Analisa título, excerpt e conteúdo para criar um prompt visual relevante
 */
export async function generateImagePromptWithGemini(
  title: string,
  excerpt: string,
  content: string,
  category: string,
  thumbnailPrompt?: string
): Promise<string> {
  try {
    const systemInstruction = `Você é um especialista em criar prompts para geração de imagens. Crie prompts detalhados e visuais baseados no conteúdo fornecido.`;

    const prompt = `
Analise o seguinte post de blog e crie um prompt detalhado para geração de imagem de capa.

# TÍTULO
${title}

# RESUMO
${excerpt}

# CATEGORIA
${category}

# CONTEÚDO (primeiros 1000 caracteres)
${content.substring(0, 1000)}

# PROMPT INICIAL (se fornecido)
${thumbnailPrompt || 'Nenhum'}

# REQUISITOS DO PROMPT
- Estilo: Minimalista, elegante, moderno, profissional
- Cores: Escala de cinza (gray-950 #030712 como base escura) com acento cyan (#00ade8)
- Composição: Clean, espaço negativo abundante, tipografia moderna
- Elementos: Máximo 2-3 elementos visuais relacionados ao tema
- Evitar: Pessoas, elementos muito detalhados, múltiplas cores
- Tema: Deve representar visualmente o conteúdo do post

# OUTPUT
Retorne APENAS o prompt de imagem, sem explicações, sem markdown, sem aspas. Apenas o texto do prompt.
`;

    const result = await generateTextWithGemini(
      prompt,
      systemInstruction,
      'gemini-1.5-flash' // Flash é suficiente para melhorar prompts
    );

    // Limpar o prompt (remover markdown, aspas, etc)
    let cleanedPrompt = result.text.trim();
    cleanedPrompt = cleanedPrompt.replace(/^["']|["']$/g, ''); // Remover aspas
    cleanedPrompt = cleanedPrompt.replace(/```[\w]*\n?|\n?```/g, ''); // Remover code blocks
    cleanedPrompt = cleanedPrompt.trim();

    return cleanedPrompt || thumbnailPrompt || `Professional illustration for ${title}, minimalist design, grayscale with cyan accent`;
  } catch (error) {
    console.error('Erro ao gerar prompt com Gemini:', error);
    // Fallback para prompt original ou padrão
    return thumbnailPrompt || `Professional illustration for ${title}, minimalist design, grayscale with cyan accent`;
  }
}

/**
 * Cria descrição visual detalhada baseada em slug e keywords
 * Otimizado para SEO e geração de imagens relevantes
 */
export async function generateVisualDescriptionWithGemini(
  slug: string,
  title: string,
  keywords: string[],
  category: string,
  excerpt?: string
): Promise<string> {
  try {
    const systemInstruction = `Você é um especialista em criar descrições visuais para imagens de blog. Crie descrições que identifiquem elementos visuais, ícones e temas relevantes baseados em palavras-chave e contexto.`;

    const prompt = `
Analise as seguintes informações do post e crie uma descrição visual detalhada para gerar uma imagem de capa relevante.

# SLUG
${slug}

# TÍTULO
${title}

# PALAVRAS-CHAVE
${keywords.join(', ')}

# CATEGORIA
${category}

# RESUMO (se disponível)
${excerpt || 'N/A'}

# REQUISITOS
- Identifique 2-3 elementos visuais principais (ícones, símbolos, conceitos)
- Sugira temas visuais relevantes (rede, segurança, tecnologia, etc.)
- Mantenha foco em elementos que representem bem o conteúdo
- Considere SEO: elementos devem ser relevantes para as palavras-chave

# OUTPUT
Retorne APENAS uma descrição curta (máximo 50 palavras) identificando os elementos visuais principais, sem explicações adicionais.
Exemplo: "cybersecurity shield icon, network connections, lock symbol, digital security theme"
`;

    const result = await generateTextWithGemini(
      prompt,
      systemInstruction,
      'gemini-1.5-flash' // Mapeado para gemini-2.5-flash
    );

    let description = result.text.trim();
    // Limpar markdown e formatação
    description = description.replace(/^["']|["']$/g, '');
    description = description.replace(/```[\w]*\n?|\n?```/g, '');
    description = description.trim();

    return description || `${category} theme, ${keywords.slice(0, 2).join(' and ')}`;
  } catch (error) {
    console.error('Erro ao gerar descrição visual com Gemini:', error);
    return `${category} theme, ${keywords.slice(0, 2).join(' and ')}`;
  }
}

