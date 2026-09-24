import { Locale, i18n } from "@/i18n/config"
import { generatePageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"
import Image from "next/image"
import { BadgeCheck, ChevronRight } from "lucide-react"
import { Brand, BrandText } from "@/components/brand"
import { careerTimeline } from "@/lib/career"
import { certifications, memberships } from "@/lib/credentials"
import { yearsInSecurity } from "@/lib/site"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  let lang: Locale = "pt-BR"
  try {
    const resolved = await params
    if (resolved?.lang === "pt-BR" || resolved?.lang === "en") lang = resolved.lang
  } catch { lang = "pt-BR" }

  const keywords =
    lang === "pt-BR"
      ? ["Ricardo Esper", "CISO", "cibersegurança", "forense digital", "NESS", "IONIC Health", "consultor internacional", "LGPD", "privacidade", "Ricardo Esper CISO", "Ricardo Esper Brasil", "especialista cibersegurança"]
      : ["Ricardo Esper", "CISO", "cybersecurity", "digital forensics", "NESS", "IONIC Health", "international consultant", "GDPR", "privacy", "Ricardo Esper Brazil", "cybersecurity expert"]

  const title =
    lang === "pt-BR"
      ? "Sobre Ricardo Esper — CISO e forense digital"
      : "About Ricardo Esper — CISO and digital forensics";

  return {
    ...generatePageMetadata({
      title,
      description:
        lang === "pt-BR"
          ? `Ricardo Esper: CISO com ${yearsInSecurity()} anos em cibersegurança. CEO da NESS (desde 1991), CISO da IONIC Health, fundador da forense.io. Especialista em LGPD, GDPR, HIPAA, SOC 2 e proteção executiva.`
          : `Ricardo Esper: CISO with ${yearsInSecurity()} years in cybersecurity. CEO of NESS (since 1991), CISO of IONIC Health, founder of forense.io. Expert in LGPD, GDPR, HIPAA, SOC 2 and executive protection.`,
      path: "/sobre",
      lang,
      keywords,
    }),
    // "Sobre Ricardo Esper" é a expressão que as pessoas digitam, então o nome
    // fica no título. Com o sufixo do template ele apareceria duas vezes —
    // `absolute` desliga o sufixo só aqui.
    title: { absolute: title },
  };
}

