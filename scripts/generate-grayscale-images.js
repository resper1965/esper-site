#!/usr/bin/env node

/**
 * Script para gerar imagens de capa discretas em escala de cinza para posts do blog
 * Requer que o servidor Next.js esteja rodando
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const postsDir = path.join(process.cwd(), 'blog/content');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));

const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

async function generateImage(slug) {
  return new Promise((resolve, reject) => {
    const url = `${baseUrl}/api/generate-grayscale-images?slug=${slug}&download=true`;
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            console.log(`✓ Gerada: ${result.path}`);
            resolve(result);
          } catch (e) {
            console.error(`✗ Erro ao processar resposta para ${slug}:`, e.message);
            reject(e);
          }
        } else {
          console.error(`✗ Erro ao gerar ${slug}: ${res.statusCode} - ${data}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.error(`✗ Erro de conexão para ${slug}:`, err.message);
      reject(err);
    });
  });
}

async function main() {
  console.log(`Gerando imagens em escala de cinza para ${files.length} posts...\n`);
  console.log(`Certifique-se de que o servidor Next.js está rodando em ${baseUrl}\n`);

  const slugs = [];
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const slugMatch = content.match(/slug:\s*["']?([^"'\s]+)["']?/);
    if (slugMatch) {
      slugs.push(slugMatch[1]);
    } else {
      // Se não houver slug, usar o nome do arquivo sem extensão
      slugs.push(path.basename(file, '.mdx'));
    }
  }

  let successCount = 0;
  let errorCount = 0;

  for (const slug of slugs) {
    try {
      await generateImage(slug);
      successCount++;
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      errorCount++;
      console.error(`Falha ao gerar imagem para ${slug}`);
    }
  }

  console.log(`\n✓ Concluído!`);
  console.log(`  Sucesso: ${successCount}`);
  if (errorCount > 0) {
    console.log(`  Erros: ${errorCount}`);
  }
}

main().catch(console.error);
