import { Hono } from 'hono'
import { authMiddleware } from './middleware/auth'
import { auth } from './routes/auth'
import { surveys } from './routes/surveys'

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.route('/api/auth', auth)

// Protected routes
app.use('/api/surveys/*', authMiddleware)
app.route('/api/surveys', surveys)

export default app
