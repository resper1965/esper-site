"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Search } from "lucide-react";
import type { Locale } from "@/i18n/config";

/**
 * Busca ⌘K.
 *
 * Abre de quatro lugares — o atalho, o botão da sidebar, o ícone da barra
 * do celular e o 404 — e por isso o gatilho é um evento de janela em vez de
 * estado erguido até o layout: quem quiser abrir chama `openPalette()` e
 * pronto, sem contexto nem prop atravessando quatro componentes.
 */

const EVENTO = "palette:open";

/** Abre a paleta de qualquer lugar do cliente. */
export function openPalette() {
  window.dispatchEvent(new Event(EVENTO));
}

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
}

interface Item {
  label: string;
  meta: string;
  href: string;
  group: string;
  article?: boolean;
}

export function CommandPalette({ lang }: { lang: Locale }) {
  const pt = lang === "pt-BR";
  const L = (a: string, b: string) => (pt ? a : b);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const emVoo = useRef<AbortController | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener(EVENTO, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(EVENTO, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setSelected(0);
    const id = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, [open]);

  // Cada busca cancela a anterior. Sem isso, digitar depressa deixa duas
  // requisições no ar e quem manda na tela é quem chega por último — que é
  // frequentemente a mais antiga, respondendo a um termo que já não está no
  // campo.
  const buscar = useCallback(async (q: string) => {
    emVoo.current?.abort();
    const controle = new AbortController();
    emVoo.current = controle;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controle.signal,
      });
      if (res.ok) setResults(await res.json());
    } catch (erro) {
      // Um abort é o fluxo normal aqui: quem cancelou já disparou a busca
      // seguinte, e zerar a lista faria a tela piscar entre as teclas.
      if ((erro as Error)?.name !== "AbortError") setResults([]);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (query.trim().length < 2) {
      emVoo.current?.abort();
      setResults([]);
      return;
    }
    debounce.current = setTimeout(() => buscar(query), 250);
    return () => clearTimeout(debounce.current);
  }, [query, buscar]);

  const q = query.trim().toLowerCase();

  const paginas: Item[] = [
    { label: L("Início", "Home"), path: "" },
    { label: "Blog", path: "/blog" },
    { label: L("Sobre", "About"), path: "/sobre" },
    { label: L("Serviços", "Services"), path: "/servicos" },
    { label: L("Palestras", "Talks"), path: "/palestras" },
    { label: L("Imprensa", "Press"), path: "/imprensa" },
    { label: L("Viagens", "Journeys"), path: "/viagens" },
  ]
    .filter((p) => !q || p.label.toLowerCase().includes(q))
    .map((p) => ({
      label: p.label,
      meta: "",
      href: `/${lang}${p.path}`,
      group: L("Páginas", "Pages"),
    }));

  const artigos: Item[] = results.slice(0, 8).map((r) => ({
    label: r.title,
    meta: r.category,
    href: `/${lang}/blog/${r.slug}`,
    group: L("Artigos", "Articles"),
    article: true,
  }));

  const itens = [...paginas, ...artigos];
  const sel = Math.min(selected, Math.max(0, itens.length - 1));

  const abrir = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(Math.min(sel + 1, itens.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(Math.max(sel - 1, 0));
    } else if (e.key === "Enter" && itens[sel]) {
      e.preventDefault();
      abrir(itens[sel].href);
    }
  };

  if (!open) return null;

  const grupos = Array.from(new Set(itens.map((i) => i.group)));

  return (
    <div
      className="fixed inset-0 flex justify-center"
      style={{
        zIndex: 100,
        background: "color-mix(in srgb, #000 55%, transparent)",
        backdropFilter: "blur(4px)",
        paddingTop: "12vh",
        paddingInline: 16,
      }}
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        className="elev-lg"
        style={{
          width: "min(560px, 100%)",
          alignSelf: "flex-start",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={L("Buscar no site", "Search the site")}
      >
        <div className="flex items-center gap-3 px-4 py-3 rule">
          <Search size={16} style={{ color: "var(--color-neutral-500)" }} aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={L("Buscar páginas e artigos…", "Search pages and articles…")}
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 16, color: "var(--color-text)", border: 0 }}
          />
          <kbd style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>Esc</kbd>
        </div>

        <div style={{ maxHeight: "52vh", overflowY: "auto", padding: 8 }}>
          {itens.length === 0 && (
            <p
              className="text-center py-8"
              style={{ fontSize: 14, color: "var(--color-neutral-500)" }}
            >
              {L("Nenhum resultado.", "No results.")}
            </p>
          )}

          {grupos.map((grupo) => (
            <div key={grupo}>
              <div
                style={{
                  padding: "8px 10px 4px",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-neutral-600)",
                }}
              >
                {grupo}
              </div>
              {itens
                .filter((i) => i.group === grupo)
                .map((item) => {
                  const idx = itens.indexOf(item);
                  const ativo = idx === sel;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => abrir(item.href)}
                      onMouseEnter={() => setSelected(idx)}
                      className="w-full flex items-center gap-3 text-left"
                      style={{
                        padding: "9px 10px",
                        borderRadius: "var(--radius-md)",
                        background: ativo
                          ? "color-mix(in srgb, var(--color-accent) 14%, transparent)"
                          : "transparent",
                      }}
                    >
                      {item.article ? (
                        <FileText size={16} style={{ color: "var(--color-accent)" }} aria-hidden />
                      ) : (
                        <ArrowRight size={16} style={{ color: "var(--color-accent)" }} aria-hidden />
                      )}
                      <span className="flex-1 truncate" style={{ fontSize: 14 }}>
                        {item.label}
                      </span>
                      {item.meta && (
                        <span style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>
                          {item.meta}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-4 px-4 py-2 rule-t"
          style={{ fontSize: 11, color: "var(--color-neutral-600)" }}
        >
          <span>↑↓ {L("navegar", "navigate")}</span>
          <span>↵ {L("abrir", "open")}</span>
        </div>
      </div>
    </div>
  );
}
