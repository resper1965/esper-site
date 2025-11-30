# Internacionalização (i18n) - Implementação

## 📋 Visão Geral

O site agora possui suporte completo para **Português (PT-BR)** e **Inglês (EN)** com detecção automática baseada no idioma do navegador.

## 🌍 Idiomas Suportados

- **pt-BR** (Português Brasileiro) - Idioma padrão
- **en** (English) - Inglês

## 🚀 Funcionalidades

### 1. Detecção Automática de Idioma
- Detecta idioma preferencial do navegador via header `Accept-Language`
- Redireciona automaticamente para a versão correta
- Salva preferência em cookie (`NEXT_LOCALE`)

### 2. Middleware Inteligente
- **Arquivo**: `src/middleware.ts`
- Intercepta todas as requisições
- Analisa preferências por ordem:
  1. Cookie de preferência (`NEXT_LOCALE`)
  2. Header Accept-Language do navegador
  3. Fallback para idioma padrão

### 3. Sistema de Dicionários
- **Localização**: `src/i18n/dictionaries/`
  - `pt-BR.json` - Todas as strings em português
  - `en.json` - Todas as strings em inglês

### 4. Seletor de Idioma (LanguageSwitcher)
- Componente React client-side
- Dropdown com bandeiras 🇧🇷 🇺🇸
- Troca instantânea de idioma
- Persiste preferência em cookie

## 📁 Estrutura de Arquivos

```
src/
├── i18n/
│   ├── config.ts              # Configuração de idiomas
│   ├── dictionaries.ts        # Carregador de dicionários
│   └── dictionaries/
│       ├── pt-BR.json        # Traduções PT-BR
│       └── en.json           # Traduções EN
├── middleware.ts             # Detecção e redirecionamento
└── components/
    └── language-switcher.tsx # Seletor de idioma UI
```

## 🔧 Como Usar

### Em Componentes Server-Side

```tsx
import { getDictionary } from '@/i18n/dictionaries';

export default async function Page({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang);

  return <h1>{dict.home.title}</h1>;
}
```

### Em Componentes Client-Side

```tsx
'use client';

import { LanguageSwitcher } from '@/components/language-switcher';

export function MyComponent({ locale }: { locale: string }) {
  return <LanguageSwitcher currentLocale={locale} />;
}
```

## 🎯 Próximos Passos

### Fase 2: Migração de Rotas (Pendente)
Para ativar completamente o i18n, será necessário:

1. **Criar estrutura [lang]/**
   ```
   app/
   └── [lang]/
       ├── layout.tsx
       ├── page.tsx
       ├── sobre/page.tsx
       └── blog/[slug]/page.tsx
   ```

2. **Atualizar todas as páginas**
   - Receber `params.lang` como prop
   - Usar `getDictionary(params.lang)`
   - Renderizar conteúdo traduzido

3. **Integrar LanguageSwitcher**
   - Adicionar ao `<SiteNav />`
   - Adicionar ao Footer
   - Testar navegação entre idiomas

## 📖 Adicionando Novas Traduções

1. Edite `src/i18n/dictionaries/pt-BR.json`
2. Adicione a mesma chave em `src/i18n/dictionaries/en.json`
3. Use `dict.sua.chave` nos componentes

Exemplo:
```json
{
  "newSection": {
    "title": "Novo Título",
    "description": "Nova descrição"
  }
}
```

## 🧪 Testando

1. **Teste de detecção automática:**
   - Acesse `http://localhost:3000`
   - Verifique redirecionamento para `/pt-BR/` ou `/en/`

2. **Teste de cookie:**
   - Troque idioma pelo seletor
   - Recarregue a página
   - Idioma deve persistir

3. **Teste de Accept-Language:**
   - Configure navegador para inglês
   - Limpe cookies
   - Acesse site → deve abrir em inglês

## 📝 Notas Técnicas

- O middleware NÃO afeta rotas API (`/api/*`)
- Arquivos estáticos são ignorados
- Cookies expira em 1 ano (31536000 segundos)
- Fallback sempre para `pt-BR` se português detectado
- Qualquer outro idioma cai para `en`

## 🌐 Detecção de Idioma - Lógica

```
1. Cookie NEXT_LOCALE existe?
   └─ SIM → Usar esse idioma
   └─ NÃO → Continuar

2. Header Accept-Language existe?
   └─ SIM → Parsear e buscar match exato (pt-BR, en)
   └─ NÃO → Fallback padrão

3. Não encontrou match exato?
   └─ Buscar match parcial (pt → pt-BR, en → en)

4. Ainda sem match?
   └─ Usar idioma padrão (pt-BR)
```

## ✅ Status Atual

- [x] Estrutura i18n criada
- [x] Middleware de detecção implementado
- [x] Dicionários PT-BR e EN criados
- [x] LanguageSwitcher component criado
- [x] Dependências instaladas
- [ ] Migração de rotas para [lang]/ (próxima fase)
- [ ] Integração do seletor no navbar
- [ ] Testes end-to-end

---

**Implementado em:** 2024-11-30
**Versão:** 1.0 (Base)
**Próxima atualização:** Migração completa de rotas
