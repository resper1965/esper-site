import Link from "next/link";
import { categoryLabel } from "@/lib/categories";
import { calculateReadingTime } from "@/lib/reading-time";
import type { Post } from "@/lib/posts";
import { postPath } from "@/lib/urls";
import { formatDateShort } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

/**
 * O card de artigo — o mesmo na home, no blog, na categoria e no 404.
 *
 * Ele consome um `CardPost`, não o post inteiro: o corpo de um artigo tem
 * dezenas de milhares de caracteres, e a lista do blog filtra no navegador.
 * Mandar o texto completo de onze posts para o cliente só para descartá-lo
 * seria pagar o artigo inteiro para exibir duas linhas dele.
 *
 * `toCardPost` faz a redução no servidor, e é lá que a data, o tempo de
 * leitura e o endereço são resolvidos — uma vez, num lugar só, em vez de
 * cada página repetindo a mesma conta com um arredondamento diferente.
 */

export interface CardPost {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  minutes: number;
  cover?: string;
  coverAlt?: string;
}

export function toCardPost(post: Post, lang: Locale): CardPost {
  const fm = post.frontMatter;
  const excerpt = fm.description || fm.excerpt || "";

  return {
    slug: post.slug,
    href: postPath(fm.language, post.slug),
    title: fm.title,
    excerpt,
    category: categoryLabel(fm.category, lang),
    date: formatDateShort(new Date(fm.date), lang),
    minutes: calculateReadingTime(`${excerpt} ${fm.title} ${post.content || ""}`),
    cover: fm.coverImage,
    coverAlt: fm.imageAlt,
  };
}

/**
 * Sem capa, o lugar dela não fica vazio: recebe o gradiente da faixa de
 * presença com o nome da categoria — o que o sistema faz quando falta a
 * fotografia, em vez de encolher o card.
 */
export function BlogCard({ post }: { post: CardPost }) {
  return (
    <Link href={post.href} className="card card-post elev-sm" aria-label={post.title}>
      {post.cover ? (
        <div
          className="card-cover"
          role="img"
          aria-label={post.coverAlt || ""}
          style={{ backgroundImage: `url(${post.cover})` }}
        />
      ) : (
        <div className="card-cover card-cover-empty">{post.category}</div>
      )}

      <div className="flex flex-col gap-1.5" style={{ padding: "16px 18px 18px" }}>
        <span className="card-kicker">{post.category}</span>
        <h3 className="card-title">{post.title}</h3>
        <p
          className="card-body"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.excerpt}
        </p>
        <span className="card-meta">
          {post.date} · {post.minutes} min
        </span>
      </div>
    </Link>
  );
}
