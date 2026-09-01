import { getDictionary } from "@/i18n/dictionaries"
import { Locale } from "@/i18n/config"
import { siteConfig, identityProfiles, yearsOfExperience } from "@/lib/site"
import { CopyButton } from "@/components/copy-button"
import { certificationBadges } from "@/lib/credentials"
import {
  Newspaper, Download, Mic, Quote, Image as ImageIcon,
  Mail, ExternalLink, CheckCircle2, Shield,
} from "lucide-react"

/**
 * Press-kit body, shared by the locale-prefixed route and the root-level one.
 *
 * Routing note: the middleware strips locale prefixes (`/pt-BR/imprensa` →
 * 301 → `/imprensa`), so the root-level page is the one visitors actually
 * reach. Both entry points render this, the same way `busca` does.
 */
export async function PressKit({ lang }: { lang: Locale }) {
  const dict = await getDictionary(lang)
  const isPT = lang === "pt-BR"

  // ── Ready-to-publish biographies ──────────────────────────────
  // Journalists copy these verbatim. Keeping three lengths means the
  // published wording stays under our control instead of being improvised.
  const bios = [
    {
      length: isPT ? "Curta (~30 palavras)" : "Short (~30 words)",
      hint: isPT ? "Legenda, crédito de fonte" : "Caption, source credit",
      text: isPT
        ? `Ricardo Esper é CISO e especialista em cibersegurança com mais de ${yearsOfExperience()} anos de experiência. Fundou a NESS em 1991 e é CISO da IONIC Health e fundador da forense.io.`
        : `Ricardo Esper is a CISO and cybersecurity expert with over ${yearsOfExperience()} years of experience. He founded NESS in 1991 and is CISO of IONIC Health and founder of forense.io.`,
    },
    {
      length: isPT ? "Média (~70 palavras)" : "Medium (~70 words)",
      hint: isPT ? "Nota de rodapé, boletim" : "Footnote, newsletter",
      text: isPT
        ? `Ricardo Esper é CISO e consultor internacional em cibersegurança, forense digital e privacidade, com mais de ${yearsOfExperience()} anos de experiência. Fundou a NESS em 1991, é CISO da IONIC Health e fundador da forense.io, Trustness e Infinity Safe. Atua com foco em LGPD, GDPR, HIPAA e SOC 2, além de contraespionagem corporativa (TSCM) e proteção executiva. É auditor líder ISO/IEC 27001 e 27701, e certificado CCISO e CEHv8.`
        : `Ricardo Esper is a CISO and international consultant in cybersecurity, digital forensics and privacy, with over ${yearsOfExperience()} years of experience. He founded NESS in 1991, is CISO of IONIC Health and founder of forense.io, Trustness and Infinity Safe. He works with a focus on LGPD, GDPR, HIPAA and SOC 2, as well as corporate counter-espionage (TSCM) and executive protection. He is an ISO/IEC 27001 and 27701 Lead Auditor, and CCISO and CEHv8 certified.`,
    },
    {
      length: isPT ? "Longa (~140 palavras)" : "Long (~140 words)",
      hint: isPT ? "Perfil, apresentação de palestra" : "Profile, speaker introduction",
      text: isPT
        ? `Ricardo Esper é Chief Information Security Officer (CISO) e consultor internacional com mais de ${yearsOfExperience()} anos dedicados à segurança da informação. Fundou a NESS em 1991, quando cibersegurança ainda era um assunto de nicho no Brasil, e desde então construiu um portfólio de empresas voltadas a diferentes camadas do problema: forense.io (forense digital), Trustness (privacidade e compliance) e Infinity Safe (proteção executiva). Atualmente é CISO da IONIC Health, onde lidera a estratégia de segurança em saúde digital — um setor sob pressão simultânea de LGPD, HIPAA e ataques de ransomware. Sua atuação combina governança — é auditor líder ISO/IEC 27001 e 27701, além de CCISO — com prática técnica (CEHv8, OSINT, TSCM). É membro de OWASP, IAPP, HackerOne, ERII e OAB/SP, e escreve regularmente sobre ameaças, privacidade e resposta a incidentes em ricardoesper.com.br.`
        : `Ricardo Esper is a Chief Information Security Officer (CISO) and international consultant with over ${yearsOfExperience()} years dedicated to information security. He founded NESS in 1991, when cybersecurity was still a niche subject in Brazil, and has since built a portfolio of companies addressing different layers of the problem: forense.io (digital forensics), Trustness (privacy and compliance) and Infinity Safe (executive protection). He is currently CISO of IONIC Health, where he leads security strategy in digital health — a sector under simultaneous pressure from LGPD, HIPAA and ransomware attacks. His work combines governance — ISO/IEC 27001 and 27701 Lead Auditor, and CCISO — with hands-on technical practice (CEHv8, OSINT, TSCM). He is a member of OWASP, IAPP, HackerOne, ERII and OAB/SP, and writes regularly about threats, privacy and incident response at ricardoesper.com.br.`,
    },
  ]

  // ── Topics he can speak to on short notice ────────────────────
  const topics = [
    {
      title: isPT ? "Vazamentos de dados e LGPD" : "Data breaches and LGPD",
      angle: isPT
        ? "O que a ANPD pode e não pode fazer, como as multas são calculadas e por que a notificação em 2 dias úteis muda a resposta a incidentes."
        : "What Brazil's data protection authority can and cannot do, how fines are calculated, and why the 2-business-day notification rule reshapes incident response.",
    },
    {
      title: isPT ? "Ransomware contra saúde e infraestrutura" : "Ransomware against healthcare and infrastructure",
      angle: isPT
        ? "Por que hospitais são alvo preferencial, o que muda quando o dado é clínico e onde o pagamento de resgate falha na prática."
        : "Why hospitals are a preferred target, what changes when the data is clinical, and where ransom payment fails in practice.",
    },
    {
      title: isPT ? "Forense digital e prova em juízo" : "Digital forensics and evidence in court",
      angle: isPT
        ? "Cadeia de custódia, integridade por hash e os erros de coleta que derrubam uma perícia antes da audiência."
        : "Chain of custody, hash integrity, and the collection mistakes that sink an expert report before the hearing.",
    },
    {
      title: isPT ? "Contraespionagem corporativa (TSCM)" : "Corporate counter-espionage (TSCM)",
      angle: isPT
        ? "Escutas, exfiltração por insider e proteção de executivos — o que é risco real e o que é folclore de mercado."
        : "Bugging, insider exfiltration and executive protection — what is genuine risk and what is industry folklore.",
    },
    {
      title: isPT ? "IA generativa e risco de privacidade" : "Generative AI and privacy risk",
      angle: isPT
        ? "Onde os dados corporativos realmente vazam no uso de IA e como escrever uma política que as pessoas conseguem seguir."
        : "Where corporate data actually leaks in AI usage, and how to write a policy people can realistically follow.",
    },
  ]

  // ── Verifiable facts (GEO: LLMs lift these as attributed claims) ──
  const facts = [
    { label: isPT ? "Anos de experiência" : "Years of experience", value: `${yearsOfExperience()}+` },
    { label: isPT ? "NESS fundada em" : "NESS founded in", value: "1991" },
    { label: isPT ? "Cargo atual" : "Current role", value: "CISO — IONIC Health" },
    { label: isPT ? "Certificações" : "Certifications", value: certificationBadges().join(" · ") },
    { label: isPT ? "Idiomas de entrevista" : "Interview languages", value: isPT ? "Português · Inglês" : "Portuguese · English" },
  ]

  const pressEmail = "imprensa@esper.ws"

  return (
    <div className="min-h-screen bg-[#0B0F14]">
      <div className="fixed inset-0 bg-cyber-grid opacity-20 pointer-events-none" aria-hidden />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-20">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border cat-cyber">
            <Newspaper className="w-3 h-3" />
            {isPT ? "SALA DE IMPRENSA" : "PRESS ROOM"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="text-shimmer">{isPT ? "Imprensa" : "Press"}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            {isPT
              ? "Tudo que um jornalista precisa para citar Ricardo Esper sem precisar pedir: biografias prontas, dados verificáveis, temas para entrevista e fotos em alta resolução. Retorno em até 24 horas."
              : "Everything a journalist needs to quote Ricardo Esper without having to ask: ready-to-publish biographies, verifiable facts, interview topics and high-resolution photos. Response within 24 hours."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${pressEmail}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm
                bg-primary text-[#0B0F14] hover:bg-primary/90
                shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]
                transition-all duration-200"
            >
              <Mail className="w-4 h-4" />
              {pressEmail}
            </a>
            <a
              href="/authors/ricardo.png"
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm
                border border-[rgba(0,180,216,0.3)] text-primary hover:bg-[rgba(0,180,216,0.08)] hover:border-primary
                transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              {isPT ? "Baixar foto" : "Download photo"}
            </a>
          </div>
        </section>

        {/* ── FAST FACTS ────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {isPT ? "Dados verificáveis" : "Verifiable facts"}
            </h2>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {facts.map(({ label, value }) => (
              <div key={label} className="glass-card rounded-xl p-4 stat-card">
                <dt className="text-xs font-mono text-muted-foreground mb-1">{label}</dt>
                <dd className="font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── BIOGRAPHIES ───────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Quote className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {isPT ? "Biografias prontas para publicação" : "Ready-to-publish biographies"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {isPT
              ? "Use livremente, sem necessidade de aprovação prévia."
              : "Free to use, no prior approval needed."}
          </p>
          <div className="space-y-4">
            {bios.map(({ length, hint, text }) => (
              <div key={length} className="glass-card rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{length}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
                  </div>
                  <CopyButton
                    value={text}
                    label={isPT ? "Copiar" : "Copy"}
                    copiedLabel={isPT ? "Copiado" : "Copied"}
                  />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── INTERVIEW TOPICS ──────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {isPT ? "Temas para entrevista" : "Interview topics"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {isPT
              ? "Assuntos sobre os quais Ricardo pode falar com pouca antecedência, inclusive ao vivo."
              : "Subjects Ricardo can speak to on short notice, including live."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topics.map(({ title, angle }) => (
              <div key={title} className="glass-card rounded-xl p-5 group">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{angle}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ASSETS ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {isPT ? "Material visual" : "Visual assets"}
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden avatar-glow flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/authors/ricardo.png"
                alt={isPT ? "Ricardo Esper — retrato oficial para imprensa" : "Ricardo Esper — official press portrait"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-foreground mb-1">
                {isPT ? "Retrato oficial" : "Official portrait"}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isPT
                  ? "Crédito obrigatório: “Divulgação / Ricardo Esper”. Para versões em outros formatos ou resoluções, escreva para a imprensa."
                  : "Required credit: “Handout / Ricardo Esper”. For other formats or resolutions, contact the press address."}
              </p>
              <a
                href="/authors/ricardo.png"
                download
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Download className="w-4 h-4" />
                {isPT ? "Baixar PNG" : "Download PNG"}
              </a>
            </div>
          </div>
        </section>

        {/* ── OFFICIAL CHANNELS ─────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-primary opacity-80">
              {isPT ? "Canais oficiais" : "Official channels"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {isPT
              ? "Perfis verificados. Qualquer outro perfil que use este nome não é oficial."
              : "Verified profiles. Any other profile using this name is not official."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "ricardoesper.com.br", url: siteConfig.url },
              { name: "LinkedIn", url: identityProfiles.linkedin },
              { name: "GitHub", url: identityProfiles.github },
            ].map(({ name, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-xl p-4 text-center group hover:scale-105 transition-all duration-200"
              >
                <p className="font-semibold text-sm text-primary group-hover:text-glow transition-all">{name}</p>
                <ExternalLink className="w-3 h-3 text-muted-foreground mx-auto mt-2 opacity-0 group-hover:opacity-60 transition-opacity" />
              </a>
            ))}
          </div>
        </section>

        {/* ── CONTACT CTA ───────────────────────────────────── */}
        <section className="glass-card rounded-2xl p-8 text-center border border-[rgba(0,180,216,0.2)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,180,216,0.05),transparent)]" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {isPT ? "Falar com Ricardo" : "Talk to Ricardo"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {isPT
                ? "Pauta em andamento, pedido de comentário ou convite para palestra — escreva direto. Fusos e prazos apertados são bem-vindos."
                : "Story in progress, request for comment or speaking invitation — write directly. Tight deadlines and time zones are welcome."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={`mailto:${pressEmail}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm
                  bg-primary text-[#0B0F14] hover:bg-primary/90 transition-all duration-200"
              >
                <Mail className="w-4 h-4" />
                {pressEmail}
              </a>
              <a
                href={identityProfiles.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm
                  border border-[rgba(0,180,216,0.3)] text-primary hover:bg-[rgba(0,180,216,0.08)] transition-all duration-200"
              >
                {dict.about.linkedin}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Structured data — a press room is a CollectionPage about the Person */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${siteConfig.url}/${lang}/imprensa`,
            name: isPT ? "Imprensa — Ricardo Esper" : "Press — Ricardo Esper",
            url: `${siteConfig.url}/${lang}/imprensa`,
            inLanguage: lang,
            about: { "@id": `${siteConfig.url}/sobre#person` },
            mainEntity: {
              "@type": "Person",
              "@id": `${siteConfig.url}/sobre#person`,
              name: "Ricardo Esper",
              description: bios[1].text,
            },
          }),
        }}
      />
    </div>
  )
}
