"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Send, Inbox, Archive, Star, Plus, RefreshCw, Settings, AtSign } from "lucide-react"
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
  
  // Gmail integration state
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailAddress, setGmailAddress] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [realEmails, setRealEmails] = useState<any[]>([])
  
  const emails = gmailConnected ? realEmails : (isAdmin ? demoEmails : [])
  
  const folders = [
    { id: "inbox", name: "Inbox", icon: Inbox, count: emails.filter(e => !e.read).length },
    { id: "sent", name: "Sent", icon: Send, count: 0 },
    { id: "starred", name: "Starred", icon: Star, count: emails.filter(e => e.starred).length },
    { id: "archive", name: "Archive", icon: Archive, count: 0 },
  ]
  
  const [selectedFolder, setSelectedFolder] = useState(folders[0])
  const [showCompose, setShowCompose] = useState(false)
  const [showGmailSetup, setShowGmailSetup] = useState(false)

  // Auto-sync emails every 60 seconds
  useEffect(() => {
    if (!gmailConnected || !autoSync) return
    
    const interval = setInterval(() => {
      syncGmailEmails()
    }, 60000) // 60 seconds
    
    return () => clearInterval(interval)
  }, [gmailConnected, autoSync])
  
  // Check Gmail connection status on load
  useEffect(() => {
    checkGmailConnection()
  }, [])
  
  const checkGmailConnection = async () => {
    try {
      const response = await fetch('/api/email/gmail/status')
      if (response.ok) {
        const data = await response.json()
        setGmailConnected(data.connected)
        setGmailAddress(data.email || '')
        if (data.connected) {
          syncGmailEmails()
        }
      }
    } catch (error) {
      console.error('Error checking Gmail status:', error)
    }
  }
  
  const connectGmail = async () => {
    try {
      // Redirect to Gmail OAuth
      const response = await fetch('/api/email/gmail/auth-url')
      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error)
      alert('Failed to connect Gmail. Check console for details.')
    }
  }
  
  const disconnectGmail = async () => {
    try {
      const response = await fetch('/api/email/gmail/disconnect', { method: 'POST' })
      if (response.ok) {
        setGmailConnected(false)
        setGmailAddress('')
        setRealEmails([])
        alert('Gmail disconnected')
      }
    } catch (error) {
      console.error('Error disconnecting Gmail:', error)
    }
  }
  
  const syncGmailEmails = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/email/gmail/sync', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setRealEmails(data.emails || [])
        
        // Show notification if new unread emails
        const newUnread = data.emails?.filter((e: any) => !e.read).length || 0
        if (newUnread > 0) {
          showEmailNotification(newUnread)
        }
      }
    } catch (error) {
      console.error('Error syncing Gmail:', error)
    } finally {
      setSyncing(false)
    }
  }
  
  const showEmailNotification = (count: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Emails', {
        body: `You have ${count} new unread email${count > 1 ? 's' : ''}`,
        icon: '/favicon.ico'
      })
    }
  }
  
  // Request notification permission
  useEffect(() => {
    if (gmailConnected && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [gmailConnected])

  const handleEmailSent = () => {
    // Called when email is sent successfully
    syncGmailEmails() // Refresh to show sent email
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

        <div className="p-4 border-t space-y-4">
          {/* Gmail Connection Status */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Gmail Account
            </h3>
            {gmailConnected ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-green-700">Connected</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate" title={gmailAddress}>
                    {gmailAddress}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={syncGmailEmails}
                    disabled={syncing}
                    className="flex-1"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowGmailSetup(true)}
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="rounded"
                  />
                  Auto-sync (60s)
                </label>
              </div>
            ) : (
              <Button 
                onClick={connectGmail}
                size="sm"
                className="w-full"
              >
                <AtSign className="w-4 h-4 mr-2" />
                Connect Gmail
              </Button>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2">Email Campaigns</h3>
            <Button variant="outline" size="sm" className="w-full">
              Create Campaign
            </Button>
          </div>
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

      {/* Email Content */}
      <div className="flex-1 bg-white">
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <Mail className="w-16 h-16 mx-auto mb-4" />
            <p className="mb-4">Select an email to read</p>
            {!gmailConnected && (
              <div className="max-w-md mx-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                  <p className="font-semibold mb-2">Connect your Gmail to get started</p>
                  <p>Send and receive emails directly through the CRM. Click "Connect Gmail" in the sidebar.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gmail Settings Modal */}
      {showGmailSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowGmailSetup(false)}>
          <div className="bg-white rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Gmail Settings</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Connected Account</h3>
                <div className="px-3 py-2 bg-gray-50 rounded border">
                  <p className="text-sm font-medium">{gmailAddress}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="text-sm font-semibold">Auto-sync</h3>
                  <p className="text-xs text-gray-600">Check for new emails every 60 seconds</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="border-t pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    disconnectGmail()
                    setShowGmailSetup(false)
                  }}
                >
                  Disconnect Gmail
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <Button variant="outline" onClick={() => setShowGmailSetup(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Compose Modal */}
      {showCompose && (
        <EmailComposeForm
          onClose={() => setShowCompose(false)}
          onSuccess={handleEmailSent}
        />
      )}
    </div>
  )
}

