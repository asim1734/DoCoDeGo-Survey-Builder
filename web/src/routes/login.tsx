import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { sendOtpCode, verifyOtpCode } from '../lib/api'
import { useAuth } from './__root'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
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

    const result = await verifyOtpCode(email, code, mode === 'signup' ? name : undefined)

    setSending(false)

    if (!result.ok) {
      setError(result.error || 'Invalid code')
      return
    }

    await refreshUser()
    navigate({ to: '/dashboard' })
  }

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-soft border border-border/50 p-8 sm:p-10">
          <h1 className="text-3xl font-extrabold text-center mb-2 text-text tracking-tight">
            {step === 'code'
              ? 'Verify your email'
              : mode === 'login'
                ? 'Welcome back'
                : 'Create an account'}
          </h1>
          <p className="text-text-muted text-center text-sm mb-8">
            {step === 'email'
              ? mode === 'login'
                ? 'Enter your email to sign in'
                : 'Enter your details to create an account'
              : `We sent a 6-digit code to ${email}`}
          </p>

          {step === 'email' ? (
            <form onSubmit={handleSendCode}>
              {mode === 'signup' && (
                <div className="mb-4">
                  <label htmlFor="name-input" className="block text-sm font-medium mb-1.5">
                    Name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full px-4 py-3 bg-surface/50 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand focus:bg-white transition-all duration-200"
                  />
                </div>
              )}

              <label
                htmlFor="email-input"
                className="block text-sm font-medium mb-1.5 text-text-muted"
              >
                Email address
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-surface/50 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand focus:bg-white transition-all duration-200"
              />

              {error && <p className="text-danger text-sm mt-2">{error}</p>}

              <button
                type="submit"
                disabled={sending || !email || (mode === 'signup' && !name)}
                className="w-full mt-6 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send verification code'}
              </button>

              <div className="mt-6 text-center text-sm text-text-muted">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-brand hover:text-brand-dark font-medium transition"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-brand hover:text-brand-dark font-medium transition"
                    >
                      Log in
                    </button>
                  </>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <label
                htmlFor="code-input"
                className="block text-sm font-medium mb-1.5 text-text-muted"
              >
                Verification code
              </label>
              <input
                id="code-input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full px-4 py-3 bg-surface/50 border border-border/80 rounded-xl text-lg text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand focus:bg-white transition-all duration-200"
              />

              {error && <p className="text-danger text-sm mt-3 text-center">{error}</p>}

              <button
                type="submit"
                disabled={sending || code.length !== 6}
                className="w-full mt-6 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
              >
                {sending ? 'Verifying...' : 'Verify code'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full mt-4 py-2.5 text-sm font-medium text-text-muted hover:text-text transition-colors"
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
