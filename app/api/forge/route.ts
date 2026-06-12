import { NextRequest } from "next/server"
import { extractTextFromPDF } from "@/lib/pdf"
import { createProvider, type ProviderType } from "@/lib/ai"
import { buildPrompt } from "@/lib/prompt"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const pdfFile = formData.get("pdf") as File | null
    const jobDescription = formData.get("jobDescription") as string | null
    const providerType = formData.get("provider") as ProviderType | null
    const apiKey = formData.get("apiKey") as string | null
    const baseUrl = formData.get("baseUrl") as string | null

    if (!pdfFile) {
      return Response.json({ error: "PDF do currículo é obrigatório" }, { status: 400 })
    }

    if (!jobDescription || jobDescription.trim().length < 10) {
      return Response.json({ error: "Descrição da vaga é obrigatória (mínimo 10 caracteres)" }, { status: 400 })
    }

    const arrayBuffer = await pdfFile.arrayBuffer()
    const resumeText = await extractTextFromPDF(arrayBuffer)

    if (!resumeText.trim()) {
      return Response.json({ error: "Não foi possível extrair texto do PDF. Verifique se o arquivo não está escaneado/imagem." }, { status: 400 })
    }

    const provider = createProvider({
      provider: providerType || undefined,
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
    })
    const prompt = buildPrompt(resumeText, jobDescription)

    const forgedResume = await provider.generate([
      { role: "system", content: "Você é um especialista em currículos ATS. Responda apenas com o currículo otimizado, sem comentários." },
      { role: "user", content: prompt },
    ])

    return Response.json({ resume: forgedResume })
  } catch (error) {
    console.error("Erro ao forjar currículo:", error)
    const message = error instanceof Error ? error.message : "Erro interno do servidor"
    return Response.json({ error: message }, { status: 500 })
  }
}
