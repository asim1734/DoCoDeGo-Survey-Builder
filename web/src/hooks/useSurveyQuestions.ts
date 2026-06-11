import {
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'
import {
  createQuestion,
  deleteQuestion,
  type Question,
  reorderQuestions,
  type SurveyWithQuestions,
  updateQuestion,
} from '../lib/api'

export function useSurveyQuestions(
  survey: SurveyWithQuestions | null,
  setSurvey: (s: SurveyWithQuestions) => void,
) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!survey || !over) return

    if (active.id !== over.id) {
      const oldIndex = survey.questions.findIndex((q) => q.id === active.id)
      const newIndex = survey.questions.findIndex((q) => q.id === over.id)

      const newQuestions = arrayMove(survey.questions, oldIndex, newIndex)
      setSurvey({ ...survey, questions: newQuestions })

      const questionIds = newQuestions.map((q) => q.id)
      const success = await reorderQuestions(survey.id, questionIds)
      if (!success) {
        setSurvey({ ...survey, questions: survey.questions })
      }
    }
  }

  const handleAddQuestion = async (type: string) => {
    if (!survey) return
    setIsAddingQuestion(true)

    let defaultOptions: string[] = []
    if (type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown') {
      defaultOptions = ['Option 1', 'Option 2']
    } else if (type === 'linear_scale') {
      defaultOptions = ['1', '5']
    }

    const newQ = await createQuestion(survey.id, {
      title: 'New Question',
      type,
      options: defaultOptions,
      is_required: 1,
    })

    if (newQ) {
      setSurvey({
        ...survey,
        questions: [...survey.questions, newQ],
      })
    }
    setIsAddingQuestion(false)
  }

  const handleUpdateQuestion = async (questionId: string, updates: Partial<Question>) => {
    if (!survey) return

    const oldQuestions = [...survey.questions]
    const updatedQuestions = oldQuestions.map((q) =>
      q.id === questionId ? { ...q, ...updates } : q,
    )
    setSurvey({ ...survey, questions: updatedQuestions })

    const success = await updateQuestion(survey.id, questionId, updates)
    if (!success) {
      setSurvey({ ...survey, questions: oldQuestions })
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!survey) return
    if (!confirm('Are you sure you want to delete this question?')) return

    const oldQuestions = [...survey.questions]
    setSurvey({
      ...survey,
      questions: oldQuestions.filter((q) => q.id !== questionId),
    })

    const success = await deleteQuestion(survey.id, questionId)
    if (!success) {
      setSurvey({ ...survey, questions: oldQuestions })
    }
  }

  return {
    sensors,
    isAddingQuestion,
    handleDragEnd,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
  }
}
