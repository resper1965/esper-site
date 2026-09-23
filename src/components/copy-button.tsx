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
      className="btn btn-primary flex-shrink-0"
      style={{ fontSize: 12, padding: "5px 10px" }}
    >
      {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
      {copied ? copiedLabel : label}
    </button>
  )
}
