"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Hash, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { MessageComposer } from "@/components/messaging/message-composer"
import { MessageItem } from "@/components/messaging/message-item"

interface Channel {
  id: string
  name: string
  description?: string
  _count?: {
    messages: number
  }
}

interface Message {
  id: string
  content?: string
  type: string
  createdAt: string
  sender: {
    id: string
    name: string | null
    email: string
    avatar?: string
  }
  attachments?: Array<{
    id: string
    filename: string
    fileType: string
    fileUrl: string
  }>
  poll?: {
    id: string
    question: string
    options: Array<{
      id: string
      text: string
      votes: Array<{
        user: {
          id: string
          name: string
        }
      }>
    }>
    expiresAt?: string
  }
  event?: {
    id: string
    title: string
    description?: string
    startDate: string
    endDate?: string
    location?: string
    attendees: Array<{
      id: string
      status: string
      user: {
        id: string
        name: string
      }
    }>
  }
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch channels
  useEffect(() => {
    async function fetchChannels() {
      try {
        const response = await fetch('/api/channels')
        if (response.ok) {
          const data = await response.json()
          setChannels(data)
          if (data.length > 0) {
            setSelectedChannel(data[0])
          }
        }
      } catch (error) {
        console.error('Error fetching channels:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchChannels()
    }
  }, [session])

  // Fetch messages for selected channel
  useEffect(() => {
    async function fetchMessages() {
      if (!selectedChannel) return

      try {
        const response = await fetch(`/api/messages?channelId=${selectedChannel.id}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    if (selectedChannel) {
      fetchMessages()
      
      // Poll for new messages every 2 seconds for live updates
      const interval = setInterval(fetchMessages, 2000)
      
      return () => clearInterval(interval)
    }
  }, [selectedChannel])

  const handleSendMessage = async (messageData: any) => {
    if (!selectedChannel) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageData,
          channelId: selectedChannel.id
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        console.log('Message sent successfully:', newMessage)
        setMessages(prev => [...prev, newMessage])
      } else {
        const errorData = await response.json()
        console.error('Error sending message:', errorData)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleVotePoll = async (pollId: string, optionId: string) => {
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId })
      })

      if (response.ok) {
        // Refresh messages to show updated poll results
        const messagesResponse = await fetch(`/api/messages?channelId=${selectedChannel?.id}`)
        if (messagesResponse.ok) {
          const updatedMessages = await messagesResponse.json()
          setMessages(updatedMessages)
        }
      }
    } catch (error) {
      console.error('Error voting on poll:', error)
    }
  }

  const handleRespondToEvent = async (eventId: string, status: string) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, status })
      })

      if (response.ok) {
        // Refresh messages to show updated event responses
        const messagesResponse = await fetch(`/api/messages?channelId=${selectedChannel?.id}`)
        if (messagesResponse.ok) {
          const updatedMessages = await messagesResponse.json()
          setMessages(updatedMessages)
        }
      }
    } catch (error) {
      console.error('Error responding to event:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading channels...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {/* Channels Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Channels</h2>
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors",
                  selectedChannel?.id === channel.id
                    ? "bg-blue-600"
                    : "hover:bg-gray-800"
                )}
              >
                <Hash className="w-4 h-4" />
                {channel.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Channel Header */}
        <div className="border-b px-6 py-4">
          {selectedChannel && (
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">{selectedChannel.name}</h3>
                <p className="text-sm text-gray-600">{selectedChannel.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length > 0 ? (
            <div className="space-y-1">
              {messages.map((message) => (
                <MessageItem 
                  key={message.id} 
                  message={message}
                  onVotePoll={handleVotePoll}
                  onRespondToEvent={handleRespondToEvent}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold">No messages yet</p>
                <p className="text-sm">Start the conversation below</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        {selectedChannel && (
          <MessageComposer 
            onSendMessage={handleSendMessage} 
            channelId={selectedChannel.id} 
          />
        )}
      </div>
    </div>
  )
}