import Image from "next/image"
import { Download, Mail } from "lucide-react"
import { Locale } from "@/i18n/config"
import { identityProfiles, yearsOfExperience, COUNTRIES_VISITED, yearsInSecurity } from "@/lib/site"
import { CopyButton } from "@/components/copy-button"
import { Brand } from "@/components/brand"
import { certificationBadges } from "@/lib/credentials"

const PRESS_EMAIL = "imprensa@esper.ws"

/**
 * Press-kit, servido tanto pela rota com prefixo de idioma quanto pela raiz.
 *
 * A página é feita para ser copiada: bio pronta, dado verificável e tema de
 * entrevista ficam à mão, cada um com o botão que os leva para a área de
 * transferência. Quanto menos um jornalista precisar pedir, menos o texto
 * publicado vira improviso.
 */
export async function PressKit({ lang }: { lang: Locale }) {
  const isPT = lang === "pt-BR"
  const L = (a: string, b: string) => (isPT ? a : b)

  // ── Biografias prontas para publicação ────────────────────────
  const bios = [
    {
      length: L("Curta (~30 palavras)", "Short (~30 words)"),
      hint: L("Legenda, crédito de fonte", "Caption, source credit"),
      text: L(
        `Ricardo Esper é CISO e especialista em cibersegurança com mais de ${yearsInSecurity()} anos de experiência. Fundou a NESS em 1991 e é CISO da IONIC Health e fundador da forense.io.`,
        `Ricardo Esper is a CISO and cybersecurity expert with over ${yearsInSecurity()} years of experience. He founded NESS in 1991 and is CISO of IONIC Health and founder of forense.io.`
      ),
    },
    {
      length: L("Média (~70 palavras)", "Medium (~70 words)"),
      hint: L("Nota de rodapé, boletim", "Footnote, newsletter"),
      text: L(
        `Ricardo Esper é CISO e consultor internacional em cibersegurança, forense digital e privacidade, com mais de ${yearsInSecurity()} anos de experiência. Fundou a NESS em 1991, é CISO da IONIC Health e fundador da forense.io, Trustness e Infinity Safe. Atua com foco em LGPD, GDPR, HIPAA e SOC 2, além de contraespionagem corporativa (TSCM) e proteção executiva. É auditor líder ISO/IEC 27001 e 27701, e certificado CCISO e CEHv8.`,
        `Ricardo Esper is a CISO and international consultant in cybersecurity, digital forensics and privacy, with over ${yearsInSecurity()} years of experience. He founded NESS in 1991, is CISO of IONIC Health and founder of forense.io, Trustness and Infinity Safe. He works with a focus on LGPD, GDPR, HIPAA and SOC 2, as well as corporate counter-espionage (TSCM) and executive protection. He is an ISO/IEC 27001 and 27701 Lead Auditor, and CCISO and CEHv8 certified.`
      ),
    },
    {
      length: L("Longa (~140 palavras)", "Long (~140 words)"),
      hint: L("Perfil, apresentação de palestra", "Profile, speaker introduction"),
      text: L(
        `Ricardo Esper é Chief Information Security Officer (CISO) e consultor internacional com mais de ${yearsInSecurity()} anos dedicados à segurança da informação. Fundou a NESS em 1991, quando cibersegurança ainda era um assunto de nicho no Brasil, e desde então construiu um portfólio de empresas voltadas a diferentes camadas do problema: forense.io (forense digital), Trustness (privacidade e compliance) e Infinity Safe (proteção executiva). Atualmente é CISO da IONIC Health, onde lidera a estratégia de segurança em saúde digital — um setor sob pressão simultânea de LGPD, HIPAA e ataques de ransomware. Sua atuação combina governança — é auditor líder ISO/IEC 27001 e 27701, além de CCISO — com prática técnica (CEHv8, OSINT, TSCM). É membro de OWASP, IAPP, HackerOne, ERII e OAB/SP, e escreve regularmente sobre ameaças, privacidade e resposta a incidentes em ricardoesper.com.br.`,
        `Ricardo Esper is a Chief Information Security Officer (CISO) and international consultant with over ${yearsInSecurity()} years dedicated to information security. He founded NESS in 1991, when cybersecurity was still a niche subject in Brazil, and has since built a portfolio of companies addressing different layers of the problem: forense.io (digital forensics), Trustness (privacy and compliance) and Infinity Safe (executive protection). He is currently CISO of IONIC Health, where he leads security strategy in digital health — a sector under simultaneous pressure from LGPD, HIPAA and ransomware attacks. His work combines governance — ISO/IEC 27001 and 27701 Lead Auditor, and CCISO — with hands-on technical practice (CEHv8, OSINT, TSCM). He is a member of OWASP, IAPP, HackerOne, ERII and OAB/SP, and writes regularly about threats, privacy and incident response at ricardoesper.com.br.`
      ),
    },
  ]

  // ── Temas que ele cobre com pouca antecedência ────────────────
  const topics = [
    {
      title: L("Vazamentos de dados e LGPD", "Data breaches and LGPD"),
      angle: L(
        "O que a ANPD pode e não pode fazer, como as multas são calculadas e por que a notificação em 2 dias úteis muda a resposta a incidentes.",
        "What Brazil's data protection authority can and cannot do, how fines are calculated, and why the 2-business-day notification rule reshapes incident response."
      ),
    },
    {
      title: L("Ransomware contra saúde e infraestrutura", "Ransomware against healthcare and infrastructure"),
      angle: L(
        "Por que hospitais são alvo preferencial, o que muda quando o dado é clínico e onde o pagamento de resgate falha na prática.",
        "Why hospitals are a preferred target, what changes when the data is clinical, and where ransom payment fails in practice."
      ),
    },
    {
      title: L("Forense digital e prova em juízo", "Digital forensics and evidence in court"),
      angle: L(
        "Cadeia de custódia, integridade por hash e os erros de coleta que derrubam uma perícia antes da audiência.",
        "Chain of custody, hash integrity, and the collection mistakes that sink an expert report before the hearing."
      ),
    },
    {
      title: L("Contraespionagem corporativa (TSCM)", "Corporate counter-espionage (TSCM)"),
      angle: L(
        "Escutas, exfiltração por insider e proteção de executivos — o que é risco real e o que é folclore de mercado.",
        "Bugging, insider exfiltration and executive protection — what is genuine risk and what is industry folklore."
      ),
    },
    {
      title: L("IA generativa e risco de privacidade", "Generative AI and privacy risk"),
      angle: L(
        "Onde os dados corporativos realmente vazam no uso de IA e como escrever uma política que as pessoas conseguem seguir.",
        "Where corporate data actually leaks in AI usage, and how to write a policy people can realistically follow."
      ),
    },
  ]

  // ── Dados verificáveis ───────────────────────────────────────
  // Um modelo de linguagem levanta estes como afirmação atribuída; um
  // jornalista os confere. Por isso cada um sai de uma fonte única.
  const facts = [
    { label: L("Anos em cibersegurança", "Years in cybersecurity"), value: `${yearsInSecurity()}+` },
    { label: L("Anos em tecnologia", "Years in technology"), value: `${yearsOfExperience()}+` },
    { label: L("ness. fundada em", "ness. founded in"), value: "1991" },
    { label: L("Cargo atual", "Current role"), value: "CISO — IONIC Health" },
    { label: L("Países visitados", "Countries visited"), value: `${COUNTRIES_VISITED}` },
    { label: L("Certificações", "Certifications"), value: certificationBadges().join(" · ") },
    {
      label: L("Idiomas de entrevista", "Interview languages"),
      value: L("Português · Inglês", "Portuguese · English"),
    },
  ]

  const canais = [
    { nome: "LinkedIn", url: identityProfiles.linkedin.url },
    { nome: "YouTube", url: identityProfiles.youtube.url },
    { nome: "GitHub", url: identityProfiles.github.url },
  ]

  return (
    <>
      <header className="flex flex-col gap-4">
        <h6 style={{ color: "var(--color-accent)" }}>{L("Sala de imprensa", "Press room")}</h6>
        <h1>{L("Imprensa", "Press")}</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--color-neutral-300)", maxWidth: 680 }}>
          {L(
            "Tudo que um jornalista precisa para citar Ricardo Esper sem precisar pedir: biografias prontas, dados verificáveis, temas para entrevista e fotos. Retorno em até 24 horas.",
            "Everything a journalist needs to quote Ricardo Esper without having to ask: ready-to-publish bios, verifiable facts, interview topics and photos. Response within 24 hours."
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <a href={`mailto:${PRESS_EMAIL}`} className="btn btn-primary">
            <Mail size={16} aria-hidden />
            {PRESS_EMAIL}
          </a>
          <a href="/authors/ricardo.png" download className="btn btn-secondary">
            <Download size={16} aria-hidden />
            {L("Baixar foto", "Download photo")}
          </a>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h3>{L("Dados verificáveis", "Verifiable facts")}</h3>
        {/* A borda de meio pixel é o que evita a sobra cinza entre células
            adjacentes que uma borda de 1px deixa nesta grade. */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
        >
          {facts.map((f) => (
            <div
              key={f.label}
              className="flex flex-col gap-1.5"
              style={{ padding: "14px 16px", boxShadow: "0 0 0 .5px var(--color-neutral-900)" }}
            >
              <span style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>{f.label}</span>
              <span style={{ fontSize: 15 }}>{f.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3>{L("Biografias prontas", "Ready-to-publish bios")}</h3>
          <span style={{ fontSize: 13, color: "var(--color-neutral-500)" }}>
            {L("Use livremente, sem aprovação prévia.", "Free to use, no prior approval.")}
          </span>
        </div>
        {bios.map((bio) => (
          <article key={bio.length} className="card elev-sm" style={{ padding: "16px 18px", gap: 10 }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex flex-col">
                <span style={{ fontSize: 14, fontWeight: 500 }}>{bio.length}</span>
                <span style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>{bio.hint}</span>
              </span>
              <CopyButton
                value={bio.text}
                label={L("Copiar", "Copy")}
                copiedLabel={L("Copiado", "Copied")}
              />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--color-neutral-300)" }}>
              {bio.text}
            </p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3>{L("Temas para entrevista", "Interview topics")}</h3>
          <span style={{ fontSize: 13, color: "var(--color-neutral-500)" }}>
            {L("Com pouca antecedência, inclusive ao vivo.", "On short notice, including live.")}
          </span>
        </div>
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
        >
          {topics.map((t) => (
            <div key={t.title} className="flex flex-col gap-1.5">
              <span style={{ fontSize: 15, fontWeight: 500 }}>{t.title}</span>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-neutral-400)" }}>
                {t.angle}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-start gap-6">
        <Image
          src="/authors/ricardo.png"
          alt="Ricardo Esper"
          width={120}
          height={120}
          className="lighten"
          style={{ width: 120, flex: "none", borderRadius: "var(--radius-lg)" }}
        />
        <div className="flex flex-col gap-3" style={{ flex: "1 1 280px" }}>
          <h3>{L("Retrato oficial", "Official portrait")}</h3>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-neutral-400)", maxWidth: 560 }}>
            {L(
              "Crédito obrigatório: “Divulgação / Ricardo Esper”. Para outros formatos ou resoluções, escreva para a imprensa.",
              "Required credit: “Handout / Ricardo Esper”. For other formats or resolutions, contact the press address."
            )}
          </p>
          <div className="flex flex-wrap items-center gap-4" style={{ fontSize: 13 }}>
            <span style={{ color: "var(--color-neutral-500)" }}>
              {L("Canais oficiais", "Official channels")}:
            </span>
            {canais.map((c) => (
              <a
                key={c.nome}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="row-link"
              >
                {c.nome}
              </a>
            ))}
            <span style={{ color: "var(--color-neutral-500)" }}>
              <Brand name="ness." />
            </span>
          </div>
        </div>
      </section>
    </>
  )
}
