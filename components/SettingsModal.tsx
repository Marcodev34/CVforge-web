"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PROVIDERS, type Settings } from "@/lib/constants"

interface SettingsModalProps {
  open: boolean
  settings: Settings
  onClose: () => void
  onSave: (settings: Settings) => void
}

export function SettingsModal({ open, settings, onClose, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings)
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    onSave(localSettings)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Configurações</h2>
              <button
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded text-text-secondary transition-colors hover:bg-border hover:text-text-primary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium tracking-[0.08em] text-text-secondary uppercase">
                  Provedor
                </label>
                <select
                  value={localSettings.provider}
                  onChange={(e) => setLocalSettings((s) => ({ ...s, provider: e.target.value, baseUrl: "" }))}
                  className="h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent/60"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium tracking-[0.08em] text-text-secondary uppercase">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={localSettings.apiKey}
                    onChange={(e) => setLocalSettings((s) => ({ ...s, apiKey: e.target.value }))}
                    placeholder={PROVIDERS.find((p) => p.value === localSettings.provider)?.placeholder}
                    className="h-10 w-full rounded-lg border border-border bg-bg pr-9 pl-3 text-sm text-text-primary placeholder-text-secondary/40 outline-none transition-colors focus:border-accent/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary/60 hover:text-text-secondary"
                  >
                    {showKey ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {(localSettings.provider === "deepseek" || localSettings.provider === "ollama") && (
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium tracking-[0.08em] text-text-secondary uppercase">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={localSettings.baseUrl}
                    onChange={(e) => setLocalSettings((s) => ({ ...s, baseUrl: e.target.value }))}
                    placeholder={localSettings.provider === "deepseek" ? "https://api.deepseek.com/v1" : "http://localhost:11434/v1"}
                    className="h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text-primary placeholder-text-secondary/40 outline-none transition-colors focus:border-accent/60"
                  />
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={onClose}
                className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-transparent text-sm font-medium text-text-secondary transition-colors hover:bg-border hover:text-text-primary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex h-10 flex-1 items-center justify-center rounded-lg bg-accent text-sm font-medium text-white transition-opacity hover:brightness-110"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
