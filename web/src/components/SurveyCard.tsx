import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { Survey } from '../lib/api'

type SurveyCardProps = {
  survey: Survey
  onDelete: (id: string) => void
}

export function SurveyCard({ survey, onDelete }: SurveyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('Are you sure you want to delete this survey? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    await onDelete(survey.id)
    setIsDeleting(false)
  }

  const date = new Date(survey.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link
      to="/surveys/$surveyId/edit"
      params={{ surveyId: survey.id }}
      className="group relative block bg-white/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                survey.is_published ? 'bg-success/10 text-success' : 'bg-brand/10 text-brand'
              }`}
            >
              {survey.is_published ? 'Published' : 'Draft'}
            </span>
            <span className="text-xs text-text-muted">{date}</span>
          </div>
          <h3 className="text-xl font-bold text-text group-hover:text-brand transition-colors line-clamp-1">
            {survey.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-text-muted hover:text-danger p-2 -mr-2 rounded-lg hover:bg-danger/10 transition-colors focus:outline-none"
          title="Delete Survey"
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

      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border/50 text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-50 text-brand">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="font-medium text-text">TBD</span> Responses
        </div>
      </div>
    </Link>
  )
}
