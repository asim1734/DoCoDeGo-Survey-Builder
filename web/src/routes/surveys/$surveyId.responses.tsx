import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Spinner } from '../../components/Spinner'
import { getSurveyResponses, type SurveyResponsesData } from '../../lib/api'
import { useAuth } from '../__root'

export const Route = createFileRoute('/surveys/$surveyId/responses')({
  component: ResponsesPage,
})

function ResponsesPage() {
  const { surveyId } = Route.useParams()
  const { user } = useAuth()
  const [data, setData] = useState<SurveyResponsesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIt = async () => {
      const res = await getSurveyResponses(surveyId)
      if (res) {
        setData(res)
      }
      setLoading(false)
    }
    if (user) {
      fetchIt()
    }
  }, [surveyId, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <Spinner />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-text">Survey not found</h2>
        <p className="text-text-muted mt-2">It may have been deleted or you don't have access.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-surface">
      {/* Sub-navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-center gap-2 z-40 sticky top-[80px] shadow-sm">
        <div className="flex bg-surface-dim p-1.5 rounded-2xl border border-border/60 shadow-inner">
          <Link
            to="/surveys/$surveyId/edit"
            params={{ surveyId }}
            className="px-8 py-2.5 rounded-xl font-bold text-sm text-text-muted hover:bg-white/50 hover:text-text transition-all"
          >
            Editor
          </Link>
          <Link
            to="/surveys/$surveyId/responses"
            params={{ surveyId }}
            className="px-8 py-2.5 rounded-xl font-extrabold text-sm bg-brand text-white shadow-md hover:shadow-glow hover:-translate-y-0.5 transition-all"
          >
            Responses
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full py-12 px-6 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-text flex items-center gap-3">
              {data.survey.title}
              <span className="text-sm font-medium bg-surface-dim text-text-muted px-3 py-1 rounded-full border border-border/50">
                {data.responses.length} responses
              </span>
            </h1>
          </div>
        </div>

        {data.responses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-border/40 shadow-soft">
            <div className="w-20 h-20 bg-surface-dim rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                aria-hidden="true"
                className="w-10 h-10 text-text-muted/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text mb-2">No responses yet</h2>
            <p className="text-text-muted max-w-md mx-auto">
              Share your survey link to start collecting answers. Responses will appear here in
              real-time.
            </p>
            {!data.survey.is_published && (
              <p className="text-danger mt-4 text-sm font-semibold">
                Warning: Your survey is currently unpublished!
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-border/40 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-dim border-b border-border/50">
                    <th className="p-4 text-sm font-semibold text-text-muted whitespace-nowrap border-r border-border/30">
                      Submitted At
                    </th>
                    {data.questions.map((q) => (
                      <th
                        key={q.id}
                        className="p-4 text-sm font-semibold text-text whitespace-nowrap border-r border-border/30 last:border-0"
                      >
                        {q.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.responses.map((res) => (
                    <tr key={res.id} className="hover:bg-surface-dim/50 transition-colors">
                      <td className="p-4 text-sm text-text-muted whitespace-nowrap border-r border-border/30">
                        {new Date(res.submitted_at).toLocaleString()}
                      </td>
                      {data.questions.map((q) => {
                        const answer = res.answers[q.id]
                        let displayValue: React.ReactNode = (
                          <span className="text-border italic">No answer</span>
                        )
                        if (answer) {
                          try {
                            const parsed = JSON.parse(answer)
                            if (Array.isArray(parsed)) {
                              displayValue = parsed.join(', ')
                            } else {
                              displayValue = answer
                            }
                          } catch (_e) {
                            displayValue = answer
                          }
                        }

                        return (
                          <td
                            key={q.id}
                            className="p-4 align-top border-r border-border/30 last:border-0"
                          >
                            <div className="text-sm text-text-muted">{displayValue}</div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
