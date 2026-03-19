"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, Shield, ChevronDown } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Locale } from "@/i18n/config"

interface SiteNavProps {
  lang: Locale
  dict: {
    nav: {
      home: string
      about: string
      blog: string
    }
  }
}

export function SiteNav({ lang, dict }: SiteNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false) }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const navLinks = [
    { label: dict.nav.home, href: `/${lang}` },
    { label: dict.nav.about, href: `/${lang}/sobre` },
    { label: dict.nav.blog ?? "Blog", href: `/${lang}/blog` },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(5,10,18,0.95)] backdrop-blur-md border-b border-[rgba(0,180,216,0.12)] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2.5 group"
            aria-label="Ricardo Esper — Home"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/60 transition-all duration-200 shadow-[0_0_10px_rgba(0,180,216,0.1)]">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight text-foreground">Ricardo Esper</span>
              <span className="text-[10px] text-primary font-mono tracking-widest opacity-70">CISO · CYBER</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/4"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            ))}

            {/* Services link */}
            <Link
              href={`/${lang}/servicos`}
              className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                isActive(`/${lang}/servicos`)
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/4"
              }`}
            >
              {lang === 'pt-BR' ? 'Serviços' : 'Services'}
              {isActive(`/${lang}/servicos`) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="hidden md:flex items-center">
              <LanguageSwitcher currentLocale={lang} />
            </div>

            {/* LinkedIn CTA */}
            <a
              href="https://www.linkedin.com/in/ricardoesper"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                border border-[rgba(0,180,216,0.3)] text-primary hover:bg-[rgba(0,180,216,0.08)] hover:border-primary
                transition-all duration-200"
            >
              LinkedIn
              <ChevronDown className="w-3 h-3 rotate-[-90deg] opacity-60" />
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-[#0d1520] border-l border-[rgba(0,180,216,0.12)] shadow-2xl transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-[rgba(0,180,216,0.08)]">
            <span className="text-sm font-bold text-foreground">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Links */}
          <nav className="px-4 py-6 space-y-1">
            {[...navLinks, { label: lang === 'pt-BR' ? 'Serviços' : 'Services', href: `/${lang}/servicos` }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-primary bg-primary/10 border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/4"
                }`}
              >
                <Shield className="w-4 h-4 opacity-50" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 border-t border-[rgba(0,180,216,0.08)]">
            <LanguageSwitcher currentLocale={lang} />
            <a
              href="https://www.linkedin.com/in/ricardoesper"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
                border border-[rgba(0,180,216,0.3)] text-primary hover:bg-[rgba(0,180,216,0.08)]
                transition-all duration-200 w-full"
            >
              LinkedIn →
            </a>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content jump under fixed nav */}
      <div className="h-16" aria-hidden />
    </>
  )
}
