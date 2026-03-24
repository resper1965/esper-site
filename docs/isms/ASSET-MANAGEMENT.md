# Gestão de Ativos de Informação

> Última revisão: 2025-03-24 | Versão: 1.0
> ISO 27001:2022 — A.5.9 a A.5.13

---

## Inventário de Ativos

### Ativos de Aplicação

| Ativo | Tipo | Classificação | Responsável | Localização |
|-------|------|--------------|-------------|-------------|
| Código-fonte | Software | Interno | Ricardo Esper | GitHub (privado) |
| Posts do blog | Dados | Público | Ricardo Esper | Cloudflare D1 |
| Projetos portfolio | Dados | Público | Ricardo Esper | Cloudflare D1 |
| Imagens/media | Dados | Público | Ricardo Esper | Cloudflare R2 |
| Dados de contato | Dados pessoais | Confidencial | Ricardo Esper | Cloudflare D1 |
| Admin credentials | Credencial | Confidencial | Ricardo Esper | D1 (hashed) / CF env |
| API keys (IA) | Credencial | Confidencial | Ricardo Esper | Cloudflare env vars |
| JWT secret | Credencial | Confidencial | Ricardo Esper | Cloudflare env vars |
| Configuração (.env) | Configuração | Interno | Ricardo Esper | Cloudflare Dashboard |
| Documentação ISMS/PIMS | Documento | Interno | Ricardo Esper | GitHub (privado) |

### Ativos de Infraestrutura

| Ativo | Tipo | Provedor | SLA |
|-------|------|---------|-----|
| Cloudflare Pages | Hosting | Cloudflare | 99.99% |
| Cloudflare D1 | Database | Cloudflare | 99.99% |
| Cloudflare R2 | Storage | Cloudflare | 99.99% |
| Cloudflare KV | Cache | Cloudflare | 99.99% |
| Cloudflare DNS | DNS | Cloudflare | 100% |
| Cloudflare WAF/DDoS | Segurança | Cloudflare | Incluído |
| GitHub Repo | Source control | GitHub | 99.9% |
| GitHub Actions | CI/CD | GitHub | 99.9% |
| Domínio esper.ws | DNS | Registrar | Anual |

### Ativos de Terceiros (Integrações)

| Serviço | Tipo | Dados compartilhados | DPA |
|---------|------|---------------------|-----|
| Anthropic (Claude) | API IA | Prompts admin | ✅ ToS |
| Google AI (Gemini) | API IA | Prompts admin | ✅ ToS |

---

## Classificação de Informações

| Classificação | Descrição | Controles | Exemplos |
|--------------|-----------|-----------|---------|
| **Público** | Disponível a todos | Integridade | Blog posts, portfolio |
| **Interno** | Acesso restrito ao projeto | Autenticação | Código-fonte, configs |
| **Confidencial** | Dados sensíveis | Criptografia + acesso mínimo | API keys, dados pessoais |

---

## Ciclo de Vida dos Ativos

### Criação
- Ativos de dados: Via admin panel (CRUD)
- Ativos de código: Via Git workflow (branch → PR → merge)
- Ativos de config: Via Cloudflare Dashboard

### Armazenamento
- D1: dados persistentes (blog, projetos, contatos)
- R2: arquivos binários (imagens, uploads)
- KV: cache, configurações runtime
- GitHub: código-fonte, documentação

### Proteção
- HTTPS em trânsito (TLS 1.3)
- At-rest encryption (Cloudflare managed)
- Backups: D1 export, Git history, R2 versioning

### Descarte
- Dados pessoais: Exclusão via DELETE API + purge de backups
- Código: Git removal + cache purge
- Credenciais: Revogação + rotação

---

## Revisão do Inventário

- **Frequência:** Semestral
- **Responsável:** Ricardo Esper
- **Trigger adicional:** Nova integração ou mudança significativa
