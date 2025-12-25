/**
 * PROPOSTA A: RADICAL CLEAN
 * Minimalismo total - 80% menos poluição visual
 *
 * REMOVIDO:
 * - Gradient header
 * - Mesh pattern
 * - Ícone com backdrop-blur
 * - Badge "Novo" pulse
 * - Glow effect
 * - 6 das 7 animações
 * - Cores múltiplas
 */

import Link from "next/link";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  readingTime?: number;
  lang?: 'pt-BR' | 'en';
}

export function BlogCardRadical({
  url,
  title,
  description,
  date,
  tags = [],
  readingTime,
  lang = 'pt-BR',
}: BlogCardProps) {
  const primaryTag = tags[0];
  const readingTimeText = lang === 'pt-BR' ? 'min' : 'min';

  return (
    <Link
      href={url}
      className={cn(
        "block p-6 border-b border-border",
        "hover:bg-muted/30 transition-colors duration-200"
      )}
    >
      {/* Categoria simples */}
      {primaryTag && (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {primaryTag}
        </span>
      )}

      {/* Título limpo */}
      <h3 className="text-xl font-semibold mt-2 text-foreground">
        {title}
      </h3>

      {/* Descrição */}
      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
        {description}
      </p>

      {/* Footer: Data + Reading time */}
      <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
        <time>{date}</time>
        {readingTime && (
          <>
            <span>·</span>
            <span>{readingTime} {readingTimeText}</span>
          </>
        )}
      </div>
    </Link>
  );
}

/**
 * RESULTADO:
 * - Altura: ~180px (vs 380px atual) = 53% menor
 * - Animações: 1 (vs 7 atual)
 * - Cores: 2 (vs 5+ atual)
 * - Elementos visuais: 5 (vs 15+ atual)
 *
 * POLUIÇÃO VISUAL: 2/10 (Excelente)
 */
