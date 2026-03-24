# Política do Sistema de Gestão de Segurança da Informação (ISMS)

> Última revisão: 2025-03-24 | Versão: 1.0
> ISO/IEC 27001:2022 — Cláusulas §4 a §10

---

## §4 — Contexto da Organização

### 4.1 Entendendo a Organização

O **esper-site** (esper.ws) é o portfólio e blog profissional de Ricardo Esper, com funcionalidades de:
- Blog multi-idioma (PT/EN)
- Painel administrativo com autenticação
- Integração com IA (Claude/Gemini)
- Formulário de contato

### 4.2 Partes Interessadas

| Parte Interessada | Expectativa |
|-------------------|-------------|
| Visitantes | Disponibilidade, privacidade |
| Administrador | Segurança do painel, integridade do conteúdo |
| Clientes potenciais | Profissionalismo, confiança |
| Reguladores (ANPD/GDPR) | Conformidade LGPD/GDPR |
| Cloudflare | Uso adequado da infraestrutura |

### 4.3 Escopo do ISMS

O ISMS abrange:
- Aplicação web `esper.ws` e todos os subdomínios
- Infraestrutura Cloudflare (Pages, D1, R2, KV, Workers)
- Repositório Git (GitHub)
- Dados pessoais processados pela aplicação
- Pipeline CI/CD (GitHub Actions)
- Integrações de terceiros (APIs de IA)

**Exclusões:** Infraestrutura física (serverless), dispositivos de endpoint de terceiros.

### 4.4 ISMS

O ISMS é documentado neste conjunto de documentos em `docs/isms/` e `docs/pims/`, mantido como código versionado no Git.

---

## §5 — Liderança

### 5.1 Comprometimento

A liderança (Ricardo Esper) compromete-se com:
- Estabelecer e manter a política de segurança
- Garantir que o ISMS atinja seus resultados pretendidos
- Promover melhoria contínua

### 5.2 Política de Segurança da Informação

**Declaração de Política:**

> A segurança da informação e a privacidade dos dados pessoais são prioridades fundamentais. Todos os ativos de informação devem ser protegidos contra ameaças internas e externas, garantindo confidencialidade, integridade e disponibilidade, em conformidade com requisitos legais e regulatórios aplicáveis.

**Princípios:**
1. **Confidencialidade** — Informações acessíveis apenas a quem autorizado
2. **Integridade** — Informações precisas e completas
3. **Disponibilidade** — Informações acessíveis quando necessário
4. **Privacidade** — Dados pessoais tratados conforme LGPD/GDPR
5. **Accountability** — Responsabilidade clara por ativos e decisões

---

## §6 — Planejamento

### 6.1 Ações para Riscos e Oportunidades

**Processo de gestão de riscos:** Documentado em `RISK-MANAGEMENT.md`

**Metodologia:** Probabilidade × Impacto (escala 1-5)

**Declaração de aplicabilidade:** Documentada em `SOA.md`

### 6.2 Objetivos de Segurança

| Objetivo | Métrica | Meta |
|----------|---------|------|
| Zero breaches de dados | Incidentes de segurança | 0 / ano |
| Uptime | Disponibilidade | > 99.5% |
| Patch time (crítico) | Tempo de remediação | < 24h |
| Conformidade LGPD | Não-conformidades | 0 |
| Vulnerabilidades críticas | Scan results | 0 em produção |

---

## §7 — Suporte

### 7.1 Recursos
- Infraestrutura Cloudflare (serverless, auto-scaling)
- GitHub (repositório, CI/CD, issues)
- Ferramentas de segurança (ESLint, npm audit, TypeScript)

### 7.2 Competência
- Desenvolvimento seguro (OWASP Top 10)
- Administração Cloudflare
- Gestão de incidentes

### 7.3 Conscientização
- Toda alteração passa por code review
- Documentação de segurança acessível no repositório

### 7.4 Comunicação

| O quê | Quando | Para quem | Como |
|-------|--------|-----------|------|
| Incidentes de segurança | Imediato | Stakeholders | Email/GitHub Issue |
| Atualizações de política | Após mudança | Todos | Commit na documentação |
| Vulnerabilidades | Conforme criticidade | Administrador | GitHub Security Advisory |

### 7.5 Informação Documentada
- Toda documentação ISMS/PIMS versionada no Git
- Histórico de mudanças via `git log`
- Aprovações via Pull Requests

---

## §8 — Operação

### 8.1 Planejamento e Controle Operacional
- SSDLC implementado (ver `SSDLC.md`)
- Controles técnicos implementados conforme `ANNEX-A-CONTROLS.md`
- CI/CD com gates de segurança

### 8.2 Avaliação de Riscos
- Avaliação periódica (trimestral)
- Avaliação ad-hoc em mudanças significativas
- Registro em `RISK-MANAGEMENT.md`

### 8.3 Tratamento de Riscos
- Plano de tratamento documentado por risco
- Controles Annex A selecionados conforme SOA

---

## §9 — Avaliação de Desempenho

### 9.1 Monitoramento e Medição
- Cloudflare Analytics (tráfego, threats, performance)
- GitHub Dependabot (vulnerabilidades)
- CI/CD pipeline success rate
- Security scan results

### 9.2 Auditoria Interna
- Frequência: Semestral
- Escopo: Conformidade com este ISMS
- Responsável: Ricardo Esper
- Registro: Issue no GitHub

### 9.3 Análise Crítica pela Direção
- Frequência: Anual
- Inputs: Resultados de auditoria, incidentes, métricas
- Outputs: Ações de melhoria, recursos necessários

---

## §10 — Melhoria

### 10.1 Não-conformidades e Ações Corretivas
1. Identificar não-conformidade
2. Registrar como GitHub Issue (label: `security`)
3. Analisar causa raiz
4. Implementar ação corretiva
5. Verificar eficácia
6. Fechar issue

### 10.2 Melhoria Contínua
- Revisão periódica de políticas e controles
- Acompanhamento de novas ameaças e vulnerabilidades
- Atualização da documentação conforme evolução do projeto

---

## Documentos Relacionados

| Documento | Localização |
|-----------|-------------|
| Statement of Applicability | `docs/isms/SOA.md` |
| Gestão de Riscos | `docs/isms/RISK-MANAGEMENT.md` |
| Controles Annex A | `docs/isms/ANNEX-A-CONTROLS.md` |
| Resposta a Incidentes | `docs/isms/INCIDENT-RESPONSE.md` |
| Gestão de Mudanças | `docs/isms/CHANGE-MANAGEMENT.md` |
| Controle de Acesso | `docs/isms/ACCESS-CONTROL.md` |
| Gestão de Ativos | `docs/isms/ASSET-MANAGEMENT.md` |
| Continuidade de Negócios | `docs/isms/BUSINESS-CONTINUITY.md` |
| SSDLC | `docs/SSDLC.md` |
| Política de Privacidade | `docs/pims/PRIVACY-POLICY.md` |
