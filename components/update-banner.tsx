"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function UpdateBanner() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="fixed top-4 left-4 z-40 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm px-4 py-2">
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-blue-600" />
        <div>
          <div className="font-medium text-gray-900">{formatDate(currentTime)}</div>
          <div className="text-xs text-gray-500">{formatTime(currentTime)}</div>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1">Last updated: Now</div>
    </div>
  )
}
