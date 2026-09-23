import { Brand } from "@/components/brand";
import type { Locale } from "@/i18n/config";

/**
 * Rodapé.
 *
 * Encolheu de quatro colunas de links para uma linha. A navegação inteira
 * mora na sidebar, que está sempre visível — repeti-la aqui era duplicar a
 * mesma lista no mesmo scroll. Ficam a assinatura e as marcas.
 *
 * Saíram o selo "Sistema Online" e o "Powered by Cloudflare": o primeiro
 * fingia telemetria que o site não tem, e o segundo anuncia o fornecedor de
 * hospedagem a quem veio ler sobre risco.
 */
export default function Footer({ lang }: { lang: Locale }) {
  const pt = lang === "pt-BR";
  const ano = new Date().getFullYear();

  const marcas = [
    "ness.",
    "IONIC Health",
    "forense.io",
    "trustness.",
    "Infinity Safe",
    "Bekaa",
  ];

  return (
    <footer
      className="rule-t flex flex-wrap items-center gap-x-6 gap-y-2"
      style={{ paddingTop: 24, fontSize: 12, color: "var(--color-neutral-600)" }}
    >
      <p>
        © {ano} Ricardo Esper.{" "}
        {pt ? "Todos os direitos reservados." : "All rights reserved."}
      </p>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {marcas.map((m, i) => (
          <span key={m} className="inline-flex items-center gap-2">
            {i > 0 && <span aria-hidden>·</span>}
            <Brand name={m} />
          </span>
        ))}
      </p>
    </footer>
  );
}
