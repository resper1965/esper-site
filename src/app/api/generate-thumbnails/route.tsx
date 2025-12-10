import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Mapeamento de temas para símbolos discretos (texto simples, sem emojis)
const themeSymbols: Record<string, string> = {
  'Automação Residencial': '◉',
  'Cibersegurança': '◈',
  'Contraespionagem': '◊',
  'IA Generativa': '◐',
  'OT Security': '◑',
  'Ransomware': '◒',
  'SecOps': '◓',
  'TSCM': '◔',
  'Data Leakage': '◕',
  'Viagens': '○',
  'Vibe Coding': '●',
  'Zero Trust': '◌',
};

// Função para determinar o tema baseado no título e tags
function getTheme(title: string, tags: string[]): string {
  const titleLower = title.toLowerCase();
  const tagsLower = tags.map(t => t.toLowerCase()).join(' ');
  
  if (titleLower.includes('automação') || titleLower.includes('smart home') || titleLower.includes('iot')) {
    return 'Automação Residencial';
  }
  if (titleLower.includes('contraespionagem') || titleLower.includes('tscm') || tagsLower.includes('contraespionagem')) {
    return 'Contraespionagem';
  }
  if (titleLower.includes('ia generativa') || titleLower.includes('generativa') || titleLower.includes('deepfake')) {
    return 'IA Generativa';
  }
  if (titleLower.includes('ot security') || titleLower.includes('operational technology') || titleLower.includes('industrial')) {
    return 'OT Security';
  }
  if (titleLower.includes('ransomware') || titleLower.includes('raas')) {
    return 'Ransomware';
  }
  if (titleLower.includes('secops') || titleLower.includes('sec ops')) {
    return 'SecOps';
  }
  if (titleLower.includes('tscm') || titleLower.includes('contramedidas técnicas')) {
    return 'TSCM';
  }
  if (titleLower.includes('data leakage') || titleLower.includes('vazamento') || titleLower.includes('dlp')) {
    return 'Data Leakage';
  }
  if (titleLower.includes('viagem') || titleLower.includes('travel')) {
    return 'Viagens';
  }
  if (titleLower.includes('vibe coding') || titleLower.includes('ia desenvolvimento')) {
    return 'Vibe Coding';
  }
  if (titleLower.includes('zero trust') || titleLower.includes('confiança')) {
    return 'Zero Trust';
  }
  
  return 'Cibersegurança'; // padrão
}

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const tags = searchParams.get('tags')?.split(',') || [];
  const filename = searchParams.get('filename');
  const download = searchParams.get('download') === 'true';

  if (!title || !filename) {
    return new Response('Missing title or filename parameter', { status: 400 });
  }

  try {
    const theme = getTheme(title, tags);
    const symbol = themeSymbols[theme] || '◈';
    
    // Truncar título se muito longo
    const displayTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;

    // Cores em escala de cinza discretas
    const bgColor = '#f8f9fa'; // cinza muito claro
    const textColor = '#2d3748'; // cinza escuro
    const accentColor = '#718096'; // cinza médio
    const borderColor = '#e2e8f0'; // cinza claro para bordas

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: bgColor,
            color: textColor,
            padding: '60px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            border: `2px solid ${borderColor}`,
          }}
        >
          {/* Símbolo do tema - discreto */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              marginBottom: '30px',
              fontSize: '48px',
              color: accentColor,
              opacity: 0.6,
            }}
          >
            {symbol}
          </div>

          {/* Título */}
          <div
            style={{
              fontSize: '42px',
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: '20px',
              color: textColor,
              letterSpacing: '-0.5px',
            }}
          >
            {displayTitle}
          </div>

          {/* Linha divisória sutil */}
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: borderColor,
              marginTop: 'auto',
              marginBottom: '20px',
            }}
          />

          {/* Autor - discreto */}
          <div
            style={{
              fontSize: '18px',
              color: accentColor,
              fontWeight: 400,
              opacity: 0.7,
            }}
          >
            Ricardo Esper
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
      const thumbnailsDir = path.join(process.cwd(), 'public/thumbnails');
      if (!fs.existsSync(thumbnailsDir)) {
        fs.mkdirSync(thumbnailsDir, { recursive: true });
      }
      const filePath = path.join(thumbnailsDir, filename);
      fs.writeFileSync(filePath, Buffer.from(buffer));
      return new Response(JSON.stringify({ success: true, path: filePath }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return imageResponse;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return new Response('Error generating thumbnail', { status: 500 });
  }
}
