import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const postsDir = path.join(__dirname, '..', 'src/content/posts');
const imagesDir = path.join(__dirname, '..', 'public/images');

// Garantir que o diretório de imagens existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Gera um hash simples do slug para usar como seed
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Gera um número pseudoaleatório baseado em seed
 */
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  }
}

/**
 * Gera uma imagem abstrata em greyscale baseada no slug
 */
function generateAbstractImage(slug, outputPath, width = 1200, height = 630) {
  const seed = hashString(slug);
  const random = seededRandom(seed);
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fundo gradiente suave em greyscale
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  const bgStart = Math.floor(random() * 40) + 200; // 200-240 (claro)
  const bgEnd = Math.floor(random() * 40) + 150; // 150-190 (médio)
  bgGradient.addColorStop(0, `rgb(${bgStart}, ${bgStart}, ${bgStart})`);
  bgGradient.addColorStop(1, `rgb(${bgEnd}, ${bgEnd}, ${bgEnd})`);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Desenhar formas abstratas
  const numShapes = Math.floor(random() * 8) + 5; // 5-12 formas
  
  for (let i = 0; i < numShapes; i++) {
    const shapeType = Math.floor(random() * 3);
    const x = random() * width;
    const y = random() * height;
    const size = (random() * 300) + 50; // 50-350
    const opacity = random() * 0.3 + 0.1; // 0.1-0.4
    const gray = Math.floor(random() * 100) + 50; // 50-150 (escuro)
    
    ctx.globalAlpha = opacity;
    ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
    
    if (shapeType === 0) {
      // Círculo
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shapeType === 1) {
      // Retângulo rotacionado
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(random() * Math.PI * 2);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    } else {
      // Linha curva
      ctx.strokeStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.lineWidth = (random() * 10) + 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        ctx.quadraticCurveTo(
          x + (random() - 0.5) * size,
          y + (random() - 0.5) * size,
          x + (random() - 0.5) * size * 2,
          y + (random() - 0.5) * size * 2
        );
      }
      ctx.stroke();
    }
  }
  
  // Adicionar padrão de pontos sutis
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = 'rgb(0, 0, 0)';
  const dotSpacing = 40;
  for (let x = 0; x < width; x += dotSpacing) {
    for (let y = 0; y < height; y += dotSpacing) {
      if (random() > 0.7) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  // Salvar imagem
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Imagem abstrata gerada: ${path.basename(outputPath)}`);
}

async function regenerateAllImages() {
  console.log('🎨 Gerando imagens abstratas em greyscale...\n');
  console.log('ℹ️  Baseado no slug para consistência\n');

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
  console.log(`📝 Encontrados ${files.length} posts\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(fileContent);

    const slug = frontmatter.slug || file.replace(/\.mdx$/, '');
    const title = frontmatter.title || 'Post';
    
    console.log(`📄 ${title}`);
    console.log(`   Slug: ${slug}`);

    try {
      const imageFilename = `${slug}.png`;
      const imagePath = path.join(imagesDir, imageFilename);
      const coverImagePath = `/images/${imageFilename}`;

      // Gerar imagem abstrata
      generateAbstractImage(slug, imagePath);

      // Atualizar frontmatter
      let updatedContent = fileContent;
      
      if (frontmatter.coverImage) {
        updatedContent = updatedContent.replace(
          /coverImage:\s*["'][^"']*["']/,
          `coverImage: "${coverImagePath}"`
        );
      } else {
        const frontmatterEnd = updatedContent.indexOf('---', 3);
        if (frontmatterEnd > 0) {
          const beforeFrontmatter = updatedContent.substring(0, frontmatterEnd);
          const afterFrontmatter = updatedContent.substring(frontmatterEnd);
          const coverImageLine = `coverImage: "${coverImagePath}"\n`;
          updatedContent = beforeFrontmatter + coverImageLine + afterFrontmatter;
        }
      }

      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      console.log(`   ✅ Imagem salva: ${coverImagePath}\n`);
      successCount++;

    } catch (error) {
      console.error(`   ❌ Erro: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   📝 Total: ${files.length}`);
}

regenerateAllImages().catch(console.error);

