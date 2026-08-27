import { Locale, i18n } from "@/i18n/config"
import { generatePageMetadata } from "@/lib/metadata"
import { PressKit } from "./press-kit"
import type { Metadata } from "next"

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
      ? "Imprensa — Ricardo Esper | Press Kit, Biografia e Contato"
      : "Press — Ricardo Esper | Press Kit, Biography and Contact",
    description: isPT
      ? "Press kit oficial de Ricardo Esper: biografias prontas para publicação, temas para entrevista, dados verificáveis, fotos em alta resolução e contato direto para imprensa."
      : "Ricardo Esper's official press kit: ready-to-publish biographies, interview topics, verifiable facts, high-resolution photos and direct press contact.",
    path: "/imprensa",
    lang,
    keywords: isPT
      ? ["Ricardo Esper imprensa", "press kit Ricardo Esper", "biografia Ricardo Esper", "entrevista cibersegurança", "especialista LGPD entrevista", "fonte cibersegurança Brasil"]
      : ["Ricardo Esper press", "Ricardo Esper press kit", "Ricardo Esper biography", "cybersecurity interview", "GDPR expert interview", "cybersecurity source Brazil"],
  })
}

export default async function Imprensa({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const lang = await resolveLang(params)
  return <PressKit lang={lang} />
}
