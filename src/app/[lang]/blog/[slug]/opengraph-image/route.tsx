import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";

const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});

// Cores por categoria (tons sutis e elegantes)
const categoryColors: Record<string, { bg: string; accent: string; icon: string }> = {
  cybersecurity: {
    bg: '#0f172a', // slate-900
    accent: '#3b82f6', // blue-500
    icon: '🛡️',
  },
  counterespionage: {
    bg: '#1e1b4b', // indigo-950
    accent: '#6366f1', // indigo-500
    icon: '👁️',
  },
  forensics: {
    bg: '#1c1917', // stone-900
    accent: '#78716c', // stone-500
    icon: '🔍',
  },
  compliance: {
    bg: '#1e293b', // slate-800
    accent: '#64748b', // slate-500
    icon: '📋',
  },
  homeautomation: {
    bg: '#0c4a6e', // sky-950
    accent: '#0ea5e9', // sky-500
    icon: '🏠',
  },
  travel: {
    bg: '#1e3a8a', // blue-900
    accent: '#60a5fa', // blue-400
    icon: '✈️',
  },
  vida: {
    bg: '#7c2d12', // orange-900
    accent: '#fb923c', // orange-400
    icon: '💭',
  },
  general: {
    bg: '#111827', // gray-900
    accent: '#6b7280', // gray-500
    icon: '📝',
  },
};

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get post data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let page: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      page = blogSource.getPage([slug]) as any;
    } catch {
      // Return default image if post not found
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
              backgroundColor: '#111827',
              color: '#f9fafb',
            }}
          >
            <div style={{ fontSize: 60, marginBottom: 20 }}>📝</div>
            <div style={{ fontSize: 40, fontWeight: 600 }}>Ricardo Esper</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    if (!page) {
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
              backgroundColor: '#111827',
              color: '#f9fafb',
            }}
          >
            <div style={{ fontSize: 60, marginBottom: 20 }}>📝</div>
            <div style={{ fontSize: 40, fontWeight: 600 }}>Ricardo Esper</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    const title = page.data.title || 'Post';
    const category = page.data.category || 'general';
    const colors = categoryColors[category] || categoryColors.general;

    // Truncate title if too long
    const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

    return new ImageResponse(
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
          {/* Category icon and label */}
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
              {category === 'cybersecurity' ? 'Cibersegurança' :
               category === 'counterespionage' ? 'Contraespionagem' :
               category === 'forensics' ? 'Forense Digital' :
               category === 'compliance' ? 'Compliance' :
               category === 'homeautomation' ? 'Automação Residencial' :
               category === 'travel' ? 'Viagens' :
               category === 'vida' ? 'Vida' :
               'Geral'}
            </div>
          </div>

          {/* Title */}
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

          {/* Author */}
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
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error generating OG image:', error);
    
    // Return fallback image
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
            backgroundColor: '#111827',
            color: '#f9fafb',
          }}
        >
          <div style={{ fontSize: 60, marginBottom: 20 }}>📝</div>
          <div style={{ fontSize: 40, fontWeight: 600 }}>Ricardo Esper</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

