#!/usr/bin/env node

/**
 * Script para gerar imagens de capa para posts do blog
 * Usa o sistema de Open Graph do Next.js para gerar imagens dinamicamente
 */

const fs = require('fs');
const path = require('path');
const React = require('react');
const { ImageResponse } = require('@vercel/og');

const { createElement: h } = React;

const postsDir = path.join(process.cwd(), 'src/content/posts');
const imagesDir = path.join(process.cwd(), 'public/images');

const fontStack =
  '"Geist", "Inter", "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const textureBackground =
  'linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 45%, transparent 80%)';

const themeStyles = {
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

const getTheme = category => themeStyles[category] || themeStyles.general;

function buildTemplate(theme, displayTitle) {
  const overlay = h('div', {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: theme.gradient,
      opacity: 1,
    },
  });

  const pattern = h('div', {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: textureBackground,
      opacity: theme.patternOpacity,
    },
  });

  const headerRow = h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.45em',
        fontSize: '18px',
        color: '#e4e4e7',
        gap: '12px',
      },
    },
    h(
      'span',
      {
        style: {
          fontWeight: 500,
        },
      },
      theme.label
    ),
    h(
      'span',
      {
        style: {
          marginLeft: 'auto',
          fontSize: '13px',
          letterSpacing: '0.4em',
          color: '#a3a3a3',
          fontWeight: 400,
        },
      },
      theme.descriptor
    )
  );

  const accentRule = h('div', {
    style: {
      height: '2px',
      width: '80px',
      backgroundColor: theme.accent,
      opacity: 0.9,
    },
  });

  const titleBlock = h(
    'div',
    {
      style: {
        fontSize: '64px',
        fontWeight: 600,
        lineHeight: 1.2,
        color: '#f5f5f5',
      },
    },
    displayTitle
  );

  const footerRow = h(
    'div',
    {
      style: {
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        color: '#d4d4d8',
        fontSize: '22px',
      },
    },
    h(
      'div',
      {
        style: {
          fontWeight: 600,
          color: theme.accent,
        },
      },
      'Ricardo Esper'
    ),
    h(
      'div',
      {
        style: {
          marginLeft: 'auto',
          fontSize: '16px',
          letterSpacing: '0.35em',
          color: '#a1a1aa',
        },
      },
      'esper.ws'
    )
  );

  const panel = h(
    'div',
    {
      style: {
        flex: 1,
        borderRadius: '32px',
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.panel,
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.45)',
      },
    },
    headerRow,
    accentRule,
    titleBlock,
    footerRow
  );

  return h(
    'div',
    {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        position: 'relative',
        backgroundColor: theme.background,
        color: '#f5f5f5',
        fontFamily: fontStack,
      },
    },
    overlay,
    pattern,
    h(
      'div',
      {
        style: {
          position: 'relative',
          flex: 1,
          display: 'flex',
          padding: '48px',
        },
      },
      panel
    )
  );
}

async function generateImage(title, category, outputPath) {
  const theme = getTheme(category);

  // Truncate title if too long
  const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

  try {
    const template = buildTemplate(theme, displayTitle);
    const imageResponse = new ImageResponse(template, {
      width: 1200,
      height: 630,
    });

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
    const slugMatch = frontmatter.match(/^slug:\s*["']?([^"'\s]+)["']?/m);

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

