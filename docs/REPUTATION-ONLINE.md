# Reputação online — Ricardo Esper

Plano e estado da construção de autoridade digital em torno da entidade
"Ricardo Esper". Este documento cobre o que já está no código e o que depende
de ação fora dele.

## O problema

O site já publica conteúdo com bom SEO técnico. O gargalo não é volume de
posts — é **reconhecimento de entidade**: fazer com que buscadores e modelos de
linguagem saibam, com confiança, quem é Ricardo Esper e sobre o que ele pode ser
citado. Isso se resolve com um grafo de identidade consistente e com material
que terceiros consigam reaproveitar sem pedir permissão.

## O que já está implementado

### 1. Grafo de identidade (`src/lib/site.ts`)

`identityProfiles` é a fonte única de verdade dos perfis verificados. Todo
`sameAs` dos schemas JSON-LD (`Person`, `Organization`, autor de `Article`)
deriva de `sameAsUrls`, em vez de repetir URLs em cada função.

**Regra:** só entra na lista perfil que existe e está verificado. Uma URL 404 em
`sameAs` enfraquece o grafo inteiro em vez de reforçá-lo.

**Regra:** todo perfil listado deve linkar de volta para esper.ws. Sem o link de
volta a relação é unidirecional e vale muito menos.

### 2. Página de imprensa (`/[lang]/imprensa`)

Press kit em pt-BR e en com:

- três biografias prontas (curta, média, longa) com botão de copiar;
- dados verificáveis em formato de ficha;
- temas para entrevista, com o ângulo de cada um;
- retrato oficial para download e a exigência de crédito;
- lista de canais oficiais, que também serve como aviso contra homônimos.

O objetivo é remover o atrito do jornalista com prazo apertado. Quem facilita a
citação é citado.

### 3. `/llms.txt`

Brief em texto puro para crawlers de motores de resposta, seguindo a convenção
de <https://llmstxt.org>. Traz a instrução de atribuição, os fatos
verificáveis, a desambiguação de homônimos, os perfis oficiais e o índice de
artigos.

Diferente do JSON-LD, é prosa — e prosa é o que tende a aparecer literalmente
numa resposta de IA. Vale revisar a redação com o mesmo cuidado de um texto
público.

### 4. `robots.txt`

Crawlers de motores de resposta (GPTBot, ClaudeBot, PerplexityBot, entre
outros) estão liberados explicitamente. Aqui eles são canal de distribuição,
não ameaça: ser citado é o objetivo. A permissão está declarada em regra
própria para que a intenção não seja confundida com descuido.

## O que ainda depende de ação fora do código

### Prioridade alta

1. **Criar o item no Wikidata.** É a âncora que o Knowledge Graph do Google e a
   maioria dos pipelines de treino de LLM leem diretamente. Depois de criado,
   preencher `pendingIdentityProfiles.wikidata` em `src/lib/site.ts` — o valor
   flui sozinho para todos os schemas.
2. **Criar o e-mail `imprensa@esper.ws`.** A página de imprensa já o divulga.
3. **Verificar os links de volta.** Confirmar que LinkedIn, GitHub e X apontam
   para esper.ws no campo de site.

### Prioridade média

4. **ORCID, Crunchbase, YouTube, Lattes** — slots já reservados em
   `pendingIdentityProfiles`.
5. **Foto de imprensa em resolução maior.** Hoje a página serve
   `/authors/ricardo.png`, o mesmo avatar do site. Um retrato em alta e um
   segundo em formato horizontal cobririam melhor o uso editorial.
6. **Cadência de comentário sobre incidentes.** Publicar análise de incidentes
   brasileiros em até 24 horas, no site e no LinkedIn. Ser a fonte rápida é o
   que transforma alguém no especialista para quem a imprensa liga.

### Prioridade baixa, alto retorno no longo prazo

7. Coluna fixa em veículo de nicho (CISO Advisor, Security Report, TI Inside).
8. Palestras em Mind The Sec, Roadsec, congressos de compliance.
9. Contribuição técnica aberta: OWASP, guia LGPD open-source, ferramenta de
   forense.

## Como medir

Sem medição isso vira fé. Duas verificações mensais:

- **Busca tradicional:** procurar "Ricardo Esper" em pt e en e conferir se os
  dez primeiros resultados são propriedades controladas (site, LinkedIn,
  GitHub, artigos assinados).
- **Motores de resposta:** perguntar a ChatGPT, Claude, Gemini e Perplexity
  algo como "quem são especialistas em forense digital no Brasil" e registrar
  se o nome aparece, com que atribuição e se os fatos batem com o `/llms.txt`.

Divergência entre o que a IA responde e o que o `/llms.txt` afirma é sinal de
que o texto precisa ficar mais explícito, não de que o modelo está errado.

## Nota técnica

`src/lib/schema.ts` contém uma segunda definição de `personSchema` e afins que
**não é usada por nenhuma página** — os schemas ativos vivem em
`src/lib/metadata.ts`. As duas versões já divergiram. Vale remover o arquivo
morto, mas isso foge do escopo desta mudança e ficou de fora de propósito.
