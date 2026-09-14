# Marca

Os geradores das peças visuais. HTML com a Montserrat embutida em base64 —
abrem em qualquer navegador, sem internet, e produzem a peça por captura na
dimensão exata.

| Arquivo | Produz |
|---|---|
| `../linkedin/banner-gerador.html` | banner 1584×396 |
| `capa-gerador-exemplo.html` | capa de post 1200×630 |
| `foto-perfil-256.png` | a foto do card de autor do site |

## Como gerar

Abra o gerador no navegador, ajuste o texto, e capture na dimensão exata.
Por linha de comando, com Chromium:

    chromium --headless --window-size=1200,630 --hide-scrollbars \
             --screenshot=saida.png file://$PWD/capa-gerador-exemplo.html

## Como a arte é escolhida

Cada capa sai do **argumento do post**, não de ícone genérico. A do DNS
mostra a cadeia de resolução com a zona marcada; a de superfície de ataque
usa os números do próprio texto; a de "propina" mostra a palavra riscada e
os eufemismos que entram no lugar.

Ícone decorativo não diz nada. O leitor já sabe que segurança tem cadeado.

## Onde as capas ficam

Em `public/images/<slug>.png`, versionadas com o código, e referenciadas no
D1 pelas colunas `cover_image` e `image_alt`. **Não duplicar aqui.**
