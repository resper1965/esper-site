"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { Shield, Award, Globe, Terminal, ChevronDown, ExternalLink } from "lucide-react"
import { ParticleNetwork } from "./particle-network"

// ── Animated stat counter ──────────────────────────────────────────────────
function StatCounter({ value, suffix = "", label, icon: Icon, delay = 0 }: {
  value: number
  suffix?: string
  label: string
  icon: React.ElementType
  delay?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!isInView) return
    const timer = setTimeout(() => {
      const duration = 1500
      const startTime = performance.now()
      const tick = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
        setCount(Math.floor(eased * value))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [isInView, value, delay])

  return (
    <div ref={ref} className="stat-card glass-card rounded-xl p-4 sm:p-5 text-center group cursor-default">
      <Icon className="w-5 h-5 mx-auto mb-2 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
      <div className="text-2xl sm:text-3xl font-bold text-primary font-mono">
        {count}{suffix}
      </div>
      <div className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase">
        {label}
      </div>
    </div>
  )
}

// ── Typewriter roles ───────────────────────────────────────────────────────
const roles = [
  "Chief Information Security Officer",
  "Digital Forensics Expert",
  "International Privacy Consultant",
  "Cyber Intelligence Strategist",
  "Executive Protection Specialist",
  "Founder & CEO · NESS · since 1991",
]

function TypewriterRole() {
  const [roleIndex, setRoleIndex] = React.useState(0)
  const [text, setText] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    const current = roles[roleIndex]
    const speed = isDeleting ? 40 : 80
    const pause = isDeleting ? 0 : 2500

    if (!isDeleting && text === current) {
      const timeout = setTimeout(() => setIsDeleting(true), pause)
      return () => clearTimeout(timeout)
    }

    if (isDeleting && text === "") {
      setIsDeleting(false)
      setRoleIndex((i) => (i + 1) % roles.length)
      return
    }

    const timeout = setTimeout(() => {
      setText((t) =>
        isDeleting ? t.slice(0, -1) : current.slice(0, t.length + 1)
      )
    }, speed)

    return () => clearTimeout(timeout)
  }, [text, isDeleting, roleIndex])

  return (
    <span className="text-primary font-mono text-sm sm:text-base font-medium">
      {text}
      <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-[terminal-blink_1s_step-end_infinite]" />
    </span>
  )
}

// ── Cyber grid background ─────────────────────────────────────────────────
function CyberGridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Animated grid */}
      <div className="absolute inset-0 bg-cyber-grid opacity-60" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,180,216,0.12),transparent)]" />

      {/* Interactive particle network */}
      <ParticleNetwork />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050a12] to-transparent" />

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl"
      />

      {/* Scan line */}
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-[scan-line_8s_linear_infinite] opacity-60" />
    </div>
  )
}

// ── Credential badges ──────────────────────────────────────────────────────
function CredentialBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border cat-cyber">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[glow-pulse_2s_ease-in-out_infinite]" />
      {label}
    </span>
  )
}

// ── Main Hero ──────────────────────────────────────────────────────────────
interface HeroCommandProps {
  title: string
  subtitle?: string
  lang?: string
  actions?: Array<{ label: string; href: string; variant?: string }>
}

export function HeroCommand({ lang = 'pt-BR', subtitle }: HeroCommandProps) {
  const isPT = lang === 'pt-BR'

  const stats = [
    {
      value: 34, suffix: "+", label: isPT ? "Anos em Cyber" : "Years in Cyber",
      icon: Shield, delay: 0
    },
    {
      value: 5, suffix: "", label: isPT ? "Empresas Fundadas" : "Companies Founded",
      icon: Terminal, delay: 150
    },
    {
      value: 3, suffix: "", label: isPT ? "Certificações Elite" : "Elite Certifications",
      icon: Award, delay: 300
    },
    {
      value: 12, suffix: "+", label: isPT ? "Países Atendidos" : "Countries Served",
      icon: Globe, delay: 450
    },
  ]

  const credentials = ["CCISO", "CEHv8", "GDPR", "HackerOne", "OWASP", "IAPP", "OAB/SP"]

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
      <CyberGridBackground />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.05)]"
        >
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-xs font-mono text-[#10b981] uppercase tracking-widest">
            {isPT ? "Disponível para Consultoria" : "Available for Consulting"}
          </span>
        </motion.div>

        {/* Profile photo + name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 mb-8"
        >
          {/* Avatar with glow */}
          <div className="relative">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden avatar-glow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/authors/ricardo.png"
                alt="Ricardo Esper — CISO & Cybersecurity Expert"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Shield badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#050a12] border-2 border-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Name */}
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-shimmer">Ricardo Esper</span>
            </h1>
          </div>
        </motion.div>

        {/* Typewriter role */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="h-8 flex items-center justify-center mb-6"
        >
          <TypewriterRole />
        </motion.div>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed mb-8"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {credentials.map((c) => (
            <CredentialBadge key={c} label={c} />
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <Link
            href="#posts"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200
              bg-primary text-[#050a12] hover:bg-primary/90
              shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]"
          >
            {isPT ? "Ler Artigos" : "Read Articles"}
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </Link>
          <Link
            href="/sobre"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200
              border border-[rgba(0,180,216,0.3)] text-primary hover:bg-[rgba(0,180,216,0.08)]
              hover:border-primary"
          >
            {isPT ? "Sobre Ricardo" : "About Ricardo"}
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </Link>
          <a
            href="https://www.linkedin.com/in/ricardoesper"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200
              border border-[rgba(124,58,237,0.3)] text-[#a78bfa] hover:bg-[rgba(124,58,237,0.08)]
              hover:border-[#7c3aed]"
          >
            LinkedIn
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </a>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl"
        >
          {stats.map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </motion.div>

        {/* Company logos text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="mt-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-2"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
            {isPT ? "Empresas" : "Companies"}:
          </span>
          {["NESS", "IONIC Health", "forense.io", "Trustness", "Infinity Safe"].map((co, i) => (
            <span
              key={co}
              className="text-xs text-muted-foreground font-mono hover:text-primary transition-colors cursor-default"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {co}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border border-[rgba(0,180,216,0.3)] flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-primary animate-[float-up_1.5s_ease-in-out_infinite]" />
        </motion.div>
      </motion.div>
    </section>
  )
}
