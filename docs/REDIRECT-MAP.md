# Mapa de redirects — WordPress → site atual

O blog anterior em `ricardoesper.com.br` foi substituído por este app **sem
nenhum redirect**. Toda URL que o Google ainda tem indexada devolve 404, e
cada uma que ele acabar descartando leva junto os links acumulados. Este
documento registra o que foi recuperado, como, e o que falta.

Implementação: `src/lib/legacy-redirects.ts`, aplicada em `next.config.ts`.

## Como a lista foi levantada

Não existe export do WordPress no repositório, e `web.archive.org` não é
alcançável do ambiente de build. As URLs foram recuperadas por busca — ou
seja, a lista é **verificada mas incompleta**. Um blog de nove anos tem mais.

São 16 URLs confirmadas, de 2016 a 2025.

## Como completar

1. Search Console → Indexação → Páginas → **"Não encontrada (404)"**
2. Exportar a lista
3. Adicionar as que faltam em `src/lib/legacy-redirects.ts`

Enquanto isso, existe uma rede de segurança: qualquer `/AAAA/MM/slug` não
enumerado cai em `/pt-BR/blog` em vez de 404. É sinal pior que um destino
correto, e muito melhor que nada.

## O mapa

### Posts com sucessor direto

| URL antiga | Destino |
| :--- | :--- |
| `/2024/01/huaqiangbei-shenzhen` | `/pt-BR/blog/shenzhen-huaqiangbei-tecnologia` |
| `/2022/04/repensando-as-rede-ot` | `/pt-BR/blog/ot-security-ambientes-industriais` |
| `/2023/01/automacao-residencial` | `/pt-BR/blog/ia-automacao-residencial-privacidade` |
| `/2016/04/ransomware` | `/pt-BR/blog/ransomware-2025-ameaca-evolucao` |
| `/2017/10/sua-rede-wi-fi-esta-desprotegida` | `/pt-BR/blog/smart-home-seguranca-iot` |
| `/2023/02/panoptico-e-privacidade-digital` | `/pt-BR/blog/ia-privacidade-dados-riscos` |

### Páginas

| URL antiga | Destino |
| :--- | :--- |
| `/biografia-de-ricardo-esper` | `/pt-BR/sobre` |
| `/seguranca/cybersecurity` | `/pt-BR/categoria/cybersecurity` |
| `/seguranca-digital` | `/pt-BR/blog` |

### Posts sem sucessor

Caem na categoria mais próxima. **Estes ainda carregam links e buscas — vale
escrever um substituto para cada um**, e então trocar o destino aqui.

| URL antiga | Destino provisório |
| :--- | :--- |
| `/2025/01/ciberseguranca-na-aviacao` | `/pt-BR/categoria/cybersecurity` |
| `/2025/01/laboratorio-de-ameacas` | `/pt-BR/categoria/cybersecurity` |
| `/2025/01/ciberseguranca-2025` | `/pt-BR/categoria/cybersecurity` |
| `/2020/10/clonagem-de-whatsapp` | `/pt-BR/categoria/cybersecurity` |
| `/2021/11/como-proteger-o-celular-depois-de-roubado` | `/pt-BR/categoria/cybersecurity` |
| `/2022/02/mas-praticas-2` | `/pt-BR/categoria/cybersecurity` |
| `/2022/09/sociedade-paulista-de-radiologia` | `/pt-BR/blog` |

Redirecionar tudo para a home seria pior: o Google lê redirect em massa para
página não relacionada como soft 404 e descarta o sinal do mesmo jeito.

## ⚠️ Dependência: os redirects estão inertes até os posts irem ao ar

Verificado contra o servidor de produção: um redirect cujo destino é um post
do blog hoje chega numa página que devolve **200 mas renderiza "não
encontrado"** — soft 404 —, porque o banco em produção não tem tabelas.

Isso não é melhor que o 404 original. Os destinos de **categoria** funcionam
hoje; os de **post** só passam a valer quando os 36 arquivos em `.backup/`
forem publicados.

Publicar o conteúdo é **pré-requisito** da recuperação, não tarefa paralela.
O mapa foi enviado assim mesmo porque não custa nada agora e evita um segundo
passe depois.

## Verificação

Contra o servidor de produção local:

```
/2024/01/huaqiangbei-shenzhen   308 → /pt-BR/blog/shenzhen-huaqiangbei-tecnologia
/biografia-de-ricardo-esper     308 → /pt-BR/sobre
/seguranca/cybersecurity        308 → /pt-BR/categoria/cybersecurity
/2019/07/post-nao-mapeado       307 → /pt-BR/blog          (rede de segurança)
```

URLs com barra final resolvem em dois saltos — o Next remove a barra e então
aplica o redirect. Dentro do limite que o Google segue.

Os redirects de `next.config.ts` rodam **antes** do middleware, confirmado em
teste: as URLs antigas não são capturadas pelo redirect de idioma.
