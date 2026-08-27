"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface CopyButtonProps {
  /** Text placed on the clipboard when the button is pressed. */
  value: string
  label: string
  copiedLabel: string
}

/**
 * Small "copy this text" button for blocks meant to be lifted verbatim —
 * press-kit biographies, quotable facts.
 */
export function CopyButton({ value, label, copiedLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard is unavailable (insecure context, denied permission).
      // The text is selectable on the page, so there is nothing to recover.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono flex-shrink-0
        border border-[rgba(0,180,216,0.3)] text-primary hover:bg-[rgba(0,180,216,0.08)] hover:border-primary
        transition-all duration-200"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? copiedLabel : label}
    </button>
  )
}
