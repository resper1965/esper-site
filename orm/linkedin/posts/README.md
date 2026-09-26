# Posts publicados no LinkedIn

Um arquivo por post, nomeado `AAAA-MM-DD-assunto.txt`, com o texto exato
que foi publicado.

Serve para três coisas: não repetir argumento sem perceber, medir o que
funciona quando houver com que medir, e reaproveitar formulação boa.

O post do blog correspondente vive no D1. Aqui fica só a versão social,
que é outro texto — não um resumo do mesmo.

Post apagado não é removido: renomeia para `AAAA-MM-DD-assunto.APAGADO.txt`
e o motivo entra como nota no topo do arquivo. O texto continua servindo
para as três coisas acima; só o "publicado" deixou de ser verdade.

## Cadência

Mínimo de 5 dias úteis entre publicações. `npm run linkedin:janela` diz se
hoje está liberado, lendo a data mais recente entre os arquivos desta pasta
— post apagado não conta, porque a cadência existe para não sobrecarregar o
feed de hoje, e ele não está mais nele. Rodar antes de qualquer publicação
nova; o script sai com erro quando ainda não pode.
