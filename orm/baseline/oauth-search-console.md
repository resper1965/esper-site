# OAuth para a API do Search Console

Passo a passo para obter as três variáveis que o coletor automatizado de busca
precisa: `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET` e `GSC_REFRESH_TOKEN`.

**Isto é opcional.** O caminho padrão da medição é exportar o CSV do relatório
de Desempenho à mão, e não exige nada disto. Faça este roteiro se quiser que
`npm run baseline:gsc` colete sozinho, todo mês, sem você abrir o painel.

## O que este roteiro NÃO é

Não é hospedagem, não cria recurso, não gera cobrança e não muda nada na
Cloudflare — o site continua inteiramente lá. O "projeto" do Google Cloud aqui
é um continente vazio: existe só porque o Google coloca a criação de cliente
OAuth dentro dele. Nenhum domínio seu entra na configuração.

O que dá acesso aos dados é a **conta que autoriza**, não o cliente OAuth. Ela
precisa ter a propriedade `ricardoesper.com.br` no Search Console.

## Antes de começar

Confirme em `search.google.com/search-console` que a conta que você vai usar
enxerga a propriedade `ricardoesper.com.br`. Se não enxergar, o roteiro vai
até o fim e falha no último passo, com erro de permissão.

## 1. Criar o projeto

Em `console.cloud.google.com`, entre com a conta do passo anterior e crie um
projeto. O nome é irrelevante e pode ser `baseline-orm`.

## 2. Ativar a API

Na biblioteca de APIs do projeto, procure por **Search Console API** e ative.

Sem este passo, a credencial é criada com sucesso e a chamada falha depois com
erro de API desabilitada — que é confuso porque a autenticação terá funcionado.

## 3. Tela de consentimento: escolha `Internal`

Este é o passo que decide se o roteiro dá certo a longo prazo.

O domínio `ricardoesper.com.br` tem Google Workspace — o registro MX aponta para
`aspmx.l.google.com`. Por isso a opção **Internal** está disponível, e é a que
você quer:

| | `Internal` | `External` |
|---|---|---|
| Domínio autorizado | não pede | pede |
| Verificação pelo Google | não | pode exigir |
| Refresh token | não expira | **expira em 7 dias** enquanto o app estiver em *Testing* |

A última linha é a armadilha. Em `External` + *Testing*, o token morre toda
semana e a medição mensal quebra sempre, com erro que parece de credencial
errada. `Internal` não tem esse comportamento.

Se `Internal` aparecer desabilitado, significa que você entrou com uma conta
fora do Workspace. Volte e entre com a conta `@ricardoesper.com.br`.

## 4. Criar o cliente OAuth

Em Credenciais, crie uma credencial do tipo **ID do cliente OAuth**, e escolha
o tipo de aplicativo **Aplicativo da Web**.

Não escolha "App para computador": esse tipo não aceita URI de redirecionamento,
e sem ela o passo 5 não funciona.

Em URIs de redirecionamento autorizados, adicione exatamente:

    https://developers.google.com/oauthplayground

Esse endereço é do Google, não seu. Ele existe porque o OAuth Playground é
quem vai fazer a autorização em nome do seu cliente.

Guarde o **ID do cliente** e a **chave secreta do cliente** que aparecem ao
final. A secreta pode ser vista de novo depois, mas anote agora.

## 5. Obter o refresh token

Abra `developers.google.com/oauthplayground`.

1. Clique na **engrenagem**, no canto superior direito.
2. Marque **Use your own OAuth credentials**.
3. Cole o ID do cliente e a chave secreta.
4. Confirme que **Access type** está em **Offline**. É isto que faz o Google
   devolver um refresh token; sem isso você recebe só um token de acesso, que
   vale uma hora e não serve.
5. No painel da esquerda, em vez de procurar na lista, cole o escopo direto no
   campo de entrada:

       https://www.googleapis.com/auth/webmasters.readonly

6. **Authorize APIs**, e autorize com a conta que enxerga a propriedade.
7. Na etapa 2, **Exchange authorization code for tokens**.
8. Copie o valor de **Refresh token**.

Se o campo do refresh token vier vazio, é quase sempre o *Access type* fora de
Offline, ou uma autorização anterior da mesma conta para o mesmo cliente — o
Google só devolve refresh token na primeira. Revogue o acesso do app na conta e
refaça.

## 6. Preencher o arquivo de ambiente

Na raiz do repositório:

    cp .env.baseline.example .env.baseline

**Confirme o ignore antes de colar qualquer valor:**

    git check-ignore -v .env.baseline

Tem que imprimir a regra que o cobre. Se não imprimir nada, **pare** — a próxima
adição leva a credencial para o histórico, de onde apagar não resolve.

Preencha:

    GSC_CLIENT_ID=...
    GSC_CLIENT_SECRET=...
    GSC_REFRESH_TOKEN=...
    GSC_SITE_URL=sc-domain:ricardoesper.com.br

A última já vem preenchida no exemplo. O prefixo `sc-domain:` indica
propriedade de domínio, que é a que cobre `www`, raiz e subdomínios de uma vez.
Se você usar prefixo de URL em vez disso, o valor muda e o dado sai partido.

## 7. Verificar

    npm run baseline:gsc

Sucesso imprime `gravado AAAA-MM-DD-busca.json` com a contagem de consultas do
conjunto e de fora dele, e cria o arquivo em `orm/baseline/snapshots/`.

Como ler as falhas:

| Mensagem | Causa provável |
|---|---|
| `oauth falhou: 400` | client id, secret ou refresh token errado ou truncado |
| `oauth falhou: 401` | acesso revogado, ou token expirado por estar em External/Testing |
| `searchAnalytics falhou: 403` | a conta não tem a propriedade, ou a API não foi ativada |
| `searchAnalytics falhou: 404` | `GSC_SITE_URL` não bate com a propriedade — confira o prefixo `sc-domain:` |
| `variável de ambiente ausente: X` | o `.env.baseline` não foi lido; confira o nome do arquivo |

Se o arquivo do dia já existir, o coletor recusa antes de gastar a chamada e
diz qual arquivo está no caminho. Snapshot não se sobrescreve — o histórico é o
produto.

## Quando isto quebrar

Um refresh token dura até ser revogado. Ele morre se alguém revogar o acesso do
app na conta, se a credencial for apagada no projeto, ou se a conta perder
acesso à propriedade.

Nesses casos, refaça do passo 5 — cliente e projeto continuam válidos, só a
autorização precisa ser renovada.
