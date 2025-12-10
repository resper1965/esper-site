#!/usr/bin/env tsx

/**
 * Script para configurar GEMINI_API_KEY na Vercel
 * Lê do .env.local e configura para todos os ambientes
 */

import { config } from 'dotenv';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Carregar .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  config({ path: envPath });
}

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.argv[2];

if (!GEMINI_KEY) {
  console.error('❌ Erro: GEMINI_API_KEY não encontrada!');
  console.error('');
  console.error('Opções:');
  console.error('  1. Adicione GEMINI_API_KEY no arquivo .env.local');
  console.error('  2. Ou execute: npm run setup-gemini-vercel -- sua-chave-aqui');
  console.error('');
  process.exit(1);
}

console.log('🔧 Configurando GEMINI_API_KEY na Vercel...\n');

const environments = ['production', 'preview', 'development'];

for (const env of environments) {
  try {
    console.log(`📦 Adicionando para ${env}...`);
    execSync(
      `echo "${GEMINI_KEY}" | vercel env add GEMINI_API_KEY ${env} --yes`,
      { stdio: 'inherit' }
    );
    console.log(`   ✅ Configurado para ${env}\n`);
  } catch (error) {
    console.error(`   ❌ Erro ao configurar para ${env}:`, error);
  }
}

console.log('✅ Configuração concluída!');
console.log('\n💡 Para verificar: vercel env ls | grep GEMINI');

