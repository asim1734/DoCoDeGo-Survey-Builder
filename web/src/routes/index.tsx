import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from './__root'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: '/dashboard' })
    }
  }, [loading, user, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <p className="text-text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 lg:px-8">
      {/* Decorative Background Blob */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-400/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center max-w-3xl relative z-10">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 text-text">
          Build beautiful surveys,{' '}
          <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
            effortlessly.
          </span>
        </h1>
        <p className="text-text-muted text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Create fully branded, high-conversion surveys in minutes. Share them with anyone,
          anywhere, and view responses in real-time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault()
              navigate({ to: '/login' })
            }}
            className="group inline-flex items-center justify-center gap-2 px-3 py-2 font-bold text-text-on-brand bg-brand rounded-xl hover:bg-brand-dark transition-all duration-200 shadow-soft hover:shadow-glow hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            Start building for free
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
