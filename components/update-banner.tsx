"use client"

import { useState, useEffect } from "react"

export function UpdateBanner() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  // Only set date on client side to avoid hydration mismatch
  useEffect(() => {
    setLastUpdate(new Date())
    setMounted(true)
  }, [])

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Don't render until client-side to avoid hydration issues
  if (!mounted || !lastUpdate) {
    return null
  }

  return (
    <div className="text-xs text-gray-400 px-3 pb-2">
      Updated: {formatDateTime(lastUpdate)}
    </div>
  )
}
