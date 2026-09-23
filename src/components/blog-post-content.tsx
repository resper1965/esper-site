import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, Linkedin } from "lucide-react";

import { CodeCopyButtons } from "@/components/code-copy-button";
import { HashScrollHandler } from "@/components/hash-scroll-handler";
import { toCardPost, type CardPost } from "@/components/blog-card";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/metadata";
import { categoryLabel, categorySlug } from "@/lib/categories";
import { getAllPosts, type Post } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { formatDateShort, filterPostsByLanguage } from "@/lib/utils";
import { getAuthor } from "@/lib/authors";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Locale } from "@/i18n/config";

const LINKEDIN = "https://www.linkedin.com/in/ricardoesper";

interface BlogPostContentProps {
  post: Post;
  slug: string;
  lang: Locale;
  dict: {
    nav: { home: string };
    blog: { backToArticles: string };
  };
}

/**
 * A página de um artigo.
 *
 * Uma coluna só, com três medidas: 760px no cabeçalho, 880px na capa e
 * 660px no corpo. A medida do corpo é a que importa — é o que sustenta uma
 * linha de leitura confortável no tamanho 17px.
 *
 * O sumário lateral e a barra de progresso saíram: com o perfil ocupando a
 * coluna da esquerda em todas as páginas, um terceiro trilho vertical deixa
 * o artigo espremido entre dois painéis de navegação.
 */
export async function BlogPostContent({ post, slug, lang, dict }: BlogPostContentProps) {
  const fm = post.frontMatter;
  const pt = lang === "pt-BR";
  const L = (a: string, b: string) => (pt ? a : b);

  const categoria = categoryLabel(fm.category, lang);
  // O link para a página da categoria: é o único lugar do site que aponta
  // para /categoria/<slug> desde que o rodapé encolheu, e sem ele aquelas
  // rotas ficam sem nenhuma ligação interna.
  const slugCategoria = categorySlug(fm.category);
  const hrefCategoria = slugCategoria ? `/${lang}/categoria/${slugCategoria}` : undefined;
  const data = formatDateShort(new Date(fm.date), lang);
  const autor = getAuthor("ricardo");
  const lead = fm.description || fm.excerpt || "";

  const url = `${siteConfig.url}/${lang}/blog/${slug}`;
  const image = fm.coverImage ? `${siteConfig.url}${fm.coverImage}` : `${url}/opengraph-image`;

  const conteudo = post.htmlContent?.toString() || "";
  const palavras = conteudo.split(/\s+/).filter((p: string) => p.length > 0).length;
  const minutos = Math.max(1, Math.ceil(palavras / 200));

  const articleSchema = generateArticleSchema({
    title: fm.title,
    description: lead,
    url,
    image,
    datePublished: fm.date,
    dateModified: fm.date,
    keywords: fm.keywords || [],
    lang,
    wordCount: palavras,
    timeRequired: `PT${minutos}M`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.nav.home, url: `/${lang}` },
    { name: "Blog", url: `/${lang}/blog` },
    { name: fm.title, url },
  ]);

  // Continue lendo: dois artigos, mesma categoria primeiro. Buscar aqui e
  // não na página evita passar a lista inteira como prop só para reduzi-la.
  let relacionados: CardPost[] = [];
  try {
    const outros = filterPostsByLanguage(await getAllPosts(), lang).filter(
      (p) => p.slug !== slug
    );
    const mesmaCategoria = outros.filter((p) => p.frontMatter.category === fm.category);
    const resto = outros.filter((p) => p.frontMatter.category !== fm.category);
    relacionados = [...mesmaCategoria, ...resto].slice(0, 2).map((p) => toCardPost(p, lang));
  } catch (error) {
    console.error("Erro ao buscar relacionados:", error);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CodeCopyButtons />
      <HashScrollHandler />

      <article className="flex flex-col gap-9">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1"
          style={{ fontSize: 13, color: "var(--color-neutral-500)" }}
        >
          <Link href={`/${lang}/blog`} className="inline-flex items-center gap-1 row-link">
            <ChevronLeft size={14} aria-hidden />
            Blog
          </Link>
          <span aria-hidden>/</span>
          {hrefCategoria ? (
            <Link href={hrefCategoria} className="row-link">
              {categoria}
            </Link>
          ) : (
            <span>{categoria}</span>
          )}
        </nav>

        <header className="flex flex-col gap-4" style={{ maxWidth: 760 }}>
          <span className="card-kicker" style={{ fontSize: 11 }}>
            {categoria}
          </span>
          <h1>{fm.title}</h1>
          {lead && (
            <p style={{ fontSize: 19, lineHeight: 1.5, color: "var(--color-neutral-300)" }}>
              {lead}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Image
              src={autor.avatar}
              alt=""
              width={28}
              height={28}
              className="lighten rounded-full"
            />
            <span style={{ fontSize: 13, color: "var(--color-neutral-300)" }}>{autor.name}</span>
            <span style={{ fontSize: 13, color: "var(--color-neutral-500)" }}>
              {data} · {minutos} {L("min de leitura", "min read")}
            </span>
          </div>
        </header>

        {fm.coverImage && (
          <Image
            src={fm.coverImage}
            alt={fm.imageAlt || fm.title}
            width={1200}
            height={630}
            priority
            style={{ maxWidth: 880, width: "100%", height: "auto", borderRadius: "var(--radius-lg)" }}
          />
        )}

        <div
          className="post-body"
          style={{ maxWidth: 660 }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.htmlContent) }}
        />

        <section
          className="rule-t flex flex-wrap items-center justify-between gap-4"
          style={{ paddingTop: 28, maxWidth: 760 }}
        >
          <p style={{ fontSize: 16 }}>
            {L(
              "Quer discutir este tema com a sua equipe ou conselho?",
              "Want to discuss this with your team or board?"
            )}
          </p>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <Linkedin size={16} aria-hidden />
            {L("Falar comigo no LinkedIn", "Talk to me on LinkedIn")}
            <ArrowUpRight size={16} aria-hidden />
          </a>
        </section>

        {relacionados.length > 0 && (
          <section className="flex flex-col gap-4">
            <h4>{L("Continue lendo", "Keep reading")}</h4>
            <div className="flex flex-col">
              {relacionados.map((r) => (
                <Link
                  key={r.slug}
                  href={r.href}
                  className="flex items-center gap-4 rule row-link"
                  style={{ padding: "14px 0" }}
                >
                  {r.cover ? (
                    <span
                      className="card-cover"
                      role="img"
                      aria-label={r.coverAlt || ""}
                      style={{
                        width: 140,
                        flex: "none",
                        borderRadius: "var(--radius-md)",
                        backgroundImage: `url(${r.cover})`,
                      }}
                    />
                  ) : (
                    <span
                      className="card-cover card-cover-empty"
                      style={{ width: 140, flex: "none", borderRadius: "var(--radius-md)" }}
                    />
                  )}
                  <span className="flex flex-col gap-1">
                    <span className="card-kicker">{r.category}</span>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{r.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
