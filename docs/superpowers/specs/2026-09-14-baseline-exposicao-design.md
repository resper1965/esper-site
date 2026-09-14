# Linha de base de exposição — desenho

Subprojeto #0 do programa de exposição. Escrito em 14/09/2026.

## Por que este subprojeto existe primeiro

O programa de exposição tem um objetivo declarado: fazer com que **Ricardo
Esper** seja encontrado — em busca tradicional e em resposta de modelo de
linguagem. Todo o resto do programa consiste em produzir conteúdo e
conquistar link.

Nada disso é verificável sem marco zero. "A exposição aumentou" é exatamente
o tipo de afirmação que o posicionamento deste projeto rejeita: aceita na
palavra de quem escreveu. Pior, é o tipo de afirmação que sempre parece
verdadeira, porque qualquer atividade produz algum número subindo.

Este subprojeto não aumenta exposição. Ele torna o aumento falsificável.

O valor não está no primeiro snapshot — está na diferença entre ele e o
próximo, medida do mesmo jeito. Um número solto não prova nada.

## Estado medido em 14/09/2026

Medido em produção, não no build local.

| Ativo | Estado |
|---|---|
| `robots.txt` | libera GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended |
| `llms.txt` | 12.966 B; atribuição, fatos verificados, desambiguação, perfis verificados |
| `sitemap.xml` | 62 URLs, todas respondendo 200 |
| Acervo | 39 posts em `pt-BR`, 7 em `/en` |
| Search Console | verificado por DNS TXT (`google-site-verification=KhWv4…`) |
| Terceiros no site | nenhum, e a ausência é travada por `src/__tests__/sem-terceiros.test.ts` |

Duas consequências de desenho saem daí:

**A verificação do Search Console já existe e é por DNS.** Verificação por DNS
não coloca uma linha de script no site. A fonte mais autoritativa de dados de
busca é, portanto, compatível com a propriedade de "sem terceiros" — que não é
postura declarada, é teste que quebra o build.

**Nenhum coletor pode adicionar terceiro ao site.** Analytics, pixel e tag
manager estão fora por construção. Toda coleta acontece fora do navegador do
leitor: por API, contra dados que o Google, o Cloudflare e os provedores de
modelo já têm.

## O que o #0 entrega

Um snapshot datado, versionado e reexecutável do estado de exposição, em três
dimensões:

1. **Busca tradicional** — impressões, cliques e posição para um conjunto fixo
   de consultas.
2. **Autoridade** — os links externos que o Google reconhece hoje.
3. **Presença em modelo** — se, e como, os modelos citam o site.

## O que o #0 não entrega

- **Prospecção** de onde publicar. Exige ferramenta paga e pertence ao #4.
- **Recomendação** de conteúdo, pauta ou cadência. Pertence ao #2.
- **Painel.** O diff em texto entre dois snapshots basta. Painel é onde este
  tipo de projeto morre: vira manutenção de gráfico em vez de medição.
- **Agendamento automático.** Rodar à mão basta até existir a segunda medição.
  Automatizar uma coisa que rodou uma vez é adivinhar a cadência certa.

## Componentes

### 1. Conjunto de consultas

Arquivo de dados versionado, não código. É o que mais vai ser editado; embutir
num script garante que ninguém edite.

Três grupos, com propósitos distintos e métricas distintas:

**Navegacionais — o piso a defender.** Quem digita o nome já conhece a pessoa.
A disputa aqui é de desambiguação: garantir que o Ricardo Esper da
cibersegurança vença os homônimos. A seção `Disambiguation` do `llms.txt`
existe exatamente para isso, e passa a ter medição.

    ricardo esper
    ricardo esper ciso
    ricardo esper ness
    ricardo esper segurança da informação

**Categoria em português — o terreno a conquistar.** Aparecer quando alguém
procura o papel, não a pessoa. É aqui que mora o crescimento.

    auditor líder iso 27001
    auditor líder iso 27701
    iso 42001 governança de ia
    contraespionagem corporativa
    varredura eletrônica tscm
    consultor lgpd
    prompt injection indireta

