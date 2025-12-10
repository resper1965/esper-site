#!/usr/bin/env node

/**
 * Script para reverter datas dos posts de 2024 para 2025
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));

let updated = 0;

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Substituir datas de 2024 para 2025
  const originalContent = content;
  content = content.replace(/date:\s*"2024-(\d{2}-\d{2})"/g, 'date: "2025-$1"');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Atualizado: ${file}`);
    updated++;
  }
});

console.log(`\n✓ Concluído!`);
console.log(`  Atualizados: ${updated} posts`);

