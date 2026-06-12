"use client"

import { useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import jsPDF from "jspdf"
import html2canvas from "html2canvas-pro"
import { formatResumeHTML } from "@/lib/formatResume"
import { PreviewFooter } from "./PreviewFooter"

interface PreviewPanelProps {
  loading: boolean
  result: string | null
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

export function PreviewPanel({ loading, result }: PreviewPanelProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  const showInitial = !result && !loading
  const showProcessing = loading
  const showResult = result && !loading

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

  return (
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

        <PreviewFooter
          showResult={!!showResult}
          onOpen={openInNewTab}
          onDownload={downloadPDF}
        />
      </div>
    </motion.div>
  )
}
