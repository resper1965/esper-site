# Como Configurar AI Gateway no Painel da Vercel

**Data:** 2025-01-XX

---

## 📋 Passo a Passo

### **1. Acessar o Painel da Vercel**

1. Acesse: https://vercel.com/nessbr-projects/esper-site
2. Vá em **Settings** → **Environment Variables**

Ou diretamente:
https://vercel.com/nessbr-projects/esper-site/settings/environment-variables

---

### **2. Adicionar Variável de Ambiente**

1. Clique em **Add New**
2. Preencha:
   - **Key:** `AI_GATEWAY_API_KEY`
   - **Value:** `vck_7JkSgPjvfHeptmzOfDfbGMJjkS4FkwKyUaWKMhTXrdmVs8aWXZ43BOGJ`
   - **Environments:** Selecione todos:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
3. Clique em **Save**

---

### **3. Verificar Configuração**

Após adicionar, você verá:
- ✅ `AI_GATEWAY_API_KEY` listada
- ✅ Status: Encrypted
- ✅ Ambientes: Production, Preview, Development

---

### **4. Acessar AI Gateway Dashboard**

Para monitorar uso e custos:

1. Acesse: https://vercel.com/nessbr-projects/esper-site/ai-gateway
2. Ou: **Project** → **AI Gateway** (no menu lateral)

No dashboard você verá:
- 📊 **Usage**: Requisições, tokens, custos
- 📈 **Metrics**: TTFT (Time to First Token), duração
- 🔄 **Models**: Uso por modelo (Gemini, Claude, GPT)
- 💰 **Spend**: Gastos por provider

---

### **5. Configurar Budgets (Opcional)**

1. No dashboard do AI Gateway, vá em **Settings**
2. Configure **Spend Limits** se desejar
3. Configure **Alerts** para notificações

---

## ✅ Verificação

Após configurar, a aplicação usará automaticamente o AI Gateway para:
- ✅ Geração de posts bilíngues
- ✅ Análise de tópicos
- ✅ Geração de descrições visuais
- ✅ Auto-geração diária de posts

---

## 🔗 Links Úteis

- **Environment Variables:** https://vercel.com/nessbr-projects/esper-site/settings/environment-variables
- **AI Gateway Dashboard:** https://vercel.com/nessbr-projects/esper-site/ai-gateway
- **Documentação:** https://vercel.com/docs/ai-gateway

---

**Última Atualização:** 2025-01-XX

