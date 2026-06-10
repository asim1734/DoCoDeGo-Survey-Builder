import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from './__root'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/login' })
    }
  }, [loading, user, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <p className="text-text-muted">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Surveys</h1>
          <p className="text-text-muted text-sm mt-1">Create and manage your surveys</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-12 text-center">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-text-muted">No surveys yet. Survey creation is coming in Phase 2!</p>
      </div>
    </div>
  )
}
