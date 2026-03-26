import { NextRequest, NextResponse } from "next/server"
import { generateChatCompletion } from "@/lib/cloudflare/ai-gateway"

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

type ChatRole = "user" | "assistant";

export async function POST(req: NextRequest) {
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
