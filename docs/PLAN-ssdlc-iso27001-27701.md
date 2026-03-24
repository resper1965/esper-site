# PLAN: SSDLC/SDLC Alinhado com ISO 27001 + ISO 27701

## Contexto

O projeto **esper-site** passou por migração de Supabase/Vercel → Cloudflare (D1/R2/KV/Workers). Os documentos atuais (`SDLC.md`, `SSDLC.md`, `SECURITY-OWASP.md`, `SECURITY.md`) referenciam a stack antiga e não possuem:

- Mapeamento de controles ISO 27001:2022 (Annex A — 93 controles)
- Mapeamento de controles ISO 27701:2019 (extensões de privacidade)
- Documentação ISMS (Information Security Management System)
- Documentação PIMS (Privacy Information Management System)
- Trust Center público
- Políticas e procedimentos formais

---

## Escopo

### O que será criado

| # | Documento | Caminho | ISO |
|---|-----------|---------|-----|
| 1 | **SDLC.md** (atualizado) | `docs/SDLC.md` | — |
| 2 | **SSDLC.md** (atualizado) | `docs/SSDLC.md` | 27001 A.8 |
| 3 | **ISMS — Política de Segurança da Informação** | `docs/isms/ISMS-POLICY.md` | 27001 §5.2 |
| 4 | **Declaração de Aplicabilidade (SoA)** | `docs/isms/SOA.md` | 27001 §6.1.3 |
| 5 | **Gestão de Riscos** | `docs/isms/RISK-MANAGEMENT.md` | 27001 §6.1.2 |
| 6 | **Controles Annex A** | `docs/isms/ANNEX-A-CONTROLS.md` | 27001 Annex A |
| 7 | **Gestão de Incidentes** | `docs/isms/INCIDENT-RESPONSE.md` | 27001 A.5.24-A.5.28 |
| 8 | **Gestão de Mudanças** | `docs/isms/CHANGE-MANAGEMENT.md` | 27001 A.8.32 |
| 9 | **Controle de Acesso** | `docs/isms/ACCESS-CONTROL.md` | 27001 A.5.15-A.5.18 |
| 10 | **Gestão de Ativos** | `docs/isms/ASSET-MANAGEMENT.md` | 27001 A.5.9-A.5.14 |
| 11 | **Continuidade e Recuperação** | `docs/isms/BUSINESS-CONTINUITY.md` | 27001 A.5.29-A.5.30 |
| 12 | **PIMS — Política de Privacidade** | `docs/pims/PRIVACY-POLICY.md` | 27701 §5 |
| 13 | **Inventário de Dados Pessoais (ROPA)** | `docs/pims/DATA-INVENTORY.md` | 27701 §A.7.2.8 |
| 14 | **DPIA** | `docs/pims/DPIA.md` | 27701 §A.7.2.5 |
| 15 | **Direitos do Titular** | `docs/pims/DATA-SUBJECT-RIGHTS.md` | 27701 §A.7.3 |
| 16 | **Transferência Internacional** | `docs/pims/INTERNATIONAL-TRANSFER.md` | 27701 §A.7.5 |
| 17 | **SECURITY.md** (atualizado) | `SECURITY.md` | — |
| 18 | **SECURITY-OWASP.md** (atualizado) | `docs/SECURITY-OWASP.md` | A.8.28 |
| 19 | **Trust Center Page** (público) | `src/app/[lang]/trust/page.tsx` | — |

---

## Fase 1 — Atualizar SDLC + SSDLC (Stack Atual)

Remover referências a Supabase/Vercel. Atualizar para Cloudflare (D1, R2, KV, Workers/Pages). Integrar gates de segurança nas fases do SDLC.

### SDLC.md — Mudanças

- Ferramentas → Cloudflare Pages, D1, R2, KV, Workers
- Deploy → `git push` → Cloudflare Pages (auto-deploy)
- Backend → Cloudflare D1 (SQLite), R2 (Storage), KV (Cache)
- CI/CD → GitHub Actions + Cloudflare Pages
- Adicionar gate de segurança em cada fase

### SSDLC.md — Mudanças

- Remover referências Supabase/Vercel
- Mapear cada fase para controles ISO 27001 Annex A
- Adicionar seção ISO 27701 (Privacy by Design)
- Atualizar ferramentas para Cloudflare Workers/D1
- Adicionar referências NIST SSDF + OWASP SAMM

---

## Fase 2 — ISMS: ISO 27001:2022

### 2.1 Política de Segurança (`ISMS-POLICY.md`)

Cobre ISO 27001 cláusulas §4-§10:

