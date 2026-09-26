# Posicionamento

## A frase que organiza tudo

> Cibersegurança, privacidade e contraespionagem.

Nessa ordem. Cibersegurança é o principal; contraespionagem é o diferencial
raro, não o carro-chefe.

## O que separa este perfil dos outros

**Tudo é conferível.** É a tese do site inteiro e deve reger o resto:

- O post sobre privacidade abre com um `curl` que o leitor roda.
- O caso de prompt injection tem número de processo.
- A contagem de controles da ISO 42001 foi conferida na própria norma,
  porque as fontes secundárias divergiam.
- As certificações têm emissor e número.

Afirmação que só pode ser aceita na palavra de quem escreveu não vale nada —
nem num blog, nem num fornecedor que jura que seus dados estão seguros.

**35 anos é o que ninguém copia.** 1991 não é data de fundação apenas; é o
tempo que separa quem viu a prática nascer de quem chegou depois.

**Auditor líder em 27001 e 27701, em formação na 42001.** Segurança,
privacidade e IA — os três sistemas de gestão que importam agora, com a
credencial verificável nos dois primeiros.

## Frases que já foram publicadas e funcionam

> Controle que depende de disciplina humana contínua não é controle.

> A 27001 protege a informação. A 42001 responde pelo que o sistema faz.

> Se o seu painel nunca produziu uma conversa desconfortável na diretoria,
> ele não está medindo risco. Está medindo esforço.

> Automação residencial não é um problema de dispositivo. É um problema de
> arquitetura de rede que as pessoas resolvem comprando dispositivo.

## Domínios: três apontando para um

Medido em 15/09/2026, em produção e no DNS.

    esper.ws          ─┐
    ricardoesper.com  ─┼─ 301 ─→  www.ricardoesper.com.br   (canônico)
                       ┘

Os três estão na mesma conta Cloudflare — nameservers `carol` e `jaime` nos
três. `ricardoesper.com` e `ricardoesper.com.br` recebem e-mail por Google
Workspace e têm, cada um, registro próprio de verificação do Search Console.
O salto seguinte, de `/` para `/pt-BR`, é `307` e é a negociação de idioma do
Next.js: temporário está certo ali, porque o destino depende de quem pede.

**A decisão, e o motivo:** `.com` pesa mais que `.com.br` fora do Brasil, e
mesmo assim ele aponta para cá. Um sinal consolidado vale mais que três
divididos, e com 39 posts em `pt-BR` contra 7 em `/en` não há massa para
sustentar presença internacional separada. Manter o `.com` de pé como site
próprio dividiria a entidade justamente quando o objetivo é consolidá-la.

**Quando reabrir:** se o acervo em inglês crescer a ponto de justificar
presença internacional própria. O `.com` é a peça guardada para esse dia — não
é domínio esquecido, é opção com prazo em aberto. Enquanto o inglês for
subconjunto restrito de termos de diferencial raro, o redirecionamento é o
certo.

## Pendências

- [ ] Headline e "Sobre" do LinkedIn reescritos
- [ ] Certificações na seção Licenças e Certificados
- [ ] Posts em Destaque no perfil
- [ ] Decidir o `/en`: traduzir os melhores ou desligar
- [x] Os três domínios no Search Console — feito em 15/09/2026

O que esperar de cada propriedade, já que duas só redirecionam: `esper.ws` e
`ricardoesper.com` devem mostrar pouco ou nada. Impressão ali significa URL
antiga ainda indexada, esperando consolidar; silêncio significa que o 301 fez
o serviço e não há mais o que acompanhar. O dado que alimenta a medição vem da
propriedade `ricardoesper.com.br`.
