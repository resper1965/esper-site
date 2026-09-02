#!/usr/bin/env bash
#
# Verifica a superfície canônica do site: os domínios preteridos redirecionam
# com 301 preservando caminho, e o canônico responde.
#
# Por que existe: a consolidação de esper.ws, ricardoesper.com e do apex
# .com.br para www.ricardoesper.com.br depende de 301 permanentes que o Google
# reprocessa por meses. Se um deles cair silenciosamente — uma regra apagada
# por engano, um registro DNS alterado, um domínio que expira — a transferência
# de autoridade se perde e não há como refazer. Este script transforma essa
# falha silenciosa em falha barulhenta.
#
# Uso:
#   ./scripts/check-canonical.sh          # verifica tudo, sai != 0 se algo falhar
#
set -uo pipefail

CANONICAL="https://www.ricardoesper.com.br"
TIMEOUT=25
fails=0

red()   { printf '\033[31m%s\033[0m' "$*"; }
green() { printf '\033[32m%s\033[0m' "$*"; }

# --- 1. redirecionamentos permanentes ---------------------------------------
# Cada linha: URL de origem | destino esperado
REDIRECTS="
https://esper.ws/|$CANONICAL/
https://www.esper.ws/|$CANONICAL/
https://ricardoesper.com/|$CANONICAL/
https://www.ricardoesper.com/|$CANONICAL/
https://ricardoesper.com.br/|$CANONICAL/
"

echo "== 301 permanentes =="
while IFS='|' read -r src want; do
  [ -z "$src" ] && continue
  read -r code loc < <(curl -sS -o /dev/null -m "$TIMEOUT" \
    -w "%{http_code} %{redirect_url}" "$src" 2>/dev/null || echo "000 -")
  if [ "$code" = "301" ] && [ "$loc" = "$want" ]; then
    printf '  %s  %-34s -> %s\n' "$(green ok)" "$src" "$loc"
  else
    printf '  %s  %-34s esperado 301 -> %s, veio %s -> %s\n' \
      "$(red FALHA)" "$src" "$want" "$code" "${loc:--}"
    fails=$((fails + 1))
  fi
done <<< "$REDIRECTS"

# --- 2. preservação de caminho ----------------------------------------------
# O ponto que o Google exige para um Change of Address: as URLs antigas caem na
# página equivalente, não todas na home. É a condição mais fácil de quebrar sem
# ninguém notar, porque a home responder 200 parece "estar funcionando".
echo
echo "== caminho preservado =="
for path in /pt-BR/sobre /pt-BR/blog /pt-BR/imprensa; do
  for host in https://esper.ws https://ricardoesper.com.br; do
    read -r code loc < <(curl -sS -o /dev/null -m "$TIMEOUT" \
      -w "%{http_code} %{redirect_url}" "$host$path" 2>/dev/null || echo "000 -")
    if [ "$code" = "301" ] && [ "$loc" = "$CANONICAL$path" ]; then
      printf '  %s  %s\n' "$(green ok)" "$host$path"
    else
      printf '  %s  %s -> %s (esperado %s)\n' \
        "$(red FALHA)" "$host$path" "${loc:--}" "$CANONICAL$path"
      fails=$((fails + 1))
    fi
  done
done

# --- 3. query string ---------------------------------------------------------
echo
echo "== query preservada =="
read -r code loc < <(curl -sS -o /dev/null -m "$TIMEOUT" \
  -w "%{http_code} %{redirect_url}" "https://esper.ws/pt-BR/blog?utm_source=teste" 2>/dev/null || echo "000 -")
if [ "$code" = "301" ] && [[ "$loc" == *"utm_source=teste"* ]]; then
  printf '  %s  query chega no destino\n' "$(green ok)"
else
  printf '  %s  query perdida: %s -> %s\n' "$(red FALHA)" "$code" "${loc:--}"
  fails=$((fails + 1))
fi

# --- 4. canônico saudável ----------------------------------------------------
echo
echo "== canônico =="
for path in / /pt-BR /pt-BR/sobre /sitemap.xml /robots.txt /llms.txt; do
  code=$(curl -sS -o /dev/null -m "$TIMEOUT" -L -w "%{http_code}" "$CANONICAL$path" 2>/dev/null || echo 000)
  if [ "$code" = "200" ]; then
    printf '  %s  %s\n' "$(green ok)" "$CANONICAL$path"
  else
    printf '  %s  %s devolveu %s\n' "$(red FALHA)" "$CANONICAL$path" "$code"
    fails=$((fails + 1))
  fi
done

# --- 5. sitemap coerente -----------------------------------------------------
# Um sitemap que lista URLs de outro host ou que veio vazio quebra a indexação
# sem quebrar nenhuma página — outra falha silenciosa.
echo
echo "== sitemap =="
sm=$(curl -sS -m "$TIMEOUT" "$CANONICAL/sitemap.xml" 2>/dev/null || true)
report=$(printf '%s' "$sm" | python3 -c "
import sys, re
s = sys.stdin.read()
urls = re.findall(r'<loc>([^<]+)</loc>', s)
bad = [u for u in urls if not u.startswith('$CANONICAL')]
if len(urls) < 10:
    print(f'FALHA|apenas {len(urls)} URLs — o sitemap veio vazio ou truncado')
elif bad:
    print(f'FALHA|{len(bad)} URLs fora do canônico, ex: {bad[0]}')
else:
    print(f'ok|{len(urls)} URLs, todas no canônico')
" 2>/dev/null || echo "FALHA|não consegui ler o sitemap")

status=${report%%|*}
detail=${report#*|}
if [ "$status" = "ok" ]; then
  printf '  %s  %s\n' "$(green ok)" "$detail"
else
  printf '  %s  %s\n' "$(red FALHA)" "$detail"
  fails=$((fails + 1))
fi

# --- resultado ---------------------------------------------------------------
echo
if [ "$fails" -eq 0 ]; then
  printf '%s\n' "$(green 'Tudo certo: a superfície canônica está íntegra.')"
  exit 0
fi
printf '%s\n' "$(red "$fails verificação(ões) falharam.")"
echo
echo "Se um 301 caiu, a autoridade de SEO transferida até aqui está em risco."
echo "Restaure a Redirect Rule na zona correspondente antes de qualquer outra coisa."
exit 1
