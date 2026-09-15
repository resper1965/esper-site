# ORM — reputação online

Material de trabalho da reputação: identidade visual, textos de rede social
e referência de posicionamento. O objetivo é um só — **ser encontrado como
"O Ricardo Esper"**, em busca tradicional e em resposta de modelo.

Vive no repositório do site de propósito. Um PR que muda credencial em
`src/lib/credentials.ts` encosta no documento que fala dela; em
repositórios separados, os dois divergem sem ninguém perceber.

Nada aqui entra no build — a pasta está fora de `src/` e de `public/`.

## Eixos editoriais

Em ordem de prioridade, definida em 14/09/2026:

1. **Cibersegurança** — o principal
2. **Privacidade**
3. **Contraespionagem**

Fora do eixo, mantidos de propósito: viagem, vida, automação residencial.

## Estrutura

    baseline/     medição de exposição: consultas, prompts, snapshots datados
    linkedin/     banner, gerador e os textos publicados
    marca/        sistema visual e os geradores das peças
    referencia/   posicionamento, memória operacional, credenciais

`baseline/` é o instrumento, não o conteúdo: guarda o conjunto de consultas e
de prompts, as exportações que alimentam os coletores, e um snapshot datado por
rodada. O valor não está no primeiro snapshot — está na diferença entre ele e o
próximo, medida do mesmo jeito. Ver `baseline/chave-api.md` antes da primeira
execução da sonda, que é o único coletor que gasta dinheiro.

## Onde cada coisa mora

| O quê | Onde | Por quê |
|---|---|---|
| Conteúdo dos posts | D1, tabela `posts` | publicado, muda sem deploy |
| Capas dos posts | `public/images/` | servidas pelo site |
| Credenciais | `src/lib/credentials.ts` | alimenta schema.org e press kit |
| Banner, posicionamento, social | **aqui** | não é código, não é publicado |

A regra é uma só: **cada informação tem um lugar**. Quando algo aqui
espelha o código, o arquivo aponta para a fonte em vez de copiar.

## Sistema visual

Mesmo do site: fundo `#0a0f1a`, acento `#00ade8`, Montserrat, régua ciano,
chip de categoria.

| Peça | Dimensão |
|---|---|
| Banner do LinkedIn | 1584 × 396 |
| Capa de post / og:image | 1200 × 630 |
| Foto de perfil | 256 × 256, exibida a 96 |

Os geradores são HTML com as fontes embutidas em base64 — abrem em qualquer
navegador, sem internet, e produzem a peça por captura na dimensão exata.

No banner, o avatar do LinkedIn cobre o canto inferior esquerdo. Por isso o
conteúdo fica alinhado à direita.

## O que não entra

- Chave de API, token, credencial de qualquer tipo.
- Material protegido por direito autoral — norma ISO, relatório pago,
  infográfico de terceiro. Citar, medir e referenciar: sim. Reproduzir: não.
- Cópia do que já está versionado em `public/` ou em `src/`.
