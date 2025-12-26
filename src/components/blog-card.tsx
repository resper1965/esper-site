import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getCategoryConfig } from "@/lib/categories";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  thumbnail?: string;
  readingTime?: number;
  isNew?: boolean;
  lang?: 'pt-BR' | 'en';
}

export function BlogCard({
  url,
  title,
  description,
  date,
  tags = [],
  readingTime,
  lang = 'pt-BR',
}: BlogCardProps) {
  // Get primary category (first tag)
  const primaryTag = tags[0];
  const categoryConfig = primaryTag ? getCategoryConfig(primaryTag) : getCategoryConfig('Geral');
  const CategoryIcon = categoryConfig.icon;

  const readingTimeText = lang === 'pt-BR' ? 'min' : 'min';

  return (
    <Link
      href={url}
      className={cn(
        "group block w-full max-w-md hover:shadow-md transition-shadow duration-200",
        "border border-border rounded-lg bg-card overflow-hidden"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Simplified header: 80px (vs 144px), removed mesh, blur, glow */}
        <div className={cn(
          "h-20 flex items-center justify-center",
          "bg-muted/10"
        )}>
          <CategoryIcon
            className={cn(
              "w-6 h-6",
              categoryConfig?.color || "text-primary"
            )}
          />
        </div>

        <div className="p-6 flex flex-col gap-3 flex-1">
          {/* Category badge (simplified - no custom colors) */}
          {categoryConfig && (
            <Badge variant="outline" className="text-xs w-fit">
              {categoryConfig.label}
            </Badge>
          )}

          {/* Title */}
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm flex-1 line-clamp-2">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <time>{date}</time>
            {readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{readingTime} {readingTimeText}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

