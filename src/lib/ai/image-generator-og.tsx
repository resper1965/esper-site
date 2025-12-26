import React from 'react';
import { ImageResponse } from '@vercel/og';
import { generateVisualDescriptionWithAI } from './ai-gateway-client';
import { uploadPostImage } from '../supabase/storage';

/**
 * Gera imagem de capa para post usando Vercel OG Image
 * Usa Gemini para criar descrição visual baseada em slug e keywords
 * Mantém greyscale com acento cyan, otimizado para SEO
 */
export async function generatePostImageWithOG(
  slug: string,
  title: string,
  keywords: string[],
  category: string,
  excerpt?: string
): Promise<string> {
  try {
    console.log('🎨 Gerando imagem OG com Gemini...');
    
    // 1. Usar Gemini para criar descrição visual baseada em slug e keywords
    let visualDescription: string;
    try {
      visualDescription = await generateVisualDescriptionWithAI(
        slug,
        title,
        keywords,
        category,
        excerpt
      );
      console.log('✅ Descrição visual criada com Gemini');
    } catch (error) {
      console.warn('⚠️ Erro ao criar descrição visual, usando fallback:', error);
      visualDescription = `${title} - ${category}`;
    }

    // 2. Extrair elementos visuais da descrição
    const visualElements = extractVisualElements(visualDescription, keywords, category);

    // 3. Gerar imagem usando Vercel OG
    const ogImage = await generateOGImage(title, visualElements, category);

    // 4. Fazer upload para Supabase Storage
    const imageFilename = `${slug}-${Date.now()}.png`;

    // Converter ImageResponse para buffer
    const arrayBuffer = await ogImage.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para Supabase Storage
    const imageUrl = await uploadPostImage(buffer, imageFilename, 'image/png');

    if (!imageUrl) {
      throw new Error('Falha ao fazer upload da imagem para Supabase Storage');
    }

    console.log('✅ Imagem OG gerada e enviada para Supabase:', imageUrl);

    // Retornar URL pública do Supabase
    return imageUrl;
  } catch (error) {
    console.error('❌ Erro ao gerar imagem OG:', error);
    throw error;
  }
}

/**
 * Extrai elementos visuais da descrição para usar na imagem
 */
function extractVisualElements(
  description: string,
  keywords: string[],
  category: string
): {
  icons: string[];
  colors: string[];
  theme: string;
} {
  const allText = `${description} ${keywords.join(' ')} ${category}`.toLowerCase();

  const icons: string[] = [];
  const colors: string[] = ['#030712', '#00ade8']; // gray-950 e cyan

  // Identificar ícones baseados em keywords e descrição
  if (/security|lock|shield|protection|defense/i.test(allText)) {
    icons.push('🔒', '🛡️');
  }
  if (/network|connection|web|internet|cloud/i.test(allText)) {
    icons.push('🌐', '☁️');
  }
  if (/code|programming|development|tech/i.test(allText)) {
    icons.push('💻', '⚡');
  }
  if (/data|database|storage|analytics/i.test(allText)) {
    icons.push('📊', '💾');
  }
  if (/ai|machine learning|intelligence|automation/i.test(allText)) {
    icons.push('🤖', '🧠');
  }
  if (/travel|viagem|world|global/i.test(allText)) {
    icons.push('✈️', '🌍');
  }
  if (/home|smart|iot|automation/i.test(allText)) {
    icons.push('🏠', '🔌');
  }

  // Se não encontrou ícones, usar genéricos baseados na categoria
  if (icons.length === 0) {
    switch (category) {
      case 'cybersecurity':
        icons.push('🔒', '🛡️');
        break;
      case 'counterespionage':
        icons.push('🕵️', '🔍');
        break;
      case 'homeautomation':
        icons.push('🏠', '⚡');
        break;
      case 'travel':
        icons.push('✈️', '🌍');
        break;
      default:
        icons.push('📝', '💡');
    }
  }

  return {
    icons: icons.slice(0, 2), // Máximo 2 ícones
    colors,
    theme: category,
  };
}

/**
 * Gera imagem usando Vercel OG Image
 */
async function generateOGImage(
  title: string,
  elements: { icons: string[]; colors: string[]; theme: string },
  category: string
): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030712', // gray-950
          backgroundImage: 'linear-gradient(to bottom right, #030712, #0f172a)',
          position: 'relative',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Elementos visuais de fundo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.1,
          }}
        >
          {elements.icons.map((icon, i) => (
            <div
              key={i}
              style={{
                fontSize: 120,
                margin: '0 40px',
                transform: `rotate(${i * 15}deg)`,
              }}
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Linha decorativa cyan */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: '#00ade8', // cyan
          }}
        />

        {/* Conteúdo principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 60px',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          {/* Ícones principais */}
          <div
            style={{
              display: 'flex',
              gap: 30,
              marginBottom: 40,
            }}
          >
            {elements.icons.map((icon, i) => (
              <div
                key={i}
                style={{
                  fontSize: 80,
                  filter: 'grayscale(100%)',
                  opacity: 0.8,
                }}
              >
                {icon}
              </div>
            ))}
          </div>

          {/* Título */}
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#f1f5f9', // slate-100
              lineHeight: 1.2,
              marginBottom: 20,
              maxWidth: 1000,
              textAlign: 'center',
            }}
          >
            {title}
          </h1>

          {/* Acento cyan decorativo */}
          <div
            style={{
              width: 100,
              height: 4,
              backgroundColor: '#00ade8', // cyan
              marginTop: 30,
            }}
          />
        </div>

        {/* Badge de categoria no canto */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 40,
            padding: '12px 24px',
            backgroundColor: 'rgba(0, 173, 232, 0.1)',
            border: '2px solid #00ade8',
            borderRadius: 8,
            color: '#00ade8',
            fontSize: 18,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {category}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

