# Statement of Applicability (SoA) — ISO 27001:2022

> Última revisão: 2025-03-24 | Versão: 1.0

## Legenda

| Status | Descrição |
|--------|-----------|
| ✅ | Implementado |
| 🔄 | Parcialmente implementado |
| 📋 | Planejado |
| ❌ | Não aplicável |

---

## A.5 — Controles Organizacionais (37 controles)

| # | Controle | Status | Justificativa / Evidência |
|---|---------|--------|--------------------------|
| A.5.1 | Políticas de segurança da informação | ✅ | `ISMS-POLICY.md`, `SSDLC.md` |
| A.5.2 | Papéis e responsabilidades | ✅ | Owner único (Ricardo Esper) |
| A.5.3 | Segregação de funções | 🔄 | Code review obrigatório em PRs |
| A.5.4 | Responsabilidades da direção | ✅ | Compromisso em `ISMS-POLICY.md` §5 |
| A.5.5 | Contato com autoridades | ✅ | ANPD via DPO email |
| A.5.6 | Contato com grupos especiais | 📋 | |
| A.5.7 | Threat intelligence | 🔄 | GitHub Dependabot, npm audit |
| A.5.8 | Segurança em gestão de projetos | ✅ | SSDLC integrado ao SDLC |
| A.5.9 | Inventário de informações | ✅ | `ASSET-MANAGEMENT.md` |
| A.5.10 | Uso aceitável de informações | ✅ | Repositório privado, acesso controlado |
| A.5.11 | Devolução de ativos | ❌ | Projeto individual, sem funcionários |
| A.5.12 | Classificação de informações | ✅ | Público / Interno / Confidencial |
| A.5.13 | Rotulagem de informações | 🔄 | Documentos classificados em headers |
| A.5.14 | Transferência de informações | ✅ | HTTPS obrigatório (Cloudflare TLS 1.3) |
| A.5.15 | Controle de acesso | ✅ | `ACCESS-CONTROL.md`, JWT + RBAC |
| A.5.16 | Gestão de identidades | ✅ | Admin único, JWT tokens |
| A.5.17 | Autenticação | ✅ | JWT com expiração |
| A.5.18 | Direitos de acesso | ✅ | RBAC no admin panel |
| A.5.19 | Segurança com fornecedores | ✅ | Cloudflare DPA, avaliação de terceiros |
| A.5.20 | Segurança em contratos | ✅ | Cloudflare ToS + DPA |
| A.5.21 | Gestão de serviços de TIC | ✅ | Cloudflare SLA |
| A.5.22 | Monitoramento de fornecedores | 🔄 | Cloudflare status page |
| A.5.23 | Segurança em cloud | ✅ | Cloudflare WAF, DDoS, TLS |
| A.5.24 | Planejamento de gestão de incidentes | ✅ | `INCIDENT-RESPONSE.md` |
| A.5.25 | Avaliação de eventos de segurança | ✅ | Processo em `INCIDENT-RESPONSE.md` |
| A.5.26 | Resposta a incidentes | ✅ | Processo em `INCIDENT-RESPONSE.md` |
| A.5.27 | Aprendizado com incidentes | ✅ | Post-mortem process |
| A.5.28 | Coleta de evidências | 🔄 | Cloudflare logs, Git history |
| A.5.29 | Segurança durante disrupção | ✅ | `BUSINESS-CONTINUITY.md` |
| A.5.30 | Prontidão de TIC para continuidade | ✅ | Cloudflare multi-region, D1 backups |
| A.5.31 | Requisitos legais e regulatórios | ✅ | LGPD/GDPR compliance docs |
| A.5.32 | Direitos de propriedade intelectual | ✅ | MIT License ou proprietary |
| A.5.33 | Proteção de registros | ✅ | Git versioning, D1 backups |
| A.5.34 | Privacidade e PII | ✅ | PIMS docs (`docs/pims/`) |
| A.5.35 | Revisão independente de segurança | 📋 | Planejado anual |
| A.5.36 | Conformidade com políticas | ✅ | CI/CD gates, code review |
| A.5.37 | Procedimentos operacionais documentados | ✅ | SDLC, SSDLC, runbooks |

---

## A.6 — Controles de Pessoas (8 controles)

| # | Controle | Status | Justificativa / Evidência |
|---|---------|--------|--------------------------|
| A.6.1 | Screening | ❌ | Projeto individual |
| A.6.2 | Termos de emprego | ❌ | Projeto individual |
| A.6.3 | Conscientização de segurança | ✅ | Documentação ISMS acessível |
| A.6.4 | Processo disciplinar | ❌ | Projeto individual |
| A.6.5 | Responsabilidades pós-emprego | ❌ | Projeto individual |
| A.6.6 | Confidencialidade | ✅ | Repositório privado |
| A.6.7 | Trabalho remoto | ❌ | N/A — não é organização |
| A.6.8 | Reporte de eventos de segurança | ✅ | `SECURITY.md`, security@ricardoesper.com.br |

---

## A.7 — Controles Físicos (14 controles)

