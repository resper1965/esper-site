import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { Suspense } from "react";
import { BlogCard } from "@/components/blog-card";
import { BlogCardSkeleton } from "@/components/blog-card-skeleton";
import { TagFilter } from "@/components/tag-filter";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";

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
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const dict = await getDictionary(lang);

  let allPages: BlogPage[] = [];
  try {
    const pages = blogSource.getPages();
    if (Array.isArray(pages)) {
      allPages = pages;
    } else if (pages && typeof pages === 'object' && 'files' in pages) {
      const files = (pages as any).files;
      allPages = Array.isArray(files) ? files : [];
    }
  } catch (error) {
    console.error('Error getting pages:', error);
    allPages = [];
  }

  const sortedBlogs = allPages.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();
    return dateB - dateA;
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
    <div className="min-h-screen bg-background relative">
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
      <div className="p-6 border-b border-border flex flex-col gap-6 min-h-[250px] justify-center relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-2">
            <h1 className="font-medium text-4xl md:text-5xl tracking-tighter">
              {dict.home.title}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-3xl">
              {dict.home.bio}
            </p>
          </div>
        </div>
        {allTags.length > 1 && (
          <div className="max-w-7xl mx-auto w-full">
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
            {filteredBlogs.map((blog) => {
              const date = new Date(blog.data.date);
              const formattedDate = formatDate(date, lang);

              return (
                <BlogCard
                  key={blog.url}
                  url={`/${lang}${blog.url}`}
                  title={blog.data.title}
                  description={blog.data.description || ""}
                  date={formattedDate}
                  thumbnail={blog.data.thumbnail}
                  tags={blog.data.tags}
                  showRightBorder={filteredBlogs.length < 3}
                />
              );
            })}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
