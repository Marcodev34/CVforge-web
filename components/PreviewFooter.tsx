"use client"

import { motion } from "framer-motion"

interface PreviewFooterProps {
  showResult: boolean
  onOpen: () => void
  onDownload: () => void
}

export function PreviewFooter({ showResult, onOpen, onDownload }: PreviewFooterProps) {
  return (
    <div className="flex gap-2 border-t border-border p-4">
      <motion.button
        onClick={onOpen}
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
        onClick={onDownload}
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
  )
}
