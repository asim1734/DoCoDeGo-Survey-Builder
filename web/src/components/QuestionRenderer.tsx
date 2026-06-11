import type { Question } from '../lib/api'

type QuestionRendererProps = {
  question: Question
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export function QuestionRenderer({ question, value, onChange, error }: QuestionRendererProps) {
  return (
    <div
      className={`bg-white border rounded-2xl p-6 shadow-sm transition-all ${
        error ? 'border-danger/50 shadow-danger/10' : 'border-border/40 hover:shadow-md'
      }`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-text flex items-start gap-2">
          {question.title}
          {question.is_required === 1 && <span className="text-danger mt-0.5">*</span>}
        </h3>
        {error && <p className="text-sm text-danger mt-1">This question requires an answer.</p>}
      </div>

      {question.type === 'short_text' && (
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
      )}

      {question.type === 'multiple_choice' && (
        <div className="space-y-3">
          {question.options.map((opt, idx) => (
            <label
              // biome-ignore lint/suspicious/noArrayIndexKey: options are just strings
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                value === opt
                  ? 'border-brand bg-brand/5'
                  : 'border-transparent hover:bg-surface-dim'
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
      )}

      {question.type === 'rating' && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => onChange(star.toString())}
              className={`w-12 h-12 flex items-center justify-center transition-colors focus:outline-none ${
                Number.parseInt(value || '0', 10) >= star
                  ? 'text-yellow-400'
                  : 'text-border/80 hover:text-yellow-400/50'
              }`}
            >
              <svg aria-hidden="true" className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {question.type === 'long_text' && (
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
      )}

      {question.type === 'date' && (
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
      )}

      {question.type === 'dropdown' && (
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      )}

      {question.type === 'checkboxes' && (
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            let currentValues: string[] = []
            try {
              if (value) currentValues = JSON.parse(value)
            } catch (_e) {}
            const isChecked = currentValues.includes(opt)

            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: options are simple strings
              <label
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
      )}

      {question.type === 'linear_scale' && (
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
              <span className="text-xs font-semibold mb-1 uppercase tracking-wider text-text-muted/60">Selected</span>
              <span className="text-brand text-lg bg-brand/10 px-4 py-1 rounded-full">{value || question.options[0] || '1'}</span>
            </div>
            <span>{question.options[1] || '5'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
