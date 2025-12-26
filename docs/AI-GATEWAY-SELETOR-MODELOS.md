# AI Gateway - Seletor de Modelos e Chaves

**Data:** 2025-01-XX  
**Referência:** [Vercel AI Gateway Documentation](https://vercel.com/docs/ai-gateway)

---

## 🔑 Gerenciamento de Chaves

### **Ordem de Prioridade:**

1. **Supabase Settings** (via `/admin/settings`)
   - Chave armazenada na tabela `settings` do Supabase
   - Gerenciada via painel administrativo
   - Prioridade mais alta

2. **Variável de Ambiente** (`AI_GATEWAY_API_KEY`)
   - Fallback se não encontrar no Supabase
   - Útil para desenvolvimento local

### **Formato da Chave:**
```
vck_7JkSgPjvfHeptmzOfDfbGMJjkS4FkwKyUaWKMhTXrdV8aWXZ43BOGJ
```
- Prefixo: `vck_` (Vercel AI Gateway)
- Gerada no dashboard da Vercel: https://vercel.com/ai-gateway

---

## 🎯 Seletor de Modelos

### **Formato:**
```
provider/model
```

### **Exemplos:**
```typescript
// Google Gemini
'google/gemini-2.5-pro'
'google/gemini-2.5-flash'

// Anthropic Claude
'anthropic/claude-sonnet-4'
'anthropic/claude-3.5-sonnet'

// OpenAI
'openai/gpt-4o'
'openai/gpt-4o-mini'
'openai/gpt-4.1' // Exemplo do código fornecido

// xAI Grok
'xai/grok-2'
```

### **Uso no Código:**

```typescript
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// 1. Obter chave API
const apiKey = await getApiKey(); // Do Supabase ou env

// 2. Criar cliente OpenAI apontando para AI Gateway
const openai = createOpenAI({
  apiKey: apiKey,
  baseURL: 'https://ai-gateway.vercel.sh/v1', // Endpoint do AI Gateway
});

// 3. Usar seletor de modelos diretamente
const result = await generateText({
  model: openai('openai/gpt-4.1'), // Seletor: provider/model
  prompt: 'Invent a new holiday and describe its traditions.',
});
```

---

## 🔄 Como Funciona

### **1. Autenticação:**
- A chave API é passada via `createOpenAI({ apiKey })`
- O AI Gateway valida a chave automaticamente
- Não precisa passar no header manualmente

### **2. Roteamento:**
- O `baseURL: 'https://ai-gateway.vercel.sh/v1'` indica que é AI Gateway
- O formato `provider/model` no seletor indica qual provider usar
- O AI Gateway roteia automaticamente para o provider correto

### **3. Fallback:**
- Implementado manualmente em loop
- Tenta modelo principal primeiro
- Se falhar, tenta fallbacks em sequência

---

## 📝 Exemplo Simplificado (Como no Código Fornecido)

```typescript
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

async function main() {
  // Obter chave (do Supabase ou env)
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  
  // Criar cliente apontando para AI Gateway
  const openai = createOpenAI({
    apiKey: apiKey,
    baseURL: 'https://ai-gateway.vercel.sh/v1',
  });

  // Usar seletor diretamente
  const result = streamText({
    model: openai('openai/gpt-4.1'), // Seletor: provider/model
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  console.log();
  console.log('Token usage:', await result.usage);
  console.log('Finish reason:', await result.finishReason);
}
```

---

## 🔍 Diferenças da Implementação Atual

### **Implementação Atual:**
- ✅ Usa `createOpenAI` com `baseURL` do AI Gateway
- ✅ Passa chave API via `createOpenAI({ apiKey })`
- ✅ Usa seletor `openai('provider/model')`
- ✅ Implementa fallback manual em loop

### **Exemplo Simplificado:**
- ✅ Mesma abordagem básica
- ✅ Usa `streamText` em vez de `generateText` (para streaming)
- ✅ Não implementa fallback (exemplo básico)

### **Conclusão:**
A implementação atual está **correta** e segue o padrão do exemplo. A única diferença é que:
- Implementamos fallback manual (mais robusto)
- Gerenciamos chave via Supabase (mais flexível)
- Usamos `generateText` em vez de `streamText` (para uso síncrono)

---

## 💡 Melhorias Possíveis

### **1. Suporte a Streaming (Opcional)**
```typescript
import { streamText } from 'ai';

const result = streamText({
  model: openai('google/gemini-2.5-pro'),
  prompt: '...',
});

for await (const textPart of result.textStream) {
  // Processar texto em tempo real
}
```

### **2. Provider Options (Se Disponível)**
```typescript
// Se o AI SDK suportar providerOptions nativamente
const result = await generateText({
  model: openai('google/gemini-2.5-pro'),
  prompt: '...',
  providerOptions: {
    // Configurações de fallback (se disponível)
  },
});
```

---

## 📚 Referências

- [AI Gateway Documentation](https://vercel.com/docs/ai-gateway)
- [AI Gateway Models](https://vercel.com/ai-gateway/models)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [AI Gateway Authentication](https://vercel.com/docs/ai-gateway/authentication)

---

**Última Atualização:** 2025-01-XX

