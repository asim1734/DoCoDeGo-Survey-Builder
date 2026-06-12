import { closestCenter, DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { BrandingPanel } from '../../components/BrandingPanel'
import { AddQuestionControls } from '../../components/editor/AddQuestionControls'
import { PublishingPanel } from '../../components/editor/PublishingPanel'
import { QuestionEditor } from '../../components/QuestionEditor'
import { Spinner } from '../../components/Spinner'

import { useSurvey } from '../../hooks/useSurvey'
import { useSurveyEditor } from '../../hooks/useSurveyEditor'
import { useSurveyQuestions } from '../../hooks/useSurveyQuestions'
import { getCurrentUser } from '../../lib/api'

export const Route = createFileRoute('/surveys/$surveyId/edit')({
  beforeLoad: async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw redirect({ to: '/login' })
      }
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: EditSurveyPage,
})

function EditSurveyPage() {
  const { surveyId } = Route.useParams()
  const [mobileView, setMobileView] = useState<'controls' | 'preview'>('controls')

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
      <div className="bg-white/80 backdrop-blur-xl border-b border-border/50 px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-40 sticky top-[80px] shadow-sm">
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

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden bg-surface-dim p-1 rounded-xl border border-border/60 shadow-inner w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMobileView('controls')}
            className={`flex-1 sm:flex-none px-6 py-1.5 rounded-lg font-bold text-sm transition-all ${
              mobileView === 'controls'
                ? 'bg-white text-brand shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Builder
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`flex-1 sm:flex-none px-6 py-1.5 rounded-lg font-bold text-sm transition-all ${
              mobileView === 'preview'
                ? 'bg-white text-brand shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left Panel: Builder Controls */}
        <div
          className={`w-full lg:w-[400px] border-r border-border/80 bg-white/50 backdrop-blur-xl p-6 flex-col gap-6 overflow-y-auto ${mobileView === 'controls' ? 'flex' : 'hidden'} lg:flex`}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-text line-clamp-1" title={editor.liveTitle}>
              {editor.liveTitle}
            </h1>
          </div>

          <BrandingPanel
            brandColor={survey.brand_color}
            bgColor={survey.bg_color}
            pageBgColor={survey.page_bg_color}
            fontFamily={survey.font_family}
            logoUrl={survey.logo_url}
            onColorChange={editor.setLiveBrandColor}
            onBgColorChange={editor.setLiveBgColor}
            onPageBgColorChange={editor.setLivePageBgColor}
            onFontFamilyChange={editor.setLiveFontFamily}
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
        <div
          className={`flex-1 p-3 lg:p-6 lg:pt-4 overflow-y-auto flex-col ${mobileView === 'preview' ? 'flex' : 'hidden'} lg:flex transition-colors duration-500`}
          style={
            {
              backgroundColor: editor.livePageBgColor,
              fontFamily: editor.liveFontFamily,
            } as React.CSSProperties
          }
        >
          <div className="max-w-2xl mx-auto w-full">
            {/* Survey Render Wrapper */}
            <div
              className="rounded-3xl shadow-xl overflow-hidden border border-border/40 transition-all duration-300"
              style={
                {
                  '--color-brand': editor.liveBrandColor,
                  backgroundColor: editor.liveBgColor,
                } as React.CSSProperties
              }
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

                <div className="relative mb-4">
                  <textarea
                    value={editor.liveTitle}
                    onChange={(e) => {
                      e.target.style.height = 'auto'
                      e.target.style.height = `${e.target.scrollHeight}px`
                      editor.setLiveTitle(e.target.value)
                    }}
                    onBlur={editor.handleTitleBlur}
                    className="w-full text-4xl font-extrabold text-text bg-transparent border-0 border-b-2 border-transparent hover:border-border/50 focus:border-brand focus:outline-none focus:ring-0 py-3 transition-colors resize-none overflow-hidden leading-tight"
                    placeholder="Survey Title"
                    rows={1}
                  />
                  {editor.saveStatus === 'saving' && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted animate-pulse bg-white/80 px-2 rounded">
                      Saving...
                    </span>
                  )}
                  {editor.saveStatus === 'saved' && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-success flex items-center gap-1 bg-white/80 px-2 rounded">
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
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Saved
                    </span>
                  )}
                  {editor.saveStatus === 'error' && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-danger bg-white/80 px-2 rounded">
                      Error saving
                    </span>
                  )}
                </div>

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
