import { Hono } from 'hono'
import { authMiddleware } from './middleware/auth'
import { auth } from './routes/auth'
import { publicRoutes } from './routes/public'
import { questions } from './routes/questions'
import { responses } from './routes/responses'
import { surveys } from './routes/surveys'

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Public routes (no auth required)
app.route('/api/public', publicRoutes)

app.route('/api/auth', auth)

// Protected routes
app.use('/api/surveys/*', authMiddleware)
app.route('/api/surveys', surveys)
app.route('/api/surveys', questions)
app.route('/api/surveys/:surveyId/responses', responses)

export default app
