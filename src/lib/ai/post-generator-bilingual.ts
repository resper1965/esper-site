import fs from 'fs';
import path from 'path';
import { generateTextWithGemini } from './ai-gateway-client';

const RICARDO_PROFILE = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'src/lib/ai/ricardo-profile.json'), 'utf-8')
);

interface VoiceProfile {
  tone: string;
  formality: number;
  perspective: {
    experience: string;
    analysis: string;
  };
  personality: string[];
  phrases: string[];
  opening: string[];
}

interface GeneratePostParams {
  topic: string;
  category: string;
  sources: Array<{ title: string; url: string; summary: string }>;
  keywords?: string[];
  language: 'pt-BR' | 'en';
}

export async function generateBilingualPost(params: Omit<GeneratePostParams, 'language'>) {
  console.log('🌍 Gerando post em PT-BR e EN...');

  // Generate PT-BR version
  const ptPost = await generateSinglePost({ ...params, language: 'pt-BR' });
  console.log('✅ Post PT-BR gerado');

  // Generate EN version
  const enPost = await generateSinglePost({ ...params, language: 'en' });
  console.log('✅ Post EN gerado');

  return {
    ptBR: ptPost,
    en: enPost,
  };
}

async function generateSinglePost(params: GeneratePostParams) {
  const { topic, category, sources, keywords = [], language } = params;
  const isEnglish = language === 'en';

  // Selecionar voz baseada na categoria
  const voiceProfiles = RICARDO_PROFILE.voice as Record<string, VoiceProfile>;
  const voiceProfile: VoiceProfile = voiceProfiles[category] || voiceProfiles.default || voiceProfiles;

  const languageInstructions = isEnglish
    ? `
# LANGUAGE: ENGLISH
Write the ENTIRE post in ENGLISH. All content, titles, and metadata must be in English.

# TONE ADJUSTMENTS FOR ENGLISH:
- Use "I" instead of "Eu" for personal experiences
- Professional yet approachable tone (${voiceProfile.formality}/10 formality)
- Executive language, current, grounded
- Use jargon when appropriate but explain
- Characteristic phrases for this category: ${voiceProfile.phrases.slice(0, 5).join(', ')}
- Opening styles for this category:
${voiceProfile.opening.map((o: string) => `  - ${o}`).join('\n')}
  - "In my 34 years leading NESS..."
  - "As CISO of IONIC Health..."
  - "At 60, as a father of two daughters..."
`
    : `
# IDIOMA: PORTUGUÊS BRASILEIRO
Escreva TODO o post em PORTUGUÊS BRASILEIRO. Todo conteúdo, títulos e metadados devem estar em português.
`;

  const structureSection = isEnglish
    ? `
# REQUIRED STRUCTURE
1. **Current Hook** (150-200 words)
   - Start with recent news, market trend, or emblematic case
   - Connect with business or societal impact
   - Establish immediate relevance

2. **Context and Magnitude** (300-400 words)
   - Scale the problem: numbers, statistics, financial impact
   - Explain why C-levels and professionals should care NOW
   - Connect with trends (AI, Cloud, Regulation, ESG)

3. **Accessible Technical Analysis** (500-700 words)
   - Explain technology/threat with professional clarity
   - Use current terms (Zero Trust, Supply Chain Attack, Ransomware-as-a-Service)
   - Can include SIMPLE code examples if adds value
   - Focus on "how it works" and "why it matters"

4. **Real Case or Scenario** (400-500 words)
   - Consulting story, public incident, or realistic simulation
   - Show consequences: financial, reputational, operational
   - Anonymize but be specific about learnings

5. **Strategies and Recommendations** (400-500 words)
   - For individuals: practical and immediate actions
   - For organizations: strategic roadmap, frameworks (NIST, ISO)
   - Mention tools/solutions when relevant
   - Balance quick wins with long-term vision

6. **Future Vision** (200-300 palavras)
   - Emerging trends (Generative AI, Quantum, Regulation)
   - Perspective from someone who saw 34 years of evolution
   - Pragmatic optimism

7. **Call to Action**
   - Invitation to discuss on LinkedIn
   - Value offer (whitepaper, consulting, networking)

# REQUIREMENTS
- **Target Audience**: C-level, IT managers, security professionals, modern entrepreneurs
- **Tone**: Sophisticated yet accessible professional (6.5/10 formality)
- **Language**: Executive, current, grounded
- **Length**: 1800-2200 words
- **Code**: Allowed if simple and illustrative
- **Data**: Use statistics, research, market reports when possible
`
    : `
# ESTRUTURA OBRIGATÓRIA
1. **Gancho Atual** (150-200 palavras)
2. **Contexto e Magnitude** (300-400 palavras)
3. **Análise Técnica Acessível** (500-700 palavras)
4. **Caso Real ou Cenário** (400-500 palavras)
5. **Estratégias e Recomendações** (400-500 palavras)
6. **Visão de Futuro** (200-300 palavras)
7. **Call to Action**

# REQUISITOS
- **Público-Alvo**: C-level, gestores de TI, profissionais de segurança
- **Tom**: Profissional sofisticado mas acessível (6.5/10 formalidade)
- **Comprimento**: 1800-2200 palavras
`;

  const prompt = `
You are Ricardo Esper writing a post for your professional cybersecurity blog.

${languageInstructions}

# IDENTITY
${JSON.stringify(RICARDO_PROFILE.identity, null, 2)}

# VOICE (specific for category "${category}")
- Formality level: ${voiceProfile.formality}/10
- Tone: ${voiceProfile.tone}
- Perspective: ${voiceProfile.perspective.experience} for experiences, ${voiceProfile.perspective.analysis} for analysis
- Personality: ${voiceProfile.personality.join(', ')}
- Characteristic phrases: ${voiceProfile.phrases.slice(0, 5).join(', ')}

# TOPIC
${topic}

# CATEGORY
${category}

# VERIFIED SOURCES (cite when relevant)
${sources.map(s => `- ${s.title} (${s.url})\n  ${s.summary}`).join('\n')}

# SEO KEYWORDS
${keywords.join(', ')}

${structureSection}

# FRONTMATTER YAML
\`\`\`yaml
---
title: "${isEnglish ? '[Catchy and popular title in English]' : '[Título chamativo e popular]'}"
slug: "${isEnglish ? '[slug-kebab-case-english]' : '[slug-kebab-case]'}"
date: "${new Date().toISOString().split('T')[0]}"
category: "${category}"
language: "${language}"
excerpt: "${isEnglish ? '[Summary that generates curiosity and immediate identification]' : '[Resumo que gera curiosidade e identificação imediata]'}"
author: "Ricardo Esper"
keywords: [${keywords.map(k => '"' + k + '"').join(', ')}]
generatedBy: "ai"
sources: [${sources.map(s => '"' + s.url + '"').join(', ')}]
thumbnail: "/thumbnails/${category.toLowerCase()}.png"
thumbnailPrompt: "${isEnglish ? '[Minimalist prompt for thumbnail generation - max 50 words]' : '[Prompt minimalista para geração de thumbnail - máximo 50 palavras]'}"
---
\`\`\`

# THUMBNAIL PROMPT
${isEnglish ? `
Include a "thumbnailPrompt" field with a simple, minimalist description for cover image generation:
- Style: Minimalist, elegant, modern
- Elements: Maximum 2-3 visual elements
- Colors: Gray scale (gray-950 #030712 as dark base) with cyan accent (#00ade8)
- Composition: Clean, abundant negative space, modern typography
- Avoid: People, very detailed elements, multiple colors
- Example: "Abstract geometric lock icon in cyan on dark gray-950 background, minimal composition, modern tech aesthetic"
` : `
Inclua um campo "thumbnailPrompt" com uma descrição simples e minimalista para gerar a imagem de capa:
- Estilo: Minimalista, elegante, moderno
- Elementos: Máximo 2-3 elementos visuais
- Cores: Escala de cinza (gray-950 #030712 como base escura) com acento cyan (#00ade8)
- Composição: Clean, espaço negativo abundante, tipografia moderna
- Evitar: Pessoas, elementos muito detalhados, múltiplas cores
- Exemplo: "Abstract geometric lock icon in cyan on dark gray-950 background, minimal composition, modern tech aesthetic"
`}

# OUTPUT
${isEnglish
    ? 'Generate ONLY the complete post in Markdown with frontmatter IN ENGLISH.\nDO NOT include meta-comments.\nALL content must be in ENGLISH.'
    : 'Gere APENAS o post completo em Markdown com frontmatter EM PORTUGUÊS.\nNÃO inclua meta-comentários.\nTODO conteúdo deve estar em PORTUGUÊS.'
  }
`;

  try {
    const systemPrompt = isEnglish
      ? `You are Ricardo Esper, cybersecurity expert with 34 years of experience, CEO of NESS, CISO of IONIC Health, father of two daughters, 60 years old. Always write in first person, with a professional but accessible tone, based on real experience. Write everything in ENGLISH.`
      : `Você é Ricardo Esper, especialista em cibersegurança com 34 anos de experiência, CEO da NESS, CISO da IONIC Health, pai de duas filhas, 60 anos. Escreva sempre em primeira pessoa, com tom profissional mas acessível, baseado em experiência real. Escreva tudo em PORTUGUÊS BRASILEIRO.`;

    const result = await generateTextWithGemini(
      prompt,
      systemPrompt,
      'gemini-1.5-pro'
    );

    const content = result.text;

    const score = await evaluateQuality(content, language);

    return {
      content,
      score,
      language,
      metadata: {
        topic,
        category,
        sources: sources.map(s => s.url),
        generatedAt: new Date().toISOString(),
        model: 'gemini-1.5-pro',
        tokensUsed: result.tokensUsed
      }
    };
  } catch (error) {
    console.error(`Erro ao gerar post ${language}:`, error);
    throw error;
  }
}

async function evaluateQuality(content: string, language: 'pt-BR' | 'en'): Promise<number> {
  const checks = {
    hasProperLength: content.length >= 8000 && content.length <= 15000,
    hasFrontmatter: content.includes('---') && content.includes('title:'),
    hasLanguageField: content.includes(`language: "${language}"`),
    hasPersonalExperience: language === 'en'
      ? /In my|At 60|as a father|34 years/i.test(content)
      : /em meus|aos 60 anos|como pai|34 anos/i.test(content),
    hasPracticalCase: /case|example|situation|experience|caso|exemplo|situação|experiência/i.test(content),
    hasRecommendations: /recommend|suggest|important|essential|recomend|sugiro|importante|essencial/i.test(content),
    hasCallToAction: /linkedin|connect|share|conecte|compartilhe/i.test(content),
  };

  const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 10;
  return Math.round(score * 10) / 10;
}

import { createPost } from '@/lib/posts';
import type { PostInsert } from '@/lib/posts';
import matter from 'gray-matter';

export async function saveBilingualPosts(posts: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ptBR: { content: string; score: number; language: string; metadata: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  en: { content: string; score: number; language: string; metadata: any };
}) {
  // Parse PT-BR post
  const { data: ptFrontmatter, content: ptContent } = matter(posts.ptBR.content);
  const ptSlug = ptFrontmatter.slug || `draft-pt-${Date.now()}`;

  // Parse EN post
  const { data: enFrontmatter, content: enContent } = matter(posts.en.content);
  const enSlug = enFrontmatter.slug || `draft-en-${Date.now()}`;

  // Prepare PT-BR post data for D1
  const ptPostData: PostInsert = {
    slug: ptSlug,
    title: ptFrontmatter.title || 'Post sem título',
    content: ptContent,
    excerpt: ptFrontmatter.excerpt || '',
    description: ptFrontmatter.description || ptFrontmatter.excerpt || '',
    category: ptFrontmatter.category || 'general',
    language: 'pt-br',
    author: ptFrontmatter.author || 'Ricardo Esper',
    cover_image: ptFrontmatter.coverImage || undefined,
    keywords: Array.isArray(ptFrontmatter.keywords) ? ptFrontmatter.keywords : ptFrontmatter.keywords ? [ptFrontmatter.keywords] : undefined,
    tags: Array.isArray(ptFrontmatter.tags) ? ptFrontmatter.tags : ptFrontmatter.tags ? [ptFrontmatter.tags] : undefined,
    date: ptFrontmatter.date || new Date().toISOString().split('T')[0],
    published: false,
    featured: ptFrontmatter.featured || false,
    read_time: ptFrontmatter.readTime || undefined,
  };

  // Prepare EN post data for D1
  const enPostData: PostInsert = {
    slug: enSlug,
    title: enFrontmatter.title || 'Untitled Post',
    content: enContent,
    excerpt: enFrontmatter.excerpt || '',
    description: enFrontmatter.description || enFrontmatter.excerpt || '',
    category: enFrontmatter.category || 'general',
    language: 'en',
    author: enFrontmatter.author || 'Ricardo Esper',
    cover_image: enFrontmatter.coverImage || undefined,
    keywords: Array.isArray(enFrontmatter.keywords) ? enFrontmatter.keywords : enFrontmatter.keywords ? [enFrontmatter.keywords] : undefined,
    tags: Array.isArray(enFrontmatter.tags) ? enFrontmatter.tags : enFrontmatter.tags ? [enFrontmatter.tags] : undefined,
    date: enFrontmatter.date || new Date().toISOString().split('T')[0],
    published: false,
    featured: enFrontmatter.featured || false,
    read_time: enFrontmatter.readTime || undefined,
  };

  // Save both posts to D1
  try {
    const ptResult = await createPost(ptPostData);
    const enResult = await createPost(enPostData);
    
    return {
      ptBR: {
        success: !!ptResult,
        slug: ptSlug,
        filepath: null, // No longer using file paths
        filename: null, // No longer using file paths
      },
      en: {
        success: !!enResult,
        slug: enSlug,
        filepath: null, // No longer using file paths
        filename: null, // No longer using file paths
      },
    };
  } catch (error) {
    console.error('Error saving bilingual posts to Supabase:', error);
    throw error;
  }
}
