import { BlogCard, toCardPost } from "@/components/blog-card";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import { generatePageMetadata, generateCollectionPageSchema } from "@/lib/metadata";
import { siteConfig, yearsInSecurity } from '@/lib/site';
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostsByCategory, type Post } from "@/lib/posts";
import { filterPostsByLanguage } from "@/lib/utils";
// A tabela de slugs mora em lib/categories.ts — a rota e quem monta o
// link leem a mesma fonte.
import { categoryRoutes as categoryMap } from "@/lib/categories";


interface CategoryPageProps {
  params: Promise<{ lang: Locale; category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = (resolvedParams?.lang || 'pt-BR') as Locale;
  const category = resolvedParams?.category || '';
  const dict = await getDictionary(lang);
  
  const categoryInfo = categoryMap[category];
  if (!categoryInfo) {
    return {};
  }

  const categoryName = lang === 'pt-BR' ? categoryInfo.pt : categoryInfo.en;
  const description = lang === 'pt-BR'
    ? `Artigos sobre ${categoryName.toLowerCase()} por Ricardo Esper. Especialista em cibersegurança com mais de ${yearsInSecurity()} anos de experiência.`
    : `Articles about ${categoryName.toLowerCase()} by Ricardo Esper. Cybersecurity expert with over ${yearsInSecurity()} years of experience.`;

  return generatePageMetadata({
    title: `${categoryName} - ${dict.site.name}`,
    description,
    path: `/categoria/${category}`,
    lang,
    keywords: [categoryName, 'Ricardo Esper', 'cibersegurança', 'cybersecurity'],
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const lang = (resolvedParams?.lang || 'pt-BR') as Locale;
  const category = resolvedParams?.category || '';

  const categoryInfo = categoryMap[category];
  if (!categoryInfo) {
    notFound();
  }

  const categoryName = lang === 'pt-BR' ? categoryInfo.pt : categoryInfo.en;

  // Get all posts for this category from Supabase
  let categoryPosts: Post[] = [];
  try {
    const allCategoryPosts = await getPostsByCategory(category);
    // Filter by language
    categoryPosts = filterPostsByLanguage(allCategoryPosts, lang);
  } catch (error) {
    console.error('Error getting category posts from Supabase:', error);
    categoryPosts = [];
  }

  // Generate CollectionPage schema
  const url = `${siteConfig.url}/${lang}/categoria/${category}`;
  const collectionSchema = generateCollectionPageSchema({
    name: categoryName,
    description: lang === 'pt-BR'
      ? `Artigos sobre ${categoryName.toLowerCase()}`
      : `Articles about ${categoryName.toLowerCase()}`,
    url,
    items: categoryPosts.map((post) => ({
      name: post.frontMatter.title,
      url: `/${lang}/blog/${post.slug}`,
    })),
    lang,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <header className="flex flex-col gap-3">
        <h6 style={{ color: "var(--color-accent)" }}>
          {lang === 'pt-BR' ? 'Categoria' : 'Category'}
        </h6>
        <h1>{categoryName}</h1>
        <p style={{ fontSize: 16, color: "var(--color-neutral-400)" }}>
          {categoryPosts.length} {lang === 'pt-BR' ? 'artigo(s)' : 'article(s)'}
        </p>
      </header>

      {categoryPosts.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--color-neutral-500)" }}>
          {lang === 'pt-BR'
            ? 'Nenhum artigo encontrado nesta categoria.'
            : 'No articles found in this category.'}
        </p>
      ) : (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
        >
          {categoryPosts.map((post) => (
            <BlogCard key={post.slug} post={toCardPost(post, lang)} />
          ))}
        </div>
      )}
    </>
  );
}
