# Credenciais — onde está a fonte da verdade

**A fonte é o código:** `resper1965/esper-site` → `src/lib/credentials.ts`.

Esse arquivo alimenta o `hasCredential` do schema.org, o press kit e o
`llms.txt` do site. Uma segunda cópia aqui divergiria — e divergência em
credencial, num perfil de conformidade, é o erro mais caro que existe.
Por isso este arquivo **não repete a lista**.

Para conferir ou alterar, edite lá.

## O que só existe aqui: onde cada credencial precisa aparecer

| Destino | Estado |
|---|---|
| Site — schema.org, press kit, llms.txt | feito, gerado do código |
| LinkedIn → Licenças e Certificados | **pendente** |
| LinkedIn → headline | **pendente** |

O LinkedIn não lê o site. A seção Licenças e Certificados é campo indexado
e é o que aparece em busca de recrutador — declarar emissor e número lá
transforma o nome solto em credencial conferível.

## Regra ao declarar

Certificação obtida e treinamento em andamento **não são a mesma coisa**.
A ISO/IEC 42001 está em formação; declarar como concluída antes da prova
é exatamente o tipo de inflação que um auditor identifica em trinta
segundos — e que corrói tudo o mais que está escrito junto.
