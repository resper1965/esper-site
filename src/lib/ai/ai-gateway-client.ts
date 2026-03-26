/**
 * AI client built on Cloudflare Workers AI + AI Gateway.
 *
 * Uses Llama models on Cloudflare as the primary text generation path.
 */

import { logger } from '@/lib/logger';
import {
  generateChatCompletion,
  type WorkersAITextModel,
} from '@/lib/cloudflare/ai-gateway';

export type AIModel = WorkersAITextModel;

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  fallbackModels?: AIModel[];
}

export interface GenerateTextResult {
  text: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
  model?: string;
}

/**
 * Generate text using AI Gateway with automatic fallback
 * 
 * @param options - Generation options
 * @returns Generated text with token usage
 */
export async function generateTextWithAI(
  options: GenerateTextOptions
): Promise<GenerateTextResult> {
  const {
    prompt,
    systemInstruction,
    model = '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    temperature = 0.7,
    maxTokens,
    fallbackModels = ['@cf/meta/llama-3.1-8b-instruct-fast'],
  } = options;

  const modelsToTry = [model, ...fallbackModels];

  let lastError: Error | null = null;

  for (const currentModel of modelsToTry) {
    try {
      logger.info('Generating text with Cloudflare Workers AI', {
        model: currentModel,
        promptLength: prompt.length,
      });

      const result = await generateChatCompletion({
        model: currentModel,
        messages: [
          {
            role: 'system',
            content: systemInstruction || 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        maxTokens,
      });

      logger.info('Text generated successfully', {
        model: currentModel,
        tokensUsed: result.usage,
      });

      return {
        text: result.text,
        tokensUsed: result.usage
          ? {
              input: result.usage.input,
              output: result.usage.output,
            }
          : undefined,
        model: currentModel,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn('Failed to generate text with model, trying fallback', {
        model: currentModel,
        error: lastError.message,
      });

      // Continue to next model if this one failed
      continue;
    }
  }

  // All models failed
  logger.error('All AI models failed', {
    models: modelsToTry,
    error: lastError?.message,
  });
  throw new Error(
    `Failed to generate text with all models. Last error: ${lastError?.message}`
  );
}

/**
 * Generate text with Gemini (backward compatibility)
 * Maps to AI Gateway model
 */
export async function generateTextWithGemini(
  prompt: string,
  systemInstruction?: string,
  model: 'gemini-1.5-pro' | 'gemini-1.5-flash' = 'gemini-1.5-pro'
): Promise<GenerateTextResult> {
  const aiGatewayModel: AIModel =
    model === 'gemini-1.5-flash'
      ? '@cf/meta/llama-3.1-8b-instruct-fast'
      : '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

  return generateTextWithAI({
    prompt,
    systemInstruction,
    model: aiGatewayModel,
  });
}

/**
 * Generate image prompt using AI Gateway
 * Uses faster model (flash) for prompt generation
 */
export async function generateImagePromptWithAI(
  title: string,
  excerpt: string,
  content: string,
  category: string,
  thumbnailPrompt?: string
): Promise<string> {
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

  try {
    const result = await generateTextWithAI({
      prompt,
      systemInstruction,
      model: '@cf/meta/llama-3.1-8b-instruct-fast',
      temperature: 0.8,
    });

    // Limpar o prompt (remover markdown, aspas, etc)
    let cleanedPrompt = result.text.trim();
    cleanedPrompt = cleanedPrompt.replace(/^["']|["']$/g, ''); // Remover aspas
    cleanedPrompt = cleanedPrompt.replace(/```[\w]*\n?|\n?```/g, ''); // Remover code blocks
    cleanedPrompt = cleanedPrompt.trim();

    return cleanedPrompt || thumbnailPrompt || `Professional illustration for ${title}, minimalist design, grayscale with cyan accent`;
  } catch (error) {
    logger.error('Error generating image prompt', { error });
    // Fallback para prompt original ou padrão
    return thumbnailPrompt || `Professional illustration for ${title}, minimalist design, grayscale with cyan accent`;
  }
}

/**
 * Generate visual description using AI Gateway
 * Uses faster model for SEO-optimized descriptions
 */
export async function generateVisualDescriptionWithAI(
  slug: string,
  title: string,
  keywords: string[],
  category: string,
  excerpt?: string
): Promise<string> {
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

  try {
    const result = await generateTextWithAI({
      prompt,
      systemInstruction,
      model: '@cf/meta/llama-3.1-8b-instruct-fast',
      temperature: 0.7,
    });

    let description = result.text.trim();
    // Limpar markdown e formatação
    description = description.replace(/^["']|["']$/g, '');
    description = description.replace(/```[\w]*\n?|\n?```/g, '');
    description = description.trim();

    return description || `${category} theme, ${keywords.slice(0, 2).join(' and ')}`;
  } catch (error) {
    logger.error('Error generating visual description', { error });
    return `${category} theme, ${keywords.slice(0, 2).join(' and ')}`;
  }
}
