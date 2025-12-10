#!/usr/bin/env node

/**
 * Script para corrigir datas dos posts de 2025 para 2024
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));

let updated = 0;

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Substituir datas de 2025 para 2024
  const originalContent = content;
  content = content.replace(/date:\s*"2025-(\d{2}-\d{2})"/g, 'date: "2024-$1"');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Atualizado: ${file}`);
    updated++;
  }
});

console.log(`\n✓ Concluído!`);
console.log(`  Atualizados: ${updated} posts`);

