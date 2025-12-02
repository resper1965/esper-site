import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { BlogCard } from "@/components/blog-card";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import { generatePageMetadata, generateCollectionPageSchema } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});

const categoryMap: Record<string, { pt: string; en: string }> = {
  cybersecurity: { pt: 'Cibersegurança', en: 'Cybersecurity' },
  counterespionage: { pt: 'Contraespionagem', en: 'Counterespionage' },
  forensics: { pt: 'Forense Digital', en: 'Digital Forensics' },
  intelligence: { pt: 'Inteligência', en: 'Intelligence' },
  compliance: { pt: 'Compliance', en: 'Compliance' },
  leadership: { pt: 'Liderança', en: 'Leadership' },
  homeautomation: { pt: 'Automação Residencial', en: 'Home Automation' },
  general: { pt: 'Geral', en: 'General' },
  vida: { pt: 'Vida', en: 'Life' },
  travel: { pt: 'Viagens', en: 'Travel' },
};

interface CategoryPageProps {
  params: Promise<{ lang: Locale; category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { lang, category } = await params;
  const dict = await getDictionary(lang);
  
  const categoryInfo = categoryMap[category];
  if (!categoryInfo) {
    return {};
  }

  const categoryName = lang === 'pt-BR' ? categoryInfo.pt : categoryInfo.en;
  const description = lang === 'pt-BR'
    ? `Artigos sobre ${categoryName.toLowerCase()} por Ricardo Esper. Especialista em cibersegurança com mais de 34 anos de experiência.`
    : `Articles about ${categoryName.toLowerCase()} by Ricardo Esper. Cybersecurity expert with over 34 years of experience.`;

  return generatePageMetadata({
    title: `${categoryName} - ${dict.site.name}`,
    description,
    path: `/categoria/${category}`,
    lang,
    keywords: [categoryName, 'Ricardo Esper', 'cibersegurança', 'cybersecurity'],
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { lang, category } = await params;

  const categoryInfo = categoryMap[category];
  if (!categoryInfo) {
    notFound();
  }

  const categoryName = lang === 'pt-BR' ? categoryInfo.pt : categoryInfo.en;

  // Get all posts for this category
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categoryPosts: any[] = [];
  try {
    const pages = blogSource.getPages();
    const allPages = Array.isArray(pages) ? pages : [];
    const filteredByLanguage = allPages.filter((page) => {
      const postLang = (page.data.language || 'pt-BR').toLowerCase();
      const normalizedLang = lang.toLowerCase();
    return postLang === normalizedLang;
    });
    categoryPosts = filteredByLanguage
      .filter((page) => {
        const postCategory = page.data.category || page.data.tags?.[0];
        return postCategory === category;
      })
      .sort((a, b) => {
        const dateA = new Date(a.data.date).getTime();
        const dateB = new Date(b.data.date).getTime();
        return dateB - dateA;
      });
  } catch (error) {
    console.error('Error getting category posts:', error);
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
      name: post.data.title,
      url: `/${lang}/blog/${post.slugs[0]}`,
    })),
    lang,
  });

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl mb-4">
            {categoryName}
          </h1>
          <p className="text-lg text-muted-foreground">
            {categoryPosts.length} {lang === 'pt-BR' ? 'artigo(s)' : 'article(s)'}
          </p>
        </div>

        {categoryPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {lang === 'pt-BR' ? 'Nenhum artigo encontrado nesta categoria.' : 'No articles found in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryPosts.map((post) => {
              const contentText = post.data.body?.toString() || '';
              const wordCount = contentText.split(/\s+/).filter((word: string) => word.length > 0).length;
              const readingTime = Math.ceil(wordCount / 200);
              
              return (
                <BlogCard
                  key={post.slugs[0]}
                  url={`/${lang}/blog/${post.slugs[0]}`}
                  title={post.data.title}
                  description={post.data.excerpt || post.data.description || ''}
                  date={new Date(post.data.date).toLocaleDateString(lang, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  thumbnail={post.data.coverImage || post.data.thumbnail}
                  tags={post.data.tags || []}
                  showRightBorder={false}
                  readingTime={readingTime}
                  isNew={false}
                  lang={lang}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

