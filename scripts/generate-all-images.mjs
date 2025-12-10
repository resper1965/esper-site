#!/usr/bin/env node

/**
 * Script standalone para gerar imagens em escala de cinza para todos os posts
 * Não requer o servidor Next.js rodando
 * 
 * Uso: node scripts/generate-all-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import satori from 'satori';
import sharp from 'sharp';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Estilos por categoria - escala de cinza, discreto
const categoryStyles = {
  cybersecurity: { 
    bg: '#1a1a1a', 
    bgSecondary: '#2a2a2a',
    accent: '#808080', 
    icon: '◈'
  },
  counterespionage: { 
    bg: '#161616', 
    bgSecondary: '#262626',
    accent: '#707070', 
    icon: '◉'
  },
  forensics: { 
    bg: '#1c1c1c', 
    bgSecondary: '#2c2c2c',
    accent: '#858585', 
    icon: '◎'
  },
  compliance: { 
    bg: '#181818', 
    bgSecondary: '#282828',
    accent: '#757575', 
    icon: '▣'
  },
  homeautomation: { 
    bg: '#1e1e1e', 
    bgSecondary: '#2e2e2e',
    accent: '#8a8a8a', 
    icon: '⌂'
  },
  travel: { 
    bg: '#1b1b1b', 
    bgSecondary: '#2b2b2b',
    accent: '#7a7a7a', 
    icon: '△'
  },
  vida: { 
    bg: '#191919', 
    bgSecondary: '#292929',
    accent: '#6a6a6a', 
    icon: '○'
  },
  general: { 
    bg: '#1d1d1d', 
    bgSecondary: '#2d2d2d',
    accent: '#656565', 
    icon: '□'
  },
};

const categoryLabels = {
  cybersecurity: 'CIBERSEGURANÇA',
  counterespionage: 'CONTRAESPIONAGEM',
  forensics: 'FORENSE DIGITAL',
  compliance: 'COMPLIANCE',
  homeautomation: 'AUTOMAÇÃO',
  travel: 'VIAGENS',
  vida: 'VIDA',
  general: 'GERAL',
};

// Função para quebrar título em linhas
function splitTitle(title, maxChars = 28) {
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  // Limita a 3 linhas
  const displayLines = lines.slice(0, 3);
  if (lines.length > 3) {
    displayLines[2] = displayLines[2].substring(0, 25) + '...';
  }
  
  return displayLines;
}

// Gera elementos do padrão de fundo
function generatePatternElements(category, accent) {
  const elements = [];
  const opacity = 0.15;
  const color = accent;
  
  switch (category) {
    case 'cybersecurity':
      // Hexágonos
      for (let i = 0; i < 6; i++) {
        elements.push({
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: 60 + (i % 3) * 80,
              top: 120 + Math.floor(i / 3) * 100,
              width: 50,
              height: 60,
              border: `1px solid ${color}`,
              opacity,
              borderRadius: 6,
              transform: 'rotate(30deg)',
            }
          }
        });
      }
      break;
    case 'counterespionage':
      // Círculos concêntricos
      for (let i = 0; i < 4; i++) {
        elements.push({
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: 60,
              top: 150,
              width: 80 + i * 50,
              height: 80 + i * 50,
              border: `1px solid ${color}`,
              opacity,
              borderRadius: '50%',
            }
          }
        });
      }
      break;
    case 'forensics':
      // Grid de pontos
      for (let i = 0; i < 12; i++) {
        elements.push({
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: 80 + (i % 4) * 45,
              top: 160 + Math.floor(i / 4) * 45,
              width: 4,
              height: 4,
              backgroundColor: color,
              opacity,
              borderRadius: '50%',
            }
          }
        });
      }
      break;
    case 'compliance':
      // Linhas horizontais
      for (let i = 0; i < 5; i++) {
        elements.push({
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: 80,
              top: 160 + i * 35,
              width: 180 - i * 25,
              height: 1,
              backgroundColor: color,
              opacity,
            }
          }
        });
      }
      break;
    case 'homeautomation':
      // Quadrados
      for (let i = 0; i < 6; i++) {
        elements.push({
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: 70 + (i % 3) * 60,
              top: 160 + Math.floor(i / 3) * 60,
              width: 45,
              height: 45,
              border: `1px solid ${color}`,
              opacity,
              borderRadius: 3,
            }
          }
        });
      }
      break;
    case 'travel':
      // Triângulos (simulados com bordas)
      for (let i = 0; i < 4; i++) {
        elements.push({
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: 100 + i * 55,
              top: 190 + (i % 2) * 35,
              width: 0,
              height: 0,
              borderLeft: '18px solid transparent',
              borderRight: '18px solid transparent',
              borderBottom: `30px solid ${color}`,
              opacity,
            }
          }
        });
      }
      break;
    case 'vida':
      // Círculos suaves
      for (let i = 0; i < 5; i++) {
        elements.push({
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: 90 + i * 45,
              top: 180 + Math.sin(i) * 25,
              width: 28 + i * 4,
              height: 28 + i * 4,
              border: `1px solid ${color}`,
              opacity,
              borderRadius: '50%',
            }
          }
        });
      }
      break;
    default:
      // Pontos padrão
      for (let i = 0; i < 9; i++) {
        elements.push({
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: 100 + (i % 3) * 40,
              top: 180 + Math.floor(i / 3) * 40,
              width: 3,
              height: 3,
              backgroundColor: color,
              opacity,
              borderRadius: '50%',
            }
          }
        });
      }
  }
  
  return elements;
}

// Cria o elemento JSX para a imagem
function createImageElement(title, category) {
  const styles = categoryStyles[category] || categoryStyles.general;
  const label = categoryLabels[category] || 'GERAL';
  const lines = splitTitle(title);
  const patternElements = generatePatternElements(category, styles.accent);
  
  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: styles.bg,
        position: 'relative',
      },
      children: [
        // Gradiente de fundo
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `linear-gradient(135deg, ${styles.bg} 0%, ${styles.bgSecondary} 100%)`,
            }
          }
        },
        // Padrão geométrico
        ...patternElements,
        // Conteúdo principal
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              padding: '70px 80px',
              position: 'relative',
              zIndex: 1,
              height: '100%',
            },
            children: [
              // Categoria com ícone
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 30,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 24,
                          color: styles.accent,
                        },
                        children: styles.icon
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 14,
                          color: styles.accent,
                          fontWeight: 500,
                          letterSpacing: 3,
                        },
                        children: label
                      }
                    }
                  ]
                }
              },
              // Título
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    flex: 1,
                  },
                  children: lines.map((line, i) => ({
                    type: 'div',
                    key: i,
                    props: {
                      style: {
                        fontSize: 52,
                        fontWeight: 600,
                        lineHeight: 1.15,
                        color: '#e5e5e5',
                      },
                      children: line
                    }
                  }))
                }
              },
              // Linha divisória
              {
                type: 'div',
                props: {
                  style: {
                    width: 120,
                    height: 2,
                    backgroundColor: styles.accent,
                    opacity: 0.4,
                    marginTop: 'auto',
                    marginBottom: 25,
                  }
                }
              },
              // Autor e site
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 20,
                          color: '#a0a0a0',
                          fontWeight: 500,
                        },
                        children: 'Ricardo Esper'
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 16,
                          color: '#606060',
                        },
                        children: 'esper.ws'
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  };
}

// Lê todos os posts MDX
function readAllPosts() {
  const postsDir = path.join(rootDir, 'src/content/posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
  
  const posts = [];
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);
    
    // Usa o slug do frontmatter ou deriva do nome do arquivo
    const slug = data.slug || file.replace('.mdx', '');
    
    posts.push({
      file,
      slug,
      title: data.title || 'Sem título',
      category: data.category || 'general',
      coverImage: data.coverImage,
    });
  }
  
  return posts;
}

// Gera uma imagem
async function generateImage(post) {
  const element = createImageElement(post.title, post.category);
  
  // Renderiza o SVG com satori
  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: await fetch('https://rsms.me/inter/font-files/Inter-Regular.woff').then(r => r.arrayBuffer()),
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: await fetch('https://rsms.me/inter/font-files/Inter-Medium.woff').then(r => r.arrayBuffer()),
        weight: 500,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: await fetch('https://rsms.me/inter/font-files/Inter-SemiBold.woff').then(r => r.arrayBuffer()),
        weight: 600,
        style: 'normal',
      },
    ],
  });
  
  // Converte SVG para PNG usando sharp
  const png = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
  
  return png;
}

async function main() {
  console.log('🖼️  Gerador de Imagens em Escala de Cinza\n');
  
  // Garante que o diretório de imagens existe
  const imagesDir = path.join(rootDir, 'public/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('📁 Criado diretório: public/images\n');
  }
  
  // Lê todos os posts
  const posts = readAllPosts();
  console.log(`📝 Encontrados ${posts.length} posts\n`);
  
  const results = { success: [], failed: [] };
  
  // Carrega as fontes uma vez
  console.log('📥 Carregando fontes...\n');
  
  let fontsData;
  try {
    // Usando fontes do Google Fonts API
    const [regular, semibold] = await Promise.all([
      fetch('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjp-Ek-_0ew.woff').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      }),
      fetch('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hjp-Ek-_0ew.woff').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      }),
    ]);
    fontsData = [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: regular, weight: 500, style: 'normal' },
      { name: 'Inter', data: semibold, weight: 600, style: 'normal' },
    ];
  } catch (error) {
    console.error('❌ Erro ao carregar fontes:', error.message);
    process.exit(1);
  }
  
  // Gera cada imagem
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const progress = `[${String(i + 1).padStart(2)}/${posts.length}]`;
    
    process.stdout.write(`${progress} ${post.slug}...`);
    
    try {
      const element = createImageElement(post.title, post.category);
      
      const svg = await satori(element, {
        width: 1200,
        height: 630,
        fonts: fontsData,
      });
      
      const png = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();
      
      // Deriva o nome do arquivo do coverImage ou usa o slug
      let filename;
      if (post.coverImage) {
        filename = path.basename(post.coverImage);
      } else {
        filename = `${post.slug}.png`;
      }
      
      const outputPath = path.join(imagesDir, filename);
      fs.writeFileSync(outputPath, png);
      
      results.success.push({ slug: post.slug, path: `/images/${filename}` });
      console.log(` ✅ → ${filename}`);
    } catch (error) {
      results.failed.push({ slug: post.slug, error: error.message });
      console.log(` ❌ ${error.message}`);
    }
  }
  
  // Resumo
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RESUMO');
  console.log('═'.repeat(50));
  console.log(`✅ Sucesso: ${results.success.length}`);
  console.log(`❌ Falhas:  ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n⚠️  Posts com falha:');
    results.failed.forEach(f => {
      console.log(`   - ${f.slug}: ${f.error}`);
    });
  }
  
  console.log('\n✨ Imagens salvas em: public/images/');
}

main().catch(console.error);
