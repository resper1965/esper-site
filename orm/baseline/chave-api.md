# Chave de API da sonda de modelo

A sonda é o único coletor do baseline que gasta dinheiro. Este guia cobre como
obter a chave, onde colocá-la, e como garantir que ela nunca entre no
repositório.

Os outros três coletores não usam credencial nenhuma:

| Comando | Precisa de chave? |
|---|---|
| `npm run baseline:busca-csv` | não — lê o CSV que você exporta |
| `npm run baseline:links` | não — lê o CSV que você exporta |
| `npm run baseline:gsc` | conta de serviço do Google, e só se você escolher o caminho automatizado |
| `npm run baseline:sonda` | **sim** |

## Quanto a sonda gasta

O cálculo é fechado e está nos arquivos, não em estimativa:

    5 prompts  ×  5 execuções  ×  1 provedor  =  25 chamadas
    5 prompts  ×  5 execuções  ×  2 provedores =  50 chamadas

As cinco execuções por prompt não são desperdício: modelo é não-determinístico,
e é isso que transforma "foi citado" numa frequência em vez de uma anedota.

As respostas são curtas — perguntas sobre uma pessoa, não geração de texto
longo. Mesmo assim, **consulte o preço corrente antes da primeira rodada** e
configure um limite de gasto. Preço de modelo muda e qualquer número que eu
escrevesse aqui envelheceria; o limite de gasto, não.

## Qual provedor

A sonda consulta dois, e **basta um**. Ela pula provedor sem chave e registra a
ausência no snapshot, em vez de fingir que mediu.

| Provedor | Variável | Modelo consultado |
|---|---|---|
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-5` |
| OpenAI | `OPENAI_API_KEY` | `gpt-5.6-terra` |

Comece por um. Dois provedores dobram o custo e, para o marco zero, um já
estabelece a linha de base — o segundo entra quando você quiser comparar
comportamento entre modelos.

## Usando a conta da bekaa

Três coisas mudam quando a chave é de conta organizacional, e vale decidir cada
uma de propósito:

**A cobrança vai para a empresa.** É trabalho de reputação pessoal rodando em
conta corporativa. Se isso é o arranjo que você quer, tudo bem — só não caia
nele sem perceber.

**A chave pertence à organização, não a você.** Quem administra a conta pode
revogá-la, e ela sobrevive à sua sessão. Isso é bom para continuidade e ruim
para isolamento.

**Crie uma chave dedicada a este uso, não reaproveite uma existente.** Nomeie
de forma que o propósito seja óbvio na lista — `baseline-orm` serve. O motivo é
prático: no dia em que precisar revogar, você revoga só isto, sem derrubar o
que mais estiver usando a chave compartilhada.

Se o provedor permitir, **configure um limite de gasto na chave ou no
projeto**. A sonda tem laço aninhado sobre modelos, prompts e execuções; um
erro de configuração que multiplique o número de execuções custa dinheiro antes
de custar atenção. O limite é a única proteção que age sem você estar olhando.

## Onde criar

- **Anthropic** — console.anthropic.com, seção de API keys
- **OpenAI** — platform.openai.com, seção de API keys

## Onde colocar

Na raiz do repositório, no arquivo `.env.baseline`. Ele não existe ainda; crie
a partir do exemplo versionado:

    cp .env.baseline.example .env.baseline

Depois preencha. Só as variáveis que você vai usar:

    ANTHROPIC_API_KEY=sk-ant-...

**Confirme que o git ignora o arquivo antes de colar qualquer valor:**

    git check-ignore -v .env.baseline

Tem que imprimir a regra que o cobre — hoje é `.gitignore:34:.env*`. Se não
imprimir nada, **pare**: o arquivo não está ignorado e a próxima adição vaza a
chave para o histórico, onde apagar não resolve.

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

    npm run baseline:sonda

O que esperar na saída, uma linha por prompt por modelo, com a contagem de
citações, menções e falhas. O snapshot vai para
`orm/baseline/snapshots/AAAA-MM-DD-modelos.json`, e as respostas cruas para
`AAAA-MM-DD-modelos-respostas.json` — este segundo arquivo é o que permite
conferir à mão se a resposta foi realmente sobre você, e se houve recusa.
Essas duas classificações não são automáticas de propósito.

Se uma chamada falhar, a corrida continua e a falha é registrada como falha,
não como "respondeu e não citou". E o arquivo é gravado a cada prompt, então
uma interrupção no meio não descarta o que já foi pago.

## Se a chave vazar

Revogar é o primeiro passo, não o último — e é por isso que a chave é dedicada
e nomeada. Revogue no painel do provedor, crie outra, atualize o
`.env.baseline`. Se ela chegou a entrar num commit, revogar é obrigatório
mesmo que o commit seja apagado depois: o histórico do git é distribuído, e o
que saiu da sua máquina não volta.
