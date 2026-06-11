import type { Question } from '../../lib/api'

// --- Editors (Builder UI) ---

type LinearScaleEditorProps = {
  question: Question
  handleUpdateOption: (index: number, value: string) => void
}

export function LinearScaleEditor({ question, handleUpdateOption }: LinearScaleEditorProps) {
  return (
    <div className="flex items-center gap-4 bg-surface-dim p-4 border border-border/50 rounded-xl">
      <div className="flex-1 flex flex-col gap-2">
        <label htmlFor={`min-${question.id}`} className="text-xs font-semibold text-text-muted">
          Min Value
        </label>
        <input
          id={`min-${question.id}`}
          type="text"
          defaultValue={question.options[0] || '1'}
          onBlur={(e) => handleUpdateOption(0, e.target.value)}
          className="w-full bg-white border border-border/50 hover:border-brand focus:border-brand focus:outline-none focus:ring-0 px-3 py-2 rounded-lg text-sm"
          placeholder="e.g. 1"
        />
      </div>
      <div className="flex items-center justify-center pt-6">
        <span className="text-text-muted font-medium">to</span>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <label htmlFor={`max-${question.id}`} className="text-xs font-semibold text-text-muted">
          Max Value
        </label>
        <input
          id={`max-${question.id}`}
          type="text"
          defaultValue={question.options[1] || '5'}
          onBlur={(e) => handleUpdateOption(1, e.target.value)}
          className="w-full bg-white border border-border/50 hover:border-brand focus:border-brand focus:outline-none focus:ring-0 px-3 py-2 rounded-lg text-sm"
          placeholder="e.g. 5"
        />
      </div>
    </div>
  )
}

// --- Renderers (Public UI) ---

type RendererProps = {
  question: Question
  value: string
  onChange: (value: string) => void
}

export function LinearScaleRenderer({ question, value, onChange }: RendererProps) {
  return (
    <div className="flex flex-col gap-6 pt-4 px-2">
      <input
        type="range"
        min={question.options[0] || '1'}
        max={question.options[1] || '5'}
        step="1"
        value={value || question.options[0] || '1'}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2 bg-border/50 rounded-lg appearance-none cursor-pointer accent-brand hover:accent-brand-dark transition-all"
      />
      <div className="flex justify-between items-center text-sm font-bold text-text-muted">
        <span>{question.options[0] || '1'}</span>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold mb-1 uppercase tracking-wider text-text-muted/60">
            Selected
          </span>
          <span className="text-brand text-lg bg-brand/10 px-4 py-1 rounded-full">
            {value || question.options[0] || '1'}
          </span>
        </div>
        <span>{question.options[1] || '5'}</span>
      </div>
    </div>
  )
}
