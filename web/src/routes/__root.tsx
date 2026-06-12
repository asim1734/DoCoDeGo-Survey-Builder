import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
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

  const location = useLocation()
  const isPublicSurvey = location.pathname.startsWith('/s/')

  return (
    <AuthContext value={{ user, loading, refreshUser, logout }}>
      <div className="min-h-screen flex flex-col relative selection:bg-brand-200 selection:text-brand-700 bg-[#f9f6f0]">
        <Toaster position="bottom-right" />

        {!isPublicSurvey && (
          <nav className="fixed top-0 left-0 right-0 z-50 bg-brand border-b border-brand-600 px-8 h-16 lg:h-24 flex items-center justify-between transition-all duration-300 shadow-sm">
            <a
              href="/"
              className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity"
            >
              Survey Builder
            </a>

            <div className="flex items-center gap-4">
              {loading ? null : user ? (
                <>
                  <span className="text-sm font-medium text-white bg-white/20 px-4 py-2 rounded-full border border-white/30">
                    {user.name || user.email}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  className="text-sm font-medium bg-white text-brand px-5 py-2 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
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
        )}

        <main className={`flex-1 ${isPublicSurvey ? '' : 'pt-16 lg:pt-24'}`}>
          <Outlet />
        </main>
      </div>
    </AuthContext>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
