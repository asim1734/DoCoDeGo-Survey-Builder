import { useEffect, useState } from 'react'
import { getSurveyResponses, type SurveyResponsesData } from '../lib/api'

export function useSurveyResponses(surveyId: string, user: unknown) {
  const [responsesData, setResponsesData] = useState<SurveyResponsesData | null>(null)
  const [loadingResponses, setLoadingResponses] = useState(true)

  useEffect(() => {
    const fetchIt = async () => {
      const res = await getSurveyResponses(surveyId)
      if (res) {
        setResponsesData(res)
      }
      setLoadingResponses(false)
    }
    if (user) {
      fetchIt()
    }
  }, [surveyId, user])

  return { responsesData, loadingResponses }
}
