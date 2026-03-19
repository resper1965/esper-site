import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

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

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    // Determine base URL — use Cloudflare AI Gateway if configured
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const gatewayId = process.env.CLOUDFLARE_AI_GATEWAY_ID || "esper-ai-gateway"
    const baseURL = accountId
      ? `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/anthropic`
      : "https://api.anthropic.com"

    const response = await fetch(`${baseURL}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        // Cloudflare AI Gateway caching headers
        ...(accountId && {
          "cf-aig-cache-ttl": "300", // 5 min cache
          "cf-aig-metadata": JSON.stringify({ source: "chat-widget", site: "esper.ws" }),
        }),
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-6).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("Anthropic API error:", err)
      return NextResponse.json({ error: "AI service error" }, { status: 502 })
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>
    }
    const text = data.content?.[0]?.text ?? ""

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
