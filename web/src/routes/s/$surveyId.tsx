import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { QuestionRenderer } from '../../components/QuestionRenderer'
import { Spinner } from '../../components/Spinner'
import { getPublicSurvey, type SurveyWithQuestions, submitSurveyResponse } from '../../lib/api'

export const Route = createFileRoute('/s/$surveyId')({
  component: PublicSurveyPage,
})

function PublicSurveyPage() {
  const { surveyId } = Route.useParams()

  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchIt = async () => {
      const data = await getPublicSurvey(surveyId)
      if (data) {
        setSurvey(data)
      }
      setLoading(false)
    }
    fetchIt()
  }, [surveyId])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    // Clear error for this question if it was set
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrs = { ...prev }
        delete newErrs[questionId]
        return newErrs
      })
    }
  }

  const handleSubmit = async () => {
    if (!survey) return

    // Validate
    const newErrors: Record<string, boolean> = {}
    let hasErrors = false

    for (const q of survey.questions) {
      if (q.is_required === 1) {
        const val = answers[q.id]
        if (!val || val.trim() === '') {
          newErrors[q.id] = true
          hasErrors = true
        }
      }
    }

    if (hasErrors) {
      setErrors(newErrors)
      // Scroll to top to show errors (optional, simple UX improvement)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    // Format payload
    const payload = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }))

    const success = await submitSurveyResponse(survey.id, payload)

    setIsSubmitting(false)
    if (success) {
      setIsSuccess(true)
    } else {
      alert('Failed to submit survey. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <Spinner />
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-text">Survey not found</h1>
          <p className="text-text-muted mt-2">
            This survey does not exist or is not published yet.
          </p>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div
        className="flex items-center justify-center min-h-screen transition-colors duration-500"
        style={{ backgroundColor: survey.brand_color }}
      >
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full text-center mx-4">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              aria-hidden="true"
              className="w-10 h-10 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-text mb-2">Thank you!</h1>
          <p className="text-text-muted">Your response has been recorded.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pb-24 transition-colors duration-500"
      style={
        {
          '--color-brand': survey.brand_color,
          backgroundColor: 'var(--color-brand)',
        } as React.CSSProperties
      }
    >
      <div className="max-w-2xl mx-auto pt-12 lg:pt-24 px-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pb-12 pt-12 relative border-b border-border/40">
            {survey.logo_url && (
              <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-soft mb-8 border border-border/50">
                <img
                  src={survey.logo_url}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            )}
            <h1 className="text-4xl font-extrabold text-text">{survey.title}</h1>
          </div>

          {/* Form Content */}
          <div className="px-8 py-10 bg-surface/30">
            <div className="space-y-8">
              {survey.questions.map((question) => (
                <QuestionRenderer
                  key={question.id}
                  question={question}
                  value={answers[question.id] || ''}
                  onChange={(val) => handleAnswerChange(question.id, val)}
                  error={errors[question.id]}
                />
              ))}
            </div>

            <div className="mt-12">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || survey.questions.length === 0}
                className="px-8 py-4 w-full md:w-auto bg-[var(--color-brand)] text-white text-lg font-bold rounded-xl shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
