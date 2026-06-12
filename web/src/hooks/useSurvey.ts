import { useEffect, useState } from 'react'
import { getSurvey, type SurveyWithQuestions } from '../lib/api'
import { useAuth } from '../routes/__root'

export function useSurvey(surveyId: string) {
  const { user, loading: authLoading } = useAuth()
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIt = async () => {
      const data = await getSurvey(surveyId)
      if (data) {
        setSurvey(data)
      }
      setLoading(false)
    }

    if (user) {
      fetchIt()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [surveyId, user, authLoading])

  return { survey, setSurvey, loading, user }
}
