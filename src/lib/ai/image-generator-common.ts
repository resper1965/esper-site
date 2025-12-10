import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

/**
 * Gera uma imagem ilustrada usando Stable Diffusion via Replicate
 * @param prompt - Descrição da imagem a ser gerada
 * @returns URL da imagem gerada
 */
export async function generateImage(prompt: string): Promise<string> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN não está configurado');
  }

  try {
    console.log('🎨 Gerando imagem com prompt:', prompt);

    // Usando Stable Diffusion XL - melhor qualidade para ilustrações
    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          aspect_ratio: '16:9', // Ideal para blog posts (1200x630)
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
 * Baixa uma imagem de uma URL e salva localmente
 */
export async function downloadAndSaveImage(
  imageUrl: string,
  filePath: string
): Promise<void> {
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

