import { Hono } from 'hono'
import { auth } from './routes/auth'

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.route('/api/auth', auth)

export default app
