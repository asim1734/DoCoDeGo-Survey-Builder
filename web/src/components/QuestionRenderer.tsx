import type { Question } from '../lib/api'
import {
  CheckboxesRenderer,
  DropdownRenderer,
  MultipleChoiceRenderer,
} from './question-types/ChoiceTypes'
import { DateRenderer } from './question-types/DateType'
import { LinearScaleRenderer } from './question-types/LinearScaleType'
import { RatingRenderer } from './question-types/RatingType'
import { LongTextRenderer, ShortTextRenderer } from './question-types/TextTypes'

type QuestionRendererProps = {
  question: Question
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export function QuestionRenderer({ question, value, onChange, error }: QuestionRendererProps) {
  const renderInput = () => {
    switch (question.type) {
      case 'short_text':
        return (
          <ShortTextRenderer question={question} value={value} onChange={onChange} error={error} />
        )
      case 'long_text':
        return (
          <LongTextRenderer question={question} value={value} onChange={onChange} error={error} />
        )
      case 'multiple_choice':
        return (
          <MultipleChoiceRenderer
            question={question}
            value={value}
            onChange={onChange}
            error={error}
          />
        )
      case 'checkboxes':
        return (
          <CheckboxesRenderer question={question} value={value} onChange={onChange} error={error} />
        )
      case 'dropdown':
        return (
          <DropdownRenderer question={question} value={value} onChange={onChange} error={error} />
        )
      case 'rating':
        return <RatingRenderer value={value} onChange={onChange} />
      case 'date':
        return <DateRenderer question={question} value={value} onChange={onChange} error={error} />
      case 'linear_scale':
        return <LinearScaleRenderer question={question} value={value} onChange={onChange} />
      default:
        return null
    }
  }

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

      {renderInput()}
    </div>
  )
}
