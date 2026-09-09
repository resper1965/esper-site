import { COUNTRIES_VISITED } from "@/lib/site"

/**
 * Estados-membros da ONU. 193 desde a admissão do Sudão do Sul em 2011.
 * https://www.un.org/en/about-us/growth-in-un-membership
 *
 * É o denominador defensável. A contagem ISO 3166-1 (~249) inclui
 * territórios e dependências, e infla a porcentagem sem que fique claro
 * do que ela é porcentagem.
 */
const UN_MEMBER_STATES = 193

interface TravelStatsProps {
  journeys: number
  photos: number
  lang: "pt-BR" | "en"
}

export function TravelStats({ journeys, photos, lang }: TravelStatsProps) {
  const isPt = lang === "pt-BR"
  const pct = Math.round((COUNTRIES_VISITED / UN_MEMBER_STATES) * 100)

  // Anel: circunferência de um raio 52 num viewBox 120, traço 10.
  const r = 52
  const c = 2 * Math.PI * r
  const filled = (pct / 100) * c

  const tiles = [
    { value: COUNTRIES_VISITED, label: isPt ? "países" : "countries" },
    { value: journeys, label: isPt ? "travessias aqui" : "journeys here" },
    { value: photos, label: isPt ? "fotografias" : "photographs" },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-14">
      <div className="relative shrink-0">
        <svg viewBox="0 0 120 120" className="h-40 w-40" role="img"
             aria-label={
               isPt
                 ? `${pct} por cento: ${COUNTRIES_VISITED} de ${UN_MEMBER_STATES} Estados-membros da ONU`
                 : `${pct} percent: ${COUNTRIES_VISITED} of ${UN_MEMBER_STATES} UN member states`
             }>
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor"
                  strokeWidth="10" className="text-muted" />
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor"
                  strokeWidth="10" strokeLinecap="round" className="text-primary"
                  strokeDasharray={`${filled} ${c}`}
                  transform="rotate(-90 60 60)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <span className="text-3xl font-bold tabular-nums">{pct}%</span>
          <span className="text-xs text-muted-foreground mt-0.5">
            {isPt ? "do mundo" : "of the world"}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full">
        <dl className="grid grid-cols-3 gap-6 sm:gap-8">
          {tiles.map((t) => (
            <div key={t.label}>
              <dd className="text-3xl md:text-4xl font-bold tabular-nums text-primary">{t.value}</dd>
              <dt className="text-sm text-muted-foreground mt-1">{t.label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
          {isPt ? (
            <>
              A porcentagem é sobre os <strong className="text-foreground">{UN_MEMBER_STATES} Estados-membros
              da ONU</strong>, não sobre a contagem que inclui territórios — essa daria um número maior e
              diria menos.
            </>
          ) : (
            <>
              The percentage is against the <strong className="text-foreground">{UN_MEMBER_STATES} UN member
              states</strong>, not the count that includes territories — that one would be larger and say
              less.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
