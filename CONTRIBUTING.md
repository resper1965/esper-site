# Contributing to Ricardo Esper Blog

Obrigado por considerar contribuir! 🎉

## 📋 Código de Conduta

Leia nosso [Código de Conduta](CODE_OF_CONDUCT.md) antes de contribuir.

## 🚀 Como Contribuir

### Reportar Bugs

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/resper1965/esper-site/issues)
2. Use o [template de bug report](.github/ISSUE_TEMPLATE/bug_report.md)

### Sugerir Features

1. Verifique as [discussões existentes](https://github.com/resper1965/esper-site/issues)
2. Use o [template de feature request](.github/ISSUE_TEMPLATE/feature_request.md)

### Pull Requests

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça commits seguindo [Conventional Commits](#conventional-commits)
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

## 📝 Conventional Commits

Use o formato:

```
<type>(<scope>): <description>

[optional body]
```

**Types:**

- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

**Exemplos:**

```bash
feat(blog): add reading time to posts
fix(api): resolve auth token expiration
docs: update README installation steps
```

## 🛠️ Setup Local

```bash
git clone https://github.com/resper1965/esper-site.git
cd esper-site
npm install
cp .env.local.template .env.local
# Configure ANTHROPIC_API_KEY
npm run dev
```

## ✅ Antes do PR

```bash
npm run lint      # Sem erros
npm run build     # Build passa
```

## 📦 Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: Novas features (backward compatible)
- **PATCH**: Bug fixes
