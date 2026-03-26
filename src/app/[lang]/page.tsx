import { Suspense } from "react"
import { BlogCard } from "@/components/blog-card"
import { BlogCardSkeleton } from "@/components/blog-card-skeleton"
import { TagFilter } from "@/components/tag-filter"
import { FadeIn } from "@/components/fade-in"
import { getDictionary } from "@/i18n/dictionaries"
import { HeroCommand } from "@/components/ui/hero-command"
import { calculateReadingTime, isNewPost } from "@/lib/reading-time"
import { getAllPosts, type Post } from "@/lib/posts"
import { formatDate, filterPostsByLanguage } from "@/lib/utils"
import { Shield, Rss } from "lucide-react"

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ tag?: string }>
}) {
  const resolvedParams = await params
  const langParam = resolvedParams?.lang || "pt-BR"
  const lang = (langParam === "pt-BR" || langParam === "en" ? langParam : "pt-BR") as "pt-BR" | "en"
  const resolvedSearchParams = await searchParams
  const dict = await getDictionary(lang)

  let allPosts: Post[] = []
  try {
    allPosts = await getAllPosts()
  } catch (error) {
    console.error("Error fetching posts from Supabase:", error)
    allPosts = []
  }

  const filteredByLanguage = filterPostsByLanguage(allPosts, lang)
  const sortedBlogs = filteredByLanguage

  const allTags = [
    dict.home.allTags,
    ...Array.from(
      new Set(sortedBlogs.flatMap((blog) => blog.frontMatter.tags || []))
    ).sort(),
  ]

  const selectedTag = resolvedSearchParams.tag || dict.home.allTags
  const filteredBlogs =
    selectedTag === dict.home.allTags
      ? sortedBlogs
      : sortedBlogs.filter((blog) => blog.frontMatter.tags?.includes(selectedTag))

  const tagCounts = allTags.reduce(
    (acc, tag) => {
      acc[tag] =
        tag === dict.home.allTags
          ? sortedBlogs.length
          : sortedBlogs.filter((blog) => blog.frontMatter.tags?.includes(tag)).length
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* WOW Hero */}
      <HeroCommand
        title="Ricardo Esper"
        subtitle={dict.home.hero.subtitle}
        lang={lang}
        actions={[
          { label: dict.home.hero.readArticles, href: "#posts" },
        ]}
      />

      {/* Posts section */}
      <section
        id="posts"
        className="relative max-w-7xl mx-auto w-full px-6 lg:px-8 py-16 lg:py-24"
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Rss className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {lang === "pt-BR" ? "Artigos Recentes" : "Recent Articles"}
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                {filteredBlogs.length}{" "}
                {lang === "pt-BR" ? "publicações" : "publications"}
              </p>
            </div>
          </div>

          {/* Verification badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.04)]">
            <Shield className="w-3.5 h-3.5 text-[#10b981]" />
            <span className="text-xs font-mono text-[#10b981]">
              {lang === "pt-BR" ? "Conteúdo verificado" : "Verified content"}
            </span>
          </div>
        </div>

        {/* Tag filter */}
        {allTags.length > 1 && (
          <div className="mb-8 flex justify-center">
            <TagFilter
              tags={allTags}
              selectedTag={selectedTag}
              tagCounts={tagCounts}
            />
          </div>
        )}

        {/* Blog grid */}
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
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center ${
              filteredBlogs.length < 3 ? "max-w-2xl mx-auto" : ""
            }`}
          >
            {filteredBlogs.map((post, index) => {
              const date = new Date(post.frontMatter.date)
              const formattedDate = formatDate(date, lang)
              const description =
                post.frontMatter.description || post.frontMatter.excerpt || ""
              const readingTime = calculateReadingTime(
                description +
                  " " +
                  post.frontMatter.title +
                  " " +
                  (post.content || "")
              )
              const isNew = isNewPost(post.frontMatter.date)

              return (
                <FadeIn key={post.slug} delay={index * 80}>
                  <BlogCard
                    url={`/blog/${post.slug}`}
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
              )
            })}
          </div>
        </Suspense>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-16">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground font-mono text-sm">
              {lang === "pt-BR"
                ? "Nenhum artigo encontrado"
                : "No articles found"}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
