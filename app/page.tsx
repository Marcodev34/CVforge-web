"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TitleBar } from "@/components/TitleBar"
import { FileUpload } from "@/components/FileUpload"
import { JobDescription } from "@/components/JobDescription"
import { ForgeButton } from "@/components/ForgeButton"
import { PreviewPanel } from "@/components/PreviewPanel"
import { SettingsModal } from "@/components/SettingsModal"
import { useSettings } from "@/hooks/useSettings"
import { useForge } from "@/hooks/useForge"

export default function Home() {
  const { settings, setSettings, saveSettings } = useSettings()
  const { loading, progressStep, result, error, handleSubmit } = useForge(settings)

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [showSettings, setShowSettings] = useState(false)

  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setPdfName(file.name)
    } else if (file) {
      setPdfFile(null)
      setPdfName(null)
    }
  }, [])

  const isSubmitDisabled = !pdfFile || !jobDescription.trim() || loading

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-5">
      <TitleBar onOpenSettings={() => setShowSettings(true)} />

      <div className="flex flex-1 flex-col rounded-b-xl border border-t-0 border-border bg-surface lg:grid lg:grid-cols-[35%_65%]">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="flex flex-col gap-5 border-r border-border p-5"
        >
          <FileUpload
            pdfFile={pdfFile}
            pdfName={pdfName}
            onFileChange={handleFileChange}
          />

          <JobDescription
            value={jobDescription}
            onChange={setJobDescription}
          />

          <ForgeButton
            loading={loading}
            progressStep={progressStep}
            disabled={isSubmitDisabled}
            onClick={() => pdfFile && handleSubmit(pdfFile, jobDescription)}
          />

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

        <PreviewPanel loading={loading} result={result} />
      </div>

      <SettingsModal
        open={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onSave={saveSettings}
      />
    </div>
  )
}
