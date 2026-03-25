# Política de Privacidade — LGPD / ISO 27701

> Versão 1.0 · Última atualização: 2025-03-24  
> Controlador: Ricardo Esper · DPO: security@ricardoesper.com.br

---

## 1. Controlador e DPO

| Campo | Detalhe |
|-------|---------|
| **Controlador** | Ricardo Esper — ricardoesper.com.br |
| **DPO / Encarregado** | security@ricardoesper.com.br |
| **Canal de Solicitação** | security@ricardoesper.com.br |
| **SLA de Resposta** | 15 dias corridos (Art. 18, §5º LGPD) |

---

## 2. Dados Coletados

### 2.1 Dados de Navegação (coleta automática)

| Dado | Finalidade | Base Legal |
|------|-----------|------------|
| IP (anonimizado) | Analytics, segurança | Legítimo interesse (Art. 7, IX) |
| User-Agent | Compatibilidade | Legítimo interesse |
| Páginas visitadas | Métricas de conteúdo | Legítimo interesse |
| Timestamps de acesso | Auditoria | Legítimo interesse |

> Analytics via Cloudflare Web Analytics — sem cookies de rastreamento, sem dados pessoais identificáveis enviados a terceiros.

### 2.2 Dados de Administração (painel admin)

| Dado | Finalidade | Base Legal |
|------|-----------|------------|
| Email do admin | Autenticação | Execução de contrato (Art. 7, V) |
| Senha (hash SHA-256+HMAC) | Autenticação | Execução de contrato |
| Logs de sessão | Segurança e auditoria | Legítimo interesse |

### 2.3 Dados de Comentários (quando habilitado)

| Dado | Finalidade | Base Legal |
|------|-----------|------------|
| Nome (exibição) | Identificação no comentário | Consentimento (Art. 7, I) |
| Email | Notificações (opcional) | Consentimento |
| Conteúdo do comentário | Publicação | Consentimento |
| IP do autor | Moderação e segurança | Legítimo interesse |

---

## 3. Bases Legais Utilizadas

| Base Legal LGPD | Aplicação |
|-----------------|-----------|
| **Consentimento** (Art. 7, I) | Comentários, newsletter (quando aplicável) |
| **Execução de contrato** (Art. 7, V) | Admin panel, autenticação |
| **Legítimo interesse** (Art. 7, IX) | Analytics, segurança, logs |
| **Obrigação legal** (Art. 7, II) | Retenção fiscal (quando aplicável) |

---

## 4. Compartilhamento e Transferência Internacional

### 4.1 Operadores / Sub-processadores

| Operador | Finalidade | Localização | Salvaguarda |
|----------|-----------|-------------|-------------|
| Cloudflare Inc. | Hosting, CDN, D1, R2 | EUA (global edge) | DPA + SCCs |
| Google (Gemini API) | Geração de conteúdo AI | EUA | DPA + SCCs |

### 4.2 Transferência Internacional

Dados são processados em infraestrutura **Cloudflare** com edge nodes globais. A transferência é protegida por:
- Cláusulas Contratuais Padrão (SCCs) da Cloudflare
- Data Processing Addendum (DPA) Cloudflare
- Criptografia TLS 1.3 em trânsito
- Criptografia at-rest em D1/R2

Detalhes completos: [`docs/pims/INTERNATIONAL-TRANSFER.md`](INTERNATIONAL-TRANSFER.md)

---

## 5. Retenção e Eliminação

| Categoria | Período de Retenção | Justificativa |
|-----------|-------------------|---------------|
| Logs de acesso | 90 dias | Segurança e auditoria |
| Dados de admin | Enquanto ativo | Operacional |
| Comentários | Até remoção pelo autor ou moderador | Consentimento |
| Analytics (Cloudflare) | 30 dias (agregado) | Legítimo interesse |
| Backups D1 | 30 dias rolling | Continuidade |

Após o período, dados são eliminados automaticamente ou sob solicitação.

---

## 6. Direitos dos Titulares (LGPD Art. 18)

Os titulares podem exercer os seguintes direitos:

1. **Confirmação** — saber se dados são tratados
2. **Acesso** — obter cópia dos dados
3. **Correção** — corrigir dados incompletos ou inexatos
4. **Anonimização/Bloqueio/Eliminação** — de dados desnecessários
5. **Portabilidade** — transferência a outro fornecedor
6. **Eliminação** — de dados tratados com consentimento
7. **Informação** — sobre compartilhamento com terceiros
8. **Revogação** — do consentimento

**Como exercer:** Enviar solicitação para `security@ricardoesper.com.br`.  
**Prazo:** 15 dias corridos para resposta (Art. 18, §5º).

Procedimentos detalhados: [`docs/pims/DATA-SUBJECT-RIGHTS.md`](DATA-SUBJECT-RIGHTS.md)

---

## 7. Cookies e Tecnologias Similares

| Cookie/Tecnologia | Finalidade | Duração | Tipo |
|-------------------|-----------|---------|------|
| `sb-access-token` | Sessão admin (JWT) | 24 horas | Funcional |
| Cloudflare `__cf_bm` | Bot management | 30 min | Segurança |

> O site **não utiliza** cookies de rastreamento, remarketing ou publicidade.

---

## 8. Segurança dos Dados

Medidas técnicas e organizacionais:

- JWT com HMAC-SHA256 em cookie HttpOnly + Secure + SameSite
- Rate limiting (5 tentativas / 15 min) no login
- Todas as rotas admin protegidas por `requireAuth.ts`
- CRON_SECRET e JWT_SECRET fail-closed (sem fallback)
- TLS 1.3 obrigatório via Cloudflare
- D1 com encryption at-rest

Detalhes: [`docs/isms/ISMS-POLICY.md`](../isms/ISMS-POLICY.md) · [`docs/security/VULNERABILITY-AUDIT-2025.md`](../security/VULNERABILITY-AUDIT-2025.md)

---

## 9. Alterações nesta Política

Alterações serão publicadas nesta página com data de atualização.  
Alterações materiais serão notificadas via banner no site (quando aplicável).

---

## 10. Referências

- [Lei nº 13.709/2018 — LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ISO/IEC 27701:2019](https://www.iso.org/standard/71670.html)
- [Cloudflare DPA](https://www.cloudflare.com/resources/assets/slt3lc6tev37/5OMlo3MFJkHCIN5sLan2og/c76babb40aba1edc19292e4f9ca8e7c7/Customer_DPA_v.4_1_-_en_1_Oct_2023.pdf)
