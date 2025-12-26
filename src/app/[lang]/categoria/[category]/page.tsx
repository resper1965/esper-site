import { BlogCard } from "@/components/blog-card";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import { generatePageMetadata, generateCollectionPageSchema } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostsByCategory, type Post } from "@/lib/posts";
import { calculateReadingTime, isNewPost } from "@/lib/reading-time";

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

  // Get all posts for this category from Supabase
  let categoryPosts: Post[] = [];
  try {
    const allCategoryPosts = await getPostsByCategory(category);
    // Filter by language
    categoryPosts = allCategoryPosts.filter((post) => {
      const postLang = (post.frontMatter.language || 'pt-BR').toLowerCase();
      const normalizedLang = lang.toLowerCase();
      return postLang === normalizedLang;
    });
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
              const description = post.frontMatter.description || post.frontMatter.excerpt || '';
              const readingTime = calculateReadingTime(description + " " + post.frontMatter.title + " " + (post.content || ""));
              const isNew = isNewPost(post.frontMatter.date);
              
              return (
                <BlogCard
                  key={post.slug}
                  url={`/${lang}/blog/${post.slug}`}
                  title={post.frontMatter.title}
                  description={description}
                  date={new Date(post.frontMatter.date).toLocaleDateString(lang, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  thumbnail={post.frontMatter.coverImage}
                  tags={post.frontMatter.tags || []}
                  showRightBorder={false}
                  readingTime={readingTime}
                  isNew={isNew}
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

