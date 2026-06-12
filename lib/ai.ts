import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"

export interface AIProvider {
  generate(messages: { role: "system" | "user"; content: string }[]): Promise<string>
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    })
  }

  async generate(messages: { role: "system" | "user"; content: string }[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.3,
    })
    return response.choices[0]?.message?.content || ""
  }
}

class DeepSeekProvider implements AIProvider {
  private client: OpenAI

  constructor(apiKey?: string, baseURL?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.DEEPSEEK_API_KEY,
      baseURL: baseURL || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    })
  }

  async generate(messages: { role: "system" | "user"; content: string }[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages,
      temperature: 0.3,
    })
    return response.choices[0]?.message?.content || ""
  }
}

class OllamaProvider implements AIProvider {
  private client: OpenAI

  constructor(baseURL?: string) {
    this.client = new OpenAI({
      apiKey: process.env.OLLAMA_API_KEY || "ollama",
      baseURL: baseURL || process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
    })
  }

  async generate(messages: { role: "system" | "user"; content: string }[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: process.env.OLLAMA_MODEL || "llama3",
      messages,
      temperature: 0.3,
    })
    return response.choices[0]?.message?.content || ""
  }
}

class AnthropicProvider implements AIProvider {
  private client: Anthropic

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    })
  }

  async generate(messages: { role: "system" | "user"; content: string }[]): Promise<string> {
    const systemMsg = messages.find((m) => m.role === "system")?.content || ""
    const userMsg = messages.find((m) => m.role === "user")?.content || ""

    const response = await this.client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemMsg,
      messages: [{ role: "user", content: userMsg }],
      temperature: 0.3,
    })

    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
  }
}

export type ProviderType = "openai" | "anthropic" | "deepseek" | "ollama"

interface ProviderConfig {
  provider?: ProviderType
  apiKey?: string
  baseUrl?: string
}

export function createProvider(config?: ProviderConfig): AIProvider {
  const provider = config?.provider
  const apiKey = config?.apiKey
  const baseUrl = config?.baseUrl

  if (provider === "openai" || (!provider && (apiKey || process.env.OPENAI_API_KEY))) {
    return new OpenAIProvider(apiKey)
  }
  if (provider === "anthropic" || (!provider && process.env.ANTHROPIC_API_KEY)) {
    return new AnthropicProvider(apiKey)
  }
  if (provider === "deepseek" || (!provider && (apiKey || process.env.DEEPSEEK_API_KEY))) {
    return new DeepSeekProvider(apiKey, baseUrl)
  }
  if (provider === "ollama" || process.env.OLLAMA_BASE_URL) {
    return new OllamaProvider(baseUrl)
  }

  throw new Error(
    "Nenhum provedor de IA configurado. Configure via modal de settings ou defina variáveis de ambiente no .env.local"
  )
}
