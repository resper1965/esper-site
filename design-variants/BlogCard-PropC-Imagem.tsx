/**
 * PROPOSTA C: COM IMAGEM REAL DO POST
 * Usa a imagem do post (coverImage) ao invés de decoração artificial
 *
 * VANTAGENS:
 * - Contexto visual real
 * - Sem decoração artificial
 * - Design familiar (Medium, Dev.to)
 * - Mais informativo
 */

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  readingTime?: number;
  coverImage?: string;
  lang?: 'pt-BR' | 'en';
}

export function BlogCardImagem({
  url,
  title,
  description,
  date,
  tags = [],
  readingTime,
  coverImage,
  lang = 'pt-BR',
}: BlogCardProps) {
  const primaryTag = tags[0];
  const readingTimeText = lang === 'pt-BR' ? 'min' : 'min';

  return (
    <Link
      href={url}
      className={cn(
        "group block overflow-hidden border-b border-border",
        "hover:shadow-lg transition-shadow duration-200"
      )}
    >
      {/* Imagem do post (se existir) */}
      {coverImage && (
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-6">
        {/* Category badge simples */}
        {primaryTag && (
          <Badge variant="outline" className="text-xs">
            {primaryTag}
          </Badge>
        )}

        {/* Título */}
        <h3 className="text-xl font-semibold mt-3 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
          <time>{date}</time>
          {readingTime && (
            <>
              <span>·</span>
              <span>{readingTime} {readingTimeText}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * RESULTADO:
 * - Altura: ~320px (com imagem) ou ~220px (sem imagem)
 * - Animações: 2 sutis (shadow + scale na imagem)
 * - Cores: 2 (greyscale + primary)
 * - Elementos visuais: 6-7
 *
 * POLUIÇÃO VISUAL: 3/10 (Muito bom)
 *
 * BENEFÍCIO: Design profissional e familiar, imagem adiciona contexto
 *
 * NOTA: Esta versão REALMENTE usa a prop coverImage/thumbnail!
 */
