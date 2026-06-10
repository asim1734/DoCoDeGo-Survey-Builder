import { Hono } from 'hono'

type User = {
  id: string
  email: string
  name?: string
  created_at: string
}

type ResponsesEnv = {
  Bindings: Env
  Variables: {
    user: User
  }
}

const responses = new Hono<ResponsesEnv>()

// GET /api/surveys/:surveyId/responses
responses.get('/', async (c) => {
  const user = c.get('user')
  const surveyId = c.req.param('surveyId')

  // 1. Verify survey ownership
  const survey = await c.env.DB.prepare('SELECT * FROM surveys WHERE id = ? AND user_id = ?')
    .bind(surveyId, user.id)
    .first()

  if (!survey) {
    return c.json({ error: 'Survey not found or unauthorized' }, 404)
  }

  // 2. Fetch questions for columns
  const { results: questions } = await c.env.DB.prepare(
    'SELECT * FROM questions WHERE survey_id = ? ORDER BY sort_order ASC',
  )
    .bind(surveyId)
    .all()

  // 3. Fetch all responses
  const { results: rawResponses } = await c.env.DB.prepare(
    'SELECT * FROM responses WHERE survey_id = ? ORDER BY submitted_at DESC',
  )
    .bind(surveyId)
    .all()

  // 4. Fetch all answers for these responses
  const { results: rawAnswers } = await c.env.DB.prepare(
    `SELECT answers.* FROM answers 
     JOIN responses ON answers.response_id = responses.id 
     WHERE responses.survey_id = ?`,
  )
    .bind(surveyId)
    .all()

  // 5. Package answers into their respective responses
  const formattedResponses = rawResponses.map((res) => {
    const resAnswers = rawAnswers.filter((a) => a.response_id === res.id)
    const answersMap: Record<string, string> = {}
    for (const ans of resAnswers) {
      answersMap[ans.question_id as string] = ans.value as string
    }

    return {
      id: res.id,
      submitted_at: res.submitted_at,
      answers: answersMap,
    }
  })

  const parsedQuestions = questions.map((q) => ({
    ...q,
    options: JSON.parse((q.options as string) || '[]'),
  }))

  return c.json({
    survey,
    questions: parsedQuestions,
    responses: formattedResponses,
  })
})

export { responses }
