import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/surveys/$surveyId/edit')({
  component: EditSurveyPage,
})

function EditSurveyPage() {
  const { surveyId } = Route.useParams()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Survey Builder (Phase 3)</h1>
      <p>Editing survey: {surveyId}</p>
    </div>
  )
}
