# Exportação de links

O relatório de Links do Search Console não tem API. A Search Console API
expõe apenas Search Analytics, Sitemaps, Sites e URL Inspection.

Uma vez por rodada de medição:

1. Abrir o Search Console na propriedade `sc-domain:ricardoesper.com.br`.
2. Links, e exportar "Sites com mais links" em CSV.
3. Salvar aqui como `AAAA-MM-DD-links.csv`, com a data da exportação.

Se a exportação não for feita, o snapshot registra a dimensão como não medida,
com o motivo. Isso é diferente de registrar zero link — e confundir os dois
inverteria a leitura do diff entre duas rodadas.
