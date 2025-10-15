"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Hash, Users } from "lucide-react"
import { cn } from "@/lib/utils"

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
  content: string
  createdAt: string
  sender: {
    id: string
    name: string | null
    email: string
  }
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
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

  // Fetch messages when channel changes
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
    }
  }, [selectedChannel])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChannel) return
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          channelId: selectedChannel.id,
        }),
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages([...messages, newMessage])
        setMessage("")
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const senderName = msg.sender.name || msg.sender.email.split('@')[0]
              const initials = senderName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
              const isCurrentUser = msg.sender.id === session?.user?.id

              return (
                <div key={msg.id} className="flex gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold",
                    isCurrentUser ? "bg-green-600" : "bg-blue-600"
                  )}>
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold">
                        {isCurrentUser ? 'You' : senderName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{msg.content}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Hash className="w-16 h-16 mx-auto mb-4" />
                <p>No messages in this channel yet</p>
                <p className="text-sm mt-2">Be the first to say something!</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message #${selectedChannel?.name || 'channel'}`}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!selectedChannel}
            />
            <Button onClick={handleSendMessage} disabled={!selectedChannel}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


