#!/usr/bin/env node

/**
 * Script para gerar imagens de capa para posts do blog
 * Usa o sistema de Open Graph do Next.js para gerar imagens dinamicamente
 */

const fs = require('fs');
const path = require('path');
const { ImageResponse } = require('@vercel/og');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const imagesDir = path.join(process.cwd(), 'public/images');

// Cores por categoria
const categoryColors = {
  cybersecurity: {
    bg: '#0f172a',
    accent: '#3b82f6',
    icon: '🛡️',
  },
  counterespionage: {
    bg: '#1e1b4b',
    accent: '#6366f1',
    icon: '👁️',
  },
  forensics: {
    bg: '#1c1917',
    accent: '#78716c',
    icon: '🔍',
  },
  compliance: {
    bg: '#1e293b',
    accent: '#64748b',
    icon: '📋',
  },
  homeautomation: {
    bg: '#0c4a6e',
    accent: '#0ea5e9',
    icon: '🏠',
  },
  travel: {
    bg: '#1e3a8a',
    accent: '#60a5fa',
    icon: '✈️',
  },
  vida: {
    bg: '#7c2d12',
    accent: '#fb923c',
    icon: '💭',
  },
  general: {
    bg: '#111827',
    accent: '#6b7280',
    icon: '📝',
  },
};

const categoryLabels = {
  cybersecurity: 'Cibersegurança',
  counterespionage: 'Contraespionagem',
  forensics: 'Forense Digital',
  compliance: 'Compliance',
  homeautomation: 'Automação Residencial',
  travel: 'Viagens',
  vida: 'Vida',
  general: 'Geral',
};

async function generateImage(title, category, outputPath) {
  const colors = categoryColors[category] || categoryColors.general;
  const label = categoryLabels[category] || 'Geral';
  
  // Truncate title if too long
  const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

  try {
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

    const buffer = await imageResponse.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    console.log(`✓ Gerada: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Erro ao gerar ${outputPath}:`, error.message);
  }
}

async function main() {
  // Criar diretório de imagens se não existir
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Ler todos os arquivos MDX
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));

  console.log(`Encontrados ${files.length} posts\n`);

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extrair frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) continue;

    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/^title:\s*["'](.+?)["']/m);
    const categoryMatch = frontmatter.match(/^category:\s*(\S+)/m);
    const slugMatch = frontmatter.match(/^slug:\s*["']?(\S+?)["']?/m);

    if (!titleMatch || !categoryMatch || !slugMatch) {
      console.log(`⚠ Pulando ${file} - frontmatter incompleto`);
      continue;
    }

    const title = titleMatch[1];
    const category = categoryMatch[1];
    const slug = slugMatch[1];
    const outputPath = path.join(imagesDir, `${slug}.png`);

    await generateImage(title, category, outputPath);
  }

  console.log(`\n✓ Concluído! Imagens geradas em ${imagesDir}`);
}

main().catch(console.error);

