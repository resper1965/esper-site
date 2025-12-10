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

// Mapeamento de temas para elementos visuais discretos em escala de cinza
const themeElements: Record<string, { pattern: string; accent: string }> = {
  'Cibersegurança': {
    pattern: 'grid',
    accent: '#4a5568',
  },
  'Contraespionagem': {
    pattern: 'dots',
    accent: '#718096',
  },
  'Automação Residencial': {
    pattern: 'lines',
    accent: '#a0aec0',
  },
  'Viagens': {
    pattern: 'waves',
    accent: '#cbd5e0',
  },
  default: {
    pattern: 'grid',
    accent: '#718096',
  },
};

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const download = searchParams.get('download') === 'true';

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }

  try {
    // Tentar encontrar o post no sistema de source primeiro
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let page = blogSource.getPage([slug]) as any;
    let title = 'Post';
    let tags: string[] = [];
    
    if (!page) {
      // Se não encontrado, tentar ler diretamente do arquivo MDX em blog/content
      const blogContentDir = path.join(process.cwd(), 'blog/content');
      const files = fs.readdirSync(blogContentDir).filter((f: string) => f.endsWith('.mdx'));
      
      for (const file of files) {
        const filePath = path.join(blogContentDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Extrair frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) continue;
        
        const frontmatter = frontmatterMatch[1];
        const slugMatch = frontmatter.match(/^slug:\s*["']?([^"'\s]+)["']?/m);
        const fileSlug = path.basename(file, '.mdx');
        
        // Verificar se o slug corresponde (do frontmatter ou do nome do arquivo)
        if ((slugMatch && slugMatch[1] === slug) || fileSlug === slug) {
          // Encontrou o post, extrair título e tags
          const titleMatch = frontmatter.match(/^title:\s*["'](.+?)["']/m);
          const tagsMatch = frontmatter.match(/^tags:\s*\[(.+?)\]/m);
          
          if (titleMatch) {
            title = titleMatch[1];
          }
          
          if (tagsMatch) {
            tags = tagsMatch[1]
              .split(',')
              .map((t: string) => t.trim().replace(/["']/g, ''));
          }
          break;
        }
      }
      
      if (title === 'Post') {
        return new Response('Post not found', { status: 404 });
      }
    } else {
      title = page.data.title || 'Post';
      tags = page.data.tags || [];
    }

    const theme = tags.find((t: string) => themeElements[t]) || tags[0] || 'Cibersegurança';
    const themeData = themeElements[theme] || themeElements.default;
    
    // Truncar título se muito longo
    const displayTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
    
    // Dividir título em linhas
    const words = displayTitle.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= 35) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    const titleLines = lines.slice(0, 3);
    if (lines.length > 3) {
      titleLines[2] = titleLines[2].substring(0, 32) + '...';
    }

    // Gerar padrão de fundo baseado no tema
    let patternStyle: Record<string, string> = {};
    switch (themeData.pattern) {
      case 'grid':
        patternStyle = {
          backgroundImage: 'linear-gradient(#2d3748 1px, transparent 1px), linear-gradient(90deg, #2d3748 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        };
        break;
      case 'dots':
        patternStyle = {
          backgroundImage: 'radial-gradient(circle, #4a5568 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        };
        break;
      case 'lines':
        patternStyle = {
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #4a5568 2px, #4a5568 4px)',
          backgroundSize: '100% 20px',
        };
        break;
      case 'waves':
        patternStyle = {
          backgroundImage: 'radial-gradient(ellipse at top, #4a5568 0%, transparent 50%)',
        };
        break;
    }

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a202c',
            color: '#e2e8f0',
            padding: '60px 80px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Padrão de fundo sutil */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              ...patternStyle,
            }}
          />
          
          {/* Conteúdo principal */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Tema/Categoria discreto */}
            <div
              style={{
                fontSize: '14px',
                color: themeData.accent,
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '40px',
                opacity: 0.7,
              }}
            >
              {theme}
            </div>

            {/* Título */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: 'auto',
              }}
            >
              {titleLines.map((line, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: index === 0 ? '52px' : '48px',
                    fontWeight: index === 0 ? 700 : 600,
                    lineHeight: 1.1,
                    color: '#f7fafc',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Rodapé discreto */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 'auto',
                paddingTop: '40px',
                borderTop: `1px solid ${themeData.accent}30`,
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  color: themeData.accent,
                  fontWeight: 500,
                  opacity: 0.8,
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
      const imagesDir = path.join(process.cwd(), 'public/thumbnails');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      const filePath = path.join(imagesDir, `${slug}.png`);
      fs.writeFileSync(filePath, Buffer.from(buffer));
      return new Response(JSON.stringify({ success: true, path: filePath }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return imageResponse;
  } catch (error) {
    console.error('Error generating grayscale image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
