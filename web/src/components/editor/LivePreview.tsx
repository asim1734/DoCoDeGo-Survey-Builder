import type React from 'react'
import type { Question } from '../../lib/api'
import { QuestionRenderer } from '../QuestionRenderer'

type LivePreviewProps = {
  questions: Question[]
  liveBrandColor: string
  liveLogoUrl: string
  liveTitle: string
  onTitleChange: (title: string) => void
  onTitleBlur: () => void
  previewAnswers: Record<string, string>
  onAnswerChange: (questionId: string, answer: string) => void
}

export function LivePreview({
  questions,
  liveBrandColor,
  liveLogoUrl,
  liveTitle,
  onTitleChange,
  onTitleBlur,
  previewAnswers,
  onAnswerChange,
}: LivePreviewProps) {
  return (
    <div
      className="bg-white rounded-3xl shadow-soft overflow-hidden border border-border/40 transition-all duration-300"
      style={{ '--color-brand': liveBrandColor } as React.CSSProperties}
    >
      <div className="h-32 bg-[var(--color-brand)] relative transition-colors duration-300" />

      <div className="px-8 pb-12 pt-8 relative -mt-16">
        {liveLogoUrl ? (
          <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-soft mb-8 border border-border/50">
            <img src={liveLogoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
        ) : (
          <div className="w-24 h-24 bg-white rounded-2xl p-4 shadow-soft mb-8 border border-border/50 flex items-center justify-center">
            <span className="text-4xl text-text-muted/30 font-bold">Logo</span>
          </div>
        )}

        <input
          type="text"
          value={liveTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onTitleBlur}
          className="w-full text-4xl font-extrabold text-text mb-4 bg-transparent border-0 border-b-2 border-transparent hover:border-border/50 focus:border-[var(--color-brand)] focus:outline-none focus:ring-0 px-0 pb-1 transition-colors"
          placeholder="Survey Title"
        />

        <div className="space-y-6 mt-12">
          {questions.map((question) => (
            <QuestionRenderer
              key={question.id}
              question={question}
              value={previewAnswers[question.id] || ''}
              onChange={(val) => onAnswerChange(question.id, val)}
            />
          ))}
        </div>

        {questions.length > 0 && (
          <div className="mt-10">
            <button
              type="button"
              className="px-8 py-3 bg-[var(--color-brand)] text-white font-bold rounded-xl shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all focus:outline-none"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
