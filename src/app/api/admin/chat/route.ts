import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/requireAuth';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are a helpful AI assistant for the admin of esper.blog — a cybersecurity blog by Ricardo Esper. You can help with content ideas, technical questions, SEO, blog management, and general tasks. Be concise and professional. Respond in the language of the user's message.`;

const ALLOWED_MODELS = [
  'google/gemini-2.5-flash',
  'google/gemini-2.5-pro',
  'anthropic/claude-sonnet-4',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
] as const;

type AllowedModel = (typeof ALLOWED_MODELS)[number];

async function getApiKey(): Promise<string> {
  const envKey = process.env.AI_GATEWAY_API_KEY;
  if (!envKey) {
    throw new Error('AI_GATEWAY_API_KEY not configured');
  }
  return envKey;
}

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
      : 'google/gemini-2.5-flash';

    const apiKey = await getApiKey();

    const openai = createOpenAI({
      apiKey,
      baseURL: 'https://ai-gateway.vercel.sh/v1',
    });

    const result = streamText({
      model: openai(model),
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.7,
      maxOutputTokens: 4096,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    logger.error('Admin chat API error', { error });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
