import Layout from '@/components/layout/Layout';
import PostCard from '@/components/PostCard';
import { getLatestPosts } from '@/lib/posts';
import Link from 'next/link';

export default async function Home() {
  const posts = await getLatestPosts(3);
  return (
    <Layout>
      {/* Hero Section */}
      <section className="border-b border-grey-200 bg-grey-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-grey-900 sm:text-5xl lg:text-6xl">
              Ricardo Esper
            </h1>
            <p className="mt-6 text-lg leading-8 text-grey-600 sm:text-xl">
              Especialista em cibersegurança com mais de três décadas de experiência, 
              fundador e CEO da NESS Processos e Tecnologia desde 1991. CISO certificado, 
              atua simultaneamente como líder em múltiplas empresas de segurança digital.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-full bg-grey-200 px-3 py-1 text-xs font-medium text-grey-800">
                Information Security
              </span>
              <span className="inline-flex items-center rounded-full bg-grey-200 px-3 py-1 text-xs font-medium text-grey-800">
                Cyber Intelligence
              </span>
              <span className="inline-flex items-center rounded-full bg-grey-200 px-3 py-1 text-xs font-medium text-grey-800">
                Computer Forensics
              </span>
              <span className="inline-flex items-center rounded-full bg-grey-200 px-3 py-1 text-xs font-medium text-grey-800">
                CISO Leadership
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-grey-900 sm:text-4xl">
              Artigos Recentes
            </h2>
            <p className="mt-4 text-lg text-grey-600">
              Insights sobre cibersegurança, contraespionagem e tecnologia.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-grey-600">Nenhum post encontrado.</p>
            </div>
          ) : (
            <>
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

              {posts.length >= 3 && (
                <div className="mt-12 text-center">
                  <Link
                    href="/blog"
                    className="inline-flex items-center rounded-full border border-grey-300 bg-white px-6 py-3 text-sm font-medium text-grey-700 transition-colors hover:bg-grey-50 hover:text-grey-900"
                  >
                    Ver todos os posts →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
