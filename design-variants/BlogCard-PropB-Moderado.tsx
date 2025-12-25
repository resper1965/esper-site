/**
 * PROPOSTA B: MODERADO
 * Mantém personalidade mas reduz 50% da poluição
 *
 * MANTIDO:
 * - Header visual (reduzido: 144px → 80px)
 * - Ícone categoria (simplificado)
 * - 2 animações sutis
 *
 * REMOVIDO:
 * - Mesh pattern
 * - Backdrop-blur
 * - Glow effect
 * - Badge "Novo" pulse
 * - 5 das 7 animações
 */

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getCategoryConfig } from "@/lib/categories";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  readingTime?: number;
  lang?: 'pt-BR' | 'en';
}

export function BlogCardModerado({
  url,
  title,
  description,
  date,
  tags = [],
  readingTime,
  lang = 'pt-BR',
}: BlogCardProps) {
  const primaryTag = tags[0];
  const categoryConfig = primaryTag ? getCategoryConfig(primaryTag) : null;
  const CategoryIcon = categoryConfig?.icon;
  const readingTimeText = lang === 'pt-BR' ? 'min' : 'min';

  return (
    <Link
      href={url}
      className={cn(
        "group block border-b border-border",
        "hover:shadow-md transition-shadow duration-200"
      )}
    >
      {/* Header visual simplificado: 80px (vs 144px) */}
      <div className={cn(
        "h-20 flex items-center justify-center",
        "bg-gradient-to-br from-muted/30 to-muted/5"
      )}>
        {CategoryIcon && (
          <CategoryIcon
            className={cn(
              "w-6 h-6",  // Reduzido: 32px → 24px
              categoryConfig?.color || "text-primary"
            )}
          />
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {/* Category badge (sem cor de fundo) */}
        {categoryConfig && (
          <Badge variant="outline" className="text-xs">
            {categoryConfig.label}
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
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <time>{date}</time>
          {readingTime && <span>{readingTime} {readingTimeText}</span>}
        </div>
      </div>
    </Link>
  );
}

/**
 * RESULTADO:
 * - Altura: ~280px (vs 380px atual) = 26% menor
 * - Animações: 2 (vs 7 atual)
 * - Cores: 3 (vs 5+ atual)
 * - Elementos visuais: 8 (vs 15+ atual)
 *
 * POLUIÇÃO VISUAL: 4/10 (Bom)
 *
 * BENEFÍCIO: Mantém identidade visual mas muito mais limpo
 */
