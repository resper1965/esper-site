import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryConfig } from "@/lib/categories"

interface BlogCardProps {
  url: string
  title: string
  description: string
  date: string
  tags?: string[]
  thumbnail?: string
  readingTime?: number
  isNew?: boolean
  lang?: "pt-BR" | "en"
}

// Map category slug → CSS class
function getCategoryClass(tag: string): string {
  const t = tag.toLowerCase()
  if (t.includes("cyber") || t.includes("segu") || t.includes("security")) return "cat-cyber"
  if (t.includes("contra") || t.includes("counter") || t.includes("espio")) return "cat-counter"
  if (t.includes("autom") || t.includes("home") || t.includes("smart")) return "cat-automation"
  if (t.includes("travel") || t.includes("viagem") || t.includes("turismo")) return "cat-travel"
  return "cat-general"
}

// Accent color for the top bar
function getCategoryAccent(tag: string): string {
  const t = tag.toLowerCase()
  if (t.includes("cyber") || t.includes("segu") || t.includes("security"))
    return "from-[#00b4d8] to-[#0077a8]"
  if (t.includes("contra") || t.includes("counter") || t.includes("espio"))
    return "from-[#7c3aed] to-[#5b21b6]"
  if (t.includes("autom") || t.includes("home") || t.includes("smart"))
    return "from-[#10b981] to-[#047857]"
  if (t.includes("travel") || t.includes("viagem"))
    return "from-[#f59e0b] to-[#b45309]"
  return "from-[#475569] to-[#334155]"
}

export function BlogCard({
  url,
  title,
  description,
  date,
  tags = [],
  readingTime,
  isNew = false,
  lang = "pt-BR",
}: BlogCardProps) {
  const primaryTag = tags[0] || ""
  const categoryConfig = getCategoryConfig(primaryTag || "Geral")
  const CategoryIcon = categoryConfig?.icon
  const catClass = getCategoryClass(primaryTag)
  const accentGradient = getCategoryAccent(primaryTag)

  return (
    <Link
      href={url}
      className={cn(
        "group block w-full max-w-md relative overflow-hidden rounded-xl",
        "glass-card",
        "hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300"
      )}
    >
      {/* Top accent bar */}
      <div className={cn("h-0.5 w-full bg-gradient-to-r opacity-70 group-hover:opacity-100 transition-opacity", accentGradient)} />

      {/* Card header: icon + NEW badge */}
      <div className="relative h-16 flex items-center justify-between px-5 border-b border-[rgba(0,180,216,0.06)]">
        {/* Category icon */}
        <div className={cn("flex items-center gap-2 text-xs font-mono font-medium border rounded-full px-2.5 py-1", catClass)}>
          {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" />}
          <span>{categoryConfig?.label || primaryTag}</span>
        </div>

        {/* NEW badge */}
        {isNew && (
          <span className="text-[10px] font-bold font-mono uppercase tracking-widest px-2 py-0.5 rounded-full
            bg-[rgba(0,180,216,0.15)] border border-[rgba(0,180,216,0.4)] text-primary">
            {lang === "pt-BR" ? "NOVO" : "NEW"}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>

        {/* Tags */}
        {tags.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(1, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-2 py-0.5 rounded border text-muted-foreground border-[rgba(100,116,139,0.2)] bg-[rgba(100,116,139,0.05)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(0,180,216,0.06)]">
          <time className="text-xs font-mono text-muted-foreground">{date}</time>

          <div className="flex items-center gap-3">
            {readingTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <Clock className="w-3 h-3" />
                <span>{readingTime}m</span>
              </div>
            )}
            <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200">
              {lang === "pt-BR" ? "Ler" : "Read"}
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
