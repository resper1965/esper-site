import { Locale, i18n } from "@/i18n/config"
import { generatePageMetadata } from "@/lib/metadata"
import { journeyTimeline, type Journey } from "@/lib/journeys"
import { listPublishedMedia } from "@/lib/cloudflare/media"
import { COUNTRIES_VISITED } from "@/lib/site"
import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, ArrowRight, Users } from "lucide-react"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

async function resolveLang(params: Promise<{ lang: string }>): Promise<Locale> {
  try {
    const r = await params
    if (r?.lang === "pt-BR" || r?.lang === "en") return r.lang
  } catch {
    // cai para o idioma padrão
  }
  return "pt-BR"
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const lang = await resolveLang(params)
  const isPt = lang === "pt-BR"

  return generatePageMetadata({
    title: isPt ? "Viagens" : "Journeys",
    description: isPt
      ? `Ricardo Esper esteve em ${COUNTRIES_VISITED} países. Aqui ficam as travessias que deixaram alguma coisa — Camino de Santiago, acampamento base do Everest, Machu Picchu, Lençóis Maranhenses.`
      : `Ricardo Esper has visited ${COUNTRIES_VISITED} countries. These are the journeys that left something behind — Camino de Santiago, Everest Base Camp, Machu Picchu, Lençóis Maranhenses.`,
    path: "/viagens",
    lang,
    keywords: isPt
      ? ["Ricardo Esper viagens", "Camino de Santiago", "acampamento base do Everest", "Machu Picchu", "Lençóis Maranhenses", "74 países"]
      : ["Ricardo Esper travel", "Camino de Santiago", "Everest Base Camp", "Machu Picchu", "Lençóis Maranhenses", "74 countries"],
  })
}

/**
 * As fotos moram no R2 e os metadados no D1; a travessia é a dona
 * (`owner_id` = id da travessia). Buscar tudo de uma vez e agrupar em
 * memória evita uma consulta por travessia — são poucas dezenas de linhas.
 */
async function photosByJourney(): Promise<Map<string, Awaited<ReturnType<typeof listPublishedMedia>>>> {
  const grouped = new Map<string, Awaited<ReturnType<typeof listPublishedMedia>>>()
  try {
    const all = await listPublishedMedia("viagens")
    for (const m of all) {
      if (!m.owner_id) continue
      const list = grouped.get(m.owner_id) ?? []
      list.push(m)
      grouped.set(m.owner_id, list)
    }
  } catch {
    // Sem o binding do R2/D1 a página ainda vale: a linha do tempo é estática.
  }
  return grouped
}

export default async function ViagensPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const lang = await resolveLang(params)
  const isPt = lang === "pt-BR"
  const timeline = journeyTimeline().slice().reverse()
  const photos = await photosByJourney()

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {isPt ? "Viagens" : "Journeys"}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            {isPt ? (
              <>
                Estive em <strong className="text-foreground">{COUNTRIES_VISITED} países</strong>. É um
                número que digo com cuidado, porque impressiona e quase não significa nada sozinho — dá
                para atravessar uma fronteira sem nunca sair de dentro de si. Ficam aqui as travessias
                que desmontaram alguma certeza.
              </>
            ) : (
              <>
                I have been to <strong className="text-foreground">{COUNTRIES_VISITED} countries</strong>.
                It is a number I quote carefully: it impresses and means almost nothing on its own — you
                can cross a border without ever leaving yourself. These are the journeys that took a
                certainty apart.
              </>
            )}
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-14">
        <ol className="space-y-16">
          {timeline.map((j: Journey) => {
            const fotos = photos.get(j.id) ?? []
            return (
              <li key={j.id} className="scroll-mt-24" id={j.id}>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-primary text-sm shrink-0">{j.year}</span>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">{j.name[lang]}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {j.where[lang]}
                      </span>
                      {j.companion && (
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" aria-hidden="true" />
                          {isPt ? "com" : "with"} {j.companion}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <p className="mt-4 ml-0 md:ml-[3.25rem] text-muted-foreground leading-relaxed">
                  {j.note[lang]}
                </p>

                {j.relatedPostSlug && (
                  <p className="mt-4 ml-0 md:ml-[3.25rem]">
                    <Link
                      href={`/${lang}/blog/${j.relatedPostSlug}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline underline-offset-4 font-medium"
                    >
                      {isPt ? "Ler o relato" : "Read the account"}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </p>
                )}

                {fotos.length > 0 && (
                  <div className="mt-6 ml-0 md:ml-[3.25rem] grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fotos.map((f) => {
                      const alt = (lang === "pt-BR" ? f.alt_pt : f.alt_en) || f.alt_pt || ""
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={f.id}
                          src={`/img/${f.r2_key}`}
                          alt={alt}
                          loading="lazy"
                          decoding="async"
                          className="w-full aspect-[4/3] object-cover rounded-md border border-border bg-muted"
                        />
                      )
                    })}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
