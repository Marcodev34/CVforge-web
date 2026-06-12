"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import jsPDF from "jspdf"
import html2canvas from "html2canvas-pro"

const PROGRESS_STEPS = [
  "Analisando currículo...",
  "Extraindo competências...",
  "Otimizando para ATS...",
  "Gerando nova versão...",
]

const PROVIDERS = [
  { value: "openai", label: "OpenAI", placeholder: "sk-..." },
  { value: "anthropic", label: "Anthropic Claude", placeholder: "sk-ant-..." },
  { value: "deepseek", label: "DeepSeek", placeholder: "sk-..." },
  { value: "ollama", label: "Ollama (Local)", placeholder: "Opcional" },
] as const

interface Settings {
  provider: string
  apiKey: string
  baseUrl: string
}

function formatResumeHTML(markdown: string): string {
  let html = ""
  const lines = markdown.split("\n")

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      html += "<br />"
      continue
    }

    if (trimmed.startsWith("# ")) {
      html += `<h1>${trimmed.slice(2)}</h1>`
    } else if (trimmed.startsWith("## ")) {
      html += `<h2>${trimmed.slice(3)}</h2>`
    } else if (trimmed.startsWith("### ")) {
      html += `<h3>${trimmed.slice(4)}</h3>`
    } else if (trimmed.startsWith("- **") && trimmed.includes("**")) {
      html += `<li><strong>${trimmed.slice(4).replace(/\*\*/g, "")}</strong></li>`
    } else if (trimmed.startsWith("- ")) {
      html += `<li>${trimmed.slice(2)}</li>`
    } else if (/^\d+\.\s/.test(trimmed)) {
      html += `<li>${trimmed.replace(/^\d+\.\s/, "")}</li>`
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      html += `<p><strong>${trimmed.slice(2, -2)}</strong></p>`
    } else if (trimmed.includes("|")) {
      html += `<div class="contact-line">${trimmed.replace(/\|/g, " | ")}</div>`
    } else {
      const processed = trimmed
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
      html += `<p>${processed}</p>`
    }
  }

  return html
}

