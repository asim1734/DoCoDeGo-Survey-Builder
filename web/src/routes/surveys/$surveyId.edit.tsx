import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { BrandingPanel } from '../../components/BrandingPanel'
import { QuestionEditor } from '../../components/QuestionEditor'
import {
  createQuestion,
  deleteQuestion,
  getSurvey,
  type Question,
  type SurveyWithQuestions,
  updateQuestion,
  updateSurvey,
} from '../../lib/api'
import { useAuth } from '../__root'

export const Route = createFileRoute('/surveys/$surveyId/edit')({
  component: EditSurveyPage,
})

function EditSurveyPage() {
  const { surveyId } = Route.useParams()
  const { user } = useAuth()

  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [liveBrandColor, setLiveBrandColor] = useState('#3b82f6')
  const [liveLogoUrl, setLiveLogoUrl] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)

  useEffect(() => {
    const fetchIt = async () => {
      const data = await getSurvey(surveyId)
      if (data) {
        setSurvey(data)
        setLiveBrandColor(data.brand_color)
        setLiveLogoUrl(data.logo_url)
      }
      setLoading(false)
    }
    if (user) {
      fetchIt()
    }
  }, [surveyId, user])

  const handleSaveBranding = async (data: { brand_color: string; logo_url: string }) => {
    if (!survey) return
    const success = await updateSurvey(survey.id, data)
    if (success) {
      setSurvey({ ...survey, ...data })
    }
  }

  const handleTogglePublish = async () => {
    if (!survey) return
    setIsPublishing(true)
    const newStatus = survey.is_published === 1 ? 0 : 1
    const success = await updateSurvey(survey.id, { is_published: newStatus === 1 })
    if (success) {
      setSurvey({ ...survey, is_published: newStatus })
    }
    setIsPublishing(false)
  }

  const handleAddQuestion = async (type: string) => {
    if (!survey) return
    setIsAddingQuestion(true)

    let defaultOptions: string[] = []
    if (type === 'multiple_choice') {
      defaultOptions = ['Option 1', 'Option 2']
    }

    const newQ = await createQuestion(survey.id, {
      title: 'New Question',
      type,
      options: defaultOptions,
      is_required: 1,
    })

    if (newQ) {
      setSurvey({
        ...survey,
        questions: [...survey.questions, newQ],
      })
    }
    setIsAddingQuestion(false)
  }

  const handleUpdateQuestion = async (questionId: string, updates: Partial<Question>) => {
    if (!survey) return

    const oldQuestions = [...survey.questions]
    const updatedQuestions = oldQuestions.map((q) =>
      q.id === questionId ? { ...q, ...updates } : q,
    )
    setSurvey({ ...survey, questions: updatedQuestions })

    const success = await updateQuestion(survey.id, questionId, updates)
    if (!success) {
      setSurvey({ ...survey, questions: oldQuestions })
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!survey) return
    if (!confirm('Are you sure you want to delete this question?')) return

    const oldQuestions = [...survey.questions]
    setSurvey({
      ...survey,
      questions: oldQuestions.filter((q) => q.id !== questionId),
    })

    const success = await deleteQuestion(survey.id, questionId)
    if (!success) {
      setSurvey({ ...survey, questions: oldQuestions })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <p className="text-text-muted">Loading survey...</p>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-text">Survey not found</h2>
        <p className="text-text-muted mt-2">It may have been deleted or you don't have access.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-surface-dim">
      {/* Left Panel: Builder Controls */}
      <div className="w-full lg:w-[400px] border-r border-border/80 bg-white/50 backdrop-blur-xl p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-text line-clamp-1" title={survey.title}>
            {survey.title}
          </h1>
        </div>

        <BrandingPanel
          brandColor={survey.brand_color}
          logoUrl={survey.logo_url}
          onColorChange={setLiveBrandColor}
          onLogoChange={setLiveLogoUrl}
          onSave={handleSaveBranding}
        />

        {/* Add Question Controls */}
        <div className="bg-white/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-soft space-y-4">
          <h3 className="text-lg font-bold text-text">Add Question</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isAddingQuestion}
              onClick={() => handleAddQuestion('short_text')}
              className="px-4 py-3 bg-surface-dim hover:bg-border/30 border border-border/50 rounded-xl text-sm font-semibold text-text transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
            >
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-brand"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
              Short Text
            </button>
            <button
              type="button"
              disabled={isAddingQuestion}
              onClick={() => handleAddQuestion('multiple_choice')}
              className="px-4 py-3 bg-surface-dim hover:bg-border/30 border border-border/50 rounded-xl text-sm font-semibold text-text transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
            >
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-brand"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Choices
            </button>
            <button
              type="button"
              disabled={isAddingQuestion}
              onClick={() => handleAddQuestion('rating')}
              className="px-4 py-3 bg-surface-dim hover:bg-border/30 border border-border/50 rounded-xl text-sm font-semibold text-text transition-colors flex flex-col items-center gap-2 disabled:opacity-50 col-span-2"
            >
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-brand"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              Rating
            </button>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-soft mt-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-text">Publishing</h3>
              <p className="text-xs text-text-muted mt-1">
                {survey.is_published ? 'Survey is live.' : 'Survey is hidden.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={isPublishing}
              className={`px-4 py-2 font-bold rounded-lg transition-colors focus:outline-none ${
                survey.is_published
                  ? 'bg-danger/10 text-danger hover:bg-danger/20'
                  : 'bg-success/10 text-success hover:bg-success/20'
              }`}
            >
              {isPublishing ? '...' : survey.is_published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
          {survey.is_published === 1 && (
            <div className="mt-4 p-3 bg-surface-dim rounded-lg flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted truncate mr-2">
                {window.location.origin}/s/{survey.id}
              </span>
              <a
                href={`/s/${survey.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-brand hover:underline whitespace-nowrap"
              >
                Open →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-semibold text-text-muted tracking-wider uppercase">
              Live Preview
            </span>
          </div>

          {/* Survey Render Wrapper */}
          <div
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-border/40 transition-all duration-300"
            style={{ '--color-brand': liveBrandColor } as React.CSSProperties}
          >
            {/* Survey Header (Brand Color & Logo) */}
            <div className="h-32 bg-[var(--color-brand)] relative transition-colors duration-300" />

            <div className="px-8 pb-12 pt-8 relative -mt-16">
              {liveLogoUrl ? (
                <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-soft mb-8 border border-border/50">
                  <img
                    src={liveLogoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-white rounded-2xl p-4 shadow-soft mb-8 border border-border/50 flex items-center justify-center">
                  <span className="text-4xl text-text-muted/30 font-bold">Logo</span>
                </div>
              )}

              <h1 className="text-4xl font-extrabold text-text mb-4">{survey.title}</h1>

              <div className="space-y-6 mt-12">
                {survey.questions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-2xl text-text-muted">
                    No questions yet. Add one from the panel!
                  </div>
                ) : (
                  survey.questions.map((question) => (
                    <QuestionEditor
                      key={question.id}
                      question={question}
                      onChange={(updates) => handleUpdateQuestion(question.id, updates)}
                      onDelete={() => handleDeleteQuestion(question.id)}
                    />
                  ))
                )}
              </div>

              {survey.questions.length > 0 && (
                <div className="mt-10">
                  <button
                    type="button"
                    className="px-8 py-3 bg-[var(--color-brand)] text-white font-bold rounded-xl shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all focus:outline-none"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
