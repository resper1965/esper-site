import { DocsBody } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";

import { TableOfContents } from "@/components/table-of-contents";
import { MobileTableOfContents } from "@/components/mobile-toc";
import { AuthorCard } from "@/components/author-card";
import { ReadMoreSection } from "@/components/read-more-section";
import { PromoContent } from "@/components/promo-content";
import { getAuthor, isValidAuthor } from "@/lib/authors";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { HashScrollHandler } from "@/components/hash-scroll-handler";
import { Breadcrumbs } from "@/components/breadcrumbs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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
    console.error('Error fetching post:', error);
    // Log detalhado para debug
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    notFound();
  }

  if (!post) {
    console.error('Post not found:', slug);
    notFound();
  }

  // Validar que o post tem conteúdo HTML válido
  if (!post.htmlContent || typeof post.htmlContent !== 'string' || post.htmlContent.trim().length === 0) {
    console.error('Post has invalid htmlContent:', slug, {
      hasHtmlContent: !!post.htmlContent,
      type: typeof post.htmlContent,
      length: post.htmlContent?.length
    });
    notFound();
  }

  // Validar frontMatter
  if (!post.frontMatter || !post.frontMatter.title || !post.frontMatter.date) {
    console.error('Post has invalid frontMatter:', slug);
    notFound();
  }

  // Validar e formatar data
  let date: Date;
  try {
    date = new Date(post.frontMatter.date);
    if (isNaN(date.getTime())) {
      console.error('Invalid date for post:', slug, post.frontMatter.date);
      date = new Date(); // Fallback para data atual
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    date = new Date(); // Fallback para data atual
  }
  const formattedDate = formatDate(date);

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

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-balance">
            {post.frontMatter.title}
          </h1>

          {post.frontMatter.description && (
            <p className="text-muted-foreground max-w-4xl md:text-lg md:text-balance">
              {post.frontMatter.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex divide-x divide-border relative max-w-7xl mx-auto px-4 md:px-0 z-10">
        <div className="absolute max-w-7xl mx-auto left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] lg:w-full h-full border-x border-border p-0 pointer-events-none" />
        <main className="w-full p-0 overflow-hidden">
          {post.frontMatter.coverImage && (
            <div className="relative w-full h-[500px] overflow-hidden border border-transparent bg-grey-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.frontMatter.coverImage}
                alt={post.frontMatter.title}
                className="w-full h-full object-cover"
                style={{ 
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                  display: 'block'
                }}
                loading="eager"
              />
            </div>
          )}
          <div className="p-6 lg:p-10">
            <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-lg">
              <DocsBody>
                <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
              </DocsBody>
            </div>
          </div>
          <div className="mt-10">
            <ReadMoreSection
              currentSlug={[slug]}
              currentTags={post.frontMatter.tags}
            />
          </div>
        </main>

        <aside className="hidden lg:block w-[350px] flex-shrink-0 p-6 lg:p-10 bg-muted/60 dark:bg-muted/20">
          <div className="sticky top-20 space-y-8">
            {post.frontMatter.author && isValidAuthor(post.frontMatter.author) && (
              <AuthorCard author={getAuthor(post.frontMatter.author)} />
            )}
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
