"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MessageComposer } from '@/components/messaging/message-composer'
import { MessageItem } from '@/components/messaging/message-item'
import { cn } from '@/lib/utils'
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Users,
  ArrowLeft,
  Phone,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface DirectChat {
  id: string
  user1: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  user2: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  messages: Array<{
    id: string
    content?: string
    type: string
    sender: {
      id: string
      name: string
      avatar?: string
    }
    attachments?: any[]
    poll?: any
    event?: any
    createdAt: string
  }>
  updatedAt: string
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export default function DirectMessagesPage() {
  const { data: session } = useSession()
  const [directChats, setDirectChats] = useState<DirectChat[]>([])
  const [selectedChat, setSelectedChat] = useState<DirectChat | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch direct chats
  useEffect(() => {
    const fetchDirectChats = async () => {
      try {
        const response = await fetch('/api/direct-chats')
        if (response.ok) {
          const data = await response.json()
          setDirectChats(data)
        }
      } catch (error) {
        console.error('Error fetching direct chats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchDirectChats()
    }
  }, [session])

  // Fetch users for new chat
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data.filter((user: User) => user.id !== session?.user?.id))
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    if (showNewChat) {
      fetchUsers()
    }
  }, [showNewChat, session])

  // Fetch messages for selected chat with auto-refresh
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) {
        setMessages([])
        return
      }

      try {
        const response = await fetch(`/api/direct-chats/${selectedChat.id}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
    
    // Poll for new messages every 2 seconds for live updates
    const interval = setInterval(fetchMessages, 2000)
    
    return () => clearInterval(interval)
  }, [selectedChat])

  // Auto-scroll to bottom when messages change (for both sender and receiver)
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    
    return () => clearTimeout(timer)
  }, [messages])

  // Handle typing indicator
  const handleTyping = (value: string) => {
    if (value.trim().length > 0) {
      setIsTyping(true)
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, 2000)
    } else {
      setIsTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const handleSendMessage = async (messageData: any) => {
    if (!selectedChat) return

    try {
      console.log('Sending message:', messageData)
      
      // Stop typing indicator
      setIsTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      const response = await fetch(`/api/direct-chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const newMessage = await response.json()
        console.log('Message sent successfully:', newMessage)
        
        // Immediately update messages list
        setMessages(prev => [...prev, newMessage])
        
        // Scroll to bottom after sending
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
        
        // Update chat list
        setDirectChats(prev => 
          prev.map(chat => 
            chat.id === selectedChat.id 
              ? { ...chat, updatedAt: new Date().toISOString() }
              : chat
          )
        )
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
        const messagesResponse = await fetch(`/api/direct-chats/${selectedChat?.id}/messages`)
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
        const messagesResponse = await fetch(`/api/direct-chats/${selectedChat?.id}/messages`)
        if (messagesResponse.ok) {
          const updatedMessages = await messagesResponse.json()
          setMessages(updatedMessages)
        }
      }
    } catch (error) {
      console.error('Error responding to event:', error)
    }
  }

  const startNewChat = async (userId: string) => {
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
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        isSidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
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
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredChats.map((chat) => {
                const otherUser = getOtherUser(chat)
                const lastMessage = chat.messages[0]
                
                return (
                  <Card
                    key={chat.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                        {otherUser.avatar ? (
                          <Image 
                            src={otherUser.avatar || ''} 
                            alt={otherUser.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          otherUser.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{otherUser.name}</h3>
                        {lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {lastMessage.type === 'TEXT' ? lastMessage.content :
                             lastMessage.type === 'VOICE' ? 'Voice message' :
                             lastMessage.type === 'POLL' ? 'Poll' :
                             lastMessage.type === 'EVENT' ? 'Event' :
                             'File attachment'}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new chat to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Toggle Sidebar Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="flex items-center gap-2"
                  >
                    {isSidebarOpen ? (
                      <ChevronLeft className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <span className="text-sm">{isSidebarOpen ? 'Hide' : 'Show'} Chats</span>
                  </Button>

                  {/* User Info */}
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {getOtherUser(selectedChat).avatar ? (
                      <Image 
                        src={getOtherUser(selectedChat).avatar || ''} 
                        alt={getOtherUser(selectedChat).name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      getOtherUser(selectedChat).name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{getOtherUser(selectedChat).name}</h2>
                    <p className="text-sm text-gray-500">{getOtherUser(selectedChat).email}</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
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
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation below</p>
                  </div>
                </div>
              )}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>You are typing...</span>
                </div>
              )}
            </div>

            {/* Message Composer */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              directChatId={selectedChat.id}
              onInputChange={handleTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold">Select a conversation</p>
              <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
            </div>
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
                            alt={user.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
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
