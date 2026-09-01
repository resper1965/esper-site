#!/usr/bin/env bash
#
# Migra o DNS de esper.ws para a Cloudflare e prepara o redirecionamento 301
# para https://www.ricardoesper.com.br
#
# Uso:
#   export CLOUDFLARE_API_TOKEN=...      # token com Zone:Edit + Zone Settings:Edit
#   ./scripts/esper-ws-to-cloudflare.sh
#
# O script NAO troca o nameserver — isso e feito por voce no painel da Hostinger.
# Ele para e espera nesse ponto, e so continua depois que a zona ativar.
#
set -euo pipefail

DOMAIN="esper.ws"
TARGET="https://www.ricardoesper.com.br"
API="https://api.cloudflare.com/client/v4"

# --- valores de e-mail medidos no DNS publico em 2026-08-31 -------------------
# Se algum destes mudar antes de voce rodar o script, atualize aqui primeiro.
MX_RECORDS=(
  "1|ASPMX.L.GOOGLE.COM"
  "5|ALT1.ASPMX.L.GOOGLE.COM"
  "5|ALT2.ASPMX.L.GOOGLE.COM"
  "10|ALT3.ASPMX.L.GOOGLE.COM"
  "10|ALT4.ASPMX.L.GOOGLE.COM"
)
SPF='v=spf1 include:_spf.google.com ~all'
DMARC='v=DMARC1; p=none; rua=mailto:postmaster@esper.ws'
# O DKIM e longo e contem um espaco no meio do base64. Isso NAO e erro: e o
# valor publicado hoje, e ele e replicado byte a byte de proposito.
DKIM='v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppdFqpPlVmraUrpHXMfloWUXF7F5FKKGf1VC+uZEejDzOnaKzO1GXhET6KAI29ueknlMVNbq82ricGSeMmajzPp0+RrgebbiQDzoqwRUe0NMDe867vEI1SVpMuilfK5XEstebHW17nF6idzWcY6Sztx+FNh9wbNGYKDjsnrn7hfKx/XKWDTgJQiDgKbkuqw4a i3A7IC1cH6qxS31jIntiLvzla0W5a5qttdjbswAW619bGCON/rjXI3MTHa7pJ2TqxOxJ4mdXoCprXJWq0JK/lS1Qu5vf+oHQmj1Yp32be+MfYkoQ5KzDM+RB7Mdt3Tml6D4YRDEcdKHaSHctVALpwIDAQAB'

: "${CLOUDFLARE_API_TOKEN:?defina CLOUDFLARE_API_TOKEN}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[32mok\033[0m   %s\n' "$*"; }
warn() { printf '  \033[33maviso\033[0m %s\n' "$*"; }
die()  { printf '\033[31merro\033[0m %s\n' "$*" >&2; exit 1; }

cf() { # cf METHOD PATH [json]
  local m=$1 p=$2 body=${3:-}
  if [ -n "$body" ]; then
    curl -sS -X "$m" "$API$p" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/json" --data "$body"
  else
    curl -sS -X "$m" "$API$p" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
  fi
}

jq_get() { python3 -c "import sys,json;d=json.load(sys.stdin);print($1)"; }

# --- 1. cria (ou encontra) a zona --------------------------------------------
bold "1. Zona $DOMAIN na Cloudflare"

