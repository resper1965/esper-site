import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";

import { TableOfContents } from "@/components/table-of-contents";
import { MobileTableOfContents } from "@/components/mobile-toc";
import { ReadMoreSection } from "@/components/read-more-section";
import { HashScrollHandler } from "@/components/hash-scroll-handler";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ReadingProgress } from "@/components/reading-progress";
import { BackToTop } from "@/components/back-to-top";
import { CodeCopyButtons } from "@/components/code-copy-button";
import { getDictionary } from "@/i18n/dictionaries";
import { generatePageMetadata, generateArticleSchema, generateBreadcrumbSchema } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import { formatDate } from "@/lib/utils";
import { getAuthor } from "@/lib/authors";

const lang = "pt-BR" as const;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  try {
    const post = await getPostBySlug(slug);

    if (!post) {
      return {};
    }

    const keywords = post.frontMatter.keywords || [];
    const image = `${siteConfig.url}/blog/${slug}/opengraph-image`;

    return generatePageMetadata({
      title: post.frontMatter.title,
      description: post.frontMatter.description || post.frontMatter.excerpt || "",
      path: `/blog/${slug}`,
      image,
      lang,
      type: "article",
      publishedTime: post.frontMatter.date,
      modifiedTime: post.frontMatter.date,
      keywords,
      authors: [post.frontMatter.author || "Ricardo Esper"],
    });
  } catch {
    return {};
  }
}

export default async function BlogPost({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const dict = await getDictionary(lang);

  if (!slug || slug.length === 0) {
    notFound();
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const date = new Date(post.frontMatter.date);
  const formattedDate = formatDate(date, lang);

  const url = `${siteConfig.url}/blog/${slug}`;
  const postImage = post.frontMatter.coverImage;
  const image = postImage ? `${siteConfig.url}${postImage}` : undefined;

  const contentText = post.htmlContent?.toString() || "";
  const wordCount = contentText.split(/\s+/).filter(word => word.length > 0).length;
  const readingTimeMinutes = Math.ceil(wordCount / 200);
  const timeRequired = readingTimeMinutes > 0 ? `PT${readingTimeMinutes}M` : undefined;

  const articleSchema = generateArticleSchema({
    title: post.frontMatter.title,
    description: post.frontMatter.description || post.frontMatter.excerpt || "",
    url,
    image,
    datePublished: post.frontMatter.date,
    dateModified: post.frontMatter.date,
    keywords: post.frontMatter.keywords || [],
    lang,
    wordCount,
    timeRequired,
  });

  const breadcrumbItems = [
    { name: dict.nav.home, url: `/` },
    ...(post.frontMatter.tags && post.frontMatter.tags.length > 0
      ? [{ name: post.frontMatter.tags[0], url: `/?tag=${post.frontMatter.tags[0]}` }]
      : []),
    { name: post.frontMatter.title, url },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="min-h-screen bg-background">
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

      <div className="space-y-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 p-6">
          <Breadcrumbs
            items={[
              { label: dict.nav.home, href: `/` },
              ...(post.frontMatter.tags && post.frontMatter.tags.length > 0
                ? [{ label: post.frontMatter.tags[0], href: `/?tag=${post.frontMatter.tags[0]}` }]
                : []),
              { label: post.frontMatter.title },
            ]}
          />

          <div className="flex flex-wrap items-center gap-3 gap-y-5 text-sm text-muted-foreground">
            <Button variant="outline" asChild className="h-6 w-6">
              <Link href={`/`}>
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
      <div className="flex divide-x divide-border relative max-w-7xl mx-auto px-4 md:px-0">
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
            />
          </div>
        </main>

        <aside className="hidden lg:block w-[350px] flex-shrink-0 p-6 lg:p-10 bg-muted/60 dark:bg-muted/20">
          <div className="sticky top-20 space-y-8">
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
                  {getAuthor("ricardo").avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getAuthor("ricardo").avatar}
                      alt={getAuthor("ricardo").name}
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
                    {getAuthor("ricardo").name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {getAuthor("ricardo").position}
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
          </div>
        </aside>
      </div>

      <MobileTableOfContents />
    </div>
  );
}
