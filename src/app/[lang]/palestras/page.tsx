import { Locale, i18n } from "@/i18n/config"
import { generatePageMetadata, generateEventSchema, generateAppearanceSchema, generateWorkSchema } from "@/lib/metadata"
import { talksByDate, upcomingTalks, isYearOnly, isDateOnly } from "@/lib/talks"
import { appearancesByDate } from "@/lib/appearances"
import { worksByYear } from "@/lib/works"
import type { Metadata } from "next"
import { ArrowUpRight, MapPin, Video } from "lucide-react"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

async function resolveLang(params: Promise<{ lang: string }>): Promise<Locale> {
  try {
    const resolved = await params
    if (resolved?.lang === "pt-BR" || resolved?.lang === "en") return resolved.lang
  } catch {
    // fall through to the default locale
  }
  return "pt-BR"
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const lang = await resolveLang(params)
  const isPT = lang === "pt-BR"

  return generatePageMetadata({
    title: isPT
      ? "Palestras e aulas"
      : "Talks and lectures",
    description: isPT
      ? "Aulas e palestras de Ricardo Esper sobre fraude, forense digital, privacidade e resposta a incidentes. Agenda e histórico."
      : "Ricardo Esper's lectures and talks on fraud, digital forensics, privacy and incident response. Schedule and past events.",
    path: "/palestras",
    lang,
    keywords: isPT
      ? ["Ricardo Esper palestra", "Ricardo Esper aula", "palestrante cibersegurança", "palestrante fraude", "IBDEE", "compliance palestra"]
      : ["Ricardo Esper talk", "Ricardo Esper lecture", "cybersecurity speaker", "fraud speaker", "IBDEE", "compliance lecture"],
  })
}

function formatDate(iso: string, lang: Locale): string {
  const locale = lang === "pt-BR" ? "pt-BR" : "en-US"

  // Cada formato mostra exatamente a precisão que temos, e nada além dela.

  // Ano puro sai como ano. Passar "2024" ao Intl com opções de dia e hora
  // renderiza "1 de janeiro, 00:00" — uma precisão que não temos.
  if (isYearOnly(iso)) return iso

  // Dia sem hora é data de calendário, não instante: converter de fuso aqui
  // mostraria 18/04 como 17/04 às 21:00. Formatar em UTC, que é como a
  // string foi lida, devolve o dia que o card do evento anuncia.
  if (isDateOnly(iso)) {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(iso))
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso))
}

export default async function Palestras({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const lang = await resolveLang(params)
  const isPT = lang === "pt-BR"
  const L = (a: string, b: string) => (isPT ? a : b)
  const talks = talksByDate()
  const proximas = new Set(upcomingTalks().map((t) => t.id))
  const appearances = appearancesByDate()
  const works = worksByYear()

  return (
    <>
      {/* O grafo: cada palestra é um Event, cada aparição um VideoObject e
          cada obra um Book. É o que faz um convite de terceiro valer como
          sinal, e não como mais uma frase do site sobre si mesmo. */}
      {talks.map((talk) => (
        <script
          key={`evt-${talk.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEventSchema(talk, lang)) }}
        />
      ))}
      {appearances.map((a) => (
        <script
          key={`apr-${a.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateAppearanceSchema(a, lang)) }}
        />
      ))}
      {works.map((w) => (
        <script
          key={`obr-${w.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWorkSchema(w, lang)) }}
        />
      ))}

      <header className="flex flex-col gap-4">
        <h6 style={{ color: "var(--color-accent)" }}>
          {L("Palestras e aulas", "Talks and lectures")}
        </h6>
        <h1>{L("Onde eu falo", "Where I speak")}</h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--color-neutral-300)", maxWidth: 680 }}>
          {L(
            "Aulas e palestras sobre fraude, forense digital, privacidade e resposta a incidentes. Para convites, a página de imprensa tem o contato e os temas que consigo cobrir com pouca antecedência.",
            "Lectures and talks on fraud, digital forensics, privacy and incident response. For invitations, the press page has the contact details and the topics I can cover at short notice."
          )}
        </p>
      </header>

      <section className="flex flex-col">
        {talks.map((talk) => {
          const online = talk.mode === "online"
          const formato = talk.mode
            ? online
              ? "Online"
              : L("Presencial", "In person")
            : L("Formato não informado", "Format not stated")

          return (
            <article key={talk.id} className="rule-t flex flex-col gap-2" style={{ padding: "26px 0" }}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span style={{ fontSize: 15, fontWeight: 500 }}>{formatDate(talk.startDate, lang)}</span>
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{ fontSize: 12, color: "var(--color-neutral-500)" }}
                >
                  {online ? <Video size={13} aria-hidden /> : <MapPin size={13} aria-hidden />}
                  {formato}
                </span>
                {proximas.has(talk.id) && (
                  <span className="tag tag-outline">{L("Em breve", "Upcoming")}</span>
                )}
              </div>

              {talk.program && (
                <span style={{ fontSize: 12, color: "var(--color-accent-300)" }}>
                  {talk.program[lang]}
                </span>
              )}

              <h4 style={{ textWrap: "balance" }}>{talk.title[lang]}</h4>

              {talk.role && (
                <span style={{ fontSize: 13, color: "var(--color-neutral-400)" }}>
                  {talk.role[lang]}
                </span>
              )}

              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-neutral-300)", maxWidth: 620 }}>
                {talk.summary[lang]}
              </p>

              <span style={{ fontSize: 13, color: "var(--color-neutral-500)" }}>
                {talk.host.url ? (
                  <a href={talk.host.url} target="_blank" rel="noopener noreferrer" className="row-link">
                    {talk.host.name}
                  </a>
                ) : (
                  talk.host.name
                )}
              </span>
            </article>
          )
        })}
      </section>

      {appearances.length > 0 && (
        <section className="flex flex-col gap-5">
          <h3>{L("Aparições", "Appearances")}</h3>
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
          >
            {appearances.map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card elev-sm"
                style={{ padding: "16px 18px 18px", gap: 8 }}
              >
                {a.series && <span className="card-kicker">{a.series}</span>}
                <span className="card-title">{a.title[lang]}</span>
                <p className="card-body">{a.summary[lang]}</p>
                <span className="card-meta" style={{ color: "var(--color-accent)" }}>
                  {L("Assistir", "Watch")}
                  <ArrowUpRight size={13} aria-hidden />
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {works.length > 0 && (
        <section className="flex flex-col gap-5">
          <h3>{L("Publicações", "Publications")}</h3>
          {works.map((w) => (
            <article key={w.id} className="rule-t flex flex-col gap-2" style={{ padding: "22px 0" }}>
              <span style={{ fontSize: 12, color: "var(--color-accent-300)" }}>{w.role[lang]}</span>
              <h4>{w.title}</h4>
              <span style={{ fontSize: 13, color: "var(--color-neutral-400)" }}>
                {L("de", "by")} {w.author}
                {w.publisher ? ` · ${w.publisher}` : ""}
              </span>
              {w.note && (
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-neutral-300)", maxWidth: 620 }}>
                  {w.note[lang]}
                </p>
              )}
            </article>
          ))}
        </section>
      )}
    </>
  )
}
