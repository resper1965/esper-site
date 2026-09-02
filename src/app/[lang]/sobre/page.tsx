import { getDictionary } from "@/i18n/dictionaries"
import { Locale, i18n } from "@/i18n/config"
import { generatePageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"
import { yearsOfExperience, yearsInSecurity, COUNTRIES_VISITED } from "@/lib/site"
import { CareerTimeline } from "@/components/career-timeline"
import { certifications as certs } from "@/lib/credentials"
import { journeyTimeline } from "@/lib/journeys"
import {
  Shield, Award, Globe, Building2, BookOpen, CheckCircle2, ExternalLink,
  ChevronRight, Lock, Zap, FileSearch, Mountain,
} from "lucide-react"

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

  return generatePageMetadata({
    title: lang === "pt-BR" ? "Sobre Ricardo Esper — CISO, Forense Digital, Consultor Internacional" : "About Ricardo Esper — CISO, Digital Forensics, International Consultant",
    description:
      lang === "pt-BR"
        ? `Ricardo Esper: CISO com ${yearsInSecurity()} anos em cibersegurança. CEO da NESS (desde 1991), CISO da IONIC Health, fundador da forense.io. Especialista em LGPD, GDPR, HIPAA, SOC 2 e proteção executiva.`
        : `Ricardo Esper: CISO with ${yearsInSecurity()} years in cybersecurity. CEO of NESS (since 1991), CISO of IONIC Health, founder of forense.io. Expert in LGPD, GDPR, HIPAA, SOC 2 and executive protection.`,
    path: "/sobre",
    lang,
    keywords,
  })
}

// Static page — uses generateStaticParams() + dictionary data

