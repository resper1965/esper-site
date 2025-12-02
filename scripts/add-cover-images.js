#!/usr/bin/env node

/**
 * Script para adicionar coverImage aos posts que não têm
 * As imagens serão geradas dinamicamente pelo sistema Open Graph
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Verificar se já tem coverImage
  if (content.includes('coverImage:') || content.includes('thumbnail:')) {
    return;
  }
  
  // Extrair slug
  const slugMatch = content.match(/slug:\s*["']?([^"'\s]+)["']?/);
  if (!slugMatch) {
    console.log(`⚠ Pulando ${file} - sem slug`);
    return;
  }
  
  const slug = slugMatch[1];
  const imagePath = `/images/${slug}.png`;
  
  // Adicionar coverImage após a linha do slug ou após excerpt
  const excerptMatch = content.match(/(excerpt:.*\n)/);
  if (excerptMatch) {
    content = content.replace(
      excerptMatch[0],
      `${excerptMatch[0]}coverImage: "${imagePath}"\n`
    );
  } else {
    // Se não tem excerpt, adicionar após slug
    content = content.replace(
      /(slug:.*\n)/,
      `$1coverImage: "${imagePath}"\n`
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Adicionado coverImage a ${file}`);
});

console.log('\n✓ Concluído!');

