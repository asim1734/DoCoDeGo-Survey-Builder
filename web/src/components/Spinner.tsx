export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-12 h-12">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-brand/20" />
        {/* Inner Spinning Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand animate-spin" />
      </div>
      <p className="text-sm font-semibold text-text-muted animate-pulse">Loading...</p>
    </div>
  )
}
