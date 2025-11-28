import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Layout>
      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-grey-900 sm:text-5xl">
              Post não encontrado
            </h1>
            <p className="mt-4 text-lg text-grey-600">
              O post que você está procurando não existe ou foi removido.
            </p>
            <div className="mt-8">
              <Link
                href="/blog"
                className="inline-flex items-center rounded-full border border-grey-300 bg-white px-6 py-3 text-sm font-medium text-grey-700 transition-colors hover:bg-grey-50 hover:text-grey-900"
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


