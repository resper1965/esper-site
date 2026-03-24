# Continuidade de Negócios e Recuperação de Desastres

> Última revisão: 2025-03-24 | Versão: 1.0
> ISO 27001:2022 — A.5.29, A.5.30

---

## Análise de Impacto (BIA)

| Serviço | RTO | RPO | Impacto se indisponível |
|---------|-----|-----|------------------------|
| Website (blog/portfolio) | 1h | 24h | Baixo — reputacional |
| Admin panel | 4h | 1h | Médio — operacional |
| Database (D1) | 1h | 1h | Alto — perda de dados |
| Storage (R2) | 4h | 24h | Médio — media perdida |
| CI/CD pipeline | 24h | N/A | Baixo — delay no deploy |

> **RTO** = Recovery Time Objective | **RPO** = Recovery Point Objective

---

## Cenários de Desastre

### Cenário 1: Cloudflare Pages indisponível

**Probabilidade:** Raro (< 1x/5 anos)

**Mitigação:**
- Cloudflare SLA 99.99% com edge global
- Código-fonte completo no GitHub (recuperável)
- Build reproduzível (`npm run build`)

**Recuperação:**
1. Verificar status: status.cloudflare.com
2. Se prolongado: deploy temporário em alternativa (Vercel/Netlify)
3. Apontar DNS para novo provider
4. RTO estimado: 1-2h

---

### Cenário 2: Corrupção/perda de dados D1

**Probabilidade:** Raro

**Mitigação:**
- D1 database export periódico
- Git history de migrations
- Dados públicos reproduzíveis (blog posts em markdown de backup)

**Recuperação:**
1. Criar novo D1 database
2. Executar migrations: `npx wrangler d1 migrations apply`
3. Restaurar dados do último export
4. RPO estimado: depende da frequência de backup

---

### Cenário 3: Comprometimento de credenciais

**Probabilidade:** Improvável

**Mitigação:**
- MFA em GitHub e Cloudflare
- Secrets em env vars (não no código)
- Rotação de credenciais documentada

**Recuperação:**
1. Revogar credenciais comprometidas imediatamente
2. Gerar novas credenciais
3. Atualizar env vars no Cloudflare Dashboard
4. Re-deploy da aplicação
5. Audit trail: verificar ações não-autorizadas
6. RTO estimado: < 1h

---

### Cenário 4: GitHub indisponível

**Probabilidade:** Raro

**Mitigação:**
- Clone local do repositório
- Código completo disponível localmente

**Recuperação:**
1. Usar clone local para desenvolvimento
2. Se prolongado: migrar para GitLab/Bitbucket
3. Atualizar CI/CD e webhooks
4. RTO estimado: 4-8h

---

## Backup Strategy

| Dados | Método | Frequência | Retenção | Responsável |
|-------|--------|-----------|----------|-------------|
| Código-fonte | Git (GitHub) | Cada commit | Indefinido | Automático |
| Código-fonte | Clone local | Semanal | Última versão | Manual |
| Database D1 | `wrangler d1 export` | Semanal | 4 últimas | Manual |
| Media (R2) | R2 versioning | Automático | 30 dias | Automático |
| Configuração | Git (docs/) | Cada commit | Indefinido | Automático |
| Env vars | Documentação offline | Após mudança | Última | Manual |

---

## Teste de Recuperação

- **Frequência:** Anual
- **Escopo:** Restauração de D1 backup + build limpo
- **Procedimento:**
  1. Clone fresco do repositório
  2. `npm ci && npm run build`
  3. Restaurar D1 de backup
  4. Verificar funcionalidade
- **Registro:** GitHub Issue (label: `dr-test`)

---

## Comunicação durante Crise

| Quando | O quê | Como |
|--------|-------|------|
| Detecção | Notificar stakeholders | Email |
| Durante | Updates periódicos | Email / Twitter |
| Resolução | Post-mortem | Blog post / Email |