| # | Controle | Status | Justificativa / Evidência |
|---|---------|--------|--------------------------|
| A.7.1 | Perímetros de segurança física | ❌ | Infraestrutura 100% cloud/serverless |
| A.7.2 | Controles de entrada física | ❌ | Infraestrutura 100% cloud/serverless |
| A.7.3 | Segurança de escritórios | ❌ | Infraestrutura 100% cloud/serverless |
| A.7.4 | Monitoramento de segurança física | ❌ | Cloudflare gerencia data centers |
| A.7.5 | Proteção contra ameaças externas | ❌ | Cloudflare gerencia data centers |
| A.7.6 | Trabalho em áreas seguras | ❌ | N/A |
| A.7.7 | Clear desk e clear screen | ❌ | Projeto individual |
| A.7.8 | Localização de equipamentos | ❌ | Cloudflare gerencia |
| A.7.9 | Segurança de ativos fora do local | ❌ | N/A |
| A.7.10 | Mídia de armazenamento | ❌ | Cloudflare R2/D1 |
| A.7.11 | Serviços utilitários | ❌ | Cloudflare gerencia |
| A.7.12 | Segurança de cabeamento | ❌ | N/A |
| A.7.13 | Manutenção de equipamentos | ❌ | N/A |
| A.7.14 | Descarte de equipamentos | ❌ | N/A, dados em cloud |

> **Justificativa de exclusão A.7:** Toda infraestrutura é serverless (Cloudflare). A segurança física dos data centers é responsabilidade da Cloudflare conforme seu programa de compliance (SOC 2, ISO 27001).

---

## A.8 — Controles Tecnológicos (34 controles)

| # | Controle | Status | Justificativa / Evidência |
|---|---------|--------|--------------------------|
| A.8.1 | User endpoint devices | ❌ | Serverless, sem endpoints gerenciados |
| A.8.2 | Direitos de acesso privilegiado | ✅ | Admin RBAC, Cloudflare Dashboard access |
| A.8.3 | Restrição de acesso à informação | ✅ | JWT middleware, route protection |
| A.8.4 | Acesso a código-fonte | ✅ | GitHub repo privado, branch protection |
| A.8.5 | Autenticação segura | ✅ | JWT + bcrypt/argon2, expiração de tokens |
| A.8.6 | Gestão de capacidade | ✅ | Cloudflare auto-scaling |
| A.8.7 | Proteção contra malware | 🔄 | Cloudflare WAF, dependency scanning |
| A.8.8 | Gestão de vulnerabilidades técnicas | ✅ | npm audit, Dependabot, CI scanning |
| A.8.9 | Gestão de configuração | ✅ | `wrangler.toml`, env vars, `next.config.ts` |
| A.8.10 | Exclusão de informações | 🔄 | DELETE APIs, D1 data purge |
| A.8.11 | Data masking | 📋 | Admin logs com dados parciais |
| A.8.12 | Prevenção de vazamento de dados | ✅ | Secrets scanning CI, .gitignore |
| A.8.13 | Backup de informações | ✅ | D1 export, Git history, R2 versioning |
| A.8.14 | Redundância | ✅ | Cloudflare global edge (300+ PoPs) |
| A.8.15 | Logging | 🔄 | Cloudflare Analytics, Workers logs |
| A.8.16 | Atividades de monitoramento | ✅ | Cloudflare Analytics + Security Events |
| A.8.17 | Sincronização de relógio | ✅ | Cloudflare edge (NTP automático) |
| A.8.18 | Uso de utilitários privilegiados | ❌ | Serverless |
| A.8.19 | Instalação de software | ❌ | Serverless, npm lockfile |
| A.8.20 | Segurança de redes | ✅ | Cloudflare DDoS, WAF, Bot Management |
| A.8.21 | Segurança de serviços de rede | ✅ | Cloudflare TLS, DNSSEC |
| A.8.22 | Segregação de redes | ❌ | Serverless |
| A.8.23 | Web filtering | ✅ | Cloudflare WAF rules |
| A.8.24 | Uso de criptografia | ✅ | TLS 1.3, HSTS, HTTPS enforced |
| A.8.25 | **SSDLC** | ✅ | `SSDLC.md`, CI/CD gates |
| A.8.26 | Requisitos de segurança de aplicações | ✅ | SSDLC Phase 1 (requirements) |
| A.8.27 | Arquitetura de sistemas seguros | ✅ | Defense in depth, Cloudflare edge |
| A.8.28 | Secure coding | ✅ | OWASP, TypeScript strict, ESLint |
| A.8.29 | Security testing | ✅ | CI/CD SAST, npm audit, type checking |
| A.8.30 | Desenvolvimento terceirizado | ❌ | Desenvolvimento interno |
| A.8.31 | Separação de ambientes | 🔄 | Preview deploys vs production |
| A.8.32 | Gestão de mudanças | ✅ | `CHANGE-MANAGEMENT.md`, Git-based PRs |
| A.8.33 | Informações de teste | ✅ | Dados de teste, não produção |
| A.8.34 | Proteção durante auditoria | ✅ | Read-only access para auditores |

---

## Resumo

| Categoria | Total | ✅ | 🔄 | 📋 | ❌ |
|-----------|-------|-----|-----|-----|-----|
| A.5 Organizacionais | 37 | 28 | 4 | 2 | 3 |
| A.6 Pessoas | 8 | 2 | 0 | 0 | 6 |
| A.7 Físicos | 14 | 0 | 0 | 0 | 14 |
| A.8 Tecnológicos | 34 | 23 | 5 | 2 | 4 |
| **Total** | **93** | **53** | **9** | **4** | **27** |

> **N/A justificados:** 27 controles não aplicáveis, majoritariamente físicos (A.7) e controles de pessoas (A.6), devidos à natureza serverless e projeto individual.
