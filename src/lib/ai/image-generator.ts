import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

/**
 * Gera uma imagem ilustrada usando Hugging Face (GRATUITO) ou Replicate
 * @param prompt - Descrição da imagem a ser gerada
 * @returns URL da imagem gerada
 */
export async function generateImage(prompt: string): Promise<string> {
  // Tentar usar Hugging Face primeiro (gratuito)
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
  
  if (HF_API_KEY || !process.env.REPLICATE_API_TOKEN) {
    return generateImageWithHuggingFace(prompt);
  }

  // Fallback para Replicate se tiver token
  return generateImageWithReplicate(prompt);
}

async function generateImageWithHuggingFace(prompt: string): Promise<string> {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
  const apiUrl = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (HF_API_KEY) {
    headers['Authorization'] = `Bearer ${HF_API_KEY}`;
  }

  // Adicionar instruções de greyscale ao prompt
  const greyscalePrompt = `${prompt}, greyscale, black and white, monochrome, high quality, clean design, modern style, suitable for blog cover image`;

  console.log('🎨 Gerando imagem via Hugging Face (GRATUITO)...');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        inputs: greyscalePrompt,
        parameters: {
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 1024,
          height: 576, // 16:9 aspect ratio
        }
      })
    });

    if (!response.ok) {
      // Se o modelo estiver carregando, aguardar
      if (response.status === 503) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '20');
        console.log(`⏳ Modelo carregando, aguardando ${retryAfter}s...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return generateImageWithHuggingFace(prompt); // Retry
      }
      
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);
    
    // Converter buffer para data URL para compatibilidade
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('❌ Erro ao gerar imagem com Hugging Face:', error);
    throw error;
  }
}

async function generateImageWithReplicate(prompt: string): Promise<string> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN não está configurado');
  }

  try {
    console.log('🎨 Gerando imagem com Replicate...');

    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt: `${prompt}, greyscale, black and white, monochrome`,
          num_outputs: 1,
          aspect_ratio: '16:9',
          output_format: 'png',
          output_quality: 90,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }
    ) as string[];

    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    if (!imageUrl) {
      throw new Error('Nenhuma imagem foi gerada');
    }

    console.log('✅ Imagem gerada:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error);
    throw error;
  }
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

