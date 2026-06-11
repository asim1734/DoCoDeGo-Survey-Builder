import type { Question } from '../../lib/api'

// --- Editors (Builder UI) ---

export function DateEditor() {
  return (
    <input
      type="date"
      className="w-full px-4 py-3 bg-surface-dim border border-border/50 rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
      disabled
    />
  )
}

// --- Renderers (Public UI) ---

type RendererProps = {
  question: Question
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export function DateRenderer({ value, onChange, error }: RendererProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full max-w-sm px-4 py-3 bg-surface-dim border rounded-xl text-text text-sm focus:outline-none focus:ring-2 transition-all ${
        error
          ? 'border-danger/50 focus:ring-danger/50'
          : 'border-border/50 focus:border-brand focus:ring-brand/20'
      }`}
    />
  )
}
