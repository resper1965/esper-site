import { getDictionary } from "@/i18n/dictionaries"
import { Locale, i18n } from "@/i18n/config"
import { generatePageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"
import { yearsOfExperience } from "@/lib/site"
import {
  Shield, Award, Globe, Building2, Users, BookOpen,
  CheckCircle2, ExternalLink, ChevronRight, Lock, Zap, FileSearch
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
        ? `Ricardo Esper: CISO com ${yearsOfExperience()} anos em cibersegurança. CEO da NESS (desde 1991), CISO da IONIC Health, fundador da forense.io. Especialista em LGPD, GDPR, HIPAA, SOC 2 e proteção executiva.`
        : `Ricardo Esper: CISO with ${yearsOfExperience()} years in cybersecurity. CEO of NESS (since 1991), CISO of IONIC Health, founder of forense.io. Expert in LGPD, GDPR, HIPAA, SOC 2 and executive protection.`,
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

  const companies = [
    { role: "CEO & Founder", company: "NESS", detail: isPT ? "desde 1991" : "since 1991", url: "https://ness.com.br", icon: Building2 },
    { role: "CISO & Co-Founder", company: "IONIC Health", detail: isPT ? "Saúde Digital" : "Digital Health", url: "https://ionic.health", icon: Shield },
    { role: "CEO", company: "forense.io", detail: isPT ? "Forense Digital" : "Digital Forensics", url: null, icon: FileSearch },
    { role: "CEO", company: "Trustness", detail: isPT ? "Privacidade & Compliance" : "Privacy & Compliance", url: null, icon: Lock },
    { role: "CEO", company: "Infinity Safe", detail: isPT ? "Proteção Executiva" : "Executive Protection", url: null, icon: Zap },
    { role: "Board Member", company: "Bekaa Trusted Advisors", detail: isPT ? "Conselheiro" : "Advisor", url: null, icon: Users },
  ]

  const certifications: Credential[] = [
    { label: "CCISO — Chief Information Security Officer", color: "cyber" },
    { label: "CEHv8 — Certified Ethical Hacker", color: "cyber" },
    { label: "GDPR Compliance", color: "counter" },
    { label: "Cybersecurity Awareness", color: "general" },
  ]

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
        ? `Ricardo Esper tem mais de ${yearsOfExperience()} anos de experiência em cibersegurança, tendo fundado a NESS em 1991. É CISO da IONIC Health, fundador da forense.io, Trustness e Infinity Safe. Possui certificações CCISO, CEHv8 e GDPR.`
        : `Ricardo Esper has over ${yearsOfExperience()} years of experience in cybersecurity, having founded NESS in 1991. He is CISO of IONIC Health, founder of forense.io, Trustness and Infinity Safe. He holds CCISO, CEHv8 and GDPR certifications.`,
    },
    {
      q: isPT ? "Em quais países Ricardo Esper atua como consultor?" : "In which countries does Ricardo Esper work as a consultant?",
      a: isPT
        ? "Ricardo Esper atua como consultor internacional em mais de 12 países, com foco especial em Brasil, EUA e Europa. Suas especialidades incluem LGPD (Brasil), GDPR (Europa), HIPAA e SOC 2 (EUA)."
        : "Ricardo Esper works as an international consultant in over 12 countries, with special focus on Brazil, USA and Europe. His specialties include LGPD (Brazil), GDPR (Europe), HIPAA and SOC 2 (USA).",
    },
    {
      q: isPT ? "Quais são os serviços oferecidos por Ricardo Esper?" : "What services does Ricardo Esper offer?",
      a: isPT
        ? "Ricardo Esper oferece CISO as a Service, consultoria em compliance (LGPD/GDPR/HIPAA), forense digital, contraespionagem corporativa (TSCM), proteção executiva e advisory board para empresas."
        : "Ricardo Esper offers CISO as a Service, compliance consulting (LGPD/GDPR/HIPAA), digital forensics, corporate counter-espionage (TSCM), executive protection and advisory board services.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#050a12]">
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
              <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#050a12] border-2 border-primary flex items-center justify-center">
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
              {isPT ? "12+ países atendidos" : "12+ countries served"}
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

        {/* ── COMPANIES ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {dict.about.globalPresence}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map(({ role, company, detail, url, icon: Icon }) => (
              <div key={company} className="glass-card rounded-xl p-4 stat-card group">
                <div className="flex items-start justify-between mb-3">
                  <Icon className="w-5 h-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-60 transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground mb-1">{role}</p>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{company}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
              </div>
            ))}
          </div>
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
                bg-primary text-[#050a12] hover:bg-primary/90
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
