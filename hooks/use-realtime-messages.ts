"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { wsManager } from '@/lib/websocket'

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

export function useRealtimeMessages(channelId?: string, directChatId?: string) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Connect to WebSocket
  useEffect(() => {
    if (!session?.user?.id) return

    wsManager.connect()

    const checkConnection = () => {
      setIsConnected(wsManager.isSocketConnected() || false)
    }

    checkConnection()
    const interval = setInterval(checkConnection, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [session?.user?.id])

  // Join channel/chat
  useEffect(() => {
    if (!session?.user?.id || !wsManager.isSocketConnected()) return

    if (channelId) {
      wsManager.joinChannel(channelId, session.user.id)
    } else if (directChatId) {
      wsManager.joinDirectChat(directChatId, session.user.id)
    }

    return () => {
      if (channelId) {
        wsManager.leaveChannel(channelId, session.user.id)
      } else if (directChatId) {
        wsManager.leaveDirectChat(directChatId, session.user.id)
      }
    }
  }, [session?.user?.id, channelId, directChatId])

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })
    }

    wsManager.onMessage(handleNewMessage)

    return () => {
      // Cleanup listeners
    }
  }, [])

  // Send message
  const sendMessage = useCallback(async (messageData: any) => {
    if (!session?.user?.id) return

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
          directChatId: directChatId || undefined
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prev => [...prev, newMessage])
        
        // Also send via WebSocket for real-time delivery
        wsManager.sendMessage({
          ...messageData,
          channelId: channelId || null,
          directChatId: directChatId || null,
          senderId: session.user.id,
          senderName: session.user.name
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [session?.user?.id, session?.user?.name, channelId, directChatId])

  // Load initial messages
  const loadMessages = useCallback(async () => {
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
  }, [channelId, directChatId])

  // Load messages on mount
  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return {
    messages,
    sendMessage,
    loadMessages,
    isConnected
  }
}
