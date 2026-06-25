import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { DEFAULT_MODELS } from "@/lib/constants"

export interface AIProvider {
  generate(messages: { role: "system" | "user"; content: string }[]): Promise<string>
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI
  private model: string

  constructor(apiKey?: string, model?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    })
    this.model = model || process.env.OPENAI_MODEL || DEFAULT_MODELS.openai
  }

  async generate(messages: { role: "system" | "user"; content: string }[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.3,
    })
    return response.choices[0]?.message?.content || ""
  }
}

class GroqProvider implements AIProvider {
  private client: OpenAI
  private model: string

  constructor(apiKey?: string, model?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.GROQ_API_KEY,
      baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
    })
    this.model = model || process.env.GROQ_MODEL || DEFAULT_MODELS.groq
  }

  async generate(messages: { role: "system" | "user"; content: string }[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.3,
    })
    return response.choices[0]?.message?.content || ""
  }
}

class DeepSeekProvider implements AIProvider {
  private client: OpenAI
  private model: string

  constructor(apiKey?: string, baseURL?: string, model?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.DEEPSEEK_API_KEY,
      baseURL: baseURL || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    })
    this.model = model || process.env.DEEPSEEK_MODEL || DEFAULT_MODELS.deepseek
  }

  async generate(messages: { role: "system" | "user"; content: string }[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.3,
    })
    return response.choices[0]?.message?.content || ""
  }
}

class OllamaProvider implements AIProvider {
  private client: OpenAI
  private model: string

  constructor(baseURL?: string, model?: string) {
    this.client = new OpenAI({
      apiKey: process.env.OLLAMA_API_KEY || "ollama",
      baseURL: baseURL || process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
    })
    this.model = model || process.env.OLLAMA_MODEL || DEFAULT_MODELS.ollama
  }

  async generate(messages: { role: "system" | "user"; content: string }[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.3,
    })
    return response.choices[0]?.message?.content || ""
  }
}

class AnthropicProvider implements AIProvider {
  private client: Anthropic
  private model: string

  constructor(apiKey?: string, model?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    })
    this.model = model || process.env.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic
  }

  async generate(messages: { role: "system" | "user"; content: string }[]): Promise<string> {
    const systemMsg = messages.find((m) => m.role === "system")?.content || ""
    const userMsg = messages.find((m) => m.role === "user")?.content || ""

    const response = await this.client.messages.create({
      model: this.model,
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

export type ProviderType = "openai" | "anthropic" | "deepseek" | "groq" | "ollama"

interface ProviderConfig {
  provider?: ProviderType
  apiKey?: string
  baseUrl?: string
  model?: string
}

export function createProvider(config?: ProviderConfig): AIProvider {
  const provider = config?.provider
  const apiKey = config?.apiKey
  const baseUrl = config?.baseUrl
  const model = config?.model

  if (provider === "openai" || (!provider && (apiKey || process.env.OPENAI_API_KEY))) {
    return new OpenAIProvider(apiKey, model)
  }
  if (provider === "groq" || (!provider && (apiKey || process.env.GROQ_API_KEY))) {
    return new GroqProvider(apiKey, model)
  }
  if (provider === "anthropic" || (!provider && process.env.ANTHROPIC_API_KEY)) {
    return new AnthropicProvider(apiKey, model)
  }
  if (provider === "deepseek" || (!provider && (apiKey || process.env.DEEPSEEK_API_KEY))) {
    return new DeepSeekProvider(apiKey, baseUrl, model)
  }
  if (provider === "ollama" || process.env.OLLAMA_BASE_URL) {
    return new OllamaProvider(baseUrl, model)
  }

  throw new Error(
    "Nenhum provedor de IA configurado. Configure via modal de settings ou defina variáveis de ambiente no .env.local"
  )
}
