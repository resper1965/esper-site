# Chave de API da sonda de modelo

A sonda e a classificação são os dois coletores do baseline que gastam
dinheiro, e desde a passagem pelo AI Gateway os dois gastam **da mesma
credencial**. Este guia cobre como obter o token, onde colocá-lo, quanto custa
e como garantir que ele nunca entre no repositório.

Os outros coletores não usam credencial paga:

| Comando | Precisa de chave? |
|---|---|
| `npm run baseline:busca-csv` | não — lê o CSV que você exporta |
| `npm run baseline:links` | não — lê o CSV que você exporta |
| `npm run baseline:gsc` | conta de serviço do Google, e só se você escolher o caminho automatizado |
| `npm run baseline:sonda` | **sim** — Cloudflare |
| `npm run baseline:classificar` | **sim** — o mesmo token |

## Uma credencial, não três

Antes eram uma chave da Anthropic, uma da OpenAI e um token da Cloudflare, cada
uma com sua fatura, seu painel e seu dia de vencer. Hoje é um token só: a sonda
alcança os modelos de consumo pelo AI Gateway e a classificação roda no Workers
AI, tudo na mesma conta.

O que isso muda de concreto, e é o motivo da troca:

- **uma fatura.** Crédito pré-pago da Cloudflare é teto natural: quando acaba,
  a chamada falha. Um limite que age sem você estar olhando vale mais que a
  intenção de olhar;
- **um log só.** Toda chamada leva o cabeçalho
  `cf-aig-metadata: {"projeto":"baseline-orm","rodada":"AAAA-MM-DD"}`, então dá
  para separar no log do gateway o que foi baseline do que não foi;
- **uma revogação.** No dia em que precisar cortar, corta um lugar.

| Onde | Rota | Modelo |
|---|---|---|
| Sonda, OpenAI | `/ai/v1/chat/completions` | `openai/gpt-5.5` |
| Sonda, Anthropic | `/ai/v1/messages` | `anthropic/claude-sonnet-5` |
| Classificação | `/ai/run/@cf/meta/llama-3.1-8b-instruct` | Llama 3.1 8B |

A Anthropic vai pela rota nativa, e não pela forma OpenAI, porque aquela
devolve 400 `Required value missing: max_tokens` para modelo Anthropic. O
Gemini está fora: `google-ai-studio/gemini-2.5-flash` devolveu 404 `Model not
found` em 15/09/2026, e por isso ele aparece em `naoMedidos` no snapshot, com
esse motivo escrito, em vez de sumir em silêncio.

O classificador é de propósito um modelo aberto e barato, e de propósito não é
nenhum dos dois que responderam: ali ele faz trabalho, não está sendo medido.
Llama classifica o que Claude e GPT disseram.

## Quanto isso gasta

O cálculo é fechado e está nos arquivos, não em estimativa:

    5 prompts  ×  5 execuções  ×  2 modelos  =  50 chamadas de sonda
    50 respostas                             =  até 50 chamadas de classificação

As cinco execuções por prompt não são desperdício: modelo é não-determinístico,
e é isso que transforma "foi citado" numa frequência em vez de uma anedota.

As respostas são curtas — perguntas sobre uma pessoa, não geração de texto
longo —, e o teto é explícito: `max_tokens: 1024` na sonda, folga para uma
citação inteira sem deixar uma resposta patológica correr solta, e
`max_tokens: 200` na classificação, que devolve um JSON de três campos. Mesmo
assim, **consulte o preço corrente antes da primeira rodada**. Preço de modelo
muda e qualquer número que eu escrevesse aqui envelheceria; o crédito
pré-pago, não.

## As três travas de custo

Nenhuma delas depende de alguém estar prestando atenção:

**O ensaio.** Antes de gastar qualquer coisa:

    npm run baseline:sonda:plano

Ele imprime o plano — quantas chamadas, contra qual teto, com que `max_tokens`
— e sai sem chamar nada. Rode isto sempre que mexer em `prompts.json`.

**Os tetos.** `MAX_CHAMADAS_PAGAS = 60` em `scripts/baseline-sonda.ts` e
`MAX_CLASSIFICACOES = 200` em `scripts/baseline-classificar.ts`. Se o plano
calculado passar do teto, o script sai com erro nomeando os números, **antes**
da primeira chamada. Um erro de edição que multiplique as execuções tem que
falhar alto e de graça. Se o conjunto de prompts crescer de propósito, suba o
teto de propósito, no mesmo commit — a constante existe para que subir seja uma
decisão, não um acidente.

**A guarda do mesmo dia.** Nenhum dos dois sobrescreve um snapshot existente.
Rodar duas vezes no mesmo dia é a forma mais provável de pagar duas vezes, e o
script para com erro em vez de fazer isso.

Durante a corrida, cada chamada sai numerada — `[12/50]` — para que uma
disparada apareça enquanto acontece, e não no total ao final.

