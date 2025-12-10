#!/bin/bash

# Script para adicionar GEMINI_API_KEY na Vercel
# Uso: ./scripts/add-gemini-key-vercel.sh [sua-chave-gemini]

set -e

GEMINI_KEY="${1}"

if [ -z "$GEMINI_KEY" ]; then
    echo "❌ Erro: Forneça a GEMINI_API_KEY como argumento"
    echo ""
    echo "Uso:"
    echo "  ./scripts/add-gemini-key-vercel.sh AIza..."
    echo ""
    exit 1
fi

echo "🔧 Configurando GEMINI_API_KEY na Vercel..."
echo ""

# Adicionar para Production
echo "📦 Adicionando para Production..."
echo "$GEMINI_KEY" | vercel env add GEMINI_API_KEY production --yes

# Adicionar para Preview  
echo "📦 Adicionando para Preview..."
echo "$GEMINI_KEY" | vercel env add GEMINI_API_KEY preview --yes

# Adicionar para Development
echo "📦 Adicionando para Development..."
echo "$GEMINI_KEY" | vercel env add GEMINI_API_KEY development --yes

echo ""
echo "✅ GEMINI_API_KEY configurada na Vercel!"
echo ""
echo "💡 Para verificar: vercel env ls | grep GEMINI"

