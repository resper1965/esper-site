import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";

import { TableOfContents } from "@/components/table-of-contents";
import { MobileTableOfContents } from "@/components/mobile-toc";
import { ReadMoreSection } from "@/components/read-more-section";
import { PromoContent } from "@/components/promo-content";
import { getAuthor } from "@/lib/authors";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { HashScrollHandler } from "@/components/hash-scroll-handler";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatDate } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ISR: revalidate every hour for fresh content with static performance
export const revalidate = 3600;

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  // Buscar post do banco de dados
  let post;
  try {
    post = await getPostBySlug(slug);
  } catch (error) {
    logger.error('Error fetching post', { slug, error: error instanceof Error ? error.message : 'Unknown error' });
    notFound();
  }

  if (!post) {
    logger.warn('Post not found', { slug });
    notFound();
  }

  // Validar que o post tem conteúdo HTML válido
  if (!post.htmlContent || typeof post.htmlContent !== 'string' || post.htmlContent.trim().length === 0) {
    logger.error('Post has invalid htmlContent', { 
      slug,
      hasHtmlContent: !!post.htmlContent,
      type: typeof post.htmlContent,
      length: post.htmlContent?.length
    });
    notFound();
  }

  // Validar frontMatter
  if (!post.frontMatter || !post.frontMatter.title || !post.frontMatter.date) {
    logger.error('Post has invalid frontMatter', { slug });
    notFound();
  }

  // Validar e formatar data
  let date: Date;
  try {
    date = new Date(post.frontMatter.date);
    if (isNaN(date.getTime())) {
      logger.warn('Invalid date for post, using current date', { slug, date: post.frontMatter.date });
      date = new Date(); // Fallback para data atual
    }
  } catch (error) {
    logger.warn('Error parsing date, using current date', { slug, error });
    date = new Date(); // Fallback para data atual
  }
  const postLang = post.frontMatter.language || 'pt-BR';
  const formattedDate = formatDate(date, postLang);

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.frontMatter.title,
    description: post.frontMatter.description || post.frontMatter.excerpt,
    author: {
      '@type': 'Person',
      name: post.frontMatter.author || 'Ricardo Esper',
      jobTitle: 'CISO & Cybersecurity Expert',
      url: 'https://esper.ws/sobre',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ricardo Esper',
      logo: {
        '@type': 'ImageObject',
        url: 'https://esper.ws/logo.png',
      },
    },
    datePublished: post.frontMatter.date,
    dateModified: post.frontMatter.date,
    image: post.frontMatter.coverImage ? `https://esper.ws${post.frontMatter.coverImage}` : undefined,
    keywords: post.frontMatter.keywords?.join(', '),
    articleSection: post.frontMatter.tags?.[0],
    inLanguage: 'pt-BR',
  };

  return (
    <div className="min-h-screen bg-background relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HashScrollHandler />
      <div className="absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]">
        <FlickeringGrid
          className="absolute top-0 left-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.2}
          flickerChance={0.05}
        />
      </div>

      <div className="space-y-4 border-b border-border relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 p-6">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              ...(post.frontMatter.tags && post.frontMatter.tags.length > 0
                ? [{ label: post.frontMatter.tags[0], href: `/?tag=${post.frontMatter.tags[0]}` }]
                : []),
              { label: post.frontMatter.title },
            ]}
          />

          <div className="flex flex-wrap items-center gap-3 gap-y-5 text-sm text-muted-foreground">
            <Button variant="outline" asChild className="h-6 w-6">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                <span className="sr-only">Voltar para todos os artigos</span>
              </Link>
            </Button>
            {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 text-muted-foreground">
                {post.frontMatter.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="h-6 w-fit px-3 text-sm font-medium bg-muted text-muted-foreground rounded-md border flex items-center justify-center"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <time className="font-medium text-muted-foreground">
              {formattedDate}
            </time>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-balance">
            {post.frontMatter.title}
          </h1>

          {post.frontMatter.description && (
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-4xl md:text-balance">
              {post.frontMatter.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex divide-x divide-border relative max-w-7xl mx-auto px-4 md:px-0 z-10">
        <div className="absolute max-w-7xl mx-auto left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] lg:w-full h-full border-x border-border p-0 pointer-events-none" />
        <main className="w-full p-0 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-h1:hidden prose-headings:text-xl sm:prose-headings:text-2xl md:prose-headings:text-3xl prose-h2:text-lg sm:prose-h2:text-xl md:prose-h2:text-2xl prose-h3:text-base sm:prose-h3:text-lg md:prose-h3:text-xl prose-p:text-sm sm:prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-li:text-sm sm:prose-li:text-base md:prose-li:text-lg">
              <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
            </div>
          </div>
          <div className="mt-10">
            <ReadMoreSection
              currentSlug={[slug]}
              currentTags={post.frontMatter.tags}
              lang={post.frontMatter.language as 'pt-BR' | 'en' || 'pt-BR'}
            />
          </div>
        </main>

        <aside className="hidden lg:block w-[350px] flex-shrink-0 p-6 lg:p-10 bg-muted/60 dark:bg-muted/20">
          <div className="sticky top-20 space-y-8">
            {/* Author Bio - Always show Ricardo Esper */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
                  {getAuthor('ricardo').avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getAuthor('ricardo').avatar}
                      alt={getAuthor('ricardo').name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                      RE
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {getAuthor('ricardo').name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {getAuthor('ricardo').position}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Mais de três décadas de experiência em cibersegurança, CISO da IONIC Health e fundador da NESS. Especialista em privacidade e compliance (LGPD/GDPR).
                  </p>
                </div>
              </div>
            </div>
            <div className="border border-border rounded-lg p-6 bg-card">
              <TableOfContents />
            </div>
            <PromoContent variant="desktop" />
          </div>
        </aside>
      </div>

      <MobileTableOfContents />
    </div>
  );
}
