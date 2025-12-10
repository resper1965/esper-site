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

// Design em escala de cinza - discreto e elegante
const categoryColors: Record<string, { bg: string; accent: string; pattern: string }> = {
  cybersecurity: { bg: '#1a1a1a', accent: '#888888', pattern: 'security' },
  counterespionage: { bg: '#0f0f0f', accent: '#999999', pattern: 'surveillance' },
  forensics: { bg: '#1c1c1c', accent: '#8a8a8a', pattern: 'analysis' },
  compliance: { bg: '#171717', accent: '#909090', pattern: 'compliance' },
  homeautomation: { bg: '#1e1e1e', accent: '#858585', pattern: 'automation' },
  travel: { bg: '#181818', accent: '#8c8c8c', pattern: 'travel' },
  vida: { bg: '#151515', accent: '#878787', pattern: 'life' },
  general: { bg: '#191919', accent: '#898989', pattern: 'general' },
};

const categoryLabels: Record<string, string> = {
  cybersecurity: 'Cibersegurança',
  counterespionage: 'Contraespionagem',
  forensics: 'Forense Digital',
  compliance: 'Compliance',
  homeautomation: 'Automação Residencial',
  travel: 'Viagens',
  vida: 'Vida',
  general: 'Geral',
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = blogSource.getPage([slug]) as any;
    
    if (!page) {
      return new Response('Post not found', { status: 404 });
    }

    const title = page.data.title || 'Post';
    const category = page.data.category || 'general';
    const colors = categoryColors[category] || categoryColors.general;
    const label = categoryLabels[category] || 'Geral';
    const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

    // Design discreto em escala de cinza
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: colors.bg,
            color: '#e5e5e5',
            padding: '80px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
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
              opacity: 0.03,
              background: 'repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 10px)',
            }}
          />
          
          {/* Categoria - sutil e discreta */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '50px',
              opacity: 0.7,
            }}
          >
            <div
              style={{
                fontSize: '18px',
                color: colors.accent,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '4px',
              }}
            >
              {label}
            </div>
          </div>

          {/* Título principal */}
          <div
            style={{
              fontSize: '58px',
              fontWeight: 600,
              lineHeight: 1.25,
              marginBottom: '50px',
              color: '#f5f5f5',
              letterSpacing: '-0.02em',
            }}
          >
            {displayTitle}
          </div>

          {/* Linha decorativa minimalista */}
          <div
            style={{
              width: '120px',
              height: '3px',
              background: `linear-gradient(90deg, ${colors.accent} 0%, transparent 100%)`,
              marginBottom: '40px',
            }}
          />

          {/* Rodapé discreto */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: '50px',
            }}
          >
            <div
              style={{
                fontSize: '22px',
                color: '#a0a0a0',
                fontWeight: 400,
                letterSpacing: '0.5px',
              }}
            >
              Ricardo Esper
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#707070',
                marginLeft: 'auto',
                fontWeight: 300,
              }}
            >
              esper.ws
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
      return new Response(JSON.stringify({ success: true, path: filePath }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return imageResponse;
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}

