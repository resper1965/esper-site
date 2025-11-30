import { ImageResponse } from 'next/og';
import { docs, meta } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';

export const runtime = 'nodejs';

export const alt = 'Ricardo Esper - Cybersecurity Blog';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

const blogSource = loader({
  baseUrl: '/blog',
  source: createMDXSource(docs, meta),
});

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let page = null;
  try {
    page = blogSource.getPage([slug]);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  if (!page) {
    return new Response('Not found', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #030712 0%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: 80,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: '#00ade8',
            }}
          />
          <span
            style={{
              fontSize: 28,
              color: '#94a3b8',
              fontWeight: 500,
            }}
          >
            Ricardo Esper
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            maxWidth: 1000,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            {page.data.title}
          </h1>

          {page.data.tags && page.data.tags.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 12,
              }}
            >
              {page.data.tags.slice(0, 3).map((tag: string) => (
                <div
                  key={tag}
                  style={{
                    padding: '8px 20px',
                    background: 'rgba(0, 173, 232, 0.1)',
                    border: '1px solid rgba(0, 173, 232, 0.3)',
                    borderRadius: 8,
                    fontSize: 24,
                    color: '#00ade8',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <span
            style={{
              fontSize: 24,
              color: '#64748b',
            }}
          >
            esper.ws
          </span>
          <span
            style={{
              fontSize: 24,
              color: '#64748b',
            }}
          >
            Cybersecurity & Technology
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
