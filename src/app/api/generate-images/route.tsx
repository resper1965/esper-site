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

type ThemeStyle = {
  label: string;
  descriptor: string;
  background: string;
  panel: string;
  accent: string;
  border: string;
  gradient: string;
  patternOpacity: number;
};

const fontStack =
  '"Geist", "Inter", "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const textureBackground =
  'linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 45%, transparent 80%)';

const themeStyles: Record<string, ThemeStyle> = {
  cybersecurity: {
    label: 'Cibersegurança',
    descriptor: 'Infraestrutura crítica',
    background: '#050505',
    panel: '#0b0b0b',
    accent: '#f5f5f5',
    border: '#1f1f1f',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 55%)',
    patternOpacity: 0.22,
  },
  counterespionage: {
    label: 'Contraespionagem',
    descriptor: 'Contrainteligência ativa',
    background: '#040404',
    panel: '#0a0a0a',
    accent: '#f3f4f6',
    border: '#252525',
    gradient: 'radial-gradient(circle at 80% 25%, rgba(255,255,255,0.12), transparent 60%)',
    patternOpacity: 0.24,
  },
  forensics: {
    label: 'Forense Digital',
    descriptor: 'Investigação técnica',
    background: '#060606',
    panel: '#0c0c0c',
    accent: '#f7f7f7',
    border: '#262626',
    gradient: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.12), transparent 65%)',
    patternOpacity: 0.18,
  },
  compliance: {
    label: 'Compliance',
    descriptor: 'Governança & risco',
    background: '#050505',
    panel: '#0a0a0a',
    accent: '#e5e5e5',
    border: '#1f1f1f',
    gradient: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.1), transparent 70%)',
    patternOpacity: 0.16,
  },
  homeautomation: {
    label: 'Automação Residencial',
    descriptor: 'Residências conectadas',
    background: '#050505',
    panel: '#0d0d0d',
    accent: '#f5f5f4',
    border: '#2a2a2a',
    gradient: 'radial-gradient(circle at 15% 80%, rgba(255,255,255,0.12), transparent 60%)',
    patternOpacity: 0.2,
  },
  travel: {
    label: 'Viagens',
    descriptor: 'Operações em rota',
    background: '#070707',
    panel: '#0d0d0d',
    accent: '#f3f3f3',
    border: '#2c2c2c',
    gradient: 'radial-gradient(circle at 80% 10%, rgba(255,255,255,0.13), transparent 60%)',
    patternOpacity: 0.18,
  },
  vida: {
    label: 'Vida',
    descriptor: 'Vida digital segura',
    background: '#060606',
    panel: '#0c0c0c',
    accent: '#f5f5f5',
    border: '#232323',
    gradient: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1), transparent 60%)',
    patternOpacity: 0.15,
  },
  general: {
    label: 'Pesquisa',
    descriptor: 'Análises & insights',
    background: '#050505',
    panel: '#0b0b0b',
    accent: '#e4e4e7',
    border: '#1f1f1f',
    gradient: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.1), transparent 65%)',
    patternOpacity: 0.14,
  },
};

const getTheme = (category: string): ThemeStyle => themeStyles[category] || themeStyles.general;

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
    const theme = getTheme(category);
    const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

    const template = (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: theme.background,
          color: '#f5f5f5',
          fontFamily: fontStack,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: theme.gradient,
            opacity: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: textureBackground,
            opacity: theme.patternOpacity,
          }}
        />
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            padding: '48px',
          }}
        >
          <div
            style={{
              flex: 1,
              borderRadius: '32px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.panel,
              padding: '60px',
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.45em',
                fontSize: '18px',
                color: '#e4e4e7',
                gap: '12px',
              }}
            >
              <span style={{ fontWeight: 500 }}>{theme.label}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '13px',
                  letterSpacing: '0.4em',
                  color: '#a3a3a3',
                  fontWeight: 400,
                }}
              >
                {theme.descriptor}
              </span>
            </div>
            <div
              style={{
                height: '2px',
                width: '80px',
                backgroundColor: theme.accent,
                opacity: 0.9,
              }}
            />
            <div
              style={{
                fontSize: '64px',
                fontWeight: 600,
                lineHeight: 1.2,
                color: '#f5f5f5',
              }}
            >
              {displayTitle}
            </div>
            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                color: '#d4d4d8',
                fontSize: '22px',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: theme.accent,
                }}
              >
                Ricardo Esper
              </div>
              <div
                style={{
                  marginLeft: 'auto',
                  fontSize: '16px',
                  letterSpacing: '0.35em',
                  color: '#a1a1aa',
                }}
              >
                esper.ws
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const imageResponse = new ImageResponse(template, {
      width: 1200,
      height: 630,
    });

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