| Cláusula | Conteúdo |
|----------|----------|
| §4 Contexto | Escopo do ISMS, partes interessadas |
| §5 Liderança | Compromisso da liderança, política |
| §6 Planejamento | Riscos e oportunidades, objetivos |
| §7 Suporte | Recursos, competência, comunicação |
| §8 Operação | Planejamento operacional, avaliação de riscos |
| §9 Avaliação | Monitoramento, auditoria interna, análise crítica |
| §10 Melhoria | Não-conformidades, ações corretivas |

### 2.2 Statement of Applicability (`SOA.md`)

Todos os 93 controles do Annex A (ISO 27001:2022) com:

- **Status**: Aplicável / Não aplicável / Parcialmente implementado
- **Justificativa** de exclusão (quando N/A)
- **Evidência** de implementação

Agrupados por tema:

| Tema | Controles | Faixa |
|------|-----------|-------|
| Organizacionais | 37 | A.5.1–A.5.37 |
| Pessoais | 8 | A.6.1–A.6.8 |
| Físicos | 14 | A.7.1–A.7.14 |
| Tecnológicos | 34 | A.8.1–A.8.34 |

### 2.3 Gestão de Riscos (`RISK-MANAGEMENT.md`)

- Metodologia de avaliação de riscos (probabilidade × impacto)
- Registro de riscos com classificação (Crítico/Alto/Médio/Baixo)
- Plano de tratamento (Mitigar/Aceitar/Transferir/Evitar)
- Riscos específicos do projeto:
  - Exposição de API keys
  - Acesso não autorizado ao admin
  - Injeção SQL no D1
  - Data breach de dados pessoais
  - Indisponibilidade do Cloudflare

### 2.4 Annex A Controls (`ANNEX-A-CONTROLS.md`)

Detalhamento dos controles implementados/planejados, mapeados para o projeto:

**Destaques para esper-site:**

| Controle | Título | Implementação |
|----------|--------|---------------|
| A.5.1 | Políticas de segurança | `ISMS-POLICY.md` |
| A.5.15 | Controle de acesso | JWT + middleware + RBAC |
| A.5.23 | Segurança em cloud | Cloudflare Workers/Pages |
| A.5.24-28 | Gestão de incidentes | Processo definido |
| A.5.29-30 | Continuidade | Cloudflare multi-region |
| A.5.34 | Privacidade/PII | PIMS + LGPD |
| A.8.1-3 | Dispositivos de endpoint | N/A (serverless) |
| A.8.9 | Gestão de configuração | `wrangler.toml` + env vars |
| A.8.25 | SSDLC | `SSDLC.md` |
| A.8.28 | Secure coding | OWASP practices |
| A.8.32 | Gestão de mudanças | Git-based, PRs |

### 2.5 Outros Documentos ISMS

- **INCIDENT-RESPONSE.md** — Classificação, escalonamento, timeline, post-mortem
- **CHANGE-MANAGEMENT.md** — Git flow, PR review, rollback
- **ACCESS-CONTROL.md** — JWT, RBAC admin, Cloudflare dashboard, GitHub
- **ASSET-MANAGEMENT.md** — Inventário (D1 databases, R2 buckets, KV namespaces, domínios)
- **BUSINESS-CONTINUITY.md** — Cloudflare SLA, failover, backup D1

---

## Fase 3 — PIMS: ISO 27701:2019

### 3.1 Política de Privacidade (`PRIVACY-POLICY.md`)

- Propósito do tratamento de dados pessoais
- Bases legais (LGPD Art. 7 / GDPR Art. 6)
- Categorias de dados tratados (email, IP, cookies, analytics)
- Compartilhamento com terceiros (Cloudflare, Google Analytics)
- DPO / Encarregado (se aplicável)

### 3.2 Inventário de Dados Pessoais / ROPA (`DATA-INVENTORY.md`)

| Dado | Categoria | Base Legal | Retenção | Armazenamento |
|------|-----------|-----------|----------|---------------|
| Email (admin login) | Credencial | Legítimo interesse | Indefinido | Cloudflare D1 |
| IP do visitante | Identificador | Legítimo interesse | 90 dias | Cloudflare Analytics |
| Comentários | Conteúdo UGC | Consentimento | Até remoção | Cloudflare D1 |
| Cookies analytics | Tracking | Consentimento | 2 anos | Browser + GA |

### 3.3 DPIA (`DPIA.md`)

- Avaliação de impacto para funcionalidades que tratam PII
- Fluxos de dados pessoais
- Riscos de privacidade e mitigações

### 3.4 Direitos do Titular (`DATA-SUBJECT-RIGHTS.md`)

