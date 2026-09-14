# Perfil do LinkedIn

O que é possível fazer por API e o que é manual — medido, não suposto.

## O que NÃO dá para automatizar

**Editar o perfil.** O Profile API do LinkedIn é só leitura. Headline,
"Sobre", experiência e competências não têm endpoint de escrita, para
ninguém. Automação por navegador viola os termos e arrisca a conta — para
quem tem a reputação como ativo, o risco é desproporcional.

Toda mudança de perfil é manual.

## O que dá

Via Composio, 13 ferramentas pelo Tool Router: criar e apagar post,
comentar, upload de imagem, ler perfil e métricas. Ver
`referencia/operacao.md` para as armadilhas — principalmente a versão da
ferramenta, que precisa ser fixada.

## Banner

`banner.png`, 1584×396, no sistema visual do site. `banner-gerador.html`
regera.

Decisões de conteúdo, e os motivos:

**Cibersegurança abre e leva o destaque.** É o eixo principal;
contraespionagem é diferencial, não carro-chefe.

**Credenciais, não empresas.** Cada chip é uma busca que alguém faz —
"ISO 27001 lead auditor", "CCISO". Ninguém procura empresa para achar
pessoa. E credencial com emissor e número é verificável; nome de empresa
num banner não prova nada.

**IONIC Health nomeada com o cargo**, não como chip solto. "CISO da IONIC
Health" diz o que o nome sozinho não diz — e evita sugerir que a IONIC é
dele, como as outras.

**NESS com a data.** "desde 1991" não vende a empresa: data a pessoa. 35
anos é o diferencial mais difícil de copiar.

## Pendências

- [ ] Licenças e Certificados: ISO 27001 e ISO 27701 com emissor Global PCS
      e número PC01E090056. Campo indexado, é o que aparece em busca de
      recrutador.
- [ ] Headline reescrita. É o campo de maior peso na busca do LinkedIn.
      "Especialista em Cibersegurança | CISO" serve para dez mil pessoas.
- [ ] "Sobre" reescrito. É onde LinkedIn e Google pegam contexto — o
      equivalente à `description` do site. A maioria escreve autobiografia
      ali em vez de posicionamento.
- [ ] Posts em Destaque: os que provam a tese em vez de afirmá-la.
