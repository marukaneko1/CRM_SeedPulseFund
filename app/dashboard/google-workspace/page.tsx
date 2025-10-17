"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Mail, 
  FolderOpen, 
  Calendar, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  Presentation,
  Video,
  Search,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Download,
  Upload,
  Eye,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GoogleService {
  id: string
  name: string
  description: string
  icon: any
  connected: boolean
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
}

interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime: string
  webViewLink?: string
}

interface Spreadsheet {
  id: string
  name: string
  modifiedTime: string
  sheets: Array<{ title: string }>
}

interface Contact {
  id: string
  names: Array<{ displayName: string }>
  emailAddresses: Array<{ value: string }>
  organizations?: Array<{ name: string; title: string }>
}

export default function GoogleWorkspacePage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === 'admin@demo.com'

  // Google Workspace connection state
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleProfile, setGoogleProfile] = useState<any>(null)
  const [connecting, setConnecting] = useState(false)

  // Service states
  const [services, setServices] = useState<GoogleService[]>([
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send and receive emails',
      icon: Mail,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'drive',
      name: 'Google Drive',
      description: 'File storage and sharing',
      icon: FolderOpen,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Schedule and manage events',
      icon: Calendar,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      description: 'Spreadsheets and data analysis',
      icon: FileSpreadsheet,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'docs',
      name: 'Google Docs',
      description: 'Document creation and collaboration',
      icon: FileText,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'contacts',
      name: 'Google Contacts',
      description: 'Contact management',
      icon: Users,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'slides',
      name: 'Google Slides',
      description: 'Presentation creation',
      icon: Presentation,
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'meet',
      name: 'Google Meet',
      description: 'Video conferencing',
      icon: Video,
      connected: false,
      status: 'disconnected'
    }
  ])

  // Data states
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)

  // Check Google Workspace connection on load
  useEffect(() => {
    checkGoogleConnection()
    checkGoogleWorkspaceStatus()
  }, [checkGoogleConnection])

  const checkGoogleWorkspaceStatus = async () => {
    try {
      const response = await fetch('/api/google-workspace/status')
      const status = await response.json()
      console.log('Google Workspace Status:', status)
      
      if (!status.configured) {
        console.error('Google Workspace not configured:', status.recommendations)
      }
    } catch (error) {
      console.error('Error checking Google Workspace status:', error)
    }
  }

  const checkGoogleConnection = useCallback(async () => {
    try {
      // Check if user has connected Google Workspace by fetching Gmail data
      const gmailResponse = await fetch('/api/google-workspace/gmail?maxResults=1')
      const gmailData = await gmailResponse.json()
      
      const connected = gmailData.connected === true
      setGoogleConnected(connected)
      
      if (connected && gmailData.profile) {
        setGoogleProfile(gmailData.profile)
        
        // Mark all services as connected
        setServices(prev => prev.map(service => ({
          ...service,
          connected: true,
          status: 'connected',
          lastSync: new Date().toISOString()
        })))
        
        // Load initial data
        loadGoogleData()
      } else if (gmailData.needsReauth) {
        alert('Your Google connection has expired. Please reconnect.')
      }
    } catch (error) {
      console.error('Error checking Google connection:', error)
      setGoogleConnected(false)
    }
  }, [])

  const connectGoogleWorkspace = async () => {
    setConnecting(true)
    try {
      // First test the connection
      const testResponse = await fetch('/api/google-workspace/test')
      const testData = await testResponse.json()
      
      if (!testData.environment.hasClientId || !testData.environment.hasClientSecret) {
        alert('Google Workspace credentials not configured. Please check your environment variables.')
        return
      }
      
      if (!testData.authUrl.generated) {
        alert(`OAuth URL generation failed: ${testData.authUrl.error}`)
        return
      }

      // Get the auth URL
      const response = await fetch('/api/google-workspace/auth-url')
      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        const errorData = await response.json()
        alert(`Failed to connect: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error connecting Google Workspace:', error)
      alert('Failed to connect Google Workspace. Check console for details.')
    } finally {
      setConnecting(false)
    }
  }

  const disconnectGoogleWorkspace = async () => {
    try {
      // Call API to disconnect (clear tokens from database)
      const response = await fetch('/api/google-workspace/disconnect', {
        method: 'POST'
      })
      
      if (response.ok) {
        setGoogleConnected(false)
        setGoogleProfile(null)
        setServices(prev => prev.map(service => ({
          ...service,
          connected: false,
          status: 'disconnected',
          lastSync: undefined
        })))
        setDriveFiles([])
        setSpreadsheets([])
        setContacts([])
        alert('Google Workspace disconnected successfully')
      } else {
        alert('Failed to disconnect Google Workspace')
      }
    } catch (error) {
      console.error('Error disconnecting Google Workspace:', error)
      alert('Error disconnecting Google Workspace')
    }
  }

  const loadGoogleData = async () => {
    setLoading(true)
    try {
      // Load Drive files
      const driveResponse = await fetch('/api/google-workspace/drive-files')
      if (driveResponse.ok) {
        const driveData = await driveResponse.json()
        console.log('Google Drive files loaded:', driveData.totalFiles)
        setDriveFiles(driveData.files || [])
      } else {
        const error = await driveResponse.json()
        console.error('Failed to load Drive files:', error)
      }

      // Load Gmail messages
      const gmailResponse = await fetch('/api/google-workspace/gmail?maxResults=20')
      if (gmailResponse.ok) {
        const gmailData = await gmailResponse.json()
        console.log('Gmail messages loaded:', gmailData.emails?.length)
      } else {
        const error = await gmailResponse.json()
        console.error('Failed to load Gmail:', error)
      }

      // Load Calendar events
      const calendarResponse = await fetch('/api/google-workspace/calendar-events')
      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json()
        console.log('Calendar events loaded:', calendarData.totalEvents)
      } else {
        const error = await calendarResponse.json()
        console.error('Failed to load Calendar:', error)
      }

      // Note: Sheets and Contacts can be added later with similar endpoints
    } catch (error) {
      console.error('Error loading Google data:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncAllServices = async () => {
    setLoading(true)
    try {
      await loadGoogleData()
      // Update service sync times
      setServices(prev => prev.map(service => ({
        ...service,
        lastSync: new Date().toISOString()
      })))
    } catch (error) {
      console.error('Error syncing services:', error)
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (service: GoogleService) => {
    const IconComponent = service.icon
    return <IconComponent className="w-6 h-6" />
  }

  const getStatusBadge = (service: GoogleService) => {
    switch (service.status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>
      default:
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Disconnected</Badge>
    }
  }

  return (
    <div className="p-8 overflow-y-auto max-h-screen max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Google Workspace</h1>
            <p className="text-gray-600">
              Connect and manage your Google Workspace services
            </p>
          </div>
          <div className="flex gap-3">
            {googleConnected ? (
              <>
                <Button onClick={syncAllServices} disabled={loading} variant="outline">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Sync All
                </Button>
                <Button onClick={disconnectGoogleWorkspace} variant="destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={connectGoogleWorkspace} disabled={connecting}>
                {connecting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4 mr-2" />
                )}
                Connect Google Workspace
              </Button>
            )}
          </div>
        </div>
      </div>

      {googleConnected ? (
        <div className="space-y-8">
          {/* Services Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>
                Manage your Google Workspace integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getServiceIcon(service)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.description}</p>
                      <div className="mt-1">
                        {getStatusBadge(service)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Google Drive Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Google Drive Files
              </CardTitle>
              <CardDescription>
                Recent files from your Google Drive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {driveFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          Modified {new Date(file.modifiedTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Google Sheets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Google Sheets
              </CardTitle>
              <CardDescription>
                Your Google Sheets spreadsheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spreadsheets.map((sheet) => (
                  <div key={sheet.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{sheet.name}</h3>
                      <Badge variant="outline">{sheet.sheets.length} sheets</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Modified {new Date(sheet.modifiedTime).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Google Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Google Contacts
              </CardTitle>
              <CardDescription>
                Your Google Contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{contact.names[0]?.displayName}</p>
                        <p className="text-sm text-gray-500">{contact.emailAddresses[0]?.value}</p>
                        {contact.organizations?.[0] && (
                          <p className="text-xs text-gray-400">
                            {contact.organizations[0].title} at {contact.organizations[0].name}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Google Workspace</h2>
            <p className="text-gray-600 mb-6">
              Connect your Google Workspace account to access Gmail, Drive, Calendar, 
              Sheets, Docs, Contacts, Slides, and more directly from your CRM.
            </p>
            <Button onClick={connectGoogleWorkspace} disabled={connecting} size="lg">
              {connecting ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Settings className="w-5 h-5 mr-2" />
              )}
              Connect Google Workspace
            </Button>
            <div className="mt-6 text-sm text-gray-500">
              <p>You&apos;ll be redirected to Google to authorize access to your Workspace services.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
