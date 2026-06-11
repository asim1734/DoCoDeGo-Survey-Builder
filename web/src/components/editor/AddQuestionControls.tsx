type AddQuestionControlsProps = {
  onAdd: (type: string) => void
  disabled: boolean
}

export function AddQuestionControls({ onAdd, disabled }: AddQuestionControlsProps) {
  const buttonClass =
    'flex items-center gap-2 p-3 text-sm font-semibold bg-white border border-border/60 rounded-xl hover:border-brand hover:text-brand hover:shadow-soft transition-all'

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-text">Add Question</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onAdd('short_text')}
          disabled={disabled}
          className={buttonClass}
        >
          Short Text
        </button>
        <button
          type="button"
          onClick={() => onAdd('long_text')}
          disabled={disabled}
          className={buttonClass}
        >
          Long Text
        </button>
        <button
          type="button"
          onClick={() => onAdd('multiple_choice')}
          disabled={disabled}
          className={buttonClass}
        >
          Radio Choice
        </button>
        <button
          type="button"
          onClick={() => onAdd('checkboxes')}
          disabled={disabled}
          className={buttonClass}
        >
          Checkboxes
        </button>
        <button
          type="button"
          onClick={() => onAdd('dropdown')}
          disabled={disabled}
          className={buttonClass}
        >
          Dropdown
        </button>
        <button
          type="button"
          onClick={() => onAdd('date')}
          disabled={disabled}
          className={buttonClass}
        >
          Date Picker
        </button>
        <button
          type="button"
          onClick={() => onAdd('linear_scale')}
          disabled={disabled}
          className={buttonClass}
        >
          Linear Scale
        </button>
        <button
          type="button"
          onClick={() => onAdd('rating')}
          disabled={disabled}
          className={buttonClass}
        >
          Star Rating
        </button>
      </div>
    </div>
  )
}
