"use client"

import { useState, useCallback, useRef } from "react"
import { PROGRESS_STEPS } from "@/lib/constants"
import type { Settings } from "@/lib/constants"

export function useForge(settings: Settings) {
  const [loading, setLoading] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleSubmit = useCallback(
    async (pdfFile: File, jobDescription: string) => {
      if (!pdfFile || !jobDescription.trim()) return

      setLoading(true)
      setError(null)
      setResult(null)
      setProgressStep(0)

      progressRef.current = setInterval(() => {
        setProgressStep((prev) => Math.min(prev + 1, PROGRESS_STEPS.length - 1))
      }, 2000)

      try {
        const formData = new FormData()
        formData.append("pdf", pdfFile)
        formData.append("jobDescription", jobDescription)
        formData.append("provider", settings.provider)
        formData.append("apiKey", settings.apiKey)
        formData.append("baseUrl", settings.baseUrl)

        const res = await fetch("/api/forge", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Erro ao processar currículo")
        }

        setResult(data.resume)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado")
      } finally {
        if (progressRef.current) clearInterval(progressRef.current)
        setLoading(false)
      }
    },
    [settings]
  )

  return {
    loading,
    progressStep,
    result,
    error,
    handleSubmit,
  }
}
