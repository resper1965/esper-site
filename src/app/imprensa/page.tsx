import { generatePageMetadata } from "@/lib/metadata"
import { PressKit } from "../[lang]/imprensa/press-kit"
import type { Metadata } from "next"

/**
 * Root-level press room.
 *
 * The middleware 301-redirects `/pt-BR/imprensa` to `/imprensa`, so this is
 * the URL visitors and crawlers actually land on — the locale-prefixed route
 * exists only to serve that redirect. Same shape as `busca`.
 */
export const metadata: Metadata = generatePageMetadata({
  title: "Imprensa — Ricardo Esper | Press Kit, Biografia e Contato",
  description:
    "Press kit oficial de Ricardo Esper: biografias prontas para publicação, temas para entrevista, dados verificáveis, fotos em alta resolução e contato direto para imprensa.",
  path: "/imprensa",
  lang: "pt-BR",
  keywords: [
    "Ricardo Esper imprensa",
    "press kit Ricardo Esper",
    "biografia Ricardo Esper",
    "entrevista cibersegurança",
    "especialista LGPD entrevista",
    "fonte cibersegurança Brasil",
  ],
})

export default async function ImprensaPage() {
  return <PressKit lang="pt-BR" />
}