**Categoria em inglês — subconjunto restrito.** Inglês tem volume muito maior
e disputa muito maior. Com 7 posts publicados, competir por "CISO" é perder.
A lista fica limitada a termos onde o diferencial é raro:

    iso 42001 lead auditor
    tscm counter-espionage brazil
    indirect prompt injection case

A lista acima é a inicial. Ela vai mudar — o formato de arquivo de dados
existe para que mudar seja barato e rastreável.

### 2. Coletor do Search Console

**A API cobre busca, mas não cobre link.** Conferido na documentação em
14/09/2026: a Search Console API expõe quatro serviços — Search Analytics,
Sitemaps, Sites e URL Inspection. O relatório de Links existe apenas na
interface. Isso divide o componente em duas metades com naturezas diferentes,
e fingir o contrário produziria um plano que quebra na primeira execução.

**Metade automática — desempenho de busca.** `POST` em
`https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`,
autenticado por OAuth com refresh token, escopo `webmasters.readonly`. Coleta,
para todo o histórico disponível:

- por consulta do conjunto: impressões, cliques, posição média, CTR;
- as consultas de maior impressão **fora** do conjunto — é como se descobre
  para o que o site já rankeia sem ninguém ter planejado, e costuma ser o dado
  mais útil da primeira medição.

**Metade manual — links.** Exportação CSV do relatório de Links, feita no
painel e largada em `orm/baseline/links/`, com a data no nome. Um parser lê o
CSV e o incorpora ao snapshot.

Trinta segundos de trabalho humano por rodada, contra um ramo inteiro de
raspagem não suportada que o Google pode quebrar sem aviso. Numa medição
mensal, a conta é óbvia. O passo manual fica documentado no próprio snapshot:
se a exportação não foi feita, o campo registra ausência em vez de zero —
"não medido" e "zero links" são coisas diferentes e confundi-las inverteria a
leitura do diff.

A credencial do Search Console **não entra no repositório**. Fica em variável
de ambiente local. Esta é a regra que mais se quebra "temporariamente", e o
teste da seção de testes existe para que quebrar custe o build.

### 3. Sonda de modelo e rastreio

Duas medidas que se complementam porque medem coisas diferentes.

**Rastreio (condição necessária).** Nos logs do Cloudflare, quais robôs de IA
buscam o site e quais URLs. É fato duro e barato. Mas rastrear não é citar:
um robô pode ler tudo e o modelo nunca mencionar o site.

**Citação (o resultado).** Conjunto fixo de prompts, executado N vezes por
modelo, registrando para cada resposta:

- o site foi citado? qual URL?
- a atribuição está correta — papel, credenciais, ano de fundação?
- houve confusão com homônimo?

Os prompts são perguntas que uma pessoa real faria, não consultas de busca:

    Quem é Ricardo Esper?
    Quem são especialistas brasileiros em contraespionagem corporativa?
    Quem pode auditar ISO 42001 no Brasil?
    Who are notable CISOs working in Brazilian healthtech?

**Ressalva registrada aqui para não ser esquecida depois:** a API de um modelo
não é a mesma superfície que o produto de consumo. ChatGPT com navegação ativa
responde diferente da API crua. A sonda mede conhecimento paramétrico mais a
recuperação que a API expõe — que não é exatamente o que o leitor vê. Por isso
a primeira rodada é conferida à mão, uma única vez, nas interfaces de consumo,
como sanidade. Essa conferência manual não vira rotina: não é reprodutível e
ninguém a mantém além do segundo mês.

O resultado da sonda é uma distribuição, não um booleano. Modelo é
não-determinístico; N execuções por prompt existem para que "foi citado" tenha
uma frequência, e não uma anedota.

## Onde mora

    orm/baseline/consultas.json     conjunto de consultas
    orm/baseline/prompts.json       conjunto de prompts da sonda
    orm/baseline/links/             exportações CSV do relatório de Links
    orm/baseline/snapshots/         um arquivo datado por execução
    scripts/                        os coletores
    src/lib/baseline/               a lógica pura que os coletores usam

