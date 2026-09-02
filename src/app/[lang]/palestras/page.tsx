import { Locale, i18n } from "@/i18n/config"
import { generatePageMetadata, generateEventSchema, generateAppearanceSchema } from "@/lib/metadata"
import { talksByDate, upcomingTalks, isYearOnly } from "@/lib/talks"
import { appearancesByDate } from "@/lib/appearances"
import { postUrl } from "@/lib/urls"
import type { Metadata } from "next"
import { Mic, Calendar, ExternalLink, Video, MapPin, ArrowRight, Radio } from "lucide-react"
import Link from "next/link"

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
      ? "Palestras e aulas — Ricardo Esper"
      : "Talks and lectures — Ricardo Esper",
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
  // Ano puro sai como ano. Passar "2024" ao Intl com opções de dia e hora
  // renderiza "1 de janeiro, 00:00" — uma precisão que não temos.
  if (isYearOnly(iso)) return iso
  return new Intl.DateTimeFormat(lang === "pt-BR" ? "pt-BR" : "en-US", {
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
  const talks = talksByDate()
  const upcoming = new Set(upcomingTalks().map((t) => t.id))
  const appearances = appearancesByDate()

  return (
    <div className="min-h-screen bg-[#0B0F14]">
      <div className="fixed inset-0 bg-cyber-grid opacity-20 pointer-events-none" aria-hidden />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {isPT ? "Palestras e aulas" : "Talks and lectures"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            {isPT ? "Onde eu falo" : "Where I speak"}
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            {isPT
              ? "Aulas e palestras sobre fraude, forense digital, privacidade e resposta a incidentes. Para convites, a página de imprensa tem o contato e os temas que consigo cobrir com pouca antecedência."
              : "Lectures and talks on fraud, digital forensics, privacy and incident response. For invitations, the press page has the contact details and the topics I can cover at short notice."}
          </p>
        </header>

        <ul className="space-y-6">
          {talks.map((talk) => (
            <li key={talk.id} className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
              {upcoming.has(talk.id) && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.05)] text-[#10b981]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  {isPT ? "Em breve" : "Upcoming"}
                </span>
              )}

              <div>
                {talk.program && (
                  <p className="text-xs font-mono uppercase tracking-widest text-primary opacity-80 mb-2">
                    {talk.program[lang]}
                  </p>
                )}
                <h2 className="text-xl font-semibold leading-snug">{talk.title[lang]}</h2>
                {talk.role && (
                  <p className="text-sm text-muted-foreground mt-1">{talk.role[lang]}</p>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">{talk.summary[lang]}</p>

              <dl className="grid sm:grid-cols-3 gap-4 text-sm pt-2 border-t border-white/5">
                <div>
                  <dt className="text-xs font-mono uppercase tracking-wide text-muted-foreground mb-1">
                    {isPT ? "Quando" : "When"}
                  </dt>
                  <dd className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    {formatDate(talk.startDate, lang)}
                  </dd>
                </div>
                {talk.mode && (
                  <div>
                    <dt className="text-xs font-mono uppercase tracking-wide text-muted-foreground mb-1">
                      {isPT ? "Formato" : "Format"}
                    </dt>
                    <dd className="flex items-center gap-2">
                      {talk.mode === "online" ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-primary shrink-0" />
                          Online
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          {talk.location ?? (isPT ? "Presencial" : "In person")}
                        </>
                      )}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-mono uppercase tracking-wide text-muted-foreground mb-1">
                    {isPT ? "Realização" : "Host"}
                  </dt>
                  <dd>
                    {talk.host.url ? (
                      <a
                        href={talk.host.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        {talk.host.name}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      talk.host.name
                    )}
                  </dd>
                </div>
              </dl>

              {talk.relatedPostSlug && (
                <Link
                  href={postUrl(lang, talk.relatedPostSlug)}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  {isPT ? "Li sobre o tema no blog" : "Read about the topic on the blog"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* ── APARIÇÕES ─────────────────────────────────────── */}
        {/* Separado das palestras porque a natureza é outra: aqui ele é o
            assunto, não quem ensina. É o que responde "quem mais fala dessa
            pessoa?" — e a resposta vem de fora, que é o que dá peso. */}
        {appearances.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
                {isPT ? "Aparições" : "Appearances"}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              {isPT
                ? "Entrevistas e conversas em veículos de terceiros."
                : "Interviews and conversations on third-party outlets."}
            </p>
            <ul className="space-y-4">
              {appearances.map((a) => (
                <li key={a.id} className="glass-card rounded-2xl p-6 space-y-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold leading-snug">{a.title[lang]}</h3>
                    {a.publishedDate && (
                      <span className="text-xs font-mono text-muted-foreground">
                        {new Date(a.publishedDate + "T12:00:00Z").getFullYear()}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{a.summary[lang]}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm pt-1">
                    <span className="text-muted-foreground">{a.series ?? a.outlet.name}</span>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      {isPT ? "Assistir" : "Watch"}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Um Event por palestra, cada um apontando para o mesmo @id do Person.
          É o que faz "fui convidado a falar" virar dado conferível em vez de
          adjetivo. */}
      {talks.map((talk) => (
        <script
          key={`schema-${talk.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEventSchema(talk, lang)) }}
        />
      ))}

      {appearances.map((a) => (
        <script
          key={`schema-${a.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateAppearanceSchema(a, lang)) }}
        />
      ))}
    </div>
  )
}
