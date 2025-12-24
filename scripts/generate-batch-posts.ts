#!/usr/bin/env tsx
/**
 * Script CLI para geração batch de posts
 * Uso: npx tsx scripts/generate-batch-posts.ts [count]
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAllSources } from '../src/lib/ai/source-fetcher';
import { generatePost, savePostDraft, publishPost } from '../src/lib/ai/post-generator';
import { generateTextWithGemini } from '../src/lib/ai/gemini-client';

const COUNT = parseInt(process.argv[2] || '15', 10);
const HOURS_BACK = 168; // 7 days
const AUTO_PUBLISH = true;

interface TopicSuggestion {
  topic: string;
  category: string;
  keywords: string[];
  reasoning: string;
  relevanceScore: number;
  sources: string[];
}

async function analyzeTopicsExpanded(sources: Array<{ title: string; url: string; summary: string; source: string }>, count: number): Promise<TopicSuggestion[]> {
  const prompt = `
Analise as seguintes notícias e gere ${count} tópicos ÚNICOS para posts de blog.

# CONTEXTO
Blog de Ricardo Esper: CISO, 34 anos de experiência, forense digital, compliance internacional.

# CATEGORIAS (distribua equitativamente)
- Cibersegurança (ameaças, vulnerabilidades, zero trust, ransomware)
- Contraespionagem (OSINT, proteção executiva, TSCM)
- vida (reflexões, maturidade, equilíbrio, paternidade)
- general (compliance, LGPD, GDPR, tendências, IA)

# NOTÍCIAS RECENTES
${sources.slice(0, 30).map((s, i) => `${i + 1}. [${s.source}] ${s.title}\n   ${s.summary}`).join('\n\n')}

# REQUISITOS SEO
- Títulos com keywords de busca populares
- Keywords long-tail incluídas (ex: "como proteger empresa de ransomware")
- Foco em intenção de busca informacional
- Específico, nunca genérico

# OUTPUT (APENAS JSON VÁLIDO, SEM MARKDOWN)
[
  {
    "topic": "Título otimizado para SEO com keywords",
    "category": "Cibersegurança",
    "keywords": ["keyword principal", "keyword secundária", "long-tail keyword", "termo de busca"],
    "reasoning": "Por que este tópico é relevante agora",
    "relevanceScore": 9.0,
    "sources": ["url1", "url2"]
  }
]

Gere EXATAMENTE ${count} tópicos únicos e diversos. Ordene por relevanceScore.`;

  try {
    const result = await generateTextWithGemini(
      prompt,
      'Você é um especialista em SEO e cibersegurança. Retorne APENAS JSON válido, sem formatação markdown.',
      'gemini-1.5-flash'
    );

    const jsonMatch = result.text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      console.error('❌ Não conseguiu extrair JSON');
      console.error('Resposta:', result.text.substring(0, 500));
      return [];
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('❌ Erro na análise de tópicos:', error);
    return [];
  }
}

async function main() {
  console.log('🚀 Iniciando geração batch de', COUNT, 'posts...\n');

  // 1. Buscar fontes
  console.log('📡 Buscando fontes das últimas', HOURS_BACK, 'horas...');
  const sources = await getAllSources(HOURS_BACK);
  console.log('✅', sources.length, 'fontes encontradas\n');

  if (sources.length < 5) {
    console.error('❌ Fontes insuficientes');
    process.exit(1);
  }

  // 2. Analisar tópicos
  console.log('🧠 Analisando tópicos com IA...');
  const topics = await analyzeTopicsExpanded(sources, COUNT + 5);
  console.log('✅', topics.length, 'tópicos sugeridos\n');

  if (topics.length === 0) {
    console.error('❌ Nenhum tópico gerado');
    process.exit(1);
  }

  // 3. Gerar posts
  const results: Array<{ slug: string; title: string; score: number; published: boolean; error?: string }> = [];

  for (let i = 0; i < Math.min(COUNT, topics.length); i++) {
    const topic = topics[i];
    console.log(`\n📝 [${i + 1}/${COUNT}] ${topic.topic.substring(0, 60)}...`);
    console.log(`   Categoria: ${topic.category} | Score: ${topic.relevanceScore}`);

    try {
      // Generate post
      const post = await generatePost({
        topic: topic.topic,
        category: topic.category,
        keywords: topic.keywords,
        sources: sources
          .filter(s => topic.sources.includes(s.url))
          .slice(0, 3)
          .map(s => ({ title: s.title, url: s.url, summary: s.summary }))
      });

      console.log(`   ✅ Gerado! Score: ${post.score}/10`);

      // Save
      const saved = await savePostDraft(post, topic.category);
      console.log(`   ✅ Salvo: ${saved.slug}`);

      // Auto-publish if high score
      let isPublished = false;
      if (AUTO_PUBLISH && post.score >= 7.0) {
        await publishPost(saved.slug);
        isPublished = true;
        console.log(`   🚀 Publicado!`);
      }

      results.push({
        slug: saved.slug,
        title: topic.topic,
        score: post.score,
        published: isPublished
      });

      // Delay to avoid rate limits
      if (i < COUNT - 1) {
        console.log('   ⏳ Aguardando 3s...');
        await new Promise(r => setTimeout(r, 3000));
      }

    } catch (error) {
      console.error(`   ❌ Erro:`, error);
      results.push({
        slug: `error-${i}`,
        title: topic.topic,
        score: 0,
        published: false,
        error: error instanceof Error ? error.message : 'Unknown'
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA GERAÇÃO');
  console.log('='.repeat(60));

  const successful = results.filter(r => !r.error);
  const published = results.filter(r => r.published);
  const avgScore = successful.length > 0
    ? (successful.reduce((a, b) => a + b.score, 0) / successful.length).toFixed(1)
    : '0';

  console.log(`✅ Gerados: ${successful.length}/${COUNT}`);
  console.log(`🚀 Publicados: ${published.length}`);
  console.log(`📈 Score médio: ${avgScore}/10`);
  console.log(`❌ Falhas: ${results.filter(r => r.error).length}`);

  console.log('\n📄 Posts gerados:');
  results.forEach((r, i) => {
    const status = r.error ? '❌' : r.published ? '🚀' : '📝';
    console.log(`   ${i + 1}. ${status} [${r.score}] ${r.title.substring(0, 50)}...`);
    if (!r.error) console.log(`      → ${r.slug}`);
  });

  console.log('\n✅ Concluído!');
}

main().catch(console.error);
