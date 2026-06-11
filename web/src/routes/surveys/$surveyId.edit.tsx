import { closestCenter, DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BrandingPanel } from '../../components/BrandingPanel'
import { AddQuestionControls } from '../../components/editor/AddQuestionControls'
import { PublishingPanel } from '../../components/editor/PublishingPanel'
import { QuestionEditor } from '../../components/QuestionEditor'
import { Spinner } from '../../components/Spinner'

import { useSurvey } from '../../hooks/useSurvey'
import { useSurveyEditor } from '../../hooks/useSurveyEditor'
import { useSurveyQuestions } from '../../hooks/useSurveyQuestions'

export const Route = createFileRoute('/surveys/$surveyId/edit')({
  component: EditSurveyPage,
})

function EditSurveyPage() {
  const { surveyId } = Route.useParams()

  const { survey, setSurvey, loading } = useSurvey(surveyId)
  const editor = useSurveyEditor(survey, setSurvey)
  const questions = useSurveyQuestions(survey, setSurvey)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <Spinner />
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
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-surface-dim">
      {/* Sub-navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-border/50 px-6 py-2 flex items-center justify-start gap-2 z-40 sticky top-[80px] shadow-sm">
        <div className="flex bg-surface-dim p-1 rounded-xl border border-border/60 shadow-inner">
          <Link
            to="/surveys/$surveyId/edit"
            params={{ surveyId }}
            className="px-4 py-1 rounded-lg font-extrabold text-base bg-brand text-white shadow-md hover:shadow-glow hover:-translate-y-0.5 transition-all"
          >
            Editor
          </Link>
          <Link
            to="/surveys/$surveyId/responses"
            params={{ surveyId }}
            className="px-4 py-1 rounded-lg font-bold text-base text-text-muted hover:bg-white/50 hover:text-text transition-all"
          >
            Responses
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left Panel: Builder Controls */}
        <div className="w-full lg:w-[400px] border-r border-border/80 bg-white/50 backdrop-blur-xl p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-text line-clamp-1" title={editor.liveTitle}>
              {editor.liveTitle}
            </h1>
          </div>

          <BrandingPanel
            brandColor={survey.brand_color}
            logoUrl={survey.logo_url}
            onColorChange={editor.setLiveBrandColor}
            onLogoChange={editor.setLiveLogoUrl}
            onSave={editor.handleSaveBranding}
          />

          <div className="bg-white/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-soft space-y-4">
            <AddQuestionControls
              onAdd={questions.handleAddQuestion}
              disabled={questions.isAddingQuestion}
            />
          </div>

          <PublishingPanel
            isPublished={survey.is_published === 1}
            isPublishing={editor.isPublishing}
            surveyId={survey.id}
            onTogglePublish={editor.handleTogglePublish}
          />
        </div>

        {/* Right Panel: Live Preview/Editor */}
        <div className="flex-1 p-3 lg:p-6 lg:pt-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/* Survey Render Wrapper */}
            <div
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-border/40 transition-all duration-300"
              style={{ '--color-brand': editor.liveBrandColor } as React.CSSProperties}
            >
              {/* Survey Header (Brand Color & Logo) */}
              <div className="h-32 bg-[var(--color-brand)] relative transition-colors duration-300" />

              <div className="px-8 pb-12 pt-8 relative -mt-16">
                {editor.liveLogoUrl ? (
                  <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-soft mb-8 border border-border/50">
                    <img
                      src={editor.liveLogoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-white rounded-2xl p-4 shadow-soft mb-8 border border-border/50 flex items-center justify-center">
                    <span className="text-4xl text-text-muted/30 font-bold">Logo</span>
                  </div>
                )}

                <input
                  type="text"
                  value={editor.liveTitle}
                  onChange={(e) => editor.setLiveTitle(e.target.value)}
                  onBlur={editor.handleTitleBlur}
                  className="w-full text-4xl font-extrabold text-text mb-4 bg-transparent border-0 border-b-2 border-transparent hover:border-border/50 focus:border-brand focus:outline-none focus:ring-0 px-0 pb-1 transition-colors"
                  placeholder="Survey Title"
                />

                <div className="space-y-6 mt-12">
                  {survey.questions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-2xl text-text-muted">
                      No questions yet. Add one from the panel!
                    </div>
                  ) : (
                    <DndContext
                      sensors={questions.sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={questions.handleDragEnd}
                    >
                      <SortableContext
                        items={survey.questions.map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {survey.questions.map((question) => (
                          <QuestionEditor
                            key={question.id}
                            question={question}
                            onChange={(updates) =>
                              questions.handleUpdateQuestion(question.id, updates)
                            }
                            onDelete={() => questions.handleDeleteQuestion(question.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
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
    </div>
  )
}
