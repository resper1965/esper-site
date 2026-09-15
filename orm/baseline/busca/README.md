# Exportação de desempenho de busca

Este é o caminho padrão para a metade de busca do snapshot, porque não exige
nada: nem cliente OAuth, nem credencial, nem variável de ambiente.

A alternativa automatizada é `npm run baseline:gsc`, que fala com a Search
Console API e precisa de um cliente OAuth configurado (`GSC_CLIENT_ID`,
`GSC_CLIENT_SECRET`, `GSC_REFRESH_TOKEN`, `GSC_SITE_URL`). Ela continua no
lugar e grava `AAAA-MM-DD-busca.json` — nome diferente do que este caminho
grava, `AAAA-MM-DD-busca-csv.json`, para que rodar os dois no mesmo dia nunca
apague uma medição com a outra.

Uma vez por rodada de medição:

1. Abrir o Search Console na propriedade `ricardoesper.com.br`.
2. Desempenho, escolher a janela de datas da rodada, aba **Consultas**.
3. Exportar, formato CSV.
4. Salvar aqui como `AAAA-MM-DD-busca.csv`, com a data da exportação.
5. `npm run baseline:busca-csv`.

Se a exportação não for feita, o snapshot registra a dimensão como não medida,
com o motivo. Isso é diferente de registrar zero impressão — e confundir os
dois inverteria a leitura do diff entre duas rodadas.

## O cabeçalho é uma suposição

Os nomes de coluna que o parser procura (`Consultas principais`, `Cliques`,
`Impressões`, `CTR`, `Posição`, e as grafias equivalentes em inglês) **não
foram conferidos contra uma exportação real**. O Search Console exporta no
idioma da interface, e o texto exato pode não ser esse.

Se a primeira exportação falhar, a mensagem de erro imprime os cabeçalhos que
encontrou no arquivo ao lado dos que procurava. Copiar o texto encontrado para
a tabela `CABECALHOS` em `src/lib/baseline/busca-csv.ts` resolve — é uma linha.

O idioma dos números vem do mesmo cabeçalho, e não de um palpite sobre o
valor: em pt-BR `1.234` é mil duzentos e trinta e quatro; em inglês, um vírgula
duzentos e trinta e quatro. Adivinhar isso já dividiu contagem por mil uma vez.
