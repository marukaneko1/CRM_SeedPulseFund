"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, MessageSquare, User as UserIcon, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { EnhancedMessageComposer } from "@/components/messaging/enhanced-message-composer"
import { MessageItem } from "@/components/messaging/message-item"
import { TypingIndicator } from "@/components/messaging/typing-indicator"
import { useTyping } from "@/hooks/use-typing"
import { useRealtimeMessages } from "@/hooks/use-realtime-messages"

interface User {
  id: string
  name: string | null
  email: string
  avatar?: string
}

interface DirectChat {
  id: string
  user1: User
  user2: User
  messages: Array<{ content: string; createdAt: string; type: string }>
  updatedAt: string
}

interface Message {
  id: string
  content?: string
  type: string
  createdAt: string
  sender: User
  attachments?: Array<{
    id: string
    filename: string
    fileType: string
    fileSize: number
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

export default function EnhancedDirectMessagesPage() {
  const { data: session } = useSession()
  const [directChats, setDirectChats] = useState<DirectChat[]>([])
  const [selectedChat, setSelectedChat] = useState<DirectChat | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  // Real-time messaging hooks
  const { messages, sendMessage, isConnected } = useRealtimeMessages(
    undefined, 
    selectedChat?.id
  )
  const { typingUsers, handleInputChange, startTyping, stopTyping } = useTyping(
    undefined,
    selectedChat?.id
  )

  // Fetch direct chats
  useEffect(() => {
    async function fetchDirectChats() {
      if (!session) return
      try {
        const response = await fetch('/api/direct-chats')
        if (response.ok) {
          const data = await response.json()
          setDirectChats(data)
          if (data.length > 0 && !selectedChat) {
            setSelectedChat(data[0])
          }
        }
      } catch (error) {
        console.error('Error fetching direct chats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDirectChats()
  }, [session, selectedChat])

  // Fetch users for new chat
  useEffect(() => {
    async function fetchUsers() {
      if (!session) return
      try {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data.filter((user: User) => user.id !== session.user?.id))
        }
      } catch (error) {
        console.error('Error fetching users for new chat:', error)
      }
    }
    if (showNewChat) {
      fetchUsers()
    }
  }, [showNewChat, session])

  const handleSendMessage = async (messageData: any) => {
    if (!selectedChat) return
    await sendMessage(messageData)
  }

  const handleVotePoll = async (pollId: string, optionId: string) => {
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId })
      })

      if (response.ok) {
        // Messages will be updated via real-time
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
        // Messages will be updated via real-time
      }
    } catch (error) {
      console.error('Error responding to event:', error)
    }
  }

  const startNewChat = async (userId: string) => {
    if (!session?.user?.id) return
    try {
      const response = await fetch('/api/direct-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        const newChat = await response.json()
        setDirectChats(prev => [newChat, ...prev])
        setSelectedChat(newChat)
        setShowNewChat(false)
      }
    } catch (error) {
      console.error('Error starting new chat:', error)
    }
  }

  const getOtherUser = (chat: DirectChat) => {
    return chat.user1.id === session?.user?.id ? chat.user2 : chat.user1
  }

  const filteredChats = directChats.filter(chat => {
    const otherUser = getOtherUser(chat)
    return otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser.email.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading direct messages...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Direct Messages</h1>
            <Button onClick={() => setShowNewChat(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => {
              const otherUser = getOtherUser(chat)
              const lastMessage = chat.messages[0]
              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50",
                    selectedChat?.id === chat.id ? "bg-blue-50" : ""
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-base font-semibold flex-shrink-0">
                    {otherUser.avatar ? (
                      <Image src={otherUser.avatar || ''} alt={otherUser.name || 'User'} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      (otherUser.name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{otherUser.name || 'Unknown User'}</p>
                    {lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage.type === 'TEXT' ? lastMessage.content : `[${lastMessage.type}]`}
                      </p>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              )
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              No direct messages yet. Start a new chat!
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b px-6 py-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-base font-semibold">
                  {getOtherUser(selectedChat).avatar ? (
                    <Image src={getOtherUser(selectedChat).avatar || ''} alt={getOtherUser(selectedChat).name || 'User'} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    (getOtherUser(selectedChat).name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{getOtherUser(selectedChat).name || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-600">{getOtherUser(selectedChat).email}</p>
                </div>
                {/* Connection Status */}
                <div className="ml-auto flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    onVotePoll={handleVotePoll}
                    onRespondToEvent={handleRespondToEvent}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Start your conversation with {getOtherUser(selectedChat).name || 'this user'}!
                </div>
              )}
            </div>

            {/* Typing Indicator */}
            <TypingIndicator typingUsers={typingUsers} />

            {/* Message Input */}
            <EnhancedMessageComposer 
              onSendMessage={handleSendMessage}
              directChatId={selectedChat.id}
              onInputChange={handleInputChange}
              onStartTyping={startTyping}
              onStopTyping={stopTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat or start a new one.
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Start New Chat</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowNewChat(false)}>
                  ×
                </Button>
              </div>
              
              {users.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => startNewChat(user.id)}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                        {user.avatar ? (
                          <Image 
                            src={user.avatar || ''} 
                            alt={user.name || 'User'}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          (user.name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading users...</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
