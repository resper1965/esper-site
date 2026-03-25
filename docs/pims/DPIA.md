# DPIA — Data Protection Impact Assessment — ISO 27701 / LGPD

> Versão 1.0 · Última atualização: 2025-03-24  
> Responsável: Ricardo Esper · DPO: security@ricardoesper.com.br

---

## 1. Descrição do Tratamento

| Campo | Detalhe |
|-------|---------|
| **Sistema** | ricardoesper.com.br — blog técnico + painel admin |
| **Controlador** | Ricardo Esper |
| **Natureza** | Blog público, autenticação admin, comentários, geração AI de conteúdo |
| **Escopo** | Dados de navegação (anônimos), credenciais admin, dados de comentaristas |
| **Contexto** | Site público, sem e-commerce, sem dados financeiros, sem dados sensíveis (Art. 5, II LGPD) |

---

## 2. Necessidade e Proporcionalidade

| Princípio LGPD | Avaliação | Status |
|----------------|-----------|--------|
| **Finalidade** (Art. 6, I) | Dados coletados apenas para operação do blog e segurança | ✅ Adequado |
| **Adequação** (Art. 6, II) | Dados compatíveis com as finalidades declaradas | ✅ Adequado |
| **Necessidade** (Art. 6, III) | Mínimo necessário — analytics anonimizado, sem tracking invasivo | ✅ Adequado |
| **Livre acesso** (Art. 6, IV) | Canal de DPO aberto, procedimentos documentados | ✅ Adequado |
| **Qualidade** (Art. 6, V) | Dados mantidos atualizados pelo sistema | ✅ Adequado |
| **Transparência** (Art. 6, VI) | Política de privacidade pública e acessível | ✅ Adequado |
| **Segurança** (Art. 6, VII) | TLS 1.3, JWT HttpOnly, rate limiting, fail-closed auth | ✅ Adequado |
| **Prevenção** (Art. 6, VIII) | Vulnerability audit realizado, remediação completa | ✅ Adequado |
| **Não discriminação** (Art. 6, IX) | Sem tratamento para perfilamento ou discriminação | ✅ Adequado |
| **Responsabilização** (Art. 6, X) | ISMS, PIMS e auditoria documentados | ✅ Adequado |

---

## 3. Análise de Riscos

### 3.1 Riscos Identificados

| # | Risco | Probabilidade | Impacto | Nível | Mitigação |
|---|-------|--------------|---------|-------|-----------|
| R1 | Vazamento de credenciais admin | Baixa | Alto | **Médio** | Hash SHA-256+HMAC, JWT HttpOnly, rate limiting |
| R2 | Acesso não autorizado ao admin | Baixa | Alto | **Médio** | `requireAuth.ts` em todas as rotas, middleware |
| R3 | Exposição de IP de comentaristas | Baixa | Médio | **Baixo** | IP armazenado apenas em D1, eliminado após 90 dias |
| R4 | Indisponibilidade do serviço | Baixa | Baixo | **Baixo** | Cloudflare edge global, WAF, DDoS protection |
| R5 | Transferência internacional insegura | Baixa | Médio | **Baixo** | TLS 1.3, DPA Cloudflare, SCCs |
| R6 | Brute force no login | Média | Alto | **Médio** | Rate limiting 5/15min, fail-closed JWT_SECRET |
| R7 | Injeção SQL via API | Baixa | Alto | **Médio** | D1 prepared statements, input validation |

### 3.2 Matriz de Risco

```
         Impacto →
          Baixo    Médio    Alto
Prob.  ┌────────┬────────┬────────┐
Alta   │        │        │        │
       ├────────┼────────┼────────┤
Média  │        │        │  R6    │
       ├────────┼────────┼────────┤
Baixa  │  R4    │ R3, R5 │R1,R2,R7│
       └────────┴────────┴────────┘
```

---

## 4. Medidas de Segurança Implementadas

| Controle | Implementação | Referência |
|----------|--------------|------------|
| Autenticação | JWT HMAC-SHA256 + HttpOnly cookie | `src/lib/cloudflare/auth.ts` |
| Autorização | `requireAuth.ts` em todas as rotas admin | `src/lib/requireAuth.ts` |
| Rate Limiting | 5 tentativas / 15 min por IP | `src/lib/rate-limit.ts` |
| Criptografia em trânsito | TLS 1.3 obrigatório | Cloudflare |
| Criptografia at-rest | D1/R2 encryption | Cloudflare |
| Secrets management | Fail-closed (sem fallback) | `.env` + Wrangler secrets |
| WAF | Cloudflare WAF + Bot Management | Cloudflare |
| Auditoria | Vulnerability Audit 2025 | `docs/security/VULNERABILITY-AUDIT-2025.md` |

---

## 5. Decisão

### 5.1 Consulta Prévia à ANPD

| Critério | Aplicável? | Justificativa |
|----------|-----------|---------------|
| Dados sensíveis (Art. 5, II) | ❌ Não | Nenhum dado sensível tratado |
| Decisão automatizada (Art. 20) | ❌ Não | IA gera conteúdo, não decide sobre titulares |
| Monitoramento sistemático | ❌ Não | Analytics anonimizado, sem profiling |
| Grande escala | ❌ Não | Blog pessoal, público limitado |

**Conclusão:** Consulta prévia à ANPD **não é necessária** (Art. 38, LGPD).

### 5.2 Risco Residual

Após mitigações, o risco residual é classificado como **BAIXO**. Todos os riscos médios possuem controles técnicos implementados e testados.

---

## 6. Revisão

| Evento | Ação |
|--------|------|
| Semestral | Revisão de rotina |
| Novo sub-processador | Atualizar inventário + DPIA |
| Novo tipo de dado | Atualizar inventário + DPIA |
| Incidente de segurança | Revisão imediata |

Referência: [`DATA-INVENTORY.md`](DATA-INVENTORY.md) · [`PRIVACY-POLICY.md`](PRIVACY-POLICY.md)
