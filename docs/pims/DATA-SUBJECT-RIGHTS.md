# Direitos dos Titulares — ISO 27701 / LGPD Art. 18

> Versão 1.0 · Última atualização: 2025-03-24  
> Responsável: Ricardo Esper · DPO: security@ricardoesper.com.br

---

## 1. Direitos Garantidos

| # | Direito | LGPD | Descrição | Aplicável |
|---|---------|------|-----------|-----------|
| 1 | Confirmação | Art. 18, I | Confirmar se dados são tratados | ✅ |
| 2 | Acesso | Art. 18, II | Obter cópia dos dados pessoais | ✅ |
| 3 | Correção | Art. 18, III | Corrigir dados incompletos ou inexatos | ✅ |
| 4 | Anonimização | Art. 18, IV | Anonimizar, bloquear ou eliminar dados desnecessários | ✅ |
| 5 | Portabilidade | Art. 18, V | Transferir dados a outro controlador | ✅ |
| 6 | Eliminação | Art. 18, VI | Eliminar dados tratados com consentimento | ✅ |
| 7 | Informação | Art. 18, VII | Saber com quem dados são compartilhados | ✅ |
| 8 | Revogação | Art. 18, IX | Revogar consentimento dado anteriormente | ✅ |

---

## 2. Canal de Solicitação

| Canal | Detalhe |
|-------|---------|
| **Email** | security@ricardoesper.com.br |
| **Assunto** | `[LGPD] <Tipo do Direito> - <Nome do Titular>` |
| **SLA de confirmação** | 48 horas |
| **SLA de resposta** | 15 dias corridos (Art. 18, §5º) |

---

## 3. Processo de Atendimento

### 3.1 Fluxo

```
Solicitação     Verificação      Análise        Execução       Resposta
recebida   ───▶ de identidade ──▶ do pedido ──▶ técnica   ──▶  ao titular
  (D+0)          (D+2)            (D+5)         (D+10)        (D+15)
```

### 3.2 Verificação de Identidade

Para proteger os dados dos titulares, toda solicitação requer verificação:

1. **Email cadastrado** — Solicitação deve vir do email vinculado aos dados
2. **Informação confirmatória** — Titular deve informar dado que confirme a identidade (ex: email usado em comentário)
3. **Documento** — Em caso de dúvida, pode ser solicitado documento com foto (opcional)

> Dados de terceiros **não serão** fornecidos sem procuração ou autorização legal.

### 3.3 Procedimentos por Direito

| Direito | Procedimento Técnico | Formato de Resposta |
|---------|---------------------|---------------------|
| **Confirmação** | Consulta D1 por email/IP | Sim/Não por email |
| **Acesso** | Export D1 → JSON/CSV | Arquivo enviado por email |
| **Correção** | UPDATE em D1 | Confirmação por email |
| **Anonimização** | Substituir identificadores por hash | Confirmação por email |
| **Portabilidade** | Export D1 → JSON (formato aberto) | Arquivo enviado por email |
| **Eliminação** | DELETE em D1 + purge R2 (se aplicável) | Confirmação por email |
| **Informação** | Consultar lista de sub-processadores | Email com lista |
| **Revogação** | Revogar consentimento + eliminar dados | Confirmação por email |

---

## 4. Exceções e Retenção Obrigatória

Certos dados podem ser retidos mesmo após solicitação de eliminação:

| Situação | Base Legal | Período |
|----------|-----------|---------|
| Obrigação legal/regulatória | Art. 16, I | Conforme legislação |
| Exercício de direitos em processo | Art. 16, IV | Até decisão final |
| Logs de segurança (IP, timestamps) | Legítimo interesse | 90 dias |

O titular será informado caso a eliminação não possa ser completa, com a justificativa legal.

---

## 5. Registro de Solicitações

Todas as solicitações são registradas para fins de compliance:

| Campo | Registro |
|-------|---------|
| Data da solicitação | Timestamp |
| Tipo do direito | Categorização |
| Identidade verificada | Sim/Não |
| Data da resposta | Timestamp |
| Resultado | Atendido / Parcial / Negado (com justificativa) |

> Registros de solicitações são mantidos por **5 anos** para fins de accountability (Art. 6, X LGPD).

---

## 6. Reclamação à ANPD

Caso o titular não fique satisfeito com a resposta, pode registrar reclamação junto à:

**Autoridade Nacional de Proteção de Dados (ANPD)**  
Website: [gov.br/anpd](https://www.gov.br/anpd)  
Email: anpd@anpd.gov.br

---

## Referências

- [`PRIVACY-POLICY.md`](PRIVACY-POLICY.md)
- [`DATA-INVENTORY.md`](DATA-INVENTORY.md)
- [LGPD — Lei nº 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
