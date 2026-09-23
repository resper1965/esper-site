"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BlogCard, type CardPost } from "@/components/blog-card";
import type { Locale } from "@/i18n/config";

/**
 * A lista do blog: filtro por categoria e busca, os dois no navegador.
 *
 * Filtrar por categoria pela URL custava uma ida ao servidor e uma consulta
 * ao D1 para reordenar uma lista que já estava na tela. Com o acervo na casa
 * das dezenas de posts, a lista inteira cabe no cliente e o filtro responde
 * na tecla — a busca de verdade, que varre o corpo dos artigos, continua
 * sendo a do ⌘K, que consulta o índice.
 */
export function BlogList({ posts, lang }: { posts: CardPost[]; lang: Locale }) {
  const pt = lang === "pt-BR";
  const L = (a: string, b: string) => (pt ? a : b);

  const [categoria, setCategoria] = useState<string>("all");
  const [query, setQuery] = useState("");

  const categorias = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const p of posts) contagem.set(p.category, (contagem.get(p.category) ?? 0) + 1);
    return [
      { nome: "all", rotulo: L("Todos", "All"), n: posts.length },
      ...[...contagem.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([nome, n]) => ({ nome, rotulo: nome, n })),
    ];
  }, [posts, pt]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = query.trim().toLowerCase();
  const visiveis = posts.filter(
    (p) =>
      (categoria === "all" || p.category === categoria) &&
      (!q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q))
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {categorias.map((c) => {
          const ativa = c.nome === categoria;
          return (
            <button
              key={c.nome}
              type="button"
              onClick={() => setCategoria(c.nome)}
              className="btn"
              style={{
                fontSize: 13,
                padding: "5px 12px",
                borderColor: ativa ? "var(--color-accent)" : "var(--color-divider)",
                color: ativa ? "var(--color-accent)" : "var(--color-neutral-300)",
                background: ativa
                  ? "color-mix(in srgb, var(--color-accent) 10%, transparent)"
                  : "transparent",
              }}
            >
              {c.rotulo}
              <span style={{ fontSize: 11, color: "var(--color-neutral-500)" }}>{c.n}</span>
            </button>
          );
        })}

        <label
          className="flex items-center gap-2 input"
          style={{ flex: "1 1 220px", maxWidth: 300 }}
        >
          <Search size={14} style={{ color: "var(--color-neutral-500)" }} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L("Buscar artigos…", "Search articles…")}
            className="flex-1 bg-transparent outline-none"
            style={{ border: 0, fontSize: 14, color: "inherit" }}
            aria-label={L("Buscar artigos", "Search articles")}
          />
        </label>
      </div>

      {visiveis.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--color-neutral-500)" }}>
          {L("Nenhum artigo encontrado.", "No articles found.")}
        </p>
      ) : (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
        >
          {visiveis.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
