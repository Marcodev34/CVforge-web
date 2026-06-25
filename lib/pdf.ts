import { PDFParse } from "pdf-parse"

// @ts-expect-error pdfjs-dist does not ship types for the worker entry
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs"

;(globalThis as any).pdfjsWorker = pdfjsWorker

export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  const doc = new PDFParse({ data: new Uint8Array(buffer) })
  const result = await doc.getText()
  await doc.destroy()
  return result.text
}
