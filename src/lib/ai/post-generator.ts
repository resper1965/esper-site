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
  language?: 'pt-BR' | 'en';
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
1. **Gancho Atual** (150-200 palavras)
   - Comece com notícia recente, tendência de mercado ou caso emblemático
   - Conecte com impacto nos negócios ou sociedade
   - Estabeleça relevância imediata

2. **Contexto e Magnitude** (300-400 palavras)
   - Dimensione o problema: números, estatísticas, impacto financeiro
   - Explique por que C-levels e profissionais devem se importar AGORA
   - Conecte com tendências (IA, Cloud, Regulamentação, ESG)

3. **Análise Técnica Acessível** (500-700 palavras)
   - Explique a tecnologia/ameaça com clareza profissional
   - Use termos atuais (Zero Trust, Supply Chain Attack, Ransomware-as-a-Service)
   - Pode incluir exemplos de código SIMPLES se agregar valor
   - Foco em "como funciona" e "por que importa"

4. **Caso Real ou Cenário** (400-500 palavras)
   - História de consultoria, incidente público ou simulação realista
   - Mostre consequências: financeiras, reputacionais, operacionais
   - Anonimize mas seja específico nos aprendizados

5. **Estratégias e Recomendações** (400-500 palavras)
   - Para indivíduos: ações práticas e imediatas
   - Para organizações: roadmap estratégico, frameworks (NIST, ISO)
   - Mencione ferramentas/soluções quando relevante
   - Balanceie quick wins com visão de longo prazo

6. **Visão de Futuro** (200-300 palavras)
   - Tendências emergentes (IA Generativa, Quantum, Regulação)
   - Perspectiva de quem viu 34 anos de evolução
   - Otimismo pragmático

7. **Call to Action**
   - Convite para discussão no LinkedIn
   - Oferta de valor (whitepaper, consultoria, networking)

# REQUISITOS
- **Público-Alvo**: C-level, gestores de TI, profissionais de segurança, empresários modernos
- **Tom**: Profissional sofisticado mas acessível (6.5/10 formalidade)
- **Linguagem**: Executiva, atual, fundamentada. Use jargão quando apropriado mas explique.
- **Temas Atuais**: IA, Deepfakes, Supply Chain, Regulação (LGPD/GDPR), Zero Trust, Cloud Security
- **Comprimento**: 1800-2200 palavras
- **Código**: Permitido se simples e ilustrativo (ex: exemplo de phishing, configuração básica)
- **Dados**: Use estatísticas, pesquisas, relatórios de mercado quando possível

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
thumbnail: "/thumbnails/[categoria].png"
thumbnailPrompt: "[Prompt minimalista para geração de thumbnail - máximo 50 palavras]"
---
\`\`\`

# PROMPT DE THUMBNAIL
Inclua um campo "thumbnailPrompt" com uma descrição simples e minimalista para gerar a imagem de capa:
- Estilo: Minimalista, elegante, moderno
- Elementos: Máximo 2-3 elementos visuais
- Cores: Escala de cinza (gray-950 #030712 como base escura) com acento cyan (#00ade8)
- Composição: Clean, espaço negativo abundante, tipografia moderna
- Evitar: Pessoas, elementos muito detalhados, múltiplas cores
- Exemplo: "Abstract geometric lock icon in cyan on dark gray-950 background, minimal composition, modern tech aesthetic"

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
