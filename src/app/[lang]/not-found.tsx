import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import { Locale } from '@/i18n/config';
import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { BlogCard } from "@/components/blog-card";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});

interface NotFoundProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: NotFoundProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return generatePageMetadata({
    title: dict.notFound?.title || 'Página não encontrada',
    description: dict.notFound?.description || 'A página que você está procurando não foi encontrada.',
    path: '/404',
    lang,
    noindex: true,
  });
}

export default async function NotFound({ params }: NotFoundProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Get latest posts for suggestions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let suggestedPosts: any[] = [];
  try {
    const pages = blogSource.getPages();
    const allPages = Array.isArray(pages) ? pages : [];
    const filteredByLanguage = allPages.filter((page) => {
      const postLang = (page.data.language || 'pt-BR').toLowerCase();
      const normalizedLang = lang.toLowerCase();
      return postLang === normalizedLang;
    });
    suggestedPosts = filteredByLanguage
      .sort((a, b) => {
        const dateA = new Date(a.data.date).getTime();
        const dateB = new Date(b.data.date).getTime();
        return dateB - dateA;
      })
      .slice(0, 3);
  } catch (error) {
    console.error('Error getting suggested posts:', error);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {dict.notFound?.title || 'Página não encontrada'}
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            {dict.notFound?.description || 'A página que você está procurando não foi encontrada ou foi movida.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {dict.notFound?.backHome || 'Voltar para o início'}
          </Link>
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            {dict.notFound?.viewBlog || 'Ver todos os artigos'}
          </Link>
        </div>

        {suggestedPosts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-6">
              {dict.notFound?.suggestedPosts || 'Artigos que podem interessar:'}
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {suggestedPosts.map((post) => (
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
                  readingTime={Math.ceil((post.data.body?.toString() || '').split(/\s+/).length / 200)}
                  isNew={false}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

