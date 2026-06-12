import { toast } from 'react-hot-toast'

export const confirmToast = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[250px]">
          <span className="font-semibold text-text">{message}</span>
          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              className="px-3 py-1.5 bg-surface-dim border border-border/50 rounded-lg text-sm font-bold text-text-muted hover:text-text transition-colors"
              onClick={() => {
                toast.dismiss(t.id)
                resolve(false)
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-3 py-1.5 bg-danger text-white rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
              onClick={() => {
                toast.dismiss(t.id)
                resolve(true)
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' },
    )
  })
}
