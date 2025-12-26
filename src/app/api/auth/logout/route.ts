import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Remove Supabase auth cookies
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');
    
    // Also remove any legacy admin cookie if it exists
    cookieStore.delete('admin_logged_in');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar logout' },
      { status: 500 }
    );
  }
}
