import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx/runtime/next";
import { Suspense } from "react";
import { BlogCard } from "@/components/blog-card";
import { TagFilter } from "@/components/tag-filter";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

interface BlogData {
  title: string;
  description: string;
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

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  let allPages: BlogPage[] = [];
  try {
    const pages = blogSource.getPages();
    // Ensure pages is an array
    if (Array.isArray(pages)) {
      allPages = pages;
    } else if (pages && typeof pages === 'object' && 'files' in pages) {
      // Handle case where pages might be an object with files property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    "Todos",
    ...Array.from(
      new Set(sortedBlogs.flatMap((blog) => blog.data.tags || []))
    ).sort(),
  ];

  const selectedTag = resolvedSearchParams.tag || "Todos";
  const filteredBlogs =
    selectedTag === "Todos"
      ? sortedBlogs
      : sortedBlogs.filter((blog) => blog.data.tags?.includes(selectedTag));

  const tagCounts = allTags.reduce((acc, tag) => {
    if (tag === "Todos") {
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
              Ricardo Esper
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
              Especialista em cibersegurança com mais de três décadas de experiência.
              Artigos sobre segurança digital, contraespionagem e tecnologia.
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
        <Suspense fallback={<div>Carregando artigos...</div>}>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative overflow-hidden border-x border-border ${filteredBlogs.length < 4 ? "border-b" : "border-b-0"
              }`}
          >
            {filteredBlogs.map((blog) => {
              const date = new Date(blog.data.date);
              const formattedDate = formatDate(date);

              return (
                <BlogCard
                  key={blog.url}
                  url={blog.url}
                  title={blog.data.title}
                  description={blog.data.description}
                  date={formattedDate}
                  thumbnail={blog.data.thumbnail}
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
