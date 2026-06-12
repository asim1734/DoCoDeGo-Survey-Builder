import { useEffect, useState } from 'react'
import { type SurveyWithQuestions, updateSurvey } from '../lib/api'

export function useSurveyEditor(
  survey: SurveyWithQuestions | null,
  setSurvey: (s: SurveyWithQuestions) => void,
) {
  const [liveTitle, setLiveTitle] = useState('')
  const [liveBrandColor, setLiveBrandColor] = useState('#3b82f6')
  const [liveBgColor, setLiveBgColor] = useState('#f9fafb')
  const [liveFontFamily, setLiveFontFamily] = useState('Inter')
  const [liveLogoUrl, setLiveLogoUrl] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Sync state when survey loads
  useEffect(() => {
    if (survey) {
      setLiveTitle(survey.title)
      setLiveBrandColor(survey.brand_color)
      setLiveBgColor(survey.bg_color)
      setLiveFontFamily(survey.font_family)
      setLiveLogoUrl(survey.logo_url)
    }
  }, [survey])

  const handleTitleBlur = async () => {
    if (!survey || liveTitle === survey.title) return
    setSaveStatus('saving')
    const success = await updateSurvey(survey.id, { title: liveTitle })
    if (success) {
      setSurvey({ ...survey, title: liveTitle })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setLiveTitle(survey.title) // revert on failure
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleSaveBranding = async (data: {
    brand_color: string
    bg_color: string
    font_family: string
    logo_url: string
  }) => {
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

  return {
    liveTitle,
    setLiveTitle,
    liveBrandColor,
    setLiveBrandColor,
    liveBgColor,
    setLiveBgColor,
    liveFontFamily,
    setLiveFontFamily,
    liveLogoUrl,
    setLiveLogoUrl,
    isPublishing,
    saveStatus,
    handleTitleBlur,
    handleSaveBranding,
    handleTogglePublish,
  }
}
