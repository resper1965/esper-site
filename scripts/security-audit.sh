#!/bin/bash

echo "🔒 Análise de Segurança Completa - Ricardo Esper Blog"
echo "=================================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
ISSUES=0
WARNINGS=0
PASSED=0

# Função para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        ((ISSUES++))
        return 1
    fi
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "1. Verificando Vulnerabilidades de Dependências (npm audit)"
echo "------------------------------------------------------------"
npm audit --audit-level=moderate > /tmp/npm-audit.txt 2>&1
if [ $? -eq 0 ]; then
    check "Nenhuma vulnerabilidade encontrada"
else
    warn "Vulnerabilidades encontradas (ver /tmp/npm-audit.txt)"
    cat /tmp/npm-audit.txt | grep -A 5 "moderate\|high\|critical" | head -20
fi
echo ""

echo "2. Verificando Headers de Segurança (next.config.ts)"
echo "-----------------------------------------------------"
if grep -q "Content-Security-Policy" next.config.ts; then
    check "CSP header configurado"
else
    warn "CSP header não encontrado"
fi

if grep -q "Strict-Transport-Security" next.config.ts; then
    check "HSTS header configurado"
else
    warn "HSTS header não encontrado"
fi

if grep -q "X-Content-Type-Options" next.config.ts; then
    check "X-Content-Type-Options configurado"
else
    warn "X-Content-Type-Options não encontrado"
fi

if grep -q "X-Frame-Options" next.config.ts; then
    check "X-Frame-Options configurado"
else
    warn "X-Frame-Options não encontrado"
fi

if grep -q "Referrer-Policy" next.config.ts; then
    check "Referrer-Policy configurado"
else
    warn "Referrer-Policy não encontrado"
fi

if grep -q "poweredByHeader.*false" next.config.ts; then
    check "poweredByHeader desabilitado"
else
    warn "poweredByHeader pode estar exposto"
fi
echo ""

echo "3. Verificando Exposição de Secrets"
echo "------------------------------------"
if grep -r "sk-" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -v "test" | grep -v "mask-image" | grep -v "linear-gradient" > /dev/null; then
    warn "Possível secret encontrado no código"
    grep -r "sk-" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -v "mask-image" | grep -v "linear-gradient" | head -5
else
    check "Nenhum secret exposto no código"
fi

if grep -r "AI_GATEWAY_API_KEY\|GEMINI_API_KEY\|ANTHROPIC_API_KEY" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v "process.env" | grep -v "getSetting" > /dev/null; then
    warn "Possível hardcoded API key encontrado"
else
    check "API keys não estão hardcoded"
fi
echo ""

echo "4. Verificando Autenticação e Autorização"
echo "-------------------------------------------"
if grep -q "checkSupabaseAuth\|getUser" src/middleware.ts; then
    check "Middleware verifica autenticação"
else
    warn "Middleware pode não verificar autenticação"
fi

if grep -q "RLS\|ROW LEVEL SECURITY" supabase/schema.sql 2>/dev/null || grep -q "RLS\|ROW LEVEL SECURITY" supabase/migrations/*.sql 2>/dev/null; then
    check "RLS configurado no Supabase"
else
    warn "RLS pode não estar configurado"
fi
echo ""

echo "5. Verificando SQL Injection"
echo "-----------------------------"
if grep -r "\.query\|\.execute" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v "supabase" | grep -v "node_modules" > /dev/null; then
    warn "Possível uso de queries SQL diretas (verificar se usa prepared statements)"
else
    check "Usando Supabase client (proteção contra SQL injection)"
fi
echo ""

echo "6. Verificando XSS Protection"
echo "-----------------------------"
DANGEROUS_COUNT=$(grep -r "dangerouslySetInnerHTML" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "JSON.stringify" | wc -l)
if [ "$DANGEROUS_COUNT" -gt 0 ]; then
    warn "dangerouslySetInnerHTML encontrado (verificar sanitização)"
    grep -r "dangerouslySetInnerHTML" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "JSON.stringify" | head -3
    info "Nota: JSON.stringify é seguro para JSON-LD"
else
    check "Nenhum uso inseguro de dangerouslySetInnerHTML encontrado"
fi
echo ""

echo "7. Verificando security.txt"
echo "----------------------------"
if [ -f "public/.well-known/security.txt" ]; then
    check "security.txt existe"
    if grep -q "Contact:" public/.well-known/security.txt; then
        check "security.txt tem contato configurado"
    fi
else
    warn "security.txt não encontrado"
fi
echo ""

echo "8. Verificando .env files no git"
echo "----------------------------------"
if grep -q "\.env" .gitignore; then
    check ".env está no .gitignore"
else
    warn ".env pode não estar no .gitignore"
fi
echo ""

echo "9. Verificando Dependências Desatualizadas"
echo "--------------------------------------------"
npm outdated --json > /tmp/npm-outdated.json 2>&1
OUTDATED_COUNT=$(cat /tmp/npm-outdated.json | jq 'length' 2>/dev/null || echo "0")
if [ "$OUTDATED_COUNT" -gt 0 ]; then
    warn "$OUTDATED_COUNT dependências desatualizadas"
    info "Execute 'npm outdated' para ver detalhes"
else
    check "Todas as dependências estão atualizadas"
fi
echo ""

echo "10. Verificando TypeScript Strict Mode"
echo "---------------------------------------"
if grep -q '"strict":\s*true' tsconfig.json; then
    check "TypeScript strict mode habilitado"
else
    warn "TypeScript strict mode pode não estar habilitado"
fi
echo ""

echo "=================================================="
echo "📊 Resumo da Análise"
echo "=================================================="
echo -e "${GREEN}✅ Passou: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Avisos: $WARNINGS${NC}"
echo -e "${RED}❌ Problemas: $ISSUES${NC}"
echo ""

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Nenhum problema crítico encontrado!${NC}"
    exit 0
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Alguns avisos, mas nada crítico${NC}"
    exit 0
else
    echo -e "${RED}❌ Problemas encontrados que precisam atenção${NC}"
    exit 1
fi

