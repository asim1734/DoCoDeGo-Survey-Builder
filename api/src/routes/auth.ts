import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { nanoid } from 'nanoid'

type AuthEnv = {
  Bindings: Env
}

const auth = new Hono<AuthEnv>()

auth.post('/send-code', async (c) => {
  const body = await c.req.json<{ email?: string }>()
  const email = body.email?.trim().toLowerCase()

  if (!email?.includes('@')) {
    return c.json({ error: 'A valid email is required' }, 400)
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const id = nanoid()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  await c.env.DB.prepare('INSERT INTO otp_codes (id, email, code, expires_at) VALUES (?, ?, ?, ?)')
    .bind(id, email, code, expiresAt)
    .run()

  // In production, send this via email (Resend, SES, etc.)
  // For development, log it to the console so you can copy-paste it
  console.log(`[OTP] Code for ${email}: ${code}`)

  return c.json({ ok: true })
})

auth.post('/verify', async (c) => {
  const body = await c.req.json<{ email?: string; code?: string; name?: string }>()
  const email = body.email?.trim().toLowerCase()
  const code = body.code?.trim()
  const name = body.name?.trim()

  if (!email || !code) {
    return c.json({ error: 'Email and code are required' }, 400)
  }

  const otpRow = await c.env.DB.prepare(
    `SELECT id FROM otp_codes
     WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
     ORDER BY created_at DESC
     LIMIT 1`,
  )
    .bind(email, code)
    .first()

  if (!otpRow) {
    return c.json({ error: 'Invalid or expired code' }, 401)
  }

  // Mark the OTP as used so it can't be reused
  await c.env.DB.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').bind(otpRow.id).run()

  // Find or create the user
  let userRow = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()

  if (!userRow) {
    if (!name) {
      return c.json({ error: 'Name is required to create a new account' }, 400)
    }
    const userId = nanoid()
    await c.env.DB.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)')
      .bind(userId, email, name)
      .run()
    userRow = { id: userId }
  }

  // Create a session that lasts 7 days
  const sessionId = nanoid(32)
  const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, userRow.id, sessionExpires)
    .run()

  setCookie(c, 'session', sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60,
  })

  return c.json({ ok: true })
})

auth.post('/logout', async (c) => {
  const sessionId = getCookie(c, 'session')

  if (sessionId) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
  }

  deleteCookie(c, 'session', { path: '/' })

  return c.json({ ok: true })
})

auth.get('/me', async (c) => {
  const sessionId = getCookie(c, 'session')

  if (!sessionId) {
    return c.json({ user: null }, 401)
  }

  const row = await c.env.DB.prepare(
    `SELECT users.id, users.email, users.name, users.created_at
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`,
  )
    .bind(sessionId)
    .first()

  if (!row) {
    deleteCookie(c, 'session', { path: '/' })
    return c.json({ user: null }, 401)
  }

  return c.json({ user: row })
})

export { auth }
