import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ImageResponse } from '@vercel/og';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

// Design em escala de cinza - discreto e elegante
const categoryColors: Record<string, { bg: string; accent: string }> = {
  cybersecurity: { bg: '#1a1a1a', accent: '#888888' },
  counterespionage: { bg: '#0f0f0f', accent: '#999999' },
  forensics: { bg: '#1c1c1c', accent: '#8a8a8a' },
  compliance: { bg: '#171717', accent: '#909090' },
  homeautomation: { bg: '#1e1e1e', accent: '#858585' },
  travel: { bg: '#181818', accent: '#8c8c8c' },
  vida: { bg: '#151515', accent: '#878787' },
  general: { bg: '#191919', accent: '#898989' },
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

async function generateImageForPost(slug: string, title: string, category: string) {
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

  const buffer = await imageResponse.arrayBuffer();
  return Buffer.from(buffer);
}

export const runtime = 'nodejs';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public/images');
    
    // Criar diretório se não existir
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Ler todos os posts
    const fileNames = fs.readdirSync(postsDirectory);
    const mdxFiles = fileNames.filter(name => name.endsWith('.mdx'));

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const fileName of mdxFiles) {
      try {
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);

        const slug = data.slug || fileName.replace(/\.mdx$/, '');
        const title = data.title || 'Post';
        const category = data.category || 'general';

        // Gerar imagem
        const imageBuffer = await generateImageForPost(slug, title, category);
        
        // Salvar imagem
        const imagePath = path.join(imagesDir, `${slug}.png`);
        fs.writeFileSync(imagePath, imageBuffer);

        results.push({
          slug,
          title,
          category,
          status: 'success',
          path: `/images/${slug}.png`,
        });
        successCount++;

      } catch (error) {
        const slug = fileName.replace(/\.mdx$/, '');
        results.push({
          slug,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      total: mdxFiles.length,
      successCount,
      errorCount,
      results,
    });

  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
