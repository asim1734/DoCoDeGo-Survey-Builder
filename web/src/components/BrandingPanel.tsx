import { useState } from 'react'

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern Sans)' },
  { value: 'Roboto', label: 'Roboto (Clean Sans)' },
  { value: 'Outfit', label: 'Outfit (Geometric)' },
  { value: '"Playfair Display"', label: 'Playfair (Elegant Serif)' },
]

type BrandingPanelProps = {
  brandColor: string
  bgColor: string
  pageBgColor: string
  fontFamily: string
  logoUrl: string
  onColorChange: (color: string) => void
  onBgColorChange: (color: string) => void
  onPageBgColorChange: (color: string) => void
  onFontFamilyChange: (font: string) => void
  onLogoChange: (url: string) => void
  onSave: (data: {
    brand_color: string
    bg_color: string
    page_bg_color: string
    font_family: string
    logo_url: string
  }) => Promise<void>
}

export function BrandingPanel({
  brandColor,
  bgColor,
  pageBgColor,
  fontFamily,
  logoUrl,
  onColorChange,
  onBgColorChange,
  onPageBgColorChange,
  onFontFamilyChange,
  onLogoChange,
  onSave,
}: BrandingPanelProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [localColor, setLocalColor] = useState(brandColor)
  const [localBgColor, setLocalBgColor] = useState(bgColor)
  const [localPageBgColor, setLocalPageBgColor] = useState(pageBgColor)
  const [localFontFamily, setLocalFontFamily] = useState(fontFamily)
  const [localLogo, setLocalLogo] = useState(logoUrl)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave({
      brand_color: localColor,
      bg_color: localBgColor,
      page_bg_color: localPageBgColor,
      font_family: localFontFamily,
      logo_url: localLogo,
    })
    setIsSaving(false)
  }

  const hasChanges =
    localColor !== brandColor ||
    localBgColor !== bgColor ||
    localPageBgColor !== pageBgColor ||
    localFontFamily !== fontFamily ||
    localLogo !== logoUrl

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-soft space-y-6">
      <h3 className="text-lg font-bold text-text">Theme & Branding</h3>

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
          <label htmlFor="bgColor" className="block text-sm font-medium text-text-muted mb-1.5">
            Card Background Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="bgColor"
              value={localBgColor}
              onChange={(e) => {
                setLocalBgColor(e.target.value)
                onBgColorChange(e.target.value)
              }}
              className="w-10 h-10 rounded cursor-pointer border-0 p-0 appearance-none bg-transparent"
            />
            <input
              type="text"
              value={localBgColor}
              onChange={(e) => {
                setLocalBgColor(e.target.value)
                onBgColorChange(e.target.value)
              }}
              className="flex-1 px-3 py-2 border border-border/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
              placeholder="#ffffff"
            />
          </div>
        </div>

        <div>
          <label htmlFor="pageBgColor" className="block text-sm font-medium text-text-muted mb-1.5">
            Page Background Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="pageBgColor"
              value={localPageBgColor}
              onChange={(e) => {
                setLocalPageBgColor(e.target.value)
                onPageBgColorChange(e.target.value)
              }}
              className="w-10 h-10 rounded cursor-pointer border-0 p-0 appearance-none bg-transparent"
            />
            <input
              type="text"
              value={localPageBgColor}
              onChange={(e) => {
                setLocalPageBgColor(e.target.value)
                onPageBgColorChange(e.target.value)
              }}
              className="flex-1 px-3 py-2 border border-border/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
              placeholder="#f8fafc"
            />
          </div>
        </div>

        <div>
          <label htmlFor="fontFamily" className="block text-sm font-medium text-text-muted mb-1.5">
            Font Family
          </label>
          <select
            id="fontFamily"
            value={localFontFamily}
            onChange={(e) => {
              setLocalFontFamily(e.target.value)
              onFontFamilyChange(e.target.value)
            }}
            className="w-full px-3 py-2 border border-border/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm bg-white"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </select>
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
          disabled={isSaving || !hasChanges}
          className="w-full px-4 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Theme'}
        </button>
      </div>
    </div>
  )
}
