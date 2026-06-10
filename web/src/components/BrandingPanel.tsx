import { useState } from 'react'

type BrandingPanelProps = {
  brandColor: string
  logoUrl: string
  onColorChange: (color: string) => void
  onLogoChange: (url: string) => void
  onSave: (data: { brand_color: string; logo_url: string }) => Promise<void>
}

export function BrandingPanel({
  brandColor,
  logoUrl,
  onColorChange,
  onLogoChange,
  onSave,
}: BrandingPanelProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [localColor, setLocalColor] = useState(brandColor)
  const [localLogo, setLocalLogo] = useState(logoUrl)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave({ brand_color: localColor, logo_url: localLogo })
    setIsSaving(false)
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-soft space-y-6">
      <h3 className="text-lg font-bold text-text">Branding</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="brandColor" className="block text-sm font-medium text-text-muted mb-1.5">
            Brand Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="brandColor"
              value={localColor}
              onChange={(e) => {
                setLocalColor(e.target.value)
                onColorChange(e.target.value)
              }}
              className="w-10 h-10 rounded cursor-pointer border-0 p-0 appearance-none bg-transparent"
            />
            <input
              type="text"
              value={localColor}
              onChange={(e) => {
                setLocalColor(e.target.value)
                onColorChange(e.target.value)
              }}
              className="flex-1 px-3 py-2 border border-border/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
              placeholder="#000000"
            />
          </div>
        </div>

        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-text-muted mb-1.5">
            Logo URL
          </label>
          <input
            type="url"
            id="logoUrl"
            value={localLogo}
            onChange={(e) => {
              setLocalLogo(e.target.value)
              onLogoChange(e.target.value)
            }}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 border border-border/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || (localColor === brandColor && localLogo === logoUrl)}
          className="w-full px-4 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Branding'}
        </button>
      </div>
    </div>
  )
}
