import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import type { Question } from '../lib/api'

type QuestionEditorProps = {
  question: Question
  onChange: (updates: Partial<Question>) => void
  onDelete: () => void
}

export function QuestionEditor({ question, onChange, onDelete }: QuestionEditorProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  const [localTitle, setLocalTitle] = useState(question.title)

  const handleTitleBlur = () => {
    if (localTitle !== question.title) {
      onChange({ title: localTitle })
    }
  }

  const handleAddOption = () => {
    const newOptions = [...question.options, `Option ${question.options.length + 1}`]
    onChange({ options: newOptions })
  }

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...question.options]
    newOptions[index] = value
    onChange({ options: newOptions })
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = question.options.filter((_, i) => i !== index)
    onChange({ options: newOptions })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white border border-border/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1.5 text-text-muted hover:text-text hover:bg-border/30 rounded-lg transition-colors cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9h8M8 15h8" />
          </svg>
        </button>
        <div className="w-px h-5 bg-border/50 mx-1" />
        <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={question.is_required === 1}
            onChange={(e) => onChange({ is_required: e.target.checked ? 1 : 0 })}
            className="w-4 h-4 rounded border-border/80 text-brand focus:ring-brand"
          />
          Required
        </label>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
          title="Delete Question"
        >
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="pr-24">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="w-full text-lg font-bold text-text bg-transparent border-0 border-b-2 border-transparent hover:border-border/50 focus:border-brand focus:outline-none focus:ring-0 px-0 pb-1 mb-4"
          placeholder="Question Title"
        />

        {question.type === 'short_text' && (
          <input
            type="text"
            className="w-full px-4 py-3 bg-surface-dim border border-border/50 rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            placeholder="Short answer text"
          />
        )}

        {question.type === 'rating' && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                aria-hidden="true"
                key={star}
                className="w-10 h-10 text-border/80 hover:text-brand cursor-pointer transition-colors"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}

        {(question.type === 'multiple_choice' ||
          question.type === 'checkboxes' ||
          question.type === 'dropdown') && (
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Option
            </button>
          </div>
        )}

        {question.type === 'long_text' && (
          <textarea
            className="w-full px-4 py-3 bg-surface-dim border border-border/50 rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 min-h-[100px] resize-none"
            placeholder="Long answer text"
            disabled
          />
        )}

        {question.type === 'date' && (
          <input
            type="date"
            className="w-full px-4 py-3 bg-surface-dim border border-border/50 rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            disabled
          />
        )}

        {question.type === 'linear_scale' && (
          <div className="flex items-center gap-4 bg-surface-dim p-4 border border-border/50 rounded-xl">
            <div className="flex-1 flex flex-col gap-2">
              <label htmlFor={`min-${question.id}`} className="text-xs font-semibold text-text-muted">Min Value</label>
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
              <label htmlFor={`max-${question.id}`} className="text-xs font-semibold text-text-muted">Max Value</label>
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
        )}
      </div>
    </div>
  )
}
