/**
 * POST INDIVIDUAL - VERSÃO SIMPLIFICADA
 *
 * PRINCIPAIS MUDANÇAS:
 * 1. FlickeringGrid removido (desnecessário)
 * 2. Imagem de capa: 500px → 300-400px
 * 3. Sidebar: apenas TOC (remove Author + Promo)
 * 4. Menos widgets flutuantes
 */

import { DocsBody } from "fumadocs-ui/page";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TableOfContents } from "@/components/table-of-contents";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ReadingProgress } from "@/components/reading-progress";
import { BackToTop } from "@/components/back-to-top";
import { CodeCopyButtons } from "@/components/code-copy-button";

export default async function BlogPostSimplificado({ params }: PageProps) {
  const { lang, slug } = await params;
  const post = await getPostBySlug(slug);
  // ... resto da lógica

  return (
    <div className="min-h-screen bg-background">
      {/* Apenas Reading Progress e Back to Top */}
      <ReadingProgress />
      <BackToTop />
      <CodeCopyButtons />

      {/* Header (SEM FlickeringGrid) */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${lang}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            {tags && tags.map(tag => (
              <span key={tag} className="px-3 py-1 text-xs border rounded-md">
                {tag}
              </span>
            ))}
            <time>{formattedDate}</time>
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            {post.frontMatter.title}
          </h1>

          {/* Descrição */}
          {post.frontMatter.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {post.frontMatter.description}
            </p>
          )}
        </div>
      </div>

      {/* Layout principal */}
      <div className="max-w-7xl mx-auto flex gap-8 px-6 py-8">
        {/* Conteúdo principal */}
        <main className="flex-1 min-w-0">
          {/* Imagem de capa: 300-400px (vs 500px) */}
          {coverImage && (
            <div className="relative w-full h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
              <Image
                src={coverImage}
                alt={post.frontMatter.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Conteúdo do post */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <DocsBody>
              <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
            </DocsBody>
          </div>

          {/* Related posts ao final */}
          <div className="mt-12">
            <ReadMoreSection
              currentSlug={[slug]}
              currentTags={post.frontMatter.tags}
            />
          </div>
        </main>

        {/* Sidebar: APENAS TOC */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <div className="border border-border rounded-lg p-4">
              <TableOfContents />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * SIMPLIFICAÇÕES:
 *
 * REMOVIDO:
 * - ❌ FlickeringGrid (200px desnecessário)
 * - ❌ AuthorCard (pode ir no footer do post)
 * - ❌ PromoContent (pode ir no final)
 * - ❌ HashScrollHandler (se não for essencial)
 * - ❌ Mobile TOC separado (usar drawer do TOC principal)
 *
 * REDUZIDO:
 * - Imagem: 500px → 300-400px
 * - Sidebar: 350px → 256px
 * - Título: text-6xl → text-5xl
 *
 * MANTIDO:
 * - Reading Progress (útil)
 * - Back to Top (útil)
 * - Code Copy Buttons (útil)
 * - Breadcrumbs (navegação)
 * - TOC (navegação)
 *
 * RESULTADO:
 * - Foco no conteúdo
 * - Menos distração
 * - Hierarquia visual clara
 * - Performance melhor (menos componentes)
 */
