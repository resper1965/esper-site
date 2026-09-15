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

  it('nome quebrado por fim de linha ainda conta como menção', () => {
    expect(detectarCitacao('O CISO Ricardo\nEsper atua em cibersegurança há 35 anos.').mencionouNome).toBe(true);
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

  // Fixa a escolha deliberada: `mencionouNome` é "o nome apareceu", e nada
  // mais. Descontar a recusa exigiria julgar sobre quem o texto fala — que é
  // exatamente o julgamento que saiu deste módulo e virou classificação
  // manual. Veja o cabeçalho de citacao.ts antes de "consertar" isto.
  it('nome dentro de uma recusa ainda conta como aparição do nome', () => {
    const r = detectarCitacao('Não tenho informações sobre Ricardo Esper.');
    expect(r.mencionouNome).toBe(true);
    expect(r.citouSite).toBe(false);
  });
});
