/**
 * AI Gateway Client - Unified API for multiple AI models
 * 
 * Uses Vercel AI Gateway to access 100+ models through a single endpoint.
 * Supports automatic fallbacks, rate limiting, and cost monitoring.
 * 
 * Documentation: https://vercel.com/docs/ai-gateway
 * 
 * O AI SDK detecta automaticamente o AI Gateway quando:
 * - A variável de ambiente VERCEL_AI_GATEWAY_API_KEY está configurada, OU
 * - O baseURL 'https://ai-gateway.vercel.sh/v1' é especificado
 * 
 * O seletor de modelos permite usar diretamente: 'provider/model' (ex: 'openai/gpt-4.1')
 */

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { logger } from '@/lib/logger';

// Supported models via AI Gateway
export type AIModel = 
  | 'google/gemini-2.5-pro'
  | 'google/gemini-2.5-flash'
  | 'anthropic/claude-sonnet-4'
  | 'anthropic/claude-3.5-sonnet'
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-mini'
  | 'xai/grok-2';

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
 * Get AI Gateway API key from settings or environment
 * 
 * Ordem de prioridade:
 * 1. Supabase settings (configurado via /admin/settings)
 * 2. Variável de ambiente AI_GATEWAY_API_KEY
 * 
 * Formato da chave: vck_... (Vercel AI Gateway API Key)
 */
async function getApiKey(): Promise<string> {
  // Primeiro tenta buscar do Supabase (configurado via admin)
  const { getSetting } = await import('@/lib/settings');
  const apiKey = await getSetting('AI_GATEWAY_API_KEY');
  
  if (apiKey) {
    return apiKey;
  }

  // Fallback para process.env
  const envKey = process.env.AI_GATEWAY_API_KEY;
  if (!envKey) {
    throw new Error(
      'AI_GATEWAY_API_KEY não configurada. ' +
      'Configure via painel admin (/admin/settings) ou variáveis de ambiente.'
    );
  }
  
  return envKey;
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
    model = 'google/gemini-2.5-pro',
    temperature = 0.7,
    maxTokens,
    fallbackModels = ['anthropic/claude-sonnet-4', 'openai/gpt-4o-mini'],
  } = options;

  // Verificar se API key está configurada (será usada automaticamente pelo AI SDK)
  await getApiKey();
  const modelsToTry = [model, ...fallbackModels];

  let lastError: Error | null = null;

  // Get API key from settings (Supabase) or environment
  const apiKey = await getApiKey();
  
  // AI Gateway: criar cliente OpenAI com baseURL do AI Gateway
  // O AI Gateway aceita modelos no formato provider/model via OpenAI-compatible endpoint
  // Base URL oficial: https://ai-gateway.vercel.sh/v1
  // Documentação: https://vercel.com/docs/ai-gateway
  // 
  // O seletor de modelos permite usar diretamente: 'provider/model' (ex: 'openai/gpt-4.1')
  // A chave API é passada via createOpenAI, e o baseURL indica que é AI Gateway
  const openai = createOpenAI({
    apiKey: apiKey,
    baseURL: 'https://ai-gateway.vercel.sh/v1',
  });

  // Tentar cada modelo em sequência (fallback manual)
  // O AI Gateway gerencia automaticamente a rota para o provider correto
  for (const currentModel of modelsToTry) {
    try {
      logger.info('Generating text with AI Gateway', {
        model: currentModel,
        promptLength: prompt.length,
      });

      // Seletor de modelo: usar diretamente 'provider/model' via openai()
      // O AI Gateway aceita modelos no formato provider/model
      // Exemplos:
      //   - openai('google/gemini-2.5-pro')
      //   - openai('openai/gpt-4.1')
      //   - openai('anthropic/claude-sonnet-4')
      // 
      // A chave API é passada via createOpenAI, e o baseURL indica que é AI Gateway
      // O AI Gateway roteia automaticamente para o provider correto
      const result = await generateText({
        model: openai(currentModel), // Seletor: 'provider/model'
        system: systemInstruction || 'You are a helpful assistant.',
        prompt: prompt,
        temperature,
        ...(maxTokens && { maxTokens }),
      });

      // Extract token usage - AI SDK uses inputTokens and outputTokens as numbers
      const tokensUsed = result.usage
        ? {
            input: typeof result.usage.inputTokens === 'number' ? result.usage.inputTokens : 0,
            output: typeof result.usage.outputTokens === 'number' ? result.usage.outputTokens : 0,
          }
        : undefined;

      logger.info('Text generated successfully', {
        model: currentModel,
        tokensUsed,
      });

      return {
        text: result.text,
        tokensUsed,
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
  // Map old model names to new AI Gateway model names
  const aiGatewayModel: AIModel =
    model === 'gemini-1.5-flash'
      ? 'google/gemini-2.5-flash'
      : 'google/gemini-2.5-pro';

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
      model: 'google/gemini-2.5-flash', // Flash é suficiente para melhorar prompts
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
      model: 'google/gemini-2.5-flash',
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

