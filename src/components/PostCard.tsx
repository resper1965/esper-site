import Link from 'next/link';

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category: string;
}

const categoryMap: Record<string, string> = {
  cybersecurity: 'Cibersegurança',
  counterespionage: 'Contraespionagem',
  forensics: 'Forensics',
  intelligence: 'Inteligência',
  compliance: 'Compliance',
  leadership: 'Liderança',
  general: 'Geral',
  homeautomation: 'Automação Residencial',
  travel: 'Viagens',
};

export default function PostCard({
  title,
  slug,
  excerpt,
  date,
  category,
}: PostCardProps) {
  const categoryLabel = categoryMap[category] || category;

  return (
    <article className="group border border-grey-200 bg-grey-50 transition-all hover:border-grey-300 hover:shadow-lg">
      <Link href={`/blog/${slug}`} className="block p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-xs font-medium text-grey-500 uppercase tracking-wide">
            {categoryLabel}
          </span>
          <span className="text-xs text-grey-400">•</span>
          <time className="text-xs text-grey-500" dateTime={date}>
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

