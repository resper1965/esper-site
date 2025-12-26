import { Suspense } from "react";
import { BlogCard } from "@/components/blog-card";
import { BlogCardSkeleton } from "@/components/blog-card-skeleton";
import { TagFilter } from "@/components/tag-filter";
import { FadeIn } from "@/components/fade-in";
import { getDictionary } from "@/i18n/dictionaries";
import { Hero } from "@/components/ui/hero";
import { calculateReadingTime, isNewPost } from "@/lib/reading-time";
import { getAllPosts, type Post } from "@/lib/posts";
import { formatDate, filterPostsByLanguage } from "@/lib/utils";

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const resolvedParams = await params;
  const langParam = resolvedParams?.lang || 'pt-BR';
  // Validate and cast to Locale type
  const lang = (langParam === 'pt-BR' || langParam === 'en' ? langParam : 'pt-BR') as 'pt-BR' | 'en';
  const resolvedSearchParams = await searchParams;
  const dict = await getDictionary(lang);

  // Buscar posts do Supabase
  let allPosts: Post[] = [];
  try {
    allPosts = await getAllPosts();
  } catch (error) {
    console.error('Error fetching posts from Supabase:', error);
    allPosts = [];
  }

  // Filter posts by language
  const filteredByLanguage = filterPostsByLanguage(allPosts, lang);

  // Posts já vêm ordenados do Supabase (mais recente primeiro)
  const sortedBlogs = filteredByLanguage;

  const allTags = [
    dict.home.allTags,
    ...Array.from(
      new Set(sortedBlogs.flatMap((blog) => blog.frontMatter.tags || []))
    ).sort(),
  ];

  const selectedTag = resolvedSearchParams.tag || dict.home.allTags;
  const filteredBlogs =
    selectedTag === dict.home.allTags
      ? sortedBlogs
      : sortedBlogs.filter((blog) => blog.frontMatter.tags?.includes(selectedTag));

  const tagCounts = allTags.reduce((acc, tag) => {
    if (tag === dict.home.allTags) {
      acc[tag] = sortedBlogs.length;
    } else {
      acc[tag] = sortedBlogs.filter((blog) =>
        blog.frontMatter.tags?.includes(tag)
      ).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <Hero
        title={dict.home.hero.title}
        subtitle={dict.home.hero.subtitle}
        actions={[
          {
            label: dict.home.hero.readArticles,
            href: "#posts",
            variant: "default",
          },
        ]}
        className="mb-2 sm:mb-3 md:mb-4"
      />

      <div id="posts" className="max-w-7xl mx-auto w-full px-6 lg:px-0">
        {allTags.length > 1 && (
          <div className="mb-8 flex justify-center">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} showRightBorder={false} />
              ))}
            </div>
          }
        >
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center ${filteredBlogs.length < 3 ? "max-w-2xl mx-auto" : ""}`}
          >
            {filteredBlogs.map((post, index) => {
              const date = new Date(post.frontMatter.date);
              const formattedDate = formatDate(date, lang);
              const description = post.frontMatter.description || post.frontMatter.excerpt || "";

              // Calculate reading time (estimate based on content length)
              const readingTime = calculateReadingTime(description + " " + post.frontMatter.title + " " + (post.content || ""));

              // Check if post is new (less than 7 days old)
              const isNew = isNewPost(post.frontMatter.date);

              return (
                <FadeIn key={post.slug} delay={index * 100}>
                  <BlogCard
                    url={`/${lang}/blog/${post.slug}`}
                    title={post.frontMatter.title}
                    description={description}
                    date={formattedDate}
                    thumbnail={post.frontMatter.coverImage}
                    tags={post.frontMatter.tags}
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
