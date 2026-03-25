# Política de Segurança — ISO 27001 / LGPD

> Versão 2.0 · Última atualização: 2025-03-24  
> Responsável: Ricardo Esper · DPO: security@ricardoesper.com.br

---

## Versões Suportadas

| Versão | Suportada |
| ------ | --------- |
| 2.x.x  | ✅ Sim    |
| 1.x.x  | ⚠️ Security fixes only |
| < 1.0  | ❌ Não    |

---

## Reportar Vulnerabilidade

**NÃO abra issues públicas para vulnerabilidades de segurança.**

### Como Reportar

1. Envie email para: **security@ricardoesper.com.br**
2. Inclua:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial (CVSS se possível)
   - Sugestão de correção (se houver)
3. Chave PGP disponível sob solicitação

### SLA de Resposta

| Etapa | Prazo |
|-------|-------|
| Confirmação de recebimento | 24 horas |
| Avaliação inicial + CVSS | 72 horas |
| Plano de ação | 7 dias |
| Correção (crítico/alto) | 30 dias |
| Disclosure coordenado | 90 dias |

---

## Escopo

### Em Escopo

- Código fonte do repositório
- APIs públicas (`/api/*`)
- Configurações de deploy (Cloudflare Workers)
- Autenticação e autorização
- Handling de dados pessoais (LGPD)

### Fora de Escopo

- Ataques de força bruta (rate limiting implementado)
- DDoS (mitigado por Cloudflare)
- Engenharia social
- Vulnerabilidades em dependências já conhecidas (CVE publicado)
- Infraestrutura Cloudflare (reportar diretamente à Cloudflare)

---

## Documentação de Segurança

| Documento | Localização |
|-----------|------------|
| OWASP TOP 10 Implementation | [`docs/SECURITY-OWASP.md`](docs/SECURITY-OWASP.md) |
| Vulnerability Audit 2025 | [`docs/security/VULNERABILITY-AUDIT-2025.md`](docs/security/VULNERABILITY-AUDIT-2025.md) |
| ISMS Policy (ISO 27001) | [`docs/isms/ISMS-POLICY.md`](docs/isms/ISMS-POLICY.md) |
| Risk Assessment | [`docs/isms/RISK-ASSESSMENT.md`](docs/isms/RISK-ASSESSMENT.md) |
| SOA | [`docs/isms/SOA.md`](docs/isms/SOA.md) |
| DPIA (LGPD) | [`docs/pims/DPIA.md`](docs/pims/DPIA.md) |
| Privacy Policy | [`docs/pims/PRIVACY-POLICY.md`](docs/pims/PRIVACY-POLICY.md) |
| Data Inventory | [`docs/pims/DATA-INVENTORY.md`](docs/pims/DATA-INVENTORY.md) |

---

## Reconhecimento

Agradecemos a todos que reportam vulnerabilidades de forma responsável.
