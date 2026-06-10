import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { SurveyCard } from '../components/SurveyCard'
import { createSurvey, deleteSurvey, getSurveys, type Survey } from '../lib/api'
import { useAuth } from './__root'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loadingSurveys, setLoadingSurveys] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/login' })
    }
  }, [loading, user, navigate])

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoadingSurveys(true)
      const data = await getSurveys()
      setSurveys(data)
      setLoadingSurveys(false)
    }

    if (user) {
      fetchSurveys()
    }
  }, [user])

  const handleCreateSurvey = async () => {
    setIsCreating(true)
    const newSurvey = await createSurvey()
    if (newSurvey) {
      navigate({
        to: '/surveys/$surveyId/edit',
        params: { surveyId: newSurvey.id },
      })
    }
    setIsCreating(false)
  }

  const handleDeleteSurvey = async (id: string) => {
    const success = await deleteSurvey(id)
    if (success) {
      setSurveys((prev) => prev.filter((s) => s.id !== id))
    }
  }

  if (loading || (user && loadingSurveys)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <p className="text-text-muted">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text">My Surveys</h1>
          <p className="text-text-muted mt-2">Manage and view your active survey campaigns.</p>
        </div>

        {surveys.length > 0 && (
          <button
            type="button"
            onClick={handleCreateSurvey}
            disabled={isCreating}
            className="group inline-flex items-center gap-2 px-5 py-2.5 font-bold text-white bg-brand rounded-xl hover:bg-brand-dark transition-all duration-200 shadow-soft hover:shadow-glow hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200"
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
            Create Survey
          </button>
        )}
      </div>

      {surveys.length === 0 ? (
        <button
          type="button"
          onClick={handleCreateSurvey}
          className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-border/80 p-16 text-center hover:bg-white/80 hover:border-brand/30 hover:shadow-glow transition-all duration-300 group cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-brand"
        >
          <div className="w-16 h-16 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 shadow-sm">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-brand"
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
          </div>
          <h3 className="text-lg font-bold text-text mb-2">Create your first survey</h3>
          <p className="text-text-muted max-w-sm mx-auto mb-6">
            Get started by creating a beautifully branded survey in seconds.
          </p>
          <span className="inline-flex items-center gap-2 text-brand font-semibold group-hover:text-brand-dark transition-colors">
            Get started
            <svg
              aria-hidden="true"
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} onDelete={handleDeleteSurvey} />
          ))}
        </div>
      )}
    </div>
  )
}
