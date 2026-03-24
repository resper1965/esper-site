/**
 * Gera imagens abstratas em greyscale usando canvas
 * Baseado no slug para consistência
 * 
 * NOTA: Requer pacote 'canvas' instalado. Se não estiver disponível,
 * as funções retornarão erro.
 * 
 * AGORA SALVA NO SUPABASE STORAGE
 */

import fs from 'fs';
import path from 'path';
import { uploadPostImage } from '../cloudflare/storage';

// Importação dinâmica do canvas (opcional)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let createCanvas: (width: number, height: number) => any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const canvasModule = require('canvas');
  createCanvas = canvasModule.createCanvas;
} catch {
  console.warn('⚠️  Canvas não está disponível. Instale com: npm install canvas');
  // Criar função stub que lança erro
  createCanvas = () => {
    throw new Error('Canvas não está instalado. Execute: npm install canvas');
  };
}

/**
 * Gera um hash simples do slug para usar como seed
 */
function hashString(str: string): number {
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
function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  }
}

/**
 * Gera uma imagem abstrata em greyscale baseada no slug
 */
export async function generateAbstractImage(
  slug: string,
  outputPath: string,
  width: number = 1200,
  height: number = 630
): Promise<void> {
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
  
  // Garantir que o diretório existe
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Salvar imagem
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Imagem abstrata gerada: ${outputPath}`);
}

/**
 * Gera uma imagem abstrata temática baseada na descrição visual do Gemini
 * Usa palavras-chave da descrição para criar elementos visuais relevantes
 * AGORA RETORNA URL DO SUPABASE STORAGE
 */
export async function generateThemedAbstractImage(
  slug: string,
  visualDescription: string,
  title: string,
  category: string,
  width: number = 1200,
  height: number = 630
): Promise<string> {
  const seed = hashString(slug + visualDescription);
  const random = seededRandom(seed);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Analisar descrição para extrair elementos temáticos
  const descriptionLower = visualDescription.toLowerCase();
  const hasTech = /tech|digital|cyber|network|code|data|security|lock|shield/i.test(descriptionLower);
  const hasNetwork = /network|connection|link|web|internet|cloud/i.test(descriptionLower);
  const hasSecurity = /security|lock|shield|protection|defense|secure/i.test(descriptionLower);
  const hasAbstract = /abstract|geometric|pattern|shape|form/i.test(descriptionLower);

  // Fundo escuro (gray-950) com gradiente sutil
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, 'rgb(3, 7, 18)'); // gray-950
  bgGradient.addColorStop(1, 'rgb(15, 23, 42)'); // gray-900
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Elementos temáticos baseados na descrição
  if (hasNetwork || hasTech) {
    // Desenhar elementos de rede/conexão
    drawNetworkElements(ctx, width, height, random);
  }

  if (hasSecurity) {
    // Desenhar elementos de segurança (escudos, cadeados abstratos)
    drawSecurityElements(ctx, width, height, random);
  }

  if (hasAbstract || (!hasTech && !hasSecurity)) {
    // Elementos geométricos abstratos
    drawGeometricElements(ctx, width, height, random);
  }

  // Acento cyan (#00ade8) - usar estrategicamente
  drawCyanAccents(ctx, width, height, random);

  // Padrão de pontos sutis
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = 'rgb(148, 163, 184)'; // slate-400
  const dotSpacing = 50;
  for (let x = 0; x < width; x += dotSpacing) {
    for (let y = 0; y < height; y += dotSpacing) {
      if (random() > 0.85) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Upload para Supabase Storage
  const buffer = canvas.toBuffer('image/png');
  const filename = `${slug}-abstract-${Date.now()}.png`;

  const imageUrl = await uploadPostImage(buffer, filename, 'image/png');

  if (!imageUrl) {
    throw new Error('Falha ao fazer upload da imagem abstrata para Supabase');
  }

  console.log(`✅ Imagem temática gerada e enviada para Supabase: ${imageUrl}`);

  return imageUrl;
}

function drawNetworkElements(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  width: number,
  height: number,
  random: () => number
): void {
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = 'rgb(100, 116, 139)'; // slate-500
  
  // Desenhar nós de rede
  const nodes: Array<{ x: number; y: number }> = [];
  const numNodes = Math.floor(random() * 5) + 8; // 8-12 nós
  
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: random() * width,
      y: random() * height,
    });
  }
  
  // Conectar nós próximos
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 300 && random() > 0.5) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
    
    // Desenhar nó
    ctx.fillStyle = 'rgb(148, 163, 184)'; // slate-400
    ctx.beginPath();
    ctx.arc(nodes[i].x, nodes[i].y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSecurityElements(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  width: number,
  height: number,
  random: () => number
): void {
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = 'rgb(100, 116, 139)'; // slate-500
  ctx.lineWidth = 2;
  
  // Desenhar escudos/cadeados abstratos
  const numShields = Math.floor(random() * 3) + 2; // 2-4 escudos
  
  for (let i = 0; i < numShields; i++) {
    const x = random() * width;
    const y = random() * height;
    const size = (random() * 100) + 80; // 80-180
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(random() * Math.PI * 0.5);
    
    // Escudo abstrato (forma de gota invertida)
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.quadraticCurveTo(-size / 3, 0, 0, size / 2);
    ctx.quadraticCurveTo(size / 3, 0, 0, -size / 2);
    ctx.stroke();
    
    // Linha horizontal no meio (cadeado)
    ctx.beginPath();
    ctx.moveTo(-size / 4, 0);
    ctx.lineTo(size / 4, 0);
    ctx.stroke();
    
    ctx.restore();
  }
}

function drawGeometricElements(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  width: number,
  height: number,
  random: () => number
): void {
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = 'rgb(100, 116, 139)'; // slate-500
  
  const numShapes = Math.floor(random() * 6) + 4; // 4-9 formas
  
  for (let i = 0; i < numShapes; i++) {
    const shapeType = Math.floor(random() * 3);
    const x = random() * width;
    const y = random() * height;
    const size = (random() * 200) + 60; // 60-260
    
    if (shapeType === 0) {
      // Círculo
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shapeType === 1) {
      // Hexágono
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(random() * Math.PI * 2);
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (Math.PI / 3) * j;
        const px = Math.cos(angle) * size / 2;
        const py = Math.sin(angle) * size / 2;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      // Retângulo rotacionado
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(random() * Math.PI * 2);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    }
  }
}

function drawCyanAccents(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  width: number,
  height: number,
  random: () => number
): void {
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#00ade8'; // cyan accent
  ctx.strokeStyle = '#00ade8';
  
  // Desenhar 1-3 acentos cyan estratégicos
  const numAccents = Math.floor(random() * 2) + 1; // 1-2 acentos
  
  for (let i = 0; i < numAccents; i++) {
    const x = random() * width;
    const y = random() * height;
    const size = (random() * 40) + 20; // 20-60
    
    const accentType = Math.floor(random() * 2);
    
    if (accentType === 0) {
      // Círculo pequeno
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Linha/raio
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const angle = random() * Math.PI * 2;
      ctx.lineTo(
        x + Math.cos(angle) * size * 2,
        y + Math.sin(angle) * size * 2
      );
      ctx.stroke();
    }
  }
}
