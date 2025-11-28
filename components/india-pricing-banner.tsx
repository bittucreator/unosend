'use client'

import { useState, useEffect } from 'react'

export function IndiaPricingBanner() {
  const [isIndia, setIsIndia] = useState(false)

  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setIsIndia(timezone.includes('Kolkata') || timezone.includes('Asia/Calcutta'))
    } catch {
      setIsIndia(false)
    }
  }, [])

  if (!isIndia) return null

  return (
    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
      <span className="text-[13px] text-orange-800">
        🇮🇳 India pricing: <span className="font-medium">50% off</span> all paid plans!
      </span>
    </div>
  )
}
