import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Question } from '../../lib/api'
import { QuestionEditor } from '../QuestionEditor'

type QuestionListProps = {
  questions: Question[]
  sensors: SensorDescriptor<SensorOptions>[]
  onDragEnd: (event: DragEndEvent) => void
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void
  onDeleteQuestion: (id: string) => void
}

export function QuestionList({
  questions,
  sensors,
  onDragEnd,
  onUpdateQuestion,
  onDeleteQuestion,
}: QuestionListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-text">Questions List</h3>
      {questions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-2xl text-text-muted">
          No questions yet. Add one from above!
        </div>
      ) : (
        <div className="space-y-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {questions.map((question) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  onChange={(updates) => onUpdateQuestion(question.id, updates)}
                  onDelete={() => onDeleteQuestion(question.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}
