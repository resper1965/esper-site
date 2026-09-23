"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Linkedin, List, Search, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { openPalette } from "@/components/command-palette";
import { certificationBadges } from "@/lib/credentials";
import { COUNTRIES_VISITED } from "@/lib/site";
import type { Locale } from "@/i18n/config";

/**
 * O perfil que fica.
 *
 * A identidade sai do conteúdo e vira moldura: quem lê um artigo continua
 * vendo de quem ele é, sem precisar voltar à home. Abaixo de 900px a mesma
 * coluna volta como gaveta — um nó de DOM só, para não existirem duas
 * navegações precisando ficar em sincronia.
 *
 * A barra do topo do celular é um componente à parte, e não por gosto: ela
 * precisa estar *dentro* do `.main` para grudar no topo e para herdar o
 * padding que ela compensa com margem negativa. Como irmã do `.main`, era um
 * item de grid com faixa do próprio tamanho — `position: sticky` não tinha
 * para onde deslizar, e a margem negativa estourava 20px para fora da página
 * de cada lado. As duas conversam pelo mesmo mecanismo que a paleta ⌘K usa:
 * um evento de janela, em vez de estado erguido até o layout.
 */

const LINKEDIN = "https://www.linkedin.com/in/ricardoesper";
const EVENTO_GAVETA = "drawer:open";

/** Abre a gaveta de navegação (só existe abaixo de 900px). */
function openDrawer() {
  window.dispatchEvent(new Event(EVENTO_GAVETA));
}

function paginas(lang: Locale) {
  const pt = lang === "pt-BR";
  const L = (a: string, b: string) => (pt ? a : b);

  return [
    { href: `/${lang}/sobre`, label: L("Sobre", "About"), hint: L("trajetória", "career") },
    { href: `/${lang}/servicos`, label: L("Serviços", "Services"), hint: L("consultoria", "consulting") },
    { href: `/${lang}/palestras`, label: L("Palestras", "Talks"), hint: L("agenda", "schedule") },
    { href: `/${lang}/imprensa`, label: L("Imprensa", "Press"), hint: "press kit" },
    {
      href: `/${lang}/viagens`,
      label: L("Viagens", "Journeys"),
      hint: `${COUNTRIES_VISITED} ${L("países", "countries")}`,
    },
  ];
}

/**
 * A barra do topo no celular. Vai como primeiro filho do `.main`, que é o
 * que a faz grudar e o que torna a margem negativa correta.
 */
export function MobileBar({ lang }: { lang: Locale }) {
  const pt = lang === "pt-BR";
  const L = (a: string, b: string) => (pt ? a : b);

  return (
    <div className="mobile-bar">
      <Link href={`/${lang}`} className="flex items-center gap-2.5 mr-auto" aria-label="Ricardo Esper">
        <Image
          src="/authors/ricardo.png"
          alt=""
          width={36}
          height={36}
          className="lighten rounded-full"
          style={{ boxShadow: "0 0 0 1px var(--color-accent-700)" }}
        />
        <span style={{ fontSize: 15 }}>Ricardo Esper</span>
      </Link>
      <button
        type="button"
        onClick={openPalette}
        className="btn btn-secondary"
        style={{ width: 44, height: 44, padding: 0, border: 0 }}
        aria-label={L("Buscar", "Search")}
      >
        <Search size={18} aria-hidden />
      </button>
      <button
        type="button"
        onClick={openDrawer}
        className="btn btn-secondary"
        style={{ width: 44, height: 44, padding: 0, border: 0 }}
        aria-label={L("Abrir menu", "Open menu")}
      >
        <List size={20} aria-hidden />
      </button>
    </div>
  );
}

interface SidebarProps {
  lang: Locale;
  /** Quantos artigos existem no idioma — vira a dica ao lado de "Blog". */
  postCount: number;
}

