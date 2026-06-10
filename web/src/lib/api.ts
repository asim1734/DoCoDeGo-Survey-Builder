type User = {
  id: string
  email: string
  name?: string
  created_at: string
}

export async function sendOtpCode(email: string): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch('/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const data = (await response.json()) as { error?: string }
    return { ok: false, error: data.error || 'Failed to send code' }
  }

  return { ok: true }
}

export async function verifyOtpCode(
  email: string,
  code: string,
  name?: string,
): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, name }),
  })

  if (!response.ok) {
    const data = (await response.json()) as { error?: string }
    return { ok: false, error: data.error || 'Invalid code' }
  }

  return { ok: true }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch('/api/auth/me')

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as { user: User | null }
  return data.user
}

export type Survey = {
  id: string
  user_id: string
  title: string
  brand_color: string
  logo_url: string
  is_published: number
  created_at: string
  updated_at: string
}

export type Question = {
  id: string
  survey_id: string
  type: string
  title: string
  options: string[]
  is_required: number
  sort_order: number
}

export type SurveyWithQuestions = Survey & { questions: Question[] }

export async function getSurveys(): Promise<Survey[]> {
  const response = await fetch('/api/surveys')
  if (!response.ok) return []
  const data = (await response.json()) as { surveys: Survey[] }
  return data.surveys
}

export async function getSurvey(id: string): Promise<SurveyWithQuestions | null> {
  const response = await fetch(`/api/surveys/${id}`)
  if (!response.ok) return null
  const data = (await response.json()) as { survey: SurveyWithQuestions }
  return data.survey
}

export async function createSurvey(): Promise<Survey | null> {
  const response = await fetch('/api/surveys', { method: 'POST' })
  if (!response.ok) return null
  return (await response.json()) as Survey
}

export async function updateSurvey(
  id: string,
  data: Partial<{ title: string; brand_color: string; logo_url: string; is_published: boolean }>,
): Promise<boolean> {
  const response = await fetch(`/api/surveys/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return response.ok
}

export async function deleteSurvey(id: string): Promise<boolean> {
  const response = await fetch(`/api/surveys/${id}`, { method: 'DELETE' })
  return response.ok
}
