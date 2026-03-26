import { BlogCard } from "@/components/blog-card";
import { TagFilter } from "@/components/tag-filter";
import { getDictionary } from "@/i18n/dictionaries";
import { getAllPosts, type Post } from "@/lib/posts";
import { calculateReadingTime, isNewPost } from "@/lib/reading-time";
import { formatDate, filterPostsByLanguage } from "@/lib/utils";

const lang = "pt-BR" as const;

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const dict = await getDictionary(lang);

  let allPosts: Post[] = [];
  try {
    allPosts = await getAllPosts();
  } catch (error) {
    console.error("Error fetching posts from Supabase:", error);
    allPosts = [];
  }

  const filteredByLanguage = filterPostsByLanguage(allPosts, lang);
  const sortedBlogs = filteredByLanguage;

  const allTags = [
    dict.home.allTags || "Todos",
    ...Array.from(
      new Set(sortedBlogs.flatMap((blog) => blog.frontMatter.tags || []))
    ).sort(),
  ];

  const selectedTag = resolvedSearchParams.tag || dict.home.allTags || "Todos";
  const filteredBlogs =
    selectedTag === (dict.home.allTags || "Todos")
      ? sortedBlogs
      : sortedBlogs.filter((blog) => blog.frontMatter.tags?.includes(selectedTag));

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Blog</h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
          Artigos sobre cibersegurança, contraespionagem e tecnologia.
        </p>

        <div className="flex justify-center">
          <TagFilter
            tags={allTags}
            selectedTag={selectedTag}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 justify-items-center">
          {filteredBlogs.map((post) => {
            const formattedDate = formatDate(new Date(post.frontMatter.date), lang);
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
                lang={lang}
                thumbnail={post.frontMatter.coverImage}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
