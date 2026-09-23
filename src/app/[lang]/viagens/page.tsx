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

/** Os 193 Estados-membros da ONU — o denominador que a nota explica. */
const ESTADOS_MEMBROS_ONU = 193

export default async function ViagensPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const lang = await resolveLang(params)
  const isPt = lang === "pt-BR"
  const timeline = journeyTimeline().slice().reverse()
  const photos = await photosByJourney()
  const pct = Math.round((COUNTRIES_VISITED / ESTADOS_MEMBROS_ONU) * 100)

  return (
    <>
      <header className="flex flex-col gap-4">
        <h6 style={{ color: "var(--color-accent)" }}>
          {isPt ? "Fora do trabalho" : "Away from work"}
        </h6>
        <h1>{isPt ? "Viagens" : "Journeys"}</h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--color-neutral-300)", maxWidth: 680 }}>
          {isPt
            ? `Estive em ${COUNTRIES_VISITED} países. É um número que digo com cuidado, porque impressiona e quase não significa nada sozinho — dá para atravessar uma fronteira sem nunca sair de dentro de si. Ficam aqui as travessias que desmontaram alguma certeza.`
            : `I have been to ${COUNTRIES_VISITED} countries. It is a number I quote carefully: it impresses and means almost nothing on its own — you can cross a border without ever leaving yourself. These are the journeys that took a certainty apart.`}
        </p>
      </header>

      {/* O anel: a fração do mundo, com o denominador dito por extenso na
          nota. Sem a nota, "38%" sobre qual total ninguém sabe. */}
      <section className="flex flex-wrap items-center gap-8">
        <div
          className="grid place-items-center"
          style={{
            width: 128,
            height: 128,
            flex: "none",
            borderRadius: "50%",
            background: `conic-gradient(var(--color-accent) 0 ${pct}%, var(--color-neutral-800) ${pct}% 100%)`,
          }}
          role="img"
          aria-label={isPt ? `${pct}% do mundo` : `${pct}% of the world`}
        >
          <div
            className="grid place-items-center text-center"
            style={{
              width: 104,
              height: 104,
              borderRadius: "50%",
              background: "var(--color-bg)",
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 500, lineHeight: 1 }}>{pct}%</span>
            <span style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>
              {isPt ? "do mundo" : "of the world"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3" style={{ maxWidth: 420 }}>
          <p style={{ fontSize: 15 }}>
            <span style={{ color: "var(--color-accent-200)" }}>{COUNTRIES_VISITED}</span>{" "}
            {isPt ? "países" : "countries"} ·{" "}
            <span style={{ color: "var(--color-accent-200)" }}>{timeline.length}</span>{" "}
            {isPt ? "travessias aqui" : "journeys here"}
          </p>
          <p style={{ fontSize: 13, color: "var(--color-neutral-500)", lineHeight: 1.6 }}>
            {isPt
              ? `A porcentagem é sobre os ${ESTADOS_MEMBROS_ONU} Estados-membros da ONU, não sobre a contagem que inclui territórios — essa daria um número maior e diria menos.`
              : `The percentage is against the ${ESTADOS_MEMBROS_ONU} UN member states, not the count that includes territories — that one would be larger and say less.`}
          </p>
        </div>
      </section>

      <section>
        <ol className="flex flex-col">
          {timeline.map((j: Journey) => {
            const fotos = photos.get(j.id) ?? []
            return (
              <li key={j.id} id={j.id} className="rule-t flex flex-col gap-3" style={{ padding: "28px 0", scrollMarginTop: 24 }}>
                <span style={{ fontSize: 14, color: "var(--color-accent)", fontVariantNumeric: "tabular-nums" }}>
                  {j.year}
                </span>
                <h3>{j.name[lang]}</h3>

                <p
                  className="flex flex-wrap items-center gap-x-5 gap-y-1"
                  style={{ fontSize: 13, color: "var(--color-neutral-500)" }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} aria-hidden />
                    {j.where[lang]}
                  </span>
                  {j.companion && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={14} aria-hidden />
                      {isPt ? "com" : "with"} {j.companion}
                    </span>
                  )}
                </p>

                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-neutral-300)", maxWidth: 620 }}>
                  {j.note[lang]}
                </p>

                {j.relatedPostSlug && (
                  <Link
                    href={`/${lang}/blog/${j.relatedPostSlug}`}
                    className="btn btn-ghost self-start"
                    style={{ paddingInline: 0 }}
                  >
                    {isPt ? "Ler o relato" : "Read the account"}
                    <ArrowRight size={14} aria-hidden />
                  </Link>
                )}

                {fotos.length > 0 && (
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
                  >
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
                          className="w-full object-cover"
                          style={{ aspectRatio: "4 / 3", borderRadius: "var(--radius-md)" }}
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
    </>
  )
}
