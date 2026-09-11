import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import { generatePageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import { BlogPostContent } from "@/components/blog-post-content";

interface PageProps {
  params: Promise<{ lang: Locale; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = (resolvedParams?.lang || "pt-BR") as Locale;
  const slug = resolvedParams?.slug || "";

  try {
    const post = await getPostBySlug(slug);

    if (!post) {
      return {};
    }

    const keywords = post.frontMatter.keywords || [];
    // A capa do post, quando existe, e a imagem que o LinkedIn, o WhatsApp e
    // o Google mostram no cartao do link. O `opengraph-image` e o cartao
    // gerado automaticamente, e so deve entrar quando nao ha capa propria.
    //
    // Antes daqui saia sempre o cartao gerado, ignorando `cover_image` — e o
    // JSON-LD em blog-post-content.tsx ja preferia a capa, entao as duas
    // fontes de verdade da mesma pagina discordavam entre si.
    const cover = post.frontMatter.coverImage;
    const image = cover
      ? `${siteConfig.url}${cover}`
      : `${siteConfig.url}/${lang}/blog/${slug}/opengraph-image`;

    return generatePageMetadata({
      title: post.frontMatter.title,
      description: post.frontMatter.description || post.frontMatter.excerpt || "",
      path: `/blog/${slug}`,
      image,
      lang,
      type: "article",
      publishedTime: post.frontMatter.date,
      modifiedTime: post.frontMatter.date,
      keywords,
      authors: [post.frontMatter.author || "Ricardo Esper"],
    });
  } catch {
    return {};
  }
}

export default async function BlogPost({ params }: PageProps) {
  const resolvedParams = await params;
  const lang = (resolvedParams?.lang || "pt-BR") as Locale;
  const slug = resolvedParams?.slug || "";
  const dict = await getDictionary(lang);

  if (!slug || slug.length === 0) {
    notFound();
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostContent post={post} slug={slug} lang={lang} dict={dict} />;
}
