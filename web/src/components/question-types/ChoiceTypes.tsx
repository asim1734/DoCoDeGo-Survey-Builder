import type { Question } from '../../lib/api'

// --- Editors (Builder UI) ---

type ChoiceEditorProps = {
  question: Question
  handleUpdateOption: (index: number, value: string) => void
  handleRemoveOption: (index: number) => void
  handleAddOption: () => void
}

export function ChoiceEditor({
  question,
  handleUpdateOption,
  handleRemoveOption,
  handleAddOption,
}: ChoiceEditorProps) {
  return (
    <div className="space-y-3">
      {question.type === 'dropdown' && (
        <div className="mb-4 p-3 bg-surface-dim border border-border/50 rounded-xl flex items-center justify-between text-text-muted text-sm">
          <span>Respondent will see a dropdown menu</span>
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
      {question.options.map((opt, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: options are simple strings
        <div key={idx} className="flex items-center gap-3">
          <input
            type={question.type === 'checkboxes' ? 'checkbox' : 'radio'}
            disabled
            className={`w-5 h-5 text-brand border-2 border-border/80 ${question.type === 'checkboxes' ? 'rounded' : ''}`}
          />
          <input
            type="text"
            defaultValue={opt}
            onBlur={(e) => handleUpdateOption(idx, e.target.value)}
            className="flex-1 bg-transparent border-0 border-b border-transparent hover:border-border/50 focus:border-brand focus:outline-none focus:ring-0 px-0 py-1"
            placeholder={`Option ${idx + 1}`}
          />
          {question.options.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveOption(idx)}
              className="text-text-muted hover:text-danger p-1"
              title="Remove Option"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddOption}
        className="text-sm font-semibold text-brand hover:text-brand-dark flex items-center gap-1 mt-2"
      >
        <svg
          aria-hidden="true"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Option
      </button>
    </div>
  )
}

// --- Renderers (Public UI) ---

type RendererProps = {
  question: Question
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export function MultipleChoiceRenderer({ question, value, onChange }: RendererProps) {
  return (
    <div className="space-y-3">
      {question.options.map((opt, idx) => (
        <label
          // biome-ignore lint/suspicious/noArrayIndexKey: options are simple strings
          key={idx}
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            value === opt ? 'border-brand bg-brand/5' : 'border-transparent hover:bg-surface-dim'
          }`}
        >
          <input
            type="radio"
            name={`q-${question.id}`}
            value={opt}
            checked={value === opt}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 text-brand border-2 border-border/80 focus:ring-brand cursor-pointer"
          />
          <span className="text-text">{opt}</span>
        </label>
      ))}
    </div>
  )
}

export function CheckboxesRenderer({ question, value, onChange }: RendererProps) {
  return (
    <div className="space-y-3">
      {question.options.map((opt, idx) => {
        let currentValues: string[] = []
        try {
          if (value) currentValues = JSON.parse(value)
        } catch (_e) {}
        const isChecked = currentValues.includes(opt)

        return (
          <label
            // biome-ignore lint/suspicious/noArrayIndexKey: options are simple strings
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              isChecked ? 'border-brand bg-brand/5' : 'border-transparent hover:bg-surface-dim'
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                let newVals = [...currentValues]
                if (e.target.checked) newVals.push(opt)
                else newVals = newVals.filter((v) => v !== opt)
                onChange(JSON.stringify(newVals))
              }}
              className="w-5 h-5 rounded text-brand border-2 border-border/80 focus:ring-brand cursor-pointer"
            />
            <span className="text-text">{opt}</span>
          </label>
        )
      })}
    </div>
  )
}

export function DropdownRenderer({ question, value, onChange, error }: RendererProps) {
  return (
    <div className="relative max-w-md">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none px-4 py-3 bg-surface-dim border rounded-xl text-text text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer ${
          error
            ? 'border-danger/50 focus:ring-danger/50'
            : 'border-border/50 focus:border-brand focus:ring-brand/20'
        }`}
      >
        <option value="" disabled>
          Select an option...
        </option>
        {question.options.map((opt, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: options are simple strings
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
        <svg
          aria-hidden="true"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
