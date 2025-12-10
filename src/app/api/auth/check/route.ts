import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    const isAuthenticated = await verifySession();
    return NextResponse.json({ authenticated: isAuthenticated });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return NextResponse.json({ authenticated: false });
  }
}