export function Sidebar({ lang, postCount }: SidebarProps) {
  const pt = lang === "pt-BR";
  const L = (a: string, b: string) => (pt ? a : b);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Navegar fecha a gaveta. Sem isto, tocar num link no celular deixa a
  // gaveta aberta por cima da página que acabou de carregar.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const abrir = () => setOpen(true);
    window.addEventListener(EVENTO_GAVETA, abrir);
    return () => window.removeEventListener(EVENTO_GAVETA, abrir);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const roles = [
    { role: L("CEO e fundador", "CEO & founder"), org: "ness." },
    { role: L("CISO e cofundador", "CISO & co-founder"), org: "IONIC Health" },
    { role: "Board", org: "Bekaa Trusted Advisors" },
  ];

  const nav = [
    { href: `/${lang}/blog`, label: "Blog", hint: `${postCount}${L(" artigos", " articles")}` },
    ...paginas(lang),
  ];

  // Um post mantém "Blog" aceso: a leitura ainda está dentro da seção.
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className={open ? "sb is-open" : "sb"}>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="btn btn-secondary sb-close"
        style={{ width: 44, height: 44, padding: 0, border: 0 }}
        aria-label={L("Fechar menu", "Close menu")}
      >
        <X size={20} aria-hidden />
      </button>

      {/* 1 — identidade */}
      <Link href={`/${lang}`} className="flex flex-col gap-3">
        <Image
          src="/authors/ricardo.png"
          alt="Ricardo Esper"
          width={60}
          height={60}
          className="lighten rounded-full"
          style={{ boxShadow: "0 0 0 1px var(--color-accent-700)" }}
          priority
        />
        <div className="flex flex-col gap-1.5">
          <span style={{ fontSize: 17, fontWeight: 500 }}>Ricardo Esper</span>
          <div className="flex flex-col" style={{ fontSize: 12, lineHeight: 1.3 }}>
            {roles.map((r) => (
              <span key={r.org} style={{ color: "var(--color-neutral-400)" }}>
                <span style={{ color: "var(--color-text)" }}>{r.role}</span> ·{" "}
                <Brand name={r.org} />
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* 2 — a frase */}
      <div className="flex flex-col gap-3">
        <h2>
          {L(
            "Quem protege empresas precisa saber explicar o risco.",
            "Whoever protects companies must be able to explain the risk."
          )}
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-neutral-400)" }}>
          {L(
            "35 anos em segurança da informação, perito em forense digital e auditor líder ISO 27001. Escrevo sobre o que aprendi na prática — sem jargão e sem atalho.",
            "35 years in information security, digital forensics expert and ISO 27001 Lead Auditor. I write about what I’ve learned in practice — no jargon, no shortcuts."
          )}
        </p>
      </div>

      {/* 3 — o único CTA */}
      <a
        href={LINKEDIN}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
        style={{ padding: "11px 16px", fontSize: 14, justifyContent: "space-between" }}
      >
        <span className="inline-flex items-center gap-2">
          <Linkedin size={16} aria-hidden />
          {L("Falar comigo no LinkedIn", "Talk to me on LinkedIn")}
        </span>
        <ArrowUpRight size={16} aria-hidden />
      </a>

      {/* 4 — navegação */}
      <nav className="flex flex-col" aria-label={L("Navegação", "Navigation")}>
        {nav.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="nav-item"
            aria-current={isActive(p.href) ? "page" : undefined}
          >
            {p.label}
            <span className="nav-hint">{p.hint}</span>
          </Link>
        ))}
      </nav>

      {/* 5 — idioma e busca */}
      <div className="flex items-center gap-2 flex-wrap">
        <LanguageSwitcher currentLocale={lang} />
        <button type="button" onClick={openPalette} className="btn btn-secondary">
          <Search size={14} aria-hidden />
          {L("Buscar", "Search")}
          <kbd style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>⌘K</kbd>
        </button>
      </div>

      {/* 6 — certificações, no pé */}
      <div className="flex flex-col gap-2.5" style={{ marginTop: "auto" }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-neutral-600)",
          }}
        >
          {L("Certificações", "Certifications")}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {certificationBadges().map((c) => (
            <span key={c} className="tag tag-neutral" style={{ fontSize: 10 }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