interface Credential {
  label: string
  color: "cyber" | "counter" | "automation" | "general"
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
  } catch { lang = "pt-BR" }

  const dict = await getDictionary(lang)
  const isPT = lang === "pt-BR"

  const certifications: Credential[] = certs.map((c) => ({
    label: c.full[lang],
    color: "cyber" as const,
  }))

  const expertiseAreas = [
    { label: isPT ? "Arquitetura de Segurança da Informação" : "Information Security Architecture", icon: Shield },
    { label: isPT ? "Forense Digital & Resposta a Incidentes" : "Digital Forensics & Incident Response", icon: FileSearch },
    { label: isPT ? "Privacidade & Compliance Internacional" : "International Privacy & Compliance", icon: Globe },
    { label: isPT ? "Liderança CISO & Governança" : "CISO Leadership & Governance", icon: Award },
    { label: isPT ? "Inteligência Cibernética & OSINT" : "Cyber Intelligence & OSINT", icon: Lock },
    { label: isPT ? "Proteção Executiva (TSCM)" : "Executive Protection (TSCM)", icon: Zap },
  ]

  const communities = [
    { name: "HackerOne", detail: isPT ? "Bug Bounty" : "Bug Bounty", url: "https://hackerone.com" },
    { name: "OWASP", detail: isPT ? "Segurança de Aplicações" : "Application Security", url: "https://owasp.org" },
    { name: "IAPP", detail: isPT ? "Profissionais de Privacidade" : "Privacy Professionals", url: "https://iapp.org" },
    { name: "ERII", detail: isPT ? "Relações Internacionais" : "International Affairs", url: "https://erii.org" },
    { name: "OAB/SP", detail: isPT ? "Prática Legal" : "Legal Practice", url: "https://oabsp.org.br" },
  ]

  const faqs = [
    {
      q: isPT ? "Qual é a experiência de Ricardo Esper em cibersegurança?" : "What is Ricardo Esper's experience in cybersecurity?",
      a: isPT
        ? `Ricardo Esper tem mais de ${yearsInSecurity()} anos de experiência em cibersegurança, tendo fundado a NESS em 1991. É CISO da IONIC Health, fundador da forense.io, Trustness e Infinity Safe. Possui certificações CCISO, CEHv8 e GDPR.`
        : `Ricardo Esper has over ${yearsInSecurity()} years of experience in cybersecurity, having founded NESS in 1991. He is CISO of IONIC Health, founder of forense.io, Trustness and Infinity Safe. He holds CCISO, CEHv8 and GDPR certifications.`,
    },
    {
      q: isPT ? "Em quais países Ricardo Esper atua como consultor?" : "In which countries does Ricardo Esper work as a consultant?",
      a: isPT
        ? "Ricardo Esper atua como consultor internacional com foco em Brasil, EUA e Europa. Suas especialidades incluem LGPD (Brasil), GDPR (Europa), HIPAA e SOC 2 (EUA)."
        : "Ricardo Esper works as an international consultant focused on Brazil, USA and Europe. His specialties include LGPD (Brazil), GDPR (Europe), HIPAA and SOC 2 (USA).",
    },
    {
      q: isPT ? "Quais são os serviços oferecidos por Ricardo Esper?" : "What services does Ricardo Esper offer?",
      a: isPT
        ? "Ricardo Esper oferece CISO as a Service, consultoria em compliance (LGPD/GDPR/HIPAA), forense digital, contraespionagem corporativa (TSCM), proteção executiva e advisory board para empresas."
        : "Ricardo Esper offers CISO as a Service, compliance consulting (LGPD/GDPR/HIPAA), digital forensics, corporate counter-espionage (TSCM), executive protection and advisory board services.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B0F14]">
      {/* Background */}
      <div className="fixed inset-0 bg-cyber-grid opacity-20 pointer-events-none" aria-hidden />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-20">

        {/* ── HERO SECTION ─────────────────────────────────── */}
        <section className="text-center space-y-6">
          {/* Photo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden avatar-glow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/authors/ricardo.png"
                  alt="Ricardo Esper — CISO e Especialista em Cibersegurança"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#0B0F14] border-2 border-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          {/* Name + title */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              <span className="text-shimmer">Ricardo Esper</span>
            </h1>
            <p className="text-primary font-mono text-sm sm:text-base tracking-wide">
              CISO · Digital Forensics · International Consultant
            </p>
          </div>

          {/* Short bio */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            {dict.about.intro1}
          </p>

          {/* Status badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border cat-cyber">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {isPT ? `${yearsOfExperience()} anos de experiência` : `${yearsOfExperience()} years experience`}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border cat-automation">
              <CheckCircle2 className="w-3 h-3" />
              {isPT ? "Disponível para consultoria" : "Available for consulting"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border cat-counter">
              <Globe className="w-3 h-3" />
              {isPT ? "Auditor líder ISO 27001 e 27701" : "ISO 27001 and 27701 Lead Auditor"}
            </span>
          </div>
        </section>

        {/* ── BIO EXTENDED ─────────────────────────────────── */}
        <section className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {isPT ? "Trajetória" : "Background"}
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">{dict.about.intro1}</p>
          <p className="text-muted-foreground leading-relaxed">{dict.about.intro2}</p>
          <p className="text-muted-foreground leading-relaxed">{dict.about.intro3}</p>
        </section>

        {/* ── TRAJETÓRIA ────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {isPT ? "Trajetória" : "Career"}
            </h2>
          </div>
          <CareerTimeline lang={lang} />
        </section>

        {/* ── EXPERTISE GRID ───────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {dict.about.certifications}
            </h2>
          </div>

          {/* Certifications */}
          <div className="flex flex-wrap gap-2 mb-8">
            {certifications.map(({ label, color }) => (
              <span
                key={label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border cat-${color}`}
              >
                <CheckCircle2 className="w-3 h-3 opacity-70" />
                {label}
              </span>
            ))}
          </div>

          {/* Expertise areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expertiseAreas.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-lg glass-card group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-all">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── INTERNATIONAL COMMUNITY ───────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {dict.about.internationalCommunity}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {communities.map(({ name, detail, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-xl p-4 text-center group hover:scale-105 transition-all duration-200"
              >
                <p className="font-semibold text-sm text-primary group-hover:text-glow transition-all">{name}</p>
                <p className="text-xs text-muted-foreground mt-1">{detail}</p>
                <ExternalLink className="w-3 h-3 text-muted-foreground mx-auto mt-2 opacity-0 group-hover:opacity-60 transition-opacity" />
              </a>
            ))}
          </div>
        </section>

        {/* ── FORA DO TRABALHO ──────────────────────────────── */}
        {/* O número de países existia solto entre certificações e empresas.
            Aqui ele vira biografia: duas travessias datadas, que sustentam a
            contagem em vez de só afirmá-la. */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Mountain className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {isPT ? "Fora do trabalho" : "Away from work"}
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              {isPT
                ? `Viajar é o que me mantém curioso — e o que me deu a leitura de contexto que uso no trabalho. Conheço ${COUNTRIES_VISITED} países.`
                : `Travelling is what keeps me curious — and what gave me the sense of context I use at work. I have visited ${COUNTRIES_VISITED} countries.`}
            </p>
            <ul className="space-y-3">
              {journeyTimeline().map((j) => (
                <li key={j.year} className="flex gap-4 items-baseline">
                  <span className="font-mono text-sm text-primary shrink-0 w-12">{j.year}</span>
                  <span>
                    <span className="font-medium">{j.name[lang]}</span>
                    <span className="text-muted-foreground"> — {j.note[lang]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ (GEO/SEO) ─────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">FAQ</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="glass-card rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground">{q}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-7">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT CTA ──────────────────────────────────── */}
        <section className="glass-card rounded-2xl p-8 text-center border border-[rgba(0,180,216,0.2)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,180,216,0.05),transparent)]" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-foreground mb-3">{dict.about.contact}</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {dict.about.contactText}{" "}
              <span className="text-primary font-medium">LinkedIn</span>.
            </p>
            <a
              href="https://www.linkedin.com/in/ricardoesper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm
                bg-primary text-[#0B0F14] hover:bg-primary/90
                shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]
                transition-all duration-200"
            >
              {dict.about.linkedin}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>

      {/* FAQ Schema */}
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
    </div>
  )
}
