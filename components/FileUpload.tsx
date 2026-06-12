"use client"

import { useRef, useCallback, useState } from "react"
import { motion } from "framer-motion"

interface FileUploadProps {
  pdfFile: File | null
  pdfName: string | null
  onFileChange: (file: File | null) => void
}

export function FileUpload({ pdfFile, pdfName, onFileChange }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type === "application/pdf") {
        onFileChange(file)
      } else if (file) {
        onFileChange(null)
      }
    },
    [onFileChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const removeFile = useCallback(() => {
    onFileChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [onFileChange])

  return (
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
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
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
  )
}