function SkeletonPreview() {
  const skeletonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!skeletonRef.current) return
    const lines = skeletonRef.current.querySelectorAll(".skeleton-line")
    gsap.to(lines, {
      backgroundPosition: "400px 0",
      duration: 1.8,
      repeat: -1,
      ease: "none",
    })
  }, [])

  return (
    <div ref={skeletonRef} className="flex flex-col gap-3 p-5">
      <div className="skeleton-line skeleton-line-xl mb-2" />
      <div className="skeleton-line skeleton-line-sm mb-4" style={{ width: "65%" }} />
      <div className="skeleton-line skeleton-line-lg mb-1" style={{ width: "35%" }} />
      <div className="skeleton-line skeleton-line-sm mb-3" style={{ width: "90%" }} />
      {[75, 55, 50, 85, 60, 45, 70, 80, 55, 65].map((w, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem("cvforge-settings")
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          provider: parsed.provider || "openai",
          apiKey: parsed.apiKey || "",
          baseUrl: parsed.baseUrl || "",
        }
      }
    } catch {}
    return { provider: "openai", apiKey: "", baseUrl: "" }
  })
  const [showKey, setShowKey] = useState(false)

  const saveSettings = useCallback(() => {
    localStorage.setItem("cvforge-settings", JSON.stringify(settings))
    setShowSettings(false)
  }, [settings])

  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setPdfName(file.name)
      setError(null)
    } else if (file) {
      setError("Apenas arquivos PDF são aceitos.")
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileChange(e.dataTransfer.files[0])
  }, [handleFileChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const removeFile = useCallback(() => {
    setPdfFile(null)
    setPdfName(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!pdfFile || !jobDescription.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setProgressStep(0)

    const progressInterval = setInterval(() => {
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
      clearInterval(progressInterval)
      setLoading(false)
    }
  }, [pdfFile, jobDescription, settings])

  useEffect(() => {
    if (!loading) {
      return
    }
  }, [loading])

  const downloadPDF = useCallback(async () => {
    if (!previewRef.current) return

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      backgroundColor: "#1c1c1a",
      logging: false,
      useCORS: true,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    let heightLeft = pdfHeight
    let position = 0
    const pageHeight = pdf.internal.pageSize.getHeight()

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
    }

    pdf.save("curriculo-otimizado.pdf")
  }, [])

  const openInNewTab = useCallback(() => {
    if (!result) return
    const html = formatResumeHTML(result)
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Currículo Otimizado</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 780px;
            margin: 40px auto;
            padding: 24px;
            line-height: 1.7;
            color: #a0a09a;
            background: #1c1c1a;
            font-size: 14px;
          }
          h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.125rem; color: #f5f5f0; letter-spacing: -0.02em; }
          h2 { font-size: 0.9375rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; padding-bottom: 0.375rem; border-bottom: 1px solid #3a3a36; color: #f5f5f0; text-transform: uppercase; letter-spacing: 0.04em; }
          h3 { font-size: 0.875rem; font-weight: 600; margin-top: 0.875rem; margin-bottom: 0.25rem; color: #e8e8e3; }
          p { margin-bottom: 0.375rem; color: #a0a09a; }
          ul { padding-left: 1.25rem; margin-bottom: 0.375rem; }
          li { margin-bottom: 0.25rem; color: #a0a09a; }
          strong { color: #e8e8e3; font-weight: 600; }
          .contact-line { color: #a0a09a; font-size: 13px; margin-bottom: 0.75rem; }
          @media print {
            body { background: white; color: #333; padding: 0; margin: 20px auto; }
            h1, h2, h3, strong { color: #000; }
            p, li, .contact-line { color: #444; }
            h2 { border-bottom-color: #ccc; }
          }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `)
    win.document.close()
  }, [result])

  const isSubmitDisabled = !pdfFile || !jobDescription.trim() || loading
  const showResult = result && !loading
  const showProcessing = loading
  const showInitial = !showResult && !showProcessing

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-5">
      {/* Title Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-5 flex items-center rounded-t-xl border border-border bg-surface px-4 py-3"
      >
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-2">
          <span className="text-accent">⚡</span>
          <span className="text-sm font-medium text-text-primary">CVForge</span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-border hover:text-text-primary"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col rounded-b-xl border border-t-0 border-border bg-surface lg:grid lg:grid-cols-[35%_65%]">
        {/* Left column — Inputs */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="flex flex-col gap-5 border-r border-border p-5"
        >
          {/* Upload */}
          <div>
            <label className="mb-2 block text-[11px] font-medium tracking-[0.08em] text-text-secondary uppercase">
              SEU CURRÍCULO
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !pdfFile && fileInputRef.current?.click()}
              className={`cursor-pointer rounded-lg border transition-all ${
                isDragOver
                  ? "border-accent bg-accent/10"
                  : pdfFile
                    ? "border-transparent bg-accent/20"
                    : "border-border bg-bg hover:border-text-secondary/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />

              {pdfFile ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent flex-shrink-0">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex flex-1 items-center gap-2 overflow-hidden">
                    <span className="truncate text-sm font-medium text-text-primary">{pdfName}</span>
                    <span className="flex-shrink-0 text-xs text-text-secondary">
                      {(pdfFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile() }}
                    className="flex-shrink-0 rounded p-1 text-text-secondary transition-colors hover:bg-border hover:text-text-primary"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 p-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-text-secondary">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm text-text-secondary">
                    Arraste o PDF ou clique para upload
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="flex flex-1 flex-col">
            <label className="mb-2 block text-[11px] font-medium tracking-[0.08em] text-text-secondary uppercase">
              DESCRIÇÃO DA VAGA
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Cole a descrição completa da vaga..."
              rows={7}
              className="custom-scroll min-h-[160px] flex-1 resize-none rounded-lg border border-border bg-bg p-4 text-sm text-text-primary placeholder-text-secondary/40 outline-none transition-colors focus:border-accent/60"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            whileHover={!isSubmitDisabled ? { scale: 1.01 } : undefined}
            whileTap={!isSubmitDisabled ? { scale: 0.99 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-medium text-white transition-opacity hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{PROGRESS_STEPS[progressStep]}</span>
              </>
            ) : (
              <>
                <span>⚒️</span>
                Forjar Currículo
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right column — Preview */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          className="flex flex-col"
        >
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scroll">
              <AnimatePresence mode="wait">
                {showInitial && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center justify-center p-5"
                  >
                    <p className="text-sm text-text-secondary/60">
                      Faça upload do seu currículo e cole a descrição da vaga para começar
                    </p>
                  </motion.div>
                )}

                {showProcessing && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SkeletonPreview />
                  </motion.div>
                )}

                {showResult && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    ref={previewRef}
                    className="resume-preview p-5 sm:p-7"
                    dangerouslySetInnerHTML={{ __html: formatResumeHTML(result) }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Preview Footer */}
            <div className="flex gap-2 border-t border-border p-4">
              <motion.button
                onClick={openInNewTab}
                disabled={!showResult}
                whileHover={showResult ? { backgroundColor: "#3a3a36" } : undefined}
                whileTap={showResult ? { scale: 0.97 } : undefined}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-transparent text-sm font-medium text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Abrir
              </motion.button>
              <motion.button
                onClick={downloadPDF}
                disabled={!showResult}
                whileHover={showResult ? { backgroundColor: "#3a3a36" } : undefined}
                whileTap={showResult ? { scale: 0.97 } : undefined}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-transparent text-sm font-medium text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
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
                  onClick={() => setShowSettings(false)}
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
                    value={settings.provider}
                    onChange={(e) => setSettings((s) => ({ ...s, provider: e.target.value, baseUrl: "" }))}
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
                      value={settings.apiKey}
                      onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
                      placeholder={PROVIDERS.find((p) => p.value === settings.provider)?.placeholder}
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

                {(settings.provider === "deepseek" || settings.provider === "ollama") && (
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium tracking-[0.08em] text-text-secondary uppercase">
                      Base URL
                    </label>
                    <input
                      type="text"
                      value={settings.baseUrl}
                      onChange={(e) => setSettings((s) => ({ ...s, baseUrl: e.target.value }))}
                      placeholder={settings.provider === "deepseek" ? "https://api.deepseek.com/v1" : "http://localhost:11434/v1"}
                      className="h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text-primary placeholder-text-secondary/40 outline-none transition-colors focus:border-accent/60"
                    />
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-transparent text-sm font-medium text-text-secondary transition-colors hover:bg-border hover:text-text-primary"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveSettings}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg bg-accent text-sm font-medium text-white transition-opacity hover:brightness-110"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
