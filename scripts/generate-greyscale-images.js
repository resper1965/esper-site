#!/usr/bin/env node

/**
 * Script para gerar imagens simples em greyscale para todos os posts
 * Cria imagens minimalistas e elegantes em tons de cinza
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const imagesDir = path.join(process.cwd(), 'public/images');

// Garantir que o diretório de imagens existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Quebra o texto em linhas que cabem na largura especificada
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Gera uma imagem simples em greyscale para um post
 */
function generateGreyscaleImage(title, slug, outputPath) {
  const width = 1200;
  const height = 630;
  
  // Criar canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fundo em tons de cinza claro
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  // Adicionar um gradiente sutil
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f5f5f5');
  gradient.addColorStop(1, '#e5e5e5');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Linha decorativa no topo
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 80);
  ctx.lineTo(280, 80);
  ctx.stroke();

  // Configurar fonte para o título
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Quebrar título em linhas
  const maxWidth = width - 160; // Margens de 80px de cada lado
  const lines = wrapText(ctx, title, maxWidth);

  // Desenhar título (máximo 3 linhas)
  const maxLines = 3;
  const lineHeight = 70;
  const startY = 150;
  const displayedLines = lines.slice(0, maxLines);

  displayedLines.forEach((line, index) => {
    ctx.fillText(line, 80, startY + (index * lineHeight));
  });

  // Adicionar "..." se o título foi truncado
  if (lines.length > maxLines) {
    const lastLine = displayedLines[displayedLines.length - 1];
    const lastLineWidth = ctx.measureText(lastLine).width;
    ctx.fillText('...', 80 + lastLineWidth, startY + ((maxLines - 1) * lineHeight));
  }

  // Linha decorativa na parte inferior
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width - 280, height - 80);
  ctx.lineTo(width - 80, height - 80);
  ctx.stroke();

  // Assinatura discreta no canto inferior direito
  ctx.fillStyle = '#666666';
  ctx.font = '24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Ricardo Esper', width - 80, height - 50);

  // Salvar imagem
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Gerada: ${path.basename(outputPath)}`);
}

/**
 * Função principal
 */
async function main() {
  // Ler todos os arquivos MDX
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));

  console.log(`Encontrados ${files.length} posts\n`);

  let generated = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extrair frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      console.log(`⚠ Pulando ${file} - sem frontmatter`);
      skipped++;
      continue;
    }

    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/^title:\s*["'](.+?)["']/m);
    const slugMatch = frontmatter.match(/^slug:\s*["']?([^"'\s]+)["']?/m);

    if (!titleMatch || !slugMatch) {
      console.log(`⚠ Pulando ${file} - frontmatter incompleto`);
      skipped++;
      continue;
    }

    const title = titleMatch[1];
    const slug = slugMatch[1];
    const outputPath = path.join(imagesDir, `${slug}.png`);

    // Gerar imagem
    try {
      generateGreyscaleImage(title, slug, outputPath);
      generated++;
    } catch (error) {
      console.error(`✗ Erro ao gerar imagem para ${slug}:`, error.message);
      skipped++;
    }
  }

  console.log(`\n✓ Concluído!`);
  console.log(`  Geradas: ${generated} imagens`);
  if (skipped > 0) {
    console.log(`  Puladas: ${skipped} posts`);
  }
  console.log(`  Localização: ${imagesDir}`);
}

main().catch(console.error);

