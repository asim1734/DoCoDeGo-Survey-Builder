import { Hono } from 'hono'
import { nanoid } from 'nanoid'

type User = {
  id: string
  email: string
  name?: string
  created_at: string
}

type QuestionsEnv = {
  Bindings: Env
  Variables: {
    user: User
  }
}

const questions = new Hono<QuestionsEnv>()

import type { Context } from 'hono'

// Helper to check if the user owns the survey
async function checkSurveyOwnership(c: Context<QuestionsEnv>, surveyId: string) {
  const user = c.get('user')
  const survey = await c.env.DB.prepare('SELECT id FROM surveys WHERE id = ? AND user_id = ?')
    .bind(surveyId, user.id)
    .first()
  return !!survey
}

// POST /api/surveys/:surveyId/questions
questions.post('/:surveyId/questions', async (c) => {
  const surveyId = c.req.param('surveyId')
  if (!(await checkSurveyOwnership(c, surveyId))) {
    return c.json({ error: 'Survey not found or unauthorized' }, 404)
  }

  const body = await c.req.json<{
    title?: string
    type?: string
    options?: string[]
    is_required?: boolean
  }>()

  const id = nanoid()
  const title = body.title || 'New Question'
  const type = body.type || 'short_text'
  const options = body.options || []
  const isRequired = body.is_required !== false ? 1 : 0

  // Get max sort_order
  const maxSortRow = await c.env.DB.prepare(
    'SELECT MAX(sort_order) as maxSort FROM questions WHERE survey_id = ?',
  )
    .bind(surveyId)
    .first<{ maxSort: number | null }>()

  const sortOrder = (maxSortRow?.maxSort ?? -1) + 1

  await c.env.DB.prepare(
    'INSERT INTO questions (id, survey_id, type, title, options, is_required, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(id, surveyId, type, title, JSON.stringify(options), isRequired, sortOrder)
    .run()

  return c.json({
    id,
    survey_id: surveyId,
    type,
    title,
    options,
    is_required: isRequired === 1,
    sort_order: sortOrder,
  })
})

// PUT /api/surveys/:surveyId/questions/reorder
questions.put('/:surveyId/questions/reorder', async (c) => {
  const surveyId = c.req.param('surveyId')
  if (!(await checkSurveyOwnership(c, surveyId))) {
    return c.json({ error: 'Survey not found or unauthorized' }, 404)
  }

  const body = await c.req.json<{ questionIds: string[] }>()
  if (!body.questionIds || !Array.isArray(body.questionIds)) {
    return c.json({ error: 'questionIds array is required' }, 400)
  }

  const statements = body.questionIds.map((id, index) =>
    c.env.DB.prepare('UPDATE questions SET sort_order = ? WHERE id = ? AND survey_id = ?').bind(
      index,
      id,
      surveyId,
    ),
  )

  if (statements.length > 0) {
    await c.env.DB.batch(statements)
  }

  return c.json({ ok: true })
})

// PUT /api/surveys/:surveyId/questions/:questionId
questions.put('/:surveyId/questions/:questionId', async (c) => {
  const surveyId = c.req.param('surveyId')
  const questionId = c.req.param('questionId')

  if (!(await checkSurveyOwnership(c, surveyId))) {
    return c.json({ error: 'Survey not found or unauthorized' }, 404)
  }

  const existing = await c.env.DB.prepare('SELECT * FROM questions WHERE id = ? AND survey_id = ?')
    .bind(questionId, surveyId)
    .first()

  if (!existing) {
    return c.json({ error: 'Question not found' }, 404)
  }

  const body = await c.req.json()
  const title = body.title !== undefined ? body.title : existing.title
  const type = body.type !== undefined ? body.type : existing.type
  const options = body.options !== undefined ? JSON.stringify(body.options) : existing.options
  const isRequired =
    body.is_required !== undefined ? (body.is_required ? 1 : 0) : existing.is_required

  await c.env.DB.prepare(
    'UPDATE questions SET title = ?, type = ?, options = ?, is_required = ? WHERE id = ?',
  )
    .bind(title, type, options, isRequired, questionId)
    .run()

  return c.json({ ok: true })
})

// DELETE /api/surveys/:surveyId/questions/:questionId
questions.delete('/:surveyId/questions/:questionId', async (c) => {
  const surveyId = c.req.param('surveyId')
  const questionId = c.req.param('questionId')

  if (!(await checkSurveyOwnership(c, surveyId))) {
    return c.json({ error: 'Survey not found or unauthorized' }, 404)
  }

  await c.env.DB.prepare('DELETE FROM questions WHERE id = ? AND survey_id = ?')
    .bind(questionId, surveyId)
    .run()

  return c.json({ ok: true })
})

export { questions }
