#!/usr/bin/env node

/**
 * Script para gerar thumbnails discretas em escala de cinza como SVG
 * Depois pode ser convertido para PNG usando ferramentas como inkscape ou imagemagick
 */

const fs = require('fs');
const path = require('path');

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

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function wrapText(text, maxWidth, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    // Aproximação: cada caractere tem ~0.6 * fontSize de largura
    const estimatedWidth = testLine.length * fontSize * 0.6;
    
    if (estimatedWidth > maxWidth && currentLine) {
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

function generateSVG(title, tags, outputPath) {
  const theme = getTheme(title, tags);
  const symbol = themeSymbols[theme] || '◈';
  
  // Truncar título se muito longo
  const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  const escapedTitle = escapeXml(displayTitle);

  // Cores em escala de cinza discretas
  const bgColor = '#f8f9fa';
  const textColor = '#2d3748';
  const accentColor = '#718096';
  const borderColor = '#e2e8f0';

  const width = 1200;
  const height = 630;
  const padding = 60;
  const symbolSize = 48;
  const titleFontSize = 42;
  const authorFontSize = 18;

  // Quebrar título em linhas
  const titleLines = wrapText(displayTitle, width - padding * 2 - 200, titleFontSize);
  const titleHeight = titleLines.length * titleFontSize * 1.3;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  
  <!-- Border -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${borderColor}" stroke-width="2"/>
  
  <!-- Symbol -->
  <text x="${width / 2}" y="${padding + 40}" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${symbolSize}" 
        fill="${accentColor}" 
        opacity="0.6" 
        text-anchor="middle">${symbol}</text>
  
  <!-- Title lines -->
  ${titleLines.map((line, index) => `
  <text x="${padding}" y="${padding + 120 + (index * titleFontSize * 1.3)}" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${titleFontSize}" 
        font-weight="600" 
        fill="${textColor}" 
        letter-spacing="-0.5px">${escapeXml(line)}</text>
  `).join('')}
  
  <!-- Divider line -->
  <line x1="${padding}" y1="${height - padding - 50}" 
        x2="${width - padding}" y2="${height - padding - 50}" 
        stroke="${borderColor}" stroke-width="1"/>
  
  <!-- Author -->
  <text x="${padding}" y="${height - padding - 15}" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${authorFontSize}" 
        fill="${accentColor}" 
        opacity="0.7">Ricardo Esper</text>
</svg>`;

  fs.writeFileSync(outputPath.replace('.png', '.svg'), svg);
  console.log(`✓ SVG gerado: ${outputPath.replace('.png', '.svg')}`);
  
  // Tentar converter SVG para PNG usando imagemagick ou inkscape se disponível
  const svgPath = outputPath.replace('.png', '.svg');
  convertSVGtoPNG(svgPath, outputPath);
}

function convertSVGtoPNG(svgPath, pngPath) {
  // Tentar usar imagemagick primeiro
  const { execSync } = require('child_process');
  
  try {
    execSync(`which convert`, { stdio: 'ignore' });
    execSync(`convert -background none -density 300 "${svgPath}" -resize 1200x630 "${pngPath}"`, { stdio: 'ignore' });
    console.log(`✓ PNG gerado: ${pngPath}`);
    // Remover SVG temporário
    fs.unlinkSync(svgPath);
    return true;
  } catch (e) {
    // Tentar usar inkscape
    try {
      execSync(`which inkscape`, { stdio: 'ignore' });
      execSync(`inkscape "${svgPath}" --export-filename="${pngPath}" --export-width=1200 --export-height=630`, { stdio: 'ignore' });
      console.log(`✓ PNG gerado: ${pngPath}`);
      fs.unlinkSync(svgPath);
      return true;
    } catch (e2) {
      console.log(`⚠ Ferramenta de conversão não encontrada. SVG salvo: ${svgPath}`);
      console.log(`  Instale imagemagick (convert) ou inkscape para converter para PNG`);
      return false;
    }
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

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    if (fs.existsSync(post.thumbnailPath)) {
      console.log(`⊘ Já existe: ${post.thumbnailFilename}`);
      skipped++;
      continue;
    }

    try {
      generateSVG(post.title, post.tags, post.thumbnailPath);
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
