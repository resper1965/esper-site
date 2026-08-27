# Cron da Vercel — removido temporariamente

O `vercel.json` declarava um cron diário e **foi removido**. Este documento
registra por quê e como restaurá-lo.

## Por que foi removido

Toda declaração de cron faz a Vercel validar a variável `CRON_SECRET` **antes
de compilar**. A variável guardada no projeto contém espaço ou quebra de linha
numa das pontas, e a validação rejeita o deploy:

```
Error: The `CRON_SECRET` environment variable contains leading or trailing
whitespace, which is not allowed in HTTP header values.
```

O build morre em ~1 segundo, sem executar nada. **Todos os deploys de
produção desde 19/03/2026 falharam por isso** — o site no ar é o build de
26/12/2025, congelado há oito meses.

Não há correção possível no código: o valor vive nas variáveis de ambiente do
projeto e a validação acontece antes do build. Remover a declaração do cron é
o único caminho no repositório para destravar o deploy.

## Por que o custo é baixo

O cron apontava para `/api/auto-generate`, que gera posts a partir de fontes
de notícias e grava no banco. O banco em produção **não tem tabelas**, então
essa rotina não funciona há meses de qualquer forma.

A rota continua existindo e continua protegida por `CRON_SECRET` no header
`Authorization`. Ela pode ser chamada manualmente a qualquer momento. O que
foi removido é o **agendamento**, não a funcionalidade.

## Como restaurar

Pré-requisito: corrigir o `CRON_SECRET` no dashboard da Vercel, em
**Settings → Environment Variables**, sem espaço ou quebra de linha nas
pontas — e nos **três escopos**: Production, Preview e Development. Um deploy
de preview lê o escopo Preview, então corrigir só Production deixa as PRs
falhando.

Depois, recriar `vercel.json` na raiz:

```json
{
  "crons": [
    {
      "path": "/api/auto-generate",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Vale restaurar só depois que o banco em produção tiver tabelas e o blog
estiver populado — antes disso a rotina não tem onde gravar.
