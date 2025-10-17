"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react'

export default function TestGoogleWorkspacePage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [authUrl, setAuthUrl] = useState<string>('')

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/google-workspace/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setLoading(false)
    }
  }

  const testAuthUrl = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/google-workspace/auth-url')
      if (response.ok) {
        const data = await response.json()
        setAuthUrl(data.url)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error testing auth URL:', error)
      alert('Error testing auth URL')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Google Workspace Integration Test</h1>
        <p className="text-gray-600">
          Test your Google Workspace integration with the new credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Check */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>
              Check if Google Workspace is properly configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={checkStatus} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Check Status
              </Button>
              
              {status && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {status.configured ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={status.configured ? 'text-green-700' : 'text-red-700'}>
                      {status.configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><strong>Client ID:</strong> {status.environment?.hasClientId ? '✅ Set' : '❌ Missing'}</p>
                    <p><strong>Client Secret:</strong> {status.environment?.hasClientSecret ? '✅ Set' : '❌ Missing'}</p>
                    <p><strong>OAuth URL:</strong> {status.authUrl?.generated ? '✅ Generated' : '❌ Failed'}</p>
                  </div>
                  
                  {status.recommendations && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Recommendations:</h4>
                      <ul className="text-sm space-y-1">
                        {status.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Auth URL Test */}
        <Card>
          <CardHeader>
            <CardTitle>OAuth URL Test</CardTitle>
            <CardDescription>
              Test OAuth URL generation (requires authentication)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testAuthUrl} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Test OAuth URL
              </Button>
              
              {authUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-green-700">✅ OAuth URL generated successfully!</p>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 break-all">
                      {authUrl.substring(0, 100)}...
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.open(authUrl, '_blank')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test OAuth Flow
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Complete the Google Cloud Console setup to enable the integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Enable APIs in Google Cloud Console</h4>
              <p className="text-sm text-gray-600 mb-2">
                Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a> and enable:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Gmail API</li>
                <li>• Google Drive API</li>
                <li>• Google Sheets API</li>
                <li>• Google Calendar API</li>
                <li>• Google Docs API</li>
                <li>• Google People API</li>
                <li>• Google Slides API</li>
                <li>• Google Meet API</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Configure OAuth Consent Screen</h4>
              <p className="text-sm text-gray-600">
                Set up the OAuth consent screen with all required scopes for Gmail, Drive, Calendar, etc.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Add Redirect URIs</h4>
              <p className="text-sm text-gray-600">
                Add these redirect URIs to your OAuth credentials:
              </p>
              <div className="bg-gray-100 p-3 rounded-lg mt-2">
                <p className="text-xs font-mono">http://localhost:3000/api/google-workspace/callback</p>
                <p className="text-xs font-mono">http://localhost:3000/api/email/gmail/callback</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