export default async function Sobre({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  let lang: Locale = "pt-BR"
  try {
    const resolved = await params
    if (resolved?.lang === "pt-BR" || resolved?.lang === "en") lang = resolved.lang
  } catch {
    lang = "pt-BR"
  }
  const isPT = lang === "pt-BR"
  const L = (a: string, b: string) => (isPT ? a : b)

  const expertise = isPT
    ? [
        "Arquitetura de Segurança da Informação",
        "Forense Digital & Resposta a Incidentes",
        "Privacidade & Compliance Internacional",
        "Liderança CISO & Governança",
        "Inteligência Cibernética & OSINT",
        "Proteção Executiva (TSCM)",
      ]
    : [
        "Information Security Architecture",
        "Digital Forensics & Incident Response",
        "International Privacy & Compliance",
        "CISO Leadership & Governance",
        "Cyber Intelligence & OSINT",
        "Executive Protection (TSCM)",
      ]

  const comunidade = [
    { name: "HackerOne", detail: "Bug Bounty" },
    { name: "OWASP", detail: L("Segurança de Aplicações", "Application Security") },
    { name: "IAPP", detail: L("Profissionais de Privacidade", "Privacy Professionals") },
    { name: "ERII", detail: L("Relações Internacionais", "International Affairs") },
    { name: "OAB/SP", detail: L("Prática Legal", "Legal Practice") },
  ].map((c) => {
    // A ERII entra sem URL na fonte, e `memberships` é `as const`: o tipo da
    // união não tem `url` em todos os ramos. O `in` é o que deixa o
    // compilador enxergar isso sem afrouxar a fonte.
    const m = memberships.find((x) => x.name === c.name)
    return { ...c, url: m && 'url' in m ? m.url : undefined }
  })

  const faqs = [
    {
      q: L(
        "Qual é a experiência de Ricardo Esper em cibersegurança?",
        "What is Ricardo Esper's experience in cybersecurity?"
      ),
      a: L(
        `Mais de ${yearsInSecurity()} anos, desde a fundação da ness. em 1991. É CISO e cofundador da IONIC Health, fundador da forense.io, Trustness e Infinity Safe, e board da Bekaa Trusted Advisors.`,
        `Over ${yearsInSecurity()} years, since founding ness. in 1991. He is CISO & co-founder of IONIC Health, founder of forense.io, Trustness and Infinity Safe, and on the board of Bekaa Trusted Advisors.`
      ),
    },
    {
      q: L("Em quais países atua como consultor?", "In which countries does he consult?"),
      a: L(
        "Brasil, EUA e Europa — LGPD, GDPR, HIPAA e SOC 2.",
        "Brazil, the US and Europe — LGPD, GDPR, HIPAA and SOC 2."
      ),
    },
    {
      q: L("Quais serviços oferece?", "What services does he offer?"),
      a: L(
        "CISO as a Service, compliance (LGPD/GDPR/HIPAA), forense digital, contraespionagem corporativa (TSCM), proteção executiva e advisory board.",
        "CISO as a Service, compliance (LGPD/GDPR/HIPAA), digital forensics, corporate counter-espionage (TSCM), executive protection and advisory board."
      ),
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map(({ q, a }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }),
        }}
      />

      {/* wrap-reverse: no desktop o retrato fica à direita do texto; abaixo
          de 900px ele sobe, e é a primeira coisa que se vê. */}
      <header className="flex flex-wrap-reverse items-start gap-8">
        <div className="flex flex-col gap-4" style={{ flex: "1 1 320px" }}>
          <h6 style={{ color: "var(--color-accent)" }}>{L("Sobre", "About")}</h6>
          <h1>Ricardo Esper</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--color-neutral-300)" }}>
            {L(
              `Em mais de ${yearsInSecurity()} anos dedicados à segurança da informação, testemunhei a transformação completa do cenário de ameaças digitais — desde os primeiros vírus de boot até campanhas de ransomware orquestradas por estados-nação.`,
              `Over ${yearsInSecurity()} years dedicated to information security, I’ve witnessed the complete transformation of the digital threat landscape — from early boot viruses to ransomware campaigns orchestrated by nation-states.`
            )}
          </p>
        </div>

        <Image
          src="/authors/ricardo.png"
          alt="Ricardo Esper"
          width={200}
          height={250}
          className="lighten"
          style={{
            width: 200,
            flex: "none",
            aspectRatio: "4 / 5",
            objectFit: "cover",
            borderRadius: "var(--radius-lg)",
          }}
          priority
        />
      </header>

      <section className="flex flex-col gap-5" style={{ maxWidth: 680 }}>
        <p style={{ fontSize: 16, lineHeight: 1.7 }}>
          <BrandText>
            {L(
              "Como CEO e fundador da ness. desde 1991, CISO e cofundador da IONIC Health e membro do board da Bekaa Trusted Advisors, construí minha carreira na intersecção entre tecnologia e governança corporativa — navegando LGPD, GDPR, HIPAA e SOC 2.",
              "As CEO & founder of ness. since 1991, CISO & co-founder of IONIC Health and board member at Bekaa Trusted Advisors, I’ve built my career at the intersection of technology and corporate governance — navigating LGPD, GDPR, HIPAA and SOC 2."
            )}
          </BrandText>
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7 }}>
          {L(
            "Pai de duas filhas, compreendo visceralmente que proteger dados corporativos é proteger vidas, reputações e legados.",
            "As a father of two daughters, I viscerally understand that protecting corporate data means protecting lives, reputations and legacies."
          )}
        </p>
      </section>

      <section className="flex flex-col gap-1">
        <h3 style={{ marginBottom: 14 }}>{L("Trajetória", "Career")}</h3>
        {careerTimeline().map((e) => (
          <div
            key={e.organization}
            className="rule grid gap-4"
            style={{ gridTemplateColumns: "64px minmax(0, 1fr)", padding: "14px 0" }}
          >
            <span
              style={{
                fontSize: 14,
                color: "var(--color-accent)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {e.startYear ?? "—"}
            </span>
            <div className="flex flex-col gap-1">
              <span style={{ fontSize: 16, fontWeight: 500 }}>
                <Brand name={e.organization} />
              </span>
              <span style={{ fontSize: 14, color: "var(--color-neutral-400)" }}>
                {e.role[lang]} · {e.focus[lang]}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section
        className="grid gap-8"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
      >
        <div className="flex flex-col gap-4">
          <h3>Expertise</h3>
          <ul className="flex flex-col gap-2.5">
            {expertise.map((item) => (
              <li key={item} className="flex items-center gap-3" style={{ fontSize: 15 }}>
                <span
                  aria-hidden
                  style={{ width: 12, height: 2, background: "var(--color-accent)", flex: "none" }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3>{L("Certificações", "Certifications")}</h3>
          <ul className="flex flex-col gap-2.5">
            {certifications.map((c) => (
              <li key={c.short} className="flex items-start gap-3" style={{ fontSize: 15 }}>
                <BadgeCheck
                  size={16}
                  style={{ color: "var(--color-accent)", flex: "none", marginTop: 3 }}
                  aria-hidden
                />
                <span>
                  {c.full[lang]}
                  {c.issuer && (
                    <span style={{ display: "block", fontSize: 13, color: "var(--color-neutral-500)" }}>
                      {c.issuer.name}
                      {c.identifier ? ` · ${c.identifier}` : ""}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3>{L("Comunidade internacional", "International community")}</h3>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
        >
          {comunidade.map((c) =>
            c.url ? (
              <a
                key={c.name}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card elev-sm"
                style={{ padding: "14px 16px", gap: 4 }}
              >
                <span style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>{c.detail}</span>
              </a>
            ) : (
              <div key={c.name} className="card elev-sm" style={{ padding: "14px 16px", gap: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>{c.detail}</span>
              </div>
            )
          )}
        </div>
      </section>

      <section className="flex flex-col gap-1">
        <h3 style={{ marginBottom: 10 }}>FAQ</h3>
        {faqs.map(({ q, a }) => (
          <details key={q} className="faq rule" style={{ padding: "14px 0" }}>
            <summary className="flex items-center gap-3" style={{ fontSize: 16, cursor: "pointer" }}>
              <ChevronRight
                size={16}
                className="faq-caret"
                style={{ color: "var(--color-accent)", flex: "none" }}
                aria-hidden
              />
              {q}
            </summary>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--color-neutral-300)",
                marginTop: 10,
                paddingLeft: 28,
                maxWidth: 680,
              }}
            >
              {a}
            </p>
          </details>
        ))}
      </section>
    </>
  )
}
