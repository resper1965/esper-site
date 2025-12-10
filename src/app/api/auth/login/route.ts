import { NextResponse } from 'next/server';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Validação básica
    if (!password) {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar variável de ambiente
    if (!process.env.ADMIN_PASSWORD) {
      console.error('❌ ADMIN_PASSWORD não configurado');
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta' },
        { status: 500 }
      );
    }

    // Verificar senha
    const isValid = verifyPassword(password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Criar sessão
    await createSession();

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    );
  }
}
