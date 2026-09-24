import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCard, toCardPost } from "@/components/blog-card";
import { getAllPosts, type Post } from "@/lib/posts";
import { foundedOrganizations } from "@/lib/career";
import { certifications } from "@/lib/credentials";
import { COUNTRIES_VISITED, yearsInSecurity } from "@/lib/site";
import { filterPostsByLanguage } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

/**
 * Home.
 *
 * Quem ele é agora mora na sidebar, que fica em todas as páginas — então a
 * home não precisa se apresentar outra vez. Ela mostra o que ele escreveu,
 * o que ele faz e, no fim, os quatro números que sustentam as duas coisas.
 *
 * Os quatro saem das fontes únicas: nenhum está escrito à mão aqui, que era
 * como eles envelheciam errado antes.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  const lang = (langParam === "en" ? "en" : "pt-BR") as Locale;
  const pt = lang === "pt-BR";
  const L = (a: string, b: string) => (pt ? a : b);

  let allPosts: Post[] = [];
  try {
    allPosts = await getAllPosts();
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
  }
  const recentes = filterPostsByLanguage(allPosts, lang)
    .slice(0, 4)
    .map((post) => toCardPost(post, lang));

  const ajuda = [
    {
      href: `/${lang}/servicos`,
      title: L("Serviços", "Services"),
      text: L(
        "CISO as a service, perícia e forense digital, adequação LGPD/GDPR, varredura TSCM.",
        "CISO as a service, digital forensics, LGPD/GDPR compliance, TSCM sweeps."
      ),
    },
    {
      href: `/${lang}/palestras`,
      title: L("Palestras", "Talks"),
      text: L(
        "Risco explicado para conselhos, eventos e equipes técnicas.",
        "Risk explained for boards, events and technical teams."
      ),
    },
    {
      href: `/${lang}/imprensa`,
      title: L("Imprensa", "Press"),
      text: L(
        "Bios prontas, dados verificáveis e temas para entrevista.",
        "Ready bios, verifiable facts and interview topics."
      ),
    },
  ];

  const numeros = [
    { n: yearsInSecurity(), label: L("anos em segurança", "years in security") },
    { n: foundedOrganizations().length, label: L("empresas fundadas", "companies founded") },
    { n: certifications.length, label: L("certificações", "certifications") },
    { n: COUNTRIES_VISITED, label: L("países visitados", "countries visited") },
  ];

  return (
    <>
      {/* 1 — artigos recentes */}
      <section className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3>{L("Artigos recentes", "Recent articles")}</h3>
          <Link href={`/${lang}/blog`} className="btn btn-ghost">
            {L("Ver todos", "See all")} →
          </Link>
        </div>
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
        >
          {recentes.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* 2 — como posso ajudar */}
      <section className="flex flex-col gap-2">
        <h3 style={{ marginBottom: 10 }}>{L("Como posso ajudar", "How I can help")}</h3>
        {ajuda.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="grid items-baseline gap-5 rule row-link"
            style={{
              gridTemplateColumns: "minmax(100px, 140px) minmax(0, 1fr) auto",
              padding: "16px 0",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 500 }}>{item.title}</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-400)" }}>{item.text}</span>
            <ArrowRight size={16} style={{ color: "var(--color-neutral-600)" }} aria-hidden />
          </Link>
        ))}
      </section>

      {/* 3 — a faixa de números fecha a página */}
      <section
        className="band grid gap-6"
        style={{
          padding: "32px 36px",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        }}
      >
        {numeros.map((item) => (
          <div key={item.label} className="flex flex-col gap-3">
            <span style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {item.n}
            </span>
            <span className="accent-mark" aria-hidden />
            <span style={{ fontSize: 13, color: "var(--color-accent-200)" }}>{item.label}</span>
          </div>
        ))}
      </section>
    </>
  );
}
