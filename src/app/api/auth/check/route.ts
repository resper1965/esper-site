import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    
    // Tentar obter usuário da sessão
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Se getUser falhar, tentar verificar via cookie diretamente
      const accessToken = cookieStore.get('sb-access-token')?.value;
      if (!accessToken) {
        return NextResponse.json({ authenticated: false });
      }
      
      // Tentar validar o token
      const { data: { user: userFromToken }, error: tokenError } = await supabase.auth.getUser(accessToken);
      
      if (tokenError || !userFromToken) {
        return NextResponse.json({ authenticated: false });
      }
      
      return NextResponse.json({ authenticated: true, user: { id: userFromToken.id, email: userFromToken.email } });
    }

    return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
