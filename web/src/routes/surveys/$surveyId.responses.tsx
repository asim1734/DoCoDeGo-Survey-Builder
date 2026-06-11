import { createFileRoute, Link } from '@tanstack/react-router'
import { ResponsesTable } from '../../components/editor/ResponsesTable'
import { Spinner } from '../../components/Spinner'
import { useSurveyResponses } from '../../hooks/useSurveyResponses'
import { useAuth } from '../__root'

export const Route = createFileRoute('/surveys/$surveyId/responses')({
  component: ResponsesPage,
})

function ResponsesPage() {
  const { surveyId } = Route.useParams()
  const { user } = useAuth()

  const { responsesData: data, loadingResponses: loading } = useSurveyResponses(surveyId, user)

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
      <div className="bg-white/80 backdrop-blur-xl border-b border-border/50 px-6 py-2 flex items-center justify-start gap-2 z-40 sticky top-[80px] shadow-sm">
        <div className="flex bg-surface-dim p-1 rounded-xl border border-border/60 shadow-inner">
          <Link
            to="/surveys/$surveyId/edit"
            params={{ surveyId }}
            className="px-4 py-1 rounded-lg font-bold text-base text-text-muted hover:bg-white/50 hover:text-text transition-all"
          >
            Editor
          </Link>
          <Link
            to="/surveys/$surveyId/responses"
            params={{ surveyId }}
            className="px-4 py-1 rounded-lg font-extrabold text-base bg-brand text-white shadow-md hover:shadow-glow hover:-translate-y-0.5 transition-all"
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

        <ResponsesTable data={data} />
      </div>
    </div>
  )
}
