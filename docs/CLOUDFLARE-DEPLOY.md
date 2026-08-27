# Deploy em Cloudflare Workers

O site roda em Workers pelo adaptador OpenNext. Este documento registra as
duas armadilhas de configuração que já custaram tempo de depuração e que o
repositório sozinho não revela, porque vivem no dashboard.

## Build: `npm run build:cf`, nunca `npm run build`

`npm run build` roda só o `next build`. Quem gera `.open-next/worker.js` —
o entry-point que o `wrangler` publica — é `npm run build:cf`
(`opennextjs-cloudflare build`), que internamente roda o `next build` antes
de empacotar.

Com o comando errado, a build passa (o `next build` é bem-sucedido) e a
falha só aparece no deploy:

```
Success: Build command completed
Executing user deploy command: npx wrangler versions upload
✘ [ERROR] The entry-point file at ".open-next/worker.js" was not found.
```

O "Success" na linha anterior é o que torna esse erro confuso.

## Há dois triggers de build, cada um com seu próprio build command

Esta é a parte não óbvia. Workers Builds cria **dois** triggers:

| Trigger | Branches | Deploy command |
|---|---|---|
| produção | `main` | `npx wrangler deploy` |
| `Deploy non-production branches` | tudo menos `main` | `npx wrangler versions upload` |

Cada um guarda o **seu próprio** build command. Corrigir o de produção na
tela de Settings → Build **não** corrige o das PRs, e como as PRs rodam pelo
trigger de não-produção, o check continua vermelho mesmo depois de a tela
mostrar o valor certo.

Os dois precisam de `npm run build:cf`.

O de não-produção não é editável naquela tela. Pela API:

```
PATCH /accounts/{account_id}/builds/triggers/{trigger_uuid}
{"build_command": "npm run build:cf"}
```

O `trigger_uuid` sai do registro de qualquer build:
`GET /accounts/{account_id}/builds/builds/{build_uuid}` → `result.trigger`.

## Deploy manual

`npx wrangler deploy` **não reconstrói**. Ele publica o que estiver em
`.open-next/`, então um bundle velho é publicado em silêncio:

```
npm run build:cf && npx wrangler deploy
```

## Segredos

Nunca no `wrangler.toml`. `JWT_SECRET`, `ANTHROPIC_API_KEY` e
`TURNSTILE_SECRET_KEY` entram por `npx wrangler secret put <NOME>`, que pede
o valor de forma interativa — sem passar pelo histórico do shell.

## O que verificar depois de um deploy

O `wrangler dev` não pega tudo: o D1 é inalcançável em build time, então
rotas prerenderizadas saem vazias e são servidas do cache. Confira contra o
Worker de verdade:

```
U=https://esper-site.ness.workers.dev
curl -s $U/sitemap.xml | grep -c '<loc>'   # 47, não 12
curl -s $U/rss.xml     | grep -c '<item>'  # 35
curl -s $U/llms.txt    | grep -c 'com.br/blog/'   # 0 — toda URL leva locale
```

Um sitemap curto é o sintoma de que a rota voltou a ser estática.

## Antes do cutover

`workers_dev = true` no `wrangler.toml` existe só enquanto os domínios
apontam para outro lugar. Depois do cutover, desligar: o site emite canonical
para `www.ricardoesper.com.br`, e um espelho indexável em `workers.dev`
dilui exatamente o que se quer concentrar.
