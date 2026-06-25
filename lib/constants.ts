export const PROGRESS_STEPS = [
  "Analisando currículo...",
  "Extraindo competências...",
  "Otimizando para ATS...",
  "Gerando nova versão...",
] as const

export const PROVIDERS = [
  { value: "openai", label: "OpenAI", placeholder: "sk-..." },
  { value: "anthropic", label: "Anthropic Claude", placeholder: "sk-ant-..." },
  { value: "deepseek", label: "DeepSeek", placeholder: "sk-..." },
  { value: "groq", label: "Groq (Llama/Mixtral)", placeholder: "gsk_..." },
  { value: "ollama", label: "Ollama (Local)", placeholder: "Opcional" },
] as const

export const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-4-20250514",
  deepseek: "deepseek-chat",
  groq: "llama-3.3-70b-versatile",
  ollama: "llama3",
}

export interface Settings {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
}

export const DEFAULT_SETTINGS: Settings = {
  provider: "openai",
  apiKey: "",
  baseUrl: "",
  model: "",
}
