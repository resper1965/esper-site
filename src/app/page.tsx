import { Suspense } from "react";
import { BlogCard } from "@/components/blog-card";
import { BlogCardSkeleton } from "@/components/blog-card-skeleton";
import { TagFilter } from "@/components/tag-filter";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { getAllPosts, type Post } from "@/lib/posts";
import { calculateReadingTime, isNewPost } from "@/lib/reading-time";
import { formatDate } from "@/lib/utils";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  // Get all posts from Supabase
  let allPosts: Post[] = [];
  try {
    allPosts = await getAllPosts();
  } catch (error) {
    console.error('Error fetching posts from Supabase:', error);
    allPosts = [];
  }

  // Posts already sorted by date (newest first)
  const sortedBlogs = allPosts;

  const allTags = [
    "Todos",
    ...Array.from(
      new Set(sortedBlogs.flatMap((post) => post.frontMatter.tags || []))
    ).sort(),
  ];

  const selectedTag = resolvedSearchParams.tag || "Todos";
  const filteredBlogs =
    selectedTag === "Todos"
      ? sortedBlogs
      : sortedBlogs.filter((post) => post.frontMatter.tags?.includes(selectedTag));

  const tagCounts = allTags.reduce((acc, tag) => {
    if (tag === "Todos") {
      acc[tag] = sortedBlogs.length;
    } else {
      acc[tag] = sortedBlogs.filter((post) =>
        post.frontMatter.tags?.includes(tag)
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
              Ricardo Esper
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-3xl">
              Três décadas moldando estratégias de segurança em escala global. CISO, forense digital e
              especialista internacional em privacidade e compliance (LGPD/GDPR). Insights de quem viveu
              a evolução da cibersegurança desde seus primeiros dias.
            </p>
          </div>
        </div>
        {allTags.length > 1 && (
          <div className="max-w-7xl mx-auto w-full flex justify-center">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center ${filteredBlogs.length < 3 ? "max-w-2xl mx-auto" : ""}`}
          >
            {filteredBlogs.map((post) => {
              const date = new Date(post.frontMatter.date);
              const formattedDate = formatDate(date);
              const description = post.frontMatter.description || post.frontMatter.excerpt || "";
              const readingTime = calculateReadingTime(description + " " + post.frontMatter.title + " " + (post.content || ""));
              const isNew = isNewPost(post.frontMatter.date);

              return (
                <BlogCard
                  key={post.slug}
                  url={`/blog/${post.slug}`}
                  title={post.frontMatter.title}
                  description={description}
                  date={formattedDate}
                  tags={post.frontMatter.tags}
                  readingTime={readingTime}
                  isNew={isNew}
                  lang="pt-BR"
                  thumbnail={post.frontMatter.coverImage}
                />
              );
            })}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
