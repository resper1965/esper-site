import { NextRequest, NextResponse } from "next/server"
import { generateChatCompletion } from "@/lib/cloudflare/ai-gateway"

// Sem `export const runtime = 'edge'`: no Cloudflare Workers a aplicação
// inteira já roda no runtime de edge, e a declaração quebra o bundler do
// OpenNext, que exige funções edge em bundles separados.

// ── Inline rate limiter for edge runtime ──────────────────
const CHAT_WINDOW_MS = 60_000
const CHAT_MAX_REQUESTS = 10
const chatStore = new Map<string, number[]>()

function chatRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  let timestamps = chatStore.get(ip) || []
  timestamps = timestamps.filter((t) => now - t < CHAT_WINDOW_MS)

  if (timestamps.length >= CHAT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((timestamps[0] + CHAT_WINDOW_MS - now) / 1000)
    chatStore.set(ip, timestamps)
    return { allowed: false, retryAfter: Math.max(retryAfter, 1) }
  }

  timestamps.push(now)
  chatStore.set(ip, timestamps)
  return { allowed: true, retryAfter: 0 }
}

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "unknown"
}

const SYSTEM_PROMPT = `Você é um assistente especializado que representa Ricardo Esper, um dos maiores especialistas em cibersegurança do Brasil com mais de 34 anos de experiência.

SOBRE RICARDO ESPER:
- CEO & Founder da NESS (desde 1991)
- CISO & Co-Founder da IONIC Health
- CEO da forense.io, Trustness e Infinity Safe
- Board Member da Bekaa Trusted Advisors
- Certificações: CCISO, CEHv8, GDPR
- Membros de: HackerOne, OWASP, IAPP, ERII, OAB/SP
- Especialidades: Cibersegurança, Forense Digital, Privacidade & Compliance (LGPD, GDPR, HIPAA, SOC 2), CISO Leadership, Contraespionagem (TSCM), Proteção Executiva
- Atuação em 12+ países

INSTRUÇÕES:
- Responda sempre como assistente do Ricardo Esper, falando em terceira pessoa sobre ele quando necessário
- Se a pergunta for sobre serviços, direcione para o LinkedIn: linkedin.com/in/ricardoesper
- Para perguntas técnicas de cibersegurança, forneça respostas de nível executivo/estratégico
- Seja conciso, profissional e autoritativo
- Se não souber algo específico, seja honesto e sugira contato direto
- Responda no idioma da pergunta (português ou inglês)
- Mantenha respostas abaixo de 200 palavras

TÓPICOS QUE VOCÊ DOMINA:
- Cibersegurança e Zero Trust
- Compliance: LGPD, GDPR, HIPAA, SOC 2
- Forense Digital e Resposta a Incidentes
- Contraespionagem Corporativa (TSCM)
- Proteção Executiva
- CISO como Serviço
- Home Automation com Segurança
- Threat Intelligence e OSINT`

type ChatRole = "user" | "assistant";

export async function POST(req: NextRequest) {
  // ── Rate limiting (10 req/min per IP) ──────────────────
  const ip = getIp(req)
  const { allowed, retryAfter } = chatRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    )
  }

  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 })
    }

    const result = await generateChatCompletion({
      model: "@cf/meta/llama-3.1-8b-instruct-fast",
      maxTokens: 400,
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-6).map((m: { role: string; content: string }): { role: ChatRole; content: string } => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content ?? ""),
        })),
      ],
    })

    return NextResponse.json({ message: result.text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
