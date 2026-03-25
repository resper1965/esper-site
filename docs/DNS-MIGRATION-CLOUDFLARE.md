# Migração DNS — esper.ws → Cloudflare

> **Data**: 2026-03-24
> **Status**: Pendente
> **Domínio**: esper.ws
> **DNS atual**: Hostinger (`ns1.dns-parking.com`, `ns2.dns-parking.com`)
> **Site atual**: Vercel (`216.150.1.1`)
> **Email**: Google Workspace

---

## Registros DNS Atuais

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | `@` | `216.150.1.1` (Vercel) | 3600 |
| CNAME | `www` | `7536d29daabe98e6.vercel-dns-016.com` | 14400 |
| MX | `@` | `ASPMX.L.GOOGLE.COM` (pri 1) | 3600 |
| MX | `@` | `ALT1.ASPMX.L.GOOGLE.COM` (pri 5) | 3600 |
| MX | `@` | `ALT2.ASPMX.L.GOOGLE.COM` (pri 5) | 3600 |
| MX | `@` | `ALT3.ASPMX.L.GOOGLE.COM` (pri 10) | 3600 |
| MX | `@` | `ALT4.ASPMX.L.GOOGLE.COM` (pri 10) | 3600 |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | 3600 |

---

## Passo 1 — Adicionar zona no Cloudflare

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) (conta **NESS**)
2. Clique **"Add a site"** → digite `esper.ws`
3. Selecione plano **Free**
4. Cloudflare importa automaticamente os registros. Verifique que estão corretos:

| Tipo | Nome | Valor | Proxy |
|------|------|-------|-------|
| A | `@` | `216.150.1.1` | ❌ DNS only (temporário) |
| CNAME | `www` | `7536d29daabe98e6.vercel-dns-016.com` | ❌ DNS only |
| MX | `@` | Todos os 5 registros Google | — |
| TXT | `@` | SPF do Google | — |

5. Anote os 2 nameservers fornecidos pelo Cloudflare (ex: `xxx.ns.cloudflare.com`)

---

## Passo 2 — Trocar nameservers no Hostinger

1. Acesse **hpanel.hostinger.com** → Domínios → `esper.ws`
2. Em **DNS / Nameservers**, troque:
   - ~~`ns1.dns-parking.com`~~
   - ~~`ns2.dns-parking.com`~~
3. Para os nameservers do Cloudflare (do Passo 1)
4. Salve — propagação leva **até 24h** (geralmente < 1h)

---

## Passo 3 — Após propagação (zona ativa no Cloudflare)

1. **Remover** o A record do Vercel (`216.150.1.1`)
2. **Remover** o CNAME `www` do Vercel
3. Adicionar o **Workers custom domain** via dashboard ou wrangler:
   ```bash
   # O worker "esper-site" será acessível em esper.ws
   # Configurar em Cloudflare Dashboard > Workers > esper-site > Triggers > Custom Domains
   ```
4. Os registros **MX e TXT (Google Workspace) não mudam**

---

## URL Temporária (Workers)

Enquanto o DNS não migra, o site estará disponível em:

```
https://esper-site.<ACCOUNT_SUBDOMAIN>.workers.dev
```

> Para descobrir a URL exata após deploy: `npx wrangler deployments list`

---

## ⚠️ Checklist de Segurança

- [ ] Verificar que todos os MX records foram importados no Cloudflare
- [ ] Testar envio/recebimento de email após troca de nameservers
- [ ] Confirmar HTTPS funcionando no Workers custom domain
- [ ] Verificar redirect www → apex (ou vice-versa)
- [ ] Atualizar `NEXT_PUBLIC_SITE_URL` se necessário
