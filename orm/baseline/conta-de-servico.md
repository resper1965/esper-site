# Conta de serviço para a API do Search Console

Passo a passo para obter as duas variáveis que o coletor automatizado de busca
precisa: `GSC_SA_EMAIL` e `GSC_SA_PRIVATE_KEY`.

**Isto é opcional.** O caminho padrão da medição é exportar o CSV do relatório
de Desempenho à mão, e não exige nada disto. Faça este roteiro se quiser que
`npm run baseline:gsc` colete sozinho, todo mês, sem você abrir o painel.

## Por que conta de serviço, e não OAuth

Um cliente OAuth exige tela de consentimento, uma autorização feita no
navegador e um refresh token — que, se a tela ficar como `External` em
*Testing*, expira a cada sete dias e quebra a medição mensal em silêncio, com
erro que parece de credencial errada.

Uma conta de serviço não tem nada disso. Ela é uma identidade com e-mail
próprio, e o acesso vem de adicionar esse e-mail como usuário da propriedade no
Search Console. Sem navegador, sem tela de consentimento, sem token que vence.

## O que este roteiro NÃO é

Não é hospedagem, não cria recurso, não gera cobrança e não muda nada na
Cloudflare — o site continua inteiramente lá. O "projeto" do Google Cloud aqui
é um continente vazio: existe só porque o Google coloca a criação de conta de
serviço dentro dele. Nenhum domínio seu entra na configuração.

O que dá acesso aos dados é a **propriedade compartilhada com a conta de
serviço**, não o projeto. A conta não precisa de permissão nenhuma no GCP.

## Antes de começar

Confirme em `search.google.com/search-console` que você administra a
propriedade `ricardoesper.com.br` — é isso que permite adicionar usuários. Se
não administrar, o roteiro vai até o fim e falha no passo 4.

## 1. Criar o projeto e a conta de serviço

Em `console.cloud.google.com`, crie um projeto — o nome é irrelevante e pode
ser `baseline-orm` — ou reaproveite um que já exista.

Em IAM e administrador → Contas de serviço, crie uma conta. O nome pode ser
`baseline-orm`.

Quando a tela pedir **papel no projeto, não conceda nenhum** e siga adiante.
Não é descuido: esta conta não precisa de permissão alguma no Google Cloud. O
único acesso que ela vai usar é o do Search Console, concedido no passo 4, e
papel de projeto não tem relação com isso.

## 2. Criar a chave JSON

Na conta recém-criada, aba Chaves → Adicionar chave → Criar nova chave →
**JSON**. O arquivo baixa uma vez só e não pode ser baixado de novo.

Trate-o como senha: ele contém a chave privada inteira. Guarde fora do
repositório.

## 3. Copiar o e-mail da conta

No JSON, o campo `client_email`. É um endereço no formato
`nome@projeto.iam.gserviceaccount.com`. Esse é o valor de `GSC_SA_EMAIL`, e é
também o que você vai adicionar no passo seguinte.

## 4. Dar acesso à propriedade no Search Console

Em `search.google.com/search-console`, propriedade `ricardoesper.com.br`:

    Configurações → Usuários e permissões → Adicionar usuário

Cole o `client_email` do passo 3 e escolha **Restrito**.

Comece por Restrito de propósito: ele já cobre a leitura de desempenho de
busca, que é tudo que este coletor faz. Suba para **Completo** só se a API
devolver 403 — conceder permissão a mais antes de precisar é dar acesso que
ninguém vai usar.

## 5. Ativar a API

Na biblioteca de APIs do projeto, procure por **Search Console API** e ative,
se ainda não estiver ativa.

Sem este passo, a credencial funciona e a chamada falha depois com erro de API
desabilitada — confuso, porque a autenticação terá dado certo.

## 6. Preencher o arquivo de ambiente

Na raiz do repositório:

    cp .env.baseline.example .env.baseline

**Confirme o ignore antes de colar qualquer valor:**

    git check-ignore -v .env.baseline

Tem que imprimir a regra que o cobre. Se não imprimir nada, **pare** — a próxima
adição leva a credencial para o histórico, de onde apagar não resolve.

Preencha:

    GSC_SA_EMAIL=nome@projeto.iam.gserviceaccount.com
    GSC_SA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
    GSC_SITE_URL=sc-domain:ricardoesper.com.br

A chave privada é o campo `private_key` do JSON. Lá dentro ela já vem com as
quebras de linha escritas como `\n` literais — copie o valor **inteiro**,
incluindo as linhas `BEGIN` e `END`, numa linha só, e mantenha as aspas. Sem as
aspas o valor é cortado no primeiro espaço.

Se você colar a chave com quebras de linha reais, o arquivo quebra no meio do
valor e a variável chega truncada. O coletor desfaz o `\n` escapado sozinho e
recusa, antes de chamar a rede, qualquer valor que não comece por `-----BEGIN`.

`GSC_SITE_URL` já vem preenchida no exemplo. O prefixo `sc-domain:` indica
propriedade de domínio, que é a que cobre `www`, raiz e subdomínios de uma vez.
Se você usar prefixo de URL em vez disso, o valor muda e o dado sai partido.

## 7. Verificar

    npm run baseline:gsc

Sucesso imprime `gravado AAAA-MM-DD-busca.json` com a contagem de consultas do
conjunto e de fora dele, e cria o arquivo em `orm/baseline/snapshots/`.

Como ler as falhas:

| Mensagem | Causa provável |
|---|---|
| `token da conta de serviço falhou: 400` | chave privada malformada — valor cortado na cópia, `\n` não escapado, ou aspas faltando |
| `token da conta de serviço falhou: 401` | a chave foi apagada no projeto, ou a conta de serviço foi desativada |
| `searchAnalytics falhou: 403` | o `client_email` não foi adicionado como usuário da propriedade, ou a API não foi ativada |
| `searchAnalytics falhou: 404` | `GSC_SITE_URL` não bate com a propriedade — confira o prefixo `sc-domain:` |
| `chave privada não parece PEM` | o valor não começa por `-----BEGIN`; quase sempre veio truncado |
| `variável de ambiente ausente: X` | o `.env.baseline` não foi lido; confira o nome do arquivo |

O 400 e o 403 são a confusão mais comum, e apontam para lados opostos: 400 é
problema do valor colado, 403 é problema de quem tem acesso à propriedade. A
mensagem sozinha não distingue os dois — a tabela acima é o mapa.

Se o arquivo do dia já existir, o coletor recusa antes de gastar a chamada e
diz qual arquivo está no caminho. Snapshot não se sobrescreve — o histórico é o
produto.

## Quando isto quebrar

Chave de conta de serviço **não expira**. Este roteiro se faz uma vez e não
volta a pedir atenção — que é exatamente o ponto de um trabalho mensal e não
supervisionado.

Para revogar, qualquer um dos dois basta:

- apagar a chave na conta de serviço, no projeto do Google Cloud;
- remover o usuário em Configurações → Usuários e permissões, no Search Console.

O primeiro invalida a credencial; o segundo tira o acesso ao dado. Fazer os
dois é o mais limpo, mas um só já fecha o caminho.
