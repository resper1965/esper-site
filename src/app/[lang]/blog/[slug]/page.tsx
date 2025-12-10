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
import { ReadingProgress } from "@/components/reading-progress";
import { BackToTop } from "@/components/back-to-top";
import { CodeCopyButtons } from "@/components/code-copy-button";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import { generatePageMetadata, generateArticleSchema, generateBreadcrumbSchema } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ lang: Locale; slug: string }>;
}

const formatDate = (date: Date, locale: string): string => {
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  try {
    const post = await getPostBySlug(slug);

    if (!post) {
      return {};
    }

    const keywords = post.frontMatter.keywords || [];
    // Use dynamic Open Graph image (Next.js will automatically use opengraph-image.tsx)
    const image = `${siteConfig.url}/${lang}/blog/${slug}/opengraph-image`;

    return generatePageMetadata({
      title: post.frontMatter.title,
      description: post.frontMatter.description || post.frontMatter.excerpt || '',
      path: `/blog/${slug}`,
      image,
      lang,
      type: 'article',
      publishedTime: post.frontMatter.date,
      modifiedTime: post.frontMatter.date,
      keywords,
      authors: [post.frontMatter.author || 'Ricardo Esper'],
    });
  } catch {
    return {};
  }
}

export default async function BlogPost({ params }: PageProps) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);

  if (!slug || slug.length === 0) {
    notFound();
  }

  // Buscar post do banco de dados
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const date = new Date(post.frontMatter.date);
  const formattedDate = formatDate(date, lang);

  // Generate structured data
  const url = `${siteConfig.url}/${lang}/blog/${slug}`;
  const postImage = post.frontMatter.coverImage;
  const image = postImage ? `${siteConfig.url}${postImage}` : undefined;
  const imageAlt = post.frontMatter.title;

  // Calculate word count from content
  const contentText = page.data.body?.toString() || '';
  const wordCount = contentText.split(/\s+/).filter(word => word.length > 0).length;
  const readingTimeMinutes = Math.ceil(wordCount / 200); // Average reading speed: 200 words/min
  const timeRequired = readingTimeMinutes > 0 ? `PT${readingTimeMinutes}M` : undefined;

  const articleSchema = generateArticleSchema({
    title: post.frontMatter.title,
    description: post.frontMatter.description || post.frontMatter.excerpt || '',
    url,
    image,
    datePublished: post.frontMatter.date,
    dateModified: post.frontMatter.date,
    keywords: post.frontMatter.keywords || [],
    lang,
    wordCount,
    timeRequired,
  });

  // Breadcrumb schema
  const breadcrumbItems = [
    { name: dict.nav.home, url: `/${lang}` },
    ...(post.frontMatter.tags && post.frontMatter.tags.length > 0
      ? [{ name: post.frontMatter.tags[0], url: `/${lang}?tag=${post.frontMatter.tags[0]}` }]
      : []),
    { name: post.frontMatter.title, url },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="min-h-screen bg-background relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ReadingProgress />
      <BackToTop />
      <CodeCopyButtons />
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
              { label: dict.nav.home, href: `/${lang}` },
              ...(post.frontMatter.tags && post.frontMatter.tags.length > 0
                ? [{ label: post.frontMatter.tags[0], href: `/${lang}?tag=${post.frontMatter.tags[0]}` }]
                : []),
              { label: post.frontMatter.title },
            ]}
          />

          <div className="flex flex-wrap items-center gap-3 gap-y-5 text-sm text-muted-foreground">
            <Button variant="outline" asChild className="h-6 w-6">
              <Link href={`/${lang}`}>
                <ArrowLeft className="w-4 h-4" />
                <span className="sr-only">{dict.blog.backToArticles}</span>
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
                alt={imageAlt}
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
