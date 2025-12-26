import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import { BlogCard } from "@/components/blog-card";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { getLatestPosts, type Post } from "@/lib/posts";
import { calculateReadingTime, isNewPost } from "@/lib/reading-time";
import { filterPostsByLanguage } from "@/lib/utils";

interface NotFoundProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: NotFoundProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang = (langParam === 'pt-BR' || langParam === 'en' ? langParam : 'pt-BR') as 'pt-BR' | 'en';
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
  const { lang: langParam } = await params;
  const lang = (langParam === 'pt-BR' || langParam === 'en' ? langParam : 'pt-BR') as 'pt-BR' | 'en';
  const dict = await getDictionary(lang);

  // Get latest posts for suggestions from Supabase
  let suggestedPosts: Post[] = [];
  try {
    const allPosts = await getLatestPosts(10);
    const filteredByLanguage = filterPostsByLanguage(allPosts, lang);
    suggestedPosts = filteredByLanguage.slice(0, 3);
  } catch (error) {
    console.error('Error getting suggested posts from Supabase:', error);
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
              {suggestedPosts.map((post) => {
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
          </div>
        )}
      </div>
    </div>
  );
}

