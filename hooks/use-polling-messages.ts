"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  content?: string
  type: string
  sender: {
    id: string
    name: string | null
    avatar?: string
  }
  attachments?: any[]
  poll?: any
  event?: any
  createdAt: string
}

export function usePollingMessages(channelId?: string, directChatId?: string) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch messages
  const loadMessages = useCallback(async () => {
    if (!session?.user?.id) return
    
    try {
      const url = directChatId 
        ? `/api/direct-chats/${directChatId}/messages`
        : `/api/messages?channelId=${channelId}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [channelId, directChatId, session?.user?.id])

  // Load messages on mount and set up polling
  useEffect(() => {
    if (!session?.user?.id) return

    loadMessages()

    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      loadMessages()
    }, 2000)

    return () => clearInterval(interval)
  }, [session?.user?.id, loadMessages])

  // Send message
  const sendMessage = useCallback(async (messageData: any) => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const url = directChatId 
        ? `/api/direct-chats/${directChatId}/messages`
        : '/api/messages'
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageData,
          channelId: channelId || undefined,
        })
      })

      if (response.ok) {
        // Reload messages immediately after sending
        await loadMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, channelId, directChatId, loadMessages])

  return {
    messages,
    sendMessage,
    loadMessages,
    isLoading
  }
}
