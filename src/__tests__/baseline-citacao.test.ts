import { describe, it, expect } from 'vitest';
import { detectarCitacao } from '@/lib/baseline/citacao';

describe('detectarCitacao', () => {
  it('reconhece citação com URL do site', () => {
    const r = detectarCitacao('Veja https://www.ricardoesper.com.br/pt-BR/sobre para detalhes.');
    expect(r.citouSite).toBe(true);
    expect(r.urls).toContain('https://www.ricardoesper.com.br/pt-BR/sobre');
  });

  it('reconhece o domínio sem esquema e sem www', () => {
    expect(detectarCitacao('fonte: ricardoesper.com.br/llms.txt').citouSite).toBe(true);
  });

  it('separa menção ao nome de citação do site', () => {
    const r = detectarCitacao('Ricardo Esper é CISO da IONIC Health.');
    expect(r.mencionouNome).toBe(true);
    expect(r.citouSite).toBe(false);
  });

  it('não conta ausência como menção', () => {
    const r = detectarCitacao('Não tenho informação sobre essa pessoa.');
    expect(r.mencionouNome).toBe(false);
    expect(r.citouSite).toBe(false);
  });

  it('aceita o nome com acento e em caixa variada', () => {
    expect(detectarCitacao('RICARDO ESPER').mencionouNome).toBe(true);
    expect(detectarCitacao('ricardo  esper').mencionouNome).toBe(true);
  });

  it('marca confusão com homônimo', () => {
    const r = detectarCitacao('Ricardo Esper é um jogador de futebol aposentado.');
    expect(r.confundiuHomonimo).toBe(true);
  });

  it('não marca homônimo quando o contexto é o correto', () => {
    const r = detectarCitacao('Ricardo Esper é auditor líder ISO 27001 e CISO.');
    expect(r.confundiuHomonimo).toBe(false);
  });

  it('não confunde outro domínio que contém o nome', () => {
    expect(detectarCitacao('veja ricardoesper.com.br.fake.example').citouSite).toBe(false);
  });

  // A armadilha registrada em orm/referencia/operacao.md: um teste casou com a
  // palavra dentro do próprio comentário. O detector recebe só a string de
  // resposta e nunca lê arquivo — então o texto deste comentário, que contém
  // ricardoesper.com.br de propósito, não pode influenciar resultado nenhum.
  it('opera apenas sobre o argumento recebido', () => {
    expect(detectarCitacao('').citouSite).toBe(false);
    expect(detectarCitacao('').urls).toEqual([]);
  });

  it('reconhece 27001 como contexto certo sem outra palavra-marcador', () => {
    expect(detectarCitacao('Ricardo Esper tem ISO 27001.').confundiuHomonimo).toBe(false);
  });

  it('reconhece 27701 como contexto certo sem outra palavra-marcador', () => {
    expect(detectarCitacao('Ricardo Esper tem ISO 27701.').confundiuHomonimo).toBe(false);
  });

  it('reconhece 42001 como contexto certo sem outra palavra-marcador', () => {
    expect(detectarCitacao('Ricardo Esper tem ISO 42001.').confundiuHomonimo).toBe(false);
  });

  it('recusa que cita o nome não conta como menção nem como homônimo', () => {
    const r = detectarCitacao('Não tenho informações sobre Ricardo Esper.');
    expect(r.recusou).toBe(true);
    expect(r.mencionouNome).toBe(false);
    expect(r.confundiuHomonimo).toBe(false);
  });

  it('recusa em inglês também é reconhecida', () => {
    const r = detectarCitacao("I don't have information about Ricardo Esper.");
    expect(r.recusou).toBe(true);
    expect(r.mencionouNome).toBe(false);
  });

  // Este caso já esperou o contrário, quando o contexto era recortado por
  // frase. Marcador na frase vizinha, a menos de 160 caracteres, agora conta —
  // é de propósito: em lista com marcadores a descrição vive na linha ao lado
  // do nome, e exigir a mesma frase fazia o campo disparar quase sempre. O
  // limite continua existindo: veja o marcador em parágrafo distante, abaixo.
  it('marcador na frase vizinha, dentro da janela, conta como contexto certo', () => {
    const r = detectarCitacao(
      'A contraespionagem corporativa é uma disciplina de segurança. Ricardo Esper atua na área.',
    );
    expect(r.confundiuHomonimo).toBe(false);
  });

  it('marcador na mesma frase do nome conta como contexto certo', () => {
    const r = detectarCitacao(
      'A contraespionagem corporativa é uma disciplina. Ricardo Esper é auditor líder ISO 27001.',
    );
    expect(r.confundiuHomonimo).toBe(false);
  });

  it('resposta sem o nome não é recusa', () => {
    expect(detectarCitacao('Não tenho informação sobre essa pessoa.').recusou).toBe(false);
  });

  it('resposta em lista não vira falso homônimo', () => {
    const r = detectarCitacao(
      'Especialistas brasileiros:\n\n- Ricardo Esper — CISO da IONIC Health, auditor líder ISO 27001\n- Outra Pessoa — professora\n',
    );
    expect(r.confundiuHomonimo).toBe(false);
  });

  it('nome quebrado por fim de linha ainda encontra o contexto', () => {
    const r = detectarCitacao('O CISO Ricardo\nEsper atua em cibersegurança há 35 anos.');
    expect(r.mencionouNome).toBe(true);
    expect(r.confundiuHomonimo).toBe(false);
  });

  it('marcador em parágrafo distante não salva o nome', () => {
    const distante = 'A contraespionagem corporativa é uma disciplina técnica. ' + 'x'.repeat(400) + ' Ricardo Esper é um chef premiado.';
    expect(detectarCitacao(distante).confundiuHomonimo).toBe(true);
  });

  it('hesitação junto de credencial não é recusa', () => {
    const r = detectarCitacao(
      'Ricardo Esper é CISO da IONIC Health. Não tenho certeza sobre a data de fundação da NESS.',
    );
    expect(r.recusou).toBe(false);
    expect(r.mencionouNome).toBe(true);
  });

  it('recusa sem nenhuma credencial continua sendo recusa', () => {
    const r = detectarCitacao('Não tenho informações sobre Ricardo Esper.');
    expect(r.recusou).toBe(true);
    expect(r.mencionouNome).toBe(false);
  });
});
