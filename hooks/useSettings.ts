"use client"

import { useState, useCallback } from "react"
import { type Settings, DEFAULT_SETTINGS } from "@/lib/constants"

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem("cvforge-settings")
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          provider: parsed.provider || DEFAULT_SETTINGS.provider,
          apiKey: parsed.apiKey || DEFAULT_SETTINGS.apiKey,
          baseUrl: parsed.baseUrl || DEFAULT_SETTINGS.baseUrl,
        }
      }
    } catch {}
    return DEFAULT_SETTINGS
  })

  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings)
    localStorage.setItem("cvforge-settings", JSON.stringify(newSettings))
  }, [])

  return { settings, setSettings, saveSettings }
}
