# 🚀 Início Rápido - Geração de Imagens

## ⚡ 3 Passos para Gerar Todas as Imagens

### 1. Inicie o servidor

```bash
npm run dev
```

### 2. Abra o navegador

```
http://localhost:3000/admin/generate
```

### 3. Gere as imagens

1. Role a página até encontrar **"🎨 Gerador de Imagens"**
2. Clique no botão **"🎨 Gerar Todas as Imagens"**
3. Aguarde 1-3 minutos
4. ✅ Pronto! As imagens estão em `public/images/`

---

## 📸 O Que Você Vai Ter

✅ **25 imagens PNG** (1200x630px)  
✅ **Design em escala de cinza** (discreto e elegante)  
✅ **Pronto para redes sociais** (Open Graph otimizado)  
✅ **Nomeadas por slug** do post  

---

## 🎨 Exemplo de Imagem

```
┌────────────────────────────────────┐
│ [fundo cinza escuro]               │
│                                    │
│ CIBERSEGURANÇA                     │
│                                    │
│ Phishing: What It Is               │
│ and How to Avoid It                │
│                                    │
│ ─────                              │
│                                    │
│ Ricardo Esper         esper.ws    │
└────────────────────────────────────┘
```

---

## 🔍 Verificar Resultados

```bash
# Listar imagens geradas
ls public/images/

# Ver tamanhos
ls -lh public/images/

# Total de imagens
ls public/images/ | wc -l
```

---

## 🌐 Ver em Produção

Após gerar, visualize no blog:

```
http://localhost:3000/blog/phishing-what-is-how-to-avoid
```

A imagem aparecerá no topo do post.

---

## 📚 Mais Informações

- **Guia Completo**: [docs/image-generation.md](docs/image-generation.md)
- **Resumo Detalhado**: [RESUMO-IMPLEMENTACAO.md](RESUMO-IMPLEMENTACAO.md)
- **Changelog**: [CHANGELOG-IMAGES.md](CHANGELOG-IMAGES.md)

---

## ❓ Problemas?

### Erro "Connection refused"
→ Certifique-se que o servidor está rodando (`npm run dev`)

### Imagens não aparecem no blog
→ Verifique se o `coverImage` no MDX aponta para `/images/[slug].png`

### Design diferente do esperado
→ Limpe o cache do navegador (Ctrl+Shift+R)

---

**Pronto! Você tem um sistema completo de geração de imagens. 🎉**
