import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getCategoryConfig } from "@/lib/categories";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  dateString: string;
  thumbnail?: string;
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
  dateString,
  thumbnail,
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
        "group block relative transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        "before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-['']",
        "after:absolute after:-top-0.5 after:left-0 after:z-0 after:h-px after:w-screen after:bg-border after:content-['']",
        showRightBorder && "md:border-r border-border border-b-0"
      )}
    >
      <div className="flex flex-col h-full">
        {thumbnail && (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* New badge */}
            {isNew && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-primary text-primary-foreground font-semibold shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {newText}
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="p-6 flex flex-col gap-3 flex-1">
          {/* Category Badge with Icon and Reading Time */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {categoryConfig && (
                <>
                  {CategoryIcon && (
                    <div className={cn(
                      "rounded-full p-1.5",
                      categoryConfig.bgColor
                    )}>
                      <CategoryIcon className={cn("w-4 h-4", categoryConfig.color)} />
                    </div>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      categoryConfig.borderColor,
                      categoryConfig.color,
                      categoryConfig.bgColor
                    )}
                  >
                    {categoryConfig.label}
                  </Badge>
                </>
              )}
            </div>

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

