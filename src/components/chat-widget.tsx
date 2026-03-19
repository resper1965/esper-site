"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Shield, Loader2, ChevronDown } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Olá! Sou o assistente do Ricardo Esper. Posso responder dúvidas sobre cibersegurança, compliance (LGPD/GDPR), forense digital, proteção executiva ou os serviços do Ricardo. Como posso ajudar?",
  },
]

const INITIAL_MESSAGES_EN: Message[] = [
  {
    role: "assistant",
    content:
      "Hi! I'm Ricardo Esper's assistant. I can answer questions about cybersecurity, compliance (LGPD/GDPR), digital forensics, executive protection, or Ricardo's services. How can I help?",
  },
]

const QUICK_PROMPTS_PT = [
  "Quais são os serviços?",
  "LGPD e GDPR — diferenças?",
  "O que é CISO as a Service?",
  "Como contato o Ricardo?",
]

const QUICK_PROMPTS_EN = [
  "What services does he offer?",
  "LGPD vs GDPR differences?",
  "What is CISO as a Service?",
  "How to contact Ricardo?",
]

interface ChatWidgetProps {
  lang?: string
}

export function ChatWidget({ lang = "pt-BR" }: ChatWidgetProps) {
  const isPT = lang === "pt-BR"
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(
    isPT ? INITIAL_MESSAGES : INITIAL_MESSAGES_EN
  )
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, isOpen, isMinimized])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: content.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok) throw new Error("API error")

      const data = await response.json() as { message: string }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isPT
            ? "Desculpe, houve um erro. Por favor, tente novamente ou entre em contato via LinkedIn."
            : "Sorry, there was an error. Please try again or contact via LinkedIn.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const quickPrompts = isPT ? QUICK_PROMPTS_PT : QUICK_PROMPTS_EN

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full
            bg-primary text-[#050a12] font-semibold text-sm
            shadow-[0_0_20px_rgba(0,180,216,0.4),0_4px_20px_rgba(0,0,0,0.5)]
            hover:shadow-[0_0_30px_rgba(0,180,216,0.6),0_4px_24px_rgba(0,0,0,0.6)]
            hover:bg-primary/90 hover:scale-105 transition-all duration-200"
          aria-label={isPT ? "Abrir chat" : "Open chat"}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{isPT ? "Pergunte ao Assistente" : "Ask the Assistant"}</span>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[rgba(0,0,0,0.2)] text-[10px] font-bold">
            AI
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden
            glass-card border border-[rgba(0,180,216,0.2)]
            shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(0,180,216,0.1)]
            transition-all duration-300
            ${isMinimized ? "w-72 h-14" : "w-80 sm:w-96 h-[520px]"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,180,216,0.1)] bg-[rgba(0,180,216,0.04)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/authors/ricardo.png" alt="Ricardo Esper" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Ricardo Esper AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span className="text-[10px] text-[#10b981] font-mono">
                    {isPT ? "Online" : "Online"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? "rotate-180" : ""}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-[#050a12] rounded-tr-sm font-medium"
                          : "bg-[rgba(255,255,255,0.04)] border border-[rgba(0,180,216,0.1)] text-foreground rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-primary" />
                    </div>
                    <div className="px-3 py-2.5 rounded-xl rounded-tl-sm bg-[rgba(255,255,255,0.04)] border border-[rgba(0,180,216,0.1)]">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {quickPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-[rgba(0,180,216,0.2)] text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-[rgba(0,180,216,0.05)] transition-all font-mono"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 pb-3 pt-1 border-t border-[rgba(0,180,216,0.08)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(input)
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(0,180,216,0.12)] focus-within:border-[rgba(0,180,216,0.35)] transition-all"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isPT ? "Faça uma pergunta..." : "Ask a question..."}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <p className="text-[10px] text-muted-foreground text-center mt-1.5 font-mono">
                  Powered by Cloudflare AI Gateway · Claude
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
