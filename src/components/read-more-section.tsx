/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getAllPosts, type Post } from "@/lib/posts";

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

interface ReadMoreSectionProps {
  currentSlug: string[];
  currentTags?: string[];
  lang?: 'pt-BR' | 'en';
}

export async function ReadMoreSection({
  currentSlug,
  currentTags = [],
  lang = 'pt-BR',
}: ReadMoreSectionProps) {
  let allPosts: Post[] = [];
  try {
    allPosts = await getAllPosts();
  } catch (error) {
    console.error('Error getting posts from Supabase:', error);
    allPosts = [];
  }

  const currentSlugString = currentSlug.join("/");

  const otherPosts = allPosts
    .filter((post) => post.slug !== currentSlugString)
    .filter((post) => {
      // Filter by language if specified
      if (lang) {
        const postLang = (post.frontMatter.language || 'pt-BR').toLowerCase();
        return postLang === lang.toLowerCase();
      }
      return true;
    })
    .map((post) => {
      const tagOverlap = currentTags.filter((tag) =>
        post.frontMatter.tags?.includes(tag)
      ).length;

      return {
        post,
        relevanceScore: tagOverlap,
        date: new Date(post.frontMatter.date),
      };
    })
    .sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.date.getTime() - a.date.getTime();
    })
    .slice(0, 3);

  if (otherPosts.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border p-0">
      <div className="p-6 lg:p-10">
        <h2 className="text-2xl font-medium mb-8">Leia mais</h2>

        <div className="flex flex-col gap-8">
          {otherPosts.map(({ post, date }) => {
            const formattedDate = formatDate(date);
            const coverImage = post.frontMatter.coverImage;
            const description = post.frontMatter.description || post.frontMatter.excerpt || '';
            const postUrl = `/${lang}/blog/${post.slug}`;

            return (
              <Link
                key={post.slug}
                href={postUrl}
                className="group grid grid-cols-1 lg:grid-cols-12 items-center gap-4 cursor-pointer"
              >
                {coverImage && (
                  <div className="flex-shrink-0 col-span-1 lg:col-span-4">
                    <div className="relative w-full h-full">
                      <img
                        src={coverImage}
                        alt={post.frontMatter.title}
                        className="w-full h-full object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2 flex-1 col-span-1 lg:col-span-8">
                  <h3 className="text-lg group-hover:underline underline-offset-4 font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.frontMatter.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 group-hover:underline underline-offset-4">
                    {description}
                  </p>
                  <time className="block text-xs font-medium text-muted-foreground">
                    {formattedDate}
                  </time>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

