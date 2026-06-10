type User = {
  id: string
  email: string
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
): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
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
