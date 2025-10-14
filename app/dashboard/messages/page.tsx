"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Hash, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const channels = [
  { id: "1", name: "general", description: "General discussions" },
  { id: "2", name: "deals", description: "Deal discussions" },
  { id: "3", name: "portfolio", description: "Portfolio updates" },
]

const demoMessages = [
  { id: "1", sender: "John Doe", content: "Has anyone reviewed the new pitch deck from Startup X?", time: "10:30 AM", avatar: "JD" },
  { id: "2", sender: "Sarah Smith", content: "Yes, I think it looks promising. The metrics are strong.", time: "10:32 AM", avatar: "SS" },
  { id: "3", sender: "Mike Johnson", content: "Agreed. Should we schedule a call with the founders?", time: "10:35 AM", avatar: "MJ" },
]

export default function MessagesPage() {
  const [selectedChannel, setSelectedChannel] = useState(channels[0])
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(demoMessages)

  const handleSendMessage = () => {
    if (!message.trim()) return
    
    setMessages([...messages, {
      id: Date.now().toString(),
      sender: "You",
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: "YU"
    }])
    setMessage("")
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
                  selectedChannel.id === channel.id
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
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">{selectedChannel.name}</h3>
              <p className="text-sm text-gray-600">{selectedChannel.description}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {msg.avatar}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{msg.sender}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <p className="text-gray-700">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message #${selectedChannel.name}`}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


