import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getCurrentUser, logout as logoutApi } from '../lib/api'

type User = {
  id: string
  email: string
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
      <div className="min-h-screen flex flex-col">
        <nav className="bg-white border-b border-border px-6 py-3 flex items-center justify-between">
          <a
            href="/"
            className="text-xl font-semibold text-text"
            onClick={(e) => {
              e.preventDefault()
              navigate({ to: '/' })
            }}
          >
            📋 Survey Builder
          </a>

          <div className="flex items-center gap-4">
            {loading ? null : user ? (
              <>
                <span className="text-sm text-text-muted">{user.email}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm text-text-muted hover:text-text cursor-pointer transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="text-sm font-medium text-brand hover:text-brand-dark transition-colors"
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

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </AuthContext>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
