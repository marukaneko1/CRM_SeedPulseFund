"use client"

import { useState } from "react"

export function UpdateBanner() {
  const [lastUpdate] = useState(new Date())

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="text-xs text-gray-400 px-3 pb-2">
      Updated: {formatDateTime(lastUpdate)}
    </div>
  )
}
