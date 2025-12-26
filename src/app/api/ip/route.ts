import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Obter IP do usuário
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  return NextResponse.json({ ip });
}
