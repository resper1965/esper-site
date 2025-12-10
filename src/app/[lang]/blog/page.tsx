import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { BlogCard } from "@/components/blog-card";
import { TagFilter } from "@/components/tag-filter";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import { SiteNav } from "@/components/site-nav";
import Footer from "@/components/footer";

interface BlogData {
  title: string;
  description?: string;
  date: string;
  tags?: string[];
  thumbnail?: string;
  coverImage?: string;
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

export default async function BlogListPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const lang = resolvedParams?.lang || 'pt-BR';
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

  return (
    <>
      <SiteNav lang={lang} dict={dict} />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8">Blog</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {lang === 'pt-BR' 
              ? 'Artigos sobre cibersegurança, contraespionagem e tecnologia.'
              : 'Articles about cybersecurity, counterespionage and technology.'}
          </p>

          <TagFilter
            tags={allTags}
            selectedTag={selectedTag}
            baseUrl={`/${lang}/blog`}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {filteredBlogs.map((blog) => {
              const formattedDate = formatDate(new Date(blog.data.date), lang);
              return (
                <BlogCard
                  key={blog.url}
                  url={blog.url}
                  title={blog.data.title}
                  description={blog.data.description || ""}
                  date={formattedDate}
                  thumbnail={blog.data.coverImage || blog.data.thumbnail}
                  tags={blog.data.tags}
                  showRightBorder={filteredBlogs.length < 3}
                />
              );
            })}
          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}

