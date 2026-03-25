# Transferência Internacional de Dados — ISO 27701 / LGPD Cap. V

> Versão 1.0 · Última atualização: 2025-03-24  
> Responsável: Ricardo Esper · DPO: security@ricardoesper.com.br

---

## 1. Visão Geral

O sistema **ricardoesper.com.br** utiliza infraestrutura da Cloudflare Inc. (EUA) e Google (Gemini API, EUA), o que constitui transferência internacional de dados conforme Art. 33 da LGPD.

---

## 2. Mapeamento de Transferências

| Operador | Dados Transferidos | Destino | Finalidade |
|----------|-------------------|---------|-----------|
| **Cloudflare Inc.** | Todos (hosting D1/R2, edge processing) | EUA (edge global — 300+ PoPs) | Hosting, CDN, WAF, analytics |
| **Google (Gemini)** | Prompts de geração de conteúdo | EUA | Geração de posts via AI |

### 2.1 Dados Transferidos à Cloudflare

| Categoria | Dados | Sensibilidade |
|-----------|-------|---------------|
| Armazenamento | Posts, comentários, credenciais (hash), settings | Interno/Confidencial |
| Trânsito | Requisições HTTP, headers, IP | Público/Interno |
| Analytics | Métricas agregadas de tráfego | Público |

### 2.2 Dados Transferidos ao Google (Gemini)

| Categoria | Dados | Sensibilidade |
|-----------|-------|---------------|
| Prompts | Texto de instrução para geração de posts | Público |
| Respostas | Conteúdo gerado (posts, meta descriptions) | Público |

> **Nenhum dado pessoal de titulares** é enviado ao Gemini. Apenas prompts de geração de conteúdo editorial.

---

## 3. Base Legal para Transferência

### 3.1 LGPD Art. 33 — Hipóteses Autorizadas

| Hipótese LGPD | Aplicável | Justificativa |
|---------------|-----------|---------------|
| Art. 33, I — País com nível adequado | ⚠️ Parcial | EUA não possui decisão de adequação da ANPD |
| Art. 33, II — Cláusulas contratuais | ✅ Sim | DPA + SCCs Cloudflare e Google |
| Art. 33, III — Cláusulas padrão | ✅ Sim | Standard Contractual Clauses da UE (supletivas) |
| Art. 33, VIII — Consentimento específico | N/A | Não utilizado como base principal |

**Base legal adotada:** Art. 33, II — Garantias oferecidas pelo operador via cláusulas contratuais específicas (DPA).

---

## 4. Salvaguardas Implementadas

### 4.1 Contratuais

| Salvaguarda | Cloudflare | Google |
|-------------|-----------|--------|
| Data Processing Addendum (DPA) | ✅ [Link](https://www.cloudflare.com/resources/assets/slt3lc6tev37/5OMlo3MFJkHCIN5sLan2og/c76babb40aba1edc19292e4f9ca8e7c7/Customer_DPA_v.4_1_-_en_1_Oct_2023.pdf) | ✅ [Link](https://cloud.google.com/terms/data-processing-addendum) |
| Standard Contractual Clauses (SCCs) | ✅ Incluído no DPA | ✅ Incluído no DPA |
| Cooperação com DPO | ✅ Previsto no DPA | ✅ Previsto no DPA |
| Notificação de incidentes | ✅ 72h | ✅ 72h |
| Sub-processadores listados | ✅ [Lista pública](https://www.cloudflare.com/gdpr/subprocessors/) | ✅ [Lista pública](https://cloud.google.com/terms/subprocessors) |

### 4.2 Técnicas

| Controle | Implementação |
|----------|--------------|
| Criptografia em trânsito | TLS 1.3 (obrigatório) |
| Criptografia at-rest | D1/R2 encryption pela Cloudflare |
| Edge computing | Processamento no PoP mais próximo do visitante |
| Isolamento de dados | Workers isolados, sem shared memory |
| Minimização | Analytics anonimizado, sem cookies de rastreamento |

### 4.3 Organizacionais

| Controle | Status |
|----------|--------|
| Política de privacidade pública | ✅ `docs/pims/PRIVACY-POLICY.md` |
| Inventário de dados | ✅ `docs/pims/DATA-INVENTORY.md` |
| DPIA realizado | ✅ `docs/pims/DPIA.md` |
| Canal de direitos dos titulares | ✅ security@ricardoesper.com.br |

---

## 5. Avaliação de Risco da Transferência

| Fator | Avaliação |
|-------|-----------|
| **Legislação do destino** | EUA — sem decisão de adequação ANPD. Mitigado por DPA + SCCs |
| **Tipo de dados transferidos** | Majoritariamente públicos. Dados confidenciais = apenas hash de senha admin |
| **Volume** | Baixo — blog pessoal, ~100s de registros |
| **Acesso governamental** | Cloudflare publica Transparency Report. Dados criptografados at-rest |

**Risco residual:** **BAIXO** — dados sem sensibilidade especial, volume baixo, salvaguardas contratuais e técnicas implementadas.

---

## 6. Revisão

| Gatilho | Ação |
|---------|------|
| Novo sub-processador | Atualizar mapeamento + verificar DPA |
| Decisão de adequação ANPD para EUA | Atualizar base legal |
| Mudança na legislação do destino | Reavaliar risco |
| Semestral | Revisão de rotina |

---

## Referências

- [LGPD — Cap. V: Transferência Internacional](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Cloudflare DPA](https://www.cloudflare.com/resources/assets/slt3lc6tev37/5OMlo3MFJkHCIN5sLan2og/c76babb40aba1edc19292e4f9ca8e7c7/Customer_DPA_v.4_1_-_en_1_Oct_2023.pdf)
- [Google Cloud DPA](https://cloud.google.com/terms/data-processing-addendum)
- [`PRIVACY-POLICY.md`](PRIVACY-POLICY.md)
- [`DATA-INVENTORY.md`](DATA-INVENTORY.md)
