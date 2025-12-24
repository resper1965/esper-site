import { NextResponse } from 'next/server';
import { getAllSources } from '@/lib/ai/source-fetcher';
import { generatePost, savePostDraft, publishPost } from '@/lib/ai/post-generator';
import { getRecentPostTitles } from '@/lib/ai/scheduler';

export const maxDuration = 300; // 5 minutes max for batch generation

interface BatchResult {
  slug: string;
  title: string;
  category: string;
  score: number;
  published: boolean;
  error?: string;
}

export async function POST(request: Request) {
  // Auth check
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || 'your-secret-token';
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const count = Math.min(body.count || 15, 20); // Max 20 posts
    const autoPublish = body.autoPublish ?? true; // Auto-publish high scores
    const hoursBack = body.hoursBack || 168; // Default: 7 days

    console.log(`🚀 Iniciando geração batch de ${count} posts...`);
    console.log(`⏰ Buscando fontes das últimas ${hoursBack}h`);

    // 1. Buscar fontes (período mais longo para mais diversidade)
    console.log('📡 Buscando fontes...');
    const sources = await getAllSources(hoursBack);
    console.log(`✅ ${sources.length} fontes encontradas`);

    if (sources.length < 5) {
      return NextResponse.json({
        error: 'Fontes insuficientes',
        sourcesFound: sources.length
      }, { status: 400 });
    }

    // 2. Get recent posts to avoid duplicates
    const recentPosts = await getRecentPostTitles(60);
    console.log(`📋 ${recentPosts.length} posts recentes para evitar duplicação`);

    // 3. Analyze topics (request more than needed for filtering)
    console.log('🧠 Analisando tópicos...');
    const allTopics = await analyzeTopicsExpanded(sources, count + 10);
    console.log(`✅ ${allTopics.length} tópicos sugeridos`);

    if (allTopics.length === 0) {
      return NextResponse.json({
        error: 'Nenhum tópico gerado',
        sourcesFound: sources.length
      }, { status: 400 });
    }

    // 4. Filter and select unique topics
    const selectedTopics = filterUniqueTopics(allTopics, recentPosts, count);
    console.log(`✅ ${selectedTopics.length} tópicos únicos selecionados`);

    // 5. Generate posts in sequence (to avoid rate limits)
    const results: BatchResult[] = [];
    
    for (let i = 0; i < selectedTopics.length; i++) {
      const topic = selectedTopics[i];
      console.log(`\n📝 [${i + 1}/${selectedTopics.length}] Gerando: ${topic.topic.substring(0, 50)}...`);
      
      try {
        // Generate post
        const post = await generatePost({
          topic: topic.topic,
          category: topic.category,
          keywords: topic.keywords,
          sources: sources
            .filter(s => topic.sources.includes(s.url))
            .slice(0, 3)
            .map(s => ({
              title: s.title,
              url: s.url,
              summary: s.summary
            }))
        });

        console.log(`  ✅ Gerado! Score: ${post.score}/10`);

        // Save draft
        const saved = await savePostDraft(post, topic.category);
        console.log(`  ✅ Draft salvo: ${saved.slug}`);

        // Auto-publish if high score
        let isPublished = false;
        if (autoPublish && post.score >= 7.0) {
          await publishPost(saved.slug);
          isPublished = true;
          console.log(`  🚀 Auto-publicado (score >= 7.0)`);
        }

        results.push({
          slug: saved.slug,
          title: topic.topic,
          category: topic.category,
          score: post.score,
          published: isPublished
        });

        // Small delay between generations to avoid rate limits
        if (i < selectedTopics.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`  ❌ Erro: ${error}`);
        results.push({
          slug: `error-${i}`,
          title: topic.topic,
          category: topic.category,
          score: 0,
          published: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successful = results.filter(r => !r.error);
    const published = results.filter(r => r.published);
    const failed = results.filter(r => r.error);

    console.log(`\n✅ Batch completo!`);
    console.log(`   - Gerados: ${successful.length}/${count}`);
    console.log(`   - Publicados: ${published.length}`);
    console.log(`   - Falhas: ${failed.length}`);

    return NextResponse.json({
      success: true,
      summary: {
        requested: count,
        generated: successful.length,
        published: published.length,
        failed: failed.length,
        averageScore: successful.length > 0 
          ? (successful.reduce((a, b) => a + b.score, 0) / successful.length).toFixed(1)
          : 0
      },
      results
    });

  } catch (error) {
    console.error('❌ Erro na geração batch:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Expanded topic analysis with more suggestions
async function analyzeTopicsExpanded(sources: { title: string; url: string; summary: string; source: string }[], count: number) {
  const { generateTextWithGemini } = await import('@/lib/ai/gemini-client');

  const prompt = `
Analise as seguintes notícias e gere ${count} tópicos ÚNICOS para posts de blog.

# CONTEXTO
Blog de Ricardo Esper: CISO, 34 anos de experiência, forense digital, compliance internacional.

# CATEGORIAS (distribua equitativamente)
- Cibersegurança (ameaças, vulnerabilidades, zero trust)
- Contraespionagem (OSINT, proteção executiva, TSCM)
- life (reflexões, maturidade, equilíbrio)
- general (compliance, LGPD, tendências, IA)

# NOTÍCIAS
${sources.slice(0, 30).map((s, i) => `${i + 1}. [${s.source}] ${s.title} - ${s.summary}`).join('\n')}

# REQUISITOS SEO
- Títulos com keywords de busca populares
- Keywords long-tail incluídas
- Foco em intenção de busca
- Específico, não genérico

# OUTPUT (APENAS JSON VÁLIDO)
[
  {
    "topic": "Título específico e otimizado para SEO",
    "category": "categoria",
    "keywords": ["keyword1", "keyword2", "keyword3", "long-tail keyword"],
    "reasoning": "Por que este tópico é relevante",
    "relevanceScore": 8.5,
    "sources": ["url1", "url2"]
  }
]

Gere ${count} tópicos únicos. Ordene por relevanceScore.`;

  try {
    const result = await generateTextWithGemini(
      prompt,
      'Você é um especialista em SEO e cibersegurança. Retorne APENAS JSON válido.',
      'gemini-1.5-flash'
    );

    const jsonMatch = result.text.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Erro na análise expandida:', error);
    return [];
  }
}

// Filter unique topics avoiding duplicates
function filterUniqueTopics(
  topics: Array<{ topic: string; category: string; keywords: string[]; reasoning: string; relevanceScore: number; sources: string[] }>,
  recentPosts: string[],
  count: number
) {
  const selected: typeof topics = [];
  const usedCategories: Record<string, number> = {};

  for (const topic of topics) {
    if (selected.length >= count) break;

    // Check for duplicates with recent posts
    const topicWords = topic.topic.toLowerCase().split(' ');
    const isDuplicate = recentPosts.some(recent => {
      const recentWords = recent.toLowerCase().split(' ');
      const overlap = topicWords.filter(w => recentWords.includes(w));
      return overlap.length > 3;
    });

    if (isDuplicate) continue;

    // Check for duplicates within selection
    const isDuplicateInSelection = selected.some(s => {
      const sWords = s.topic.toLowerCase().split(' ');
      const overlap = topicWords.filter(w => sWords.includes(w));
      return overlap.length > 3;
    });

    if (isDuplicateInSelection) continue;

    // Limit per category for diversity
    const catCount = usedCategories[topic.category] || 0;
    if (catCount >= 5) continue; // Max 5 per category

    selected.push(topic);
    usedCategories[topic.category] = catCount + 1;
  }

  return selected;
}
