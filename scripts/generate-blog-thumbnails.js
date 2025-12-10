#!/usr/bin/env node

/**
 * Script para gerar thumbnails discretas em escala de cinza para todos os posts do blog
 * Usa sharp para gerar PNGs diretamente
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const postsDir = path.join(process.cwd(), 'blog/content');
const thumbnailsDir = path.join(process.cwd(), 'public/thumbnails');

// Garantir que o diretório de thumbnails existe
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Mapeamento de temas para símbolos discretos
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
  
  return 'Cibersegurança';
}

function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const titleMatch = frontmatter.match(/^title:\s*["'](.+?)["']/m);
  const tagsMatch = frontmatter.match(/^tags:\s*\[(.*?)\]/m);
  const slugMatch = frontmatter.match(/^slug:\s*["']?([^"'\s]+)["']?/m);
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
    slug: slugMatch ? slugMatch[1] : null,
    thumbnail: thumbnailMatch ? thumbnailMatch[1] : null,
  };
}

function getFilenameFromThumbnail(thumbnail) {
  if (!thumbnail) return null;
  const match = thumbnail.match(/\/([^/]+)$/);
  return match ? match[1] : null;
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

async function generateThumbnail(title, tags, outputPath) {
  const theme = getTheme(title, tags);
  const symbol = themeSymbols[theme] || '◈';
  
  // Truncar título se muito longo
  const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  const titleLines = wrapText(displayTitle, 50);

  // Cores em escala de cinza discretas
  const bgColor = { r: 248, g: 249, b: 250 }; // #f8f9fa
  const textColor = { r: 45, g: 55, b: 72 }; // #2d3748
  const accentColor = { r: 113, g: 128, b: 150 }; // #718096
  const borderColor = { r: 226, g: 232, b: 240 }; // #e2e8f0

  const width = 1200;
  const height = 630;
  const padding = 60;

  // Criar imagem base
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b}); }
      .border { stroke: rgb(${borderColor.r}, ${borderColor.g}, ${borderColor.b}); stroke-width: 2; fill: none; }
      .symbol { font-family: system-ui, -apple-system, sans-serif; font-size: 48px; fill: rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b}); opacity: 0.6; text-anchor: middle; }
      .title { font-family: system-ui, -apple-system, sans-serif; font-size: 42px; font-weight: 600; fill: rgb(${textColor.r}, ${textColor.g}, ${textColor.b}); letter-spacing: -0.5px; }
      .divider { stroke: rgb(${borderColor.r}, ${borderColor.g}, ${borderColor.b}); stroke-width: 1; }
      .author { font-family: system-ui, -apple-system, sans-serif; font-size: 18px; fill: rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b}); opacity: 0.7; }
    </style>
  </defs>
  
  <rect width="${width}" height="${height}" class="bg"/>
  <rect x="0" y="0" width="${width}" height="${height}" class="border"/>
  
  <text x="${width / 2}" y="${padding + 40}" class="symbol">${symbol}</text>
  
  ${titleLines.map((line, index) => {
    const escapedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `<text x="${padding}" y="${padding + 120 + (index * 50)}" class="title">${escapedLine}</text>`;
  }).join('\n  ')}
  
  <line x1="${padding}" y1="${height - padding - 50}" x2="${width - padding}" y2="${height - padding - 50}" class="divider"/>
  
  <text x="${padding}" y="${height - padding - 15}" class="author">Ricardo Esper</text>
</svg>`;

  try {
    await sharp(Buffer.from(svg))
      .resize(width, height)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Gerada: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Erro ao gerar ${outputPath}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('Gerando thumbnails discretas em escala de cinza para posts do blog...\n');

  if (!fs.existsSync(postsDir)) {
    console.error(`✗ Diretório não encontrado: ${postsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
  console.log(`Encontrados ${files.length} posts\n`);

  const posts = [];
  
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    
    if (!frontmatter || !frontmatter.title) {
      console.log(`⚠ Pulando ${file} - título não encontrado`);
      continue;
    }

    // Usar slug se disponível, senão usar nome do arquivo
    const thumbnailFilename = frontmatter.slug 
                             ? `${frontmatter.slug}.png`
                             : file.replace('.mdx', '.png');
    
    posts.push({
      file,
      title: frontmatter.title,
      tags: frontmatter.tags,
      thumbnailFilename,
      thumbnailPath: path.join(thumbnailsDir, thumbnailFilename),
    });
  }

  console.log(`Gerando ${posts.length} thumbnails...\n`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    // Gerar nova imagem mesmo se já existir (para substituir imagens antigas)
    const exists = fs.existsSync(post.thumbnailPath);
    if (exists) {
      console.log(`↻ Substituindo: ${post.thumbnailFilename}`);
    }

    try {
      await generateThumbnail(post.title, post.tags, post.thumbnailPath);
      generated++;
    } catch (error) {
      console.error(`✗ Erro ao gerar thumbnail para ${post.file}:`, error.message);
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