## Usando a conta da bekaa

Três coisas mudam quando o token é de conta organizacional, e vale decidir cada
uma de propósito:

**A cobrança vai para a empresa.** É trabalho de reputação pessoal rodando em
conta corporativa. Se isso é o arranjo que você quer, tudo bem — só não caia
nele sem perceber.

**O token pertence à organização, não a você.** Quem administra a conta pode
revogá-lo, e ele sobrevive à sua sessão. Isso é bom para continuidade e ruim
para isolamento.

**Crie um token dedicado a este uso, não reaproveite um existente.** Nomeie de
forma que o propósito seja óbvio na lista — `baseline-orm` serve. O motivo é
prático: no dia em que precisar revogar, você revoga só isto, sem derrubar o
que mais estiver usando o token compartilhado.

## Onde criar

No painel da Cloudflare, em **My Profile · API Tokens · Create Token**, pelo
caminho **Create Custom Token**. Duas permissões, de conta:

- **Workers AI · Read** — a classificação;
- **AI Gateway · Run** — a sonda.

Não use template pronto: eles dão escopo demais para o que aqui são duas
chamadas de inferência.

O `CLOUDFLARE_ACCOUNT_ID` não é segredo, mas é obrigatório: entra na URL do
endpoint. Está na barra lateral do painel, em qualquer domínio, ou em
`wrangler whoami`.

## Onde colocar

Na raiz do repositório, no arquivo `.env.baseline`. Ele não existe ainda; crie
a partir do exemplo versionado:

    cp .env.baseline.example .env.baseline

Depois preencha as duas variáveis:

    CLOUDFLARE_API_TOKEN=
    CLOUDFLARE_ACCOUNT_ID=

Não há mais `ANTHROPIC_API_KEY` nem `OPENAI_API_KEY`: nada no repositório lê
essas duas. Se elas ainda estiverem no seu `.env.baseline`, apague — e revogue
as chaves nos provedores, porque chave que ninguém usa e ninguém vigia é só
superfície.

**Confirme que o git ignora o arquivo antes de colar qualquer valor:**

    git check-ignore -v .env.baseline

Tem que imprimir a regra que o cobre — hoje é `.gitignore:34:.env*`. Se não
imprimir nada, **pare**: o arquivo não está ignorado e a próxima adição vaza o
token para o histórico, onde apagar não resolve.

O arquivo `.env.baseline.example` é o oposto: ele é versionado de propósito, e
por isso contém apenas nomes de variável. Nunca escreva um valor nele, nem
como exemplo, nem como espaço reservado.

## A trava que já existe

Cada snapshot gravado passa por um teste que procura formato de chave — Google,
GitHub clássico e fine-grained, OpenAI, Anthropic, refresh token, client secret
e bloco de chave privada. Se qualquer um aparecer num arquivo sob
`orm/baseline/`, a suíte quebra antes do commit.

Ela detecta forma de chave, não a palavra que a nomeia: "o modelo gastou 300
tokens" não dispara nada.

Isso protege o snapshot, **não protege o `.env.baseline`**. A proteção daquele
arquivo é o `.gitignore`, e é por isso que o passo de conferência acima não é
formalidade.

## Rodar

    npm run baseline:sonda:plano   # ensaio, não gasta
    npm run baseline:sonda
    npm run baseline:classificar

O que esperar da sonda, uma linha numerada por chamada e uma linha de resumo
por prompt por modelo, com a contagem de citações, menções e falhas. O snapshot
vai para `orm/baseline/snapshots/AAAA-MM-DD-modelos.json`, e as respostas cruas
para `AAAA-MM-DD-modelos-respostas.json`.

A classificação lê esse segundo arquivo — o mais recente que houver — e grava
`AAAA-MM-DD-classificacao.json`, com a contagem de `ele`, `homonimo`, `recusa`
e `incerto` por par (modelo, prompt). Ela registra dentro do arquivo qual
modelo classificou e qual piso de confiança estava em vigor: os dois mudam os
números, e número que anda sem o instrumento que o produziu não é comparável
com o da rodada seguinte. Confiança abaixo do piso vira `incerto` — o duvidoso
não entra como medição —, e se **tudo** voltar `incerto` o arquivo grava
`naoMedido` com esse motivo, porque uma coluna de `incerto` não é medição.

Se uma chamada falhar, a corrida continua e a falha é registrada como falha,
não como "respondeu e não citou". E o arquivo da sonda é gravado a cada prompt,
então uma interrupção no meio não descarta o que já foi pago.

## Se o token vazar

Revogar é o primeiro passo, não o último — e é por isso que o token é dedicado
e nomeado. Revogue no painel da Cloudflare, crie outro, atualize o
`.env.baseline`. Se ele chegou a entrar num commit, revogar é obrigatório mesmo
que o commit seja apagado depois: o histórico do git é distribuído, e o que
saiu da sua máquina não volta.
