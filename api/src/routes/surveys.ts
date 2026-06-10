import { Hono } from 'hono'
import { nanoid } from 'nanoid'

type User = {
  id: string
  email: string
  name?: string
  created_at: string
}

type SurveysEnv = {
  Bindings: Env
  Variables: {
    user: User
  }
}

const surveys = new Hono<SurveysEnv>()

// GET /api/surveys
surveys.get('/', async (c) => {
  const user = c.get('user')
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM surveys WHERE user_id = ? ORDER BY created_at DESC',
  )
    .bind(user.id)
    .all()

  return c.json({ surveys: results })
})

// POST /api/surveys
surveys.post('/', async (c) => {
  const user = c.get('user')
  const id = nanoid()
  const title = 'Untitled Survey'
  // Using our new Ocean Blue brand color as default
  const defaultColor = '#3b82f6'

  await c.env.DB.prepare(
    'INSERT INTO surveys (id, user_id, title, brand_color) VALUES (?, ?, ?, ?)',
  )
    .bind(id, user.id, title, defaultColor)
    .run()

  return c.json({ id, title, brand_color: defaultColor, logo_url: '', is_published: 0 })
})

// GET /api/surveys/:id
surveys.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const survey = await c.env.DB.prepare('SELECT * FROM surveys WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .first()

  if (!survey) {
    return c.json({ error: 'Survey not found' }, 404)
  }

  const { results: questions } = await c.env.DB.prepare(
    'SELECT * FROM questions WHERE survey_id = ? ORDER BY sort_order ASC',
  )
    .bind(id)
    .all()

  const parsedQuestions = questions.map((q) => ({
    ...q,
    options: JSON.parse((q.options as string) || '[]'),
  }))

  return c.json({ survey: { ...survey, questions: parsedQuestions } })
})

// PUT /api/surveys/:id
surveys.put('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json()

  const existing = await c.env.DB.prepare('SELECT * FROM surveys WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .first()

  if (!existing) {
    return c.json({ error: 'Survey not found' }, 404)
  }

  const title = body.title !== undefined ? body.title : existing.title
  const brandColor = body.brand_color !== undefined ? body.brand_color : existing.brand_color
  const logoUrl = body.logo_url !== undefined ? body.logo_url : existing.logo_url
  const isPublished = body.is_published !== undefined ? body.is_published : existing.is_published

  await c.env.DB.prepare(
    'UPDATE surveys SET title = ?, brand_color = ?, logo_url = ?, is_published = ?, updated_at = datetime("now") WHERE id = ?',
  )
    .bind(title, brandColor, logoUrl, isPublished ? 1 : 0, id)
    .run()

  return c.json({ ok: true })
})

// DELETE /api/surveys/:id
surveys.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  await c.env.DB.prepare('DELETE FROM surveys WHERE id = ? AND user_id = ?').bind(id, user.id).run()

  return c.json({ ok: true })
})

export { surveys }
