#!/usr/bin/env node

/**
 * Script para atualizar coverImage nos posts que não têm
 * Usa as imagens em greyscale geradas
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Verificar se já tem coverImage
  if (content.match(/^coverImage:\s*/m)) {
    skipped++;
    return;
  }
  
  // Extrair slug
  const slugMatch = content.match(/^slug:\s*["']?([^"'\s]+)["']?/m);
  if (!slugMatch) {
    console.log(`⚠ Pulando ${file} - sem slug`);
    skipped++;
    return;
  }
  
  const slug = slugMatch[1];
  const imagePath = `/images/${slug}.png`;
  
  // Encontrar a linha do excerpt ou slug para inserir após
  const excerptMatch = content.match(/^(excerpt:.*\n)/m);
  if (excerptMatch) {
    // Inserir após excerpt
    content = content.replace(
      excerptMatch[0],
      `${excerptMatch[0]}coverImage: "${imagePath}"\n`
    );
  } else {
    // Se não tem excerpt, inserir após slug
    const slugLineMatch = content.match(/^(slug:.*\n)/m);
    if (slugLineMatch) {
      content = content.replace(
        slugLineMatch[0],
        `${slugLineMatch[0]}coverImage: "${imagePath}"\n`
      );
    } else {
      console.log(`⚠ Pulando ${file} - não encontrou onde inserir`);
      skipped++;
      return;
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Atualizado: ${file}`);
  updated++;
});

console.log(`\n✓ Concluído!`);
console.log(`  Atualizados: ${updated} posts`);
if (skipped > 0) {
  console.log(`  Pulados: ${skipped} posts (já tinham coverImage ou erro)`);
}

