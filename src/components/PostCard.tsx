import Link from 'next/link';
import { getCategoryConfig } from '@/lib/categories';

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category: string;
}

export default function PostCard({
  title,
  slug,
  excerpt,
  date,
  category,
}: PostCardProps) {
  const categoryConfig = getCategoryConfig(category);
  const CategoryIcon = categoryConfig.icon;

  return (
    <article className="group border border-border bg-card rounded-lg transition-all hover:shadow-md max-w-md w-full overflow-hidden">
      {/* Header com ícone da categoria */}
      <div className="h-20 flex items-center justify-center bg-muted/10">
        <CategoryIcon
          className={`w-6 h-6 ${categoryConfig.color || "text-primary"}`}
        />
      </div>
      
      <Link href={`/blog/${slug}`} className="block p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {categoryConfig.label}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <time className="text-xs text-muted-foreground" dateTime={date}>
            {new Date(date).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>

        <h2 className="mb-3 text-xl font-semibold text-grey-900 transition-colors group-hover:text-grey-700">
          {title}
        </h2>

        <p className="text-sm leading-relaxed text-grey-600 line-clamp-3">
          {excerpt}
        </p>
      </Link>
    </article>
  );
}

