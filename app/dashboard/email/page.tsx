"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Send, Inbox, Archive, Star, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmailComposeForm } from "@/components/forms/email-compose-form"

// Demo emails only for admin
const demoEmails = [
  {
    id: "1",
    from: "john@startupx.com",
    subject: "Re: Investment Proposal",
    preview: "Thank you for considering our proposal. We'd love to discuss...",
    time: "10:30 AM",
    read: false,
  },
  {
    id: "2",
    from: "sarah@innovatelab.io",
    subject: "Q4 Metrics Update",
    preview: "Here are our latest metrics. Revenue is up 45% MoM...",
    time: "Yesterday",
    read: true,
  },
  {
    id: "3",
    from: "mike@techventures.com",
    subject: "LP Update - December",
    preview: "Monthly update on our portfolio performance...",
    time: "2 days ago",
    read: true,
  },
]

export default function EmailPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === 'admin@demo.com'
  
  const emails = isAdmin ? demoEmails : []
  
  const folders = [
    { id: "inbox", name: "Inbox", icon: Inbox, count: isAdmin ? 12 : 0 },
    { id: "sent", name: "Sent", icon: Send, count: 0 },
    { id: "starred", name: "Starred", icon: Star, count: isAdmin ? 3 : 0 },
    { id: "archive", name: "Archive", icon: Archive, count: 0 },
  ]
  
  const [selectedFolder, setSelectedFolder] = useState(folders[0])
  const [showCompose, setShowCompose] = useState(false)

  const handleEmailSent = () => {
    // Refresh email list or show success message
    alert('Email sent successfully!')
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r">
        <div className="p-4">
          <Button className="w-full mb-4" onClick={() => setShowCompose(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
          <div className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors",
                  selectedFolder.id === folder.id
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-2">
                  <folder.icon className="w-4 h-4" />
                  {folder.name}
                </div>
                {folder.count > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white">
                    {folder.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t">
          <h3 className="text-sm font-semibold mb-2">Email Campaigns</h3>
          <Button variant="outline" size="sm" className="w-full">
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Email List */}
      <div className="w-96 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">{selectedFolder.name}</h2>
        </div>
        <div className="divide-y">
          {emails.map((email) => (
            <div
              key={email.id}
              className={cn(
                "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                !email.read && "bg-blue-50"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <span className={cn(
                  "font-medium",
                  !email.read && "font-semibold"
                )}>
                  {email.from}
                </span>
                <span className="text-xs text-gray-500">{email.time}</span>
              </div>
              <h3 className={cn(
                "mb-1",
                !email.read && "font-semibold"
              )}>
                {email.subject}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">{email.preview}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Email Content / Compose */}
      <div className="flex-1 bg-white">
        {showCompose ? (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">New Message</h2>
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
            </div>
            <div className="space-y-4 max-w-3xl">
              <div>
                <Label htmlFor="to">To</Label>
                <Input id="to" placeholder="recipient@example.com" />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Email subject" />
              </div>
              <div>
                <Label htmlFor="body">Message</Label>
                <textarea
                  id="body"
                  className="w-full min-h-[300px] p-3 border rounded-md"
                  placeholder="Write your message..."
                />
              </div>
              <div className="flex gap-2">
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
                <Button variant="outline">Save Draft</Button>
                <Button variant="outline">Schedule</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4" />
              <p>Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