| Direito | LGPD | GDPR | Implementação |
|---------|------|------|---------------|
| Acesso | Art. 18 I | Art. 15 | Via email ao DPO |
| Correção | Art. 18 III | Art. 16 | Via email ao DPO |
| Eliminação | Art. 18 VI | Art. 17 | Delete D1 records |
| Portabilidade | Art. 18 V | Art. 20 | Export JSON |
| Oposição | Art. 18 IV | Art. 21 | Via email ao DPO |

### 3.5 Transferência Internacional (`INTERNATIONAL-TRANSFER.md`)

- Cloudflare (USA) — SCCs / Data Processing Addendum
- Google Analytics (USA) — DPA
- Análise de adequação LGPD Art. 33 / GDPR Art. 46

---

## Fase 4 — Atualizar Documentos Existentes

### SECURITY.md

- Adicionar `security.txt` (RFC 9116)
- Atualizar contato de vulnerabilidades
- Adicionar PGP key (se disponível)
- Referenciar Trust Center

### SECURITY-OWASP.md

- Substituir referências Supabase → Cloudflare D1/R2
- Atualizar mapeamento para OWASP Top 10 2025 (se atualizado) ou manter 2021
- Mapear para controles ISO 27001 A.8.28 (Secure Coding)

---

## Fase 5 — Trust Center (Página Pública)

### `src/app/[lang]/trust/page.tsx`

Página pública acessível em `esper.ws/trust` contendo:

| Seção | Conteúdo |
|-------|----------|
| **Visão Geral** | Compromisso com segurança e privacidade |
| **Certificações** | ISO 27001, ISO 27701 (planejado/em conformidade) |
| **Infraestrutura** | Cloudflare (rede global, DDoS, WAF) |
| **Dados Pessoais** | Resumo da política de privacidade |
| **OWASP** | Conformidade com Top 10 |
| **Relatórios** | Link para SECURITY.md, política de divulgação |
| **Contato** | security@ricardoesper.com.br |
| **Compliance** | LGPD, GDPR |
| **Atualizações** | Última revisão da documentação |

### Design

- Estilo consistente com o site (dark theme, glassmorphism)
- Ícones de shield/lock/privacy
- Badges de compliance
- Seção FAQ sobre segurança

---

## Estrutura Final de Diretórios

```
docs/
├── SDLC.md                    ← Atualizado (Cloudflare)
├── SSDLC.md                   ← Atualizado (ISO mapped)
├── SECURITY-OWASP.md          ← Atualizado (Cloudflare + ISO)
├── isms/
│   ├── ISMS-POLICY.md         ← [NEW] Política ISMS
│   ├── SOA.md                 ← [NEW] Statement of Applicability
│   ├── RISK-MANAGEMENT.md     ← [NEW] Gestão de riscos
│   ├── ANNEX-A-CONTROLS.md    ← [NEW] 93 controles mapeados
│   ├── INCIDENT-RESPONSE.md   ← [NEW] Resposta a incidentes
│   ├── CHANGE-MANAGEMENT.md   ← [NEW] Gestão de mudanças
│   ├── ACCESS-CONTROL.md      ← [NEW] Controle de acesso
│   ├── ASSET-MANAGEMENT.md    ← [NEW] Gestão de ativos
│   └── BUSINESS-CONTINUITY.md ← [NEW] Continuidade
├── pims/
│   ├── PRIVACY-POLICY.md      ← [NEW] Política de privacidade
│   ├── DATA-INVENTORY.md      ← [NEW] ROPA
│   ├── DPIA.md                ← [NEW] Avaliação de impacto
│   ├── DATA-SUBJECT-RIGHTS.md ← [NEW] Direitos do titular
│   └── INTERNATIONAL-TRANSFER.md ← [NEW] Transferência intl.
├── ...
SECURITY.md                    ← Atualizado
src/app/[lang]/trust/page.tsx  ← [NEW] Trust Center público
```

---

## Verificação

- [ ] Todos os 93 controles Annex A documentados no SOA
- [ ] Cada controle com status: Implementado / Planejado / N/A + justificativa
- [ ] ROPA completo com base legal, retenção e armazenamento
- [ ] DPIA com fluxos de dados e mitigações
- [ ] Trust Center page renderiza corretamente
- [ ] Links entre documentos consistentes
- [ ] Zero referências a Supabase/Vercel nos docs de segurança
- [ ] `npm run build` passa com Trust Center page

---

## Ordem de Execução

1. **Fase 1** — Atualizar `SDLC.md` e `SSDLC.md`
2. **Fase 2** — Criar todos os docs ISMS (`docs/isms/`)
3. **Fase 3** — Criar todos os docs PIMS (`docs/pims/`)
4. **Fase 4** — Atualizar `SECURITY.md` e `SECURITY-OWASP.md`
5. **Fase 5** — Criar Trust Center page

> **Estimativa**: ~19 arquivos (14 novos + 5 atualizados)
