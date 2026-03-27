/**
 * POST /api/comments — Create a comment with Turnstile verification
 */
import { NextRequest, NextResponse } from 'next/server';
import { createComment } from '@/lib/cloudflare';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('❌ TURNSTILE_SECRET_KEY not configured');
    return false;
  }

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    });

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };

    if (!data.success) {
      console.warn('⚠️ Turnstile verification failed:', data['error-codes']);
    }

    return data.success;
  } catch (error) {
    console.error('❌ Turnstile verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { postSlug, authorName, authorEmail, authorWebsite, content, turnstileToken } = json;

    // --- Validate required fields ---
    if (!postSlug || !authorName?.trim() || !authorEmail?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (content.trim().length < 10) {
      return NextResponse.json({ error: 'Comment too short' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // --- Verify Turnstile token ---
    if (!turnstileToken) {
      return NextResponse.json({ error: 'CAPTCHA verification required' }, { status: 400 });
    }

    const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || undefined;
    const verified = await verifyTurnstileToken(turnstileToken, clientIp ?? undefined);

    if (!verified) {
      return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 403 });
    }

    // --- Create comment ---
    const comment = await createComment({
      postSlug,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      authorWebsite: authorWebsite?.trim() || undefined,
      content: content.trim(),
      userIp: clientIp ?? undefined,
    });

    if (!comment) {
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error('❌ Comment API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
