import Layout from '@/components/layout/Layout';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/posts';
import Link from 'next/link';

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <Layout>
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              Blog
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Artigos sobre cibersegurança, contraespionagem e tecnologia.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum post encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard
                  key={post.slug}
                  title={post.frontMatter.title}
                  slug={post.slug}
                  excerpt={post.frontMatter.excerpt}
                  date={post.frontMatter.date}
                  category={post.frontMatter.category}
                />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              ← Voltar para início
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}



