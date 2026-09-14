# Operação — o que foi aprendido apanhando

Cada item aqui custou uma investigação. Registrados para não custar duas.

## Publicação no LinkedIn via Composio

**Sempre passe `version` explicitamente.** A versão padrão da ferramenta é
`00000000_00`, a mais antiga, e ela envia `LinkedIn-Version: 20241101` —
desativada pelo LinkedIn. Resultado: `426 NONEXISTENT_VERSION`. Publicar
funcionou com `version: '20260911_00'`.

**O SDK recebe os argumentos direto**, não dentro de `arguments`:

    s.execute(slug, { owner_urn })              // funciona
    s.execute(slug, { arguments: { owner_urn } }) // "campo faltando"

**A API REST de ferramentas mostra 4; o Tool Router expõe 13.** As que só
aparecem pelo Tool Router incluem upload de imagem e criação de comentário.
Consultar `/api/v3/tools?toolkit_slug=linkedin` subestima o que dá para fazer.

**Não existe rascunho pela API.** A documentação do LinkedIn diz que
`PUBLISHED` é o único estado aceito na criação. Passar `lifecycleState:
'DRAFT'` cria post de verdade. Nunca use um estado que cria objeto para
testar validação.

**Perfil não se edita por API.** O Profile API é só leitura — headline,
"Sobre" e experiência não têm endpoint de escrita, para ninguém. Automação
por navegador viola os termos e arrisca a conta.

## Deploy do site

**O Worker sobe antes dos estáticos.** Depois do merge, o HTML já referencia
a capa nova enquanto o arquivo ainda devolve 404. Normal, resolve em poucos
minutos. Não é bug.

**Otimizador de imagem do Next não funciona no Cloudflare Workers** —
devolve 500 com `error code: 1101`. Por isso `images.unoptimized`. O preço:
o byte no disco é o byte entregue, então redimensione a origem.

**Tailwind 4 não carrega `tailwind.config.ts` sozinho** e não registra
plugin por conta própria. Precisa de `@plugin` e `@config` no CSS.

## Verificação

Toda afirmação sobre o site deve ser medida em produção, não no build local.
O padrão que funcionou o dia inteiro: escrever o teste, **rodar contra o
código antigo primeiro** para provar que ele falha, e só então corrigir.
Teste que passa contra o problema não é teste.

## Erros cometidos, para não repetir

- Afirmei que o post de teste no LinkedIn era rascunho. Não tinha como saber;
  a API não cria rascunho.
- Um teste comparou posições no arquivo e casou com a palavra dentro do meu
  próprio comentário. Teste errado, não código errado.
- Uma varredura de verificação montou URLs sem a barra e reportou sucesso
  sobre 404 — passou pelo motivo errado.
