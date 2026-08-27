import Link from "next/link"
import { Shield, Linkedin, ExternalLink, Lock } from "lucide-react"
import { Locale } from "@/i18n/config"

interface FooterProps {
  lang: Locale
}

export default function Footer({ lang }: FooterProps) {
  const isPT = lang === "pt-BR"
  const year = new Date().getFullYear()

  const navGroups = [
    {
      title: isPT ? "Navegação" : "Navigation",
      links: [
        { label: isPT ? "Início" : "Home", href: `/${lang}` },
        { label: "Blog", href: `/${lang}/blog` },
        { label: isPT ? "Sobre" : "About", href: `/${lang}/sobre` },
        { label: isPT ? "Serviços" : "Services", href: `/${lang}/servicos` },
        { label: isPT ? "Imprensa" : "Press", href: `/${lang}/imprensa` },
      ],
    },
    {
      title: isPT ? "Expertise" : "Expertise",
      links: [
        { label: isPT ? "Cibersegurança" : "Cybersecurity", href: `/${lang}/categoria/cybersecurity` },
        { label: isPT ? "Contraespionagem" : "Counter-Espionage", href: `/${lang}/categoria/counterespionage` },
        { label: isPT ? "Automação" : "Automation", href: `/${lang}/categoria/automation` },
        { label: "Compliance & Privacy", href: `/${lang}/servicos` },
      ],
    },
    {
      title: isPT ? "Organizações" : "Organizations",
      links: [
        { label: "HackerOne", href: "https://hackerone.com", external: true },
        { label: "OWASP", href: "https://owasp.org", external: true },
        { label: "IAPP", href: "https://iapp.org", external: true },
        { label: "OAB/SP", href: "https://oabsp.org.br", external: true },
      ],
    },
  ]

  const certifications = ["CCISO", "CEHv8", "GDPR", "Cybersecurity Awareness"]

  return (
    <footer className="relative border-t border-[rgba(0,180,216,0.1)] bg-[#050a12] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href={`/${lang}`} className="flex items-center gap-2.5 group mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-foreground">Ricardo Esper</span>
                <span className="text-[10px] text-primary font-mono tracking-widest opacity-70">CISO · EXPERT</span>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {isPT
                ? "34+ anos protegendo organizações no Brasil e no mundo. CEO da NESS, CISO da IONIC Health."
                : "34+ years protecting organizations in Brazil and worldwide. CEO of NESS, CISO of IONIC Health."}
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-1.5">
              {certifications.map((cert) => (
                <span
                  key={cert}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border cat-cyber"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Nav groups */}
          {navGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-primary mb-4 opacity-80">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social + CTA bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-b border-[rgba(0,180,216,0.08)] mb-6">
          {/* Social links */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              {isPT ? "Conecte-se:" : "Connect:"}
            </span>
            <a
              href="https://www.linkedin.com/in/ricardoesper"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(0,180,216,0.2)] text-primary hover:bg-[rgba(0,180,216,0.08)] hover:border-primary transition-all text-sm font-medium"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>

          {/* System status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs font-mono text-[#10b981]">
              {isPT ? "Sistema Online" : "System Online"}
            </span>
            <Lock className="w-3 h-3 text-[#10b981] opacity-60" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-mono">
          <p>
            &copy; {year} Ricardo Esper.{" "}
            {isPT ? "Todos os direitos reservados." : "All rights reserved."}
          </p>
          <div className="flex items-center gap-4">
            <span className="opacity-40">
              {isPT ? "Powered by" : "Powered by"} Cloudflare
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
