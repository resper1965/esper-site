import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/requireAuth';
import { generateChatCompletion } from '@/lib/cloudflare/ai-gateway';

// Sem `export const runtime = 'edge'`: no Cloudflare Workers a aplicação
// inteira já roda no runtime de edge, e a declaração quebra o bundler do
// OpenNext, que exige funções edge em bundles separados.

const SYSTEM_PROMPT = `You are a helpful AI assistant for the admin of esper.blog — a cybersecurity blog by Ricardo Esper. You can help with content ideas, technical questions, SEO, blog management, and general tasks. Be concise and professional. Respond in the language of the user's message.`;

const ALLOWED_MODELS = [
  '@cf/meta/llama-3.1-8b-instruct-fast',
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
] as const;

type AllowedModel = (typeof ALLOWED_MODELS)[number];

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { messages, model: rawModel } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const model: AllowedModel = ALLOWED_MODELS.includes(rawModel)
      ? rawModel
      : '@cf/meta/llama-3.1-8b-instruct-fast';

    const result = await generateChatCompletion({
      model,
      temperature: 0.7,
      maxTokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
          .map((message: { role?: string; parts?: Array<{ type?: string; text?: string }>; content?: string }) => {
            const textFromParts = Array.isArray(message.parts)
              ? message.parts
                  .filter((part) => part.type === 'text' && typeof part.text === 'string')
                  .map((part) => part.text)
                  .join('')
              : '';

            const content = textFromParts || message.content || '';
            const role = message.role === 'assistant' ? 'assistant' : 'user';

            return content.trim() ? { role, content } : null;
          })
          .filter((message): message is { role: 'assistant' | 'user'; content: string } => message !== null)
          .slice(-10),
      ],
    });

    return NextResponse.json({ message: result.text, model: result.model });
  } catch (error) {
    logger.error('Admin chat API error', { error });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
