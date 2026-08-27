import { careerTimeline, CAREER_START, type CareerEntry } from '@/lib/career';
import type { Locale } from '@/i18n/config';

interface CareerTimelineProps {
  lang: Locale;
}

/**
 * Linha do tempo da trajetória profissional.
 *
 * Estilizada só por tokens do tema (--primary, --border, --muted-foreground),
 * sem cor literal: quando a paleta do site mudar, este componente muda junto
 * em vez de virar uma ilha com a estética antiga.
 */
export function CareerTimeline({ lang }: CareerTimelineProps) {
  const isPT = lang === 'pt-BR';
  const entries = careerTimeline();

  return (
    <ol className="relative flex flex-col gap-0 border-l border-border pl-0 list-none m-0">
      <li className="relative pl-8 pb-8">
        <span
          aria-hidden="true"
          className="absolute left-0 top-2 -translate-x-1/2 w-2 h-2 rounded-full bg-muted-foreground"
        />
        <div className="font-mono text-sm text-muted-foreground tabular-nums">{CAREER_START}</div>
        <div className="text-base text-muted-foreground mt-1">
          {isPT
            ? 'Início da carreira em segurança da informação'
            : 'Start of the information security career'}
        </div>
      </li>

      {entries.map((entry) => (
        <TimelineItem key={entry.organization} entry={entry} lang={lang} />
      ))}
    </ol>
  );
}

function TimelineItem({ entry, lang }: { entry: CareerEntry; lang: Locale }) {
  const isPT = lang === 'pt-BR';
  const { organization, role, focus, startYear, endYear, url } = entry;

  // Sem ano confirmado, o rótulo diz o que é verdade — o vínculo é corrente —
  // em vez de estimar uma data que um jornalista poderia conferir.
  const period = startYear
    ? `${startYear} — ${endYear ?? (isPT ? 'hoje' : 'present')}`
    : isPT
      ? 'atualmente'
      : 'current';

  return (
    <li className="relative pl-8 pb-8 last:pb-0">
      <span
        aria-hidden="true"
        className="absolute left-0 top-2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary"
      />
      <div className="font-mono text-sm text-primary tabular-nums">{period}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <span className="text-lg font-medium text-foreground">
          {url ? (
            <a href={url} rel="noopener noreferrer" className="hover:underline">
              {organization}
            </a>
          ) : (
            organization
          )}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-base text-muted-foreground">{role[lang]}</span>
      </div>
      <div className="mt-1 text-base text-muted-foreground">{focus[lang]}</div>
    </li>
  );
}
