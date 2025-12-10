import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import fs from 'fs';
import path from 'path';

const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});

// Design em escala de cinza por categoria - discreto e minimalista
const categoryStyles: Record<string, { 
  bg: string; 
  bgSecondary: string;
  accent: string; 
  pattern: string;
  icon: string;
}> = {
  cybersecurity: { 
    bg: '#1a1a1a', 
    bgSecondary: '#2a2a2a',
    accent: '#808080', 
    pattern: 'shield',
    icon: '◈'
  },
  counterespionage: { 
    bg: '#161616', 
    bgSecondary: '#262626',
    accent: '#707070', 
    pattern: 'eye',
    icon: '◉'
  },
  forensics: { 
    bg: '#1c1c1c', 
    bgSecondary: '#2c2c2c',
    accent: '#858585', 
    pattern: 'search',
    icon: '◎'
  },
  compliance: { 
    bg: '#181818', 
    bgSecondary: '#282828',
    accent: '#757575', 
    pattern: 'document',
    icon: '▣'
  },
  homeautomation: { 
    bg: '#1e1e1e', 
    bgSecondary: '#2e2e2e',
    accent: '#8a8a8a', 
    pattern: 'home',
    icon: '⌂'
  },
  travel: { 
    bg: '#1b1b1b', 
    bgSecondary: '#2b2b2b',
    accent: '#7a7a7a', 
    pattern: 'plane',
    icon: '△'
  },
  vida: { 
    bg: '#191919', 
    bgSecondary: '#292929',
    accent: '#6a6a6a', 
    pattern: 'heart',
    icon: '○'
  },
  general: { 
    bg: '#1d1d1d', 
    bgSecondary: '#2d2d2d',
    accent: '#656565', 
    pattern: 'dots',
    icon: '□'
  },
};

const categoryLabels: Record<string, string> = {
  cybersecurity: 'CIBERSEGURANÇA',
  counterespionage: 'CONTRAESPIONAGEM',
  forensics: 'FORENSE DIGITAL',
  compliance: 'COMPLIANCE',
  homeautomation: 'AUTOMAÇÃO',
  travel: 'VIAGENS',
  vida: 'VIDA',
  general: 'GERAL',
};

