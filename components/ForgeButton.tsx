"use client"

import { motion } from "framer-motion"
import { PROGRESS_STEPS } from "@/lib/constants"

interface ForgeButtonProps {
  loading: boolean
  progressStep: number
  disabled: boolean
  onClick: () => void
}

export function ForgeButton({ loading, progressStep, disabled, onClick }: ForgeButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
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
  )
}
