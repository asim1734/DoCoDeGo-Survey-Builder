import type { SurveyResponsesData } from '../lib/api'

type ExportCsvButtonProps = {
  data: SurveyResponsesData
}

export function ExportCsvButton({ data }: ExportCsvButtonProps) {
  const handleExportCSV = () => {
    if (data.responses.length === 0) return

    const headers = ['Submitted At', ...data.questions.map((q) => q.title)]
    const rows = data.responses.map((res) => {
      const d = new Date(res.submitted_at)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      const row = [`="${dateStr}"`]
      for (const q of data.questions) {
        let answer = res.answers[q.id] || ''
        try {
          const parsed = JSON.parse(answer)
          if (Array.isArray(parsed)) answer = parsed.join(', ')
        } catch (_e) {}
        answer = answer.replace(/"/g, '""')
        if (/^\d{4}-\d{2}-\d{2}/.test(answer)) {
          row.push(`="${answer}"`)
        } else {
          row.push(`"${answer}"`)
        }
      }
      return row.join(',')
    })

    const csvContent = [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','), ...rows].join(
      '\n',
    )

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `${data.survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (data.responses.length === 0) return null

  return (
    <button
      type="button"
      onClick={handleExportCSV}
      className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-bold rounded-xl shadow-md hover:shadow-glow hover:-translate-y-0.5 transition-all"
    >
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
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export CSV
    </button>
  )
}
