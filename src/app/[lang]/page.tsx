import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { Suspense } from "react";
import { BlogCard } from "@/components/blog-card";
import { BlogCardSkeleton } from "@/components/blog-card-skeleton";
import { TagFilter } from "@/components/tag-filter";
import { FadeIn } from "@/components/fade-in";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import { calculateReadingTime, isNewPost } from "@/lib/reading-time";
import { HeroSection } from "@/components/ui/hero-section-dark";

interface BlogData {
  title: string;
  description?: string;
  date: string;
  tags?: string[];
  featured?: boolean;
  readTime?: string;
  author?: string;
  authorImage?: string;
  thumbnail?: string;
}

interface BlogPage {
  url: string;
  data: BlogData;
}

const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});

const formatDate = (date: Date, locale: string): string => {
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'pt-BR';
  const resolvedSearchParams = await searchParams;
  const dict = await getDictionary(lang);

  let allPages: BlogPage[] = [];
  try {
    const pages = blogSource.getPages();
    if (Array.isArray(pages)) {
      allPages = pages;
    } else if (pages && typeof pages === 'object' && 'files' in pages) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const files = (pages as any).files;
      allPages = Array.isArray(files) ? files : [];
    }
  } catch (error) {
    console.error('Error getting pages:', error);
    allPages = [];
  }

  // Filter posts by language (normalize to handle case variations)
  const filteredByLanguage = allPages.filter((page) => {
    const postLang = (page.data.language || 'pt-BR').toLowerCase();
    const normalizedLang = lang.toLowerCase();
    // Normalize both to lowercase for comparison
    // Handle both 'pt-br' and 'pt-BR' variations - both should match 'pt-br'
    return postLang === normalizedLang;
  });

  // Sort: most recent first (newest to oldest)
  const sortedBlogs = filteredByLanguage.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();
    // dateB - dateA: if dateB is newer (larger), result is positive, so B comes first
    return dateB - dateA; // Newest first
  });

  const allTags = [
    dict.home.allTags,
    ...Array.from(
      new Set(sortedBlogs.flatMap((blog) => blog.data.tags || []))
    ).sort(),
  ];

  const selectedTag = resolvedSearchParams.tag || dict.home.allTags;
  const filteredBlogs =
    selectedTag === dict.home.allTags
      ? sortedBlogs
      : sortedBlogs.filter((blog) => blog.data.tags?.includes(selectedTag));

  const tagCounts = allTags.reduce((acc, tag) => {
    if (tag === dict.home.allTags) {
      acc[tag] = sortedBlogs.length;
    } else {
      acc[tag] = sortedBlogs.filter((blog) =>
        blog.data.tags?.includes(tag)
      ).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        title={lang === 'pt-br' ? "Cibersegurança, Contraespionagem e Tecnologia" : "Cybersecurity, Counterespionage and Technology"}
        subtitle={{
          regular: lang === 'pt-br' ? "Insights práticos de quem vive " : "Practical insights from someone who lives ",
          gradient: lang === 'pt-br' ? "segurança na prática" : "security in practice",
        }}
        description={
          lang === 'pt-br'
            ? "CEO da NESS, CISO da IONIC Health, e fundador da forense.io. Compartilho experiências reais sobre cibersegurança, TSCM, automação residencial e os desafios de proteger o que realmente importa."
            : "CEO of NESS, CISO at IONIC Health, and founder of forense.io. Sharing real experiences about cybersecurity, TSCM, home automation, and the challenges of protecting what truly matters."
        }
        ctaText={lang === 'pt-br' ? "Explorar artigos" : "Browse articles"}
        ctaHref="#posts"
        bottomImage={undefined}
        gridOptions={{
          angle: 65,
          opacity: 0.3,
          cellSize: 50,
          lightLineColor: "#4a4a4a",
          darkLineColor: "#2a2a2a",
        }}
      />

      <div id="posts" className="max-w-7xl mx-auto w-full px-6 lg:px-0 -mt-16">
        {allTags.length > 1 && (
          <div className="mb-8">
            <TagFilter
              tags={allTags}
              selectedTag={selectedTag}
              tagCounts={tagCounts}
            />
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 lg:px-0">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative overflow-hidden border-x border-b border-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} showRightBorder={i < 3} />
              ))}
            </div>
          }
        >
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative overflow-hidden border-x border-border ${filteredBlogs.length < 4 ? "border-b" : "border-b-0"
              }`}
          >
            {filteredBlogs.map((blog, index) => {
              const date = new Date(blog.data.date);
              const formattedDate = formatDate(date, lang);
              const description = blog.data.description || "";

              // Calculate reading time (estimate based on description length, or use a default)
              const readingTime = calculateReadingTime(description + " " + blog.data.title);

              // Check if post is new (less than 7 days old)
              const isNew = isNewPost(blog.data.date);

              return (
                <FadeIn key={blog.url} delay={index * 100}>
                  <BlogCard
                    url={`/${lang}${blog.url}`}
                    title={blog.data.title}
                    description={description}
                    date={formattedDate}
                    thumbnail={blog.data.coverImage || blog.data.thumbnail}
                    tags={blog.data.tags}
                    showRightBorder={filteredBlogs.length < 3}
                    readingTime={readingTime}
                    isNew={isNew}
                    lang={lang}
                  />
                </FadeIn>
              );
            })}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
