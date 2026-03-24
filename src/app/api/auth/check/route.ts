import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '../../../../lib/cloudflare/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await verifySession(accessToken);

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
