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
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text">My Surveys</h1>
          <p className="text-text-muted mt-2">Manage and view your active survey campaigns.</p>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-border/80 p-16 text-center hover:bg-white/80 hover:border-brand/30 hover:shadow-glow transition-all duration-300 group cursor-pointer">
        <div className="w-16 h-16 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <p className="text-3xl">📋</p>
        </div>
        <h3 className="text-lg font-bold text-text mb-2">No surveys yet</h3>
        <p className="text-text-muted max-w-sm mx-auto">
          You haven't created any surveys. Survey creation is coming in Phase 2!
        </p>
      </div>
    </div>
  )
}
