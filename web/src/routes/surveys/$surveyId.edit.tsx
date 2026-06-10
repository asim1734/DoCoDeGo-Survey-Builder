import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { BrandingPanel } from '../../components/BrandingPanel'
import { getSurvey, type SurveyWithQuestions, updateSurvey } from '../../lib/api'
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

              <div className="space-y-8 mt-12">
                <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-2xl text-text-muted">
                  Questions will appear here (Phase 3C)
                </div>
              </div>

              <div className="mt-10">
                <button
                  type="button"
                  className="px-8 py-3 bg-[var(--color-brand)] text-white font-bold rounded-xl shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all focus:outline-none"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
