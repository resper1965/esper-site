import { toCardPost } from "@/components/blog-card";
import { BlogList } from "@/components/blog-list";
import { getAllPosts, type Post } from "@/lib/posts";
import { filterPostsByLanguage } from "@/lib/utils";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

// Sem metadata própria, a listagem herdava o `default` do layout — o mesmo
// título da home. Duas páginas com título idêntico competem entre si na busca.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang = (langParam === "en" ? "en" : "pt-BR") as Locale;
  const isPt = lang === "pt-BR";

  return generatePageMetadata({
    title: isPt
      ? "Artigos sobre segurança da informação"
      : "Articles on information security",
    description: isPt
      ? "Textos de Ricardo Esper sobre segurança da informação, forense digital, LGPD, GDPR, contramedidas eletrônicas e proteção executiva — escritos a partir de mais de 35 anos de prática."
      : "Writing by Ricardo Esper on information security, digital forensics, LGPD, GDPR, technical surveillance countermeasures and executive protection — drawn from more than 35 years of practice.",
    path: "/blog",
    lang,
  });
}

export default async function BlogListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  const lang = (langParam === "en" ? "en" : "pt-BR") as Locale;
  const pt = lang === "pt-BR";

  let allPosts: Post[] = [];
  try {
    allPosts = await getAllPosts();
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
  }

  const posts = filterPostsByLanguage(allPosts, lang).map((post) => toCardPost(post, lang));

  return (
    <>
      <header className="flex flex-col gap-3">
        <h6 style={{ color: "var(--color-accent)" }}>Blog</h6>
        <h1>{pt ? "Artigos" : "Articles"}</h1>
        <p style={{ fontSize: 16, color: "var(--color-neutral-400)", maxWidth: 620 }}>
          {pt
            ? "Risco, forense, privacidade e IA — escrito por quem responde por eles."
            : "Risk, forensics, privacy and AI — written by someone accountable for them."}
        </p>
      </header>

      <BlogList posts={posts} lang={lang} />
    </>
  );
}
