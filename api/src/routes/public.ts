import { Hono } from 'hono'
import { nanoid } from 'nanoid'

type PublicEnv = {
  Bindings: Env
}

const publicRoutes = new Hono<PublicEnv>()

// GET /api/public/surveys/:id
publicRoutes.get('/surveys/:id', async (c) => {
  const id = c.req.param('id')

  const survey = await c.env.DB.prepare('SELECT * FROM surveys WHERE id = ? AND is_published = 1')
    .bind(id)
    .first()

  if (!survey) {
    return c.json({ error: 'Survey not found or not published' }, 404)
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

// POST /api/public/surveys/:id/respond
publicRoutes.post('/surveys/:id/respond', async (c) => {
  const id = c.req.param('id')

  const survey = await c.env.DB.prepare('SELECT id FROM surveys WHERE id = ? AND is_published = 1')
    .bind(id)
    .first()

  if (!survey) {
    return c.json({ error: 'Survey not found or not published' }, 404)
  }

  const body = await c.req.json<{ answers: { questionId: string; value: string }[] }>()
  const submittedAnswers = body.answers || []

  // Fetch questions to validate required fields
  const { results: questions } = await c.env.DB.prepare(
    'SELECT id, is_required FROM questions WHERE survey_id = ?',
  )
    .bind(id)
    .all()

  for (const q of questions) {
    if (q.is_required === 1) {
      const answer = submittedAnswers.find((a) => a.questionId === q.id)
      if (!answer || answer.value.trim() === '') {
        return c.json({ error: 'Missing required answer' }, 400)
      }
    }
  }

  const responseId = nanoid()

  // Prepare batch statements
  const statements = []

  // Insert response
  statements.push(
    c.env.DB.prepare('INSERT INTO responses (id, survey_id) VALUES (?, ?)').bind(responseId, id),
  )

  // Insert answers
  for (const answer of submittedAnswers) {
    // Only insert if the question actually exists in this survey
    const isValidQuestion = questions.some((q) => q.id === answer.questionId)
    if (isValidQuestion) {
      statements.push(
        c.env.DB.prepare(
          'INSERT INTO answers (id, response_id, question_id, value) VALUES (?, ?, ?, ?)',
        ).bind(nanoid(), responseId, answer.questionId, answer.value),
      )
    }
  }

  if (statements.length > 0) {
    await c.env.DB.batch(statements)
  }

  return c.json({ ok: true })
})

export { publicRoutes }
