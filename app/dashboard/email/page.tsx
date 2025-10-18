"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Mail, Send, Inbox, Archive, Star, RefreshCw, Settings, 
  Search, ChevronLeft, Trash2, Reply, Forward, MoreVertical,
  Paperclip, Download, ExternalLink, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EmailComposeForm } from "@/components/forms/email-compose-form"

export default function EmailPage() {
  const { data: session } = useSession()
  
  // Gmail integration state
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailAddress, setGmailAddress] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [realEmails, setRealEmails] = useState<any[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Only show emails when Gmail is connected - NO DEMO DATA
  const emails = gmailConnected ? realEmails : []
  
  const folders = [
    { id: "inbox", name: "Inbox", icon: Inbox, count: emails.filter(e => !e.read).length },
    { id: "sent", name: "Sent", icon: Send, count: 0 },
    { id: "starred", name: "Starred", icon: Star, count: emails.filter(e => e.starred).length },
    { id: "spam", name: "Spam", icon: Archive, count: 0 },
    { id: "archive", name: "Archive", icon: Archive, count: 0 },
  ]
  
  const [selectedFolder, setSelectedFolder] = useState(folders[0])
  const [showCompose, setShowCompose] = useState(false)
  const [showGmailSetup, setShowGmailSetup] = useState(false)

  const syncGmailEmails = useCallback(async (folder: string = selectedFolder.id, reset: boolean = true) => {
    setSyncing(true)
    try {
      const response = await fetch('/api/email/gmail/sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, pageToken: reset ? null : nextPageToken })
      })
      if (response.ok) {
        const data = await response.json()
        if (reset) {
          setRealEmails(data.emails || [])
        } else {
          setRealEmails(prev => [...prev, ...(data.emails || [])])
        }
        setNextPageToken(data.nextPageToken || null)
      }
    } catch (error) {
      console.error('Error syncing Gmail:', error)
    } finally {
      setSyncing(false)
    }
  }, [selectedFolder.id, nextPageToken])

  const checkGmailConnection = useCallback(async () => {
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
  }, [syncGmailEmails])

  // Auto-sync emails every 60 seconds
  useEffect(() => {
    if (!gmailConnected || !autoSync) return
    
    const interval = setInterval(() => {
      syncGmailEmails()
    }, 60000) // 60 seconds
    
    return () => clearInterval(interval)
  }, [gmailConnected, autoSync, syncGmailEmails])
  
  // Check Gmail connection status on load
  useEffect(() => {
    checkGmailConnection()
  }, [checkGmailConnection])

  const connectGmail = async () => {
    try {
      const response = await fetch('/api/email/gmail/auth-url')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error)
    }
  }

  const disconnectGmail = async () => {
    try {
      const response = await fetch('/api/email/gmail/disconnect', { method: 'POST' })
      if (response.ok) {
        setGmailConnected(false)
        setGmailAddress('')
        setRealEmails([])
        alert('Gmail disconnected successfully')
      }
    } catch (error) {
      console.error('Error disconnecting Gmail:', error)
    }
  }

  const loadMoreEmails = async () => {
    if (!nextPageToken || loadingMore) return
    setLoadingMore(true)
    await syncGmailEmails(selectedFolder.id, false)
    setLoadingMore(false)
  }

  const handleFolderSelect = async (folder: any) => {
    setSelectedFolder(folder)
    setSelectedEmail(null)
    if (gmailConnected) {
      await syncGmailEmails(folder.id)
    }
  }

  const filteredEmails = emails.filter(email => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      email.from?.toLowerCase().includes(query) ||
      email.subject?.toLowerCase().includes(query) ||
      email.preview?.toLowerCase().includes(query)
    )
  })

  const formatEmailDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Folders */}
      <div className="w-64 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <Button 
            onClick={() => setShowCompose(true)} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!gmailConnected}
          >
            <Mail className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto p-2">
          {folders.map((folder) => {
            const Icon = folder.icon
            return (
              <button
                key={folder.id}
                onClick={() => handleFolderSelect(folder)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition-colors",
                  selectedFolder.id === folder.id
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {folder.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Gmail Status */}
        <div className="p-4 border-t">
          {gmailConnected ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="font-medium truncate">{gmailAddress}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncGmailEmails()}
                  disabled={syncing}
                  className="flex-1"
                >
                  <RefreshCw className={cn("w-3 h-3", syncing && "animate-spin")} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGmailSetup(true)}
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={connectGmail} 
              variant="outline"
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Connect Gmail
            </Button>
          )}
        </div>
      </div>

      {/* Middle - Email List */}
      <div className="w-96 bg-white border-r flex flex-col">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {!gmailConnected && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Mail className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect Gmail
              </h3>
              <p className="text-gray-600 mb-4">
                Connect your Gmail account to access and manage your emails.
              </p>
              <Button onClick={connectGmail} className="bg-blue-600 hover:bg-blue-700">
                <Mail className="w-4 h-4 mr-2" />
                Connect Gmail
              </Button>
            </div>
          )}

          {gmailConnected && filteredEmails.length === 0 && !syncing && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Inbox className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No emails found
              </h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try a different search term' : 'Your inbox is empty'}
              </p>
            </div>
          )}

          {syncing && filteredEmails.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}

          {filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={cn(
                "p-4 border-b cursor-pointer transition-colors",
                selectedEmail?.id === email.id ? "bg-blue-50" : "hover:bg-gray-50",
                !email.read && "bg-blue-50/30"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <span className={cn(
                  "font-medium text-gray-900 truncate",
                  !email.read && "font-bold"
                )}>
                  {email.from}
                </span>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                  {formatEmailDate(email.time || email.date)}
                </span>
              </div>
              <h4 className={cn(
                "text-sm text-gray-900 mb-1 truncate",
                !email.read && "font-semibold"
              )}>
                {email.subject}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {email.preview || email.snippet}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {email.starred && (
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                )}
                {email.hasAttachment && (
                  <Paperclip className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>
          ))}

          {/* Load More */}
          {nextPageToken && filteredEmails.length > 0 && (
            <div className="p-4">
              <Button
                onClick={loadMoreEmails}
                disabled={loadingMore}
                variant="outline"
                className="w-full"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right - Email Detail */}
      <div className="flex-1 bg-white flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEmail(null)}
                  className="mr-4"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    <Forward className="w-4 h-4 mr-2" />
                    Forward
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedEmail.subject}
              </h1>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedEmail.from?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedEmail.from}</p>
                      <p className="text-sm text-gray-600">
                        to {selectedEmail.to || 'me'}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(selectedEmail.time || selectedEmail.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: selectedEmail.body || selectedEmail.preview || selectedEmail.snippet || 'No content available'
                }}
              />

              {/* Attachments */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Attachments ({selectedEmail.attachments.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEmail.attachments.map((attachment: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <Paperclip className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Reply */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Click reply to respond..."
                  className="flex-1"
                  disabled
                />
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select an email
              </h3>
              <p className="text-gray-600">
                Choose an email from the list to view its contents
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gmail Setup Modal */}
      {showGmailSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Gmail Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGmailSetup(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
          </div>
        </div>
      )}

      {/* Email Compose Modal */}
      {showCompose && (
        <EmailComposeForm
          onClose={() => setShowCompose(false)}
          onSuccess={() => {
            setShowCompose(false)
            syncGmailEmails()
          }}
        />
      )}
    </div>
  )
}

