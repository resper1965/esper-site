/**
 * As marcas do grupo — ness., forense.io e trustness.
 *
 * Elas têm um jeito próprio de aparecer: Montserrat 500, branco puro, com o
 * ponto no ciano da ness. É a única exceção declarada à regra do Nocturne de
 * não usar branco puro, e existe porque aqui não é cor de interface: é
 * identidade, e a mesma que sai no LinkedIn, no banner e nas peças de marca.
 *
 * Fica num componente só porque os nomes aparecem em cinco páginas (sidebar,
 * Sobre, Palestras, Imprensa, rodapé) e cada cópia à mão é um lugar onde o
 * ponto sai cinza sem ninguém notar.
 */

/** Como cada marca se escreve, quebrada no ponto. */
const MARCAS: Record<string, { antes: string; depois: string }> = {
  'ness.': { antes: 'ness', depois: '' },
  ness: { antes: 'ness', depois: '' },
  NESS: { antes: 'ness', depois: '' },
  'forense.io': { antes: 'forense', depois: 'io' },
  'trustness.': { antes: 'trustness', depois: '' },
  trustness: { antes: 'trustness', depois: '' },
  Trustness: { antes: 'trustness', depois: '' },
};

/** Para partir um texto corrido nos nomes de marca. */
const PADRAO = /(ness\.|forense\.io|[Tt]rustness\.?)/g;

export function Brand({ name }: { name: string }) {
  const marca = MARCAS[name];
  if (!marca) return <>{name}</>;

  return (
    <span className="brand">
      {marca.antes}
      <span className="brand-dot">.</span>
      {marca.depois}
    </span>
  );
}

/**
 * O mesmo tratamento dentro de um parágrafo: parte o texto nos nomes e
 * devolve cada marca já vestida. Serve para a trajetória da página Sobre,
 * onde as três aparecem no meio da prosa.
 */
export function BrandText({ children }: { children: string }) {
  const partes = children.split(PADRAO).filter(Boolean);

  return (
    <>
      {partes.map((parte, i) =>
        MARCAS[parte] ? <Brand key={i} name={parte} /> : <span key={i}>{parte}</span>
      )}
    </>
  );
}
