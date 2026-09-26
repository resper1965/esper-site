import { describe, it, expect } from 'vitest';
import { diasUteisEntre, ultimoPostEm, proximaJanela } from '@/lib/linkedin/cadencia';

describe('diasUteisEntre', () => {
  it('mesmo dia é zero dias úteis', () => {
    const d = new Date(2026, 8, 25); // sexta, 25/09/2026
    expect(diasUteisEntre(d, d)).toBe(0);
  });

  it('um dia útil seguinte conta 1', () => {
    // sexta 25/09 -> sábado 26/09 não conta como dia útil
    expect(diasUteisEntre(new Date(2026, 8, 25), new Date(2026, 8, 26))).toBe(0);
  });

  it('pula fim de semana', () => {
    // sexta 25/09 -> segunda 28/09: só a segunda é dia útil
    expect(diasUteisEntre(new Date(2026, 8, 25), new Date(2026, 8, 28))).toBe(1);
  });

  it('conta os 5 dias úteis de uma quarta até a quarta seguinte', () => {
    // quarta 23/09 -> quinta, sexta, (sáb, dom), segunda, terça, quarta = 5
    expect(diasUteisEntre(new Date(2026, 8, 23), new Date(2026, 8, 30))).toBe(5);
  });

  it('fim antes do início dá zero, não negativo', () => {
    expect(diasUteisEntre(new Date(2026, 8, 30), new Date(2026, 8, 23))).toBe(0);
  });
});

describe('ultimoPostEm', () => {
  it('acha a data mais recente entre os arquivos', () => {
    const arquivos = [
      '2026-09-11-iso-42001.txt',
      '2026-09-25-kpi-kri.txt',
      'README.md',
    ];
    expect(ultimoPostEm(arquivos)).toBe('2026-09-25');
  });

  it('ignora post apagado — o que importa é o que está no ar', () => {
    const arquivos = [
      '2026-09-11-iso-42001.txt',
      '2026-09-30-post-mais-novo.APAGADO.txt',
    ];
    expect(ultimoPostEm(arquivos)).toBe('2026-09-11');
  });

  it('sem post nenhum, devolve null', () => {
    expect(ultimoPostEm(['README.md'])).toBeNull();
  });
});

describe('proximaJanela', () => {
  it('libera quando não há post anterior', () => {
    const r = proximaJanela(null, new Date(2026, 8, 25), 5);
    expect(r.liberado).toBe(true);
    expect(r.diasUteisFaltando).toBe(0);
  });

  it('bloqueia antes de completar o mínimo de dias úteis', () => {
    // último post quarta 23/09, hoje sexta 25/09 -> 2 dias úteis passados, faltam 3
    const r = proximaJanela('2026-09-23', new Date(2026, 8, 25), 5);
    expect(r.liberado).toBe(false);
    expect(r.diasUteisDecorridos).toBe(2);
    expect(r.diasUteisFaltando).toBe(3);
  });

  it('libera exatamente no dia em que completa o mínimo', () => {
    // último post quarta 23/09, hoje quarta 30/09 -> exatamente 5 dias úteis
    const r = proximaJanela('2026-09-23', new Date(2026, 8, 30), 5);
    expect(r.liberado).toBe(true);
    expect(r.diasUteisFaltando).toBe(0);
  });

  it('continua liberado depois do mínimo', () => {
    const r = proximaJanela('2026-09-23', new Date(2026, 9, 10), 5);
    expect(r.liberado).toBe(true);
  });
});
