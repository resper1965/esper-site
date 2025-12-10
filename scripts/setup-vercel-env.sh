#!/bin/bash

# Script para configurar GEMINI_API_KEY na Vercel
# Uso: ./scripts/setup-vercel-env.sh [GEMINI_API_KEY]

GEMINI_KEY="${1:-${GEMINI_API_KEY}}"

if [ -z "$GEMINI_KEY" ]; then
    echo "❌ Erro: GEMINI_API_KEY não fornecida"
    echo ""
    echo "Uso:"
    echo "  ./scripts/setup-vercel-env.sh sua-chave-aqui"
    echo "  ou"
    echo "  GEMINI_API_KEY=sua-chave ./scripts/setup-vercel-env.sh"
    echo ""
    exit 1
fi

echo "🔧 Configurando GEMINI_API_KEY na Vercel..."
echo ""

# Adicionar para Production
echo "📦 Adicionando para Production..."
echo "$GEMINI_KEY" | vercel env add GEMINI_API_KEY production

# Adicionar para Preview
echo "📦 Adicionando para Preview..."
echo "$GEMINI_KEY" | vercel env add GEMINI_API_KEY preview

# Adicionar para Development
echo "📦 Adicionando para Development..."
echo "$GEMINI_KEY" | vercel env add GEMINI_API_KEY development

echo ""
echo "✅ GEMINI_API_KEY configurada na Vercel para todos os ambientes!"
echo ""
echo "💡 Para verificar: vercel env ls"

