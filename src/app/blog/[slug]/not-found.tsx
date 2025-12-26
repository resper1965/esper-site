import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Layout>
      <div className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              Post não encontrado
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              O post que você está procurando não existe ou foi removido.
            </p>
            <div className="mt-8">
              <Link
                href="/blog"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                ← Voltar para o blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}




