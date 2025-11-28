import Layout from '@/components/layout/Layout';
import MDXContent from '@/components/MDXContent';
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

const categoryMap: Record<string, string> = {
  cybersecurity: 'Cibersegurança',
  counterespionage: 'Contraespionagem',
  forensics: 'Forensics',
  intelligence: 'Inteligência',
  compliance: 'Compliance',
  leadership: 'Liderança',
  general: 'Geral',
  homeautomation: 'Automação Residencial',
  travel: 'Viagens',
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const categoryLabel = categoryMap[post.frontMatter.category] || post.frontMatter.category;

  return (
    <Layout>
      <article className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          {/* Header */}
          <header className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-medium text-grey-500 uppercase tracking-wide">
                {categoryLabel}
              </span>
              <span className="text-sm text-grey-400">•</span>
              <time 
                className="text-sm text-grey-500" 
                dateTime={post.frontMatter.date}
              >
                {new Date(post.frontMatter.date).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            <h1 className="mb-6 text-4xl font-bold text-grey-900 sm:text-5xl">
              {post.frontMatter.title}
            </h1>

            {post.frontMatter.excerpt && (
              <p className="text-xl leading-relaxed text-grey-600">
                {post.frontMatter.excerpt}
              </p>
            )}
          </header>

          {/* Content */}
          <div className="border-t border-grey-200 pt-12">
            <MDXContent htmlContent={post.htmlContent} />
          </div>

          {/* Footer */}
          <footer className="mt-16 border-t border-grey-200 pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {post.frontMatter.author && (
                  <p className="text-sm text-grey-600">
                    Por <span className="font-medium text-grey-900">{post.frontMatter.author}</span>
                  </p>
                )}
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center text-sm font-medium text-grey-700 transition-colors hover:text-grey-900"
              >
                ← Voltar para o blog
              </Link>
            </div>
          </footer>
        </div>
      </article>
    </Layout>
  );
}