// Gera padrão geométrico sutil baseado na categoria
function generatePatternElements(pattern: string, accent: string): React.ReactElement[] {
  const elements: React.ReactElement[] = [];
  const opacity = '15';
  
  switch (pattern) {
    case 'shield':
      // Hexágonos para segurança
      for (let i = 0; i < 8; i++) {
        elements.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              right: `${60 + (i % 4) * 80}px`,
              top: `${100 + Math.floor(i / 4) * 120}px`,
              width: '60px',
              height: '70px',
              border: `1px solid ${accent}${opacity}`,
              transform: 'rotate(30deg)',
              borderRadius: '8px',
            }}
          />
        );
      }
      break;
    case 'eye':
      // Círculos concêntricos para contraespionagem
      for (let i = 0; i < 4; i++) {
        elements.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              right: '80px',
              top: '150px',
              width: `${100 + i * 60}px`,
              height: `${100 + i * 60}px`,
              border: `1px solid ${accent}${opacity}`,
              borderRadius: '50%',
            }}
          />
        );
      }
      break;
    case 'search':
      // Grid de pontos para forense
      for (let i = 0; i < 12; i++) {
        elements.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              right: `${80 + (i % 4) * 50}px`,
              top: `${150 + Math.floor(i / 4) * 50}px`,
              width: '4px',
              height: '4px',
              backgroundColor: `${accent}${opacity}`,
              borderRadius: '50%',
            }}
          />
        );
      }
      break;
    case 'document':
      // Linhas horizontais para compliance
      for (let i = 0; i < 6; i++) {
        elements.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              right: '80px',
              top: `${150 + i * 40}px`,
              width: `${200 - i * 20}px`,
              height: '1px',
              backgroundColor: `${accent}${opacity}`,
            }}
          />
        );
      }
      break;
    case 'home':
      // Quadrados para automação
      for (let i = 0; i < 6; i++) {
        elements.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              right: `${80 + (i % 3) * 70}px`,
              top: `${150 + Math.floor(i / 3) * 70}px`,
              width: '50px',
              height: '50px',
              border: `1px solid ${accent}${opacity}`,
              borderRadius: '4px',
            }}
          />
        );
      }
      break;
    case 'plane':
      // Triângulos para viagens
      for (let i = 0; i < 5; i++) {
        elements.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              right: `${100 + i * 60}px`,
              top: `${180 + (i % 2) * 40}px`,
              width: '0',
              height: '0',
              borderLeft: '20px solid transparent',
              borderRight: '20px solid transparent',
              borderBottom: `35px solid ${accent}${opacity}`,
            }}
          />
        );
      }
      break;
    case 'heart':
      // Círculos suaves para vida
      for (let i = 0; i < 5; i++) {
        elements.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              right: `${100 + i * 50}px`,
              top: `${170 + Math.sin(i) * 30}px`,
              width: `${30 + i * 5}px`,
              height: `${30 + i * 5}px`,
              border: `1px solid ${accent}${opacity}`,
              borderRadius: '50%',
            }}
          />
        );
      }
      break;
    default:
      // Pontos padrão
      for (let i = 0; i < 9; i++) {
        elements.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              right: `${100 + (i % 3) * 40}px`,
              top: `${180 + Math.floor(i / 3) * 40}px`,
              width: '3px',
              height: '3px',
              backgroundColor: `${accent}${opacity}`,
              borderRadius: '50%',
            }}
          />
        );
      }
  }
  
  return elements;
}

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const download = searchParams.get('download') === 'true';
  const listAll = searchParams.get('list') === 'true';

  // Lista todos os posts disponíveis
  if (listAll) {
    const pages = blogSource.getPages();
    const posts = pages.map((p) => ({
      slug: p.slugs.join('/'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      title: (p.data as any).title,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category: (p.data as any).category || 'general',
    }));
    return new Response(JSON.stringify(posts, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = blogSource.getPage([slug]) as any;
    
    if (!page) {
      return new Response(`Post not found: ${slug}`, { status: 404 });
    }

    const title = page.data.title || 'Post';
    const category = page.data.category || 'general';
    const styles = categoryStyles[category] || categoryStyles.general;
    const label = categoryLabels[category] || 'GERAL';
    
    // Quebra título em linhas se muito longo
    const maxCharsPerLine = 28;
    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    // Limita a 3 linhas
    const displayLines = lines.slice(0, 3);
    if (lines.length > 3) {
      displayLines[2] = displayLines[2].substring(0, 25) + '...';
    }

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: styles.bg,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Gradiente sutil no fundo */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${styles.bg} 0%, ${styles.bgSecondary} 100%)`,
            }}
          />
          
          {/* Padrão geométrico sutil */}
          {generatePatternElements(styles.pattern, styles.accent)}
          
          {/* Conteúdo principal */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '70px 80px',
              position: 'relative',
              zIndex: 1,
              height: '100%',
            }}
          >
            {/* Categoria com ícone */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  color: styles.accent,
                  fontFamily: 'system-ui',
                }}
              >
                {styles.icon}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: styles.accent,
                  fontWeight: 500,
                  letterSpacing: '3px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {label}
              </div>
            </div>

            {/* Título */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flex: 1,
              }}
            >
              {displayLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '52px',
                    fontWeight: 600,
                    lineHeight: 1.15,
                    color: '#e5e5e5',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Linha divisória sutil */}
            <div
              style={{
                width: '120px',
                height: '2px',
                backgroundColor: styles.accent,
                opacity: 0.4,
                marginTop: 'auto',
                marginBottom: '25px',
              }}
            />

            {/* Autor e site */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  color: '#a0a0a0',
                  fontWeight: 500,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                Ricardo Esper
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#606060',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                esper.ws
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    if (download) {
      const buffer = await imageResponse.arrayBuffer();
      const imagesDir = path.join(process.cwd(), 'public/images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      const filePath = path.join(imagesDir, `${slug}.png`);
      fs.writeFileSync(filePath, Buffer.from(buffer));
      return new Response(JSON.stringify({ success: true, path: `/images/${slug}.png` }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return imageResponse;
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(`Error generating image: ${error}`, { status: 500 });
  }
}

// Endpoint para gerar todas as imagens de uma vez
export async function POST(request: NextRequest) {
  try {
    const pages = blogSource.getPages();
    const results: { slug: string; success: boolean; path?: string; error?: string }[] = [];
    
    const imagesDir = path.join(process.cwd(), 'public/images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    for (const page of pages) {
      const slug = page.slugs.join('/');
      try {
        // Gera a imagem fazendo request para si mesmo
        const baseUrl = request.nextUrl.origin;
        const imageUrl = `${baseUrl}/api/generate-images-greyscale?slug=${slug}&download=true`;
        const response = await fetch(imageUrl);
        
        if (response.ok) {
          const data = await response.json();
          results.push({ slug, success: true, path: data.path });
        } else {
          results.push({ slug, success: false, error: await response.text() });
        }
      } catch (error) {
        results.push({ slug, success: false, error: String(error) });
      }
    }

    return new Response(JSON.stringify({ 
      total: pages.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results 
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 });
  }
}
