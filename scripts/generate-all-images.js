/**
 * Script para gerar imagens em escala de cinza para todos os posts do blog
 * Este script precisa ser executado com o servidor Next.js em execução
 * Uso: node scripts/generate-all-images.js [URL_BASE]
 * Exemplo: node scripts/generate-all-images.js http://localhost:3000
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const http = require('http');
const https = require('https');

const postsDirectory = path.join(process.cwd(), 'src/content/posts');
const baseUrl = process.argv[2] || 'http://localhost:3000';

console.log(`🌐 URL base: ${baseUrl}\n`);

// Função para fazer requisição HTTP/HTTPS
function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Função para esperar um tempo
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função principal
async function generateAllImages() {
  console.log('🎨 Iniciando geração de imagens em escala de cinza...\n');

  const fileNames = fs.readdirSync(postsDirectory);
  const mdxFiles = fileNames.filter(name => name.endsWith('.mdx'));

  console.log(`📚 Encontrados ${mdxFiles.length} posts\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < mdxFiles.length; i++) {
    const fileName = mdxFiles[i];
    
    try {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      const slug = data.slug || fileName.replace(/\.mdx$/, '');
      const title = data.title || 'Post';
      const category = data.category || 'general';

      console.log(`[${i + 1}/${mdxFiles.length}] Gerando: ${slug}`);
      console.log(`   📝 ${title}`);
      console.log(`   🏷️  ${category}`);

      // Fazer requisição para gerar e baixar a imagem
      const url = `${baseUrl}/api/generate-images?slug=${encodeURIComponent(slug)}&download=true`;
      
      try {
        const response = await fetchImage(url);
        console.log(`   ✅ Imagem gerada com sucesso!\n`);
        successCount++;
      } catch (fetchError) {
        console.log(`   ⚠️  Erro na requisição: ${fetchError.message}\n`);
        errorCount++;
        errors.push({ slug, error: fetchError.message });
      }

      // Pequeno delay para não sobrecarregar o servidor
      if (i < mdxFiles.length - 1) {
        await sleep(500);
      }

    } catch (error) {
      console.error(`   ❌ Erro ao processar ${fileName}: ${error.message}\n`);
      errorCount++;
      errors.push({ file: fileName, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✨ Geração concluída!`);
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   📁 Imagens salvas em: public/images/`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log('\n❌ Erros encontrados:');
    errors.forEach(({ slug, file, error }) => {
      console.log(`   • ${slug || file}: ${error}`);
    });
  }

  console.log('\n💡 Dica: Verifique se o servidor Next.js está rodando!');
  console.log('   Execute: npm run dev');
}

// Executar
generateAllImages().catch(console.error);
