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
  { value: "ollama", label: "Ollama (Local)", placeholder: "Opcional" },
] as const

export interface Settings {
  provider: string
  apiKey: string
  baseUrl: string
}

export const DEFAULT_SETTINGS: Settings = {
  provider: "openai",
  apiKey: "",
  baseUrl: "",
}
