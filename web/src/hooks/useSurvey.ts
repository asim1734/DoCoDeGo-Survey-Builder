import { useEffect, useState } from 'react'
import { getSurvey, type SurveyWithQuestions } from '../lib/api'
import { useAuth } from '../routes/__root'

export function useSurvey(surveyId: string) {
  const { user } = useAuth()
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
    }
  }, [surveyId, user])

  return { survey, setSurvey, loading, user }
}
