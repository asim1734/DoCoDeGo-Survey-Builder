import type React from 'react'
import type { SurveyResponsesData } from '../../lib/api'
import { ExportCsvButton } from '../ExportCsvButton'

type ResponsesTableProps = {
  data: SurveyResponsesData | null
}

export function ResponsesTable({ data }: ResponsesTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-border/40 shadow-soft p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text">Survey Responses</h2>
        {data && <ExportCsvButton data={data} />}
      </div>

      {!data || data.responses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-surface-dim rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-text-muted/50"
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
          <p className="text-text-muted">No responses yet. Share your survey to collect data.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/40">
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
                        if (Array.isArray(parsed)) displayValue = parsed.join(', ')
                        else displayValue = answer
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
      )}
    </div>
  )
}
