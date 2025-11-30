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
   - Comece com uma história ou analogia do dia a dia
   - Conecte com a vida comum das pessoas
   - Estabeleça empatia imediata

2. **O Problema Real** (300-400 palavras)
   - Explique o risco sem usar "tech-speak"
   - Use analogias (ex: "Firewall é como a portaria do prédio")
   - Por que minha tia ou vizinho deveria se importar?

3. **Como Funciona (Simplificado)** (500-600 palavras)
   - Explique o conceito como se fosse para um jornal de grande circulação
   - ZERO código (a menos que seja algo como uma senha de exemplo)
   - Foco no comportamento e impacto, não na tecnologia

4. **História Real** (400-500 palavras)
   - "Lembro de um caso onde..."
   - Foco no drama humano e nas consequências reais
   - Menos detalhes técnicos, mais impacto no negócio/vida

5. **O Que Fazer (Guia Prático)** (300-400 palavras)
   - Dicas que qualquer um pode aplicar hoje
   - Nada de "configure o iptables"
   - Sim: "Ative a verificação em duas etapas", "Use senhas longas"

6. **Reflexão de Pai/Avô** (200-300 palavras)
   - Visão de futuro otimista
   - Conselho de vida misturado com segurança
   - "Proteja sua família digital como protege sua casa"

7. **Call to Action**
   - Convite para conversa
   - "Compartilhe com quem você quer proteger"

# REQUISITOS
- **Público-Alvo**: Pessoas comuns, empresários não-técnicos, famílias.
- **Proibido**: Blocos de código complexos, comandos de terminal, JSON, logs brutos.
- **Linguagem**: Jornalística, fluida, envolvente. Use metáforas.
- **Comprimento**: 1500-2000 palavras (mais conciso que antes).
- **Tom**: Ricardo Esper conversando num jantar, não numa palestra técnica.
- **Autenticidade**: Use a experiência de 34 anos para simplificar, não para complicar.

# FRONTMATTER YAML
\`\`\`yaml
---
title: "[Título chamativo e popular]"
slug: "[slug-kebab-case]"
date: "${new Date().toISOString().split('T')[0]}"
category: "${category}"
language: "pt-br"
excerpt: "[Resumo que gera curiosidade e identificação imediata]"
author: "Ricardo Esper"
keywords: [${keywords.map(k => '"' + k + '"').join(', ')}]
generatedBy: "ai"
sources: [${sources.map(s => '"' + s.url + '"').join(', ')}]
---
\`\`\`

# OUTPUT
Gere APENAS o post completo em Markdown com frontmatter.
NÃO inclua meta-comentários.
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function savePostDraft(post: { content: string; score: number; metadata: any }) {
  // Caminho correto para o projeto: blog/content/drafts
  const draftsDir = path.join(process.cwd(), 'blog/content/drafts');

  // Criar diretório se não existir
  if (!fs.existsSync(draftsDir)) {
    fs.mkdirSync(draftsDir, { recursive: true });
  }

  // Extrair slug do frontmatter
  const slugMatch = post.content.match(/slug: "(.+)"/);
  const slug = slugMatch ? slugMatch[1] : `draft-${Date.now()}`;

  const filename = `${slug}.mdx`;
  const filepath = path.join(draftsDir, filename);

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

export async function publishPost(draftPath: string) {
  const contentDir = path.join(process.cwd(), 'blog/content');
  const filename = path.basename(draftPath);
  const targetPath = path.join(contentDir, filename);

  // Mover arquivo
  fs.renameSync(draftPath, targetPath);

  return {
    filepath: targetPath,
    filename,
    published: true
  };
}