ZONE_JSON=$(cf GET "/zones?name=$DOMAIN")
ZONE_ID=$(printf '%s' "$ZONE_JSON" | python3 -c "
import sys,json
r=json.load(sys.stdin)['result']
print(r[0]['id'] if r else '')")

if [ -z "$ZONE_ID" ]; then
  ACCOUNT_ID=$(cf GET "/accounts?per_page=1" | jq_get "d['result'][0]['id']")
  CREATE=$(cf POST "/zones" "{\"name\":\"$DOMAIN\",\"type\":\"full\",\"account\":{\"id\":\"$ACCOUNT_ID\"}}")
  printf '%s' "$CREATE" | python3 -c "
import sys,json
d=json.load(sys.stdin)
if not d['success']:
    print(json.dumps(d['errors'], ensure_ascii=False)); sys.exit(1)
" || die "nao consegui criar a zona"
  ZONE_ID=$(printf '%s' "$CREATE" | jq_get "d['result']['id']")
  ok "zona criada: $ZONE_ID"
else
  ok "zona ja existe: $ZONE_ID"
fi

NS=$(cf GET "/zones/$ZONE_ID" | jq_get "' '.join(d['result']['name_servers'])")

# --- 2. registros de e-mail (o que nao pode quebrar) -------------------------
bold "2. Registros de e-mail"

upsert() { # upsert TYPE NAME CONTENT [PRIORITY]
  local type=$1 name=$2 content=$3 prio=${4:-}
  local payload
  payload=$(python3 - "$type" "$name" "$content" "$prio" <<'PY'
import json,sys
t,n,c,p = sys.argv[1:5]
d = {"type":t,"name":n,"content":c,"ttl":1,"proxied":False}
if p: d["priority"]=int(p)
print(json.dumps(d))
PY
)
  # procura um registro identico ja existente
  local existing
  existing=$(cf GET "/zones/$ZONE_ID/dns_records?type=$type&name=$name" | python3 - "$content" <<'PY'
import sys,json
want = sys.argv[1]
for r in json.load(sys.stdin)['result']:
    if r['content'].strip('"') == want:
        print(r['id']); break
PY
)
  if [ -n "$existing" ]; then
    ok "$type $name (ja presente)"
  else
    cf POST "/zones/$ZONE_ID/dns_records" "$payload" >/dev/null
    ok "$type $name (criado)"
  fi
}

for r in "${MX_RECORDS[@]}"; do
  upsert MX "$DOMAIN" "${r#*|}" "${r%|*}"
done
upsert TXT "$DOMAIN" "$SPF"
upsert TXT "_dmarc.$DOMAIN" "$DMARC"
upsert TXT "google._domainkey.$DOMAIN" "$DKIM"

# --- 3. remove a Vercel, poe o originless ------------------------------------
bold "3. Registros do site"

cf GET "/zones/$ZONE_ID/dns_records" | python3 -c "
import sys,json
for r in json.load(sys.stdin)['result']:
    if r['type'] in ('A','AAAA','CNAME') and ('vercel' in r['content'] or r['content']=='216.150.1.1'):
        print(r['id'], r['type'], r['name'], r['content'])
" | while read -r id type name content; do
  cf DELETE "/zones/$ZONE_ID/dns_records/$id" >/dev/null
  ok "removido $type $name -> $content"
done

for host in "$DOMAIN" "www.$DOMAIN"; do
  cf POST "/zones/$ZONE_ID/dns_records" \
    "{\"type\":\"AAAA\",\"name\":\"$host\",\"content\":\"100::\",\"proxied\":true,\"ttl\":1}" >/dev/null 2>&1 \
    && ok "AAAA $host -> 100:: (proxied)" \
    || warn "AAAA $host ja existia"
done

# --- 4. verificacao ANTES da troca de NS -------------------------------------
bold "4. Conferindo o e-mail nos nameservers novos"

echo
cf GET "/zones/$ZONE_ID/dns_records?per_page=100" | python3 -c "
import sys,json
for r in sorted(json.load(sys.stdin)['result'], key=lambda x:(x['type'],x['name'])):
    p = ' [proxied]' if r.get('proxied') else ''
    pr = f\" prio={r['priority']}\" if 'priority' in r else ''
    print(f\"  {r['type']:6} {r['name']:34} {r['content'][:70]}{pr}{p}\")
"
echo
bold "Confira acima: 5 MX do Google, o SPF, o _dmarc e o google._domainkey."
bold "O DKIM tem 411 caracteres e um espaco no meio. Se estiver truncado, PARE."
echo

read -r -p "Os registros de e-mail estao corretos? [s/N] " ans
[ "$ans" = "s" ] || die "abortado antes da troca de NS. Nada no ar mudou."

# --- 5. troca de NS (manual) --------------------------------------------------
bold "5. Troque o nameserver na Hostinger"
echo
echo "  Nameservers da Cloudflare para esta zona:"
for n in $NS; do echo "    $n"; done
echo
echo "  Painel Hostinger -> Dominios -> $DOMAIN -> Servidores DNS/Nameservers"
echo "  -> 'Alterar nameservers' -> cole os dois acima -> salvar."
echo
read -r -p "Ja trocou e a zona aparece 'Active' na Cloudflare? [s/N] " ans
[ "$ans" = "s" ] || { echo "Ok. Rode o script de novo quando tiver trocado."; exit 0; }

# --- 6. redirect rule ---------------------------------------------------------
bold "6. Criando a Redirect Rule 301"

RULES=$(python3 - "$TARGET" <<'PY'
import json,sys
target = sys.argv[1]
print(json.dumps({
  "rules": [{
    "action": "redirect",
    "description": "esper.ws -> canonico (301, path + query preservados)",
    "expression": "true",
    "action_parameters": {
      "from_value": {
        "status_code": 301,
        "target_url": {"expression": f'concat("{target}", http.request.uri.path)'},
        "preserve_query_string": True
      }
    }
  }]
}))
PY
)

cf PUT "/zones/$ZONE_ID/rulesets/phases/http_request_dynamic_redirect/entrypoint" "$RULES" \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)
print('  ok   regra criada' if d['success'] else json.dumps(d['errors'], ensure_ascii=False))"

# --- 7. teste -----------------------------------------------------------------
bold "7. Teste"
for u in "https://$DOMAIN/" "https://www.$DOMAIN/pt-BR/sobre" "https://$DOMAIN/blog?x=1"; do
  printf '  %-42s ' "$u"
  curl -sS -o /dev/null -m 20 -w '%{http_code} -> %{redirect_url}\n' "$u" || echo "(falhou)"
done
echo
bold "Esperado: 301 em todos, com o caminho e a query preservados."
