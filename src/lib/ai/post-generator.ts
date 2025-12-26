import fs from 'fs';
import path from 'path';
import { generatePostImage } from './image-generator-gemini';
import { generateTextWithGemini } from './ai-gateway-client';
import matter from 'gray-matter';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/database.types';

type PostInsert = Database['public']['Tables']['posts']['Insert'];

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

export async function generatePost(params: GeneratePostParams) {
  const { topic, category, sources, keywords = [] } = params;

  // Selecionar voz baseada na categoria
  const voiceProfiles = RICARDO_PROFILE.voice as Record<string, VoiceProfile>;
  const voiceProfile: VoiceProfile = voiceProfiles[category] || voiceProfiles.default || voiceProfiles;

  // Construir prompt com perfil do Ricardo
  const prompt = `
Você é Ricardo Esper escrevendo um post para seu blog profissional.

# IDENTIDADE
${JSON.stringify(RICARDO_PROFILE.identity, null, 2)}

# TOM DE VOZ (específico para categoria "${category}")
- Nível de formalidade: ${voiceProfile.formality}/10
- Tom: ${voiceProfile.tone}
- Perspectiva: ${voiceProfile.perspective.experience} para experiências, ${voiceProfile.perspective.analysis} para análises
- Personalidade: ${voiceProfile.personality.join(', ')}

# FRASES CARACTERÍSTICAS (use naturalmente, especialmente para esta categoria)
${voiceProfile.phrases.map((p: string) => '- "' + p + '"').join('\n')}

# ABERTURAS TÍPICAS (escolha uma adequada para esta categoria)
${voiceProfile.opening.map((o: string) => '- ' + o).join('\n')}

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

# REQUISITOS ESPECÍFICOS POR CATEGORIA
${category === 'vida' ? `
- **Tom**: Mais positivo, charmoso, ligeiramente irônico e engraçado. Menos profissional, mais pessoal.
- **Linguagem**: Conversacional, autêntica, com toques de humor sutil. Evite jargão corporativo.
- **Abordagem**: Reflexiva, baseada em experiências pessoais. Use ironia gentil e observações engraçadas.
- **Comprimento**: 1500-2000 palavras (pode ser mais curto e direto)
` : `
- **Público-Alvo**: C-level, gestores de TI, profissionais de segurança, empresários modernos
- **Tom**: Profissional sofisticado mas acessível (${voiceProfile.formality}/10 formalidade)
- **Linguagem**: Executiva, atual, fundamentada. Use jargão quando apropriado mas explique.
- **Temas Atuais**: IA, Deepfakes, Supply Chain, Regulação (LGPD/GDPR), Zero Trust, Cloud Security
- **Comprimento**: 1800-2200 palavras
- **Código**: Permitido se simples e ilustrativo (ex: exemplo de phishing, configuração básica)
`}
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
    const systemPrompt = `Você é Ricardo Esper, especialista em cibersegurança com 34 anos de experiência, CEO da NESS, CISO da IONIC Health, pai de duas filhas, 60 anos. Escreva sempre em primeira pessoa, com tom profissional mas acessível, baseado em experiência real.`;

    const result = await generateTextWithGemini(
      prompt,
      systemPrompt,
      'gemini-1.5-pro'
    );

    const content = result.text;

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
        model: 'gemini-1.5-pro',
        tokensUsed: result.tokensUsed
      }
    };
  } catch (error) {
    console.error('Erro ao gerar post:', error);
    throw error;
  }
}

async function evaluateQuality(content: string): Promise<number> {
  // Get phrases from profile (could be in voice.default or in root)
  const voiceProfile = RICARDO_PROFILE.voice?.default || {};
  const phrases: string[] = voiceProfile.phrases || [];

  // Critérios de qualidade
  const checks = {
    hasProperLength: content.length >= 8000 && content.length <= 15000, // ~2000-2500 palavras
    hasFrontmatter: content.includes('---') && content.includes('title:'),
    hasCharacteristicPhrases: phrases.length > 0 && phrases.some((phrase: string) =>
      content.toLowerCase().includes(phrase.toLowerCase())
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
export async function savePostDraft(post: { content: string; score: number; metadata: any }, categoryOverride?: string) {
  // Extrair frontmatter usando gray-matter
  const { data: frontmatter, content: postContent } = matter(post.content);
  const slug = frontmatter.slug || `draft-${Date.now()}`;
  // Garantir que categoria nunca seja vazia ou apenas espaços
  const rawCategory = categoryOverride || frontmatter.category || 'general';
  const category = (rawCategory && rawCategory.trim() !== '') ? rawCategory.trim() : 'general';

  // Gerar imagem se houver thumbnailPrompt
  let coverImagePath: string | undefined;
  if (frontmatter.thumbnailPrompt) {
    try {
      console.log('🎨 Gerando imagem de capa conectada ao tema...');
      
      coverImagePath = await generatePostImage(
        frontmatter.thumbnailPrompt,
        slug,
        frontmatter.title || 'Post',
        postContent,
        frontmatter.excerpt || '',
        category,
        frontmatter.keywords || []
      );
      console.log('✅ Imagem de capa gerada:', coverImagePath);
    } catch (error) {
      console.error('⚠️ Erro ao gerar imagem (continuando sem imagem):', error);
    }
  }

  // Criar alt text descritivo para SEO
  const imageAlt = coverImagePath 
    ? `${frontmatter.title} - ${category} - ${frontmatter.excerpt || 'Post sobre cibersegurança'}`
    : null;

  // Preparar dados para inserção no banco (Supabase format)
  const postData: PostInsert = {
    slug,
    title: frontmatter.title || 'Post sem título',
    content: postContent, // Apenas o conteúdo, sem frontmatter
    excerpt: frontmatter.excerpt || '',
    description: frontmatter.description || frontmatter.excerpt || '',
    category,
    language: frontmatter.language || 'pt-br',
    author: frontmatter.author || 'Ricardo Esper',
    cover_image: coverImagePath || null,
    image_alt: imageAlt,
    keywords: frontmatter.keywords || null,
    tags: frontmatter.tags || null,
    date: frontmatter.date || new Date().toISOString().split('T')[0],
    published: false, // Draft por padrão
    featured: frontmatter.featured || false,
    read_time: frontmatter.readTime || null,
    generated_by: 'ai',
    score: post.score,
    sources: post.metadata.sources || null,
  };

  // Verificar se já existe (update) ou criar novo
  const { data: existing } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    // Atualizar post existente
    await supabase
      .from('posts')
      .update({
        ...postData,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);
    console.log(`✅ Draft atualizado: ${slug}`);
  } else {
    // Criar novo draft
    await supabase
      .from('posts')
      .insert([postData]);
    console.log(`✅ Draft criado: ${slug}`);
  }

  return {
    slug,
    coverImage: coverImagePath,
    thumbnailPrompt: frontmatter.thumbnailPrompt
  };
}

export async function publishPost(slug: string) {
  // Buscar post no banco
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .single();

  if (fetchError || !post) {
    throw new Error(`Post com slug "${slug}" não encontrado`);
  }

  // Atualizar status para publicado
  const { error: updateError } = await supabase
    .from('posts')
    .update({
      published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug);

  if (updateError) {
    throw new Error(`Erro ao publicar post: ${updateError.message}`);
  }

  console.log(`✅ Post publicado: ${slug}`);

  return {
    slug,
    published: true,
    publishedAt: new Date().toISOString(),
  };
}
