import type { Question } from '../../lib/api'

// --- Editors (Builder UI) ---

export function ShortTextEditor() {
  return (
    <input
      type="text"
      className="w-full px-4 py-3 bg-surface-dim border border-border/50 rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
      placeholder="Short answer text"
      disabled
    />
  )
}

export function LongTextEditor() {
  return (
    <textarea
      className="w-full px-4 py-3 bg-surface-dim border border-border/50 rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 min-h-[100px] resize-none"
      placeholder="Long answer text"
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

export function ShortTextRenderer({ value, onChange, error }: RendererProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 bg-surface-dim border rounded-xl text-text text-sm focus:outline-none focus:ring-2 transition-all ${
        error
          ? 'border-danger/50 focus:ring-danger/50'
          : 'border-border/50 focus:border-brand focus:ring-brand/20'
      }`}
      placeholder="Your answer"
    />
  )
}

export function LongTextRenderer({ value, onChange, error }: RendererProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 bg-surface-dim border rounded-xl text-text text-sm focus:outline-none focus:ring-2 transition-all min-h-[120px] resize-y ${
        error
          ? 'border-danger/50 focus:ring-danger/50'
          : 'border-border/50 focus:border-brand focus:ring-brand/20'
      }`}
      placeholder="Your detailed answer"
    />
  )
}
