import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'

type User = {
  id: string
  email: string
  created_at: string
}

type AuthEnv = {
  Bindings: Env
  Variables: {
    user: User
  }
}

export async function authMiddleware(c: Context<AuthEnv>, next: Next) {
  const sessionId = getCookie(c, 'session')

  if (!sessionId) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  const row = await c.env.DB.prepare(
    `SELECT users.id, users.email, users.created_at
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`,
  )
    .bind(sessionId)
    .first()

  if (!row) {
    return c.json({ error: 'Session expired or invalid' }, 401)
  }

  const user = row as User
  c.set('user', user)
  return next()
}
