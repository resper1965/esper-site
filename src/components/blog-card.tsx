import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getCategoryConfig } from "@/lib/categories";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  showRightBorder?: boolean;
  tags?: string[];
  readingTime?: number;
  isNew?: boolean;
  lang?: 'pt-BR' | 'en';
}

export function BlogCard({
  url,
  title,
  description,
  date,
  showRightBorder = true,
  tags = [],
  readingTime,
  isNew = false,
  lang = 'pt-BR',
}: BlogCardProps) {
  // Get primary category (first tag)
  const primaryTag = tags[0];
  const categoryConfig = primaryTag ? getCategoryConfig(primaryTag) : null;
  const CategoryIcon = categoryConfig?.icon;

  const readMoreText = lang === 'pt-BR' ? 'Ler mais' : 'Read more';
  const newText = lang === 'pt-BR' ? 'Novo' : 'New';
  const readingTimeText = lang === 'pt-BR' ? 'min' : 'min';

  return (
    <Link
      href={url}
      className={cn(
        "group block relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        "before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-['']",
        "after:absolute after:-top-0.5 after:left-0 after:z-0 after:h-px after:w-screen after:bg-border after:content-['']",
        showRightBorder && "md:border-r border-border border-b-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Gradient Header with Category Visual */}
        <div className={cn(
          "relative w-full h-36 overflow-hidden flex items-center justify-center",
          "bg-gradient-to-br",
          categoryConfig?.gradient || "from-gray-500/20 via-slate-500/10 to-zinc-900/5"
        )}>
          {/* Animated mesh pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,currentColor_25%,transparent_25%,transparent_75%,currentColor_75%)] bg-[length:24px_24px]" />
          
          {/* Large category icon with glow effect */}
          {CategoryIcon && (
            <div className={cn(
              "relative rounded-2xl p-5 transition-all duration-300",
              "bg-background/80 backdrop-blur-sm border border-border/50",
              "group-hover:scale-110 group-hover:shadow-lg group-hover:bg-background/90"
            )}>
              <CategoryIcon className={cn("w-8 h-8", categoryConfig?.color)} />
              {/* Glow effect */}
              <div className={cn(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl",
                categoryConfig?.bgColor
              )} />
            </div>
          )}
          
          {/* New badge */}
          {isNew && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-primary-foreground font-semibold shadow-lg flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" />
                {newText}
              </Badge>
            </div>
          )}
          
          {/* Bottom fade to content */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="p-5 flex flex-col gap-2.5 flex-1">
          {/* Category Badge and Reading Time */}
          <div className="flex items-center justify-between gap-2">
            {categoryConfig && (
              <Badge
                variant="outline"
                className={cn(
                  "font-medium text-xs",
                  categoryConfig.borderColor,
                  categoryConfig.color,
                  categoryConfig.bgColor
                )}
              >
                {categoryConfig.label}
              </Badge>
            )}

            {/* Reading time */}
            {readingTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{readingTime} {readingTimeText}</span>
              </div>
            )}
          </div>

          <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>

          <p className="text-muted-foreground text-sm flex-1">{description}</p>

          <div className="flex items-center justify-between pt-2">
            <time className="block text-sm font-medium text-muted-foreground">
              {date}
            </time>
            <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span>{readMoreText}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

