import { ImageResponse } from 'next/og';

// Sem `export const runtime = 'edge'`: no Cloudflare Workers a aplicação
// inteira já roda no runtime de edge, e a declaração quebra o bundler do
// OpenNext, que exige funções edge em bundles separados.

export const alt = 'Ricardo Esper — CISO & Cybersecurity Expert';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 40%, #1e293b 100%)',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            zIndex: 1,
          }}
        >
          {/* Shield icon placeholder */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              fontSize: '40px',
            }}
          >
            🛡️
          </div>

          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: '#f1f5f9',
              letterSpacing: '-2px',
            }}
          >
            Ricardo Esper
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: '22px',
                fontWeight: 500,
                color: '#94a3b8',
                letterSpacing: '4px',
                textTransform: 'uppercase' as const,
              }}
            >
              CISO
            </div>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#3b82f6',
              }}
            />
            <div
              style={{
                fontSize: '22px',
                fontWeight: 500,
                color: '#94a3b8',
                letterSpacing: '2px',
              }}
            >
              Cybersecurity Expert
            </div>
          </div>

          <div
            style={{
              fontSize: '16px',
              color: '#64748b',
              marginTop: '8px',
            }}
          >
            esper.ws
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
