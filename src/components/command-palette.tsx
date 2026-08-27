"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, FileText, ArrowRight, Command, Loader2 } from "lucide-react"
import { i18n } from "@/i18n/config"

interface SearchResult {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  coverImage: string | null
  rank: number
}

interface PaletteItem {
  label: string
  description?: string
  href: string
  section: string
  external?: boolean
}

/**
 * Paths are relative to the active locale — the palette prefixes them at
 * render time so a click lands on the URL the page declares as canonical
 * instead of bouncing through a redirect.
 */
const QUICK_LINKS = [
  { label: "Início", path: "", section: "Navegação" },
  { label: "Blog", path: "/blog", section: "Navegação" },
  { label: "Serviços", path: "/servicos", section: "Navegação" },
  { label: "Sobre", path: "/sobre", section: "Navegação" },
]

const EXTERNAL_LINKS: PaletteItem[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ricardoesper", section: "Social", external: true },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const localePrefix = i18n.locales.find((l) => pathname?.startsWith(`/${l}`)) ?? i18n.defaultLocale
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Global keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  // Search with debounce
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(() => doSearch(query), 250)
    return () => clearTimeout(debounceRef.current)
  }, [query, doSearch])

  // Build items list
  const allItems: PaletteItem[] = query.trim().length >= 2
    ? results.map((r) => ({
        label: r.title,
        description: r.excerpt?.slice(0, 80) || r.category,
        href: `/${localePrefix}/blog/${r.slug}`,
        section: "Resultados",
      }))
    : [
        ...QUICK_LINKS.map((l) => ({ ...l, href: `/${localePrefix}${l.path}` })),
        ...EXTERNAL_LINKS,
      ]

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(0)
  }, [allItems.length])

  const navigate = (href: string, external?: boolean) => {
    setOpen(false)
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer")
    } else {
      router.push(href)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && allItems[selectedIndex]) {
      const item = allItems[selectedIndex]
      navigate(item.href, item.external)
    }
  }

  return (
    <>
      {/* Trigger button in header */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-primary transition-all duration-200 bg-background/50 backdrop-blur-sm"
        aria-label="Abrir busca (⌘K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Buscar...</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted/50 text-[10px] font-mono text-muted-foreground border border-border/30">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
        aria-label="Buscar"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-[15vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[101] w-auto sm:w-full sm:max-w-lg"
            >
              <div className="rounded-xl border border-border/50 bg-[#0a1120]/95 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Buscar artigos, navegar..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-mono"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {loading && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
                  <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/30 border border-border/30">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto p-2">
                  {allItems.length === 0 && query.trim().length >= 2 && !loading && (
                    <div className="py-8 text-center text-sm text-muted-foreground font-mono">
                      Nenhum resultado encontrado
                    </div>
                  )}

                  {allItems.length > 0 && (
                    <div className="space-y-1">
                      {/* Group by section */}
                      {Array.from(new Set(allItems.map((i) => i.section))).map((section) => (
                        <div key={section}>
                          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                            {section}
                          </div>
                          {allItems
                            .filter((i) => i.section === section)
                            .map((item) => {
                              const globalIndex = allItems.indexOf(item)
                              const isSelected = globalIndex === selectedIndex
                              return (
                                <button
                                  key={item.href}
                                  onClick={() => navigate(item.href, item.external)}
                                  onMouseEnter={() => setSelectedIndex(globalIndex)}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                                    isSelected
                                      ? "bg-primary/10 text-primary"
                                      : "text-foreground/80 hover:bg-muted/20"
                                  }`}
                                >
                                  <FileText className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium">{item.label}</div>
                                    {"description" in item && item.description && (
                                      <div className="truncate text-xs text-muted-foreground mt-0.5">
                                        {item.description}
                                      </div>
                                    )}
                                  </div>
                                  {isSelected && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                                </button>
                              )
                            })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border/20 text-[10px] font-mono text-muted-foreground/50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 rounded bg-muted/20 border border-border/20">↑↓</kbd>
                      navegar
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 rounded bg-muted/20 border border-border/20">↵</kbd>
                      abrir
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-muted/20 border border-border/20">esc</kbd>
                    fechar
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
