import { useEffect, useRef, useState } from 'react'
import { type SurveyWithQuestions, updateSurvey } from '../lib/api'

export function useSurveyEditor(
  survey: SurveyWithQuestions | null,
  setSurvey: (s: SurveyWithQuestions) => void,
) {
  const [liveTitle, setLiveTitle] = useState(survey?.title || '')
  const [liveBrandColor, setLiveBrandColor] = useState(survey?.brand_color || '#4f46e5')
  const [liveBgColor, setLiveBgColor] = useState(survey?.bg_color || '#ffffff')
  const [livePageBgColor, setLivePageBgColor] = useState(survey?.page_bg_color || '#f8fafc')
  const [liveFontFamily, setLiveFontFamily] = useState(survey?.font_family || 'Inter')
  const [liveLogoUrl, setLiveLogoUrl] = useState(survey?.logo_url || '')

  const [isPublishing, setIsPublishing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const initializedSurveyId = useRef<string | null>(null)

  // Sync state when survey loads (only once per survey ID)
  useEffect(() => {
    if (survey && initializedSurveyId.current !== survey.id) {
      setLiveTitle(survey.title || '')
      setLiveBrandColor(survey.brand_color || '#4f46e5')
      setLiveBgColor(survey.bg_color || '#ffffff')
      setLivePageBgColor(survey.page_bg_color || '#f8fafc')
      setLiveFontFamily(survey.font_family || 'Inter')
      setLiveLogoUrl(survey.logo_url || '')

      initializedSurveyId.current = survey.id
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

  const handleSaveBranding = async () => {
    if (!survey) return
    setSaveStatus('saving')
    const success = await updateSurvey(survey.id, {
      brand_color: liveBrandColor,
      bg_color: liveBgColor,
      page_bg_color: livePageBgColor,
      font_family: liveFontFamily,
      logo_url: liveLogoUrl,
    })
    if (success) {
      setSurvey({
        ...survey,
        brand_color: liveBrandColor,
        bg_color: liveBgColor,
        page_bg_color: livePageBgColor,
        font_family: liveFontFamily,
        logo_url: liveLogoUrl,
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
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
    livePageBgColor,
    setLivePageBgColor,
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
