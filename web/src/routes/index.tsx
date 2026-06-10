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
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-4">Build beautiful surveys</h1>
        <p className="text-text-muted text-lg mb-8">
          Create branded surveys, share them with anyone, and view responses — all in one place.
        </p>
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault()
            navigate({ to: '/login' })
          }}
          className="inline-block px-6 py-3 bg-brand text-text-on-brand font-medium rounded-lg hover:bg-brand-dark transition"
        >
          Get started
        </a>
      </div>
    </div>
  )
}