JSON, e não YAML ou texto solto: o projeto já é TypeScript, o parser é nativo,
e o teste de forma da seção de testes precisa de algo que falhe alto quando a
estrutura muda. Nenhuma dependência nova.

**A fronteira entre `src/lib/baseline/` e `scripts/` é deliberada.** O Vitest
do projeto só enxerga `src/**` — lógica fora dali não tem teste. Mas `src/` é
código do site, varrido pelo `sem-terceiros.test.ts`. Então: lógica pura
— validação do conjunto, detecção de citação, montagem do snapshot — mora em
`src/lib/baseline/` e é testada; toda chamada de rede mora em `scripts/`, que
o Vitest ignora e que não é código do site.

`orm/` está fora de `src/` e de `public/` e não entra no build, conforme o
`orm/README.md`. `scripts/` já existe e já abriga script operacional.

Cada execução grava um arquivo novo, datado. Snapshot não se sobrescreve — o
histórico é o produto.

## Testes

Seguindo a prática registrada em `orm/referencia/operacao.md`: escrever o
teste, rodar contra o código anterior para provar que ele falha, e só então
corrigir. Teste que passa contra o problema não é teste.

- O conjunto de consultas tem a forma esperada, sem duplicata e sem grupo
  vazio.
- O detector de citação acerta presença e ausência contra fixtures. Inclui
  explicitamente o caso já registrado em `operacao.md`: casar com a própria
  string dentro do código do teste não é acerto.
- O detector distingue citação do site de menção ao nome sem link — são
  resultados diferentes e confundir os dois infla a métrica.
- **Nenhum snapshot contém credencial.** O teste falha se qualquer padrão de
  chave, token ou segredo aparecer em arquivo sob `orm/baseline/`.

## Decisões tomadas, e por quê

**Consultas navegacionais e de categoria, ambas.** O nome é o piso: perdê-lo
para um homônimo é o pior resultado possível, e é barato de defender. A
categoria é o teto: é onde há crescimento, e onde a medição vai doer no
começo. Medir só o nome produziria um gráfico bonito e inútil.

**Português como base, inglês restrito.** O acervo é 39 contra 7. Inglês entra
onde o diferencial é raro — contraespionagem e ISO 42001 são muito menos
disputados que "CISO" — e não onde o volume é alto.

**Camada gratuita apenas.** Para medir o backlink do próprio domínio, o
relatório de Links do Search Console basta — exportado à mão, porque não tem
API. Ferramenta paga serve à prospecção, que é outro subprojeto. Comprar
assinatura antes de existir a primeira medição é gastar para adiar.

**Um passo manual aceito de propósito.** A alternativa à exportação CSV seria
raspar a interface do Search Console: não suportado, quebra sem aviso e
custaria mais manutenção que o subprojeto inteiro.

**Sem painel.** O produto é o diff entre dois arquivos de texto.

## Onde o #0 se encaixa

O programa completo tem seis subprojetos. Cada um recebe spec e ciclo
próprios. A ordem é de dependência, não de esforço:

| # | Subprojeto | Depende de |
|---|---|---|
| 0 | Linha de base medida | — |
| 1 | LinkedIn: perfil | — |
| 2 | Motor de conteúdo | 0 |
| 3 | Distribuição social | 2 |
| 4 | Artigo em blog de terceiro | 2 |
| 5 | Portal de notícia e assessoria | 2, 4 |

O `/en` não é subprojeto. É decisão de escopo que atravessa o 2, o 3 e o 4, e
se resolve dentro do #2 — com o dado que o #0 vai produzir. Hoje a decisão
seria por intuição; depois da primeira medição, por evidência.

O #1 não depende do #0 e pode correr em paralelo: é manual, o dado já está
decidido em `orm/linkedin/perfil.md`, e o Profile API do LinkedIn é somente
leitura, então não há nada a automatizar.
