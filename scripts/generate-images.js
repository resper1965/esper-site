#!/usr/bin/env node

/**
 * Script para gerar imagens em escala de cinza para todos os posts
 * 
 * Uso:
 *   node scripts/generate-images.js
 * 
 * Requer que o servidor Next.js esteja rodando:
 *   npm run dev
 * 
 * Ou use a interface web em: /admin/images
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  console.log('🖼️  Gerador de Imagens em Escala de Cinza\n');
  console.log(`📡 Conectando a ${BASE_URL}...\n`);

  try {
    // Lista todos os posts
    const listRes = await fetch(`${BASE_URL}/api/generate-images-greyscale?list=true`);
    if (!listRes.ok) {
      throw new Error(`Erro ao listar posts: ${listRes.status} ${listRes.statusText}`);
    }
    
    const posts = await listRes.json();
    console.log(`📝 Encontrados ${posts.length} posts\n`);

    const results = {
      success: [],
      failed: []
    };

    // Gera imagem para cada post
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const progress = `[${i + 1}/${posts.length}]`;
      
      process.stdout.write(`${progress} Gerando: ${post.slug}...`);
      
      try {
        const res = await fetch(
          `${BASE_URL}/api/generate-images-greyscale?slug=${post.slug}&download=true`
        );
        
        if (res.ok) {
          const data = await res.json();
          results.success.push({ slug: post.slug, path: data.path });
          console.log(' ✅');
        } else {
          const error = await res.text();
          results.failed.push({ slug: post.slug, error });
          console.log(` ❌ (${error})`);
        }
      } catch (error) {
        results.failed.push({ slug: post.slug, error: error.message });
        console.log(` ❌ (${error.message})`);
      }
    }

    // Resumo
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO');
    console.log('='.repeat(50));
    console.log(`✅ Sucesso: ${results.success.length}`);
    console.log(`❌ Falhas:  ${results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.log('\n⚠️  Posts com falha:');
      results.failed.forEach(f => {
        console.log(`   - ${f.slug}: ${f.error}`);
      });
    }

    console.log('\n✨ Imagens salvas em: public/images/');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.log('\n💡 Certifique-se que o servidor Next.js está rodando:');
    console.log('   npm run dev');
    process.exit(1);
  }
}

main();
