import { useState } from 'react'

type PublishingPanelProps = {
  isPublished: boolean
  isPublishing: boolean
  surveyId: string
  onTogglePublish: () => void
}

export function PublishingPanel({
  isPublished,
  isPublishing,
  surveyId,
  onTogglePublish,
}: PublishingPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    const url = `${window.location.origin}/s/${surveyId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-text">Publishing</h3>
          <p className="text-xs text-text-muted mt-1">
            {isPublished ? 'Survey is live.' : 'Survey is hidden.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onTogglePublish}
          disabled={isPublishing}
          className={`px-4 py-2 font-bold rounded-lg transition-colors focus:outline-none ${
            isPublished
              ? 'bg-danger/10 text-danger hover:bg-danger/20'
              : 'bg-success/10 text-success hover:bg-success/20'
          }`}
        >
          {isPublishing ? '...' : isPublished ? 'Unpublish' : 'Publish'}
        </button>
      </div>
      {isPublished && (
        <div className="mt-4 p-3 bg-white rounded-lg flex items-center justify-between border border-border/40">
          <span className="text-xs font-mono text-text-muted truncate mr-2">
            {window.location.origin}/s/{surveyId}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                copied ? 'text-success' : 'text-text-muted hover:text-text'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a
              href={`/s/${surveyId}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-brand hover:underline whitespace-nowrap"
            >
              Open →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
