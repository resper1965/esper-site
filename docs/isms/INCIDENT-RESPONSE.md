# Resposta a Incidentes de Segurança

> Última revisão: 2025-03-24 | Versão: 1.0
> ISO 27001:2022 — A.5.24 a A.5.28

---

## Definições

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **Evento** | Ocorrência observável | Login falho, scan detectado |
| **Incidente** | Evento que compromete CIA | Breach, defacement, DDoS |
| **Crise** | Incidente com impacto sistêmico | Data breach + regulatory |

---

## Classificação de Severidade

| Nível | Descrição | Tempo de Resposta |
|-------|-----------|-------------------|
| **P1 — Crítico** | Breach de dados pessoais, comprometimento de credenciais | < 1h |
| **P2 — Alto** | Indisponibilidade, defacement, acesso não-autorizado | < 4h |
| **P3 — Médio** | Vulnerabilidade explorada sem impacto direto | < 24h |
| **P4 — Baixo** | Tentativa bloqueada, anomalia detectada | < 72h |

---

## Processo de Resposta

### Fase 1: Detecção e Triagem

**Fontes de detecção:**
- Cloudflare Security Events (WAF, DDoS, bot alerts)
- GitHub Dependabot / Security Advisories
- CI/CD security scan (GitHub Actions)
- Monitoramento manual
- Reporte via `security@ricardoesper.com.br`

**Ações:**
1. Receber alerta / reporte
2. Classificar severidade (P1-P4)
3. Registrar como GitHub Issue (label: `incident`)
4. Notificar responsável

### Fase 2: Contenção

**P1/P2 — Ações imediatas:**
- Revogar credenciais comprometidas
- Bloquear IPs/ranges via Cloudflare WAF
- Desabilitar funcionalidade comprometida
- Ativar modo manutenção se necessário

**P3/P4 — Ações planejadas:**
- Isolar componente afetado
- Aplicar workaround temporário

### Fase 3: Investigação

1. Coletar evidências:
   - Cloudflare Analytics logs
   - Git history (`git log`, `git blame`)
   - D1 audit trail (se aplicável)
   - Request/response logs
2. Determinar causa raiz
3. Avaliar extensão do impacto
4. Identificar dados/sistemas afetados

### Fase 4: Erradicação

1. Corrigir vulnerabilidade (security patch)
2. Atualizar dependências vulneráveis
3. Resetar credenciais comprometidas
4. Aplicar controles adicionais

### Fase 5: Recuperação

1. Restaurar serviço normal
2. Verificar integridade dos dados
3. Monitorar para recorrência
4. Confirmar resolução

### Fase 6: Pós-Incidente

1. **Post-mortem** (obrigatório para P1/P2):
   - Timeline do incidente
   - Causa raiz
   - Impacto quantificado
   - Ações preventivas
   - Lições aprendidas
2. Atualizar registro de riscos (`RISK-MANAGEMENT.md`)
3. Atualizar controles conforme necessário
4. Fechar GitHub Issue

---

## Notificação Regulatória

### LGPD (Lei 13.709/2018)
- **Obrigatório** notificar ANPD em caso de breach de dados pessoais
- **Prazo:** Em prazo razoável (recomendado: 72h)
- **Canal:** formulário da ANPD
- **Conteúdo:** Natureza dos dados, titulares afetados, medidas tomadas

### GDPR (se titulares na UE)
- **Obrigatório** notificar autoridade supervisora em até 72h
- **Titulares:** Notificar se alto risco para direitos e liberdades

---

## Contatos

| Papel | Contato |
|-------|---------|
| Responsável pela segurança | security@ricardoesper.com.br |
| ANPD (Brasil) | https://www.gov.br/anpd |
| Cloudflare Abuse | abuse@cloudflare.com |
| GitHub Security | security@github.com |

---

## Ferramentas

| Ferramenta | Uso |
|-----------|-----|
| Cloudflare WAF | Bloqueio imediato de tráfego malicioso |
| Cloudflare Analytics | Análise de tráfego e ameaças |
| GitHub Issues | Registro e tracking de incidentes |
| Git history | Auditoria de mudanças no código |
