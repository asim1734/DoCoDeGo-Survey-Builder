import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import type { Question } from '../lib/api'
import { ChoiceEditor } from './question-types/ChoiceTypes'
import { DateEditor } from './question-types/DateType'
import { LinearScaleEditor } from './question-types/LinearScaleType'
import { RatingEditor } from './question-types/RatingType'
import { LongTextEditor, ShortTextEditor } from './question-types/TextTypes'

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

  const renderEditor = () => {
    switch (question.type) {
      case 'short_text':
        return <ShortTextEditor />
      case 'long_text':
        return <LongTextEditor />
      case 'date':
        return <DateEditor />
      case 'rating':
        return <RatingEditor />
      case 'linear_scale':
        return <LinearScaleEditor question={question} handleUpdateOption={handleUpdateOption} />
      case 'multiple_choice':
      case 'checkboxes':
      case 'dropdown':
        return (
          <ChoiceEditor
            question={question}
            handleUpdateOption={handleUpdateOption}
            handleRemoveOption={handleRemoveOption}
            handleAddOption={handleAddOption}
          />
        )
      default:
        return null
    }
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

        {renderEditor()}
      </div>
    </div>
  )
}
