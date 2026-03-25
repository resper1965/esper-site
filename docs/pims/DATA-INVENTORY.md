# Inventário de Dados Pessoais — ISO 27701 / LGPD

> Versão 1.0 · Última atualização: 2025-03-24  
> Responsável: Ricardo Esper · DPO: security@ricardoesper.com.br

---

## 1. Escopo

Inventário de todos os dados pessoais tratados pelo sistema **ricardoesper.com.br**, incluindo coleta automática, dados de administração e interações de usuários.

---

## 2. Inventário de Dados

### 2.1 Dados de Navegação

| # | Dado | Categoria | Classificação | Finalidade | Base Legal | Armazenamento | Retenção |
|---|------|-----------|---------------|-----------|------------|---------------|----------|
| 1 | IP (anonimizado) | Técnico | Público | Analytics | Legítimo interesse | Cloudflare Analytics | 30 dias |
| 2 | User-Agent | Técnico | Público | Compatibilidade | Legítimo interesse | Cloudflare Analytics | 30 dias |
| 3 | URL visitada | Comportamental | Público | Métricas | Legítimo interesse | Cloudflare Analytics | 30 dias |
| 4 | Referrer | Comportamental | Público | Métricas | Legítimo interesse | Cloudflare Analytics | 30 dias |
| 5 | Timestamp | Técnico | Público | Auditoria | Legítimo interesse | Cloudflare Analytics | 30 dias |

### 2.2 Dados de Administração

| # | Dado | Categoria | Classificação | Finalidade | Base Legal | Armazenamento | Retenção |
|---|------|-----------|---------------|-----------|------------|---------------|----------|
| 6 | Email admin | Identificação | Confidencial | Autenticação | Execução de contrato | Cloudflare D1 | Enquanto ativo |
| 7 | Senha (hash) | Credencial | Confidencial | Autenticação | Execução de contrato | Cloudflare D1 | Enquanto ativo |
| 8 | JWT token | Sessão | Confidencial | Autorização | Execução de contrato | Cookie HttpOnly | 24 horas |
| 9 | IP do admin | Identificação | Interno | Rate limiting | Legítimo interesse | Memória (volátil) | Sessão |

### 2.3 Dados de Comentários

| # | Dado | Categoria | Classificação | Finalidade | Base Legal | Armazenamento | Retenção |
|---|------|-----------|---------------|-----------|------------|---------------|----------|
| 10 | Nome de exibição | Identificação | Público | Comentário | Consentimento | Cloudflare D1 | Até remoção |
| 11 | Email do autor | Contato | Interno | Notificação | Consentimento | Cloudflare D1 | Até remoção |
| 12 | Conteúdo | Expressão | Público | Publicação | Consentimento | Cloudflare D1 | Até remoção |
| 13 | IP do autor | Identificação | Interno | Moderação | Legítimo interesse | Cloudflare D1 | 90 dias |

### 2.4 Dados de Conteúdo (Posts)

| # | Dado | Categoria | Classificação | Finalidade | Base Legal | Armazenamento | Retenção |
|---|------|-----------|---------------|-----------|------------|---------------|----------|
| 14 | Autor do post | Identificação | Público | Atribuição | Execução de contrato | Cloudflare D1 | Enquanto publicado |
| 15 | Imagens | Conteúdo | Público | Publicação | Execução de contrato | Cloudflare R2 | Enquanto publicado |

---

## 3. Fluxo de Dados

```
┌──────────────┐         ┌───────────────┐         ┌──────────────┐
│   Visitante  │───TLS──▶│  Cloudflare   │───Edge──▶│  D1 / R2     │
│   (Browser)  │         │  CDN + WAF    │         │  (Dados)     │
└──────────────┘         └───────┬───────┘         └──────────────┘
                                 │
                        ┌────────▼────────┐
                        │  Workers (API)  │
                        │  + Analytics    │
                        └─────────────────┘

┌──────────────┐         ┌───────────────┐
│   Admin      │───TLS──▶│  JWT Auth     │──▶ D1 CRUD
│   (Browser)  │         │  + Rate Limit │
└──────────────┘         └───────────────┘

┌──────────────┐         ┌───────────────┐
│   CRON Job   │───TLS──▶│  Gemini API   │──▶ Geração AI
│   (Workers)  │         │  (Google)     │
└──────────────┘         └───────────────┘
```

---

## 4. Classificação de Dados

| Nível | Descrição | Exemplos | Controles |
|-------|-----------|----------|-----------|
| **Público** | Visível a qualquer visitante | Posts, nome em comentários | TLS |
| **Interno** | Uso administrativo | Email de comentaristas, IP | Acesso autenticado |
| **Confidencial** | Acesso restrito | Credenciais admin, JWT secrets | Criptografia + HttpOnly + fail-closed |

---

## 5. Sub-processadores

| Operador | Dados Acessados | DPA | Localização |
|----------|----------------|-----|-------------|
| Cloudflare Inc. | Todos (hosting) | ✅ | EUA (edge global) |
| Google (Gemini) | Prompts de geração (sem dados pessoais) | ✅ | EUA |

---

## 6. Revisão

Este inventário deve ser revisado:
- **Semestralmente** (rotina)
- **A cada mudança** de sub-processador ou funcionalidade que trate dados pessoais
- **Após incidente** de segurança envolvendo dados pessoais

Referência: [`PRIVACY-POLICY.md`](PRIVACY-POLICY.md) · [`DPIA.md`](DPIA.md)
