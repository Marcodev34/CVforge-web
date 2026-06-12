import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs"

export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  const doc = await pdfjs.getDocument({ data: buffer }).promise
  const pages: string[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ")
    pages.push(text)
  }

  return pages.join("\n\n")
}
