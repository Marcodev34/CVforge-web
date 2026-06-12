export function formatResumeHTML(markdown: string): string {
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
