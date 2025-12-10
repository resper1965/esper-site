#!/usr/bin/env node

/**
 * Script standalone para gerar thumbnails discretas em escala de cinza para todos os posts do blog
 * Não requer servidor Next.js rodando
 */

const fs = require('fs');
const path = require('path');

// Importar ImageResponse do @vercel/og
let ImageResponse;
try {
  ImageResponse = require('@vercel/og').ImageResponse;
} catch (e) {
  console.error('✗ Erro: @vercel/og não encontrado. Execute: npm install');
  process.exit(1);
}

const postsDir = path.join(process.cwd(), 'blog/content');
const thumbnailsDir = path.join(process.cwd(), 'public/thumbnails');

// Garantir que o diretório de thumbnails existe
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Mapeamento de temas para símbolos discretos (texto simples)
const themeSymbols = {
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
function getTheme(title, tags) {
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

function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const titleMatch = frontmatter.match(/^title:\s*["'](.+?)["']/m);
  const tagsMatch = frontmatter.match(/^tags:\s*\[(.*?)\]/m);
  const thumbnailMatch = frontmatter.match(/^thumbnail:\s*["'](.+?)["']/m);

  let tags = [];
  if (tagsMatch) {
    tags = tagsMatch[1]
      .split(',')
      .map(t => t.trim().replace(/["']/g, ''))
      .filter(t => t);
  }

  return {
    title: titleMatch ? titleMatch[1] : null,
    tags: tags,
    thumbnail: thumbnailMatch ? thumbnailMatch[1] : null,
  };
}

function getFilenameFromThumbnail(thumbnail) {
  if (!thumbnail) return null;
  const match = thumbnail.match(/\/([^/]+)$/);
  return match ? match[1] : null;
}

async function generateThumbnail(title, tags, outputPath) {
  const theme = getTheme(title, tags);
  const symbol = themeSymbols[theme] || '◈';
  
  // Truncar título se muito longo
  const displayTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;

  // Cores em escala de cinza discretas
  const bgColor = '#f8f9fa'; // cinza muito claro
  const textColor = '#2d3748'; // cinza escuro
  const accentColor = '#718096'; // cinza médio
  const borderColor = '#e2e8f0'; // cinza claro para bordas

  try {
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

    const buffer = await imageResponse.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    console.log(`✓ Gerada: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Erro ao gerar ${outputPath}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('Gerando thumbnails discretas em escala de cinza para posts do blog...\n');

  // Verificar se o diretório de posts existe
  if (!fs.existsSync(postsDir)) {
    console.error(`✗ Diretório não encontrado: ${postsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
  console.log(`Encontrados ${files.length} posts\n`);

  const posts = [];
  
  // Processar todos os arquivos
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    
    if (!frontmatter || !frontmatter.title) {
      console.log(`⚠ Pulando ${file} - título não encontrado`);
      continue;
    }

    const thumbnailFilename = getFilenameFromThumbnail(frontmatter.thumbnail) || 
                             file.replace('.mdx', '.png');
    
    posts.push({
      file,
      title: frontmatter.title,
      tags: frontmatter.tags,
      thumbnailFilename,
      thumbnailPath: path.join(thumbnailsDir, thumbnailFilename),
    });
  }

  console.log(`Gerando ${posts.length} thumbnails...\n`);

  // Gerar imagens
  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    // Verificar se a imagem já existe
    if (fs.existsSync(post.thumbnailPath)) {
      console.log(`⊘ Já existe: ${post.thumbnailFilename}`);
      skipped++;
      continue;
    }

    try {
      await generateThumbnail(post.title, post.tags, post.thumbnailPath);
      generated++;
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Falha ao gerar thumbnail para ${post.file}`);
      errors++;
    }
  }

  console.log(`\n✓ Concluído!`);
  console.log(`  Geradas: ${generated}`);
  console.log(`  Já existiam: ${skipped}`);
  console.log(`  Erros: ${errors}`);
  console.log(`  Thumbnails em: ${thumbnailsDir}`);
}

main().catch(console.error);
