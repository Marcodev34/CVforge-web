"use client"

interface JobDescriptionProps {
  value: string
  onChange: (value: string) => void
}

export function JobDescription({ value, onChange }: JobDescriptionProps) {
  return (
    <div className="flex flex-1 flex-col">
      <label className="mb-2 block text-[11px] font-medium tracking-[0.08em] text-text-secondary uppercase">
        DESCRIÇÃO DA VAGA
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cole a descrição completa da vaga..."
        rows={7}
        className="custom-scroll min-h-[160px] flex-1 resize-none rounded-lg border border-border bg-bg p-4 text-sm text-text-primary placeholder-text-secondary/40 outline-none transition-colors focus:border-accent/60"
      />
    </div>
  )
}
