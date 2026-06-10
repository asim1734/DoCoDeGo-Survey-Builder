import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { sendOtpCode, verifyOtpCode } from '../lib/api'
import { useAuth } from './__root'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSending(true)

    const result = await sendOtpCode(email)

    setSending(false)

    if (!result.ok) {
      setError(result.error || 'Failed to send code')
      return
    }

    setStep('code')
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSending(true)

    const result = await verifyOtpCode(email, code)

    setSending(false)

    if (!result.ok) {
      setError(result.error || 'Invalid code')
      return
    }

    await refreshUser()
    navigate({ to: '/dashboard' })
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-md border border-border p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
          <p className="text-text-muted text-center text-sm mb-8">
            {step === 'email'
              ? 'Enter your email to sign in or create an account'
              : `We sent a 6-digit code to ${email}`}
          </p>

          {step === 'email' ? (
            <form onSubmit={handleSendCode}>
              <label htmlFor="email-input" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
              />

              {error && <p className="text-danger text-sm mt-2">{error}</p>}

              <button
                type="submit"
                disabled={sending || !email}
                className="w-full mt-4 py-2.5 bg-brand text-text-on-brand font-medium rounded-lg hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send verification code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <label htmlFor="code-input" className="block text-sm font-medium mb-1.5">
                Verification code
              </label>
              <input
                id="code-input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                autoFocus
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
              />

              {error && <p className="text-danger text-sm mt-2">{error}</p>}

              <button
                type="submit"
                disabled={sending || code.length !== 6}
                className="w-full mt-4 py-2.5 bg-brand text-text-on-brand font-medium rounded-lg hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Verifying...' : 'Verify & sign in'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setError('')
                }}
                className="w-full mt-2 py-2 text-sm text-text-muted hover:text-text transition"
              >
                ← Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Check your terminal for the verification code during development.
        </p>
      </div>
    </div>
  )
}
