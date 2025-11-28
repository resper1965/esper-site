import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Carregar perfil tonal
const RICARDO_PROFILE = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'src/lib/ai/ricardo-profile.json'), 'utf-8')
);

interface GeneratePostParams {
  topic: string;
  category: string;
  sources: Array<{ title: string; url: string; summary: string }>;
  keywords?: string[];
}

export async function generatePost(params: GeneratePostParams) {
  const { topic, category, sources, keywords = [] } = params;
  
  // Construir prompt com perfil do Ricardo
  const prompt = `
Você é Ricardo Esper escrevendo um post para seu blog profissional de cibersegurança.

# IDENTIDADE
${JSON.stringify(RICARDO_PROFILE.identity, null, 2)}

# TOM DE VOZ
- Nível de formalidade: ${RICARDO_PROFILE.voice.formality}/10
- Tom: ${RICARDO_PROFILE.voice.tone}
- Perspectiva: Primeira pessoa para experiências, terceira pessoa para análises técnicas
- Personalidade: ${RICARDO_PROFILE.voice.personality.join(', ')}

# FRASES CARACTERÍSTICAS (use naturalmente)
${RICARDO_PROFILE.phrases.map((p: string) => '- "' + p + '"').join('\n')}

# ABERTURAS TÍPICAS (escolha uma adequada)
${RICARDO_PROFILE.structure.opening.map((o: string) => '- ' + o).join('\n')}

# TEMA DO POST
${topic}

# CATEGORIA
${category}

# FONTES VERIFICADAS (cite quando relevante)
${sources.map(s => `- ${s.title} (${s.url})\n  ${s.summary}`).join('\n')}

# KEYWORDS SEO
${keywords.join(', ')}

# ESTRUTURA OBRIGATÓRIA
1. **Abertura** (150-200 palavras)
   - Estabeleça credibilidade pessoal
   - Gancho com experiência recente ou reflexão
   - Primeira pessoa natural

2. **Contextualização** (300-400 palavras)
   - Explique o tema para leigos técnicos
   - Use analogias se necessário
   - Progrida do conhecido para o desconhecido

3. **Análise Técnica** (600-800 palavras)
   - Aprofunde aspectos técnicos
   - Mantenha acessível (explique termos)
   - Use exemplos concretos

4. **Caso Prático** (400-500 palavras)
   - "Recentemente, durante uma consultoria através da [empresa]..."
   - Anonimize completamente
   - Demonstre expertise sem revelar confidências

5. **Recomendações** (300-400 palavras)
   - 3-5 recomendações acionáveis
   - Balanceie técnico e prático
   - Para indivíduos E empresas

6. **Reflexão Final** (200-300 palavras)
   - Perspectiva de longo prazo
   - Como pai/profissional 60 anos
   - Otimista cauteloso

7. **Call to Action**
   - Natural, não forçado
   - Convite para conectar no LinkedIn
   - Ofereça valor adicional

# REQUISITOS
- **Comprimento**: 2000-2500 palavras
- **Formato**: Markdown com frontmatter YAML
- **Tom**: Profissional acessível (6.5/10 formalidade)
- **Citações**: Máximo 1 por fonte, sempre < 15 palavras
- **Paráfrase**: Nunca copie estrutura ou frases das fontes
- **Autenticidade**: Soe como Ricardo, não como IA genérica

# FRONTMATTER YAML
\`\`\`yaml
---
title: "[Título impactante mas profissional]"
slug: "[slug-kebab-case]"
date: "${new Date().toISOString().split('T')[0]}"
category: "${category}"
language: "pt-br"
excerpt: "[150-160 caracteres que capturam essência]"
author: "Ricardo Esper"
keywords: [${keywords.map(k => '"' + k + '"').join(', ')}]
generatedBy: "ai"
sources: [${sources.map(s => '"' + s.url + '"').join(', ')}]
---
\`\`\`

# OUTPUT
Gere APENAS o post completo em Markdown com frontmatter.
NÃO inclua meta-comentários, explicações ou qualquer texto fora do post.
`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Avaliar qualidade
    const score = await evaluateQuality(content);

    return {
      content,
      score,
      metadata: {
        topic,
        category,
        sources: sources.map(s => s.url),
        generatedAt: new Date().toISOString(),
        model: 'claude-sonnet-4',
        tokensUsed: message.usage
      }
    };
  } catch (error) {
    console.error('Erro ao gerar post:', error);
    throw error;
  }
}

async function evaluateQuality(content: string): Promise<number> {
  // Critérios de qualidade
  const checks = {
    hasProperLength: content.length >= 8000 && content.length <= 15000, // ~2000-2500 palavras
    hasFrontmatter: content.includes('---') && content.includes('title:'),
    hasCharacteristicPhrases: RICARDO_PROFILE.phrases.some((phrase: string) => 
      content.toLowerCase().includes(phrase)
    ),
    hasPersonalExperience: /em meus|aos 60 anos|como pai|34 anos/i.test(content),
    hasPracticalCase: /caso|exemplo|situação|experiência/i.test(content),
    hasRecommendations: /recomend|sugiro|importante|essencial/i.test(content),
    hasCallToAction: /linkedin|conecte|compartilhe/i.test(content),
  };

  const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 10;
  
  return Math.round(score * 10) / 10;
}

export async function savePostDraft(post: { content: string; score: number; metadata: any }) {
  const postsDir = path.join(process.cwd(), 'src/content/posts/drafts');
  
  // Criar diretório se não existir
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // Extrair slug do frontmatter
  const slugMatch = post.content.match(/slug: "(.+)"/);
  const slug = slugMatch ? slugMatch[1] : `draft-${Date.now()}`;

  const filename = `${slug}.mdx`;
  const filepath = path.join(postsDir, filename);

  // Adicionar metadata ao final
  const contentWithMeta = `${post.content}

<!--
METADATA DE GERAÇÃO:
- Score: ${post.score}/10
- Gerado em: ${post.metadata.generatedAt}
- Modelo: ${post.metadata.model}
- Tokens: ${JSON.stringify(post.metadata.tokensUsed)}
- Fontes: ${post.metadata.sources.join(', ')}
-->
`;

  fs.writeFileSync(filepath, contentWithMeta, 'utf-8');

  return {
    filepath,
    filename,
    slug
  };
}
