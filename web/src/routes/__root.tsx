import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getCurrentUser, logout as logoutApi } from '../lib/api'

type User = {
  id: string
  email: string
  name?: string
  created_at: string
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

function RootLayout() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setUser(null)
    navigate({ to: '/login' })
  }, [navigate])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  return (
    <AuthContext value={{ user, loading, refreshUser, logout }}>
      <div className="min-h-screen flex flex-col relative selection:bg-brand-200 selection:text-brand-700">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-border/50 px-8 py-6 flex items-center justify-between transition-all duration-300">
          <a
            href="/"
            className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Survey Builder
          </a>

          <div className="flex items-center gap-4">
            {loading ? null : user ? (
              <>
                <span className="text-sm font-medium text-text-muted bg-surface-dim px-4 py-2 rounded-full border border-border/50">
                  {user.name || user.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm font-medium text-text-muted hover:text-danger px-4 py-2 rounded-full hover:bg-danger/10 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="text-sm font-medium bg-brand text-text-on-brand px-3 py-2 rounded-full shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault()
                  navigate({ to: '/login' })
                }}
              >
                Sign in
              </a>
            )}
          </div>
        </nav>

        <main className="flex-1 pt-24">
          <Outlet />
        </main>
      </div>
    </AuthContext>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
