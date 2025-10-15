"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { wsManager } from '@/lib/websocket'

interface TypingUser {
  id: string
  name: string
  timestamp: number
}

export function useTyping(channelId?: string, directChatId?: string) {
  const { data: session } = useSession()
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Clean up old typing indicators (older than 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setTypingUsers(prev => 
        prev.filter(user => now - user.timestamp < 3000)
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Listen for typing events
  useEffect(() => {
    if (!session?.user?.id) return

    const handleTyping = (data: any) => {
      // Only show typing for other users, not yourself
      if (data.userId !== session.user.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.id !== data.userId)
          return [...filtered, {
            id: data.userId,
            name: data.userName,
            timestamp: Date.now()
          }]
        })
      }
    }

    const handleStopTyping = (data: any) => {
      if (data.userId !== session.user.id) {
        setTypingUsers(prev => prev.filter(user => user.id !== data.userId))
      }
    }

    wsManager.onTyping(handleTyping)
    wsManager.onStopTyping(handleStopTyping)

    return () => {
      // Cleanup listeners
    }
  }, [session?.user?.id])

  const startTyping = useCallback(() => {
    if (!session?.user?.id || !session?.user?.name) return

    if (!isTyping) {
      setIsTyping(true)
      wsManager.startTyping(
        channelId || null,
        directChatId || null,
        session.user.id,
        session.user.name
      )
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      stopTyping()
    }, 2000)

    setTypingTimeout(timeout)
  }, [session?.user?.id, session?.user?.name, channelId, directChatId, isTyping, typingTimeout])

  const stopTyping = useCallback(() => {
    if (!session?.user?.id || !isTyping) return

    setIsTyping(false)
    wsManager.stopTyping(
      channelId || null,
      directChatId || null,
      session.user.id
    )

    if (typingTimeout) {
      clearTimeout(typingTimeout)
      setTypingTimeout(null)
    }
  }, [session?.user?.id, channelId, directChatId, isTyping, typingTimeout])

  const handleInputChange = useCallback((value: string) => {
    if (value.trim().length > 0) {
      startTyping()
    } else {
      stopTyping()
    }
  }, [startTyping, stopTyping])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
      stopTyping()
    }
  }, [typingTimeout, stopTyping])

  return {
    typingUsers,
    isTyping,
    handleInputChange,
    startTyping,
    stopTyping
  }
}
