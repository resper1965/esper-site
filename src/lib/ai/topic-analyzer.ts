import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface Source {
  title: string;
  url: string;
  summary: string;
  source: string;
}

interface TopicSuggestion {
  topic: string;
  category: string;
  keywords: string[];
  reasoning: string;
  relevanceScore: number;
  sources: string[];
}

export async function analyzeTopics(sources: Source[]): Promise<TopicSuggestion[]> {
  if (sources.length === 0) {
    return [];
  }

  const prompt = `
Analise as seguintes notícias recentes de cibersegurança e sugira 3-5 tópicos para posts de blog.

# CONTEXTO
Blog de Ricardo Esper: especialista em cibersegurança, 34 anos de experiência, CISO, forense digital.

# NOTÍCIAS RECENTES
${sources.map((s, i) => `
${i + 1}. [${s.source}] ${s.title}
   URL: ${s.url}
   Resumo: ${s.summary}
`).join('\n')}

# CATEGORIAS DISPONÍVEIS
- cybersecurity (técnico, ameaças, vulnerabilidades)
- counterespionage (OSINT, proteção executiva)
- homeautomation (IoT, smart home security)
- travel (tecnologia em viagens, mercados globais)
- general (LGPD, compliance, tendências)
- vida (reflexões pessoais, autoconhecimento, maturidade emocional)

# CRITÉRIOS
1. Relevância atual (aconteceu recentemente)
2. Alinhamento com expertise do Ricardo
3. Valor educacional para leitores
4. Potencial para caso prático
5. SEO e interesse público

# OUTPUT
Retorne APENAS um JSON array com 3-5 sugestões no formato:
[
  {
    "topic": "Título específico e atraente do post",
    "category": "categoria",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "reasoning": "Por que este tópico é relevante agora (2-3 frases)",
    "relevanceScore": 8.5,
    "sources": ["url1", "url2"]
  }
]

Ordene por relevanceScore (10 = mais relevante).
`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Extrair JSON (remover markdown se houver)
    const jsonMatch = content.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) {
      console.error('❌ Não conseguiu extrair JSON da resposta');
      return [];
    }

    const topics: TopicSuggestion[] = JSON.parse(jsonMatch[0]);
    
    console.log(`✅ Analisados ${sources.length} fontes → ${topics.length} tópicos sugeridos`);
    
    return topics;
  } catch (error) {
    console.error('❌ Erro ao analisar tópicos:', error);
    return [];
  }
}

export async function selectBestTopic(
  suggestions: TopicSuggestion[],
  recentPosts: string[]
): Promise<TopicSuggestion | null> {
  if (suggestions.length === 0) return null;

  // Filtrar tópicos muito similares aos posts recentes
  const filtered = suggestions.filter(suggestion => {
    const topicWords = suggestion.topic.toLowerCase().split(' ');
    const isDuplicate = recentPosts.some(recentTitle => {
      const recentWords = recentTitle.toLowerCase().split(' ');
      const overlap = topicWords.filter(word => 
        recentWords.some(rw => rw.includes(word) || word.includes(rw))
      );
      return overlap.length > 2; // Se > 2 palavras em comum, considera duplicado
    });
    return !isDuplicate;
  });

  if (filtered.length === 0) {
    console.log('⚠️ Todos os tópicos sugeridos são similares a posts recentes');
    return null;
  }

  // Retornar o de maior score
  return filtered.sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
}
