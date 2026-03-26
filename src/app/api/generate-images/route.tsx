import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getPostBySlug } from "@/lib/posts";
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/requireAuth';

const categoryColors: Record<string, { bg: string; accent: string; icon: string }> = {
  cybersecurity: { bg: '#0f172a', accent: '#3b82f6', icon: '🛡️' },
  counterespionage: { bg: '#1e1b4b', accent: '#6366f1', icon: '👁️' },
  forensics: { bg: '#1c1917', accent: '#78716c', icon: '🔍' },
  compliance: { bg: '#1e293b', accent: '#64748b', icon: '📋' },
  homeautomation: { bg: '#0c4a6e', accent: '#0ea5e9', icon: '🏠' },
  travel: { bg: '#1e3a8a', accent: '#60a5fa', icon: '✈️' },
  vida: { bg: '#7c2d12', accent: '#fb923c', icon: '💭' },
  general: { bg: '#111827', accent: '#6b7280', icon: '📝' },
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
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const download = searchParams.get('download') === 'true';

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }

  try {
    const post = await getPostBySlug(slug);
    
    if (!post || !post.frontMatter) {
      return new Response('Post not found', { status: 404 });
    }

    const title = post.frontMatter.title || 'Post';
    const category = post.frontMatter.category || 'general';
    const colors = categoryColors[category] || categoryColors.general;
    const label = categoryLabels[category] || 'Geral';
    const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: colors.bg,
            color: '#f9fafb',
            padding: '80px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            <div style={{ fontSize: '48px' }}>{colors.icon}</div>
            <div
              style={{
                fontSize: '24px',
                color: colors.accent,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {label}
            </div>
          </div>

          <div
            style={{
              fontSize: '64px',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '40px',
              color: '#ffffff',
            }}
          >
            {displayTitle}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: '40px',
              borderTop: `2px solid ${colors.accent}40`,
            }}
          >
            <div
              style={{
                fontSize: '28px',
                color: colors.accent,
                fontWeight: 600,
              }}
            >
              Ricardo Esper
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#9ca3af',
                marginLeft: 'auto',
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
